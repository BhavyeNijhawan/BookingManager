# 01 · Product

What Atithi is for, who uses it, what it must do, and what it will not do. Facts and numbers cite the research reports in `docs/research/`. Names and sample data come from the prototype (`prototype/app.js`).

## 1. Summary

Rohan runs Amberwood Stays in Lonavala: a Main Villa (3 BHK, up to 8 guests) and a Garden Cottage (1 BHK, up to 3 guests). Both are listed on Airbnb, MakeMyTrip/Goibibo, Agoda and Booking.com. Ramesh bhai, the caretaker, lives on site and receives guests. (prototype)

Atithi gives Rohan one screen for all four platforms. It keeps a booking's nights closed everywhere, catches MakeMyTrip pay-at-property bookings that are likely fake, sends guests their WhatsApp confirmations and check-in details, and gives Ramesh bhai a short Hindi list of what to do today.

Atithi is a dashboard and automation layer on top of a rented channel manager, not a channel manager itself. No OTA gives a single host's custom app API access (research 01, §1). Two-way sync comes from Beds24, the first-choice channel manager, which has to pass a 2-week trial first (research 01, §4).

## 2. The problem

| Client pain | What happens today | What Atithi does |
|---|---|---|
| Checking four platforms every day | Rohan opens four extranets or apps to see what came in | Every booking, change and cancellation arrives in one list through the channel manager, with forwarded emails as a backup (research 01, §4 and §7) |
| Fake MakeMyTrip "pay at hotel / pay later" bookings | A guest books with no payment, the dates close on every platform, and the guest never shows up | The booking is held, the guest is asked to confirm on WhatsApp with Confirm / Cancel buttons, and after 24 hours of silence the booking is flagged so Rohan can cancel it on MakeMyTrip with one tap (research 01, §3; prototype) |
| One booking should block the dates everywhere | Rohan blocks dates by hand on the other platforms, or iCal does it hours later | The channel manager pushes availability to all platforms. Atithi shows, per platform, whether the nights are closed (research 01, §4; research 02, §3.5) |
| Automatic WhatsApp confirmations and check-in details | Rohan types them himself | Pre-approved WhatsApp templates go out on booking, the day before check-in and after checkout (research 01, §5) |
| A non-technical caretaker | Instructions go by phone call | Ramesh bhai gets a Hindi briefing on WhatsApp every morning. Later he gets a simple Hindi view with big buttons (research 02, §4.1; prototype) |
| Never opening each platform | Reading and writing both happen in the extranets | Reading never needs an extranet. A few writes still do (cancelling on MakeMyTrip, marking a Booking.com no-show), and Atithi deep-links straight to the right page for those (research 01, §8; research 02, §3.5) |

The last row matters for expectations. "Never open a platform" is reachable for reading. For some actions the platforms only accept the change in their own extranet, and Atithi cannot automate those because scraping or scripting extranets breaks platform terms (research 01, §8). Whether Beds24 can perform any of these writes (for example a cancellation) is unknown: **verify** in the trial.

## 3. Who uses it

| User | Who they are | Device and context | What they need from Atithi |
|---|---|---|---|
| **Owner** (Rohan) | Owns the property. Busy, often away from it. Comfortable with WhatsApp and booking apps. | His own phone, with Atithi installed as an app. Whether it is an iPhone or Android is an open question; it changes how push works (02-ux §9). | Know in 3 seconds whether anything needs him. Act on it in one tap. Trust that dates are blocked. |
| **Caretaker** (Ramesh bhai) | Lives on site. Receives guests, cleans, collects pay-at-property money. Not comfortable with technology. Reads Hindi. | A basic smartphone and a patchy network | Who leaves today, who arrives, what to clean or collect. One big button per thing. A way to call Rohan. |
| **Guest** | Booked on one of the platforms or directly | WhatsApp | A clear confirmation, check-in details the day before, and a simple way to say "yes, I'm coming" or "cancel" |

Guests never log in to Atithi. They only see WhatsApp messages and, later, an optional payment link or check-in form.

## 4. Jobs to be done

**Owner**

1. When I wake up, I want to see whether any booking needs me, so I can deal with it before it costs money.
2. When a pay-later booking arrives from MakeMyTrip, I want the guest checked without me phoning them, so a fake booking does not hold my weekend.
3. When a booking arrives on one platform, I want the nights closed on all the others, so I never double-book.
4. When a friend books directly on WhatsApp, I want to add the booking in a few taps and have it close the platforms, so I can take direct guests safely.
5. When a guest is due tomorrow, I want them to get the address, timings and Ramesh bhai's number automatically.
6. At the end of the month, I want to see what I earned by platform and how many fake bookings were caught.

