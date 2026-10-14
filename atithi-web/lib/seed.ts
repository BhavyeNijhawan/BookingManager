/* Sample data for Amberwood Stays, Lonavala.
   The clock is frozen at Sunday 11 October 2026, 12:40 PM so the demo always tells the same story. */
import type { Automation, Block, Booking, ChannelConfig, ChannelId, OtaId, Thread, Unit } from "./types";

export const OWNER = "Rohan";
export const PROPERTY = "Amberwood Stays";
export const CITY = "Lonavala";
export const CARETAKER = "Ramesh bhai";
export const CARETAKER_PHONE = "+91 98200 11223";
export const TODAY = "2026-10-11";
export const NOW = "2026-10-11T12:40";

export const UNITS: Unit[] = [
  { id: "villa", name: "Main Villa", meta: "3 BHK, up to 8 guests", advance: 3000 },
  { id: "cottage", name: "Garden Cottage", meta: "1 BHK, up to 3 guests", advance: 2500 },
];

export const CHANNELS: Record<ChannelId, { name: string; short: string }> = {
  airbnb: { name: "Airbnb", short: "Airbnb" },
  booking: { name: "Booking.com", short: "Booking.com" },
  agoda: { name: "Agoda", short: "Agoda" },
  mmt: { name: "MakeMyTrip", short: "MakeMyTrip" },
  direct: { name: "Direct", short: "Direct" },
};

