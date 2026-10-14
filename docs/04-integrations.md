# 04 · Integrations

How each outside system connects to Atithi: the four platforms, Beds24, email, WhatsApp and Razorpay. Facts come from research 01 unless another source is named. Items marked **verify** have not been confirmed in the host's own accounts.

## 1. At a glance

No OTA gives a single host's custom app API access. Airbnb partners by invitation, Booking.com has paused new connectivity providers, and Agoda and MakeMyTrip certify only channel-manager companies (research 01, §1). So every platform reaches Atithi through Beds24, with forwarded emails as a backup.

| Platform | Bookings arrive by | Backup | Guest phone | What Atithi can push back | Payment model |
|---|---|---|---|---|---|
| Airbnb | Beds24 (API connection) | Reservation emails | After confirmation, sometimes an Airbnb proxy number that does not work on WhatsApp | Availability through Beds24 | Paid on Airbnb |
| Booking.com | Beds24 | New, modified and cancelled emails | **Not sent to channel managers since 28 Sep 2026.** Extranet and Pulse only. | Availability through Beds24 | Usually prepaid; pay-at-property possible |
| Agoda | Beds24 (API, plus Agoda Homes) | Booking emails | Masked; not released in full | Availability through Beds24 | Prepaid unless Property Collect is switched on |
| MakeMyTrip / Goibibo | Beds24 (Goibibo / InGo-MMT connection, **verify** it covers MakeMyTrip) | Voucher emails | Real, but **only 3 days before check-in** | Availability through Beds24 | Prepaid, Pay at Hotel, or Book with Zero Payment |
| Direct | Entered in Atithi | None | From the guest | Written to Beds24 | Advance link allowed |

## 2. Per platform

### 2.1 Airbnb

- **How bookings arrive:** through Beds24's Airbnb API connection (research 01, §4).
- **Backup:** "Reservation confirmed - {Guest} arrives {date}" emails with confirmation code, dates, guest count and payout, plus request, change and cancellation emails. Their layout is consistent enough that Parsio, Parseur and Zapier ship templates for them. Airbnb offers hosts no webhooks (research 01, §2.1).
- **Missing data:** email is masked behind a relay. The phone number is visible only after confirmation and is removed if the booking is cancelled. Some guests get a temporary Airbnb number that expires 2 days after checkout and **does not work with WhatsApp**.
- **Push back:** availability through Beds24. Messages through Beds24's OTA messaging, if it supports Airbnb (**verify**).
- **Gotchas:**
  - Asking a guest to move off Airbnb before confirmation is against policy. The first message goes through Airbnb chat with a link to share their WhatsApp number (prototype platform note).
  - Never send a payment link (research 01, §6).
  - In iCal fallback only: Airbnb refreshes imported calendars every 3 hours and does not re-export dates blocked by imported calendars, so use one hub feed rather than chaining platforms (research 01, §2.1).

### 2.2 Booking.com

- **How bookings arrive:** through Beds24.
- **Backup:** "new booking", "modified" and "cancelled" emails. Many details are only behind the extranet link, so the parser keys on the reservation number (research 01, §2.2).
- **Missing data:** guest emails are masked aliases (`@guest.booking.com`). **Since 28 Sep 2026 Booking.com no longer sends guest phone numbers to channel managers**, so bookings that come through Beds24 have no phone. The number is visible in the extranet and the Pulse app. Guesty reports that new properties see it only 14 days before check-in (**verify**).
- **Push back:** availability through Beds24.
- **Gotchas:**
  - Once a channel manager is connected, Booking.com's own iCal connections are dropped. It is one or the other (research 01, §2.2).
  - A cancellation or no-show must be marked within about 48 hours or it stays on the commission invoice (research 01, §2.2). Atithi creates a task with the deadline (v1).
  - Never send a payment link.
  - Booking.com limits messaging to 7 days after checkout (research 02, §1.6).
