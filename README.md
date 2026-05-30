# IPTV

Next.js sports schedule and watch app backed by Streamed.

## Run

```bash
npm install
npm start
```

## Thumbnails

Event cards use `/api/thumbnail`, which tries Streamed event/team images, generic sport artwork, then a generated SVG fallback. If you add a real TheSportsDB API key, the route can also search event/team/player artwork.

```env
THESPORTSDB_API_KEY=""
```

Leave it empty unless you have a real key. The public test key is intentionally not used for searches because it can return unrelated demo artwork.