export const OTAS: OtaId[] = ["airbnb", "booking", "agoda", "mmt"];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: "b10", ref: "HMK8Q2ZT5A", channel: "airbnb", unit: "villa",
    guest: { name: "Farah Khan", phone: "via Airbnb", pax: 6 },
    ci: "2026-10-02", co: "2026-10-04", amount: 36000, pay: { mode: "platform" }, status: "checked_out",
    tl: [
      { ts: "2026-09-20T14:10", tone: "good", text: "Booking received from Airbnb, paid on the platform" },
      { ts: "2026-09-20T14:10", tone: "acc", text: "Dates blocked on Booking.com, Agoda and MakeMyTrip" },
      { ts: "2026-10-01T09:00", tone: "acc", text: "Check-in details sent on WhatsApp" },
      { ts: "2026-10-04T11:20", tone: "good", text: "Checked out. Thank-you and review request sent" },
    ],
  },
  {
    id: "b9", ref: "NH7203398201", channel: "mmt", unit: "villa",
    guest: { name: "Amit Joshi", phone: "+91 98••• ••071", pax: 4 },
    ci: "2026-10-04", co: "2026-10-05", amount: 14500,
    pay: { mode: "pay_at_property", advance: { amount: 3000, status: "not_paid" } }, status: "cancelled",
    note: "No response to three reminders. Cancelled on the MakeMyTrip extranet and the dates were released on every platform.",
    tl: [
      { ts: "2026-10-01T19:40", tone: "warn", text: "Booking received from MakeMyTrip, pay at property" },
      { ts: "2026-10-01T19:40", tone: "acc", text: "Dates held on Airbnb, Booking.com and Agoda" },
      { ts: "2026-10-01T19:41", tone: "acc", text: "WhatsApp sent asking the guest to confirm, with a ₹3,000 advance" },
      { ts: "2026-10-02T08:00", tone: "warn", text: "First reminder sent, no reply" },
      { ts: "2026-10-02T14:00", tone: "warn", text: "Second reminder sent, no reply" },
      { ts: "2026-10-02T19:41", tone: "crit", text: "Flagged as likely fake after 24 hours without a reply" },
      { ts: "2026-10-02T20:05", tone: "crit", text: "You cancelled on the MakeMyTrip extranet. Dates released everywhere" },
    ],
  },
  {
    id: "b11", ref: "1193847720", channel: "agoda", unit: "cottage",
    guest: { name: "Chen Wei", phone: "via Agoda", pax: 2 },
    ci: "2026-10-05", co: "2026-10-07", amount: 11200, pay: { mode: "platform" }, status: "checked_out",
    tl: [
      { ts: "2026-09-28T22:15", tone: "good", text: "Booking received from Agoda, prepaid" },
      { ts: "2026-10-07T10:50", tone: "good", text: "Checked out. Review request sent" },
    ],
  },
  {
    id: "b1", ref: "HMA7R4XN2P", channel: "airbnb", unit: "villa",
    guest: { name: "Ananya Iyer", phone: "via Airbnb", pax: 6 },
    ci: "2026-10-09", co: "2026-10-11", amount: 36000, pay: { mode: "platform" }, status: "in_house",
    note: "Anniversary trip. Asked for a late checkout at 1 PM, approved.",
    tl: [
      { ts: "2026-09-30T11:02", tone: "good", text: "Booking received from Airbnb, paid on the platform" },
      { ts: "2026-09-30T11:02", tone: "acc", text: "Dates blocked on Booking.com, Agoda and MakeMyTrip" },
      { ts: "2026-10-08T09:00", tone: "acc", text: "Check-in details sent on WhatsApp" },
      { ts: "2026-10-09T14:35", tone: "good", text: "Checked in. Ramesh bhai confirmed" },
      { ts: "2026-10-11T11:00", tone: "pend", text: "Checkout today, late checkout at 1 PM" },
    ],
  },
  {
    id: "b2", ref: "4471.882.019", channel: "booking", unit: "cottage",
    guest: { name: "Sneha Kulkarni", phone: "+91 99•• ••• 318", pax: 2 },
    ci: "2026-10-11", co: "2026-10-13", amount: 11800, pay: { mode: "platform" }, status: "confirmed",
    tl: [
      { ts: "2026-10-03T20:12", tone: "good", text: "Booking received from Booking.com, prepaid by virtual card" },
      { ts: "2026-10-03T20:12", tone: "acc", text: "Dates blocked on Airbnb, Agoda and MakeMyTrip" },
      { ts: "2026-10-10T09:00", tone: "acc", text: "Check-in details sent on WhatsApp" },
      { ts: "2026-10-11T08:00", tone: "acc", text: "Ramesh bhai told: check-in after 1 PM" },
      { ts: "2026-10-11T12:40", tone: "pend", text: "Arriving today" },
    ],
  },
  {
    id: "b12", ref: "DIR-0092", channel: "direct", unit: "villa",
    guest: { name: "Kabir Malhotra", phone: "+91 98••• ••560", pax: 7 },
    ci: "2026-10-13", co: "2026-10-14", amount: 15000,
    pay: { mode: "pay_at_property", advance: { amount: 5000, status: "received" } }, status: "confirmed",
    tl: [
      { ts: "2026-10-06T17:30", tone: "good", text: "Direct booking added from a WhatsApp enquiry" },
      { ts: "2026-10-06T17:31", tone: "acc", text: "Dates blocked on Airbnb, Booking.com, Agoda and MakeMyTrip" },
      { ts: "2026-10-06T18:02", tone: "good", text: "Advance of ₹5,000 received through the payment link" },
    ],
  },
  {
    id: "b4", ref: "NH7203398765", channel: "mmt", unit: "cottage",
    guest: { name: "Priya Sharma", phone: "+91 98••• ••914", pax: 2 },
    ci: "2026-10-14", co: "2026-10-16", amount: 9800,
    pay: { mode: "pay_at_property", advance: { amount: 2500, status: "link_sent" } }, status: "verified",
    tl: [
      { ts: "2026-10-09T18:05", tone: "warn", text: "Booking received from MakeMyTrip, pay at property" },
      { ts: "2026-10-09T18:05", tone: "acc", text: "Dates held on Airbnb, Booking.com and Agoda" },
      { ts: "2026-10-09T18:06", tone: "acc", text: "WhatsApp sent asking the guest to confirm, with a ₹2,500 advance" },
      { ts: "2026-10-09T18:22", tone: "good", text: "Guest tapped “Haan, aa rahe hain”" },
      { ts: "2026-10-09T18:22", tone: "acc", text: "Payment link for ₹2,500 sent" },
      { ts: "2026-10-10T10:00", tone: "warn", text: "Payment reminder sent, link not paid yet" },
      { ts: "2026-10-11T18:00", tone: "pend", text: "Next payment reminder today at 6 PM" },
    ],
  },
  {
    id: "b6", ref: "HMZ3K9PQ7D", channel: "airbnb", unit: "cottage",
    guest: { name: "Meera Nair", phone: "via Airbnb", pax: 3 },
    ci: "2026-10-17", co: "2026-10-18", amount: 5600, pay: { mode: "platform" }, status: "confirmed",
    tl: [
      { ts: "2026-10-05T12:44", tone: "good", text: "Booking received from Airbnb, paid on the platform" },
      { ts: "2026-10-05T12:44", tone: "acc", text: "Dates blocked on Booking.com, Agoda and MakeMyTrip" },
    ],
  },
  {
    id: "b3", ref: "NH7203451189", channel: "mmt", unit: "villa",
    guest: { name: "Rahul Verma", phone: "+91 98••• ••210", pax: 5 },
    ci: "2026-10-18", co: "2026-10-19", amount: 14500,
    pay: { mode: "pay_at_property", advance: { amount: 3000, status: "not_sent" } }, status: "unverified",
    tl: [
      { ts: "2026-10-11T10:32", tone: "warn", text: "Booking received from MakeMyTrip, pay at property" },
      { ts: "2026-10-11T10:32", tone: "acc", text: "Dates held on Airbnb, Booking.com and Agoda" },
      { ts: "2026-10-11T10:33", tone: "acc", text: "WhatsApp sent asking the guest to confirm, with a ₹3,000 advance" },
      { ts: "2026-10-11T22:33", tone: "pend", text: "Reminder at 10:33 PM. Flagged tomorrow at 10:33 AM if there is still no reply" },
    ],
  },
  {
    id: "b13", ref: "4471.901.552", channel: "booking", unit: "cottage",
    guest: { name: "Aditi Rao", phone: "+91 97••• ••402", pax: 2 },
    ci: "2026-10-20", co: "2026-10-22", amount: 11000, pay: { mode: "platform" }, status: "confirmed",
    tl: [
      { ts: "2026-10-08T21:30", tone: "good", text: "Booking received from Booking.com, prepaid" },
      { ts: "2026-10-08T21:30", tone: "acc", text: "Dates blocked on Airbnb, Agoda and MakeMyTrip" },
    ],
  },
  {
    id: "b5", ref: "1194201877", channel: "agoda", unit: "villa",
    guest: { name: "Daniel Wong", phone: "via Agoda", pax: 4 },
    ci: "2026-10-22", co: "2026-10-25", amount: 52500, pay: { mode: "platform" }, status: "confirmed",
    tl: [
      { ts: "2026-09-25T08:20", tone: "good", text: "Booking received from Agoda, prepaid" },
      { ts: "2026-09-25T08:20", tone: "acc", text: "Dates blocked on Airbnb, Booking.com and MakeMyTrip" },
    ],
  },
  {
    id: "b7", ref: "DIR-0095", channel: "direct", unit: "cottage",
    guest: { name: "Vikram Singh", phone: "+91 98••• ••777", pax: 3 },
    ci: "2026-10-24", co: "2026-10-26", amount: 11000,
    pay: { mode: "pay_at_property", advance: { amount: 3000, status: "received" } }, status: "confirmed",
    tl: [
      { ts: "2026-10-07T13:10", tone: "good", text: "Direct booking added for a repeat guest" },
      { ts: "2026-10-07T13:11", tone: "acc", text: "Dates blocked on Airbnb, Booking.com, Agoda and MakeMyTrip" },
      { ts: "2026-10-07T13:40", tone: "good", text: "Advance of ₹3,000 received on UPI" },
    ],
  },
  {
    id: "b8", ref: "4471.933.108", channel: "booking", unit: "villa",
    guest: { name: "Thomas Müller", phone: "+49 •••• •••• 21", pax: 6 },
    ci: "2026-10-29", co: "2026-11-01", amount: 54000, pay: { mode: "platform" }, status: "confirmed",
    tl: [
      { ts: "2026-10-02T02:15", tone: "good", text: "Booking received from Booking.com, prepaid" },
      { ts: "2026-10-02T02:15", tone: "acc", text: "Dates blocked on Airbnb, Agoda and MakeMyTrip" },
    ],
  },
  {
    id: "b14", ref: "HMQ2L8RT1C", channel: "airbnb", unit: "cottage",
    guest: { name: "Nikhil Desai", phone: "via Airbnb", pax: 2 },
    ci: "2026-11-06", co: "2026-11-08", amount: 11200, pay: { mode: "platform" }, status: "confirmed",
    tl: [
      { ts: "2026-10-09T15:12", tone: "good", text: "Booking received from Airbnb, paid on the platform" },
      { ts: "2026-10-09T15:12", tone: "acc", text: "Dates blocked on Booking.com, Agoda and MakeMyTrip" },
    ],
  },
];

