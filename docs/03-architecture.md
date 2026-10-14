# 03 · Architecture

How Atithi is built. Written for the one or two developers who will build it. The detailed design behind most of this is research 03; this document fixes the choices and adapts them to the decision to use Beds24 as the channel manager from the start (research 01, §4 and §9).

## 1. System overview

### 1.1 In one paragraph

The four platforms talk only to Beds24, the rented channel manager. Beds24 keeps availability in step across them and tells Atithi about every booking, change and cancellation by webhook. Atithi stores those bookings in its own Postgres database (Supabase, Mumbai), runs the automations (WhatsApp messages, reminders, alerts), and shows everything in a PWA for Rohan and a simple view for Ramesh bhai. When Rohan adds a direct booking or blocks dates, Atithi writes the block to Beds24, which closes the nights on all four platforms. Forwarded booking emails arrive through Cloudflare as a second, independent source. WhatsApp messages go out and come back through Meta's Cloud API. Advance payments, where allowed, go through Razorpay Payment Links on Rohan's own account.

### 1.2 Diagram in words

```
Airbnb, Booking.com, Agoda, MakeMyTrip/Goibibo
        |  (official channel-manager connections)
        v
     Beds24  --webhook (new / modified / cancelled / message)-->  Atithi API (Vercel, bom1)
        ^    <--availability writes (blocks, direct bookings)---       |
        |    <--poll modifiedSince every ~30 min (safety net)---       |
                                                                        v
OTA emails -> Gmail filter -> Cloudflare Email Routing -> Email Worker -> Atithi API
                                                                        |
                                                   Supabase Postgres (Mumbai)
                                    bookings, holds, ledger, messages, rules, audit
                                    pg_cron minute tick, pgmq queues (outbox)
                                                                        |
                                                          Worker route drains queues
                                         |                     |                    |
                                  WhatsApp Cloud API      Web push (VAPID)     Razorpay API
                                  (guests, caretaker,     (owner's phone)      (payment links)
                                   owner alerts)
                                         |                                          |
                              replies and statuses by webhook        payment events by webhook
                                         \________________ Atithi API ______________/

Owner PWA and caretaker view  <-- reads (RLS-scoped) and Realtime updates --  Supabase
```

### 1.3 Ground rules

1. **Atithi is not a channel manager.** It is a dashboard and automation layer on top of one (research 01, §1).
2. **Postgres is the source of truth for what Atithi shows and does.** Beds24 is the source of truth for what the platforms are told.
3. **Adapters never write to the database.** They produce normalised events, and one transactional function applies them (research 03, §D.1).
4. **Every external side effect happens in a worker,** after the database transaction that caused it has committed (research 03, §D.7).
5. **Nothing fails silently.** Overlaps are recorded and alerted, failed jobs go to a dead-letter queue, and a heartbeat watches the scheduler (research 03, §C.6 and §H.4).

## 2. Stack

From research 03 (§A.1), unchanged in substance:

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (16.4) with React 19 and the App Router | Server Components and Server Actions cut API boilerplate. Route Handlers cover webhooks and the worker. Largest hiring pool in India. |
| Language and validation | **TypeScript** (strict) and **Zod** | One set of schemas for forms, Server Actions, webhook payloads, LLM output and adapter contracts |
| UI | **Tailwind CSS v4** and **shadcn/ui** (Radix primitives), lucide icons, a custom calendar | Components live in the repo, so they can be restyled to "Paper" (02-ux §6). Strip shadcn's default cards, shadows and badges. |
| Client data | Server Components for reads. TanStack Query only for the live calendar and inbox, refreshed by Supabase Realtime. | Keeps JavaScript small on low-end Android phones |
| PWA | **Serwist** via `@serwist/turbopack` | Turbopack is the default bundler in Next 16, and `@serwist/next` works only with webpack (research 03, §A.1 and §B.1) |
| Database, auth, storage | **Supabase Pro, Mumbai (ap-south-1)**: Postgres 17, Auth, RLS, Realtime, Storage, Vault | Real Postgres features are needed: exclusion constraints, triggers, row-level security |
| Jobs | **Supabase Cron (pg_cron)** and **Supabase Queues (pgmq)**, drained by a Next.js worker route | No extra vendor. Jobs are enqueued in the same transaction as the change that causes them. Inngest is the escape hatch (research 03, §A.4). |
| Hosting | **Vercel Pro**, functions pinned to `bom1` (Mumbai) | Zero ops and next to the database (research 03, §A.5) |
| Inbound email | **Cloudflare Email Routing** and an Email Worker | Free. We keep the raw email and can check the OTA's DKIM signature (research 01, §7) |
| Channel manager | **Beds24** API v2 and webhooks | Cheapest option that connects MakeMyTrip and has a developer API (research 01, §4) |
| WhatsApp | **Meta WhatsApp Cloud API**, direct, on a dedicated number | No BSP fee (research 01, §5.3) |
| Payments | **Razorpay Payment Links** on the host's own account | Money never passes through us (research 03, §F.2) |
| LLM | **Claude `claude-opus-5-5`** with structured outputs, as a fallback email extractor only | Copes with OTA email template changes; output constrained to a schema (research 03, §D.6) |
| Observability | Sentry, pino JSON logs, an in-app Sync Health page, healthchecks.io dead-man switch | A silent sync failure is the biggest business risk (research 03, §A.1) |

