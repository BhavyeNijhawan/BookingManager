# 02 — UX Patterns Research: Unified Booking Manager (mobile-first PWA, India)

**Date:** 11 Oct 2026 · **Role:** Product design / UX research · **Scope:** 1–3 villa/homestay units in India listed on Airbnb, Booking.com, Agoda and MakeMyTrip (MMT), run by a busy owner plus an on-site caretaker who is not comfortable with technology.

**Method and confidence.** Sources: vendor help centers, app-store listings and changelogs, review aggregators (Capterra, G2, GetApp), design guidance (Material, Apple, NN/g, web.dev, WebKit, WCAG, Carbon, GOV.UK) and India-specific material. Limits: Reddit blocks my crawler, so forum sentiment comes via aggregators and app-store reviews. Several help centers (Hostaway, Guesty, Smoobu, Uplisting) returned 403/404, so some details come from search-indexed excerpts. Claims I couldn't verify from a primary source are marked *(secondary)*.

---

## 0. Key findings (TL;DR)

1. **Platforms are converging on a "Today" home.** Airbnb's 2025 host app opens on an urgency-ordered **Today** tab; Booking.com Pulse and MMT Connect lead with today's arrivals and departures. Our home should be a "needs attention → today → next 7 days" feed, not a KPI dashboard.
2. **Calendars use colour for status and logos for channel.** Smoobu puts the channel logo on every bar; Hostaway colours by status (confirmed, inquiry, unpaid, double booking); Lodgify draws tentative bookings dotted. No competitor clearly shows whether a date is blocked on each platform, which is the multi-channel host's main worry.
3. **Small hosts complain about the same things:** overkill complexity (Hostaway, Beds24), mobile apps that are a subset of desktop (Lodgify), slow messaging (Guesty for Hosts, 3.1★), missing pushes (Smoobu), and awkward cleaner logins (Hostaway).
4. **The best automation UIs read as sentences.** Hospitable offers event vs scheduled rules, "prepare but never send", send windows and auto-cancel on manual reply; Tokeet uses trigger → condition → action → template.
5. **No competitor treats pay-at-property verification as a first-class state.** Guesty's "Awaiting payment" and Uplisting's 48-hour pending hold come closest. This is our opening.
6. **India changes the defaults:** WhatsApp for guests and staff, Hinglish for the caretaker, ₹ with lakh grouping, "11 Oct" dates, +91 normalisation, and offline resilience.

---

## 1. Competitive teardown

### 1.1 Product snapshots

| Product | Mobile surface | Home / first screen | Notable patterns | Complaints seen |
|---|---|---|---|---|
| **Hospitable** | iOS/Android + full web | Opens to Dashboard; users ask to choose Inbox/Calendar instead | Mobile inbox: composer pinned at bottom, reservation details one tap from header; rules with event/scheduled timing, "prepare only", send window | Subscription, signup, dynamic pricing web-only; crashes and "web-wrapped" feel *(secondary)* |
| **Hostaway** | iOS/Android, 4.3★ (443) | Added bottom nav "for frequently used tools" | Status colour legend; swipe months; Contact sheet incl. **WhatsApp**; speech-to-text replies | "Overkill" for <10 units; slow loading, mobile friction; housekeeping teams can't share a login |
| **Guesty for Hosts** | iOS/Android, 3.1★ (154) | Unified calendar + inbox | Rich statuses (Inquiry, Reserved, Awaiting payment, Confirmed, Canceled, Declined, Expired, Closed) | "Messaging takes a long time to load", "clunky and annoying" |
| **Lodgify** | iOS/Android | Upcoming bookings + guest contact | Tentative = dotted; closed = black; iCal imports styled differently; filter by source | Unlisted features desktop-only; new-booking push off by default |
| **Smoobu** | iOS/Android | Calendar | Views Multi / Single month / Single year; bar shows channel logo, guest, price | "Mobile app features are basic"; no push for Airbnb/Booking messages |
| **Uplisting** | Web + app | Calendar | Colour = action state: **orange action needed, green no action, red warning**; pending bookings held 48h for payment, then released | n/a |
| **Hostfully** | Service Hub app for providers | Jobs | Tasks auto-created from reservation events; job and calendar views; checklists, photos, completion notifications | n/a |
| **Beds24** | Web-first; housekeeping app | Settings-heavy | Very configurable | Ease-of-use rated poorly; "overkill… more complicated than managing each channel independently" |
| **OwnerRez** | Historically web; users made home-screen shortcuts | Web calendar | Strong financials; "Pending" = unpaid | "Home calendar needs some tweaks on mobile screen"; users asked for a "Tentative" status |
| **iGMS** | iOS/Android; cleaner role sees only **Jobs + Profile** | Inbox | Folders All/Unread/Inquiries/Archived; pin, **snooze 5 min–4 h**; **check-in progress dot**; per-guest automation toggle | Price, support, sync failures (thin evidence) |
| **Hostex** | Web + app; cleaner page | Tasks | Cleaners need not accept an invite; task alerts 3 days and 10 min before checkout; WhatsApp/SMS notifications | n/a |
| **Tokeet** | Web + app | — | *Automata*: event → conditions → action → template; delay "to mimic a human"; paused state | n/a |
| **Your.Rentals** | — | — | No usable public UX material found | — |
| **Airbnb host app** | Tabs: **Today, Calendar, Listings, Messages, Menu** | **Today**: alerts → current/upcoming stays → next steps → tips | Private notes per reservation; quick replies | Airbnb's own goals (pricing nudges) mixed into the host's to-do list |
| **Booking.com Pulse** | Native, 4.6★ (~15K) | Daily overview: arrivals, departures, new bookings, cancellations, reviews | Pre-translated reply templates (43 languages) | "Not user friendly… for vacation home owners"; repeated 2FA |
| **Connect by MMT** (ex-InGo-MMT) | Native, 4.5★ (22) | Onboarding task list; today's check-ins | **Payments** by booking ID (Jan 2026); "How to Reach" as text **or voice note** (Sep 2026); calendar bulk edit | "So buggy, saving info doesn't stick" |
| **Agoda Partner Portal** (ex-YCS) | App + refreshed portal (Aug 2026) | Arrivals/departures, messaging | Status green (confirmed) / red (cancelled); guest email masked; WhatsApp notifications "under consideration" | n/a |

### 1.2 Home / dashboard

