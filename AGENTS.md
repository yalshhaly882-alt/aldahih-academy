# Base44 Dev Environment — Al-Dahih Academy

## What this is
A pure static website (HTML/CSS/JS, no build step). Firebase (Firestore + Auth) is loaded from the gstatic CDN; the Firebase web config is embedded in `firebase-config.js` and is public by design. No backend server, no build system, no package.json.

## Running it
```
docker compose -f docker-compose.base44.yml up -d --build
```
Served by `nginx:alpine` on host port 3000, bind-mounting the repo as the web root. Edits to HTML/CSS/JS appear on browser refresh (no live-reload dev server — call `reload_preview` after changes).

## Files
- `index.html` — student-facing site
- `admin.html` — hidden admin panel (Firebase Auth email/password)
- `app.js` / `admin.js` — ES modules, import Firebase from CDN
- `firebase-config.js` — Firebase config + default content
- `style.css` — styling

## Credentials
None required to boot. The Firebase web API key in `firebase-config.js` is public and safe to commit. Admin access uses Firebase Authentication (email/password) configured in the Firebase console.