**Version notes** (research 03, §A.1):

- Next.js announced an out-of-band security release for **14 Oct 2026**. Pin exact versions, turn on Renovate or Dependabot, and patch that week.
- From **30 Oct 2026**, new `public` tables in Supabase are not exposed to the Data API by default. Add explicit `GRANT`s for anything the browser reads.
- pgmq 1.5.1 changed how `delay` works on new PG17 projects. Do not build scheduling on pgmq delays (§6.3).

**Rejected:** Firebase (no relational constraints), Convex (no SQL or exclusion constraints, regions far from India, verify), Neon plus separate pieces (too many moving parts for one or two people), Hetzner (no India region) (research 03, §A.3 and §A.5).

## 3. Data model

### 3.1 Tables by area

From research 03 (§C.1), with Beds24 added:

| Area | Tables |
|---|---|
| Tenancy and identity | `organizations`, `auth.users`, `memberships` (role `owner` / `manager` / `caretaker`, optional property scope), `invitations` |
| Inventory | `properties`, `units`, `listings`, `listing_units`, `availability_blocks`, `inventory_holds` |
| Channels | `channel_connections` (mode `api` / `email` / `ical` / `manual`, provider `beds24`), `channel_listing_mappings` (Beds24 room ID, extranet deep link), `email_ingests`, `ical_feed_events` (fallback only), `sync_runs`, `booking_conflicts` |
| Reservations | `bookings`, `booking_status_history`, `guests` |
| Money | `payments` (append-only ledger), `payment_links` |
| Messaging | `message_templates`, `message_threads`, `messages` |
| Automation | `automation_rules`, `scheduled_triggers`, `automation_runs` |
| Operations | `tasks`, `notifications`, `push_subscriptions`, `webhook_events`, `audit_log`, `feature_flags` |

Every tenant table carries `org_id`. Amounts are stored in paise as `bigint`. Dates of stay are `date`, never timestamps.

### 3.2 Units are not listings

A **unit** is the physical thing that can be occupied: a room, or the whole villa if it cannot be split. A **listing** is what a platform sells. A listing covers one or more units through `listing_units` (research 03, §C.2).

Example: if the Main Villa is sold whole on Airbnb but its rooms are sold separately on MakeMyTrip, the units are the rooms. The Airbnb listing covers all of them, and each MakeMyTrip listing covers one. A booking creates one hold per unit it covers, so selling the whole villa blocks every room and selling any room blocks the whole villa, with no special-case code.

For Amberwood Stays today the prototype assumes two units, each sold as one listing per platform. How Rohan actually lists them is open question 1 in 01-product §9.

### 3.3 Bookings and statuses

`bookings` holds: org, property, listing, channel (`airbnb`, `booking_com`, `agoda`, `mmt`, `direct`), source (`api`, `email`, `ical`, `manual`), the platform's booking ID, status, payment status, check-in, check-out, a generated `stay daterange` (`[)`), guest, guest counts, money snapshot (gross, commission, collected by the platform, due at property), verification deadline, risk flags, confidence and a version number (research 03, §C.3).

Two MakeMyTrip-specific fields are added: `ota_payment_mode` (PAH, zero payment, prepaid, unknown) and `ota_payment_state` (pending, processed), because MakeMyTrip reports payment status as "pending" or "processed" (research 01, §2.4). Whether Beds24 passes these through is a Phase 0 check (**verify**).

**Status values.** The prototype's names are used in the database so code, UI and conversations share one vocabulary. They map onto research 03's state machine as follows:

| Atithi status | Research 03 equivalent | Holds the nights? | Entered by |
|---|---|---|---|
| `tentative` | `tentative` | Yes | iCal event with no details yet (fallback mode only) |
| `unverified` | `pending_verification` | Yes | Verification rule on a pay-at-property booking |
| `verified` | `pending_verification`, guest confirmed, advance unpaid | Yes | Guest tapped Confirm while an advance is requested |
| `flagged` | `pending_verification` plus risk flag `unverified` | Yes | Verification deadline passed with no reply |
| `confirmed` | `confirmed` | Yes | Prepaid booking, guest confirmed, advance paid, or owner |
| `in_house` | `checked_in` | Yes | Caretaker or owner |
| `checked_out` | `checked_out` | Past nights | Caretaker or owner (suggested at checkout time) |
| `cancelled` | `cancelled` | No | Observed platform cancellation, or owner for direct bookings |
| `no_show` | `no_show` | No | Owner, after the check-in date |

