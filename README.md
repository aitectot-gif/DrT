# Dr. Thennarasu Multispeciality Clinic — Website

A one-page static website for Dr. Thennarasu Multispeciality Clinic, Uthangarai, Krishnagiri District, Tamil Nadu.

## Structure

- `index.html` — page markup and content
- `css/style.css` — styling (brand colours, layout, responsive breakpoints)
- `js/script.js` — mobile navigation, header scroll state and the hero image slider
- `images/` — optimized clinic, doctor, logo and hero slider photos

- `api/reviews.js` — Vercel serverless function that returns the clinic's Google reviews

## Google reviews setup

The "Google Client Reviews" section loads from `/api/reviews`, which calls the official Google Places API (New). Until it is configured, the section shows a "temporarily unavailable" message with a link to the Google Maps listing.

1. In Google Cloud Console, create a project with billing enabled and enable **Places API (New)**.
2. Create an API key restricted to **Places API (New)** only. Set a daily quota cap and a billing budget alert.
3. In Vercel → Project → Settings → Environment Variables (Production), add:
   - `GOOGLE_PLACES_API_KEY` — the key above (server-side only; never put it in the HTML/JS)
   - `GOOGLE_PLACE_ID` — the clinic's Place ID (recommended; find it with Google's Place ID Finder). If omitted, the function looks the clinic up by name + address and logs the ID it found.
4. Redeploy, then open `/api/reviews` to confirm it returns `"status":"ok"`.

Google returns at most 5 reviews per place, so the carousel shows up to 5 — not the full review history. Responses are cached at Vercel's edge for 12 hours.

## Running locally

No build step is required. Either open `index.html` directly in a browser, or serve it locally:

```
powershell -ExecutionPolicy Bypass -File serve.ps1 -Port 8080
```

Then visit `http://localhost:8080`.

## Before publishing live

- Confirm the clinic's verified Google Maps listing and replace the current text-search map embed with it.
- The header/mobile "WhatsApp Us" button and the footer WhatsApp icon link to `wa.me/918300288788` (the clinic's primary number). Confirm this number is actually WhatsApp-enabled before launch, or swap in the correct one.
- Re-verify doctor credentials, services and opening hours against the clinic before publishing, per `SEO_AND_LAUNCH_CHECKLIST.md` in the parent design package.
- `images/hero-slide-1.png`, `-2.png` and `-3.png` are sizeable (~0.9–1MB each) since they're transparent PNGs and no lossless/lossy PNG compressor was available in this environment. Running them through a tool like TinyPNG would meaningfully cut load time without visible quality loss.
