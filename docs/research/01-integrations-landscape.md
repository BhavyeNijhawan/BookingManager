# 01: Integrations landscape for a small Indian host (OTAs, channel managers, WhatsApp, payments, email)

*Research date: 11 Oct 2026. Scope: one host with 1-3 villa/homestay units on Airbnb, MakeMyTrip/Goibibo (MMT), Agoda and Booking.com. Facts tagged **[verify]** come only from third-party or vendor sources, or from sources that may be out of date. Before building on them, check them in the host's own accounts.*

---

## 0. Executive summary

- **Direct OTA APIs are closed to a one-host developer.** Airbnb takes API partners by invitation only. Booking.com has *paused integrations with new connectivity providers until further notice*. Agoda and MMT only certify channel-manager companies. Getting real two-way sync means renting a **channel manager (CM) that has an API and webhooks** and building the PWA on top of it.
- **MMT is the deciding constraint.** Most global vacation-rental tools (Smoobu, Hostaway, Lodgify, Uplisting, Hospitable) do **not** connect to MMT. The cheap options that do and also expose a developer API are **Beds24** (through its Goibibo/InGo-MMT connection) and **Channex** (white-label, priced for software vendors). Rentals United and Indian hotel CMs (Djubo, eZee, STAAH, AxisRooms/Hotelogix) also connect to MMT, but they cost more or have closed APIs.
- **iCal works as a fallback for Airbnb, Booking.com and Agoda only.** It is slow (Airbnb pulls every ~3 h), carries no guest data, and MMT iCal support is undocumented and reported as "limited / inconsistent".
- **WhatsApp:** use Meta's Cloud API directly, or a low-markup BSP. At 50-200 messages a month the Meta fees are **well under ₹100/month**, even after the **1 Oct 2026** change that makes service replies billable beyond 1,000 free per number. Unofficial libraries (Baileys, whatsapp-web.js) breach WhatsApp's ToS and get numbers banned.
- **Payments:** Razorpay Payment Links (2% + GST on the fee, webhooks, works for individuals with PAN + bank account) is the easiest to integrate. A UPI deep link costs nothing but gives no automatic confirmation.
- **Guest contact data is getting harder to obtain.** Booking.com stopped sending guest phone numbers to CMs on **28 Sep 2026**. Agoda masks contact details. MMT shows guest contact details only **3 days before check-in**. Some Airbnb guests get proxy numbers that do not work on WhatsApp.

---

## 1. Direct API access: realistic or not?

| Platform | Official API | Who gets access | Can a single host's custom app get it? |
|---|---|---|---|
| Airbnb | Homes API (developer.withairbnb.com: listings, availability, reservations, messaging) | Invited "Preferred Software Partners". NDA, API terms and a security review. Partner managers reach out; there is no public application. | **No.** Third-party "Airbnb APIs" are reverse-engineered and against ToS. |
| Booking.com | Connectivity APIs (OTA XML/JSON: ARI, reservations, messaging, content) | Connectivity Partners (companies) after compliance review (EU regulation, PCI, PII). **New provider integrations are currently paused.** Booking.com states that individual properties cannot connect directly. | **No.** |
| Agoda | YCS API (SetAri, GetBookingList, GetBookingDetails, "BookingHint" push) | Channel-manager partners. Self-certification script, then a pilot on 2-3 live properties. | **No** in practice. It is built for CM companies. |
| MMT / Goibibo | Connectivity API for channel managers. "80+ CMs" are listed in InGo-MMT; a missing CM can be requested through your Business Development Manager (BDM). | Channel-manager companies | **No.** No public developer program. |
| Expedia / Vrbo | Expedia Group / Vrbo connectivity programs (Elite and Preferred tiers) | Connectivity providers | No. Low priority, since the host does not list there. |
| Google Vacation Rentals | Feeds through approved connectivity partners. Google says individual homes are "not considered businesses" for VR search and recommends a partner below 500 properties. | PMS/CM partners | Only through a CM (Beds24 lists "Google for Vacation Rentals"). |

**Conclusion:** the PWA should be a **dashboard and automation layer on top of a channel manager**, not a channel manager itself.

---

## 2. Per-platform details