**Caretaker**

1. In the morning, I want to know who is leaving, who is coming and what to clean, in Hindi.
2. When a guest arrives, I want to tap one button to say so, and know how much money to take.
3. When something is unclear, I want to call Rohan in one tap.

**Guest**

1. After booking, I want to know the host received my booking.
2. The day before, I want directions and the caretaker's number.
3. If my plans change, I want an easy way to say so.

## 5. Hero flow: the MakeMyTrip pay-later booking

This is the story the product is built around. The prototype's **Demo** button plays it.

### 5.1 Background

MakeMyTrip sells two different pay-later products, and the fake bookings could come from either (research 01, §3):

| Product | Who collects the money | What goes wrong for the host |
|---|---|---|
| **Pay at Hotel (PAH)** | The guest pays the property at check-in | No money changes hands before arrival, so nothing stops a guest from booking and not coming |
| **Book with Zero Payment** | MakeMyTrip charges the card later: two days before the free-cancellation deadline per the official page, or up to 72 hours before check-in per 2022 press coverage | Dates are held for days or weeks and may disappear close to arrival. Unpaid bookings are reported as auto-cancelled (**verify**) |

No public MakeMyTrip partner article documents a switch to turn PAH off. It seems to be set per property or rate plan by the market manager (BDM). The first action is for Rohan to ask his BDM to disable PAH or require a card guarantee (research 01, §3).

### 5.2 Before Atithi

Amit Joshi books the Main Villa for 4–5 Oct through MakeMyTrip, pay at property, ₹14,500. The night closes on every platform. He never replies to anything and never arrives. The night could have been sold. (prototype sample booking `b9`)

### 5.3 With Atithi

Rahul Verma books the Main Villa for 18–19 Oct, 5 guests, pay at property, ₹14,500 (prototype sample booking `b3`).

| When | What happens | Who acts |
|---|---|---|
| Booking made | The booking reaches Beds24, and Atithi gets a webhook about a minute later (research 01, §4). The forwarded MakeMyTrip email arrives too and is matched to the same booking, never duplicated. | System |
| Same minute | Status: **Not verified yet**. The night stays closed on Airbnb, Booking.com and Agoda. Unverified bookings keep their dates, because the platform still counts the room as sold (research 03, §C.4). | System |
| About 1 minute later | If the guest's phone number is known, a WhatsApp utility template goes out with the booking details and two buttons: **Haan, aa rahe hain** and **Cancel karna hai** (research 02, §5.2; research 03, §E.4). | System |
| Same minute | Rohan gets a push: "MakeMyTrip pay-at-property booking to verify". Today lists the booking under "Needs your attention". | Owner reads |
| Guest taps **Haan** | Status becomes **Confirmed** (the default, with no advance asked). The guest gets a thank-you. Ramesh bhai's list updates. | Guest |
| Guest taps **Cancel** | Atithi raises an urgent task with a deep link to cancel on MakeMyTrip. The night opens again on the other platforms only once the cancellation comes back from MakeMyTrip, or once Rohan confirms he cancelled it (research 03, §C.4 rule 3). | Guest, then owner |
| 12 hours, no reply | Automatic reminder (prototype rule "Verify pay-at-property bookings") | System |
| 24 hours with no reply, or 24 hours before check-in, whichever comes first | Status: **No reply in 24 hours · likely fake**, in the alert colour. Rohan gets a WhatsApp alert as well as a push. The row offers **Cancel and release dates** and **Call**. (prototype; research 02, §5.2; research 03, §E.1) | System, then owner |
| Owner taps **Cancel and release dates** | MakeMyTrip opens on the right booking. When the cancellation comes back through Beds24, the night reopens everywhere and the booking moves to **Cancelled**. The history keeps every message as evidence. | Owner |

The 12-hour reminder and 24-hour flag are settings, not constants. The prototype uses 12 and 24. Research 03 sketches a 6-hour reminder and an 18-hour deadline (§E.1). Pick defaults with Rohan in Phase 0.

### 5.4 The phone-number problem

The flow above assumes the guest's phone number is known. Often it is not:

- MakeMyTrip shows the guest's name, email and mobile number only **3 days before check-in**. Before that the host can only use the in-app Inbox chat (research 01, §2.4).
- Whether Beds24 passes the MakeMyTrip phone number earlier is unknown: **verify** in the trial.
- Whether the MakeMyTrip voucher email carries the phone number or a payment-mode line is unknown: **verify** with real vouchers (research 01, §3).