Research 03 (§C.4 rule 6) makes failed verification a flag rather than a status so the dates stay blocked and the owner decides. `flagged` keeps both properties: it holds the nights, and only Rohan's action or an observed cancellation moves it on. It is a status because the owner reads it as one.

**Transition rules** (research 03, §C.4):

1. Unverified, verified and flagged bookings keep their nights. The platform still counts the room as sold.
2. For platform bookings, holds are released only by an **observed** cancellation (webhook, poll or email) or by Rohan confirming "I cancelled it on the extranet". A guest tapping Cancel creates a task; it does not release anything.
3. Date changes are modifications, not status changes: bump `version` and re-place the holds in the same transaction.
4. Allowed transitions live in a `private.allowed_transitions` table, enforced by a `BEFORE UPDATE` trigger and mirrored in TypeScript so the UI only offers valid actions. The trigger writes `booking_status_history` with the actor (user, system, channel, guest) and enqueues `booking.status_changed`.

**Payment status** is a separate machine: a cached projection of the payments ledger, never set by hand (research 03, §C.4):

```
unknown -> prepaid_ota
unknown -> pay_at_property -> advance_requested -> partially_paid -> paid
pay_at_property -> paid                (cash or UPI at check-in)
any paid state -> refund_pending -> refunded
```

Keeping lifecycle and money apart avoids states like "confirmed, partly paid, refund pending" and keeps automation conditions simple.

### 3.4 Inventory holds and the exclusion constraint

```sql
create extension if not exists btree_gist;

create table public.inventory_holds (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  unit_id uuid not null references public.units(id),
  booking_id uuid references public.bookings(id) on delete cascade,
  block_id uuid references public.availability_blocks(id) on delete cascade,
  period daterange not null,
  state text not null default 'active'
    check (state in ('active','released','conflicted')),
  origin_channel public.channel_kind,
  constraint one_owner check (num_nonnulls(booking_id, block_id) = 1),
  constraint no_double_booking
    exclude using gist (unit_id with =, period with &&) where (state = 'active')
);
```

(research 03, §C.3)

- One hold per unit per booking or block.
- `period` is half-open, `[check_in, check_out)`. A guest leaving on the 12th and the next arriving on the 12th do not overlap. A turnover buffer, if set, extends the period (research 03, §C.5).
- Cancelled and no-show bookings have no active holds: their holds are released, so the constraint ignores them.
- `btree_gist` lets the GiST index use `=` on a UUID.

### 3.5 Other tables in brief

| Table | Key points |
|---|---|
| `availability_blocks` | Owner blocks, maintenance and platform blocks, with reason and origin channel. Each creates holds like a booking. |
| `booking_conflicts` | One row per overlap found on an OTA-sourced booking: unit, booking, the hold it collided with, status (open, resolved, dismissed), resolution and who resolved it |
| `payments` | Append-only ledger. Kinds: advance, balance, refund (negative), OTA payout, adjustment. Methods: Razorpay, UPI direct, cash, bank, OTA. `provider_payment_id` is unique. |
| `payment_links` | Razorpay link ID, short URL, amount, expiry, status, unique idempotency key |
| `guests` | Name, phone (E.164), email, country, WhatsApp opt-out time, `purge_after` date for retention |
| `message_templates` | Our key, language, Meta template name, category, approval status, parameter mapping (for example `guest.first_name`, `stay.check_in|date:d MMM`), buttons |
| `message_threads` | One per phone number. `last_inbound_at` drives the 24-hour window. `active_booking_id` links replies to the right booking. |
| `messages` | Direction, template, rendered parameters (kept for audit), body, WhatsApp message ID (unique), status (queued, sent, delivered, read, failed), idempotency key |
| `automation_rules` | Trigger, conditions and actions as JSON, with a version number |
| `scheduled_triggers` | Event, booking, rule, `run_at`, status, unique `dedupe_key` |
| `automation_runs` | One row per action executed, with a unique idempotency key, attempts and last error |
| `tasks` | Turnover, check-in prep, call guest, block on OTA, review email, copy phone. `client_op_id` makes offline replays idempotent. |
| `webhook_events` | Every inbound webhook, unique on (provider, event ID), so duplicates are dropped |
| `audit_log` | Written by triggers on bookings, payments, memberships, channel connections and rules, plus logins, secret reads and exports |

The booking screen's "What happened" list is built from `booking_status_history`, `messages`, `payments` and `sync_runs`.

## 4. The double-booking rule

### 4.1 One transactional entry point per listing

Every booking write, whatever its source, goes through one PL/pgSQL function, `private.ingest_reservation(jsonb)` (research 03, §C.5). In one transaction it:

1. Takes `pg_advisory_xact_lock(hashtextextended(listing_id::text, 0))`, so the Beds24 webhook handler, the email worker and the poller cannot race on the same listing.
2. Upserts the booking on `(org_id, channel, external_booking_id)`, so the same booking from webhook, poll and email lands once.
3. Calls `private.place_holds(booking_id, strict)`, which deletes the booking's old holds and inserts new ones per unit.
4. Enqueues the domain events (`booking.created`, `booking.updated`, `booking.conflict_detected`) with `pgmq.send()`.

