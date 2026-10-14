# Atithi

Atithi is a phone-first web app (PWA) that shows every booking a small homestay gets from Airbnb, MakeMyTrip/Goibibo, Agoda and Booking.com in one place. A booking on any platform blocks the same nights on all the others through a rented channel manager, and pay-at-property bookings from MakeMyTrip are checked with the guest on WhatsApp before they can hold a weekend for nothing. Confirmations, check-in details and the caretaker's daily briefing in Hindi go out automatically, so the owner does not have to open each platform every day.

**Status (11 Oct 2026):** planning. A clickable prototype with sample data exists (Amberwood Stays, Lonavala: owner Rohan, caretaker Ramesh bhai, units Main Villa and Garden Cottage). There is no backend yet. Nothing in the prototype sends a real message.

**Update (14 Oct 2026):** the prototype was rebuilt in Next.js with a new interface in [`atithi-web/`](atithi-web/). That is the version to show and deploy; `prototype/` is the first static version, kept for reference.

## Plan documents

| Doc | What it answers |
|---|---|
| [docs/01-product.md](docs/01-product.md) | The problem, the users, the MakeMyTrip fake-booking story, requirements (MVP, v1, v2) with acceptance criteria, non-goals, open questions for the client |
| [docs/02-ux.md](docs/02-ux.md) | Screens and tabs, status wording, the "Paper" design system, caretaker rules, notifications, PWA install, accessibility |
| [docs/03-architecture.md](docs/03-architecture.md) | System overview, stack, data model, double-booking rule, sync engine, automation engine, security and DPDP, repo layout, testing, costs |
| [docs/04-integrations.md](docs/04-integrations.md) | Each platform in detail, Beds24 setup and the 2-week verification list, email ingestion, WhatsApp, Razorpay, the MakeMyTrip advance question, what we will not do |
| [docs/05-roadmap.md](docs/05-roadmap.md) | Phases with effort, what the client sees after each, monthly running cost, risks, decision points |

Every fact and number in these docs comes from the research reports below and is cited as "(research 01)", "(research 02)" or "(research 03)". Anything marked **verify** has not been confirmed in the host's own accounts or on a primary source.

| Research | Topic |
|---|---|
| [docs/research/01-integrations-landscape.md](docs/research/01-integrations-landscape.md) | OTA APIs, channel managers, MakeMyTrip pay-at-hotel, WhatsApp, payments, email |
| [docs/research/02-ux-patterns.md](docs/research/02-ux-patterns.md) | Competitor teardown, mobile PWA patterns, status design, India context |
| [docs/research/03-architecture-options.md](docs/research/03-architecture-options.md) | Stack options, PWA, data model, sync, automations, security, roadmap, costs |

## Folder map

| Folder | Contents | Edit? |
|---|---|---|
| `docs/` | The five plan documents above | Yes |
| `docs/research/` | Three research reports dated 11 Oct 2026. The source for every plan figure. | No. Add a new report instead. |
| `docs/design/` | `palettes.html` and `palettes-local.html` (the palette options shown to the user; "Paper" was chosen) and `old-prototype/` (the first, superseded pass) | Reference only |
| `atithi-web/` | The current prototype: a Next.js 16 app with the redesigned interface. See [atithi-web/README.md](atithi-web/README.md) and [atithi-web/DESIGN.md](atithi-web/DESIGN.md) | Yes |
| `prototype/` | The first static prototype, superseded by `atithi-web/`: `index.html`, `app.js` (sample data, status machine, automations, demo story), `styles.css` (the Paper palette), `manifest.webmanifest`, `sw.js`, `icons/`, `vercel.json` | Yes |
| `tools/` | `build-artifact.py` bundles the prototype into one HTML file. `make-icons.py` draws the PWA icons (needs Pillow). | Yes |
| `build/` | Generated output: `atithi-artifact.html` | No. Regenerate with `tools/build-artifact.py`. |

## Deploy the app on Vercel

Import this repository in Vercel and set **Root Directory** to `atithi-web`. Vercel then detects Next.js; nothing else needs setting. If the project was imported with the root directory left at `./`, the site shows Vercel's "404: NOT_FOUND" page: open **Settings › Build and Deployment**, set **Root Directory** to `atithi-web` and **Framework Preset** to **Next.js**, save, and redeploy.

To run it locally: `cd atithi-web`, `npm install`, `npm run dev`.

## Run the static prototype locally

Either of these works:

1. Open `prototype/index.html` directly in a browser.
2. Or serve the folder: `npx serve prototype`, then open the address it prints.

Notes:

- The clock is fixed at Sunday 11 October 2026, 12:40 PM, so the demo always tells the same story.
- Tap **Demo** on the Today screen to walk through a MakeMyTrip pay-at-property booking step by step.
- **More › Reset sample data** puts everything back.
- The service worker only registers over `https`, so install-to-home-screen and offline behaviour can only be tested on a deployed copy.
- Narrow the browser to phone width (about 390 px). The layout is capped at 480 px.

## Deploy the static prototype

Option A, from the command line:

```
cd prototype && npx vercel --prod
```

The first run asks you to log in and link a project.

Option B, from the Vercel dashboard: import the repository and set

- **Root Directory:** `prototype`
- **Framework Preset:** Other
- **Build Command:** none (leave empty)
- **Output Directory:** default (the folder itself)

`prototype/vercel.json` turns on clean URLs and sends `sw.js` with `Cache-Control: no-cache` so a new deploy always replaces the old service worker.

Vercel's free Hobby plan is fine for the prototype but is limited to personal, non-commercial use. Production needs Vercel Pro (research 03).

## Other tasks

- Rebuild the single-file version for a claude.ai artifact: `python -I tools/build-artifact.py` (writes `build/atithi-artifact.html`).
- Regenerate the icons: `python -I tools/make-icons.py` (needs Pillow; uses Poppins if it is installed).
