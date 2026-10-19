# Dr. Thennarasu Multispeciality Clinic — Website

A one-page static website for Dr. Thennarasu Multispeciality Clinic, Uthangarai, Krishnagiri District, Tamil Nadu.

## Structure

- `index.html` — page markup and content
- `css/style.css` — styling (brand colours, layout, responsive breakpoints)
- `js/script.js` — mobile navigation and header scroll state
- `images/` — optimized clinic, doctor and logo photos

## Running locally

No build step is required. Either open `index.html` directly in a browser, or serve it locally:

```
powershell -ExecutionPolicy Bypass -File serve.ps1 -Port 8080
```

Then visit `http://localhost:8080`.

## Before publishing live

- Confirm the clinic's verified Google Maps listing and replace the current text-search map embed with it.
- The header/mobile "WhatsApp Us" button links to `wa.me/918300288788` (the clinic's primary number). Confirm this number is actually WhatsApp-enabled before launch, or swap in the correct one.
- The hero image is still the clinic exterior photo. A transparent multi-generational family PNG was requested but not sourced yet — swap `images/hero-clinic.jpg` and the hero `<img>` in `index.html` once an approved asset is available.
- Re-verify doctor credentials, services and opening hours against the clinic before publishing, per `SEO_AND_LAUNCH_CHECKLIST.md` in the parent design package.