If the transaction rolls back, nothing was queued.

### 4.2 Two conflict modes

| Mode | Used for | On overlap |
|---|---|---|
| **Strict** | Direct bookings and blocks made in Atithi | Raise SQLSTATE `23P01`. The form says "Those nights are not free" and names the clashing booking. Nothing is saved. |
| **Record** | Bookings from a platform | The booking already exists in the real world, so store it, mark its hold `conflicted`, open a `booking_conflicts` row and raise a P1 alert by push and WhatsApp, with a banner on Today |

Rejecting an OTA booking would hide the most urgent fact in the business (research 03, §C.6).

### 4.3 Resolving a conflict

The conflict screen offers (research 03, §C.6):

- **Merge**: the same reservation that matching missed. Suggested automatically when channel and dates are identical.
- **Cancel on platform X**: deep link to that extranet. The hold is released only once the cancellation is observed.
- **Relocate the guest**: record the alternative arrangement.
- **Dismiss** as a false positive.

### 4.4 Where Beds24 fits

Beds24 already stops most overbookings by pushing availability to every connected platform. Atithi's guard covers the writes Atithi makes (direct bookings and blocks) and catches anything that slips through the platforms' own lag.

There is one race to handle. Rohan saves a direct booking that Atithi's database says is free, but an OTA booking for the same nights reached Beds24 a moment earlier and its webhook has not arrived. So the direct-booking flow is:

1. Strict insert in Atithi. Refuse on overlap.
2. In the same transaction, enqueue a `cm.push` job.
3. The worker re-reads Beds24 availability for those nights, then writes the block.
4. If Beds24 shows the nights taken, Atithi records a conflict and alerts Rohan before the guest is confirmed.

Whether a direct booking should be written to Beds24 as a calendar block (`/inventory/rooms/calendar`, research 01, §4) or as a Beds24 booking is a Phase 0 decision (**verify**).

## 5. Sync engine

### 5.1 Adapter interface

From research 03 (§D.1), abridged:

```ts
export interface ChannelAdapter {
  readonly id: "beds24" | "email" | "ical" | "manual";
  readonly capabilities: {
    pullReservations: boolean;
    webhooks: boolean;
    pushAvailability: boolean;
    guestContact: boolean;
  };
  pull?(ctx: SyncContext, m: Mapping):
    Promise<{ events: NormalizedEvent[]; unchanged: boolean; cursor?: string }>;
  parseWebhook?(req: RawInbound): Promise<NormalizedEvent[]>;   // verifies authenticity first
  pushAvailability?(ctx: SyncContext, m: Mapping, deltas: AvailabilityDelta[]): Promise<PushResult>;
  acknowledge?(ctx: SyncContext, ids: string[]): Promise<void>;
}
```

`NormalizedEvent` is one of `reservation.upsert`, `reservation.cancel`, `block.upsert` or `block.remove`, carrying channel, listing reference, platform booking ID, dates (`[)`), optional guest and payment details, a confidence score and evidence. A single `reconcile()` sends every event to `ingest_reservation`.

### 5.2 Adapters

| Adapter | Role | pull | parseWebhook | pushAvailability |
|---|---|---|---|---|
| **beds24** | Primary for all four platforms | `modifiedSince` poll about every 30 minutes as a safety net (research 01, §9) | Booking webhooks (new, modified, cancelled, OTA message), about 1 minute after the event (research 01, §4) | Calendar writes for blocks and direct bookings (`/inventory/rooms/calendar`) |
| **email** | Backup and enrichment (MakeMyTrip voucher details) | No | Signed POST from the Cloudflare Email Worker | No |
| **ical** | Fallback only, if Beds24 fails Phase 0 | Every 10 minutes per feed, with jitter and backoff (research 03, §D.2) | No | Our outbound feed, pulled by the platforms |
| **manual** | Direct bookings and blocks from the app | No | No | Through beds24 |

**Source precedence:** API (Beds24) over email over iCal over manual edits of platform fields. iCal can create placeholders and correct dates but never overwrites guest data (research 03, §D.1).

### 5.3 Beds24 specifics

- **Auth:** API v2 uses an invite code exchanged for a token (research 01, §4). Store the token in Supabase Vault.
- **Rate limit:** 100 credits per 5 minutes (research 01, §4). Budget calls: webhooks first, polls rare, re-fetches batched.
- **Webhook authenticity:** research does not say how Beds24 signs webhooks (**verify**). Until known, use an unguessable per-connection URL and treat each webhook as a hint: re-fetch the booking from API v2 by ID before ingesting it.
- **Idempotency:** `webhook_events` is unique on (provider, event ID), and bookings are unique on (channel, platform booking ID). The same webhook twice, or a webhook plus the poll, yields one booking.
- **Per-platform status:** whether Beds24 exposes per-channel push results is unknown (**verify**). If it does, "On every platform" shows each one. If not, it shows "Pushed to channel manager at 12:41 PM" and flags any platform that a later booking or email shows as still open.

