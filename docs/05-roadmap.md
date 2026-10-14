# 05 · Roadmap

Phases, effort, what Rohan sees after each phase, running costs, risks and the decisions along the way. Effort figures are in developer-weeks and come from research 03 (§I). Costs come from research 01 and research 03.

## 1. Summary

| Phase | Name | Effort (dev-weeks) | Rohan sees at the end |
|---|---|---|---|
| 0 | Verify | 2–3 | The prototype on his phone, and a written answer on whether Beds24 carries his MakeMyTrip bookings |
| 1 | MVP: one calendar, no fake holds | 11–15 (upper bound, see §2) | He stops opening four platforms to read bookings. Fake MakeMyTrip bookings are flagged within 24 hours. Guests get WhatsApp confirmations and check-in details automatically. |
| 2 | v1: run the day from the app | 6–8 | Ramesh bhai marks arrivals, cleaning and cash in Hindi. Direct guests pay advances by link. Monthly report on WhatsApp. |
| 3 | v2: more hosts | 6–8 (10–14 with a Channex adapter) | Only if Atithi becomes a product for other hosts |
| **Total** | | **25–34** (29–40 with Channex) | |

Add a **20% buffer** for OTA surprises: template changes, missing features, certification queues (research 03, §I).

Research 03 converts its 25–34 dev-weeks into about 6–8 calendar months for one developer, or 3.5–5 months for two (assuming a 1.6× speed-up, not 2×, because of coordination). The same total applies here because the work is re-ordered, not added (§2). Phases 0 and 1 together are 13–18 dev-weeks: roughly 3 to 4 months of one developer's time before the buffer.

## 2. Why the order differs from research 03

Research 03 builds Phase 1 on iCal and email and adds a channel-manager API in Phase 3. Research 01 recommends a channel manager (Beds24) from the start, because only an API closes the double-booking gap, especially for MakeMyTrip (research 01, §9; research 03, §D.5). This plan follows research 01 for the **order** and research 03 for the **sizes**:

- Research 03's Phase 1 is 7–9 dev-weeks.
- Research 03 sizes the channel-manager adapter at 4–6 dev-weeks, including mapping, availability push, booking webhooks and certification (§I, Phase 3).
- Pulling the adapter into Phase 1 gives **11–15 dev-weeks** as an upper bound.
- Two things should make it smaller: Beds24 needs no certification (we are its customer, not a connectivity partner), and the iCal import, reconciliation and echo-filtering work in research 03's Phase 1 becomes a fallback that is only built if Phase 0 fails. Research 03 does not size either saving, so keep the upper bound until Phase 0 is done (**verify**).
- Research 03's Phase 3 then keeps only its SaaS half (6–8 dev-weeks). A Channex adapter for multi-host use would be a second channel-manager adapter, which research 03 also sizes at 4–6 dev-weeks.

Research 01 (§9) sketches an MVP in "weeks 1–6". That is a scope outline, not an estimate. This plan uses research 03's sized figures.

## 3. Phases

### Phase 0: Verify (2–3 dev-weeks)

The Beds24 two-week trial runs inside this phase.

**Work**

- Beds24 trial and the 13-point verification list (04-integrations §3.3).
- Meeting with the MakeMyTrip BDM: PAH, Auto-Confirmation, free-cancellation window, the advance question in writing, connecting Beds24 (04-integrations §7.3).
- Collect 20 or more real emails per platform, including MakeMyTrip pay-at-hotel vouchers (research 03, §I).
- Send a WhatsApp Cloud API test template from Meta's test number (research 03, §I).
- Repository skeleton; core schema with units, listings, holds, the exclusion constraint and pgTAP tests; an installable PWA shell on free tiers (research 03, §I).
- Deploy the prototype and walk Rohan and Ramesh bhai through it. Ask the open questions in 01-product §9.

**Rohan sees:** the clickable prototype on his phone, and a one-page verification report: what Beds24 does with his MakeMyTrip listing, which guest details arrive from each platform, how long a block takes to close each platform, and a go / no-go on Beds24.

**Exit:** the verification list is answered and decision D0 is made (§6).

### Phase 1: MVP, one calendar and no fake holds (11–15 dev-weeks, upper bound)

**Work** (requirements M1–M15 in 01-product §6.1)

- Auth and roles (owner, caretaker).
- Beds24 adapter: webhooks, 30-minute safety poll, availability writes for blocks and direct bookings.
- Email backup: Cloudflare worker, four platform parsers, LLM fallback, review queue, DKIM checks.
- Today, Calendar, Bookings and booking detail; direct bookings and blocks; search.
- Conflicts and P1 alerts; "On every platform" status and Block now deep links.
- WhatsApp recipes: booking received, check-in details the day before, review request, caretaker's Hindi morning briefing.
- MakeMyTrip verification: Confirm / Cancel buttons, reminder, likely-fake flag, owner escalation. No payments yet.
- Web push and WhatsApp owner alerts; install guidance.
- Sync Health, Sentry, backups, the privacy notice.

**Rohan sees**

