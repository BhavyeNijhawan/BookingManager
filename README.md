# Atithi

A booking manager for a small Indian homestay. Every booking from Airbnb, Booking.com, Agoda and MakeMyTrip in one place, the same nights closed on every platform, and pay-at-property bookings checked with the guest on WhatsApp before they can block a weekend for nothing.

This repository is the **clickable prototype**. It runs on sample data for Amberwood Stays, Lonavala (owner Rohan, caretaker Ramesh bhai, two units). The clock is frozen at **Sunday 11 October 2026, 12:40 PM** so the demo always tells the same story. Nothing sends a real message, call or payment.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New › Project** and import the repository.
3. Keep every default. Vercel detects Next.js; there is no build command, root directory or environment variable to set.
4. Click **Deploy**.

Or from the command line: `npx vercel --prod` (the first run asks you to log in and link a project).

## Run it locally

Needs Node.js 20.9 or newer.

```
npm install
npm run dev
```

Open http://localhost:3000. Narrow the browser to phone width to see the phone layout.

Other scripts: `npm run build` (production build), `npm start` (serve the build), `npm run lint`.

## What to show

| Where | What it shows |
|---|---|
| Today | The two bookings that need Rohan, with where each one is stuck, today's arrivals and departures, the next two weeks for both units, and October's numbers |
| Run the demo (sidebar, or Demo on phones) | A MakeMyTrip pay-at-property booking arriving, the guest confirming on WhatsApp, and the advance being paid. Or 24 hours passing with no reply and the booking being flagged as likely fake |
| Calendar | Both units across the month, and a month grid per unit. Tap any date |
| Bookings | Filters, search and every booking's detail: payment, verification, whether each platform is closed, and what happened |
| Messages | WhatsApp threads. Tap the guest's quick-reply buttons to play the guest |
| More › Appearance | Three palettes to compare on the real screens |
| /caretaker | What Ramesh bhai sees: Hindi, big buttons, three things |

More › Reset sample data puts everything back.

## How it is built

- **Next.js 16** (App Router, React 19, TypeScript), **Tailwind CSS 4**, Radix primitives for dialogs, switches and tooltips, `lucide-react` icons, `sonner` toasts, and a small `zustand` store.
- Sample data and every action (remind, confirm, check in, cancel and release, quick replies, demo steps) live in `lib/`. Pages are thin server components that render client views.
- The design brief, tokens and component rules are in [DESIGN.md](DESIGN.md). Read it before changing a screen.

```
app/                 routes: (app)/ for the owner app, caretaker/ for the Hindi view
components/ui/       buttons, surfaces, fields, sheets, status marks
components/shell/    sidebar, tab bar, page header
components/booking/  stay chart, verification track, attention card
components/<screen>/ screen-specific pieces
lib/                 seed data, store, selectors, formatting, palettes
```

## Not in the prototype

There is no backend, login, channel-manager connection, WhatsApp API or payment gateway yet. The plan for those lives in the planning docs next to this repository (`docs/01-product.md` to `docs/05-roadmap.md`).