### 5.4 Outbox, queues and the worker

From research 03 (§D.7):

- **Queues:** `events` (domain events for the automation engine), `jobs` (`email.parse`, `wa.send`, `push.send`, `paylink.create`, `cm.push`, `cm.poll`, `ical.pull`) and `dlq` (dead letters).
- **Worker:** `/api/worker/drain` (Node runtime, 60-second limit) reads up to 20 messages with a 120-second visibility timeout and runs 4 at a time. On success it deletes the message. On a retryable failure it delays it by `min(30 × 2^attempts, 3600)` seconds plus jitter. After 6 attempts, or on a non-retryable error, it moves the message to `dlq` and raises an alert.
- **Claim, call, record:** every side effect first inserts its intent row (unique idempotency key such as `wa:booking_confirmation:{booking_id}:v{n}`), then calls the provider, then stores the provider's ID. Razorpay retries can be reconciled by `reference_id`. WhatsApp has no lookup, so a rare duplicate message is accepted.
- **Inbound webhooks** are acknowledged with 200 at once and processed from the queue.

### 5.5 The minute tick

A pg_cron job runs every minute (research 03, §D.7). It:

1. Moves due `scheduled_triggers` rows into the `events` queue.
2. Enqueues due polls (Beds24 safety poll; iCal only in fallback mode).
3. Wakes the worker through `pg_net` only when a queue has visible work. The worker URL and token come from Vault.
4. Writes a heartbeat row. A separate 5-minute job pings healthchecks.io, which alerts if the heartbeat is older than 5 minutes.

## 6. Automation engine

### 6.1 Trigger, conditions, actions

From research 03 (§E.1):

- **Triggers (events):** `booking.created`, `booking.updated`, `booking.status_changed`, `booking.cancelled`, `booking.conflict_detected`, `payment.received`, `payment_link.expired`, `message.received`, `guest.confirmed`, `guest.requested_cancel`, `email.needs_review`, the time-based `stay.pre_arrival`, `stay.checkin_day`, `stay.checkout_day`, `stay.post_checkout`, and `verification.reminder`, `verification.deadline`, `caretaker.digest`.
- **Facts:** a snapshot of the booking, guest, property, payments and channel (`booking.channel`, `booking.payment_status`, `booking.nights`, `guest.phone`, `now.local_hour`).
- **Operators:** `eq`, `neq`, `in`, `exists`, `gt`, `lt`, `between`, combined with `all`, `any`, `not`.
- **Actions:** `send_whatsapp` (guest, caretaker or owner), `notify_owner` (push, in-app, WhatsApp), `create_task`, `set_status`, `add_risk_flag`, `create_payment_link`, `schedule`, `cancel_scheduled`.

The MakeMyTrip verification rule, with the advance removed by default (01-product §5.5):

```json
{
  "name": "Verify pay-at-property bookings",
  "trigger": { "event": "booking.created" },
  "conditions": { "all": [
    { "fact": "booking.payment_status", "op": "eq", "value": "pay_at_property" },
    { "fact": "booking.channel", "op": "in", "value": ["mmt", "direct"] } ] },
  "actions": [
    { "type": "set_status", "status": "unverified" },
    { "type": "send_whatsapp", "to": "guest", "template": "booking_verify_v1" },
    { "type": "schedule", "event": "verification.reminder", "at": "first_contact+PT12H" },
    { "type": "schedule", "event": "verification.deadline",
      "at": "min(first_contact+PT24H, stay.check_in_at-PT24H)" }
  ]
}
```

If the guest phone is missing, `send_whatsapp` creates a task and the deadline waits for first contact (01-product §5.4). `create_payment_link` is added to this rule only when the property's MakeMyTrip advance setting is on.

**Hard guard in code, not only in rules:** `create_payment_link` refuses any booking whose channel is `airbnb` or `booking_com`, whatever a rule says (research 01, §6).

### 6.2 How it runs

1. A TypeScript worker consumes the `events` queue.
2. It loads the enabled rules for the organisation and property (cached per rule version).
3. It builds the fact snapshot and evaluates the conditions.
4. For each action it inserts an `automation_runs` row keyed `${rule.id}:${rule.version}:${event.id}:${actionIndex}`, so reruns are safe.
5. It performs the action, usually by enqueueing a job such as `wa.send`.

Safety rules (research 03, §E.1 and §E.2):

- **Conditions are checked again when a scheduled event fires.** A reminder skips itself if the guest has already confirmed.
- **Chains are capped** at depth 5.
- **Each organisation has a WhatsApp budget** of 30 messages an hour, as a circuit breaker.
- **Quiet hours for guests:** nothing between 9:30 PM and 8 AM; deferred to the morning.
- **Late bookings:** a trigger whose time has passed fires at once if still relevant (for example pre-arrival for a same-day booking), otherwise it is skipped.
- **Missing variables:** if a template needs a value that is missing, nothing is sent and a task explains why (research 03, §E.3).

