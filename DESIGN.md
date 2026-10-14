# Atithi design plan

This is the brief the UI is built against. Read it before changing any screen.

## 1. The product in one paragraph

Atithi is a booking manager for a small Indian homestay. Rohan owns Amberwood Stays in Lonavala: two units (Main Villa, Garden Cottage) listed on Airbnb, Booking.com, Agoda and MakeMyTrip. Today he opens four apps every morning, and fake MakeMyTrip "pay at property" bookings block his weekends. Atithi puts every booking in one place, blocks the same nights on every platform, and checks pay-at-property guests on WhatsApp before they can hold a weekend for nothing. His caretaker, Ramesh bhai, gets a Hindi view with big buttons.

The prototype runs on sample data with the clock frozen at **Sunday 11 October 2026, 12:40 PM**. Nothing sends a real message.

## 2. Audience and the job of the UI

| Person | Device | What they need in 3 seconds |
|---|---|---|
| Rohan, owner | Phone first, laptop in the evening | "Does anything need me?" Then: who arrives, who leaves, is every platform closed. |
| Ramesh bhai, caretaker | Cheap Android phone, Hindi | Who leaves, who comes, how much cash to collect, what to clean. |

## 3. Direction

**Calm hospitality ledger.** It should feel like a well-kept guest register at a good homestay: warm paper, ink, one blue for actions, one terracotta for "this needs you". Professional and quiet, never techy, never dark.

The user's standing rules (from earlier rounds):

- Very light. Poppins only. At most four colours per palette: paper, ink, one accent, one alert. Greys are the ink at reduced opacity.
- Status is written in words. Colour only adds emphasis, and the alert colour only appears when Rohan must act.
- Platform names are written out (Airbnb, Booking.com, Agoda, MakeMyTrip). No brand colours, no monograms.
- No emoji in the interface, no gradients, no shadows on content, no tinted pill badges, no uppercase letter-spaced labels.
- Minimal is not bare: clear hierarchy, considered surfaces, real detail.

### Spend the boldness in one place: the stay chart

The memorable element is the **stay chart** on Today and Calendar: a hotel-style tape chart where each stay runs from the middle of the check-in day to the middle of the checkout day, so turnover days read at a glance. Weekends are shaded (Lonavala is a weekend town), today has a precise "now" line at 12:40, and status is carried by line style: solid for confirmed, ink for staying now, dashed for not verified, outlined fill for likely fake, hatched for blocked. Everything around it stays quiet.

### Review against generic defaults (what was changed and why)

| Default that crept in | Decision |
|---|---|
| Cream background with a terracotta accent is a known AI-generated look | The user chose this palette ("Paper"), so it stays the default. Terracotta is limited to alerts, the accent is deep blue, and there is no serif display. Two alternative palettes ship in More, Appearance, so the user can compare rendered options. |
| Meta strings joined with middle dots ("A · B · C") everywhere | Meta becomes separate visual items with spacing, or a plain sentence with commas. |
| Identical rounded cards with soft shadows | Radius follows hierarchy (20 sheets, 16 surfaces, 12 inner blocks, 10 controls, 6 bars). Content surfaces have a hairline border and no shadow. Only floating layers (sheets, menus, toasts, tooltips) cast a shadow. |
| Coloured status pills | A **status mark**: a small glyph whose shape matches the calendar bar style, plus the word. |
| Phone column floating in an empty desktop page | Real responsive layout: bottom tabs on phones, a sidebar and two-column pages on laptops. |
| Fade-up animation on every section | One orchestrated moment only (the verification track filling in when a step completes). Other motion answers a tap: sheets, toasts, switches. |

## 4. Tokens

Defined in `app/globals.css`. Use the semantic Tailwind names below; the default Tailwind colour palette is removed on purpose, so `bg-gray-100` or `text-red-600` will not compile to anything.

### Colour

| Token | Paper (default) | Use |
|---|---|---|
| `paper` | `#f8f6f1` | Page background |
| `surface` | `#fffefb` | Grouped surfaces, sheets, inputs |
| `ink` | `#1e1d1a` | Text, staying-now bars, active nav |
| `accent` | `#2e4a6b` | Actions only: primary buttons, links, focus ring, the now line, selected controls |
| `alert` | `#b4573c` | Fills and outlines for things that need Rohan |
| `alert-ink` | darker alert | Alert-coloured **text** (meets 4.5:1) |
| `ink-2` | ink 74% (6.9:1 on paper) | Secondary text |
| `ink-3` | ink 63% (4.8:1 on paper) | Tertiary text: timestamps, captions. Still passes WCAG AA. |
| `line` | ink 9% | Hairlines |
| `line-2` | ink 16% | Control borders, hatch |
| `fill` | ink 5% | Hover, quiet fills, weekend shading |
| `fill-2` | ink 9% | Confirmed bars, pressed state |

Alternative palettes (More, Appearance): **Monsoon** (misty green paper, moss accent) and **Chalk** (neutral white, indigo accent). Same four-colour structure.

### Type (Poppins 400, 500, 600)

| Class | Size / line | Weight | Use |
|---|---|---|---|
| `text-display` | 28/34 (24/30 on phones) | 500 | The Today sentence, booking guest name |
| `text-title` | 22/28 | 500 | Page titles |
| `text-heading` | 17/24 | 500 | Sheet titles, card titles |
| `text-body` | 14/22 | 400 | Default |
| `text-small` | 13/20 | 400 or 500 | Section labels (500), row meta |
| `text-caption` | 12/16 | 400 | Captions, legends |
| `text-micro` | 11/14 | 500 | Calendar day letters, tab labels |