- **Phone workflow:** when a Booking.com booking lands, Atithi creates a "copy the phone number" task with a paste field and a link to Pulse or the extranet (prototype platform note). In parallel, a pre-arrival message through Booking.com's chat asks the guest to share their WhatsApp number (§2.6).

### 2.3 Agoda

- **How bookings arrive:** through Beds24's Agoda API connection (with Agoda Homes). Channel managers get a BookingHint push and then pull the details (research 01, §2.3).
- **Backup:** booking emails to the property.
- **Missing data:** Agoda masks guest email and does not release full contact details, citing PCI and GDPR. Use the masked email or Agoda's messaging.
- **Push back:** availability through Beds24.
- **Payment:** Property Collect (pay at property) and the "no credit card guarantee" variant are opt-in. If they were never switched on, Agoda stays prepaid and there is nothing for Atithi to collect (research 01, §2.3).
- **Gotchas:** in iCal fallback, only room types with exactly 1 unit qualify, and iCal carries availability only, so prices stay in Agoda (research 01, §2.3).

### 2.4 MakeMyTrip and Goibibo

- **One extranet for both brands** (InGo-MMT, now "Connect by MakeMyTrip"). Each booking shows whether it came from MakeMyTrip or Goibibo. One channel-manager connection covers both (**verify** per channel manager) (research 01, §2.4).
- **How bookings arrive:** through Beds24's Goibibo (InGo-MMT) connection, which handles inventory, multiple rates, new bookings, changes and cancellations. It is set up through the Goibibo market manager. MakeMyTrip is not listed separately in Beds24's documentation (**verify** that MakeMyTrip-branded bookings come through) (research 01, §4).
- **Notifications today:** email, SMS and the Connect app, plus WhatsApp alerts for bookings pending confirmation (opt-in). Accounts run in Auto-Confirmation mode or manual confirm/reject mode, and MakeMyTrip discourages rejections.
- **Missing data:** guest name, email and mobile number appear only **3 days before check-in**. Before that, only the in-app Inbox chat (renamed from Chat in Oct 2025), which also supports automated welcome notes.
- **Payment data:** the Payments tab shows check-in date, guest name, booking ID, amount and a payment status, "pending" or "processed" with a bank reference. Prepaid bookings settle 1–2 days after check-in. Commission is reported at about 18–22% (**verify**).
- **Two pay-later products** (research 01, §3):

| | Pay at Hotel (PAH) | Book with Zero Payment |
|---|---|---|
| Guest pays | The property, at check-in | ₹0 or ₹1 at booking; MakeMyTrip charges the card later |
| Who pays the host | The guest | MakeMyTrip, as for a prepaid booking |
| Risk | No-show with nothing paid | Dates held for days or weeks, then the booking may vanish (auto-cancellation of unpaid bookings, **verify**) |
| Host controls | Mark Check-In / No Show in the app; promotions can exclude PAH; BDM may disable it | Short free-cancellation window |

- **Push back:** availability through Beds24.
- **Gotchas:**
  - No public article documents a switch to disable PAH. Ask the BDM (§7).
  - Whether vouchers or emails say "PAH" versus "prepaid" is not documented. Capture the payment-mode line if it exists (**verify** with a real voucher).
  - iCal for MakeMyTrip is undocumented and reported as "limited / inconsistent". Do not rely on it to prevent double bookings (research 01, §2.4).
  - Mark no-shows in the extranet promptly. Goibibo's PAH terms bar guests with a previous PAH no-show from booking PAH again (research 02, §4.3).

### 2.5 Direct bookings

- Entered by Rohan from a WhatsApp or phone enquiry (prototype "Add › Direct booking").
- Atithi checks the nights are free (strict mode, 03-architecture §4.2), writes the block to Beds24, and sends the WhatsApp confirmation with an advance link.
- Direct bookings get the same verification and reminders as MakeMyTrip pay-at-property bookings (prototype platform note).