- One list of every booking from all four platforms. No extranet visits just to read.
- Any booking or block closes the nights everywhere, and he can see it did.
- MakeMyTrip pay-at-property guests are asked on WhatsApp whether they are coming. Silent ones are flagged within 24 hours with a one-tap path to cancel on MakeMyTrip.
- Guests get confirmations and check-in details without him typing anything.
- Ramesh bhai gets a Hindi WhatsApp briefing every morning.

**Exit** (research 03, §I): running on the real listings for 4 weeks with zero unnoticed conflicts, and at least 95% of OTA emails applied without review.

### Phase 2: v1, run the day from the app (6–8 dev-weeks)

**Work** (requirements V1–V7 in 01-product §6.2; research 03, §I)

- Razorpay links, the payments ledger and the advance flow (direct bookings; MakeMyTrip only if the BDM agrees).
- Caretaker module: Hindi view, tasks, turnover checklists, photos, offline marks.
- Two-way WhatsApp inbox.
- Form-based rule editor, template editor, Meta template submission.
- More than one property.
- Reports: occupancy, average daily rate, revenue and commission by platform; monthly WhatsApp summary.
- Hindi guest templates. Booking.com no-show task.

**Rohan sees:** Ramesh bhai's taps (room ready, guest arrived, ₹ collected) appear live on his phone. Direct guests pay an advance by link and are confirmed automatically. He can change message wording himself. A month-end summary arrives on WhatsApp.

**Exit** (research 03, §I): Rohan runs daily operations from the app, and at least 50% of MakeMyTrip pay-at-hotel bookings resolve without a phone call.

### Phase 3: v2, more hosts (6–8 dev-weeks; 10–14 with Channex)

Only if decision D5 (§6) is yes.

**Work** (research 03, §I): self-serve onboarding, tenant hardening, per-tenant credentials in Vault, WhatsApp Embedded Signup (each host connects their own number), subscription billing, an admin console, data-rights tooling, quotas, point-in-time recovery, load tests. Optionally a Channex white-label adapter (research 01, §4).

**Rohan sees:** nothing new for himself. Other hosts can sign up without a developer.

**Exit** (research 03, §I): 10 external hosts onboarded without developer help, with two-way sync in seconds including MakeMyTrip.

**Later, unscheduled:** a direct-booking page with Razorpay and Google Vacation Rentals through the channel manager; a WhatsApp Flows check-in form with ID upload; dynamic pricing (research 01, §9). A native app wrapper only if PWA limits are proven to hurt (research 03, §J).

## 4. Monthly running cost

Assumes 1 USD ≈ ₹88 (research 03, §A.6). Supabase and Vercel invoices to Indian addresses carry 18% GST.

### 4.1 One host (Amberwood Stays)

| Item | Per month | Source |
|---|---|---|
| Supabase Pro (Mumbai) | US$25 | research 03, §A.6 |
| Vercel Pro (one seat) | US$20 | research 03, §A.6 |
| Beds24 | About €18–25 | research 01, §4 |
| WhatsApp (Meta fees) | About ₹20–60; "well under ₹100" | research 03, §A.6; research 01, §5.1 |
| Claude (email fallback only) | Under US$1 | research 03, §A.6 |
| Cloudflare Email Routing | 0 | research 01, §7 |
| Sentry, uptime, heartbeat | Free tiers | research 03, §A.6 |
| Razorpay | 2% + GST on the fee, per payment received (about ₹118 per ₹5,000 advance); charged to Rohan's account | research 01, §6 |
| SIM recharge for the WhatsApp number | Not covered by the research (**verify**) | |
| Domain name (if Rohan has none) | Not covered by the research (**verify**) | |
| **Total** | **About US$45 (about ₹4,000 + GST) for the platform, plus €18–25 for Beds24** | research 03, §A.6; research 01, §4 |

A lean variant (Next.js on Coolify on an India-region VPS instead of Vercel) costs about US$32–37 plus Beds24, but someone has to run the server (research 03, §A.6).

During Phase 0 the platform costs about US$0 on free tiers. Vercel Hobby is fine for the prototype but not for commercial use (research 03, §A.5).

### 4.2 Fifty hosts (about 100 units, 1,000 bookings a month)

| Item | Per month | Source |
|---|---|---|
| Supabase Pro + Small compute | About US$30–40 | research 03, §A.6 |
| Vercel (2 seats + usage) | About US$40–60 | research 03, §A.6 |
| WhatsApp | About ₹1–2k, passed through to hosts | research 03, §A.6 |
| Claude | About US$5–15 | research 03, §A.6 |
| Cloudflare | 0, or US$5 for Workers Paid | research 03, §A.6 |
| Sentry Team | About US$26 | research 03, §A.6 |
| **Platform total without a channel manager** | **About US$110–150** | research 03, §A.6 |
| Channel manager, option A: Channex | US$130 + US$0.50 per unit, about US$180; platform total about **US$290–330**, i.e. US$2–7 per host | research 03, §A.6 |
| Channel manager, option B: each host keeps Beds24 | About €18–25 per host, paid by each host | research 01, §4 |

Research 01 (§4) says Channex is the right choice only if the product becomes a multi-host SaaS; at US$130 a month in platform fees alone it does not pay for one host.

## 5. Risks