### 6.3 Time-based triggers

`private.schedule_stay_triggers(booking_id)` runs whenever a booking or rule changes. It cancels the booking's pending triggers and inserts fresh ones, keyed by `dedupe_key` (research 03, §E.2). Times follow the prototype's rules:

| Trigger | When (property time) | Prototype rule |
|---|---|---|
| `stay.pre_arrival` | Check-in minus 1 day, 9:00 AM | Send check-in details the day before |
| `stay.post_checkout` | Checkout plus 1 day, 11:00 AM | Thank-you and review request |
| `caretaker.digest` | Every day, 8:00 AM | Morning briefing for Ramesh bhai |
| `verification.reminder` | First contact plus 12 hours | Verify pay-at-property bookings |
| `verification.deadline` | First contact plus 24 hours, or check-in minus 24 hours if sooner | Verify pay-at-property bookings |

Research 03 uses 10:00 AM for pre-arrival and 7:00 AM for the caretaker digest. These are settings.

A table plus the minute tick is used instead of pgmq delays because the schedule is visible ("Going out next"), easy to cancel when dates change, fine for weeks or months ahead, and immune to pgmq's delay changes.

### 6.4 Signed buttons and replies

Each quick-reply button carries a signed payload: `v1|CONFIRM|<booking_id>|<hmac8>` (research 03, §E.4). The reply arrives as `button.payload` (template) or `interactive.button_reply.id` (interactive message). After the HMAC is checked, the command needs no conversation state:

| Command | Effect |
|---|---|
| `CONFIRM` | Emits `guest.confirmed`. With no advance required, the booking becomes `confirmed`. With an advance required, it becomes `verified` and the payment nudge follows. |
| `CANCEL` | Emits `guest.requested_cancel`: an urgent task and an owner alert with the extranet link. For platform bookings the nights stay held until the cancellation is observed. For direct bookings the booking is cancelled and the nights released. |
| `PAY` | Re-sends the payment link (only where links are allowed) |

Free text is linked to the thread's active booking and Rohan is notified. Words like "haan", "yes", "confirm" or "cancel" prompt a confirmation question. `STOP` sets the guest's opt-out time, always honoured.

### 6.5 Recipes in MVP

The prototype's eight automations become fixed recipes:

| Prototype rule | MVP form |
|---|---|
| a1 Welcome every new booking on WhatsApp | Recipe, on |
| a2 Verify pay-at-property bookings | Recipe, on, advance off for MakeMyTrip |
| a3 Block the dates on every other platform | Not a rule: this is the sync engine. Shown as "built in". |
| a4 Send check-in details the day before | Recipe, on |
| a5 Morning briefing for Ramesh bhai | Recipe, on |
| a6 Mark confirmed when the advance arrives | Recipe, v1 (with payments) |
| a7 Thank-you and review request | Recipe, on. The template may be billed as marketing (04-integrations §5.3). |
| a8 Guest cancels, release the dates everywhere | Changed: guest Cancel creates a task for platform bookings; release follows the observed cancellation (§3.3) |

The form-based editor arrives in v1. It stays a form (trigger, conditions, actions), not a node-graph editor (research 03, §E.1).

## 7. Security and DPDP basics

### 7.1 Access control

From research 03 (§G.1):

- Every tenant table has `org_id`, row-level security, and explicit grants to API roles.
- Policies use a set-returning helper, `private.my_org_ids(roles)`, so the membership lookup runs once per query.
- **Caretakers have no direct access** to bookings, payments or guests. They call `api.caretaker_agenda(date)`, a security-definer function that returns only the unit, the guest's first name and masked phone, arrival time, guest count and their tasks.
- Write functions exposed to users are `SECURITY DEFINER`, `search_path = ''`, not executable by `public` or `anon`, and check membership first.
- The service-role key is used only in workers and webhook handlers. User actions use the user's own client so RLS applies.
- Realtime uses private Broadcast channels per organisation, authorised by RLS.

### 7.2 Sign-in

- **Owner:** email magic link or Google. Indian SMS OTP needs DLT template registration, so it is deferred (research 03, §G.1).
- **Caretaker:** an invite link sent on WhatsApp creates a caretaker membership scoped to one property and a long-lived session on his phone. A 4-digit PIN reopens the view (research 02, §5.1). The PIN is a lock on a shared phone, not the main credential: limit attempts and let Rohan revoke the session.
- Server code verifies the JWT with `supabase.auth.getClaims()` and never authorises from `user_metadata`.

### 7.3 Secrets and webhooks