So verification has three ways in, tried in order:

1. Phone known at booking time: WhatsApp straight away.
2. Phone not known: a reconfirmation message through MakeMyTrip's Inbox. Rohan sends it from a deep link with the text prefilled, or Beds24 sends it if it supports MakeMyTrip messaging. Research 01 (§7) says the Beds24 API can send OTA messages but not for which channels: **verify**.
3. Phone appears later (at the latest 3 days out): WhatsApp at that moment. The prototype describes this: "the check then runs as soon as it appears".

The 24-hour clock starts when the first message reaches the guest, not when the booking arrives.

### 5.5 The advance payment is optional, and off for MakeMyTrip

Asking a PAH guest for an advance changes the terms the guest was sold and may breach MakeMyTrip's partner terms (research 01, §3). So:

- Default for MakeMyTrip bookings: Confirm / Cancel buttons only. A "yes" confirms the booking.
- The MakeMyTrip advance stays **off** until the BDM has said in writing that it is allowed. Even then it is worded as optional ("to guarantee your villa"), never as a condition (research 02, §4.3).
- Direct bookings can always ask for an advance through a Razorpay link (research 01, §6).
- Airbnb and Booking.com bookings **never** get a payment link. Off-platform payment is prohibited there (research 01, §6 and §8).

**Where the prototype differs.** The prototype demo shows the advance path for MakeMyTrip. Its Payments screen has "Also ask MakeMyTrip guests for the advance" switched on, and its WhatsApp copy makes the advance a condition ("Booking lock karne ke liye ₹3,000 advance pay karna hoga"). The demo shows what is possible; the shipped defaults follow this section. The prototype also releases the dates as soon as a guest taps Cancel. The real build waits until the cancellation is seen from MakeMyTrip, as in §5.3.

## 6. Requirements

Releases map to the roadmap: **MVP** = Phase 1, **v1** = Phase 2, **v2** = Phase 3 and later (05-roadmap). Every requirement has acceptance criteria that can be tested.

### 6.1 MVP

| ID | Requirement | Acceptance criteria |
|---|---|---|
| M1 | **All bookings in one place.** Bookings, changes and cancellations from all four platforms arrive through Beds24. | A test booking made on each platform appears in Atithi within 5 minutes. A date change updates the same booking, not a new one. A cancellation moves it to Cancelled. If a webhook is missed, the 30-minute `modifiedSince` poll picks the booking up (research 01, §9). |
| M2 | **No duplicates.** The same booking arriving by webhook, poll and email is stored once. | Replaying the same webhook or email twice leaves one booking. Uniqueness is on (channel, platform booking ID) (research 03, §C.5). |
| M3 | **One booking blocks the dates everywhere.** Direct bookings and manual blocks made in Atithi are written to Beds24, which closes the other platforms. | After a block is saved, Atithi shows the push time and, per platform, whether the nights are closed. If a platform still shows open 20 minutes later, Rohan gets an urgent alert with a deep link to that platform's calendar. The 20 minutes follows the prototype's "Updating" window; tune it in Phase 0. |
| M4 | **The database refuses double bookings it controls and raises an alarm about the ones it does not.** | Saving a direct booking or block over taken nights is refused with "Those nights are not free" and the clashing booking named. An OTA booking that overlaps an existing one is stored, marked as a conflict, and triggers a push and a WhatsApp alert to Rohan within 2 minutes (research 03, §C.5 and §C.6). |
| M5 | **Today screen.** Needs-attention first, then today's departures, arrivals and in-house guests, then the next two weeks. | With the prototype's sample data, the two MakeMyTrip bookings that need action are listed first, each with one primary button. With nothing to do, the screen says "Nothing needs you right now". |
| M6 | **Calendar.** A two-week timeline for both units and a month grid per unit. Tapping a date shows each unit's booking or block and lets Rohan block an open unit. | Unverified bookings are drawn dashed, likely-fake ones in the alert colour, blocks hatched (02-ux §6). Every bar has a text label for screen readers. |
| M7 | **MakeMyTrip pay-later verification**, as in §5. | A pay-at-property booking from MakeMyTrip starts as Not verified yet. A tap on the Confirm button confirms it with no owner action. No reply leads to a reminder and then the flag. The flag reaches Rohan on WhatsApp as well as push. No payment link is sent to a MakeMyTrip guest while the advance setting is off. |
| M8 | **WhatsApp automations (fixed recipes):** booking received; check-in details 1 day before at 9 AM; thank-you and review request 1 day after checkout at 11 AM; Hindi morning briefing for the caretaker at 8 AM (prototype rules `a1`, `a4`, `a5`, `a7`). | Each recipe can be switched on or off. If a required field such as the phone number is missing, nothing is sent and a task appears instead (research 03, §E.3). No guest message goes out between 9:30 PM and 8 AM (research 03, §E.2). Every scheduled send is listed under "Going out next" before it goes, and can be skipped. |
| M9 | **Owner alerts:** web push, plus WhatsApp for urgent ones (02-ux §8). | A double booking or a likely-fake booking reaches Rohan on WhatsApp even when push is off or the app is not installed. |
| M10 | **Email backup.** Forwarded OTA emails are parsed. Low-confidence results go to a review queue. | At least 95% of OTA emails are applied without review over a 4-week run (research 03, §I). A cancellation that only the LLM extracted never releases dates without Rohan's approval (research 03, §D.6). |
| M11 | **Direct bookings and blocks**, added from the Add button with guest name, WhatsApp number, unit, dates, total and advance. | Saving closes all four platforms and sends the WhatsApp confirmation. |
| M12 | **Booking history.** Every booking shows "What happened": arrival, messages, status changes, payments, and who did each. | Each status change records who made it: Rohan, Ramesh bhai, the guest, the platform or the system (research 03, §C.3). |
| M13 | **Platforms and sync health.** Per platform: how bookings arrive, last sync, problems, a link to the extranet, Sync now. | If Beds24 stops sending for 60 minutes, Rohan is told and the page shows the platform in the alert colour (research 03, §H.4). |
| M14 | **Guest contact capture.** | For Booking.com bookings, which arrive with no phone number, Rohan gets a task with a paste field and a link to Pulse or the extranet. Phone numbers in any common Indian format are stored as `+91…` and shown as `+91 98765 43210` (research 02, §4.4). |
| M15 | **Privacy basics.** | The first WhatsApp message to a guest links to a plain-language privacy notice and honours STOP. Phone numbers are masked in logs (research 03, §G.3 and §G.5). |