### 2.6 Guest phone numbers across platforms

| Platform | Guest email | Guest phone |
|---|---|---|
| Airbnb | Masked relay | After confirmation; some are proxy numbers that do not work on WhatsApp |
| Booking.com | Masked alias | Extranet and Pulse only; not sent to channel managers since 28 Sep 2026 |
| Agoda | Masked | Not released in full |
| MakeMyTrip / Goibibo | Real (voucher, extranet) | Real, but visible only 3 days before check-in; Inbox chat before that |

(research 01, §7)

The practical answer is a **pre-arrival link sent through each platform's own messaging**. The link opens a small page where the guest confirms their WhatsApp number and agrees to receive updates, which also gives the opt-in WhatsApp needs (§5.5). Research 01 (§7) says the Beds24 API can send OTA messages; which platforms it covers is a Phase 0 check (**verify**). Where it cannot, Atithi prepares the message and Rohan sends it from a deep link ("assisted send", research 02, §4.2).

Caretaker and owner messages have none of these limits.

## 3. Beds24

### 3.1 Why Beds24

Most global vacation-rental tools (Smoobu, Hostaway, Lodgify, Uplisting, Hospitable) do not connect to MakeMyTrip. Of those that do, Beds24 is the cheap one with a developer API and webhooks. Channex also fits but costs US$130 a month in platform fees alone and is meant for software vendors. Rentals United and the Indian hotel channel managers cost more or have closed APIs (research 01, §4).

| | Beds24 |
|---|---|
| Connections | Airbnb (API and iCal), Booking.com, Agoda (and Agoda Homes), Goibibo / InGo-MMT |
| Developer access | API v2: invite code exchanged for a token; 100 credits per 5 minutes; booking webhooks about 1 minute after the event (new, modified, cancelled, OTA message) |
| Price | From about €15.50 a month plus €0.55 per room-channel link, roughly **€18–25 a month** for 1–3 units |

### 3.2 Setup checklist

1. Rohan opens a Beds24 account and starts the trial. (Trial length and terms: **verify** on the Beds24 site.)
2. Create the property (Amberwood Stays) and its rooms (Main Villa, Garden Cottage), matching the units in Atithi.
3. Connect **Airbnb** through Beds24's API connection.
4. Connect **Booking.com**. Note that Booking.com's own iCal links stop working once a channel manager is connected.
5. Connect **Agoda** through the API connection.
6. Ask the MakeMyTrip market manager to **"connect property to Beds24"** (research 01, §4). At the same meeting, raise the PAH questions in §7.
7. Map each room and rate to each platform. Confirm that the prices and availability shown on each platform match Beds24.
8. Import existing future bookings from every platform and compare them with what Rohan sees in each extranet. Every future booking must appear once.
9. Remove any old iCal links between platforms so there is only one source of availability.
10. Create the API v2 invite code, exchange it for a token, and store the token in Supabase Vault.
11. Point Beds24's booking webhooks at Atithi's per-connection URL (`/api/webhooks/beds24/{connectionId}`).
12. Test a block written through `/inventory/rooms/calendar` for a far-future date, check it closes on all four platforms, then remove it.
13. Record where each extranet's booking page lives, for Atithi's deep links.

### 3.3 Two-week verification list

Run during Phase 0, with real bookings where possible. Items (a) to (c) come from research 01 (§4); the rest are open points from research 01 (§9) and research 03 (§I), and gaps where the research is silent.

