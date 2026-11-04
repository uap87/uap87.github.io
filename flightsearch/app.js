(() => {
  "use strict";
  const CFG = window.FLIGHT_CONFIG;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // City codes used by the API when an airport code has no data of its own.
  const CITY_FALLBACK = { EWR: "NYC", YYZ: "YTO", YTZ: "YTO" };
  const TORONTO = new Set(["YTO", "YYZ", "YTZ"]);
  const HIS_HOME = new Set(["PHL", "NYC", "EWR", "JFK", "LGA"]);

  const state = { rows: [], weekends: [], wkFilter: null, limit: 60, cities: {} };

  // ---------- helpers ----------
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const money = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: CFG.CURRENCY.toUpperCase(), maximumFractionDigits: 0 }).format(n);
  const fmtDay = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } }
  function flag(cc) {
    if (!cc || cc.length !== 2) return "";
    return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
  }
  function setStatus(msg, kind) {
    const s = $("#status");
    if (!msg) { s.classList.add("hidden"); return; }
    s.textContent = msg;
    s.className = "notice" + (kind === "error" ? " error" : "");
  }

  // ---------- weekends ----------
  function weekendsFor(year, month, depDow, retDow) {
    const out = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const gap = ((retDow - depDow + 7) % 7) || 7;
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      if (d.getDay() === depDow && d >= today) {
        const r = new Date(d); r.setDate(r.getDate() + gap);
        out.push({ dep: iso(d), ret: iso(r), depD: new Date(d), retD: r });
      }
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  // ---------- API ----------
  function apiUrl(path, params) {
    const url = `https://api.travelpayouts.com${path}` + (params ? `?${new URLSearchParams(params)}` : "");
    return CFG.PROXY_URL ? `${CFG.PROXY_URL}?url=${encodeURIComponent(url)}` : url;
  }
  async function getJSON(url) {
    for (let i = 0; i < 4; i++) {
      const res = await fetch(url);
      if (res.status === 429) { await sleep(1500 * (i + 1)); continue; }
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }
    throw new Error("Rate limited (HTTP 429)");
  }

  async function loadCities() {
    const c = lsGet("cities1");
    if (c && Date.now() - c.t < 30 * 864e5) return c.v;
    try {
      const list = await getJSON(apiUrl("/data/en/cities.json"));
      const map = {};
      for (const x of list) map[x.code] = { n: x.name, c: x.country_code };
      lsSet("cities1", { t: Date.now(), v: map });
      return map;
    } catch { return {}; }
  }

  async function queryOrigin(origin, wk, direct) {
    const j = await getJSON(apiUrl("/aviasales/v3/prices_for_dates", {
      origin, departure_at: wk.dep, return_at: wk.ret, one_way: "false", unique: "true",
      sorting: "price", direct: direct ? "true" : "false", currency: CFG.CURRENCY,
      limit: "1000", page: "1", token: CFG.TOKEN
    }));
    if (j.success === false) throw new Error(j.error || "API error");
    return j.data || [];
  }

  async function fetchPrices(origin, wk, direct, skipCache) {
    const key = `pfd2:${origin}:${wk.dep}:${wk.ret}:${direct ? 1 : 0}:${CFG.CURRENCY}`;
    const hit = lsGet(key);
    if (!skipCache && hit && Date.now() - hit.t < CFG.CACHE_HOURS * 36e5) return hit.v;

    let rows = await queryOrigin(origin, wk, direct);
    if (!rows.length && CITY_FALLBACK[origin]) {
      const cityRows = await queryOrigin(CITY_FALLBACK[origin], wk, direct);
      rows = cityRows.filter((r) => !r.origin_airport || r.origin_airport === origin);
    }
    const slim = rows.map((r) => ({
      dest: r.destination,
      destAirport: r.destination_airport || r.destination,
      origin: r.origin_airport || origin,
      price: Number(r.price),
      airline: r.airline || "",
      stops: r.transfers == null && r.return_transfers == null ? null : Math.max(r.transfers || 0, r.return_transfers || 0)
    })).filter((r) => r.dest && r.price > 0);
    lsSet(key, { t: Date.now(), v: slim });
    return slim;
  }

  async function runPool(tasks, n, onDone) {
    let i = 0;
    await Promise.all(Array.from({ length: n }, async () => {
      while (i < tasks.length) { const t = tasks[i++]; await t(); onDone(); }
    }));
  }

  // ---------- search ----------
  async function search(e) {
    e.preventDefault();
    const his = $$(".his:checked").map((x) => x.value);
    const hers = $$(".hers:checked").map((x) => x.value);
    if (!his.length || !hers.length) { setStatus("Pick at least one airport for each of you.", "error"); return; }

    const wks = weekendsFor(+$("#year").value, +$("#month").value, +$("#depDow").value, +$("#retDow").value);
    if (!wks.length) { setStatus("No upcoming weekends match that month and those days. Try another month.", "error"); return; }

    const direct = $("#direct").checked;
    const skipCache = $("#nocache").checked;
    const btn = $("#go");
    btn.disabled = true;
    setStatus("");
    $("#results").replaceChildren();
    $("#filters").classList.add("hidden");
    $("#progressBox").classList.remove("hidden");

    const raw = {}; // dep -> { his: {dest: leg}, hers: {dest: leg} }
    const errors = [];
    let corsLike = 0, done = 0;
    const tasks = [];
    for (const wk of wks) {
      raw[wk.dep] = { his: {}, hers: {} };
      for (const [side, list] of [["his", his], ["hers", hers]]) {
        for (const o of list) {
          tasks.push(async () => {
            try {
              const rows = await fetchPrices(o, wk, direct, skipCache);
              for (const r of rows) {
                const cur = raw[wk.dep][side][r.dest];
                if (!cur || r.price < cur.price) raw[wk.dep][side][r.dest] = r;
              }
            } catch (err) {
              errors.push(`${o} ${wk.dep}: ${err.message}`);
              if (err instanceof TypeError) corsLike++;
            }
          });
        }
      }
    }
    const total = tasks.length;
    const upd = () => {
      done++;
      $("#bar").style.width = `${Math.round((done / total) * 100)}%`;
      $("#progressText").textContent = `Checking fares… ${done} of ${total}`;
    };
    $("#progressText").textContent = `Checking fares… 0 of ${total}`;
    $("#bar").style.width = "0";

    const citiesP = loadCities();
    await runPool(tasks, Math.max(1, CFG.CONCURRENCY | 0), upd);
    state.cities = await citiesP;
    $("#progressBox").classList.add("hidden");
    btn.disabled = false;

    if (errors.length === total) {
      setStatus(corsLike
        ? "Your browser couldn't reach the Travelpayouts API (usually a CORS block). Set PROXY_URL in config.js to your free Cloudflare Worker — see README.md."
        : `Every request failed. First error: ${errors[0]}. Check your token in config.js.`, "error");
      return;
    }

    state.weekends = wks;
    state.wkFilter = null;
    state.rows = combine(raw, wks, $("#homes").checked);
    state.limit = 60;
    $("#filters").classList.remove("hidden");
    buildChips();
    render();

    const notes = [];
    if (errors.length) notes.push(`${errors.length} of ${total} lookups failed and were skipped.`);
    if (!state.rows.length) notes.push("No destinations had cached fares for both of you on those dates. Try Thu/Sat departures, another month, or turn off Nonstop only.");
    notes.push("Prices are cached fares from recent searches (estimates, round trip, per person). Use the Google Flights links to confirm.");
    setStatus(notes.join(" "), errors.length === total ? "error" : "");
  }

  function combine(raw, wks, homes) {
    const rows = [];
    for (const wk of wks) {
      const H = raw[wk.dep].his, R = raw[wk.dep].hers;
      const dests = new Set([...Object.keys(H), ...Object.keys(R)]);
      for (const d of dests) {
        let a = H[d] || null, b = R[d] || null, ok = false;
        if (TORONTO.has(d)) { if (homes && a) { b = null; ok = true; } }
        else if (HIS_HOME.has(d)) { if (homes && b) { a = null; ok = true; } }
        else ok = !!(a && b);
        if (!ok) continue;
        const pa = a ? a.price : 0, pb = b ? b.price : 0;
        rows.push({ dest: d, wk, his: a, hers: b, total: pa + pb, gap: a && b ? Math.abs(pa - pb) : 0 });
      }
    }
    return rows;
  }

  // ---------- rendering ----------
  function buildChips() {
    const box = $("#chips");
    box.replaceChildren();
    const mk = (label, val) => {
      const b = el("button", "chip" + (state.wkFilter === val ? " on" : ""), label);
      b.type = "button";
      b.onclick = () => { state.wkFilter = val; state.limit = 60; buildChips(); render(); };
      box.appendChild(b);
    };
    mk("All weekends", null);
    for (const w of state.weekends) mk(`${fmtDay(w.depD)} – ${fmtDay(w.retD)}`, w.dep);
  }

  function cityLabel(code) {
    const c = state.cities[code];
    return { name: c ? c.n : code, flag: c ? flag(c.c) : "", cc: c ? c.c : "" };
  }

  function gfLink(from, to, wk) {
    const q = `Flights from ${from} to ${to} on ${wk.dep} through ${wk.ret}`;
    return "https://www.google.com/travel/flights?q=" + encodeURIComponent(q);
  }

  function legBlock(title, leg, wk, note) {
    const box = el("div", "leg");
    box.appendChild(el("div", "leg-title", title));
    if (!leg) { box.appendChild(el("div", "muted", note)); return box; }
    box.appendChild(el("div", "leg-price", money(leg.price)));
    box.appendChild(el("div", "leg-route", `${leg.origin} ⇄ ${leg.destAirport}`));
    const stops = leg.stops == null ? "" : leg.stops === 0 ? "Nonstop" : `${leg.stops} stop${leg.stops > 1 ? "s" : ""}`;
    const meta = [leg.airline, stops].filter(Boolean).join(" · ");
    if (meta) box.appendChild(el("div", "leg-meta", meta));
    const a = el("a", "gf", "Check Google Flights ↗");
    a.href = gfLink(leg.origin, leg.destAirport, wk);
    a.target = "_blank"; a.rel = "noopener";
    box.appendChild(a);
    return box;
  }

  function card(r) {
    const c = cityLabel(r.dest);
    const card = el("article", "card");
    const head = el("div", "card-head");
    const left = el("div");
    left.appendChild(el("div", "dest", `${c.flag} ${c.name} (${r.dest})`.trim()));
    left.appendChild(el("div", "when", `${fmtDay(r.wk.depD)} – ${fmtDay(r.wk.retD)}`));
    const right = el("div", "total", money(r.total));
    right.appendChild(el("small", "", "combined"));
    head.append(left, right);
    const legs = el("div", "legs");
    legs.append(
      legBlock("You", r.his, r.wk, "She's visiting you, so only her fare counts"),
      legBlock("Her", r.hers, r.wk, "You're visiting her, so only your fare counts")
    );
    card.append(head, legs);
    if (r.his && r.hers) card.appendChild(el("div", "gap", `Fare gap: ${money(r.gap)}`));
    return card;
  }

  function render() {
    const sort = $("#sort").value;
    const budget = parseFloat($("#budget").value);
    const q = $("#q").value.trim().toLowerCase();
    let rows = state.rows.filter((r) => !state.wkFilter || r.wk.dep === state.wkFilter);
    if (budget > 0) rows = rows.filter((r) => r.total <= budget);
    if (q) {
      rows = rows.filter((r) => {
        const c = cityLabel(r.dest);
        return `${c.name} ${r.dest} ${c.cc}`.toLowerCase().includes(q);
      });
    }
    if ($("#view").value === "best") {
      const best = new Map();
      for (const r of rows) { const b = best.get(r.dest); if (!b || r.total < b.total) best.set(r.dest, r); }
      rows = [...best.values()];
    }
    const cmp = {
      total: (a, b) => a.total - b.total,
      balanced: (a, b) => (a.gap - b.gap) || (a.total - b.total),
      his: (a, b) => ((a.his ? a.his.price : 1e9) - (b.his ? b.his.price : 1e9)) || (a.total - b.total),
      hers: (a, b) => ((a.hers ? a.hers.price : 1e9) - (b.hers ? b.hers.price : 1e9)) || (a.total - b.total)
    }[sort];
    rows.sort(cmp);

    const out = $("#results");
    out.replaceChildren();
    rows.slice(0, state.limit).forEach((r) => out.appendChild(card(r)));
    if (rows.length > state.limit) {
      const more = el("button", "ghost more", `Show more (${rows.length - state.limit} left)`);
      more.type = "button";
      more.onclick = () => { state.limit += 60; render(); };
      out.appendChild(more);
    }
  }

  // ---------- init ----------
  function init() {
    const now = new Date();
    const mSel = $("#month"), ySel = $("#year");
    MONTHS.forEach((m, i) => mSel.appendChild(new Option(m, i)));
    for (let y = now.getFullYear(); y <= now.getFullYear() + 2; y++) ySel.appendChild(new Option(y, y));
    mSel.value = now.getMonth();
    ySel.value = now.getFullYear();
    $("#form").addEventListener("submit", search);
    ["#sort", "#view"].forEach((s) => $(s).addEventListener("change", render));
    ["#budget", "#q"].forEach((s) => $(s).addEventListener("input", () => { state.limit = 60; render(); }));
    if (!CFG || !CFG.TOKEN) setStatus("Add your Travelpayouts token to config.js first.", "error");
  }
  init();
})();
