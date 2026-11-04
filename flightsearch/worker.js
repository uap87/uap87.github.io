// OPTIONAL: Cloudflare Worker CORS proxy (free tier). Only needed if the browser blocks direct API calls.
// 1. dash.cloudflare.com -> Workers & Pages -> Create -> Worker -> paste this -> Deploy
// 2. Copy the *.workers.dev URL into PROXY_URL in config.js
// It only forwards requests to api.travelpayouts.com.

const CORS = {
  "Access-Control-Allow-Origin": "*", // tighten to "https://YOURNAME.github.io" if you like
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*"
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const target = new URL(request.url).searchParams.get("url");
    let u;
    try { u = new URL(target); } catch { return new Response("bad url", { status: 400, headers: CORS }); }
    if (u.protocol !== "https:" || u.hostname !== "api.travelpayouts.com") {
      return new Response("forbidden", { status: 403, headers: CORS });
    }

    const upstream = await fetch(u.toString(), {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: 3600, cacheEverything: true }
    });
    const headers = new Headers(upstream.headers);
    for (const k in CORS) headers.set(k, CORS[k]);
    return new Response(upstream.body, { status: upstream.status, headers });
  }
};