| # | Check | How | Pass means |
|---|---|---|---|
| a | MakeMyTrip-branded bookings arrive, not only Goibibo ones | A real or test MakeMyTrip booking | It reaches Beds24 and fires a webhook |
| b | PAH and Zero Payment bookings arrive with a usable payment-status or payment-mode field | Inspect the Beds24 payload for a pay-later booking | Atithi can tell pay-at-property from prepaid without the email |
| c | Beds24 is on MakeMyTrip's list of 80+ channel managers for **homestay** listings | Ask the BDM | Confirmed in writing |
| d | Which guest fields each platform passes through Beds24 (phone, email, payment mode) | Inspect payloads per platform | Documented per platform |
| e | Webhook delay and completeness for new, changed and cancelled bookings | Time stamps on test bookings | About 1 minute, and no missed cancellations |
| f | Time for a Beds24 block to close each platform | Write a block, then check each extranet | Measured per platform; sets the "still open" alert window |
| g | Which platforms Beds24 can send messages to | Send a test message per platform | Documented; decides how the pre-arrival link goes out (§2.6) |
| h | Whether Beds24 can cancel or mark no-shows on any platform | Beds24 docs and support | Documented; otherwise these stay deep-link tasks |
| i | How Beds24 proves a webhook is genuine (signature or secret) | Beds24 docs and support | A method Atithi can check; otherwise re-fetch every booking by ID (03-architecture §5.3) |
| j | Whether Beds24 reports per-platform push results | API docs | Decides how "On every platform" is filled (03-architecture §5.3) |
| k | Real emails collected: 20 or more per platform, including MakeMyTrip pay-at-hotel vouchers | Rohan's forwarded mail | Fixtures for the parsers (research 03, §I) |
| l | Whether the MakeMyTrip voucher shows payment mode and phone | A real voucher | Documented |
| m | Connect app calendar sync links exist; Agoda room types are single-unit; Booking.com iCal is available | Rohan's accounts | Documented, for the fallback plan (research 01, §9) |

**Decision after two weeks** (05-roadmap §6): go with Beds24 if (a), (b) and (c) pass. If (b) fails, Beds24 can still be used, with payment mode taken from MakeMyTrip emails. If (a) or (c) fails, use the fallback in §8.

## 4. Email ingestion

### 4.1 Why it exists when Beds24 works

- **Redundancy:** a booking email usually arrives within a minute or two, so a stalled channel-manager connection is noticed quickly (research 03, §D.5).
- **Enrichment:** MakeMyTrip vouchers and emails may carry the payment mode and guest details that the channel manager does not (research 01, §7).
- **Fallback:** if Beds24 cannot carry MakeMyTrip, emails become the main MakeMyTrip source (research 01, §4).

### 4.2 Pipeline

From research 03 (§D.6):

```
Gmail filter (from airbnb.com, booking.com, agoda.com, makemytrip.com, goibibo.com) -> auto-forward
  -> bookings+<org_token>@in.<our-domain>          Cloudflare Email Routing
  -> Email Worker: size check, raw MIME, HMAC + timestamp -> POST /api/inbound/email
  -> Route Handler: verify HMAC, save raw .eml to a private Storage bucket,
       insert email_ingests (unique message_id) and queue email.parse, in one transaction -> 200
  -> Worker job email.parse:
       1. parse MIME (postal-mime); check the original OTA DKIM signature (mailauth)
       2. classify by sender domain and subject: channel, kind (new, change, cancel, message, payout, other)
       3. deterministic parser for that channel, kind and template version (cheerio selectors, regex)
       4. validate with Zod; if it fails, run the LLM fallback
       5. score confidence: 0.90 or more -> apply; 0.60 to 0.90 -> review queue; lower -> log only
```

- Cloudflare Email Routing is free and unlimited for inbound, within Workers CPU limits and 25 MiB per message. It needs a domain on Cloudflare DNS (research 01, §7).
- Emails are matched to Beds24 bookings by platform booking ID, so the same booking is never stored twice (03-architecture §4.1).

### 4.3 Onboarding details

