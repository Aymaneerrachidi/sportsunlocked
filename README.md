# SportUnlocked

Next.js sports schedule, event discovery, and live match tracking app.

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

## AdSense Preparation

The app includes public pages for About, Contact, Privacy Policy, Terms, Editorial Policy, Guides, a sitemap, robots.txt, and an optional `/ads.txt` route.

Set these environment variables only after Google gives you real values:

```env
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-0000000000000000"
ADSENSE_PUBLISHER_ID="pub-0000000000000000"
NEXT_PUBLIC_CONTACT_EMAIL="contact@example.com"
```

`NEXT_PUBLIC_ADSENSE_CLIENT` loads the AdSense verification/script tag. `ADSENSE_PUBLISHER_ID` powers `/ads.txt`.