- **Platform secrets** (Supabase secret key, Meta app secret, VAPID private key, Anthropic key, email-worker HMAC key) live in Vercel encrypted environment variables, read only by server-only modules (research 03, §F.3).
- **Host secrets** (Beds24 token, WhatsApp token and phone-number ID, Razorpay keys and webhook secret, any iCal URLs) live in Supabase Vault. Only `private.get_connection_secret()` decrypts them, and every read is logged.
- **Webhook checks on the raw body:** Meta `X-Hub-Signature-256`, Razorpay `X-Razorpay-Signature`, and our email worker's HMAC with a timestamp and a 5-minute replay window (research 03, §G.2). Beds24: see §5.3.
- **Per-connection webhook URLs** so the handler can pick the right secret before checking the signature.
- **Rate limits** on login, inbound email, "Sync now", message sending and `/ical/*` (Vercel Firewall plus a token bucket in Postgres).
- **SSRF guard** on every iCal fetch (fallback mode).

### 7.4 Personal data

From research 03 (§G.3 to §G.5). Engineering view, not legal advice.

- **Collect** only name, phone, email and guest counts. ID documents only if a web check-in form is added later: private bucket, signed URLs valid for at most 5 minutes, masked Aadhaar only, deleted after a set number of days.
- **Mask** phone numbers in the caretaker view and in logs (pino redaction). No personal data in push payloads, iCal feeds, URLs or analytics.
- **Retention:** guest personal data purged 18 months after checkout (a setting; check tax and police guest-register obligations, **verify**). Raw emails deleted 90 days after a successful parse.
- **Backups:** Supabase Pro daily backups kept 7 days, plus a nightly encrypted dump (`age`) to Cloudflare R2 or Backblaze kept 30 days, and a quarterly restore drill.
- **Logs:** DPDP Rule 6 asks for one year of logs; Supabase Pro keeps 7 days. Ship logs to an external store or a partitioned table archived to R2.
- **DPDP timeline:** Rules notified 13–14 Nov 2025. Consent Manager provisions from 13 Nov 2026. Core obligations (notice, consent, security safeguards, breach notification, rights, penalties) from **13 May 2027**.
- **Roles:** the host is the Data Fiduciary for guest data. If Atithi becomes a SaaS, we are a Data Processor and need a DPA and a published sub-processor list (Supabase, Vercel, Meta, Razorpay, Anthropic, Cloudflare, Sentry, and Beds24).
- **Build now:** a plain-language notice linked from the first WhatsApp message; export, correction and erasure in the owner UI (erasing a guest anonymises their bookings); a written breach runbook. Commentary says a detailed report to the Board within 72 hours (**verify** against the Rule 7 text).
- **Penalties** go up to ₹250 crore for security-safeguard failures.

## 8. Repository layout

A modular monolith, adapted from research 03 (§H.1). The existing `docs/`, `prototype/` and `tools/` folders stay as they are.

```
booking-crm/
  README.md
  docs/                      plan documents and research
  prototype/                 clickable prototype (kept for demos)
  tools/                     prototype build scripts
  src/
    proxy.ts                 Next 16 session refresh and auth gate
    app/
      (auth)/login/
      (owner)/[org]/{today,calendar,bookings/[id],messages,review,automations,settings,health}/
      (caretaker)/c/[org]/today/
      api/webhooks/{beds24/[connectionId],whatsapp,razorpay/[connectionId]}/route.ts
      api/inbound/email/route.ts
      api/worker/{drain,heartbeat}/route.ts
      api/agenda/route.ts    offline-cacheable JSON for today and the next 14 days
      ical/[token]/route.ts  outbound feeds (fallback mode only)
      serwist/[path]/route.ts, sw.ts, manifest.ts, ~offline/page.tsx
    features/                each exposes index.ts; no deep imports across features
      bookings/   domain/{state-machine.ts,money.ts}, schemas.ts, actions.ts, queries.ts, components/
      calendar/
      channels/   adapter.ts, registry.ts, reconcile.ts,
                  adapters/{beds24,email,ical,manual}/,
                  email/{classify.ts,llm-extract.ts,confidence.ts,parsers/{airbnb,booking,agoda,mmt}/v1.ts}
      messaging/  whatsapp/{client.ts,webhook.ts}, templates/render.ts, inbound.ts
      automations/ engine.ts, conditions.ts, actions/*, recipes/*
      payments/   razorpay.ts, ledger.ts
      tasks/
      notifications/ webpush.ts, fanout.ts
    server/       supabase/{user,admin}.ts, jobs.ts, env.ts (Zod-validated), logger.ts, auth.ts
    lib/          dates.ts, money.ts (paise), phone.ts (libphonenumber-js), hmac.ts
    ui/           shadcn components restyled to Paper
  supabase/       migrations/, seed.sql, tests/*.sql (pgTAP)
  workers/email-ingest/      Cloudflare Email Worker (wrangler)
  tests/          fixtures/{emails,beds24,webhooks,ical}/, integration/, e2e/
  .github/workflows/         ci.yml, deploy.yml, backup.yml
```

Conventions (research 03, §H.1): `features/*/domain` is plain TypeScript with no Next.js or Supabase imports; layering is enforced with `eslint-plugin-boundaries` or dependency-cruiser; Zod schemas are the shared types and `supabase gen types` supplies row types; SQL migrations are the source of truth, expand/contract only, never edited once applied.