export const SEED_BLOCKS: Block[] = [
  { id: "blk1", unit: "villa", ci: "2026-10-26", co: "2026-10-28", reason: "Deep cleaning and plumbing" },
];

const ASK_REPLIES = ["Haan, aa rahe hain", "Cancel karna hai"];

export const SEED_THREADS: Thread[] = [
  {
    id: "t3", bookingId: "b3", who: "Rahul Verma", unread: 0,
    msgs: [
      { dir: "out", auto: true, ts: "2026-10-11T10:33", replies: ASK_REPLIES,
        text: "Namaste Rahul ji 🙏\nAapki booking *Amberwood Stays, Lonavala, Main Villa* ke liye *18–19 Oct (1 night, 5 guests)* MakeMyTrip par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹3,000 advance pay karna hoga, balance ₹11,500 check-in par." },
    ],
  },
  {
    id: "t4", bookingId: "b4", who: "Priya Sharma", unread: 0,
    msgs: [
      { dir: "out", auto: true, ts: "2026-10-09T18:06", replies: ASK_REPLIES,
        text: "Namaste Priya ji 🙏\nAapki booking *Amberwood Stays, Lonavala, Garden Cottage* ke liye *14–16 Oct (2 nights, 2 guests)* MakeMyTrip par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹2,500 advance pay karna hoga, balance ₹7,300 check-in par." },
      { dir: "in", ts: "2026-10-09T18:22", text: "Haan, aa rahe hain" },
      { dir: "out", auto: true, ts: "2026-10-09T18:22", text: "Shukriya Priya ji! Advance ₹2,500 ke liye secure link:\nrzp.io/l/amberwood-2500\n\nPayment hote hi booking confirm ho jayegi aur aapko check-in details mil jayengi." },
      { dir: "in", ts: "2026-10-09T18:30", text: "Ok, kal kar dungi" },
      { dir: "out", auto: true, ts: "2026-10-10T10:00", text: "Reminder: ₹2,500 advance abhi pending hai. Link: rzp.io/l/amberwood-2500\nDates sirf payment ke baad lock hoti hain." },
    ],
  },
  {
    id: "t2", bookingId: "b2", who: "Sneha Kulkarni", unread: 1,
    msgs: [
      { dir: "out", auto: true, ts: "2026-10-10T09:00", text: "Hi Sneha! Kal aapka check-in hai 🏡\n*Garden Cottage, Amberwood Stays*\nCheck-in: 1 PM onwards. Checkout: 11 AM\nAddress: maps.app.goo.gl/amberwood\nCaretaker Ramesh bhai: +91 98200 11223\n\nKoi bhi help chahiye to is number par message karein." },
      { dir: "in", ts: "2026-10-11T12:05", text: "Thanks! We will reach around 3 pm. Is early dinner possible?" },
    ],
  },
  {
    id: "t1", bookingId: "b1", who: "Ananya Iyer", unread: 0,
    msgs: [
      { dir: "out", auto: true, ts: "2026-10-08T09:00", text: "Hi Ananya! Kal aapka check-in hai 🏡\n*Main Villa, Amberwood Stays*\nCheck-in: 1 PM onwards. Checkout: 11 AM\nAddress: maps.app.goo.gl/amberwood\nCaretaker Ramesh bhai: +91 98200 11223" },
      { dir: "in", ts: "2026-10-10T21:40", text: "Hi, could we check out at 1 pm tomorrow instead of 11?" },
      { dir: "out", ts: "2026-10-10T21:52", text: "Sure Ananya, 1 PM is fine. Hope you are enjoying the stay!" },
      { dir: "in", ts: "2026-10-10T21:53", text: "Thank you so much 🙏" },
    ],
  },
  {
    id: "t9", bookingId: "b9", who: "Amit Joshi", unread: 0,
    msgs: [
      { dir: "out", auto: true, ts: "2026-10-01T19:41", replies: ASK_REPLIES,
        text: "Namaste Amit ji 🙏\nAapki booking *Amberwood Stays, Lonavala, Main Villa* ke liye *4–5 Oct (1 night, 4 guests)* MakeMyTrip par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹3,000 advance pay karna hoga." },
      { dir: "out", auto: true, ts: "2026-10-02T08:00", text: "Reminder: Kripya apni 4–5 Oct booking confirm karein. Bina confirmation ke dates hold nahi ho payengi." },
      { dir: "out", auto: true, ts: "2026-10-02T14:00", text: "Last reminder: 4–5 Oct booking aaj raat tak confirm na hone par cancel maani jayegi." },
    ],
  },
  {
    id: "tc", bookingId: null, who: CARETAKER, caretaker: true, unread: 0,
    msgs: [
      { dir: "out", auto: true, ts: "2026-10-11T08:00", text: "सुप्रभात रमेश भाई 🙏\nआज (रवि, 11 अक्टूबर):\n\nचेक-आउट: Ananya Iyer, Main Villa, 1 PM (late checkout)\nचेक-इन: Sneha Kulkarni (2 लोग), Garden Cottage, 1 PM के बाद\n\nकाम: Main Villa की सफ़ाई 1 PM से 4 PM तक।" },
      { dir: "in", ts: "2026-10-11T08:04", text: "जी ठीक है 👍" },
    ],
  },
];