### 6.2 v1

| ID | Requirement | Acceptance criteria |
|---|---|---|
| V1 | **Advance payments by Razorpay Payment Link**, on Rohan's own Razorpay account | A direct booking can send a link. A paid link records a payment and confirms the booking within 1 minute of Razorpay's webhook. Links can never be created for Airbnb or Booking.com bookings: the server refuses (research 01, §6). MakeMyTrip advances are possible only once the advance setting is on. |
| V2 | **Caretaker view** in Hindi with big buttons (02-ux §7) | Ramesh bhai opens it from a link and a 4-digit PIN. He can mark "guest arrived", "guest left", "room cleaned" and "cash / UPI received" with the network off, and the marks sync when it returns. He never sees revenue beyond "₹ to collect". |
| V3 | **Two-way WhatsApp inbox** | Guest replies appear in Atithi. Rohan can reply in free text inside the 24-hour window and only with templates outside it (research 01, §5.2). |
| V4 | **Automation editor** (form-based: when, only if, then) and a template editor with Meta submission | Rohan can change send times and wording, preview against a real booking, and send a test to himself (research 02, §1.6). |
| V5 | **Reports** | Monthly: bookings by platform, occupancy, commission, cash collected by the caretaker, and pay-at-property bookings received, verified and cancelled as fake. A summary goes to Rohan on WhatsApp on the 1st (research 02, §1.8). |
| V6 | **Booking.com no-show reminder** | When a Booking.com guest is marked as not arrived, a task "Report no-show on Booking.com by [date]" appears with the 48-hour deadline (research 01, §2.2; research 02, §4.3). |
| V7 | **Hindi guest templates** and **more than one property** | A guest with an Indian number gets the Hindi variant if the property chooses it. A second property can be added without a developer. |

### 6.3 v2

| ID | Requirement | Acceptance criteria |
|---|---|---|
| X1 | **Multi-host SaaS** (Channex white-label, WhatsApp Embedded Signup, subscription billing) | 10 external hosts onboarded without developer help (research 03, §I) |
| X2 | **Direct-booking page** with Razorpay, and Google Vacation Rentals through the channel manager | A guest can book and pay a deposit on the page, and the nights close everywhere (research 01, §9) |
| X3 | **Web check-in form** (WhatsApp Flows) with ID upload | Only masked Aadhaar is accepted. ID images are deleted after the set number of days (research 03, §G.3). |
| X4 | **Dynamic pricing** | Out of scope until the core is stable (research 01, §9) |

## 7. Non-goals