| # | Risk | Likelihood / impact | Mitigation |
|---|---|---|---|
| 1 | Beds24 does not carry MakeMyTrip-branded bookings, or not with payment status | Unknown / high | Phase 0 verification (04-integrations §3.3). Fallback: an Indian channel manager with MakeMyTrip support and email parsing; last resort iCal for the other three and manual MakeMyTrip blocking, with the gap stated in the UI (research 01, §4 and §9) |
| 2 | The BDM will not disable PAH or answer the advance question | Medium / medium | Confirm / Cancel verification works without either. Flag silent guests in 24 hours. Mark no-shows promptly (research 01, §3) |
| 3 | Guest phone numbers missing (Booking.com since 28 Sep 2026, Agoda masked, Airbnb proxies, MakeMyTrip only 3 days out) | High / medium | Pre-arrival link through each platform's messaging, "copy the phone" tasks, assisted send, call tasks (04-integrations §2.6) |
| 4 | WhatsApp policy: opt-in, template rejection, re-categorisation to marketing, quality rating | Medium / high | Strictly transactional templates, opt-in at pre-arrival, STOP honoured, send caps, policy review before launch, a BSP as fallback (research 03, §J) |
| 5 | Rohan's number is banned | Low / severe | Dedicated SIM for automation; never unofficial clients (research 01, §5.4) |
| 6 | Push missed on iPhone (not installed, permission revoked, battery saver) | Medium / high | Install-first onboarding, Declarative Web Push, every urgent alert also on WhatsApp (research 03, §B.3) |
| 7 | Silent background failure (cron stalls, webhook stops, job dies) | Medium / high | Pro plan, heartbeat dead-man switch, dead-letter alerts, Sync Health page, idempotent jobs (research 03, §J) |
| 8 | OTA email templates change and parsers break | High / low (Beds24 is primary) | Versioned parsers with fixtures, LLM fallback with evidence checks, review queue, "parser failing for sender X" alert (research 03, §J) |
| 9 | Double booking during a platform's sync lag | Low with Beds24 / high | Database guard, conflict record and P1 alert, Block now deep links, per-platform status; advance-notice settings on slow platforms (research 03, §D.5) |
| 10 | Ramesh bhai does not use the app | Medium / medium | WhatsApp briefing first (works without the app); view tested with him before Phase 2 ends; Hindi or Hinglish chosen by him |
| 11 | Vendor and pricing drift: Meta repricing, the INR billing deadline (31 Dec 2026), Next.js churn and the 14 Oct 2026 security release | High / low | Pin versions, Renovate or Dependabot, move the WABA to INR billing, yearly cost review, adapters behind interfaces (research 03, §J; research 01, §5.1) |
| 12 | DPDP core obligations from 13 May 2027 | Certain / medium | Notice, retention, export and erasure tooling, one-year logs, breach runbook built in Phase 1 (research 03, §G.5) |
| 13 | Effort overrun | Medium / medium | 20% buffer; Phase 1 sized at the upper bound; scope held by the non-goals in 01-product §7 |
| 14 | A double booking slips through anyway and costs a host penalty | Low / high | The conflict screen shows both bookings and the penalty hint ("Host cancellations on Booking.com can carry charges") so Rohan picks the cheaper cancellation (research 02, §5.2) |

## 6. Decision points

| ID | When | Decision | Inputs | Default if no answer |
|---|---|---|---|---|
| **D0** | End of Phase 0 | Go with Beds24? | Verification items (a), (b), (c) in 04-integrations §3.3 | Go if (a) and (c) pass. If (b) fails, still go, and take payment mode from MakeMyTrip emails. If (a) or (c) fails, switch to the fallback in 04-integrations §8. |
| **D1** | After the BDM replies | Turn on the optional MakeMyTrip advance? | The BDM's written answer | Off |
| **D2** | Phase 0 | Dedicated SIM with the Cloud API, or one number through a BSP with coexistence? | Rohan's preference; BSP fee (research 01, §5.3) | Dedicated SIM |
| **D3** | Phase 0, confirmed in Phase 2 | Caretaker language: Hindi (Devanagari), Hinglish or Marathi | Test with Ramesh bhai (research 02, §4.1) | Hindi, as in the prototype |
| **D4** | End of Phase 1 (after the 4-week live run) | Start Phase 2? | Phase 1 exit criteria | Start |
| **D5** | End of Phase 2 | Turn Atithi into a multi-host product? | Interest from other hosts; Channex at US$130 a month versus each host on Beds24 (research 01, §4) | Stay single-host |
| **D6** | Any time after Phase 1 | Try a cheaper model for the email fallback? | Accuracy on the fixture set (research 03, §D.6) | Stay on `claude-opus-5-5` |
| **D7** | If iPhone push or offline proves unreliable | Wrap the PWA as a native app? | Evidence of missed alerts (research 03, §A.2 and §J) | No |
| **D8** | If Rohan refuses any channel manager | Run on iCal and email only? | Rohan's choice | Not recommended: a gap of about 3 hours on Airbnb and manual blocking for MakeMyTrip, stated plainly in the app (research 01, §9; research 03, §D.5) |