export const SEED_AUTOMATIONS: Automation[] = [
  { id: "a1", on: true, name: "Welcome every new booking on WhatsApp", trig: "A new booking arrives on any platform", cond: "The guest’s phone number is available", act: "Send a “booking received” message", runs: 14,
    tpl: "Namaste {{guest}} ji 🙏 Aapki booking *{{property}}, {{unit}}* ke liye *{{dates}}* ({{platform}}) receive hui hai. Check-in 1 PM, checkout 11 AM. Koi bhi sawaal ho to yahin message karein." },
  { id: "a2", on: true, name: "Verify pay-at-property bookings", trig: "A new booking arrives", cond: "Payment is “pay at property” (MakeMyTrip, Goibibo, direct)", act: "Ask the guest to confirm with Yes and Cancel buttons, send the advance link, remind after 12 hours and flag after 24", runs: 5,
    tpl: "Namaste {{guest}} ji 🙏 Aapki booking *{{property}}, {{unit}}* ke liye *{{dates}}* {{platform}} par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹{{advance}} advance pay karna hoga, balance ₹{{balance}} check-in par." },
  { id: "a3", on: true, name: "Block the dates on every other platform", trig: "A new booking or a manual block", cond: "Always", act: "Close the nights on every platform through the channel manager and alert you on a clash", runs: 16, system: true },
  { id: "a4", on: true, name: "Send check-in details the day before", trig: "One day before check-in, at 9 AM", cond: "The booking is confirmed", act: "Send the address, timings and the caretaker’s number", runs: 9,
    tpl: "Hi {{guest}}! Kal aapka check-in hai 🏡\n*{{unit}}, {{property}}*\nCheck-in: 1 PM onwards. Checkout: 11 AM\nAddress: {{maps_link}}\nCaretaker {{caretaker}}: {{caretaker_phone}}" },
  { id: "a5", on: true, name: "Morning briefing for Ramesh bhai", trig: "Every day at 8 AM", cond: "There is a check-in, checkout or task today", act: "Send a Hindi summary to the caretaker", runs: 30,
    tpl: "सुप्रभात {{caretaker}} 🙏\nआज ({{today_hi}}):\n{{checkouts_hi}}\n{{checkins_hi}}\n{{tasks_hi}}" },
  { id: "a6", on: true, name: "Mark confirmed when the advance arrives", trig: "A payment is received", cond: "It is linked to a booking", act: "Set the booking to Confirmed, notify you and thank the guest", runs: 4,
    tpl: "Advance ₹{{advance}} mil gaya, shukriya {{guest}} ji ✅ Aapki booking *{{dates}}* ab confirmed hai. Balance ₹{{balance}} check-in par. Check-in details aapko ek din pehle mil jayengi." },
  { id: "a7", on: true, name: "Thank-you and review request", trig: "One day after checkout, at 11 AM", cond: "The stay is complete", act: "Send a thank-you with the review link for that platform", runs: 8,
    tpl: "Dhanyavaad {{guest}} ji! Hope you had a great stay at {{property}}. Agar 2 minute hain to {{platform}} par review zaroor dein: {{review_link}} 🙏" },
  { id: "a8", on: false, name: "Release the dates when a guest cancels", trig: "A cancellation email arrives, or the guest taps Cancel", cond: "Always", act: "Set the booking to Cancelled, reopen the dates and notify you", runs: 2, system: true },
];