- Gmail sends a confirmation email to the forwarding address before forwarding starts. The pipeline recognises it and shows the code or link in onboarding (research 01, §7).
- Gmail's auto-forward usually keeps the OTA's DKIM signature. A manual "Fwd:" breaks it. A DKIM pass from a known OTA domain is the main defence against fake "booking" emails (research 03, §D.6).
- The Gmail API alternative is not used: `gmail.readonly` is a restricted scope, the watch must be renewed every 7 days, and apps left in "Testing" get refresh tokens that expire in 7 days (research 01, §7).
- On Android, Rohan can also share an OTA SMS or WhatsApp text into Atithi (Web Share Target), and it is parsed like an email. On iPhone, a paste box does the same (research 03, §B.5).

### 4.4 LLM fallback

- Model: Claude `claude-opus-5-5`, structured output against a Zod schema, effort `low` (research 03, §D.6).
- The email is treated as untrusted data. The model has no tools, must return null for missing fields, and must quote the email for every field it fills. Quotes not found verbatim lower the score.
- Check `stop_reason` and turn on server-side refusal fallbacks (`fallbacks: "default"`, beta header `server-side-fallback-2026-07-01`).
- Cost: about 3,000 input and 400 output tokens, about **2 US cents per fallback email** at US$4 / US$20 per million tokens (research 03, §D.6).
- **Cancellations found only by the LLM never apply automatically.** Releasing nights is the dangerous direction, so they need a deterministic parser match or Rohan's approval.
- A cheaper model can be benchmarked against the fixtures later. That is a product decision (research 03, §D.6).

### 4.5 Confidence score

| Step | Adjustment |
|---|---|
| Start | 0.98 for a deterministic parse, 0.80 for an LLM extraction |
| DKIM passes for a known OTA domain | +0.05 |
| DKIM missing or failed | −0.30 |
| Any evidence quote not found word for word | −0.20 |
| Listing cannot be mapped | −0.20 |
| Implausible dates (over 30 nights, over 2 years ahead, or in the past) | −0.10 |
| Dates match an existing placeholder exactly | +0.05 |

(research 03, §D.6)

The review queue shows the email beside the extracted fields. One tap approves or edits, and a correction can be saved as a new redacted fixture.

## 5. WhatsApp (Meta Cloud API)

### 5.1 Setup

1. **A new SIM for a dedicated business number.** The Cloud API needs a number that is not on the WhatsApp app. Rohan keeps his personal or Business app number for conversations (research 01, §5.3).
2. A Meta Business portfolio and a WhatsApp Business Account (WABA) for Amberwood Stays.
3. A payment method on the WABA, billed in INR. India WABAs must move to INR billing by **31 Dec 2026**, or Meta stops delivering their messages from 1 Jan 2027 (research 01, §5.1).
4. A Meta app with the WhatsApp product. Webhook URL `/api/webhooks/whatsapp`: the GET handshake checks `hub.verify_token`, and every POST is checked against `X-Hub-Signature-256` (HMAC-SHA256 of the raw body with the app secret) (research 03, §F.1).
5. Use Meta's free test number for development.
6. Submit the templates in §5.2 and wait for approval.
7. Business verification raises the limit from 250 to 2,000 unique users per 24 hours outside the service window. 250 is plenty for one property (research 01, §5.2).

**If Rohan insists on one number** for the app and automation: a BSP that supports "coexistence", such as AiSensy (plans from about ₹1,500 a month, with a free tier), or MSG91 for the lowest fixed fee (about ₹500 a month per number, **verify**) (research 01, §5.3).

### 5.2 Templates

Messages sent outside the 24-hour window must use pre-approved templates. Booking confirmations, reminders, payment reminders and caretaker alerts are **utility** templates: transactional, triggered by a booking, with no promotional content (research 01, §5.2).

