# Weekend Flight Finder

Static site (no build step) that finds the cheapest destinations you can *both* fly to for a weekend.
You: PHL / EWR. Her: YYZ / YTZ. Data: free Travelpayouts (Aviasales) Data API.

## Deploy to GitHub Pages
1. Copy `index.html`, `style.css`, `app.js`, `config.js` into your Pages repo (root, or a subfolder).
2. Commit and push. Open `https://<you>.github.io/<repo>/`.
3. `worker.js` and this README are optional; don't need to be in the repo.

## Config (`config.js`)
- `TOKEN`: your free Travelpayouts token (already filled in).
- `PROXY_URL`: leave empty first. If the app says the browser couldn't reach the API (CORS), deploy `worker.js`
  as a free Cloudflare Worker and paste its URL here.

## How it works
For each weekend in the chosen month it asks the API for the cheapest round-trip fare to every destination from
each of your airports (and from hers), keeps the cheapest per person per destination, and adds them up.
Results are cached in your browser for 12 hours, so repeat searches don't hit the API.
A year-long search is about 4 requests per weekend, so roughly 200 requests.

## Limits to know about
- Prices are **cached fares** from other travelers' recent searches, not live quotes. Some dates/destinations will be
  missing. Confirm with the Google Flights link on each card.
- EWR and YTZ may have thinner data than PHL and YYZ; the app also tries the city codes (NYC, YTO) automatically.
- The token is visible in the page source. If it's ever abused, create a new one in your Travelpayouts dashboard.
- API rate limits exist (hundreds of requests per minute), so "unlimited" means practically unlimited for personal use.