## 9. Testing and observability

### 9.1 Tests

From research 03 (§H.2), with Beds24 added:

| Layer | Tool | What |
|---|---|---|
| Unit | Vitest, fast-check | Email parsers against golden files (`fixtures/emails/mmt/pay_at_hotel_2026-08.eml` to `.expected.json`). The state machine, table-driven, plus property tests that no event sequence reaches an illegal transition. Ledger to payment status. Condition evaluator. Template rendering. Date handling. |
| Database | pgTAP (`supabase test db`) | Overlap rejected; same-day turnover allowed; cancellation releases holds; whole-villa versus room conflicts; the same payload twice gives one booking; transition trigger; RLS for owner, caretaker and another tenant |
| Integration | Vitest against local Supabase | Beds24 webhook to booking, end to end, using recorded payloads; `.eml` to booking; worker retry to DLQ; webhook signature checks |
| Contract | Recorded, redacted real payloads | Every production parse failure becomes a new fixture, one tap from the review queue after redaction |
| LLM eval | 30–100 labelled emails, run nightly or on demand | Field-level accuracy. Gates any prompt or model change. Not run on every pull request because it costs money. |
| End to end | Playwright on Pixel 7 and iPhone 15 viewports | Direct booking with overlap refused. MakeMyTrip booking to unverified to simulated WhatsApp CONFIRM to confirmed. Caretaker view offline. Push opt-in on Chromium. |

### 9.2 Environments

- **Local:** `supabase start` and `next dev`.
- **Staging:** Supabase Free project, Vercel Preview, WhatsApp test number, Razorpay test mode, and a Beds24 test property if the trial allows one (**verify**).
- **Production:** Supabase Pro in Mumbai, Vercel Pro in `bom1`.
- Pull requests run lint, type-check, unit tests, pgTAP, integration tests and the build. Merging to `main` runs `supabase db push` behind a manual approval, then the Vercel production deploy (research 03, §H.3).

### 9.3 Observability

From research 03 (§H.4):

- **Errors:** Sentry with source maps and release tags.
- **Logs:** pino JSON with `request_id`, `org_id`, `job_id`, `booking_id`, and personal data redacted.
- **Sync Health page** for Rohan and for us: per connection, last success, last change and consecutive failures; email parse success per platform; queue depths and dead letters; WhatsApp template statuses and quality rating.
- **Alerts:** Beds24 silent for over 60 minutes; dead-letter queue not empty; tick heartbeat older than 5 minutes; repeated parse failures from one OTA sender (usually a template change).
- **Feature flags:** a `feature_flags` table read with a 60-second cache, for example `email_llm_fallback`, `auto_verification`, `payments`, `mmt_advance`, `hindi_templates` (research 03, §H.5).

## 10. Costs

Monthly, from research 03 (§A.6) and research 01 (§4, §5, §6). Assumes 1 USD ≈ ₹88 and about 30 bookings a month for one host (research 03). Supabase and Vercel invoices to Indian addresses carry 18% GST.

| Item | Prototype | 1 host, production | 50 hosts (about 100 units, 1,000 bookings a month) |
|---|---|---|---|
| Supabase | Free | Pro, US$25 | Pro + Small compute, about US$30–40 |
| Vercel | Hobby, free (non-commercial only) | Pro, US$20 | 2 seats + usage, about US$40–60 |
| WhatsApp (Meta, India) | Test number, free | About ₹20–60 (research 03); "well under ₹100" (research 01) | About ₹1–2k, passed through to hosts |
| LLM (fallback only) | Under US$1 | Under US$1 (about 2 US cents per fallback email) | About US$5–15 |
| Inbound email (Cloudflare) | 0 | 0 | 0, or US$5 for Workers Paid if limits are hit |
| Sentry, uptime, heartbeat | Free tiers | Free tiers | Sentry Team, about US$26 |
| Razorpay | None | 2% + 18% GST on the fee, per payment, on the host's account (about ₹118 on a ₹5,000 advance) | Pass-through |
| Channel manager | None | **Beds24, about €18–25** (from €15.50 plus €0.55 per room-channel link) (research 01) | Each host on Beds24 at about €18–25, or Channex at US$130 + US$0.50 per unit, about US$180 (research 03) |
| **Platform total** | **About US$0** | **About US$45 (about ₹4,000 + GST) plus Beds24** | **About US$110–150 without a channel manager; about US$290–330 with Channex (US$2–7 per host)** |

Notes:

- For two units on four platforms, Beds24 would be €15.50 + 8 × €0.55 = €19.90, inside research 01's range, if "room-channel link" means one per unit per platform (**verify** on the Beds24 pricing page).
- A lean variant (Supabase Pro plus Next.js on Coolify on an India-region VPS) costs about US$32–37 a month, at the price of running your own servers (research 03, §A.6).
- Not covered by the research (**verify**): the dedicated SIM's monthly recharge for the WhatsApp number, and a domain name for email routing if Rohan does not have one.