- **Order by urgency, not by module.** Airbnb's Today goes: alerts (booking requests) → arriving / leaving / staying / upcoming → next steps → tips. We keep the skeleton and drop the platform-driven upsell blocks.
- **Onboarding as a task list on home** (MMT Connect's new-property home). Use it for "finish connecting your channels".
- **Landing screen.** Hospitable users ask to open on Inbox or Calendar instead of the dashboard; a good Today makes this unnecessary.

### 1.3 Calendar

- **Two views are standard:** multi-unit timeline (rows = units) and single-unit month grid. With 1–3 units the timeline fits a phone with no vertical scrolling, which is an advantage for us.
- **Fill = status; logo = channel.** Hostaway users explicitly asked for unpaid guests to be highlighted, so **payment state belongs on the calendar.**
- **Line style carries uncertainty** (Lodgify's dotted tentative bookings). We adopt dashed = unverified.
- **Sync feedback.** Hostaway shows an orange clock while a day syncs and a green check when done. That's the closest any competitor gets; we extend it to a per-platform view.
- **Gestures:** swipe months (Hostaway); select a range to block or price (iGMS); "Book" button for manual reservations.

### 1.4 Reservation detail

The common order is: **header** (guest, channel, status, dates, unit) → **contact actions** (Hostaway's sheet: message / email / phone / WhatsApp) → **money** (total, paid, due, payment requests) → **scheduled messages** (Hospitable's Activity Log with send/edit/cancel) → **notes** (Airbnb private notes, iGMS team notes) → **tasks**. iGMS flags overdue invoices. When check-in time changes, Hospitable re-times messages and lock codes, so an edit cascades to the automations that depend on it.

### 1.5 Unified inbox

Patterns worth copying: folders **All / Unread / Inquiries / Archived**; **pin**; **snooze** with a visible timer; **mark unread**; **per-conversation automation off switch**; a **status dot** for stay progress (iGMS). On mobile, the composer is fixed at the bottom and reservation details sit one tap away in the header (Hospitable).

Platform reality: OTAs restrict third-party messaging. Hostex notes a guest must message first before an automated message can go out through a third-party channel, and Smoobu doesn't push-notify Airbnb/Booking messages. **For v1, our "Messages" should be WhatsApp-centric** (log + automations + deep links into each OTA's chat), not a full OTA inbox.

### 1.6 Automation / rule builders

- **Hospitable:** *Event* messages (send at event, after a delay, or **prepare but never send**) vs *scheduled* messages (before/after check-in/out up to 270 days, after booking, or weekday-of-stay with "every / first" and include/exclude check-in day). Optional **9 AM–9 PM window**. A **manual reply cancels** a pending event message. Platform limits apply (e.g. Booking.com caps messaging 7 days after checkout).
- **Tokeet Automata:** event → channel/rental filters → **conditions** → action (email, SMS, push, webhook) → template; optional delay; paused state.
- **Hostex:** reservation or check-in-info trigger; late bookings get "catch-up" sends; property time zone.
- **Takeaway:** use a **sentence-style rule card** ("**1 day before** check-in at **10:00 AM**, if **Confirmed**, send **WhatsApp** to **Guest**"), variable chips, live preview against a real booking, "Send test to me", and a per-booking override list.

### 1.7 Tasks for cleaners / caretakers

Auto-create tasks from checkout (Hostfully, Hostex). Give cleaners a stripped-down role (iGMS: Jobs + Profile only). Use job and calendar views, checklists, photo proof, and completion notifications. Avoid Hostaway's problem where housekeeping teams can't share a login; Hostex lets cleaners work without accepting an invite. **Our caretaker should get a link + PIN, not an account.**

### 1.8 Owner reporting

Owner statements (Hostaway, Guesty) target property managers. Our user *is* the owner, so a **monthly summary** is enough: nights sold, occupancy, gross by channel, commission, cash collected by the caretaker. Send it on WhatsApp on the 1st and keep a Reports page under More. MMT Connect's Payments section (payouts by booking ID) shows that settlement tracking matters more than charts.

### 1.9 Praise vs complaints (aggregate)

**Praised:** unified calendar preventing double bookings; automated messaging "saves so much time"; responsive support; financial reports.
**Complained about:** overkill complexity; desktop-only features; slow inboxes; missing or noisy notifications; sync failures; repeated 2FA; confusing payouts; cleaner access friction; buggy saves.

---

## 2. Mobile-first PWA patterns

### 2.1 Navigation
- **Bottom navigation with 3–5 destinations.** Google's Compose guidance: 3–5 equally important destinations on compact screens; labels can drop on inactive items at 5. Apple's HIG gives similar tab-bar guidance (I couldn't fetch the page text; paraphrased): use tabs for sections, not actions, and use badges sparingly. **Recommendation: 5 tabs with labels always visible** (our users benefit from text), or 4 if Messages folds into More.
- Put actions (new booking, block dates) in a **FAB** or an app-bar button, never in a tab.

### 2.2 "Today / needs attention" home
Use an inbox-zero model: attention cards disappear when resolved, and an explicit empty state ("Sab theek hai ✓ Nothing needs you") is a reward. Each card has **one primary action** plus an overflow menu.

### 2.3 Gestures and feedback
- **Swipe:** NN/g finds contextual swipe hard to discover and liable to hide the item. Use it only as an accelerator (swipe a task to "Done", with Undo), and always offer a visible button too.
- **Pull-to-refresh:** Build it yourself in a standalone PWA, using `overscroll-behavior` to stop the browser's bounce/refresh from interfering. Show "Updated 2 min ago" so manual refresh is rarely needed.
- **Loading (NN/g):** nothing under 1 s; spinner for 2–10 s module loads; skeleton for full-page loads; progress bar beyond 10 s.
- **Optimistic UI:** Update instantly and mark the item **pending** until the server confirms. Never show unsynced changes as saved; money and status changes must distinguish pending from confirmed.
- **Offline:** App-bar status (Online / Offline / Syncing), a toast on change, a visible queue, and "3 changes failed · Retry". Background Sync is Chromium-only, so also retry on app focus.
- **Haptics:** `navigator.vibrate` works on Android Chrome but not reliably on iOS. Treat it as an Android-only enhancement for success/error.

### 2.4 Push notifications
- **Permission:** Ask only after a user gesture (web.dev, WebKit), and not on first launch (NN/g). Tell users what they'll get first, e.g. a pre-prompt: "Get an alert when a new booking arrives or a guest needs verification".
- **Content:** Timely, relevant, precise (web.dev). Bundle bursts yourself rather than relying on the OS (NN/g). Let users turn categories off in Settings.
- **iOS:** Web push needs iOS/iPadOS 16.4+ **and** the PWA installed to the Home Screen (`display: standalone`). Inside a regular Safari tab the Push API isn't available. The Badging API lets us show an app-icon count. Some vendors report flaky iOS delivery and EU restrictions *(secondary)*. **Always back critical alerts with a WhatsApp message to the owner.**
- **Tiering (recommended):**

| Tier | Events | Delivery | Quiet hours (default 10 PM–7 AM) |
|---|---|---|---|
| P1 Urgent | Double booking / overlap; platform still open after a booking; guest not arrived 2h after check-in time | Push + WhatsApp to owner, high priority | **Bypass** |
| P2 Action today | New pay-at-property booking to verify; verification deadline near; payment due at check-in today; cancellation | Push | Hold until 7 AM |
| P3 Info | New prepaid booking; guest replied YES; caretaker marked room ready; payment recorded | Push, grouped per booking ("Rahul · 3 updates") | Hold |
| Digest | Morning "Aaj" summary (8 AM); evening "Kal" summary for the caretaker (8 PM) | Push + WhatsApp | Scheduled |

### 2.5 Install prompts
- **Android/Chromium:** Catch `beforeinstallprompt`, suppress the mini-infobar, and offer install in context: after the first successful action (e.g. first channel connected), in the More menu, or as a dismissible in-feed card. Remember dismissals, and don't show install UI before the event fires (web.dev).
- **iOS:** There's no install API, so show our own bottom sheet with the steps (Share → Add to Home Screen) and illustrations. Trigger it when the user enables notifications, since iOS push requires installation. Use the manifest `id` and real icons (otherwise iOS generates a monogram).

---

## 3. Status design

### 3.1 Rules
1. **Status owns colour; channel owns the logo.** Booking bars and cards are tinted by lifecycle status. The channel appears as a monogram badge (Ab, Bk, Ag, MMT, Dir), with its brand tint confined to that small badge. This avoids Airbnb's rose and MMT's red being mistaken for "danger".
2. **Never colour alone** (WCAG 1.4.1). Every status = **colour + icon/shape + text label**. Carbon recommends combining at least three of colour, shape, symbol and text, with ≥3:1 non-text contrast and no more than 5–6 indicator types on screen.
3. **Two independent chips:** *Booking status* and *Payment status*. Verification is a sub-flow of "Needs verification", shown as a mini stepper, not a third chip.
4. **Tags are not buttons** (GOV.UK): use sentence case, light background with dark text, and adjectives ("Confirmed", not "Confirm").
5. **Red is reserved** for conflicts, sync failures and overdue money.

### 3.2 Booking lifecycle

| State | Label (EN / caretaker Hinglish) | Icon / shape | Colour role | Blocks calendar? | Calendar bar style |
|---|---|---|---|---|---|
| Needs verification | "Verify guest" / "Confirm karna hai" | shield-? / triangle | Amber (attention) | **Yes** (protect against double booking) | **Dashed outline**, light fill |
| Confirmed | "Confirmed" / "Pakka" | check-circle | Green | Yes | Solid fill |
| Checked in (staying) | "Staying" / "Ruke hue" | door-in / filled dot | Blue | Yes | Solid fill + "●" |
| Checked out | "Checked out" / "Chale gaye" | door-out | Neutral grey | — | Muted fill |
| Cancelled | "Cancelled" / "Cancel" | x-circle | Neutral grey, struck-through dates | No | Hidden by default ("show cancelled" toggle) |
| No-show | "No-show" / "Nahi aaye" | user-x | Neutral grey + red action dot if a report is pending | No (after marked) | Hatched |
| Suspected fake | "Suspected fake" / "Shak hai" | flag | Red outline | Yes until released | Dashed red outline |
| Owner block | "Blocked" / "Band" | lock | Slate | Yes | Diagonal hatch |
| Conflict | "Double booked" | warning-octagon | **Red** | — | Red outline over both bars + banner |

### 3.3 Payment state (independent chip; ring icon gives a shape cue)

| State | Label | Icon | Colour |
|---|---|---|---|
| Paid on platform | "Paid via Airbnb" | ● full ring with lock | Green outline (money isn't with you; payout pending) |
| Pay at property, pending | "₹12,500 due at check-in" | ○ empty ring + clock | Amber |
| Advance received | "₹3,000 of ₹12,500" | ◐ half ring | Blue |
| Fully paid | "Paid ₹12,500" | ● full ring + check | Green fill |
| Overdue / short | "₹9,500 not collected" | ○ ring + ! | Red |
| Refund due | "Refund ₹2,000" | ↺ | Neutral + red dot |

Always show the **amount**, never just the word. Caretaker cards show only "₹ to collect".

### 3.4 Palette (light / dark tokens; verify with a contrast checker)

**Status tokens** (chip bg / chip text-and-icon):

| Token | Light bg | Light fg | Dark bg | Dark fg |
|---|---|---|---|---|
| `status.attention` (amber) | #FFF4E0 | #8A4B00 | #3A2A10 | #FFC46B |
| `status.success` (green) | #E6F4EA | #146C2E | #11301C | #7FDB9E |
| `status.active` (blue) | #E5EEFF | #1A4FA0 | #142A4D | #9DC1FF |
| `status.neutral` (grey) | #EFF1F4 | #4A5160 | #262A31 | #C2C7D0 |
| `status.danger` (red) | #FDECEC | #A51C1C | #3D1517 | #FF9C9C |

**Channel tokens** (monogram badge only; 2–3 letters keep it legible without colour):

| Channel | Badge text | Light bg / fg | Dark bg / fg |
|---|---|---|---|
| Airbnb | **Ab** | #FDE7EE / #A3123E | #45142A / #FF9EBB |
| Booking.com | **Bk** | #E2EBFA / #003580 | #0F2346 / #93B6FF |
| Agoda | **Ag** | #EEE6FA / #5B2A9E | #2B1B47 / #CDB0FF |
| MakeMyTrip | **MMT** | #FFE9E3 / #B0300F | #44190F / #FFAA91 |
| Direct / walk-in | **Dir** | #E3F3F1 / #0F5E56 | #12312E / #84D9CF |

The badge uses text on a tint (≥4.5:1). In dark mode, avoid pure-black surfaces (#121417 base, #1B1E23 cards) and use lighter, desaturated foregrounds. Charts in Reports can use the channel hues; the operational UI uses them only in badges and filter chips.

### 3.5 "Which platforms are blocked for this date?"

This is our differentiator. Show it at three levels of detail:
1. **Calendar cell / timeline footer:** a count with an icon, e.g. `✓ 4/4` (all blocked) or `⚠ 3/4` (one still open). A count is better than coloured dots, which would rely on colour alone.
2. **Day bottom sheet** (tap a date): one row per platform:
   `Airbnb  ✓ Blocked · synced 2 min ago` / `Agoda  ✕ Still open · Block now ›` / `MMT  ⏳ Updating…` / `Booking.com  — source of this booking`.
3. **Booking detail:** a "Blocked on platforms" strip with the same rows, plus "last checked" time.

The "Block now" fallback deep-links into the platform's partner app/extranet when automatic sync fails.

---

## 4. India-specific context

### 4.1 Caretaker microcopy (Hinglish default, Devanagari toggle, English toggle)

Google's India localisation research reports that 98% of Indian internet users use an Indian language exclusively or alongside English. Google Pay shipped Hinglish UI for casual contexts. Roman-script Hinglish matches how caretakers already type on WhatsApp. Offer हिंदी (Devanagari) as a toggle, and keep numbers and ₹ in Western digits.

| Purpose | Hinglish (Roman) | Devanagari |
|---|---|---|
| Today's work | Aaj ka kaam | आज का काम |
| Arriving today | Aaj aane wale mehmaan | आज आने वाले मेहमान |
| Leaving today | Aaj jaane wale | आज जाने वाले |
| Clean room | Kamra saaf karna hai | कमरा साफ़ करना है |
| Room ready (button) | Kamra taiyaar ✓ | कमरा तैयार ✓ |
| Guest arrived (button) | Mehmaan aa gaye ✓ | मेहमान आ गए ✓ |
| Collect payment | ₹9,500 lena hai | ₹9,500 लेना है |
| Payment method | Cash mila · UPI mila | कैश मिला · UPI मिला |
| ID photo | ID ki photo lein | ID की फोटो लें |
| Guest didn't come | Mehmaan nahi aaye | मेहमान नहीं आए |
| Call owner | Malik ko call karein | मालिक को कॉल करें |
| Done | Ho gaya | हो गया |
| Saved offline | Save ho gaya, net aane par bhej denge | सेव हो गया, नेट आने पर भेज देंगे |

Caretaker UI rules: ≥48 px targets, one decision per card, icons + text, amounts large, voice-note support for owner instructions (borrowed from MMT Connect's "How to Reach" voice notes), and no revenue figures beyond "₹ to collect".

### 4.2 WhatsApp-centric workflows
- **Guest messages via WhatsApp Business Platform.** Since 1 Jul 2025 Meta charges per template message by category (marketing, utility, authentication). **Utility templates are free inside an open 24-hour customer-service window**, and non-template replies are free inside the window. India utility rates are about ₹0.115/message per a third-party rate card for 2026 *(secondary; verify in Business Manager)*. Booking confirmations and reminders are *utility* templates and need Meta pre-approval, so we should ship a pre-approved template library.
- **"Assisted send" fallback (zero-cost, v1-friendly):** Open `wa.me/<number>?text=<prefilled>` from the owner's own WhatsApp. This mirrors Hospitable's "prepare but don't send" mode, needs no template approval, and is good for verification nudges where a personal touch builds trust.
- **Staff and owner alerts on WhatsApp.** Stayflexi sends hotelier daily reports and alerts via WhatsApp, and Hostex sends cleaner notifications via WhatsApp/SMS. Indian owners expect this.
- **Quick-reply buttons** in templates ("Haan, aa rahe hain" / "Date change" / "Cancel") so guest replies can update status automatically.

### 4.3 Pay-at-hotel and no-show reality
- MMT's "Book with No Payment" has the traveller pay ₹1 to authenticate a payment method *(secondary; article not fetchable)*. Goibibo's pay-at-hotel terms bar guests with a prior pay-at-hotel no-show from booking that way again. Neither proves intent to arrive, so **verification UX is justified.**
- For Booking.com pay-at-property bookings, hosts must mark no-shows in the extranet within 48 hours or be billed commission. A guide for Indian hotels calls this the biggest cause of account suspensions *(secondary)*. → Build an automatic "Report no-show on Booking.com by 13 Oct" task.
- **Risk to flag:** Asking an MMT pay-at-hotel guest for an advance may conflict with MMT's partner terms. Make the advance request optional and soft-worded ("to guarantee your villa"), and treat a confirmed WhatsApp reply as sufficient verification. Legal/partnership review needed.

### 4.4 Formats
- **Currency:** `Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0})` → **₹12,500**, **₹1,25,000** (lakh grouping). No paise in the UI. Compact forms only in dense calendar cells: ₹12.5k, ₹1.2L.
- **Dates:** "Sat, 11 Oct"; ranges "14–16 Oct"; cross-month "30 Oct – 2 Nov"; add the year only if it isn't the current year. **Never** use numeric 10/11 (ambiguous). Times in 12-hour format ("2:00 PM"), IST, with relative helpers ("in 3h", "kal").
- **Phones:** Store E.164 (`+919876543210`). Accept pasted forms (`098765 43210`, `+91-98765-43210`, `9876543210`) and validate Indian mobiles as 10 digits starting 6–9. Display as `+91 98765 43210`. Foreign guests (Airbnb/Booking) get libphonenumber parsing plus a country flag. Handle **masked or missing contacts** (Agoda masks guest email) with a "Message via Agoda ›" fallback.

### 4.5 Low bandwidth and low-end devices
Google's Next Billion Users work frames data cost, low-spec phones and patchy 2G/3G as the binding constraints. Recommendations: app shell under ~150 KB gzipped JS; system fonts (plus a subset Noto Sans Devanagari only when Hindi is on); SVG icon sprite; text-first lists with no images in lists; cache Today + the next 30 days of bookings in IndexedDB for offline reading; queue writes; delta sync; "Updated 2 min ago" freshness label; compress ID photos client-side (~200 KB) before upload.

### 4.6 Indian apps worth studying
- **Connect by MMT:** today's check-ins, Payments by booking ID, voice-note directions, onboarding checklist.
- **CO-OYO (OYO partner app):** upcoming/ongoing/completed tabs; guest, payment and **booking source** on one card; one-click check-in.
- **Stayflexi:** WhatsApp toggle for owner reports and alerts.
- **eZee Absolute:** over half its reviews come from India; its mobile app is criticised as limited.
- **Djubo / AxisRooms / Bookingjini:** India channel managers with MMT/Goibibo connectivity and dense, extranet-like UX. What they lack (verification, a caretaker mode) is more instructive than their layouts.

---

## 5. Recommendations

### 5.1 Information architecture

**Owner app — bottom nav (5, labelled):**

1. **Today** — Needs attention → Arriving / Leaving / Staying → Next 7 days → setup checklist (until complete).
2. **Calendar** — Timeline (default; rows = units) ⇄ Month (single unit). FAB: *Block dates / Add booking*.
3. **Bookings** — Segments: *Upcoming · Staying · Past · Cancelled*; search by name/phone/booking ID; filter chips by channel, status, payment.
4. **Messages** — WhatsApp log per booking (sent / delivered / read / replied), scheduled queue, and **Automations** (rules + templates) as a top segment.
5. **More** — Properties & units, Channels & sync health, Caretaker & team, Payments & reports, Notifications & quiet hours, Language, Install app, Help.

**Global:** App bar shows the date, sync freshness ("⟳ 2m") and online state; a bell is unnecessary because Today *is* the notification centre.

**Caretaker mode** (separate link + 4-digit PIN; 2 tabs): **Aaj** (today's ordered checklist) and **Agle din** (next 7 days, read-only). Big buttons, Hinglish/हिंदी/English toggle, "Malik ko call karein" always visible.

**Screen list:** Today · Calendar (timeline, month, day sheet) · Booking detail · Add/Edit booking · Block dates sheet · Record payment sheet · Verification sheet · Conflict resolution · Bookings list · Messages (log, thread, scheduled) · Automations list · Rule editor · Template editor · Channels list · Connect channel wizard · Sync health · Properties/units · Caretaker setup · Reports (monthly) · Settings (notifications, quiet hours, language) · Onboarding (6 steps) · Caretaker Aaj · Caretaker task detail · Install/notification education sheet.

### 5.2 Key user flows

**Flow 1 — New MMT pay-at-hotel booking → verified → confirmed**
1. The booking arrives (API/email/iCal) as **Needs verification**. Dates are **blocked on all other platforms immediately**; the calendar bar is dashed amber.
2. Within a minute, a WhatsApp utility template goes to the guest: "Namaste Rahul, aapki booking Villa A, 14–16 Oct (MakeMyTrip, pay at villa ₹12,500) mil gayi hai. Kya aap aa rahe hain?" with buttons **Haan, aa rahe hain / Date change / Cancel**. In assisted mode, the owner gets a "Send on WhatsApp" card instead.
3. The owner gets a P2 push. The Today card shows a stepper: *Received ✓ → Sent ✓ → Guest replied ○ → Advance (optional) ○*.
4. **Guest taps "Haan"** → status becomes **Confirmed** (solid green bar); the caretaker's list updates. An optional UPI advance moves the payment chip to ◐ "₹3,000 of ₹12,500".
5. **No reply after 12h** → auto-reminder. **No reply 24h before check-in** → escalation: "Call / Mark verified / Suspect fake".
6. **Suspect fake** → red-outlined status; a guided sheet links to Connect by MMT to cancel or report, then offers "Release dates on other platforms" with an undo countdown. The activity log keeps the evidence.

**Flow 2 — Day of check-in**
1. 8 AM digest (push + WhatsApp): "Aaj: 1 arrival (Neha, 2 PM, ₹5,500 to collect), 1 departure (Priya, 11 AM)".
2. 10 AM automation sends the guest the map pin, caretaker number, check-in time and an optional voice note.
3. Caretaker *Aaj*: Priya leaves → **Kamra saaf karna hai** → *Kamra taiyaar ✓* → Neha arrives → *Mehmaan aa gaye ✓* → *₹5,500 lena hai* [Cash mila] [UPI mila] [Kam mila…] → *ID ki photo lein*. Every step works offline and queues.
4. The owner's card updates live: "Room ready 12:40 · Arrived 2:15 · ₹5,500 UPI · Ramesh". Status → **Staying**, payment → **Paid**.
5. Not arrived 2h after check-in time → P1 [Call guest], later [Mark no-show]. For Booking.com this creates "Report no-show by 13 Oct".

**Flow 3 — Double-booking conflict**
1. *Prevention:* after each booking, track blocks per platform. If one is still open after N minutes, send a P1 alert: "Agoda still open for 14–16 Oct · Block now" (deep link, re-check on return).
2. *Detection:* overlapping active bookings raise a P1 push + WhatsApp alert: "⚠ Double booking · Villa A · 14–16 Oct · Airbnb (Priya) + Booking.com (John)".
3. The conflict screen shows both cards side by side (arrival time, amount, payment, channel) with a penalty hint ("Host cancellations on Booking.com can carry charges").
4. **Keep Airbnb** → checklist: message John (pre-written apology) → cancel on Booking.com (deep link) → resolved. The red banner stays until the overlap is gone.

**Flow 4 — Onboarding** (skippable; progress card stays on Today)
1. Phone + WhatsApp OTP → name → language.
2. Property → units (1–3) → check-in/out times → map pin.
3. Connect channels: one card per platform with a guided path (API where possible; otherwise iCal import/export with "Send to my WhatsApp" for desktop-only steps) → "Found 4 upcoming bookings on Airbnb ✓".
4. Optional: connect booking email so we can read pay-at-hotel status and guest phone numbers that iCal lacks.
5. Three recommended WhatsApp rules pre-enabled and previewed → add caretaker (we WhatsApp them a link + PIN) → enable notifications (iOS: Add to Home Screen first).

**Flow 5 — Caretaker daily view**
The caretaker opens the installed link and enters the PIN. *Aaj* is a numbered, time-ordered list: departures, cleaning, arrivals, payments to collect. Each card has one big button, with extras under "Aur". Done cards collapse to "Ho gaya ✓". A footer button reads **📞 Malik ko call karein**. An 8 PM WhatsApp message lists tomorrow's work.

**Flows 6–8 — Block dates / direct booking; cancellation; automations**
- *Block or add:* FAB → range → reason or guest details (+91 phone, amount, advance) → Save → each platform goes ⏳ → ✓; 10 s Undo.
- *Cancellation:* P2 push → grey bar with struck-through dates → dates reopen everywhere → pending WhatsApp messages auto-cancel → "Refund ₹X" task if an advance was taken.
- *Automation:* template gallery → sentence editor → preview with a real booking → "Send test to me" → On. Per booking: "Pause automations for this guest".

### 5.3 Components inventory

- **Navigation:** app bar (date, "⟳ 2m" freshness, online/offline/syncing); bottom nav (5 labelled tabs, badge only on Today); FAB speed-dial (Block dates / Add booking).
- **Cards:** attention card (severity icon, one-line reason, **one primary button**, overflow, dismissed only by resolving); booking card (compact for lists, expanded for Today).
- **Chips and badges:** status chip and payment chip (colour + icon + label, non-interactive); channel monogram badge (Ab/Bk/Ag/MMT/Dir).
- **Timelines:** verification stepper; activity log (messages, status changes, payments, who did what).
- **Calendar:** timeline row with booking bar (solid / dashed = unverified / hatched = block or no-show / red outline = conflict); month cell (date, occupancy, `✓ 4/4`, optional price).
- **Bottom sheets:** day sheet (bookings + per-platform block rows); contact sheet (WhatsApp · Call · Copy · Message on platform); record payment (₹ amount with Full/Advance/Custom chips, Cash/UPI/Card/Bank segmented control); block dates; iOS/Android install and notification education.
- **Automation:** rule card with toggle; sentence-style rule editor with variable chips (`{guest_first_name}`), preview and test send.
- **Feedback:** snackbar with Undo (4–7 s, offline-queued variant); persistent banners (offline, sync failure, conflict); skeletons; empty states ("Sab theek hai ✓").
- **Caretaker:** PIN pad, language toggle, oversized action buttons, persistent "call owner" footer.

### 5.4 Ten UX principles

1. **Today answers "Do I need to do anything?" in 3 seconds.** Attention first, then today, then the week.
2. **Every alert carries its fix.** One primary action per card; no dead-end notifications.
3. **Status owns colour, channel owns the logo, and nothing is colour-only.** Colour + icon + label everywhere.
4. **Money is always a number.** Show "₹9,500 due" or "₹3,000 of ₹12,500", never just "Partially paid".
5. **Make sync visible.** Show freshness timestamps and per-platform block state. Trust comes from transparency, not from a green tick that might be wrong.
6. **Automate by default, keep a human gate where trust matters.** Verification and apology messages default to "prepare + one-tap send"; routine messages send themselves.
7. **Design the caretaker mode for zero training.** Two tabs, one decision per card, ≥48 px targets, Hinglish/हिंदी, icons, voice notes, PIN instead of passwords.
8. **WhatsApp and Call are always one tap away** from any booking.
9. **Work on a bad network.** Offline read, queued writes with visible pending state, small payloads.
10. **Interrupt sparingly.** Tiered pushes, grouping, quiet hours, morning/evening digests; only conflicts and no-shows break through.

### 5.5 ASCII wireframes (≈ 360 px phone)

**A. Today (owner)**
```
┌──────────────────────────────────────┐
│ Sat, 11 Oct           ⟳ 2m  ● Online │
│ Namaste, Arjun                       │
├──────────────────────────────────────┤
│ NEEDS ATTENTION · 2                  │
│ ┌──────────────────────────────────┐ │
│ │ ⚠ Verify guest          [MMT] 1h │ │
│ │ Rahul S · Villa A · 2 guests     │ │
│ │ Tue 14 – Thu 16 Oct              │ │
│ │ ○ ₹12,500 due at villa           │ │
│ │ ✓ Sent ✓  · ○ No reply yet (18h) │ │
│ │ [  WhatsApp Rahul  ]  Call   ⋯   │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ ✕ Agoda still open · Villa A     │ │
│ │ 14–16 Oct not blocked (sync fail)│ │
│ │ [  Block on Agoda  ]   Retry     │ │
│ └──────────────────────────────────┘ │
│ TODAY                                │
│ ↘ ARRIVING · 2:00 PM                 │
│ ┌──────────────────────────────────┐ │
│ │ Neha K  [Bk] · Villa B · 3 guests│ │
│ │ ✓ Confirmed  ◐ ₹4,000 of ₹9,500  │ │
│ │ Room ✓ ready (Ramesh, 12:40)     │ │
│ │ [  Mark arrived  ]          ⋯    │ │
│ └──────────────────────────────────┘ │
│ ↗ LEAVING · 11:00 AM                 │
│   Priya M [Ab] · Villa B · ● Paid    │
│   Cleaning ◷ assigned to Ramesh      │
│ ● STAYING  John D [Dir] · Villa C    │
│ NEXT 7 DAYS  3 arrivals · ₹38,200  › │
├──────────────────────────────────────┤
│ [Today]  Calendar  Bookings  Msgs  ⋯ │
│   ●2                                 │
└──────────────────────────────────────┘
```

**B. Calendar (timeline, 3 units) + day sheet**
```
┌──────────────────────────────────────┐
│ ‹ Oct 2026 ›    [Timeline] [Month]   │
│ All channels ▾   Show cancelled ○    │
├──────────────────────────────────────┤
│         Sa  Su  Mo  Tu  We  Th  Fr   │
│         11  12  13  14  15  16  17   │
│ Villa A ▓▓▓▓▓▓▓▌    ┌╌╌╌╌╌╌╌╌╌╌┐     │
│         Ab Priya ✓  ┆MMT Rahul⚠┆     │
│                     └╌╌╌╌╌╌╌╌╌╌┘     │
│ Villa B ▓▓▓▓▌▐▓▓▓▓▓▓▓▓▓▓▓▌           │
│         Ab ✓ Bk Neha ✓ ◐             │
│ Villa C ████████████▌ ▨▨▨▨▨▨▨▨       │
│         Dir John ●     Owner block   │
│ ──────────────────────────────────── │
│ Sync    ✓   ✓   ✓   ⚠   ⚠   ✓   ✓    │
│         4/4 4/4 4/4 3/4 3/4 4/4 4/4  │
│ ₹/night 6k  6k  5k  5k  5k  5k  7k   │
├──────────────────────────────────────┤
│ Legend: ▓ confirmed  ┆ unverified    │
│ █ staying  ▨ blocked  ◐ part-paid    │
│                              ( + )   │
├──────────────────────────────────────┤
│ ═════ Tue 14 Oct (bottom sheet) ════ │
│ Villa A · Rahul S [MMT] ⚠ Verify     │
│ Blocked on platforms                 │
│  Airbnb      ✓ Blocked · 2 min ago   │
│  Booking.com ✓ Blocked · 2 min ago   │
│  Agoda       ✕ Still open  [Block ›] │
│  MakeMyTrip  ● Source of booking     │
│ [ Open booking ]   [ Block dates ]   │
├──────────────────────────────────────┤
│  Today [Calendar] Bookings  Msgs  ⋯  │
└──────────────────────────────────────┘
```

**C. Booking detail**
```
┌──────────────────────────────────────┐
│ ←  Booking · MMT-48213          ⋯    │
├──────────────────────────────────────┤
│ Rahul Sharma                   [MMT] │
│ ⚠ Needs verification                 │
│ ○ ₹12,500 due at villa               │
│ Villa A · Tue 14 → Thu 16 Oct · 2N   │
│ 2 adults · Check-in 2:00 PM          │
│ +91 98765 43210                      │
│ [ WhatsApp ]  [ Call ]  [ Copy ]     │
├──────────────────────────────────────┤
│ VERIFICATION                         │
│ ✓ Booking received   10 Oct 9:12 PM  │
│ ✓ WhatsApp sent      10 Oct 9:13 PM  │
│ ○ Guest replied      waiting 18h     │
│ ○ Advance (optional) not requested   │
│ Next reminder: today 6:00 PM         │
│ [ Mark verified ]   Suspect fake     │
├──────────────────────────────────────┤
│ PAYMENT                              │
│ Total                       ₹12,500  │
│ Received                         ₹0  │
│ Due at check-in             ₹12,500  │
│ [ + Record payment ]  Send UPI link  │
├──────────────────────────────────────┤
│ BLOCKED ON PLATFORMS          3/4 ⚠  │
│ Ab ✓  Bk ✓  Ag ✕ Block ›  MMT source │
├──────────────────────────────────────┤
│ WHATSAPP MESSAGES                    │
│ ✓✓ Booking received     10 Oct 9:13P │
│ ◷  Reminder             today 6:00P  │
│ ◷  Directions           13 Oct 10:00A│
│ Pause automations for this guest ○   │
├──────────────────────────────────────┤
│ NOTES (owner + caretaker)            │
│ "Late arrival possible" – Arjun      │
│ ACTIVITY LOG                       › │
└──────────────────────────────────────┘
```

**D. Automations (list + rule editor)**
```
┌──────────────────────────────────────┐
│ Messages   [Automations]  Log  Queue │
├──────────────────────────────────────┤
│ ● On  Booking received               │
│       New booking · all channels     │
│       Sent 42 · last 10 Oct          │
│ ● On  Verify pay-at-hotel            │
│       MMT / Bk pay-at-property       │
│       Mode: prepare + 1-tap send     │
│ ● On  Directions                     │
│       1 day before check-in, 10 AM   │
│ ○ Off Checkout reminder              │
│ ● On  Caretaker: kal ka kaam         │
│       Daily 8 PM → Ramesh            │
│                       [ + New rule ] │
├──────────────────────────────────────┤
│ ← Edit: Directions                   │
│ WHEN  [1] [day ▾] [before ▾] check-in│
│ AT    [10:00 AM]   Quiet 10PM–7AM ✓  │
│ IF    Status [Confirmed ▾]           │
│       Channel [All ▾]  Unit [All ▾]  │
│ SEND  [WhatsApp ▾] to [Guest ▾]      │
│ MODE  (•) Auto  ( ) Prepare only     │
│ ┌──────────────────────────────────┐ │
│ │ Namaste {guest_first_name}! Kal  │ │
│ │ {check_in_date} ko check-in      │ │
│ │ {check_in_time} se hai.          │ │
│ │ Location: {map_link}             │ │
│ │ Caretaker: {caretaker_phone}     │ │
│ └──────────────────────────────────┘ │
│ + Variable   Lang: Hinglish ▾        │
│ Preview with: Neha K (Bk) ▾          │
│ [ Send test to me ]   [  Save  ]     │
└──────────────────────────────────────┘
```

### 5.6 Patterns to copy and anti-patterns to avoid (summary)

**Copy:** Airbnb's urgency-ordered Today; Smoobu's channel-logo-on-bar plus Hostaway's status legend (and Lodgify's dotted tentative); Hospitable's event/scheduled rules with "prepare only", send window, and auto-cancel on manual reply; iGMS's cleaner role with minimal tabs and stay-progress dot; Hostaway's Contact sheet with WhatsApp, plus MMT Connect's voice-note directions.

**Avoid:** desktop-only critical features; platform-agenda blocks on the home screen; colour-only statuses and brand-red channel fills; notification floods (or silence, as with Smoobu's missing pushes); cleaner/caretaker accounts with passwords and invitations; extranet-style settings sprawl (Beds24) for a 1–3 unit host.

---

## Sources

**Competitors and OTA apps**
- Hospitable mobile app help — https://help.hospitable.com/en/articles/4600101-hospitable-mobile-app
- Hospitable messaging rule timing — https://help.hospitable.com/en/articles/9707966-messaging-rule-timing
- Hospitable feature request: default landing screen — https://feedback.hospitable.com/p/customize-mobile-app-default-landing-screen
- Hospitable changelog — https://community.hospitable.com/hospitable-changelog-3
- Hospitable App Store listing — https://apps.apple.com/mt/app/hospitable-com/id1475679185
- Hospitable reviews (Capterra) — https://capterra.com/p/189280/smartbnb/reviews/
- Hostaway App Store listing — https://apps.apple.com/app/id1237641501
- Hostaway calendar colour coding — https://support.hostaway.com/hc/en-us/articles/360002573193-Calendar-Overview-and-Reservation-Color-Coding
- Hostaway community: highlight unpaid guests — https://support.hostaway.com/hc/en-us/community/posts/26486339055515-Highlight-unpaid-guests-in-different-colour-on-calendar-view
- Hostaway mobile: contact a guest — https://support.hostaway.com/hc/en-us/articles/48961043681819-Mobile-Reservations-Contact-a-Guest
- Hostaway on Capterra — https://www.capterra.com/p/152433/Hostaway/
- Hostaway app review (Stayfi) — https://stayfi.com/vrm-insider/2025/10/28/hostaway-app-review/
- Guesty for Hosts App Store — https://apps.apple.com/us/app/-/id1032870693
- Guesty multi-calendar help — https://help.guestyforhosts.com/hc/en-gb/articles/9350424230429
- Guesty reservation statuses — https://help.guesty.com/hc/en-gb/articles/9369679396253-Reservation-statuses-Overview
- Lodgify calendar help — https://help.lodgify.com/hc/en-us/articles/360002853414-Understand-your-calendar
- Lodgify mobile app help — https://help.lodgify.com/hc/en-us/articles/360012109633
- Lodgify reviews (Capterra) — https://www.capterra.com/p/131924/Lodgify/reviews/
- Smoobu calendar help — https://support.smoobu.com/hc/en-us/articles/360006559560
- Smoobu notification preferences — https://support.smoobu.com/hc/en-us/articles/360010033260
- Smoobu reviews (Capterra) — https://capterra.com/p/160106/Smoobu/reviews/
- Uplisting colours — https://support.uplisting.io/docs/what-do-the-colours-indicate
- Uplisting pending bookings — https://support.uplisting.io/docs/pending-bookings
- Hostfully task management — https://www.hostfully.com/property-management-software/features/task-management/
- Beds24 reviews (Software Advice) — https://www.softwareadvice.de/reviews/81624/beds24
- Beds24 comparison (HotelTechReport) — https://hoteltechreport.com/nl/compare/beds24-vs-gracesoft-hms
- OwnerRez reviews (GetApp) — https://www.getapp.de/software/103059/ownerrez
- OwnerRez tentative status request — https://www.ownerrez.com/forums/requests/userset-booking-status-classifications
- iGMS mobile app overview — https://help.igms.com/en/articles/9927990-igms-mobile-app-overview-of-the-key-features
- iGMS inbox — https://help.igms.com/en/articles/9927688-how-does-my-igms-inbox-work
- Hostex automated messages — https://hostex.io/help/?p=222
- Hostex cleaning tasks — https://hostex.io/help/?p=260
- Tokeet Automata overview — https://tokeet.com/help/article/automata-overview
- Tokeet create trigger — https://tokeet.com/help/article/create-new-automata-trigger
- Airbnb new hosting tools (2025) — https://www.airbnb.com/resources/hosting-homes/a/new-hosting-tools-to-help-grow-your-business-738?locale=en
- Rental Scale-Up on Airbnb Today tab — https://www.rentalscaleup.com/what-airbnbs-new-today-host-tab-and-price-comparison-tool-with-booking-com-say-the-companys-priorities/
- Booking.com Pulse App Store — https://apps.apple.com/us/app/-/id992795726
- Connect by MakeMyTrip App Store — https://apps.apple.com/us/app/-/id1019426231
- Agoda refreshed Partner Portal (TTG Asia, Aug 2026) — https://www.ttgasia.com/2026/08/18/agoda-launches-refreshed-partner-portal-for-accommodation-partners/
- Agoda booking confirmation help — https://partnerhub.agoda.com/understanding-the-booking-confirmation/
- Smoobu vs channel managers comparison — https://www.smoobu.com/en/comparisons/hospitable-vs-hostaway/
- iCal sync delay and double bookings (Tokeet blog) — https://blog.tokeet.com/prevent-double-bookings/

**Mobile / PWA / accessibility guidance**
- Material 3 navigation bar — https://m3.material.io/components/navigation-bar/guidelines
- Compose NavigationBar API (3–5 items) — https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-navigation-bar.html
- Apple HIG tab bars — https://developer.apple.com/design/human-interface-guidelines/tab-bars
- NN/g skeleton screens — https://www.nngroup.com/articles/skeleton-screens/
- NN/g push notifications — https://www.nngroup.com/articles/push-notification/
- NN/g contextual swipe — https://www.nngroup.com/articles/contextual-swipe/
- web.dev push notifications overview — https://web.dev/articles/push-notifications-overview
- web.dev promote install — https://web.dev/articles/promote-install
- WebKit: Web Push for web apps on iOS/iPadOS — https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- iOS PWA limitations (MagicBell) — https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide
- Pushpad iOS web push requirements — https://pushpad.xyz/blog/ios-special-requirements-for-web-push-notifications
- MDN overscroll-behavior — https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior
- MDN browser-compat issue on vibrate/iOS — https://github.com/mdn/browser-compat-data/issues/29166
- Offline-first UI patterns (VP0) — https://vp0.com/blogs/local-first-offline-ui-templates-react/
- Expensify offline-first patterns — https://www.mintlify.com/Expensify/App/developers/architecture/offline-first
- WCAG 2.2 SC 1.4.1 Use of Color — https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- Carbon status indicator pattern — https://carbondesignsystem.com/patterns/status-indicator-pattern/
- GOV.UK tag component — https://design-system.service.gov.uk/components/tag/

**India context**
- Meta WhatsApp Business Platform pricing — https://developers.facebook.com/docs/whatsapp/pricing
- WhatsApp API pricing in India, 2026 (Monty Mobile) — https://montymobile.com/blogs/whatsapp-business-api-pricing-in-india-inr-rates-gst-and-the-2026-currency-migration-deadline
- MMT "Book with No Payment" (Travel Trends Today) — https://www.traveltrendstoday.in/makemytrip-launches-book-with-no-payment-model-for-hotels
- Goibibo pay-at-hotel offer terms — https://www.goibibo.com/offers/pay-hotel/
- Booking.com for Indian hotels: no-shows, pay-at-property — https://www.onlinehotelier.com/guides/ota/booking-com-hotel-listing-guide.html
- OYO new apps for hotel owners — https://www.traveltrendstoday.in/oyo-introduces-new-apps-for-its-hotel-owners
- CO-OYO app listing (AppFollow) — https://appfollow.io/ios/co-oyo/1424149517?country=in
- Stayflexi support (notifications) — https://support.stayflexi.com/?p=8199
- Djubo (Capterra India) — https://www.capterra.in/reviews/143927/djubo
- eZee Absolute (Capterra India) — https://www.capterra.in/software/135751/ezee-absolute
- eZee Absolute (HotelTechReport) — https://mail.hoteltechreport.com/operations/hotel-management-software/ezee-absolute
- AxisRooms blog: Stayflexi competitors — https://blog.axisrooms.com/stayflexi-competitors/
- Google: App and website localization for Indian users (PDF) — https://thinkwithgoogle.com/_qs/documents/13326/App_and_website_localization_for_Indian_users.pdf
- Hinglish and hybrid languages (Entrepreneur India) — https://india.entrepreneur.com/news-and-trends/the-rise-of-hinglish-tanglish-and-other-hybrid-languages/429187
- Designing for vernacular users (UX Collective) — https://uxdesign.cc/samosa-app-designing-for-vernacular-users-contributed-to-our-day-30-retention-5e8b3ee83a58
- Google for India: products for Next Billion Users — https://blog.google/around-the-globe/google-asia/google-india-making-our-products-work-better-everyone
- Intl.NumberFormat en-IN grouping — https://usefulangle.com/post/283/javascript-format-number-as-currency