| Template key | Purpose | Category | Buttons |
|---|---|---|---|
| `booking_received_v1` | Booking received, dates, check-in and checkout times | Utility | None |
| `booking_verify_v1` | Pay-at-property booking: "Kya aap aa rahe hain?" | Utility | Haan, aa rahe hain · Cancel karna hai |
| `verify_reminder_v1` | Reminder to confirm | Utility | Same two |
| `checkin_details_v1` | Address, times, caretaker number, the day before | Utility | None |
| `caretaker_briefing_hi_v1` | Morning briefing in Hindi | Utility | None |
| `owner_alert_v1` | Urgent alert to Rohan (double booking, likely fake, sync down) | Utility | Open in Atithi (link) |
| `payment_link_v1` | Advance link, only where allowed (§6) | Utility | Pay (link) |
| `advance_received_v1` | Advance received, booking confirmed | Utility | None |
| `review_request_v1` | Thank-you and review link | Utility as submitted; Meta may re-categorise it as marketing (research 03, §A.6) | Review (link) |

Rules (research 03, §F.1):

- Keep wording strictly transactional. Meta can re-categorise a template as marketing, and the business pays the category applied at send time.
- Never edit an approved template. Create a new version (`booking_verify_v2`).
- For MakeMyTrip, the default `booking_verify` wording asks only "are you coming?". It must not make an advance a condition (§7).
- Keep English and Hindi variants. Choose by the guest's phone prefix or the property default.

### 5.3 Pricing (India)

