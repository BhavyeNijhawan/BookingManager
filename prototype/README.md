# Atithi prototype

A working, clickable prototype of the Atithi booking manager. Plain HTML, CSS and JavaScript, no build step. Sample data is fixed to Sunday 11 October 2026, 12:40 PM, so the demo always tells the same story. Nothing here sends a real message.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Put it on Vercel

Option A, from this folder with the Vercel CLI (log in once when it asks):

```
cd prototype
npx vercel --prod
```

Option B, from a Git repo: import the repo in the Vercel dashboard, set **Root Directory** to `prototype`, **Framework Preset** to `Other`, leave the build command empty and the output directory as `.`.

The folder already contains `vercel.json` (clean URLs, no-cache header for the service worker), a web manifest and icons, so the deployed page installs as an app from Chrome on Android ("Add to Home screen") and from Safari on iPhone (Share, then "Add to Home Screen").

## Deep links

Every screen has a stable link you can send, for example `/#calendar`, `/#b-b3` (Rahul Verma's booking), `/#t-t4` (Priya Sharma's chat), `/#v-caretaker` (what the caretaker sees), `/#v-auto-list` (automations), `/#v-reports`.

## Demo script, five minutes

1. **Today.** Two bookings need attention. Both are MakeMyTrip pay-at-property bookings. Tap Rahul Verma: the app already held the dates on every platform and sent the WhatsApp confirmation at 10:33 AM.
2. **Demo** (top right on Today). Tap "Receive the booking": a new MMT booking lands, dates are held everywhere, the guest is asked to confirm. Then either "Guest confirms" and "Guest pays ₹3,000" to watch it become Confirmed, or "24 hours pass, no reply" to see it flagged as likely fake with a one-tap "Cancel and release dates".
3. **Messages.** Open Rahul Verma's chat and tap "Haan, aa rahe hain" to play the guest. The advance link goes out by itself and the booking moves to "Guest said yes".
4. **Calendar.** Both units for two weeks, then the month. Dashed outline means not verified yet, hatched means blocked. Tap a date to see what is open on each platform or to block it. "Add" creates a direct booking that blocks all four platforms.
5. **More, Caretaker view.** What Ramesh bhai sees on his phone, in Hindi: big buttons, three things.
6. **More, Reset sample data** puts everything back.

## Files

| File | What it is |
|---|---|
| `index.html` | Page shell, manifest and font links |
| `styles.css` | The whole design system: four colours, Poppins, rows and hairlines |
| `app.js` | Sample data, screens, actions, hash routing |
| `sw.js` | Service worker, network first with offline fallback |
| `manifest.webmanifest`, `icons/` | PWA install metadata |
| `vercel.json` | Hosting headers |

Personalise the demo by editing the constants at the top of `app.js` (owner, property, caretaker, units) and the sample bookings below them.