Large standalone numbers use proportional figures. Columns of numbers (tables, amounts in lists, times) use `tabular-nums`.

### Shape, space, depth

- Radius: `rounded-sm` 6 (bars, small marks), `rounded-md` 10 (buttons, inputs), `rounded-lg` 12 (inner blocks), `rounded-xl` 16 (surfaces), `rounded-2xl` 20 (sheets).
- Spacing on a 4px grid. Page gutter 16px on phones, 40px on laptops. Sections 32px apart.
- `shadow-float` only on sheets, menus, tooltips and toasts.
- Icons: lucide, 1.75 stroke, 16–20px, always `aria-hidden` next to text.
- Focus: a 2px accent ring with 2px offset on every interactive element (`:focus-visible`).

## 5. Layout

```
Phone (< 1024px)                       Laptop (>= 1024px)
+---------------------------+          +----------+------------------------------------+
| compact bar on scroll     |          | Atithi   | Sunday, 11 October                  |
| Sunday, 11 October        |          | Amberwood| 2 bookings need you        [Demo][+]|
| 2 bookings need you       |          |          |                                     |
| [attention card]          |          | Today  * | +-----------------------+ +---------+|
| [attention card]          |          | Calendar | | Needs you             | | October ||
| Today: leaves / arrives   |          | Bookings2| | [card] [card]         | | 2x2 stats|
| Stay chart (scrolls x)    |          | Messages1| | Today                 | | Platforms|
| October numbers 2x2       |          | -------- | +-----------------------+ | Next out ||
| Platforms                 |          | Automat. | +-----------------------------------+|
|                           |          | Platforms| | Stay chart, 21 days                ||
+---------------------------+          | Reports  | +-----------------------------------+|
| Today Cal Book Msg More   |          | Rohan    |                                     |
+---------------------------+          +----------+------------------------------------+
```

- Content is left-aligned. Max content width 1180px.
- Phone: sticky compact title bar appears once the large title scrolls away. Bottom tab bar with labels always visible. Sheets slide up from the bottom.
- Laptop: sidebar with Today, Calendar, Bookings, Messages, then Manage (Automations, Platforms, Reports, Payments) and Settings. Sheets become centred dialogs. Messages is a two-pane view. Bookings is a table.

## 6. Components (shared, in `components/ui` and `components/booking`)

| Component | Rules |
|---|---|
| `Button` | `primary` (accent fill), `secondary` (surface with line-2 border), `ghost`, `danger` (alert fill, destructive only), `link`. Sizes `sm` 32, `md` 40, `lg` 48. One primary per card or screen. Labels say exactly what happens ("Resend payment link"). |
| `Surface` | Grouped content: surface fill, hairline border, `rounded-xl`. No shadow. |
| `ListRow` | Leading slot, title, subtitle, trailing meta, optional chevron. Whole row is the target (a Link or a button). |
| `SectionHeader` | 13px/500 title, optional count, optional action link on the right. Not uppercase. |
| `PageHeader` | Kicker line, title, optional description, actions on the right; back link on detail pages. |
| `Segmented` | Filter tabs with counts. Selected item is a surface chip with ink text. |
| `StatusMark` | Glyph + words. Glyph shape mirrors the stay-chart bar. Alert colour only for not verified, guest said yes (advance pending) and likely fake. |
| `SyncSeal` | Four small squares, one per platform, plus "4 of 4 closed". Text always present. |
| `VerificationTrack` | Four steps for pay-at-property bookings: Booked, Asked on WhatsApp, Guest said yes, Advance paid. Shows where the booking is stuck, with times. |
| `StayChart` | The tape chart described above. Bars are links with a full `aria-label`. |
| `Stat` | Label, value (600, proportional figures), one line of context, optional meter. |
| `Avatar` | Initials on a quiet fill. Never coloured. |
| `Sheet` | One global host (`components/sheets/sheet-host.tsx`). Bottom sheet on phones, centred dialog on laptops. Focus trapped, Escape closes, focus returns. |
| Toasts | `sonner`, styled as a paper card with the only content shadow. Title says what happened; second line says what follows. |

## 7. Copy

- Sentence case everywhere. Active voice. Plain words a homestay owner uses.
- Money always as a number: "₹9,800 due at property", "₹2,500 advance unpaid". Indian grouping (₹2,68,400).
- Dates "Sun, 11 Oct", ranges "14–16 Oct". Times "1 PM", "10:33 AM".
- No "→" at the end of links. No middle-dot chains. Ellipsis character "…" for loading and placeholders.
- The caretaker view is Hindi (Devanagari) with `lang="hi"`.

## 8. Quality floor

- Works from 320px to wide desktop with no horizontal page scroll. Safe-area insets on phones.
- Visible keyboard focus, labelled icon buttons, labelled form fields with `autocomplete` and correct `type` or `inputMode`.
- Never colour alone: every status has words, every chart bar has an `aria-label`.
- `prefers-reduced-motion` respected. Only `transform` and `opacity` animate. Never `transition: all`.
- Destructive actions confirm first.
- URL reflects the screen: real routes, and filters in the query string.
