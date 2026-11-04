// ---- Weekend Flight Finder settings ----
window.FLIGHT_CONFIG = {
  // Free Travelpayouts / Aviasales Data API token.
  // (Visible in the page source on GitHub Pages. It's an affiliate/data token, not a payment credential.
  //  If you ever see abuse, just generate a new one in your Travelpayouts dashboard and paste it here.)
  TOKEN: "fb51eb12989f7aeb7a935a945c0ce624",

  // Leave "" to call the API straight from the browser.
  // If the browser blocks the calls (CORS error shown in the app), deploy worker.js
  // as a free Cloudflare Worker and paste its URL here, e.g. "https://flights.yourname.workers.dev"
  PROXY_URL: "",

  CURRENCY: "usd",

  // How many requests run at once (the API allows roughly 600/min on this endpoint).
  CONCURRENCY: 4,

  // How long saved results are reused in your browser (hours). Keeps repeat searches instant.
  CACHE_HOURS: 12
};