- **No scraping or scripting of extranets.** No headless browsers and no automated logins to Airbnb, Booking.com, Agoda YCS or InGo-MMT. It breaks platform terms and puts the listings at risk (research 01, §8).
- **No unofficial WhatsApp clients** (Baileys, whatsapp-web.js, whatsmeow). They breach WhatsApp's terms and get numbers banned (research 01, §5.4).
- **No channel manager of our own.** Atithi rents one (research 01, §1).
- **No payment links for Airbnb or Booking.com bookings**, ever (research 01, §6).
- **No holding of guests' money.** Payments go to the host's own Razorpay account. Collecting for hosts would make us a payment aggregator under RBI rules (research 03, §F.2).
- **No full OTA inbox in the MVP.** Messages are WhatsApp-centred, with deep links into each platform's chat (research 02, §1.5).
- **No reading of SMS or other apps' notifications.** A PWA cannot do it, and Play policy blocks it for a native Android app too (research 03, §A.2 and §B.5).
- **No pricing or revenue management, accounting or GST invoicing** in MVP or v1.

## 8. Success measures

| Measure | Target | Source |
|---|---|---|
| Unnoticed double bookings | Zero over a 4-week live run | research 03, §I (Phase 1 exit) |
| OTA emails applied without review | At least 95% | research 03, §I |
| MakeMyTrip pay-at-hotel bookings resolved without a phone call | At least 50% | research 03, §I (Phase 2 exit) |
| Days a month Rohan opens an extranet just to read bookings | Zero | Client pain |
| Time from booking to "nights closed everywhere" | Measured per platform in Phase 0, then shown on the sync page | research 02, §3.5 |

## 9. Open questions for the client

| # | Question | Why it matters |
|---|---|---|
| 1 | How many units are there, and how is each listed on each platform (whole villa, separate rooms, or both)? | Decides the units and listings set-up (03-architecture §3.2) |
| 2 | Do you already use a channel manager? Which one, and does it connect MakeMyTrip? | If it already works with MakeMyTrip and has an API, it could replace Beds24 |
| 3 | Who is your MakeMyTrip BDM / market manager, and how do we reach them? | We need them to disable PAH or require a card guarantee, connect the property to Beds24, say in writing whether an advance may be asked of PAH guests, switch off Auto-Confirmation, and shorten the free-cancellation window (research 01, §3) |
| 4 | Can you share 2–3 of the fake bookings (voucher, email, screenshots)? Were they PAH or "Book with Zero Payment"? | Shows which product causes the problem and what the emails contain (research 01, §3) |
| 5 | Are you registered for GST? | MakeMyTrip asks for GST only if applicable, and Razorpay has a no-GST route for individuals (research 01, §2.4 and §6) |
| 6 | How many staff are there besides Ramesh bhai? Who receives guests, cleans and collects cash? | Decides who gets the caretaker view and briefings |
| 7 | Which phone does Ramesh bhai use? Does he prefer Hindi in Devanagari, Hinglish, or Marathi? | Language and device for the caretaker view (02-ux §7) |
| 8 | Do you use an iPhone or Android? | On iPhone, push works only once the app is installed (02-ux §9) |
| 9 | Which email address receives the platforms' booking emails? Is it Gmail? | Needed for the forwarding filter (04-integrations §4) |
| 10 | Will you take a new SIM for the business WhatsApp number, or must it stay your current number? | A dedicated number works with Meta's Cloud API directly at almost no cost. Keeping the same number needs a BSP with "coexistence" and a monthly fee (research 01, §5.3) |
| 11 | Do you have a Razorpay account, with PAN and bank account in the same name? | Needed for advance links (research 01, §6) |
| 12 | Is pay-at-property switched on for Booking.com? Is Property Collect switched on for Agoda? | Decides which bookings need verification and money tracking (research 01, §2.3) |
| 13 | What advance do you want for direct bookings? What are the check-in and checkout times? | The prototype assumes ₹3,000 (villa), ₹2,500 (cottage), 30% for direct bookings, 1 PM check-in and 11 AM checkout |
| 14 | Do you own a domain name? | Cloudflare Email Routing needs a domain on Cloudflare DNS (research 01, §7) |
| 15 | Do you keep guest ID copies or a police guest register (for example for foreign guests)? | Decides how long guest data is kept. Research 03 (§G.3) only says to check these obligations: **verify** |
| 16 | Are the running costs acceptable: about ₹4,000 + GST a month for the platform plus about €18–25 a month for Beds24? | See 05-roadmap §4 (research 01, §4; research 03, §A.6) |