### 2.1 Airbnb
- **iCal:** both export and import are supported. An imported `.ics` refreshes automatically **every 3 hours**, and the host can trigger a rate-limited manual refresh. Up to 2 years of data are imported. Dates booked in an imported calendar are blocked on Airbnb. Dates *blocked* elsewhere "may or may not" be blocked.
- **Feed contents (format from Airbnb's Dec 2019 change, [verify] on a live feed):** `SUMMARY: Reserved` for bookings and "Not available" for blocks. `DESCRIPTION` holds the **reservation URL** (which contains the HM… confirmation code) and the **last 4 digits of the guest's phone**. There is no guest name, email or price, and only future dates are included. Airbnb also leaves dates blocked by *imported* calendars out of its *export*, so a hub-and-spoke design (every OTA imports one hub feed) is safer than chaining OTAs to each other.
- **Emails:** the host gets "Reservation confirmed - {Guest} arrives {date}" emails with confirmation code, dates, guest count and payout, plus request, alteration and cancellation emails. Their layout is consistent enough that Parsio, Parseur and Zapier ship ready-made templates. There are no host-side webhooks.
- **Guest contact:** email is masked behind a relay. The phone number is visible **only after confirmation** (reservation → Manage reservation) and is removed if the booking is cancelled. Some guests get a **temporary Airbnb number** that expires 2 days after checkout and **does not work with WhatsApp**. Asking a guest to move communication off-platform before confirmation is against policy.
- **App:** the Airbnb host app (bookings, inbox, scheduled messages, calendar). It offers no integration hooks.

### 2.2 Booking.com
- **iCal ("Sync calendars"):** found in the extranet under Rates & Availability. Export can cover booked dates only, or booked plus closed dates. Import takes another platform's `.ics`. Updates lag **30 minutes to several hours**. Exported events read "CLOSED - Not available" with **no guest details**. Imported iCal connections are **not kept once a channel manager is connected**, so you use one or the other. [verify] Third-party guides say the feature is meant for single-unit "home" listings and sometimes has to be activated by Booking.com.
- **Emails:** "new booking", "modified" and "cancelled" emails include the reservation number and dates, but many details are only reachable through the extranet link. Their structure is less parser-friendly than Airbnb's, so key the parser on the reservation number. A cancellation or no-show must be marked within about 48 hours to keep it off the commission invoice.
- **Guest contact:** emails are masked aliases (`@guest.booking.com`). The phone number is visible in the extranet and in the **Pulse** app. **From 28 Sep 2026 Booking.com no longer sends guest phone numbers to connectivity providers** (CMs/PMSs). Bookings that arrive through Beds24 or Channex will have no phone number. [verify] Guesty reports that new properties see the phone number only 14 days before check-in.
- **App:** Pulse (reservations, messages, availability). It offers no integration hooks.

### 2.3 Agoda
- **iCal ("Calendar connections" in YCS/Partner Hub):** export with "Copy calendar link", import through "Other website link". Refreshes run "several times a day", plus a manual "Refresh connections" button. **Only room types with exactly 1 unit qualify**, which suits villas. iCal syncs availability only, so prices must be managed in Agoda.
- **Payment models:** **Property Collect** (pay at property) is an **opt-in** setting, as is the "no credit card guarantee" variant. If the host never enables them, Agoda stays prepaid through Agoda's own collection.
- **Guest contact:** Agoda masks guest email and does not release full contact details (it cites PCI and GDPR). Use the masked email or YCS messaging.
- **Notifications:** booking emails go to the property, and CMs get BookingHint push notifications followed by a GetBookingDetails pull.

### 2.4 MakeMyTrip + Goibibo (InGo-MMT, now "Connect by MakeMyTrip")
- **One extranet serves both brands.** Each booking shows its channel (MMT or Goibibo), and the Bookings tab has a toggle to switch between them. Cloudbeds/myallocator describes MMT, Goibibo and others as rolled into a single "Ingoibibo" channel, so **one CM connection covers both brands** ([verify] per CM).
- **Homestays/villas** are listed through "Homestays & Villas" in the extranet. The host needs PAN, bank details and ownership or lease proof. GST and TAN are needed only if applicable, and Aadhaar KYC is optional but speeds activation. A BDM contacts the host before the listing goes live.
- **iCal:** **no official Go-MMT documentation was found.** The Connect app's store listing says "block/unblock dates … **sync with other OTAs** … avoid double bookings", and a 2022 video claims calendar sync applies to apartments, homestays and vacation rentals. One CM vendor reports MMT iCal as "limited / inconsistent, don't use it". **[verify in the host's Connect app → Calendar].** Do not rely on it for no-double-booking.
- **Notifications:** new bookings arrive by **email, SMS and the Connect app**, plus **WhatsApp alerts for bookings pending confirmation** (opt-in). Accounts run in either **Auto-Confirmation mode** or manual confirm/reject mode, and MMT discourages rejections.
- **Guest contact:** the guest's name, email and mobile number appear in the extranet **only 3 days before check-in**. Before that, the host can only use the in-app **Inbox** chat (renamed from Chat in Oct 2025), which also supports automated welcome notes.
- **Payments:** the Payments tab shows check-in date, guest name, booking ID, amount and a **payment status ("pending" or "processed" with a bank reference)**. Prepaid bookings settle CI+1 or CI+2 (1 or 2 days after check-in). Commission is reported at around 18-22% [verify].
- **App:** Connect by MakeMyTrip (v10.10.x, Sep 2026). It covers bookings, check-ins, vouchers, payments (added Jan 2026), calendar bulk operations, Inbox, reviews and "How to Reach" instructions. It offers no integration hooks.

### 2.5 Expedia/Vrbo and Google VR
- Vrbo/Expedia iCal exists, but the link sometimes has to be requested from an account manager. Through a CM it is a fully supported channel.
- Google Vacation Rentals can be reached only through a CM partner. It becomes worth considering once a direct-booking page exists.

### 2.6 iCal summary

| | Export | Import | Refresh (pull) | Guest data in feed | Notes |
|---|---|---|---|---|---|
| Airbnb | Yes | Yes | ~3 h + manual | Reservation URL + last 4 phone digits | Does not re-export imported blocks |
| Booking.com | Yes | Yes | 30 min to hours | None | Disabled when a CM is connected |
| Agoda | Yes | Yes | "Several times a day" + manual | None documented | Only 1-unit room types |
| MMT/Goibibo | Unclear | Unclear | Unknown | Unknown | Undocumented; reported unreliable |

---

## 3. MMT "Pay at Hotel" and pay-later: what is known

MMT sells **two different "pay later" products**, and the host's "fake bookings" could come from either.

1. **Pay at Hotel (PAH):** the guest books with no upfront payment and pays the property at check-in. Goibibo describes it as available at "select hotels", some of which require card details. The partner app lets the host **"Mark Check-In / No Show for a Pay At Hotel booking"**, and MMT's MyBiz terms say "In 'Pay at hotel' model, the concerned hotel will collect the entire payment … at the time of check-in." Promotions can be set to **exclude** PAH bookings. **No public partner article documents a toggle to switch PAH off.** It appears to be configured per property or rate plan by the MMT market manager/BDM. **Action: the host should ask his BDM to disable PAH**, or to require a card guarantee for it.
2. **"Book with Zero Payment" / "Free Cancellation, Zero Payment Now":** launched in 2022 and reported to drive over 30% of MMT hotel bookings shortly after launch. The guest pays ₹0 or ₹1 to authenticate a payment method. **MMT** collects the full amount later: the official page says the card is charged *two days before the free-cancellation end date*, and 2022 press coverage says payment is due up to 72 h before check-in. Unpaid bookings are reported as "unfulfilled" and refunded the ₹1, which implies auto-cancellation [verify]. The host is paid by MMT as for a prepaid booking. The cost to the host is **inventory held for days or weeks that may evaporate close to arrival**.

**How the host learns about it:** a new-booking email, SMS, app notification, or a WhatsApp alert if the booking is pending confirmation. Payment status shows as pending or processed. No public document confirms that the voucher or email explicitly says "PAH" versus "prepaid" [verify with a real voucher]. The parser should capture the payment-mode line on the voucher if one exists.

**Recommended operating playbook (for the app's MMT flows):**
- Ask the BDM to turn PAH off, or limit it, and set a **short free-cancellation window** so zero-payment holds are charged or released early.
- Turn **off Auto-Confirmation** if MMT allows it, so the host can screen bookings.
- In the app, flag every MMT booking whose payment status is "pending" or whose payment mode is PAH. Send an automatic reconfirmation request through MMT Inbox, then over WhatsApp once contact details unlock 3 days out, with quick-reply buttons *Confirm / Cancel*. Mark no-shows in the extranet promptly.
- **Caution:** asking a PAH guest for an *advance* changes the terms the guest was sold and may breach MMT's partner terms. Get the BDM's position in writing. A softer route is to offer an *optional* prepayment link.
- No 2025-2026 MMT policy change on PAH was found. The visible changes are app-level: the Inbox rename, the Payments section and cancellation-policy management.

---

## 4. Channel-manager-as-a-service options

| Provider | Airbnb | Booking.com | Agoda | **MMT/Goibibo** | Developer API + webhooks | Approx. cost for 1-3 units | Villas/homestays |
|---|---|---|---|---|---|---|---|
| **Beds24** | Yes (API + iCal) | Yes | Yes (+ Agoda Homes) | **Goibibo (InGo-MMT) API connection.** Inventory, multiple rates, imports bookings, modifications and cancellations. Set up through the Goibibo market manager. MMT is not listed separately [verify that it covers MMT]. | **Yes.** API v2 (invite code → token; 100 credits per 5 min), booking webhooks (~1 min delay; new, modified, cancelled, OTA message) | From ~€15.50/mo + €0.55 per room-channel link → roughly **€18-25/mo** | Yes |
| **Channex.io** | Yes | Yes | Yes | **Yes** (needs MMT Hotel ID + access token from MMT) | Yes, a full API built for PMS builders | **$130/mo platform fee** + $0.50/VR unit (or $7/hotel property) → ~$131-151/mo. Channex says single properties should buy a CM instead. | Yes |
| Rentals United | Yes | Yes | Yes | **Yes** (hybrid: MMT builds the listings by hand; bookings flow one way, MMT → RU) | API for certified partners | Quote; ~$330/mo cited [verify] | VR-focused |
| Djubo (India) | Yes | Yes | Yes | **Yes** (MMT + Goibibo listed) | API on request (api@djubo.com), not public | INR slabs from 1-10 rooms; ~US$46/mo cited [verify] | Hotels; homestays OK per reviews |
| eZee Centrix (Yanolja) | Yes (Airbnb PSP) | Yes | Yes | Likely [verify] | Partner API, not self-serve | Quote; from ~US$32/mo [verify] | Hotel-centric |
| STAAH (Access Group) | Yes | Yes | Yes | Likely [verify] | Partner API/webhooks (sandbox) | Quote | Hotel-centric |
| AxisRooms / Hotelogix, Bookingjini, Maximojo, eGlobe | Mostly | Yes | Yes | **Yes** (India-focused) | No public self-serve API found | Quote (INR) | Hotel-centric |
| Homeyhuts (India) | Yes | Yes | Yes | Yes (claimed) | No public API found | Per listing (prices not public) | Built for Indian homestays |
| RentalWise | ? | ? | ? | Yes ("direct API", Apr 2025 claim) | ? | ? | VR |
| Smoobu | Yes | Yes | Yes | **No** | API + webhooks (keys on request; API-key auth sunsets 31 Oct 2026 → HMAC/OAuth) | ~€23-35/mo | VR |
| Hospitable | Yes | Yes | Yes | **No** | Public API v2 + webhooks (paid tier) | Not confirmed | VR |
| Hostaway | Yes | Yes | ? | **No** | API + webhooks (graded "D" by Supergood) | ~$125-175/mo minimum [verify] | VR |
| Lodgify | Yes | Yes | ? | **No** | API v2 + webhooks (not on Starter) | ~$16-26/mo + 1.9% booking fee on API channels | VR |
| Uplisting | Yes | Yes | ? | **No** | API + webhooks (Client ID from partner team) | ~$29+/property [verify] | VR |
| QloApps CM | Through Channex | Through Channex | ? | Not confirmed | Open-source PMS | ~$25-30/property/mo [verify] | Hotel |

Hostfully, NextPax and Su API showed no evidence of MMT support. Su API is a white-label CM sold to PMS vendors, so it is not relevant at this scale.

**Recommendation for MMT two-way sync (cheapest practical path):**
1. **Beds24 as the sync engine.** Connect Airbnb (API), Booking.com (API), Agoda (API) and **InGo-MMT through Beds24's Goibibo connection**. The host asks his MMT market manager to "connect property to Beds24". The PWA reads bookings through **API v2 plus webhooks** and writes manual blocks through `/inventory/rooms/calendar`. Expected cost is about **€20/month**. Before committing, confirm in a 2-week trial that: (a) MMT-branded bookings arrive, not just Goibibo ones; (b) PAH/zero-payment bookings arrive with a usable payment-status field; (c) Beds24 is on MMT's list of 80+ CMs for *homestay* listings.
2. **Fallback if MMT will not connect Beds24:** an Indian CM with confirmed MMT support (Djubo, eZee, Homeyhuts). Here the PWA would rely on **email parsing** for booking data, because these CMs offer no public API.
3. **Channex** is the right choice only if the product later becomes a **multi-host SaaS**. At $130/month for the platform fee alone, it is uneconomic for one host.

---

## 5. WhatsApp Business Platform

### 5.1 Pricing timeline (India)
- **1 Jul 2025:** per-message pricing. Meta charges only for *delivered template* messages, by category (marketing, utility, authentication) and by recipient country. Utility templates sent inside an open 24-h customer service window (CSW) became free, and replies inside the CSW were free. Utility and authentication messages get volume tiers.
- **1 Jan 2026:** India marketing rate increased (~₹0.7846 → **~₹0.8631**). **INR billing** launched, and India WABAs must migrate to INR by **31 Dec 2026**, or Meta stops delivering their messages from 1 Jan 2027.
- **1 Apr 2026:** India *authentication-international* rate increased.
- **1 Oct 2026 (reported by Business Standard, WATI, Twilio, respond.io and Mark360):** **service (free-form) messages become billable** at the market's utility rate after **1,000 free per business number per month**, and **utility templates inside the CSW are charged again**. The Meta developer pages fetched today still show the older wording, so verify against the INR rate card in WhatsApp Manager. A payment method on the WABA is required.
- **Indicative India rates (ex-18% GST):** marketing ~₹0.86; utility and authentication ~₹0.115; service ~₹0.115 after the free 1,000. Some BSPs list ₹0.138-0.145 for utility/service and ₹0.94-1.09 for marketing, which includes their markup.

**Cost at this scale:** 200 utility templates (confirmations, reminders, caretaker alerts) × ₹0.115 ≈ **₹23 + GST**. Service replies stay inside the free 1,000. Meta's fees come to about ₹25-60/month. **Platform fees dominate the total.**

### 5.2 Rules that shape the design
- **Templates:** messages sent outside the CSW must use pre-approved templates. Booking confirmations, check-in reminders, payment reminders and caretaker task alerts are **utility** templates: transactional, triggered by a booking, with no promotional content. Meta can re-categorise a template as marketing, and the business pays the category applied at send time.
- **CSW:** a guest's message opens a 24-hour window for free-form replies. **Free entry point** windows from Click-to-WhatsApp ads extend to 72 h, and WATI reports 7 days from 28 Sep 2026.
- **Opt-in:** required before business-initiated messages. It must name the business and can be collected by SMS, web, IVR or in person. **A phone number obtained through an OTA is not, on its own, an opt-in.** Collect consent in the OTA-chat welcome message ("reply YES / tap this link to get WhatsApp updates from Villa X") or in a pre-arrival form.
- **Interactive features:** reply buttons (up to 3), list messages (up to 10 rows), CTA-URL buttons, quick-reply buttons inside templates, and **WhatsApp Flows** (native forms, useful for guest ID and arrival-time collection).
- **Payments in India:** the WhatsApp **Payments API** sends `order_details` messages. In UPI-intent mode any gateway can be used, but the status comes from the gateway's own webhook. Deep-integration mode is limited to **Razorpay, PayU, BillDesk and Zaakpay**. It needs Tech Provider/BSP access, so a plain **payment link inside a template** is simpler for the MVP.
- **Webhooks:** inbound messages, button replies, and status callbacks (`sent`, `delivered`, `read`, `failed`) with pricing category.
- **Messaging limits:** a new portfolio can message **250 unique users per 24 h** outside the CSW. That is plenty here, and business verification raises it to 2,000.

### 5.3 Provider options

| Option | Platform fee | Per-message | Notes |
|---|---|---|---|
| **Meta Cloud API direct** | ₹0 | Meta rates | Free test number for development. Needs Meta Business portfolio, WABA, a **dedicated number** and a payment method. Coexistence on the host's existing WhatsApp Business app number requires a Tech Provider or BSP. |
| MSG91 | ~₹500/mo per number (first 2 months waived) | Claims pass-through Meta rates | Cheapest managed option [verify] |
| AiSensy | Plans ~₹1,500+/mo; "Free Forever" tier | ₹0.145 utility/service, ₹1.09 marketing | Supports **coexistence** (keep the WhatsApp Business app on the same number) |
| Interakt | ~₹2,499-2,799/mo | Markup over Meta | Shopify-oriented |
| WATI | ~₹2,199-2,999/mo (Growth) | ~20% markup reported | Webhook access varies by plan |
| Gupshup | Platform fee + ~₹0.08/msg markup [verify] | | Enterprise-oriented |
| Twilio | None | Meta + **$0.005/msg** (inbound and outbound) | Good docs, USD billing |
| Kaleyra | Enterprise quote | | Overkill |

**Recommendation:** **Meta Cloud API direct with a new dedicated SIM number** for automated guest and caretaker messages. Cost is roughly ₹0 platform fee and under ₹100/month in messages, and the host keeps his personal or Business app number for conversations. If he insists on one number for both, use a BSP that supports coexistence (AiSensy) or MSG91 for the lowest fixed fee.

### 5.4 Unofficial libraries (Baileys, whatsapp-web.js, whatsmeow)
WhatsApp's Terms prohibit "bulk messaging, auto-messaging", "non-personal use … unless otherwise authorized" and access "through automated means". Accounts can be disabled, and creating a replacement account without permission is also prohibited. Library maintainers themselves warn of bans. A **June 2026 server change requiring passkeys for device linking** reportedly broke QR pairing for Baileys, whatsmeow and whatsapp-web.js (vendor report, [verify]). **Do not build on these:** losing the host's main number would be catastrophic.

---

## 6. Collecting advance payments in India

| Option | Fees | Integration | KYC for an individual or sole proprietor |
|---|---|---|---|
| **Razorpay Payment Links** | 2% platform fee on UPI, cards and netbanking (UPI is MDR-free by RBI policy; Razorpay charges this as a platform fee); international up to 3%; **18% GST on the fee**; no setup fee or AMC | API create; expiry; partial payments; SMS/email reminders; webhooks (`payment_link.paid` / `partially_paid` / `expired`) | Individual route: PAN + Aadhaar/address proof + bank account in the same name. A no-GST route exists; CKYC can speed it up. |
| Cashfree Payment Links | 2.0% standard UPI platform fee (promos 1.6-1.95% have expired) | Similar API and webhooks; UPI intent/QR | Similar; GST not mandatory |
| PhonePe PG | Advertises a "1.95% FREE*" offer [verify terms] | API + webhooks | Business onboarding |
| UPI deep link / static QR (`upi://pay?pa=…&am=…&tn=BookingID`) | ₹0 | **No webhook.** Payment has to be matched manually by UTR or screenshot. | None beyond a bank VPA. Merchant QR apps (PhonePe/Paytm Business) give alerts but no API. |

Notes: NPCI ended **P2P "collect" requests from 1 Oct 2025**. Intent links and QR codes still work, and merchant collect continues. Effective cost on a ₹5,000 advance through Razorpay is about **₹118**.

**Recommendation:** use **Razorpay Payment Links** for the MVP. A static UPI QR or deep link is the zero-cost fallback, with a "paid? send UTR" button in WhatsApp. **Policy guardrail:** never send payment links to **Airbnb or Booking.com** guests for platform bookings, because off-platform payment is prohibited. Limit the feature to MMT PAH bookings (subject to the BDM caveat in §3), direct bookings and extras.

---

## 7. Email ingestion (redundancy and enrichment)

The CM covers most booking data. Email parsing still matters for MMT vouchers, payment status, the iCal-only fallback, and the case where no CM API is available. The host sets a **Gmail filter** that auto-forwards emails from OTA senders to a parsing address. Gmail requires the forwarding address to confirm a verification email, so the pipeline must surface that first message to a human.

| Service | Cost | Fit |
|---|---|---|
| **Cloudflare Email Routing + Email Worker** | Inbound is free and unlimited (Workers free plan; CPU limits apply; 25 MiB/message) | **Best for the MVP.** Parse `message.raw` with `postal-mime` and POST to the backend. Requires a domain on Cloudflare DNS. |
| Resend Inbound (launched Nov 2025) | Shares the sending quota (free 3,000/mo, 100/day) | Webhook `email.received` carries metadata only; the body is fetched through the API |
| Postmark Inbound | Paid plans (~$15-16.50/mo); full inbound may need Pro | Mature JSON webhook |
| Mailgun Routes | Paid plans | Not researched in depth |
| SendGrid Inbound Parse | **Free plan retired 27 May 2025**; paid from ~$19.95/mo | Works, but no longer free |
| Gmail API `watch` + Pub/Sub | Free | Push carries only `historyId`; the watch must be renewed at least every 7 days. `gmail.readonly` is a **restricted scope**. Use a personal-use unverified app (under 100 users) and **set it to "In production"**, because "Testing" apps get **refresh tokens that expire in 7 days**. |

**Contact data available by platform (affects WhatsApp outreach):**

| Platform | Guest email | Guest phone |
|---|---|---|
| Airbnb | Masked relay | After confirmation; some are proxy numbers that do not work on WhatsApp |
| Booking.com | Masked alias | Extranet and Pulse only; **not sent to CMs since 28 Sep 2026** |
| Agoda | Masked | Not released in full |
| MMT/Goibibo | Real (voucher/extranet) | Real, but **visible only 3 days before check-in**; Inbox chat before that |

Practical consequence: get WhatsApp opt-in and the phone number through **a pre-arrival link sent in each OTA's messaging channel** (the Beds24 API can send OTA messages). Caretaker notifications have none of these restrictions.

---

## 8. Legal and ToS

- **Scraping or headless-browser automation of extranets** (Airbnb, Booking.com extranet, YCS, InGo-MMT) breaks platform terms. Airbnb's terms say not to use "bots, crawlers, scrapers or other automated means to access or collect data" or to circumvent security measures. The risk is suspension of the host's listings, his income. 2FA, OTP logins and bot detection also make it brittle. **Allowed alternatives:** iCal links, the host's own email notifications that he forwards, official CM connections, and manual entry in the PWA.
- **WhatsApp:** Business Platform only, with opt-in, approved templates and honoured STOP requests. Section 5.4 covers unofficial clients.
- **DPDP Act 2023 / DPDP Rules 2025** (notified 13-14 Nov 2025): the main obligations (notice, consent, security safeguards, breach reporting) apply about **18 months after notification (around May 2027)**. Design now for a privacy notice, consent capture, data minimisation (ID scans, phone numbers), deletion, and access logs.
- **OTA payment rules:** collecting money off-platform for Airbnb or Booking.com bookings is prohibited. For MMT PAH, get written guidance from the BDM.

---

## 9. Recommended path

**MVP (weeks 1-6)**
1. Beds24 trial, connected to Airbnb, Booking.com, Agoda and InGo-MMT. Validate MMT bookings, PAH bookings and payment-status fields.
2. PWA backend subscribes to Beds24 booking webhooks and polls `modifiedSince` every ~30 min as a safety net. It provides a unified calendar plus a "block dates" action written back to Beds24.
3. Meta Cloud API on a dedicated number: utility templates for booking confirmation, the T-3/T-1 reminder, caretaker check-in/out tasks, and reconfirmation with quick-reply buttons for MMT pending/PAH bookings.
4. Razorpay Payment Links + webhook for MMT PAH and direct-booking advances.
5. Cloudflare Email Worker parsing forwarded OTA emails, for redundancy and MMT voucher details.

**If Beds24 cannot connect MMT:** use an Indian CM for sync and email parsing as the PWA's data source. Only if the host refuses any CM: an iCal hub for Airbnb, Booking.com and Agoda with **manual MMT blocking** prompted by the parsed MMT email. Accept the risk of a 3-hour-plus double-booking window and say so clearly in the UI.

**Later:** a direct-booking page with Razorpay and Google Vacation Rentals through the CM, dynamic pricing, a WhatsApp Flows check-in form with ID upload, and Channex white-label if the product becomes multi-host.

**Questions to verify with the host's accounts:** Does Connect/InGo-MMT show calendar-sync links? Is PAH enabled, and will the BDM disable it? Is Beds24 on MMT's CM list for homestays? What do real MMT voucher emails contain (payment-mode line, phone)? Is Booking.com iCal available on his listing? Are his Agoda room types single-unit?

---

## Sources

**Airbnb:** https://www.airbnb.com/help/article/99 · https://developer.withairbnb.com/ · https://hospitable.com/airbnb-partnerships · https://www.airbnb.co.in/help/article/4155 · https://myallocator.cloudbeds.com/hc/en-us/articles/360038298514-airbnb-ical-announcement-and-next-steps-december-2019 · https://www.uplisting.io/blog/how-the-airbnb-icalendar-ical-changes-will-affect-you-and-how-to-avoid-disruption · https://www.airbnb.com/help/article/2908 · https://parsio.io/blog/how-to-extract-booking-data-from-airbnb-emails · https://www.zapier.com/blog/airbnb-automation

**Booking.com:** https://connect.booking.com/ · https://developers.booking.com/connectivity/docs · https://partner.booking.com/en-gb/help/rates-availability/extranet-calendar/syncing-your-bookingcom-calendar-third-party-calendars · https://help.hospitable.com/en/articles/8709568-how-to-check-for-disconnect-an-ical-from-booking-com · https://try.rental-ninja.com/how-to-sync-your-airbnb-and-booking-com-calendars-without-a-channel-manager-using-ical-avoiding-overbookings · https://motopress.com/forums/topic/synchronised-bookings-without-customer-details/ · https://www.smoobu.com/it/blog/booking-com-guest-phone-number-change/ · https://help.guesty.com/hc/en-gb/articles/35992842919453-Troubleshooting-Booking-com-phone-number-and-payment-restrictions · https://www.littlehotelier.com/blog/running-your-property/booking-com-receipt/

**Agoda:** https://partnerhub.agoda.com/how-do-i-connect-my-agoda-calendar-with-other-websites/ · https://developer.agoda.com/supply/docs/ycs-api-faq · https://developer.agoda.com/supply/docs/introduction · https://partnerhub.agoda.com/Introduction-to-Property-Collect · https://partnerhub.agoda.com/?p=3704 · https://partnerhub.agoda.com/?p=3221 · https://help.hosthub.com/en/articles/6731068-use-icalendars-to-sync-with-your-agoda-listing

**MakeMyTrip / Goibibo:** https://partners.go-mmt.com/support/solutions · https://partners.go-mmt.com/support/solutions/articles/81000197207-how-will-i-be-notified-of-my-bookings-other-than-the-extranet- · https://partners.go-mmt.com/support/solutions/articles/81000206432-what-all-details-about-any-booking-can-be-checked-on-extranet- · https://partners.go-mmt.com/support/solutions/articles/81000279001-how-can-i-contact-guests-who-have-already-made-a-booking-for-my-property- · https://partners.go-mmt.com/support/solutions/articles/81000206536-how-can-i-reject-a-reservation- · https://partners.go-mmt.com/support/solutions/articles/81000206416-how-will-i-get-to-know-about-the-payment-status-of-reservations-that-i-have-received- · https://partners.go-mmt.com/support/solutions/articles/81000206415-how-do-i-get-to-know-if-i-have-received-the-booking-from-makemytrip-or-goibibo- · https://partners.go-mmt.com/support/solutions/articles/81000413051-what-information-can-i-find-in-the-booking-details-table- · https://partners.go-mmt.com/support/solutions/articles/81000396852-i-want-to-receive-payment-after-check-in-of-a-booking-is-it-possible- · https://partners.go-mmt.com/support/solutions/articles/81000197228-how-can-i-integrate-a-channel-manager-that-is-not-available-on-the-ingo-mmt-extranet- · https://partners.go-mmt.com/support/solutions/articles/81000412903-how-do-i-list-my-homestay-or-villa-with-makemytrip-and-goibibo- · https://partners.go-mmt.com/support/solutions/articles/81000389962-how-can-i-configure-basic-promotions-on-ingo-mmt-extranet- · https://apps.apple.com/us/app/connect-formerly-ingommt/id1019426231 · https://play.google.com/store/apps/details?id=com.ingoibibo · https://promos.makemytrip.com/free-cancellation-terms.html · https://www.hotelierindia.com/operations/makemytrip-unveils-book-with-zero-payment-feature · https://www.traveltrendstoday.in/makemytrip-launches-book-with-no-payment-model-for-hotels · https://www.makemytrip.com/legal/mybiz-tnc/terms-of-service.html · https://www.goibibo.com/info/pay-at-hotel · https://www.youtube.com/watch?v=dKLhdcfHB4s · https://zitlin.com/pms/ical-calendar-sync/ · https://www.onlinehotelier.com/post/hotel-ota-commission-in-india · https://eglobe-solutions.com/blog/how-to-connect-makemytrip-goibibo-channel-manager.html

**Expedia/Vrbo, Google:** https://support.google.com/hotelprices/answer/12564561 · https://support.uplisting.io/docs/expedia

**Channel managers:** https://channex.io/pricing · https://docs.channex.io/channel-mapping-guides · https://docs.channex.io/channel-mapping-guides/mmt · https://beds24.com/pricing.html · https://beds24.com/channel-manager.html · https://wiki.beds24.com/index.php/Goibibo · https://wiki.beds24.com/index.php/Category:API_V2 · https://wiki.beds24.com/index.php/Category:Webhooks · https://myallocator.cloudbeds.com/hc/en-us/articles/360007212014-how-to-connect-ingoibibo-goibibo-makemytrip-easytobook-to-myallocator · https://docs.rentalsunited.com/hc/en-gb/articles/33814995338653-Integration-overview-MakeMyTrip · https://costbench.com/software/vacation-rental-software/rentals-united/ · https://www.djubo.com/llms-full.txt · https://hospitalitytech.com/ezee-becomes-airbnb-preferred-software-partner · https://www.capterra.in/software/141727/ezee-centrix · https://apitracker.io/a/staah · https://homeyhuts.com/ · https://www.rentalwise.com/blog/makemytrip-channel-manager-integration · https://docs.smoobu.com/ · https://www.roommaster.com/blog/smoobu-pricing · https://hospitable.com/hospitable-connect · https://supergood.ai/api-report-card/hostaway · https://costbench.com/software/vacation-rental-software/hostaway/ · https://supergood.ai/api-report-card/lodgify · https://support.uplisting.io/en/article/api-webhooks-vzlowi/ · https://www.saasworthy.com/product/qloapps-channel-manager/pricing

**WhatsApp:** https://developers.facebook.com/docs/whatsapp/pricing · https://developers.facebook.com/docs/whatsapp/pricing/updates-to-pricing/ · https://developers.facebook.com/docs/whatsapp/messaging-limits · https://developers.facebook.com/docs/whatsapp/overview/getting-opt-in · https://developers.facebook.com/docs/whatsapp/embedded-signup/custom-flows/onboarding-business-app-users · https://developers.facebook.com/docs/whatsapp/cloud-api/payments-api/payments-in · https://support.wati.io/en/articles/16954666-whatsapp-business-platform-api-pricing-changes-service-messages-and-click-to-message-ads · https://www.business-standard.com/amp/world-news/whatsapp-business-pricing-changes-from-today-what-indian-firms-should-know-126100100165_1.html · https://mark360.ai/blog/whatsapp-service-message-pricing-october-1-2026 · https://chatmaxima.com/whatsapp-api-pricing/india/ · https://aisensy.com/pricing · https://wiki.aisensy.com/en/articles/11939127-whatsapp-co-existence-everything-you-need-to-know · https://msg91.com/guide/whatsapp-pricing-update-2026-and-save-with-msg91 · https://codingclave.com/blog/wati-pricing-india-2026 · https://richautomate.in/blog/interakt-vs-wati-india-2026-pricing-decoded · https://richautomate.in/blog/msg91-vs-gupshup-india-2026-pricing-decoded · https://docs.customer.io/accounts/billing/whatsapp-billing/ · https://www.whatsapp.com/legal/terms-of-service · https://whapi.cloud/blog/understanding-whatsapp-new-passkey-security-webauthn-explained · https://chat-sdk.dev/adapters/community/baileys

**Payments:** https://razorpay.com/pricing/ · https://razorpay.com/docs/payments/payment-links/ · https://razorpay.com/blog/payment-gateway-kyc-onboarding-india/ · https://www.cashfree.com/docs/help/account/pricing · https://business.phonepe.com/upi-payment-gateway · https://www.businesstoday.in/personal-finance/banking/story/npci-to-tighten-upi-rules-peer-to-peer-collect-feature-to-end-in-october-489244-2025-08-13

**Email:** https://developers.cloudflare.com/email-routing/limits · https://developers.cloudflare.com/email-service/platform/pricing/ · https://resend.com/docs/dashboard/receiving/introduction · https://www.usecarly.com/blog/resend-pricing/ · https://www.twilio.com/en-us/changelog/sendgrid-free-plan · https://klymentiev.com/blog/postmark-pricing · https://developers.google.com/workspace/gmail/api/guides/push · https://developers.google.com/identity/protocols/oauth2 · https://support.google.com/cloud/answer/13464325 · https://support.google.com/cloud/answer/13464323

**Legal:** https://www.deccanherald.com/india/centre-notifies-dpdp-rules-implementation-planned-in-phases-spread-over-12-18-months-3798465 · https://www.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-