| Date | Change |
|---|---|
| 1 Jul 2025 | Per-message pricing: Meta charges for delivered templates by category |
| 1 Jan 2026 | Marketing rate rises to about ₹0.8631. INR billing launches. |
| 1 Apr 2026 | India authentication-international rate rises |
| **1 Oct 2026** | Service (free-form) messages become billable at the utility rate after **1,000 free per business number per month**, and utility templates inside the service window are charged again (reported by Business Standard, WATI, Twilio and others; Meta's developer pages still showed the older wording, **verify** against the INR rate card in WhatsApp Manager) |

Indicative rates before 18% GST: marketing about ₹0.86; utility and authentication about ₹0.115; service about ₹0.115 after the free 1,000 (research 01, §5.1).

Research 03 (§F.1) still describes utility templates inside the window as free, from Meta's pricing page. The two reports disagree on this point: **verify**. Plan as if they are charged. At this size it does not matter: 200 utility messages × ₹0.115 is about ₹23 + GST, and Meta's fees come to about ₹25–60 a month (research 01, §5.1).

### 5.4 The 24-hour window

- A guest's message opens a 24-hour customer service window. Inside it, free-form replies are allowed. Outside it, only templates (research 01, §5.2).
- Atithi tracks the window from `message_threads.last_inbound_at` and switches the compose bar to templates when it closes (research 03, §E.3).
- Windows opened from Click-to-WhatsApp ads last 72 hours. WATI reports 7 days from 28 Sep 2026 (**verify**). Not relevant unless Rohan runs ads.

### 5.5 Opt-in

- WhatsApp requires opt-in before business-initiated messages. The opt-in must name the business and can be collected by SMS, web, voice or in person (research 01, §5.2).
- **A phone number obtained through an OTA is not, on its own, an opt-in.** This is a policy risk for the verification message in the hero flow. Mitigations (research 03, §F.1):
  - Collect opt-in in the platform-chat welcome message ("reply YES or tap this link to get WhatsApp updates from Amberwood Stays") or the pre-arrival form (§2.6).
  - Keep the first WhatsApp strictly about the booking the guest made, and include an opt-out.
  - Honour STOP at once.
  - Keep volumes low and watch the quality rating.
  - **A policy review is needed before launch.**

### 5.6 Buttons and webhooks

- Templates can carry up to 3 quick-reply buttons. Interactive messages support reply buttons, lists of up to 10 rows, CTA-URL buttons, and WhatsApp Flows forms (research 01, §5.2).
- Each button carries a signed payload, `v1|CONFIRM|<booking_id>|<hmac8>`, so a reply maps to a command without conversation state (03-architecture §6.4).
- Webhooks bring inbound messages, button replies and delivery statuses (`sent`, `delivered`, `read`, `failed`, with the pricing category). A failure, for example a number not on WhatsApp, becomes a task for Rohan to call the guest (research 03, §F.1).
- WhatsApp's own payment messages (`order_details`) need Tech Provider or BSP access. A payment link inside a template is simpler for now (research 01, §5.2).

### 5.7 Never use unofficial clients

Baileys, whatsapp-web.js and whatsmeow breach WhatsApp's terms ("bulk messaging, auto-messaging", "access through automated means"). Accounts get disabled, and a June 2026 change requiring passkeys for device linking reportedly broke QR pairing for these libraries (**verify**). Losing the host's number would be catastrophic (research 01, §5.4).

## 6. Razorpay Payment Links

### 6.1 Where links are allowed

| Booking | Advance link? |
|---|---|
| Direct | Yes |
| Extras (for any booking) | Yes |
| MakeMyTrip pay-at-property | Only after the BDM agrees in writing, and only as an optional prepayment (§7). Off by default. |
| Agoda | No. Prepaid on Agoda unless Property Collect is on, and research only clears direct, extras and MakeMyTrip PAH. |
| Airbnb | **Never.** Off-platform payment is prohibited. |
| Booking.com | **Never.** Off-platform payment is prohibited. |

(research 01, §6 and §8)

The server enforces the Airbnb and Booking.com ban regardless of rule settings (03-architecture §6.1).

### 6.2 Account and fees

- Always **Rohan's own Razorpay account**. Collecting on hosts' behalf would make us a payment aggregator under RBI rules (research 03, §F.2).
- Individual route: PAN, Aadhaar or address proof, and a bank account in the same name. A no-GST route exists, and CKYC can speed it up (research 01, §6).
- Fees: 2% platform fee on UPI, cards and netbanking (UPI has no MDR, so Razorpay charges this as a platform fee); up to 3% international; 18% GST on the fee; no setup fee. A ₹5,000 advance costs about **₹118** (research 01, §6). **Verify** on Razorpay's current India pricing page (research 03, §F.2).

### 6.3 Creating a link

From research 03 (§F.2):

- `amount` in paise, `currency: "INR"`.
- `reference_id: "{booking_id}:adv:{n}"` as the natural idempotency key.
- `expire_by` set from the advance rule (the prototype uses 24 hours).
- `notify: { sms: false, email: false }`, because Atithi sends the link on WhatsApp.
- `notes: { booking_id, org_id }` and a `callback_url` to a thank-you page.

When a link expires unpaid on a **direct** booking, Atithi asks Rohan whether to release the nights. On a MakeMyTrip booking it cannot release them: only a cancellation on MakeMyTrip does that.

### 6.4 Webhooks

- Events: `payment_link.paid`, `payment_link.partially_paid`, `payment_link.expired`, `payment_link.cancelled`.
- Check `X-Razorpay-Signature` (HMAC-SHA256 of the raw body with the webhook secret). Drop duplicates on the `x-razorpay-event-id` header.
- Events can arrive out of order, so on `paid` re-fetch the payment from the API before trusting it.
- Record a `payments` ledger row (unique provider payment ID), recompute the payment status, and emit `payment.received`. The automation engine confirms the booking and sends the receipt.
- Per-connection URLs (`/api/webhooks/razorpay/{connectionId}`) let the handler pick the right secret first.

### 6.5 Zero-cost fallback

A UPI deep link or static QR (`upi://pay?pa=…&am=…&tn=BookingID`) costs nothing but has no webhook. The guest taps "Paid? Send UTR" and Rohan matches it by hand. NPCI ended person-to-person "collect" requests on 1 Oct 2025; intent links and QR codes still work (research 01, §6).

## 7. The MakeMyTrip advance: legal check

### 7.1 What is known

- MakeMyTrip's MyBiz terms say: "In 'Pay at hotel' model, the concerned hotel will collect the entire payment … at the time of check-in" (research 01, §3).
- Asking a PAH guest for an advance changes the terms the guest was sold and **may breach MakeMyTrip's partner terms** (research 01, §3; research 02, §4.3).
- No 2025–2026 MakeMyTrip policy change on PAH was found. The visible changes are in the app: the Inbox rename, the Payments section and cancellation-policy management (research 01, §3).

### 7.2 What Atithi does by default

- Confirm / Cancel buttons only. A "yes" is enough to confirm (research 02, §4.3).
- No advance request, no payment link, and no wording that makes payment a condition.
- A flagged booking is cancelled by Rohan in the MakeMyTrip extranet, not by Atithi.

### 7.3 Questions for the BDM, in writing

1. Can PAH be switched off for Amberwood Stays, or limited to guests who give a card guarantee?
2. Can Auto-Confirmation be switched off, so bookings can be screened?
3. Can the free-cancellation window be shortened, so zero-payment holds are charged or released earlier?
4. May the host offer PAH guests an **optional** prepayment link? May the host require one?
5. What is the correct way to report a PAH no-show?
6. Will MakeMyTrip connect the property to Beds24, and is Beds24 approved for homestay listings?

(research 01, §3 and §4)

### 7.4 If the answer to question 4 is yes

Turn on the MakeMyTrip advance setting (More › Payments). The advance is still worded as optional ("to guarantee your villa"), and a confirmed WhatsApp reply stays sufficient on its own (research 02, §4.3). Keep the BDM's written answer with the account records.

## 8. Fallback: iCal

Used only if Beds24 cannot carry the platforms, and only for Airbnb, Booking.com and Agoda (research 01, §9; research 03, §D):

- **Hub and spoke:** each platform imports one Atithi feed per listing. Platforms are never chained to each other (research 01, §2.1).
- **Inbound:** Atithi polls each platform's feed every 10 minutes with jitter and backoff, and alerts after 60 minutes of failure (research 03, §D.2).
- **Outbound:** `/ical/{token}.ics` per listing and target platform, excluding that platform's own bookings to avoid echoes, with no guest data in the feed (research 03, §D.4).
- **Exposure:** a platform only reads our feed on its own schedule. Airbnb refreshes every 3 hours, so the double-booking window is about 3 hours even with instant email detection (research 03, §D.5). Atithi shows when each platform last read the feed and sends "Block now" alerts with deep links.
- **MakeMyTrip:** iCal is undocumented and unreliable. MakeMyTrip dates are blocked by hand, prompted by the parsed MakeMyTrip email (research 01, §9).
- The UI must say plainly that this mode has a gap of several hours (research 01, §9).

If MakeMyTrip will not connect Beds24, the first fallback is an Indian channel manager with confirmed MakeMyTrip support (Djubo, eZee, Homeyhuts), with Atithi reading bookings from emails because these offer no public API (research 01, §4).

## 9. What we will not do

- **Scrape or script any extranet** (Airbnb, Booking.com, Agoda YCS, InGo-MMT): no headless browsers, no stored platform passwords. It breaks platform terms and risks the listings, and 2FA and bot detection make it brittle anyway (research 01, §8).
- **Use unofficial WhatsApp libraries** (§5.7).
- **Send payment links for Airbnb or Booking.com bookings** (§6.1).
- **Ask MakeMyTrip PAH guests for an advance** without the BDM's written agreement (§7).
- **Hold guests' money** or route payments through an Atithi account (§6.2).
- **Treat a phone number from a platform as WhatsApp opt-in** (§5.5).
- **Read the host's Gmail through the Gmail API**; forwarding is used instead (§4.3).
- **Read SMS or other apps' notifications** (research 03, §B.5).
- **Build a channel manager or apply for OTA connectivity ourselves** (research 01, §1).
- **Release nights on a platform booking because a guest said "cancel"**; only an observed cancellation does that (03-architecture §3.3).