export const CHANNEL_CONFIG: ChannelConfig[] = [
  { id: "airbnb", method: "Two-way through the channel manager, with emails as backup", last: "2 min ago", health: "ok",
    note: "Bookings, changes and cancellations arrive within minutes. The guest phone is often an Airbnb proxy number, so the first message goes through Airbnb chat with a WhatsApp link.", ext: "Airbnb Host app" },
  { id: "booking", method: "Two-way through the channel manager, with emails as backup", last: "2 min ago", health: "ok",
    note: "Booking.com no longer shares guest phone numbers with channel managers. Atithi reminds you to copy it from the Extranet or the Pulse app when the booking lands.", ext: "Booking.com Extranet" },
  { id: "agoda", method: "Two-way through the channel manager, with emails as backup", last: "5 min ago", health: "ok",
    note: "Agoda masks guest contact details. Messages go through Agoda chat with a link for the guest to share their WhatsApp number.", ext: "Agoda YCS" },
  { id: "mmt", method: "Two-way through the channel manager (InGo-MMT and Goibibo), with voucher emails as backup", last: "10:32 AM", health: "warn",
    note: "MakeMyTrip and Goibibo share one extranet, so both are covered. Pay-at-property bookings are held and verified the moment they arrive. MakeMyTrip sometimes reveals the guest number late; the check then runs as soon as it appears.", ext: "InGo-MMT Connect" },
  { id: "direct", method: "WhatsApp and phone enquiries, added by you", last: "", health: "ok",
    note: "Direct bookings get the same verification, advance link and reminders as platform bookings.", ext: null },
];
