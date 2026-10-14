/* ============================================================
   Atithi · working prototype
   Sample data is fixed to Sunday 11 October 2026 so the demo
   always tells the same story. Edit the constants to personalise.
   ============================================================ */
'use strict';

const OWNER = 'Rohan';
const PROPERTY = 'Amberwood Stays';
const CITY = 'Lonavala';
const CARETAKER = 'Ramesh bhai';
const CARETAKER_PHONE = '+91 98200 11223';
const TODAY = '2026-10-11';
const NOW = '2026-10-11T12:40';

const UNITS = [
  { id:'villa',   name:'Main Villa',     meta:'3 BHK · up to 8 guests', advance:3000 },
  { id:'cottage', name:'Garden Cottage', meta:'1 BHK · up to 3 guests', advance:2500 },
];
const CH = {
  airbnb:  { name:'Airbnb' },
  booking: { name:'Booking.com' },
  agoda:   { name:'Agoda' },
  mmt:     { name:'MakeMyTrip' },
  direct:  { name:'Direct' },
};
const OTAS = ['airbnb','booking','agoda','mmt'];
const STATUS = {
  unverified:  { label:'Not verified yet',                  att:true },
  verified:    { label:'Guest said yes',                    att:true },
  flagged:     { label:'No reply in 24 hours · likely fake', att:true, strong:true },
  confirmed:   { label:'Confirmed' },
  in_house:    { label:'Staying now' },
  checked_out: { label:'Checked out' },
  cancelled:   { label:'Cancelled' },
};

const ICONS = {
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  list:'<path d="M5 7h14M5 12h14M5 17h9"/>',
  chat:'<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-5 4z"/>',
  more:'<circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
  back:'<path d="m15 18-6-6 6-6"/>',
  chev:'<path d="m9 18 6-6-6-6"/>',
  chevd:'<path d="m6 9 6 6 6-6"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
  send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  ext:'<path d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
  lang:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
};
const ic = (n, cls='') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||''}</svg>`;

/* ---------- sample bookings ---------- */
let bookings = [
  { id:'b10', ref:'HMK8Q2ZT5A', channel:'airbnb', unit:'villa', guest:{name:'Farah Khan', phone:'via Airbnb', pax:6}, ci:'2026-10-02', co:'2026-10-04', amount:36000, pay:{mode:'platform'}, status:'checked_out',
    tl:[['2026-09-20T14:10','good','Booking received from Airbnb · paid on platform'],['2026-09-20T14:10','acc','Dates blocked on Booking.com, Agoda, MakeMyTrip'],['2026-10-01T09:00','acc','Check-in details sent on WhatsApp'],['2026-10-04T11:20','good','Checked out · thank-you and review request sent']] },
  { id:'b9', ref:'NH7203398201', channel:'mmt', unit:'villa', guest:{name:'Amit Joshi', phone:'+91 98••• ••071', pax:4}, ci:'2026-10-04', co:'2026-10-05', amount:14500, pay:{mode:'pay_at_property', advance:{amount:3000, status:'not_paid'}}, status:'cancelled',
    note:'No response to three reminders. Cancelled on the MMT extranet, dates released to every platform.',
    tl:[['2026-10-01T19:40','warn','Booking received from MakeMyTrip · pay at property'],['2026-10-01T19:40','acc','Dates held on Airbnb, Booking.com, Agoda'],['2026-10-01T19:41','acc','WhatsApp sent: please confirm, ₹3,000 advance'],['2026-10-02T08:00','warn','Reminder 1 sent · no reply'],['2026-10-02T14:00','warn','Reminder 2 sent · no reply'],['2026-10-02T19:41','crit','Flagged: 24 hours, no reply · likely fake'],['2026-10-02T20:05','crit','You cancelled on the MMT extranet · dates released everywhere']] },
  { id:'b11', ref:'1193847720', channel:'agoda', unit:'cottage', guest:{name:'Chen Wei', phone:'via Agoda', pax:2}, ci:'2026-10-05', co:'2026-10-07', amount:11200, pay:{mode:'platform'}, status:'checked_out',
    tl:[['2026-09-28T22:15','good','Booking received from Agoda · prepaid'],['2026-10-07T10:50','good','Checked out · review request sent']] },
  { id:'b1', ref:'HMA7R4XN2P', channel:'airbnb', unit:'villa', guest:{name:'Ananya Iyer', phone:'via Airbnb', pax:6}, ci:'2026-10-09', co:'2026-10-11', amount:36000, pay:{mode:'platform'}, status:'in_house',
    note:'Anniversary trip. Asked for late checkout at 1 PM, approved.',
    tl:[['2026-09-30T11:02','good','Booking received from Airbnb · paid on platform'],['2026-09-30T11:02','acc','Dates blocked on Booking.com, Agoda, MakeMyTrip'],['2026-10-08T09:00','acc','Check-in details sent on WhatsApp'],['2026-10-09T14:35','good','Checked in · Ramesh bhai confirmed'],['2026-10-11T11:00','pend','Checkout today · late checkout 1 PM']] },
  { id:'b2', ref:'4471.882.019', channel:'booking', unit:'cottage', guest:{name:'Sneha Kulkarni', phone:'+91 99•• ••• 318', pax:2}, ci:'2026-10-11', co:'2026-10-13', amount:11800, pay:{mode:'platform'}, status:'confirmed',
    tl:[['2026-10-03T20:12','good','Booking received from Booking.com · prepaid (virtual card)'],['2026-10-03T20:12','acc','Dates blocked on Airbnb, Agoda, MakeMyTrip'],['2026-10-10T09:00','acc','Check-in details sent on WhatsApp'],['2026-10-11T08:00','acc','Ramesh bhai told: check-in after 1 PM'],['2026-10-11T12:40','pend','Arriving today']] },
  { id:'b12', ref:'DIR-0092', channel:'direct', unit:'villa', guest:{name:'Kabir Malhotra', phone:'+91 98••• ••560', pax:7}, ci:'2026-10-13', co:'2026-10-14', amount:15000, pay:{mode:'pay_at_property', advance:{amount:5000, status:'received'}}, status:'confirmed',
    tl:[['2026-10-06T17:30','good','Direct booking added from a WhatsApp enquiry'],['2026-10-06T17:31','acc','Dates blocked on Airbnb, Booking.com, Agoda, MakeMyTrip'],['2026-10-06T18:02','good','Advance ₹5,000 received via payment link']] },
  { id:'b4', ref:'NH7203398765', channel:'mmt', unit:'cottage', guest:{name:'Priya Sharma', phone:'+91 98••• ••914', pax:2}, ci:'2026-10-14', co:'2026-10-16', amount:9800, pay:{mode:'pay_at_property', advance:{amount:2500, status:'link_sent'}}, status:'verified',
    tl:[['2026-10-09T18:05','warn','Booking received from MakeMyTrip · pay at property'],['2026-10-09T18:05','acc','Dates held on Airbnb, Booking.com, Agoda'],['2026-10-09T18:06','acc','WhatsApp sent: please confirm, ₹2,500 advance'],['2026-10-09T18:22','good','Guest tapped “Haan, aa rahe hain”'],['2026-10-09T18:22','acc','Payment link for ₹2,500 sent'],['2026-10-10T10:00','warn','Payment reminder sent · link not paid yet'],['2026-10-11T12:40','pend','Waiting for the advance · next reminder today 6 PM']] },
  { id:'b6', ref:'HMZ3K9PQ7D', channel:'airbnb', unit:'cottage', guest:{name:'Meera Nair', phone:'via Airbnb', pax:3}, ci:'2026-10-17', co:'2026-10-18', amount:5600, pay:{mode:'platform'}, status:'confirmed',
    tl:[['2026-10-05T12:44','good','Booking received from Airbnb · paid on platform'],['2026-10-05T12:44','acc','Dates blocked on Booking.com, Agoda, MakeMyTrip']] },
  { id:'b3', ref:'NH7203451189', channel:'mmt', unit:'villa', guest:{name:'Rahul Verma', phone:'+91 98••• ••210', pax:5}, ci:'2026-10-18', co:'2026-10-19', amount:14500, pay:{mode:'pay_at_property', advance:{amount:3000, status:'not_sent'}}, status:'unverified',
    tl:[['2026-10-11T10:32','warn','Booking received from MakeMyTrip · pay at property'],['2026-10-11T10:32','acc','Dates held on Airbnb, Booking.com, Agoda'],['2026-10-11T10:33','acc','WhatsApp sent: please confirm, ₹3,000 advance'],['2026-10-11T12:40','pend','No reply yet · reminder at 10:33 PM, flagged at 10:33 AM tomorrow if still silent']] },
  { id:'b13', ref:'4471.901.552', channel:'booking', unit:'cottage', guest:{name:'Aditi Rao', phone:'+91 97••• ••402', pax:2}, ci:'2026-10-20', co:'2026-10-22', amount:11000, pay:{mode:'platform'}, status:'confirmed',
    tl:[['2026-10-08T21:30','good','Booking received from Booking.com · prepaid'],['2026-10-08T21:30','acc','Dates blocked on Airbnb, Agoda, MakeMyTrip']] },
  { id:'b5', ref:'1194201877', channel:'agoda', unit:'villa', guest:{name:'Daniel Wong', phone:'via Agoda', pax:4}, ci:'2026-10-22', co:'2026-10-25', amount:52500, pay:{mode:'platform'}, status:'confirmed',
    tl:[['2026-09-25T08:20','good','Booking received from Agoda · prepaid'],['2026-09-25T08:20','acc','Dates blocked on Airbnb, Booking.com, MakeMyTrip']] },
  { id:'b7', ref:'DIR-0095', channel:'direct', unit:'cottage', guest:{name:'Vikram Singh', phone:'+91 98••• ••777', pax:3}, ci:'2026-10-24', co:'2026-10-26', amount:11000, pay:{mode:'pay_at_property', advance:{amount:3000, status:'received'}}, status:'confirmed',
    tl:[['2026-10-07T13:10','good','Direct booking added (repeat guest)'],['2026-10-07T13:11','acc','Dates blocked on Airbnb, Booking.com, Agoda, MakeMyTrip'],['2026-10-07T13:40','good','Advance ₹3,000 received via UPI']] },
  { id:'b8', ref:'4471.933.108', channel:'booking', unit:'villa', guest:{name:'Thomas Müller', phone:'+49 •••• •••• 21', pax:6}, ci:'2026-10-29', co:'2026-11-01', amount:54000, pay:{mode:'platform'}, status:'confirmed',
    tl:[['2026-10-02T02:15','good','Booking received from Booking.com · prepaid'],['2026-10-02T02:15','acc','Dates blocked on Airbnb, Agoda, MakeMyTrip']] },
  { id:'b14', ref:'HMQ2L8RT1C', channel:'airbnb', unit:'cottage', guest:{name:'Nikhil Desai', phone:'via Airbnb', pax:2}, ci:'2026-11-06', co:'2026-11-08', amount:11200, pay:{mode:'platform'}, status:'confirmed',
    tl:[['2026-10-09T15:12','good','Booking received from Airbnb · paid on platform'],['2026-10-09T15:12','acc','Dates blocked on Booking.com, Agoda, MakeMyTrip']] },
];
let blocks = [
  { id:'blk1', unit:'villa', ci:'2026-10-26', co:'2026-10-28', reason:'Deep cleaning and plumbing' },
];

/* ---------- WhatsApp threads ---------- */
let threads = [
  { id:'t3', booking:'b3', who:'Rahul Verma', unread:0, msgs:[
    ['out','auto','2026-10-11T10:33','Namaste Rahul ji 🙏\nAapki booking *Amberwood Stays, Lonavala · Main Villa* ke liye *18–19 Oct (1 night, 5 guests)* MakeMyTrip par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹3,000 advance pay karna hoga, balance ₹11,500 check-in par.', ['Haan, aa rahe hain','Cancel karna hai']],
  ]},
  { id:'t4', booking:'b4', who:'Priya Sharma', unread:0, msgs:[
    ['out','auto','2026-10-09T18:06','Namaste Priya ji 🙏\nAapki booking *Amberwood Stays, Lonavala · Garden Cottage* ke liye *14–16 Oct (2 nights, 2 guests)* MakeMyTrip par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹2,500 advance pay karna hoga, balance ₹7,300 check-in par.', ['Haan, aa rahe hain','Cancel karna hai']],
    ['in','','2026-10-09T18:22','Haan, aa rahe hain'],
    ['out','auto','2026-10-09T18:22','Shukriya Priya ji! Advance ₹2,500 ke liye secure link:\nrzp.io/l/amberwood-2500\n\nPayment hote hi booking confirm ho jayegi aur aapko check-in details mil jayengi.'],
    ['in','','2026-10-09T18:30','Ok, kal kar dungi'],
    ['out','auto','2026-10-10T10:00','Reminder: ₹2,500 advance abhi pending hai. Link: rzp.io/l/amberwood-2500 · Dates sirf payment ke baad lock hoti hain.'],
  ]},
  { id:'t2', booking:'b2', who:'Sneha Kulkarni', unread:1, msgs:[
    ['out','auto','2026-10-10T09:00','Hi Sneha! Kal aapka check-in hai 🏡\n*Garden Cottage, Amberwood Stays*\nCheck-in: 1 PM onwards · Checkout: 11 AM\nAddress: maps.app.goo.gl/amberwood\nCaretaker Ramesh bhai: +91 98200 11223\n\nKoi bhi help chahiye to is number par message karein.'],
    ['in','','2026-10-11T12:05','Thanks! We will reach around 3 pm. Is early dinner possible?'],
  ]},
  { id:'t1', booking:'b1', who:'Ananya Iyer', unread:0, msgs:[
    ['out','auto','2026-10-08T09:00','Hi Ananya! Kal aapka check-in hai 🏡\n*Main Villa, Amberwood Stays*\nCheck-in: 1 PM onwards · Checkout: 11 AM\nAddress: maps.app.goo.gl/amberwood\nCaretaker Ramesh bhai: +91 98200 11223'],
    ['in','','2026-10-10T21:40','Hi, could we check out at 1 pm tomorrow instead of 11?'],
    ['out','','2026-10-10T21:52','Sure Ananya, 1 PM is fine. Hope you are enjoying the stay!'],
    ['in','','2026-10-10T21:53','Thank you so much 🙏'],
  ]},
  { id:'t9', booking:'b9', who:'Amit Joshi', unread:0, msgs:[
    ['out','auto','2026-10-01T19:41','Namaste Amit ji 🙏\nAapki booking *Amberwood Stays, Lonavala · Main Villa* ke liye *4–5 Oct (1 night, 4 guests)* MakeMyTrip par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹3,000 advance pay karna hoga.', ['Haan, aa rahe hain','Cancel karna hai']],
    ['out','auto','2026-10-02T08:00','Reminder: Kripya apni 4–5 Oct booking confirm karein. Bina confirmation ke dates hold nahi ho payengi.'],
    ['out','auto','2026-10-02T14:00','Last reminder: 4–5 Oct booking aaj raat tak confirm na hone par cancel maani jayegi.'],
  ]},
  { id:'tc', booking:null, who:CARETAKER, caretaker:true, unread:0, msgs:[
    ['out','auto','2026-10-11T08:00','सुप्रभात रमेश भाई 🙏\nआज (रवि, 11 अक्टूबर):\n\nचेक-आउट: Ananya Iyer · Main Villa · 1 PM (late checkout)\nचेक-इन: Sneha Kulkarni (2 लोग) · Garden Cottage · 1 PM के बाद\n\nकाम: Main Villa की सफ़ाई 1 PM से 4 PM तक।'],
    ['in','','2026-10-11T08:04','जी ठीक है 👍'],
  ]},
];

/* ---------- automations ---------- */
let autos = [
  { id:'a1', on:true, name:'Welcome every new booking on WhatsApp', trig:'New booking, any platform', cond:'Guest phone number available', act:'Send a “booking received” message', runs:14,
    tpl:'Namaste {{guest}} ji 🙏 Aapki booking *{{property}} · {{unit}}* ke liye *{{dates}}* ({{platform}}) receive hui hai. Check-in 1 PM, checkout 11 AM. Koi bhi sawaal ho to yahin message karein.' },
  { id:'a2', on:true, name:'Verify pay-at-property bookings', trig:'New booking', cond:'Payment is “pay at property” (MakeMyTrip, Goibibo, direct)', act:'Ask the guest to confirm with Yes / Cancel buttons · optional advance link · remind after 12 hours · flag after 24', runs:5,
    tpl:'Namaste {{guest}} ji 🙏 Aapki booking *{{property}} · {{unit}}* ke liye *{{dates}}* {{platform}} par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹{{advance}} advance pay karna hoga, balance ₹{{balance}} check-in par.' },
  { id:'a3', on:true, name:'Block the dates on every other platform', trig:'New booking or manual block', cond:'Always', act:'Push to all platforms through the channel manager · alert you on a clash', runs:16, system:true },
  { id:'a4', on:true, name:'Send check-in details the day before', trig:'1 day before check-in · 9 AM', cond:'Booking confirmed', act:'Send address, timings and the caretaker number', runs:9,
    tpl:'Hi {{guest}}! Kal aapka check-in hai 🏡\n*{{unit}}, {{property}}*\nCheck-in: 1 PM onwards · Checkout: 11 AM\nAddress: {{maps_link}}\nCaretaker {{caretaker}}: {{caretaker_phone}}' },
  { id:'a5', on:true, name:'Morning briefing for Ramesh bhai', trig:'Every day · 8 AM', cond:'Any check-in, checkout or task today', act:'Send a Hindi summary to the caretaker', runs:30,
    tpl:'सुप्रभात {{caretaker}} 🙏\nआज ({{today_hi}}):\n{{checkouts_hi}}\n{{checkins_hi}}\n{{tasks_hi}}' },
  { id:'a6', on:true, name:'Mark confirmed when the advance arrives', trig:'Payment received', cond:'Linked to a booking', act:'Set status to Confirmed · notify you · tell the guest', runs:4,
    tpl:'Advance ₹{{advance}} mil gaya, shukriya {{guest}} ji ✅ Aapki booking *{{dates}}* ab confirmed hai. Balance ₹{{balance}} check-in par. Check-in details aapko ek din pehle mil jayengi.' },
  { id:'a7', on:true, name:'Thank-you and review request', trig:'1 day after checkout · 11 AM', cond:'Stay completed', act:'Send a thank-you with the review link for that platform', runs:8,
    tpl:'Dhanyavaad {{guest}} ji! Hope you had a great stay at {{property}}. Agar 2 minute hain to {{platform}} par review zaroor dein: {{review_link}} 🙏' },
  { id:'a8', on:false, name:'Guest cancels · release the dates everywhere', trig:'Cancellation email, or guest taps Cancel', cond:'Always', act:'Set status to Cancelled · reopen the dates · notify you', runs:2, system:true },
];

const CHANNELS_CFG = [
  { id:'airbnb',  method:'Two-way through the channel manager, emails as backup', last:'2 min ago', health:'ok', note:'Bookings, changes and cancellations arrive within minutes. The guest phone is often an Airbnb proxy number, so the first message goes through Airbnb chat with a WhatsApp link.', ext:'Airbnb Host app' },
  { id:'booking', method:'Two-way through the channel manager, emails as backup', last:'2 min ago', health:'ok', note:'Booking.com no longer shares guest phone numbers with channel managers. Atithi reminds you to copy it from the Extranet or the Pulse app when the booking lands.', ext:'Booking.com Extranet' },
  { id:'agoda',   method:'Two-way through the channel manager, emails as backup', last:'5 min ago', health:'ok', note:'Agoda masks guest contact details. Messages go through Agoda chat with a link for the guest to share their WhatsApp number.', ext:'Agoda YCS' },
  { id:'mmt',     method:'Two-way through the channel manager (InGo-MMT and Goibibo), voucher emails as backup', last:'10:32 AM', health:'warn', note:'MakeMyTrip and Goibibo share one extranet, so both are covered. Pay-at-property bookings are held and verified the moment they arrive. MMT sometimes reveals the guest number late; the check then runs as soon as it appears.', ext:'InGo-MMT Connect' },
  { id:'direct',  method:'WhatsApp and phone enquiries, added by you', last:'', health:'ok', note:'Direct bookings get the same verification, advance link and reminders as platform bookings.', ext:null },
];

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr = n => '₹' + new Intl.NumberFormat('en-IN', {maximumFractionDigits:0}).format(n);
const D = s => { const [y,m,d] = s.slice(0,10).split('-').map(Number); return new Date(y, m-1, d); };
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addDays = (s, n) => { const d = D(s); d.setDate(d.getDate()+n); return iso(d); };
const nights = (a,b) => Math.round((D(b)-D(a))/864e5);
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DOWL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const fmtD = s => { const d = D(s); return `${d.getDate()} ${MON[d.getMonth()]}`; };
const fmtDow = s => { const d = D(s); return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`; };
const fmtDowLong = s => { const d = D(s); return `${DOWL[d.getDay()]}, ${d.getDate()} ${MONL[d.getMonth()]}`; };
const fmtRange = (a,b) => { const x=D(a), y=D(b); return x.getMonth()===y.getMonth() ? `${x.getDate()}–${y.getDate()} ${MON[x.getMonth()]}` : `${fmtD(a)} – ${fmtD(b)}`; };
const fmtTime = s => { const [h,m] = s.slice(11,16).split(':').map(Number); const ap = h>=12?'PM':'AM'; return `${((h+11)%12)+1}:${String(m).padStart(2,'0')} ${ap}`; };
const fmtTs = s => s.slice(0,10)===TODAY ? `Today ${fmtTime(s)}` : `${fmtD(s)}, ${fmtTime(s)}`;
const relDay = s => { const d=s.slice(0,10); return d===TODAY?'Today':d===addDays(TODAY,1)?'Tomorrow':d===addDays(TODAY,-1)?'Yesterday':fmtDow(d); };
const ago = s => { const mins = Math.round((new Date(NOW)-new Date(s))/6e4); if (mins<60) return `${mins} min ago`; const h=Math.round(mins/60); if (h<24) return `${h} hour${h>1?'s':''} ago`; const d=Math.round(h/24); return `${d} day${d>1?'s':''} ago`; };
const unitName = id => (UNITS.find(u=>u.id===id)||{}).name || id;
const first = n => n.split(' ')[0];
const live = b => b.status !== 'cancelled';
const overlaps = (b, a, z) => b.ci < z && b.co > a;
const needsAction = b => ['unverified','verified','flagged'].includes(b.status);
const byCi = (a,b) => a.ci.localeCompare(b.ci);
const nightsWord = n => `${n} night${n===1?'':'s'}`;
const guestsWord = n => `${n} guest${n===1?'':'s'}`;
const plat = b => CH[b.channel].name + (b.pay.mode==='pay_at_property' && b.channel!=='direct' ? ', pay at property' : '');
const barClass = b => b.status==='flagged' ? 'flag' : (b.status==='unverified'||b.status==='verified') ? 'pend' : b.status==='checked_out' ? 'done' : '';
const sentAt = (b, startsWith) => (b.tl.find(t=>t[2].startsWith(startsWith))||[NOW])[0];

function payWords(b){
  if (b.pay.mode==='platform') return `paid on ${CH[b.channel].name}`;
  const adv = b.pay.advance;
  if (adv && adv.status==='received') return `${inr(adv.amount)} advance paid · ${inr(b.amount-adv.amount)} at check-in`;
  if (adv && adv.status==='link_sent') return `${inr(adv.amount)} advance link sent, unpaid`;
  return `${inr(b.amount)} due at property`;
}
function payShort(b){
  if (b.pay.mode==='platform') return 'paid';
  const adv = b.pay.advance;
  if (adv && adv.status==='received') return `${inr(b.amount-adv.amount)} to collect`;
  return `${inr(b.amount)} to collect`;
}
function statusLine(b){
  const st = STATUS[b.status];
  const cls = st.strong ? 'r3 strong' : st.att ? 'r3 att' : 'r3';
  return `<div class="${cls}">${st.label} · ${payWords(b)}</div>`;
}

/* ---------- state ---------- */
const state = {
  tab:'today',
  view:null,          // {type, id, tab}
  calUnit:'villa',
  calMonth:'2026-10',
  bkFilter:'action',
  bkChannel:'all',
  inboxMode:'chats',
  demoStep:0,
};
const $ = id => document.getElementById(id);

/* ---------- rendering ---------- */
function render(){
  const v = state.view;
  let top='', body='', title='Atithi';
  if (v) {
    const r = VIEWS[v.type](v);
    top = topBack(r.title, r.kicker, r.right);
    body = r.html; title = `${r.plain||r.title} · Atithi`;
  } else {
    const r = TABS[state.tab]();
    top = r.top; body = r.html; title = `${r.name} · Atithi`;
  }
  $('topbar').innerHTML = top;
  $('main').innerHTML = body;
  $('tabbar').innerHTML = tabbar();
  document.title = title;
  window.scrollTo(0,0);
}
const topHome = (kicker, title, right='') => `<div class="ttl"><div class="kicker">${kicker}</div><h1>${title}</h1></div>${right}`;
const topBack = (title, kicker='', right='') => `<button class="iconbtn" data-act="back" aria-label="Back">${ic('back')}</button><div class="ttl">${kicker?`<div class="kicker">${kicker}</div>`:''}<h1>${title}</h1></div>${right}`;

function tabbar(){
  const tabs = [['today','Today','sun'],['calendar','Calendar','calendar'],['bookings','Bookings','list'],['inbox','Messages','chat'],['more','More','more']];
  const unread = threads.reduce((a,t)=>a+t.unread,0);
  const act = bookings.filter(needsAction).length;
  const cur = state.view ? state.view.tab : state.tab;
  return tabs.map(([id,l,i]) => `<button data-act="tab" data-tab="${id}" ${cur===id?'aria-current="page"':''}>${ic(i)}${l}${id==='today'&&act?'<span class="adot" aria-label="Needs attention"></span>':''}${id==='inbox'&&unread?`<span class="cnt">${unread}</span>`:''}</button>`).join('');
}

/* ===== shared pieces ===== */
function attentionRow(b){
  let why='', acts='';
  if (b.status==='unverified') {
    why = `WhatsApp sent ${ago(sentAt(b,'WhatsApp'))}, no reply yet. The dates are held on every platform meanwhile.`;
    acts = `<button class="btn primary" data-act="remind" data-id="${b.id}">Remind on WhatsApp</button><button class="btn" data-act="call" data-id="${b.id}">Call</button>`;
  } else if (b.status==='verified') {
    why = `The ${inr(b.pay.advance.amount)} advance is still unpaid; last reminder ${ago('2026-10-10T10:00')}. The dates stay held until it arrives.`;
    acts = `<button class="btn primary" data-act="remind-pay" data-id="${b.id}">Resend payment link</button><button class="btn" data-act="call" data-id="${b.id}">Call</button>`;
  } else if (b.status==='flagged') {
    why = `24 hours, two reminders, no reply and no advance. This is what a fake pay-at-property booking looks like.`;
    acts = `<button class="btn danger" data-act="cancel-release" data-id="${b.id}">Cancel and release dates</button><button class="btn" data-act="call" data-id="${b.id}">Call</button>`;
  }
  return `<div class="row">
    <button class="rowmain" data-act="open-booking" data-id="${b.id}">
      <div class="r1"><span>${esc(b.guest.name)}</span><span class="meta">${inr(b.amount)} ${b.pay.mode==='platform'?'paid':'due'}</span></div>
      <div class="r2">${unitName(b.unit)} · ${fmtRange(b.ci,b.co)} · ${nightsWord(nights(b.ci,b.co))} · ${plat(b)}</div>
      <div class="r3 ${b.status==='flagged'?'strong':'att'}">${STATUS[b.status].label}. ${why}</div>
    </button>
    <div class="acts">${acts}</div>
  </div>`;
}
function guestRow(b, kind){
  const when = kind==='out' ? (b.note && b.note.includes('late') ? '1 PM' : '11 AM') : kind==='in' ? '1 PM' : 'now';
  const verb = kind==='out' ? 'leaves' : kind==='in' ? 'arrives' : `staying till ${fmtD(b.co)}`;
  return `<button class="row rowmain sched" data-act="open-booking" data-id="${b.id}">
    <span class="when">${when}</span>
    <span class="grow"><div class="r1"><span>${esc(b.guest.name)} <span class="verb">${verb}</span></span></div>
    <div class="r2">${unitName(b.unit)} · ${guestsWord(b.guest.pax)} · ${CH[b.channel].name} · ${payShort(b)}</div></span>
  </button>`;
}
function bookingRow(b){
  return `<button class="row rowmain" data-act="open-booking" data-id="${b.id}">
    <div class="r1"><span>${esc(b.guest.name)}</span><span class="meta">${inr(b.amount)}</span></div>
    <div class="r2">${fmtRange(b.ci,b.co)} · ${nightsWord(nights(b.ci,b.co))} · ${unitName(b.unit)} · ${CH[b.channel].name}</div>
    ${statusLine(b)}
  </button>`;
}
function keyLegend(){
  return `<div class="key"><span><i></i>Confirmed</span><span><i class="pend"></i>Not verified yet</span><span><i class="flag"></i>Likely fake</span><span><i class="block"></i>Blocked</span></div>`;
}

/* two-week timeline, both units */
function timeline14(){
  const days=[]; for (let i=-1;i<13;i++) days.push(addDays(TODAY,i));
  const ws=days[0], we=addDays(ws,14);
  const hdr = `<div></div><div class="days">${days.map(d=>{const dt=D(d);return `<span class="${d===TODAY?'today':''}">${DOW[dt.getDay()][0]}<b>${dt.getDate()}</b></span>`;}).join('')}</div>`;
  const todayCol = days.indexOf(TODAY)+1;
  const rows = UNITS.map(u => {
    const items = [...bookings.filter(b=>b.unit===u.id && live(b) && overlaps(b,ws,we)).map(b=>({kind:'b',b})), ...blocks.filter(b=>b.unit===u.id && overlaps(b,ws,we)).map(b=>({kind:'blk',b}))];
    const bars = `<i class="tc" style="grid-column:${todayCol}"></i>` + items.map(({kind,b}) => {
      const s=Math.max(0,nights(ws,b.ci)), e=Math.min(14,nights(ws,b.co)); if (e<=s) return '';
      const cont = (b.ci<ws?'cont-l ':'')+(b.co>we?'cont-r':'');
      if (kind==='blk') return `<button class="bar block ${cont}" style="grid-column:${s+1}/${e+1}" data-act="block-info" data-id="${b.id}" aria-label="Blocked, ${esc(b.reason)}">${e-s>=2?'Blocked':''}</button>`;
      return `<button class="bar ${barClass(b)} ${cont}" style="grid-column:${s+1}/${e+1}" data-act="open-booking" data-id="${b.id}" aria-label="${esc(b.guest.name)}, ${fmtRange(b.ci,b.co)}, ${STATUS[b.status].label}">${e-s>=2?esc(first(b.guest.name)):''}</button>`;
    }).join('');
    return `<div class="u">${esc(u.name)}</div><div class="bars">${bars}</div>`;
  }).join('');
  return `<div class="pad"><div class="tl">${hdr}${rows}</div></div>`;
}

/* month grid for one unit */
function monthGrid(unitId, ym){
  const [y,m] = ym.split('-').map(Number);
  const firstD = `${ym}-01`;
  const firstDow = (D(firstD).getDay()+6)%7;           // Monday-first
  let start = addDays(firstD, -firstDow);
  const lastDay = new Date(y, m, 0).getDate();
  const weeksN = Math.ceil((firstDow+lastDay)/7);
  const weeks=[]; for (let w=0;w<weeksN;w++){ weeks.push(start); start=addDays(start,7); }
  const barsFor = ws => {
    const we = addDays(ws,7);
    const items = [...bookings.filter(b=>b.unit===unitId && live(b) && overlaps(b,ws,we)).map(b=>({kind:'b',b})), ...blocks.filter(b=>b.unit===unitId && overlaps(b,ws,we)).map(b=>({kind:'blk',b}))];
    return items.map(({kind,b}) => {
      const s=Math.max(0,nights(ws,b.ci)), e=Math.min(7,nights(ws,b.co)); if (e<=s) return '';
      const cont = (b.ci<ws?'cont-l ':'')+(b.co>we?'cont-r':'');
      if (kind==='blk') return `<button class="bar block ${cont}" style="grid-column:${s+1}/${e+1}" data-act="block-info" data-id="${b.id}" aria-label="Blocked, ${esc(b.reason)}">${e-s>=2?'Blocked':''}</button>`;
      return `<button class="bar ${barClass(b)} ${cont}" style="grid-column:${s+1}/${e+1}" data-act="open-booking" data-id="${b.id}" aria-label="${esc(b.guest.name)}, ${fmtRange(b.ci,b.co)}, ${STATUS[b.status].label}">${e-s>=2?esc(first(b.guest.name)):''}</button>`;
    }).join('');
  };
  const rows = weeks.map(ws => {
    let days='';
    for (let i=0;i<7;i++){ const d=addDays(ws,i); const dt=D(d); days += `<button class="day ${dt.getMonth()!==m-1?'other':''} ${d<TODAY?'past':''} ${d===TODAY?'today':''}" style="grid-column:${i+1}" data-act="day" data-date="${d}" aria-label="${fmtDowLong(d)}"><span>${dt.getDate()}</span></button>`; }
    return `<div class="week">${days}${barsFor(ws)}</div>`;
  }).join('');
  return `<div class="mcal"><div class="dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>${rows}</div>`;
}

function monthNums(){
  const inOct = b => b.ci.startsWith('2026-10') && live(b);
  const rev = bookings.filter(inOct).reduce((a,b)=>a+b.amount,0);
  const octNights = bookings.filter(live).reduce((a,b)=>{ const s=b.ci<'2026-10-01'?'2026-10-01':b.ci; const e=b.co>'2026-11-01'?'2026-11-01':b.co; return a+Math.max(0,nights(s,e)); },0);
  const occ = Math.round(octNights/(31*UNITS.length)*100);
  const caught = bookings.filter(b=>b.status==='cancelled');
  return `<div class="nums">
    <div><div class="l">Bookings</div><div class="v">${inr(rev)}</div><div class="d">stays starting in Oct</div></div>
    <div><div class="l">Occupancy</div><div class="v">${occ}%</div><div class="d">${octNights} of ${31*UNITS.length} nights</div></div>
    <div><div class="l">Fake caught</div><div class="v">${caught.length}</div><div class="d">${inr(caught.reduce((a,b)=>a+b.amount,0))} of dates freed</div></div>
  </div>`;
}

/* ===== TODAY ===== */
const TABS = {};
TABS.today = () => {
  const need = bookings.filter(needsAction).sort(byCi);
  const outs = bookings.filter(b=>b.co===TODAY && live(b));
  const ins = bookings.filter(b=>b.ci===TODAY && live(b));
  const inhouse = bookings.filter(b=>b.ci<TODAY && b.co>TODAY && live(b));
  const movements = [...outs.map(b=>guestRow(b,'out')), ...ins.map(b=>guestRow(b,'in')), ...inhouse.map(b=>guestRow(b,'stay'))];
  const waitingMmt = bookings.filter(b=>b.channel==='mmt' && needsAction(b)).length;
  return { name:'Today', top: topHome(fmtDowLong(TODAY), PROPERTY, `<button class="tbtn" data-act="demo">Demo</button>`), html: `
    <section class="sec first">
      <div class="lbl ${need.length?'att':'quiet'}">${need.length?`<i class="dot"></i>Needs your attention<span class="n">${need.length}</span>`:'Nothing needs you right now'}</div>
      ${need.length ? `<div class="rows urgent">${need.map(attentionRow).join('')}</div>` : `<div class="empty">Every booking is verified and paid where it should be.</div>`}
    </section>
    <section class="sec">
      <div class="lbl">Today</div>
      ${movements.length ? `<div class="rows">${movements.join('')}</div>` : '<div class="empty">No arrivals or departures.</div>'}
      <div class="hint tight">${CARETAKER} got his Hindi briefing at 8 AM and replied.</div>
    </section>
    <section class="sec">
      <div class="sec-h"><div class="lbl">Next two weeks</div><button class="link" data-act="tab" data-tab="calendar">Full calendar</button></div>
      ${timeline14()}
    </section>
    <section class="sec">
      <div class="sec-h"><div class="lbl">October so far</div><button class="link" data-act="view" data-type="reports">Reports</button></div>
      ${monthNums()}
    </section>
    <section class="sec">
      <div class="sec-h"><div class="lbl">Platforms</div><button class="link" data-act="view" data-type="channels">Manage</button></div>
      <div class="rows">${CHANNELS_CFG.filter(c=>c.id!=='direct').map(c=>`<button class="row rowmain" data-act="view" data-type="channels"><div class="r1"><span>${CH[c.id].name}</span><span class="meta ${c.id==='mmt'&&waitingMmt?'att':''}">${c.id==='mmt'&&waitingMmt?`${waitingMmt} waiting for guest`:`synced ${esc(c.last)}`}</span></div></button>`).join('')}</div>
    </section>`};
};

/* ===== CALENDAR ===== */
TABS.calendar = () => {
  const [y,m] = state.calMonth.split('-').map(Number);
  const prev = m===1 ? `${y-1}-12` : `${y}-${String(m-1).padStart(2,'0')}`;
  const next = m===12 ? `${y+1}-01` : `${y}-${String(m+1).padStart(2,'0')}`;
  return { name:'Calendar', top: topHome(PROPERTY, 'Calendar', `<button class="tbtn" data-act="add-sheet">Add</button>`), html: `
    <section class="sec first">
      <div class="lbl">Next two weeks · both units</div>
      ${timeline14()}
    </section>
    <section class="sec">
      <div class="mnav"><button data-act="cal-month" data-ym="${prev}" aria-label="Previous month">${ic('left')}</button><h2>${MONL[m-1]} ${y}</h2><button data-act="cal-month" data-ym="${next}" aria-label="Next month">${ic('right')}</button></div>
      <div class="ttabs" role="tablist">${UNITS.map(u=>`<button role="tab" aria-pressed="${state.calUnit===u.id}" data-act="calunit" data-unit="${u.id}">${esc(u.name)}</button>`).join('')}</div>
      ${monthGrid(state.calUnit, state.calMonth)}
      ${keyLegend()}
      <div class="hint">Tap a date to see what is open on each platform, or to block it. A booking on one platform blocks the night everywhere else.</div>
    </section>`};
};

/* ===== BOOKINGS ===== */
TABS.bookings = () => {
  const f = state.bkFilter, c = state.bkChannel;
  let list = bookings.filter(b => c==='all' || b.channel===c);
  if (f==='action') list = list.filter(needsAction);
  else if (f==='upcoming') list = list.filter(b => b.ci>=TODAY && live(b) && !needsAction(b));
  else if (f==='current') list = list.filter(b => b.status==='in_house' || (b.ci<=TODAY && b.co>TODAY && live(b)));
  else if (f==='past') list = list.filter(b => b.status==='checked_out');
  else if (f==='cancelled') list = list.filter(b => b.status==='cancelled');
  list.sort((a,b)=> f==='past'||f==='cancelled' ? b.ci.localeCompare(a.ci) : a.ci.localeCompare(b.ci));
  const nAct = bookings.filter(needsAction).length;
  return { name:'Bookings', top: topHome(PROPERTY, 'Bookings', `<button class="tbtn" data-act="add-sheet">Add</button>`), html: `
    <div class="ttabs" role="tablist">
      ${[['action',`Needs action${nAct?` · ${nAct}`:''}`],['upcoming','Upcoming'],['current','Staying'],['past','Past'],['cancelled','Cancelled']].map(([k,l])=>`<button role="tab" aria-pressed="${f===k}" data-act="bkfilter" data-f="${k}">${l}</button>`).join('')}
    </div>
    <label class="sel">${c==='all'?'All platforms':CH[c].name}${ic('chevd')}<select data-change="bkch" aria-label="Platform"><option value="all" ${c==='all'?'selected':''}>All platforms</option>${Object.keys(CH).map(k=>`<option value="${k}" ${c===k?'selected':''}>${CH[k].name}</option>`).join('')}</select></label>
    <div class="rows">${list.length ? list.map(bookingRow).join('') : '<div class="empty">Nothing here.</div>'}</div>`};
};

/* ===== MESSAGES ===== */
function scheduled(){
  const out = [];
  bookings.forEach(b => {
    if (b.status==='unverified') { out.push([TODAY+'T22:33', b, 'Reminder: please confirm your booking', 'Verify pay-at-property bookings']); out.push([addDays(TODAY,1)+'T10:33', b, 'Flag as likely fake if still no reply', 'Verify pay-at-property bookings']); }
    if (b.status==='verified') out.push([TODAY+'T18:00', b, `Payment reminder · ${inr(b.pay.advance.amount)} advance`, 'Verify pay-at-property bookings']);
    if (b.status==='confirmed' && b.ci>TODAY) out.push([addDays(b.ci,-1)+'T09:00', b, 'Check-in details: address, timings, caretaker', 'Send check-in details the day before']);
    if ((b.status==='in_house'||b.status==='confirmed') && b.co>=TODAY && live(b)) out.push([addDays(b.co,1)+'T11:00', b, 'Thank-you and review request', 'Thank-you and review request']);
  });
  out.push([addDays(TODAY,1)+'T08:00', null, `Morning briefing for ${CARETAKER}, in Hindi`, 'Morning briefing']);
  return out.sort((a,b)=>a[0].localeCompare(b[0]));
}
TABS.inbox = () => {
  const items = [...threads].sort((a,b)=> b.msgs[b.msgs.length-1][2].localeCompare(a.msgs[a.msgs.length-1][2]));
  const sched = scheduled();
  return { name:'Messages', top: topHome('WhatsApp · one number for every guest', 'Messages', `<button class="tbtn" data-act="view" data-type="auto-list">Automations</button>`), html: `
    <div class="ttabs" role="tablist"><button role="tab" aria-pressed="${state.inboxMode!=='sched'}" data-act="inboxmode" data-m="chats">Chats</button><button role="tab" aria-pressed="${state.inboxMode==='sched'}" data-act="inboxmode" data-m="sched">Going out next · ${sched.length}</button></div>
    ${state.inboxMode==='sched' ? `
      <div class="rows" style="margin-top:10px">${sched.map(([ts,b,what,rule])=>`<div class="row withchev"><div class="rowmain"><div class="r1"><span>${esc(what)}</span><span class="meta">${relDay(ts)} ${fmtTime(ts)}</span></div><div class="r2">${b?esc(b.guest.name)+' · '+CH[b.channel].name:'Caretaker'} · ${esc(rule)}</div></div><button class="link" data-act="toast" data-msg="Skipped: ${esc(what)}">Skip</button></div>`).join('')}</div>
      <div class="hint">Everything Atithi will send next, so nothing goes out that you did not expect. Skip any of them, or reply yourself and the reminder is dropped.</div>` : `
      <div class="rows" style="margin-top:10px">${items.map(t => {
        const last = t.msgs[t.msgs.length-1]; const b = bookings.find(x=>x.id===t.booking);
        return `<button class="row rowmain withav" data-act="open-thread" data-id="${t.id}">
          <span class="av">${esc(t.who.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase())}</span>
          <span class="grow"><div class="r1"><span>${esc(t.who)}${t.unread?' <i class="dot" style="background:var(--ink);width:6px;height:6px;vertical-align:2px"></i>':''}</span><span class="meta">${last[2].slice(0,10)===TODAY?fmtTime(last[2]):fmtD(last[2])}</span></div>
          <div class="r2" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${last[0]==='out'?'You: ':''}${esc(last[3].replace(/\*/g,'').split('\n')[0])}</div>
          <div class="r2 faint" style="margin-top:1px">${b?`${CH[b.channel].name} · ${fmtRange(b.ci,b.co)} · ${unitName(b.unit)}`:'Caretaker · daily briefing'}</div></span>
        </button>`; }).join('')}</div>
      <div class="hint">Messages marked “sent automatically” came from an automation. Reply from here any time; guests see one business number.</div>`}`};
};

/* ===== MORE ===== */
TABS.more = () => ({ name:'More', top: topHome(`${PROPERTY}, ${CITY}`, 'More'), html: `
  <div class="rows" style="margin-top:12px">
    ${[['channels','Platforms and sync','Airbnb, Booking.com, Agoda, MakeMyTrip'],['auto-list','Automations',`${autos.length} rules · ${autos.filter(a=>a.on).length} on`],['caretaker','Caretaker view',`What ${CARETAKER} sees, in Hindi`],['reports','Reports','Bookings, occupancy, platform mix'],['payments','Payments','Razorpay · UPI and cards · settles to HDFC ••4410'],['team','Property, units and people','2 units · 2 people'],['notifs-settings','Notifications','Push · quiet hours 11 PM to 7 AM']].map(([t,l,d])=>`<button class="row withchev" data-act="view" data-type="${t}"><span class="rowmain"><div class="r1"><span>${l}</span></div><div class="r2">${d}</div></span>${ic('chev','chev')}</button>`).join('')}
  </div>
  <section class="sec">
    <div class="lbl">This prototype</div>
    <div class="rows">
      <button class="row withchev" data-act="demo"><span class="rowmain"><div class="r1"><span>Walk through a pay-at-property booking</span></div><div class="r2">The MakeMyTrip story, step by step</div></span>${ic('chev','chev')}</button>
      <button class="row withchev" data-act="intro"><span class="rowmain"><div class="r1"><span>How to use this demo</span></div><div class="r2">What to tap first</div></span>${ic('chev','chev')}</button>
      <button class="row withchev" data-act="reset"><span class="rowmain"><div class="r1"><span>Reset sample data</span></div><div class="r2">Back to Sunday 11 October, 12:40 PM</div></span>${ic('chev','chev')}</button>
    </div>
  </section>
  <p class="hint center" style="margin-top:28px">Atithi · working prototype with sample data · nothing here sends a real message</p>`});

/* ===== DETAIL VIEWS ===== */
const VIEWS = {};

function platformSync(b){
  if (b.status==='cancelled') return OTAS.map(ch=>({ch, label:'Open', detail: ch===b.channel?'Cancelled here':'Night released'}));
  const received = b.tl[0][0];
  const fresh = (new Date(NOW)-new Date(received)) < 20*6e4;
  return OTAS.map(ch => {
    if (ch===b.channel) return {ch, label:'Source', detail:'The booking came from here'};
    if (fresh) return {ch, label:'Updating', att:true, detail:`Pushed at ${fmtTime(received)} · usually applied within minutes`};
    return {ch, label:'Blocked', detail:'Calendar closed for these nights'};
  });
}

VIEWS.booking = ({id}) => {
  const b = bookings.find(x=>x.id===id);
  const st = STATUS[b.status];
  const adv = b.pay.advance;
  const acts = [];
  if (b.status==='unverified') acts.push(`<button class="btn primary" data-act="remind" data-id="${b.id}">Remind on WhatsApp</button>`, `<button class="btn" data-act="mark-confirmed" data-id="${b.id}">Mark confirmed</button>`);
  if (b.status==='verified') acts.push(`<button class="btn primary" data-act="remind-pay" data-id="${b.id}">Resend payment link</button>`, `<button class="btn" data-act="mark-confirmed" data-id="${b.id}">Advance received</button>`);
  if (b.status==='flagged') acts.push(`<button class="btn danger" data-act="cancel-release" data-id="${b.id}">Cancel and release dates</button>`, `<button class="btn" data-act="mark-confirmed" data-id="${b.id}">Guest confirmed by phone</button>`);
  if (b.status==='confirmed' && b.ci===TODAY) acts.push(`<button class="btn primary" data-act="checkin" data-id="${b.id}">Mark checked in</button>`);
  if (b.status==='in_house') acts.push(`<button class="btn primary" data-act="checkout" data-id="${b.id}">Mark checked out</button>`);
  acts.push(`<button class="btn" data-act="call" data-id="${b.id}">Call</button>`, `<button class="btn" data-act="open-thread-for" data-id="${b.id}">WhatsApp</button>`);
  if (live(b) && b.status!=='checked_out' && b.status!=='flagged') acts.push(`<button class="btn" data-act="cancel-sheet" data-id="${b.id}">Cancel</button>`);
  const sync = platformSync(b);
  const caretakerLine = b.ci===TODAY ? 'Briefed this morning, will receive the guests at 1 PM' : b.ci>TODAY ? `Will be briefed on ${fmtD(addDays(b.ci,-1))} evening and on ${fmtD(b.ci)} at 8 AM` : 'Handled this stay';
  return { title: esc(b.guest.name), plain:b.guest.name, kicker: `${CH[b.channel].name} · ${esc(b.ref)}`, tab: 'bookings', html: `
    <div class="head">
      <div class="dates">${fmtRange(b.ci,b.co)} · ${unitName(b.unit)}</div>
      <div class="sub">${nightsWord(nights(b.ci,b.co))} · ${guestsWord(b.guest.pax)} · ${plat(b)}</div>
      <div class="status ${st.strong?'strong':st.att?'att':''}">${st.label}. ${payWords(b).charAt(0).toUpperCase()+payWords(b).slice(1)}.</div>
      <div class="acts">${acts.join('')}</div>
    </div>
    <section class="sec">
      <div class="lbl">Details</div>
      <div class="rows" style="margin-bottom:10px"><div class="row twocol">
        <div><div class="k">Check-in</div><div class="v">${fmtDow(b.ci)}</div><div class="s">from 1 PM</div></div>
        <div><div class="k">Checkout</div><div class="v">${fmtDow(b.co)}</div><div class="s">by 11 AM</div></div>
      </div></div>
      <div class="kv">
        <div><span class="k">Total</span><span class="v">${inr(b.amount)}</span></div>
        <div><span class="k">${b.pay.mode==='platform'?'Payout':'To collect'}</span><span class="v">${b.pay.mode==='platform'?`about ${inr(Math.round(b.amount*0.85))} after commission`:(adv&&adv.status==='received'?inr(b.amount-adv.amount):inr(b.amount))+' at check-in'}</span></div>
        <div><span class="k">Phone</span><span class="v">${esc(b.guest.phone)}</span></div>
        <div><span class="k">Platform ref</span><span class="v">${esc(b.ref)}</span></div>
      </div>
    </section>
    <section class="sec">
      <div class="sec-h"><div class="lbl">On every platform</div><span class="small muted">${sync.filter(r=>!r.att).length} of 4 closed</span></div>
      <div class="kv">${sync.map(r=>`<div><span class="k">${CH[r.ch].name}</span><span class="v ${r.att?'att':''}">${r.label}${r.att||r.label==='Open'?` <span class="faint">· ${r.detail}</span>`:''}</span></div>`).join('')}</div>
      ${b.channel==='mmt'&&live(b)?`<div class="hint tight"><button class="link" data-act="ext" data-name="InGo-MMT">Open on InGo-MMT</button> to see the same booking on the MakeMyTrip side.</div>`:''}
    </section>
    ${b.note?`<section class="sec"><div class="lbl">Notes</div><div class="note">${esc(b.note)}</div></section>`:''}
    <section class="sec">
      <div class="lbl">What happened</div>
      <ol class="hist">${b.tl.map(([ts,tone,txt])=>`<li class="${tone}"><span class="tt">${esc(txt)}</span><span class="ts">${fmtTs(ts)}</span></li>`).join('')}</ol>
    </section>
    <section class="sec">
      <div class="lbl">Caretaker</div>
      <div class="hint tight">${CARETAKER} · ${caretakerLine}.</div>
    </section>`};
};

VIEWS.thread = ({id}) => {
  const t = threads.find(x=>x.id===id); t.unread = 0;
  const b = bookings.find(x=>x.id===t.booking);
  let lastDay = '';
  const msgs = t.msgs.map((m,i) => {
    const [dir, auto, ts, text, qr] = m;
    let sep = '';
    if (ts.slice(0,10)!==lastDay){ lastDay = ts.slice(0,10); sep = `<div class="daysep">${relDay(ts)}</div>`; }
    const body = esc(text).replace(/\*(.+?)\*/g,'<strong>$1</strong>');
    const isLast = i===t.msgs.length-1;
    return `${sep}<div class="msg ${dir} ${auto?'auto':''}">${body}<div class="meta">${fmtTime(ts)}</div></div>
      ${qr && isLast ? `<div class="qr">${qr.map(q=>`<button class="btn" data-act="qr" data-id="${t.id}" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`:''}`;
  }).join('');
  return { title: esc(t.who), plain:t.who, kicker: b ? `${CH[b.channel].name} · ${fmtRange(b.ci,b.co)} · ${unitName(b.unit)}` : 'Caretaker · WhatsApp', right: b?`<button class="tbtn" data-act="open-booking" data-id="${b.id}">Booking</button>`:'', tab:'inbox', html: `
    <div class="thread">${msgs}</div>
    ${b && needsAction(b) && t.msgs[t.msgs.length-1][4] ? `<div class="hint" style="margin:0 0 12px">The two buttons are what the guest sees. Tap one to play the guest: “Haan, aa rahe hain” sends the advance link, “Cancel karna hai” releases the dates everywhere.</div>`:''}
    <form class="compose" data-form="send" data-id="${t.id}"><input placeholder="Message ${esc(first(t.who))}" aria-label="Message" autocomplete="off"><button type="submit" aria-label="Send">${ic('send')}</button></form>`};
};

VIEWS['auto-list'] = () => ({ title:'Automations', kicker:'Rules that run for you', tab:'more', html: `
  <div class="rows" style="margin-top:8px">${autos.map(a=>`<div class="row withchev">
    <button class="rowmain" data-act="view" data-type="auto" data-id="${a.id}"><div class="r1"><span>${esc(a.name)}</span></div><div class="r2">${esc(a.trig)} → ${esc(a.act.split(' · ')[0])}</div><div class="r3 faint" style="margin-top:2px">Ran ${a.runs} times in 30 days${a.system?' · built in':''}</div></button>
    <button class="sw" role="switch" aria-checked="${a.on}" aria-label="${esc(a.name)}" data-act="toggle-auto" data-id="${a.id}"></button>
  </div>`).join('')}</div>
  <div class="hint">Turn any rule off and Atithi stops doing that one thing. Messages always go from your WhatsApp business number.</div>`});

VIEWS.auto = ({id}) => { const a = autos.find(x=>x.id===id); return { title: esc(a.name), plain:a.name, kicker:'Automation', tab:'more', right:`<button class="sw" role="switch" aria-checked="${a.on}" aria-label="Enabled" data-act="toggle-auto" data-id="${a.id}" data-stay="1" style="margin-top:12px"></button>`, html: `
  <div class="kv" style="margin-top:8px">
    <div><span class="k">When</span><span class="v">${esc(a.trig)}</span></div>
    <div><span class="k">Only if</span><span class="v">${esc(a.cond)}</span></div>
    <div><span class="k">Then</span><span class="v">${esc(a.act)}</span></div>
    <div><span class="k">Status</span><span class="v">${a.on?'On':'Off'} · ran ${a.runs} times in 30 days</span></div>
  </div>
  ${a.tpl?`<section class="sec"><div class="sec-h"><div class="lbl">Message the guest receives</div><span class="small faint">blue fields fill in</span></div>
    <div class="thread" style="padding-top:4px"><div class="msg out">${esc(a.tpl).replace(/\{\{(\w+)\}\}/g,'<span class="var">$1</span>').replace(/\*(.+?)\*/g,'<strong>$1</strong>')}<div class="meta">preview</div></div></div>
    <div class="acts" style="margin-top:0"><button class="btn" data-act="toast" data-msg="The message editor opens here in the real app.">Edit message</button><button class="btn" data-act="toast" data-msg="A test would go to your own number.">Send me a test</button></div></section>`
  :`<div class="hint">This rule is part of how Atithi works and has no message to edit.</div>`}
  <section class="sec"><div class="lbl">Recent runs</div><div class="kv">${[['Rahul Verma','Today 10:33 AM'],['Priya Sharma','9 Oct, 6:06 PM'],['Amit Joshi','1 Oct, 7:41 PM']].slice(0, Math.min(3, Math.max(1,a.runs))).map(([n,t])=>`<div><span class="k">${n}</span><span class="v">${t} · sent</span></div>`).join('')}</div></section>`}; };

VIEWS.channels = () => ({ title:'Platforms and sync', kicker:'Where your bookings come from', tab:'more', html: `
  <div class="rows" style="margin-top:8px">${CHANNELS_CFG.map(c=>`<div class="row">
    <div class="r1"><span>${CH[c.id].name}</span><span class="meta ${c.health==='warn'?'att':''}">${c.last?`synced ${esc(c.last)}`:'manual'}</span></div>
    <div class="r2">${esc(c.method)}</div>
    <div class="r3">${esc(c.note)}</div>
    ${c.ext?`<div class="acts" style="margin-top:8px"><button class="link" data-act="ext" data-name="${esc(c.ext)}">Open ${esc(c.ext)}</button><button class="link" data-act="toast" data-msg="Sync requested: ${CH[c.id].name}">Sync now</button></div>`:''}
  </div>`).join('')}</div>
  <section class="sec"><div class="lbl">Channel manager</div><div class="hint tight">Does the actual two-way sync with all four platforms. Health checked every 5 minutes, last full reconcile 12:35 PM. If it ever lags, Atithi still reads every platform’s confirmation email within a minute and tells you what to block by hand.</div></section>`});

VIEWS.caretaker = () => {
  const outs = bookings.filter(b=>b.co===TODAY && live(b));
  const ins = bookings.filter(b=>b.ci===TODAY && live(b));
  const tmrw = bookings.filter(b=>b.ci===addDays(TODAY,1) && live(b));
  const HD = ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'];
  const row = (b, kind) => `<div class="row">
      <div class="r1"><span>${esc(b.guest.name)}</span><span class="meta">${kind==='out'?(b.note&&b.note.includes('late')?'1 PM':'11 AM'):'1 PM के बाद'}</span></div>
      <div class="r2">${unitName(b.unit)} · ${b.guest.pax} लोग · ${kind==='in'?(b.pay.mode==='platform'?'पैसा ले लिया गया है, कुछ नहीं लेना':`चेक-इन पर ${inr(b.amount-((b.pay.advance&&b.pay.advance.status==='received')?b.pay.advance.amount:0))} लेना है`):'सफ़ाई के बाद बताएँ'}</div>
      <div class="acts"><button class="btn primary" data-act="${kind==='out'?'checkout':'checkin'}" data-id="${b.id}">${kind==='out'?'गेस्ट चले गए':'गेस्ट आ गए'}</button><button class="btn" data-act="call" data-id="${b.id}">कॉल</button></div>
    </div>`;
  return { title:`आज · ${HD[D(TODAY).getDay()]}, ${D(TODAY).getDate()} अक्टूबर`, plain:'Caretaker view', kicker:`${CARETAKER} · ${PROPERTY}`, tab:'more', right:`<button class="tbtn" data-act="lang">हिंदी</button>`, html: `
    <div class="ct">
      <div style="margin-top:8px"><button class="btn big full" data-act="toast" data-msg="${OWNER} को कॉल कर रहे हैं…">${ic('phone')}मालिक को कॉल करें</button></div>
      <section class="sec"><div class="lbl">चेक-आउट</div>${outs.length?`<div class="rows">${outs.map(b=>row(b,'out')).join('')}</div>`:'<div class="empty">आज कोई चेक-आउट नहीं</div>'}</section>
      <section class="sec"><div class="lbl">चेक-इन</div>${ins.length?`<div class="rows">${ins.map(b=>row(b,'in')).join('')}</div>`:'<div class="empty">आज कोई चेक-इन नहीं</div>'}</section>
      <section class="sec"><div class="lbl">आज के काम</div><div class="rows">
        <button class="row rowmain" data-act="toast" data-msg="काम पूरा · मालिक को बता दिया"><div class="r1"><span>Main Villa की सफ़ाई</span><span class="meta">बाक़ी</span></div><div class="r2">1 PM से 4 PM तक · कल कोई चेक-इन नहीं</div></button>
        <button class="row rowmain" data-act="toast" data-msg="काम पूरा · मालिक को बता दिया"><div class="r1"><span>Garden Cottage तैयार</span><span class="meta">हो गया</span></div><div class="r2">तौलिये, पानी की बोतलें, AC चेक</div></button>
      </div></section>
      <section class="sec"><div class="lbl">कल · ${HD[D(addDays(TODAY,1)).getDay()]}, ${D(addDays(TODAY,1)).getDate()} अक्टूबर</div><div class="hint tight">${tmrw.length?tmrw.map(b=>`चेक-इन: ${esc(b.guest.name)} · ${unitName(b.unit)}`).join('<br>'):'कोई चेक-इन नहीं · Sneha जी Garden Cottage में रहेंगी'}</div></section>
      <p class="hint center" style="margin-top:28px">बड़े बटन, कम शब्द। यह व्यू केयरटेकर के फ़ोन पर अलग लिंक से खुलता है।</p>
    </div>`};
};

VIEWS.reports = () => {
  const inOct = b => b.ci.startsWith('2026-10') && live(b);
  const by = {}; Object.keys(CH).forEach(c=>by[c]=0);
  bookings.filter(inOct).forEach(b=>by[b.channel]+=b.amount);
  const max = Math.max(...Object.values(by));
  const total = Object.values(by).reduce((a,b)=>a+b,0);
  const payLater = bookings.filter(b=>b.pay.mode==='pay_at_property' && b.ci.startsWith('2026-10'));
  const caught = payLater.filter(b=>b.status==='cancelled').length;
  const conv = payLater.filter(b=>['confirmed','checked_out','in_house'].includes(b.status)).length;
  return { title:'Reports', kicker:'October 2026', tab:'more', html: `
    <div style="margin-top:8px">${monthNums()}</div>
    <section class="sec"><div class="sec-h"><div class="lbl">Bookings by platform</div><span class="small muted num">${inr(total)}</span></div>
      <div class="pad">${Object.keys(CH).sort((a,b)=>by[b]-by[a]).map(c=>`<div class="hbar"><div>${CH[c].name}</div><div class="trk"><div class="fillb" style="width:${max?Math.round(by[c]/max*100):0}%"></div></div><div class="val">${inr(by[c])}</div></div>`).join('')}</div>
      <div class="hint tight">Gross value of stays starting in October. Platform commission comes off in the payout report.</div></section>
    <section class="sec"><div class="lbl">Pay-at-property bookings this month</div>
      <div class="kv">
        <div><span class="k">Received</span><span class="v">${payLater.length}</span></div>
        <div><span class="k">Verified and paid</span><span class="v">${conv}</span></div>
        <div><span class="k">Still being verified</span><span class="v">${payLater.filter(needsAction).length}</span></div>
        <div><span class="k">Cancelled as fake</span><span class="v">${caught}</span></div>
      </div>
      <div class="hint">Before, each fake pay-later booking silently blocked a weekend on every platform. Now the dates are released within 24 hours if the guest never confirms.</div></section>`};
};

VIEWS.team = () => ({ title:'Property, units and people', kicker:PROPERTY, tab:'more', html: `
  <section class="sec first"><div class="lbl">Units</div><div class="kv">${UNITS.map(u=>`<div><span class="k">${esc(u.name)}</span><span class="v">${esc(u.meta)} · on 4 platforms</span></div>`).join('')}</div></section>
  <section class="sec"><div class="lbl">People</div><div class="kv">
    <div><span class="k">${OWNER} (you)</span><span class="v">Owner · full access · push and WhatsApp alerts</span></div>
    <div><span class="k">${CARETAKER}</span><span class="v">Caretaker · today view only · Hindi · ${CARETAKER_PHONE}</span></div>
  </div></section>
  <section class="sec"><div class="lbl">House rules sent to guests</div><div class="note">Check-in 1 PM · Checkout 11 AM · Quiet after 10 PM · No parties · Pets on request. Edit these once and every message updates.</div></section>`});

VIEWS.payments = () => ({ title:'Payments', kicker:'Advance collection', tab:'more', html: `
  <div class="kv" style="margin-top:8px">
    <div><span class="k">Razorpay</span><span class="v">Connected · UPI, cards, net banking</span></div>
    <div><span class="k">Settles to</span><span class="v">HDFC ••4410 · T+2 days</span></div>
  </div>
  <section class="sec"><div class="lbl">Advance rules</div><div class="rows">
    <div class="row"><div class="r1"><span>Pay-at-property bookings</span></div><div class="r2">Ask for ₹3,000 (villa) or ₹2,500 (cottage) within 24 hours</div></div>
    <div class="row"><div class="r1"><span>Direct bookings</span></div><div class="r2">Ask for 30% to confirm</div></div>
    <div class="row"><div class="r1"><span>Links expire</span></div><div class="r2">24 hours after sending, then the dates are released</div></div>
    <div class="row withchev"><div class="rowmain"><div class="r1"><span>Also ask MakeMyTrip guests for the advance</span></div><div class="r2">Off means a WhatsApp “yes” is enough. Check MMT partner terms before turning this on.</div></div><button class="sw" role="switch" aria-checked="true" aria-label="Ask MakeMyTrip guests for advance" data-act="sw-toggle"></button></div>
  </div></section>
  <section class="sec"><div class="lbl">Recent</div><div class="kv">
    ${[['Priya Sharma','₹2,500 · link sent 9 Oct','pending',true],['Vikram Singh','₹3,000 · UPI · 7 Oct','received'],['Kabir Malhotra','₹5,000 · card · 6 Oct','received']].map(([n,a,s,att])=>`<div><span class="k">${n}</span><span class="v ${att?'att':''}">${a} · ${s}</span></div>`).join('')}
  </div></section>`});

VIEWS['notifs-settings'] = () => ({ title:'Notifications', kicker:'What reaches your phone', tab:'more', html: `
  <div class="rows" style="margin-top:8px">${[['New booking on any platform',true],['Pay-at-property booking needs verification',true],['Guest confirmed or paid the advance',true],['No reply after 24 hours (likely fake)',true],['Possible double booking',true],['Guest message on WhatsApp',true],['Daily summary at 8 AM',false],['Checkout completed',false]].map(([l,on])=>`<div class="row withchev"><div class="rowmain"><div class="r1"><span>${l}</span></div></div><button class="sw" role="switch" aria-checked="${on}" aria-label="${l}" data-act="sw-toggle"></button></div>`).join('')}</div>
  <div class="hint">Quiet hours 11 PM to 7 AM: only possible double bookings come through. Everything else waits for the morning summary.</div>`});

/* ---------- sheets ---------- */
function openSheet(html){ $('sheet').innerHTML = `<div class="grab"></div>${html}`; $('sheet').classList.add('open'); $('scrim').classList.add('open'); $('sheet').scrollTop = 0; }
function closeSheet(){ $('sheet').classList.remove('open'); $('scrim').classList.remove('open'); }

function daySheet(d){
  const rows = UNITS.map(u => {
    const b = bookings.find(x=>x.unit===u.id && live(x) && overlaps(x,d,addDays(d,1)));
    const bl = blocks.find(x=>x.unit===u.id && overlaps(x,d,addDays(d,1)));
    if (b) return `<button class="row rowmain" data-act="open-booking" data-id="${b.id}"><div class="r1"><span>${esc(u.name)}</span><span class="meta">${esc(b.guest.name)}</span></div><div class="r2">${fmtRange(b.ci,b.co)} · ${CH[b.channel].name}</div>${statusLine(b)}<div class="r3 faint" style="margin-top:2px">Blocked on ${OTAS.filter(c=>c!==b.channel).map(c=>CH[c].name).join(', ')}</div></button>`;
    if (bl) return `<div class="row withchev"><div class="rowmain"><div class="r1"><span>${esc(u.name)}</span><span class="meta">blocked</span></div><div class="r2">${esc(bl.reason)} · ${fmtRange(bl.ci,bl.co)}</div></div><button class="link" data-act="unblock" data-id="${bl.id}">Unblock</button></div>`;
    return `<div class="row withchev"><div class="rowmain"><div class="r1"><span>${esc(u.name)}</span><span class="meta">open</span></div><div class="r2">Bookable on Airbnb, Booking.com, Agoda and MakeMyTrip</div></div><button class="link" data-act="block-form" data-unit="${u.id}" data-date="${d}">Block</button></div>`;
  }).join('');
  openSheet(`<h2>${fmtDowLong(d)}${d===TODAY?' · today':''}</h2><div class="lead">Tap a booking to open it, or block an open unit.</div><div class="rows">${rows}</div><div class="acts"><button class="btn full" data-act="direct-form" data-date="${d}">Add a direct booking for this night</button></div>`);
}

function addSheet(){
  openSheet(`<h2>Add</h2><div class="rows" style="margin-top:8px">
    <button class="row withchev" data-act="direct-form" data-date="${addDays(TODAY,7)}"><span class="rowmain"><div class="r1"><span>Direct booking</span></div><div class="r2">From a WhatsApp or phone enquiry. Gets the same verification and advance link.</div></span>${ic('chev','chev')}</button>
    <button class="row withchev" data-act="block-form" data-unit="villa" data-date="${addDays(TODAY,1)}"><span class="rowmain"><div class="r1"><span>Block dates</span></div><div class="r2">Own stay, maintenance. Closes the nights on every platform.</div></span>${ic('chev','chev')}</button>
  </div>`);
}
function directForm(d){
  openSheet(`<h2>Direct booking</h2><div class="lead">Creates the booking, blocks the dates on all four platforms and sends the WhatsApp confirmation with an advance link.</div>
  <form data-form="add-direct">
    <div class="field"><label>Guest name</label><input name="name" required placeholder="Full name" autocomplete="off"></div>
    <div class="field2">
      <div class="field"><label>WhatsApp number</label><input name="phone" placeholder="+91" autocomplete="off"></div>
      <div class="field"><label>Guests</label><input name="pax" type="number" min="1" value="2"></div>
    </div>
    <div class="field"><label>Unit</label><select name="unit">${UNITS.map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select></div>
    <div class="field2">
      <div class="field"><label>Check-in</label><input name="ci" type="date" value="${d}" required></div>
      <div class="field"><label>Nights</label><input name="n" type="number" min="1" value="1"></div>
    </div>
    <div class="field2">
      <div class="field"><label>Total (₹)</label><input name="amount" type="number" min="0" value="12000"></div>
      <div class="field"><label>Advance to ask (₹)</label><input name="adv" type="number" min="0" value="3600"></div>
    </div>
    <div class="acts"><button class="btn primary full" type="submit">Add and send WhatsApp</button></div>
  </form>`);
}
function blockForm(unit, d){
  openSheet(`<h2>Block dates</h2><div class="lead">Closes the nights on Airbnb, Booking.com, Agoda and MakeMyTrip.</div>
  <form data-form="block">
    <div class="field"><label>Unit</label><select name="unit">${UNITS.map(u=>`<option value="${u.id}" ${u.id===unit?'selected':''}>${esc(u.name)}</option>`).join('')}</select></div>
    <div class="field2">
      <div class="field"><label>First night</label><input name="ci" type="date" value="${d}" required></div>
      <div class="field"><label>Nights</label><input name="n" type="number" min="1" value="1"></div>
    </div>
    <div class="field"><label>Reason</label><input name="reason" placeholder="Own stay, maintenance…" value="Blocked by you" autocomplete="off"></div>
    <div class="acts"><button class="btn primary full" type="submit">Block</button></div>
  </form>`);
}

function demoSheet(){
  const s = state.demoStep;
  const step = (n, t, d, btn) => `<li><span class="n ${s>n?'done':s===n?'cur':''}">${s>n?ic('check'):n+1}</span><div><div class="t">${t}</div><div class="d">${d}</div>${s===n?btn:''}</div></li>`;
  openSheet(`<h2>A pay-at-property booking lands</h2><div class="lead">The story to show. Each step is what Atithi does on its own, in order.</div>
  <ol class="steps">
    ${step(0,'A new MakeMyTrip booking arrives','Pay at property, 20–21 Oct, Main Villa. Atithi reads the MMT email, holds the dates on every platform and asks the guest to confirm on WhatsApp.',`<div class="acts"><button class="btn primary" data-act="demo-1">Receive the booking</button></div>`)}
    ${step(1,'The guest taps “Haan, aa rahe hain”','Status moves to “guest said yes”. A Razorpay link for the ₹3,000 advance goes out on its own.',`<div class="acts"><button class="btn primary" data-act="demo-2">Guest confirms</button><button class="btn" data-act="demo-flag">24 hours pass, no reply</button></div>`)}
    ${step(2,'The advance is paid','The booking becomes Confirmed. You get a push, the guest gets a receipt, and Ramesh bhai gets the check-in on his list for the 20th.',`<div class="acts"><button class="btn primary" data-act="demo-3">Guest pays ₹3,000</button></div>`)}
    ${step(3,'Done','Compare with Amit Joshi under Bookings › Cancelled: he never replied, and his dates were released within 24 hours.','')}
  </ol>
  <div class="acts">${s>0?`<button class="btn" data-act="demo-reset">Reset the demo</button>`:''}${s===3?`<button class="btn" data-act="open-booking" data-id="bdemo">Open the booking</button>`:''}</div>`);
}

function introSheet(){
  openSheet(`<h2>Atithi</h2><div class="lead">A working prototype with sample data for ${PROPERTY}, ${CITY}. The clock is stopped at Sunday 11 October, 12:40 PM. Nothing here sends a real message.</div>
  <ol class="steps">
    <li><span class="n">1</span><div><div class="t">Today</div><div class="d">Two bookings need you. Tap one to see what Atithi already did.</div></div></li>
    <li><span class="n">2</span><div><div class="t">Demo, top right</div><div class="d">Run the MakeMyTrip pay-at-property story step by step.</div></div></li>
    <li><span class="n">3</span><div><div class="t">Calendar</div><div class="d">Both units, every platform. Tap any date.</div></div></li>
    <li><span class="n">4</span><div><div class="t">Messages</div><div class="d">Open a chat and tap a guest’s button to play the guest.</div></div></li>
    <li><span class="n">5</span><div><div class="t">More › Caretaker view</div><div class="d">What ${CARETAKER} sees, in Hindi.</div></div></li>
  </ol>
  <div class="acts"><button class="btn primary full" data-act="close-sheet">Start</button></div>`);
}

/* ---------- toasts ---------- */
function toast(title, body){
  const el = document.createElement('div'); el.className='toast';
  el.innerHTML = `<b>${esc(title)}</b>${body?`<div>${esc(body)}</div>`:''}`;
  $('toasts').appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(),300); }, 4200);
}

/* ---------- navigation ---------- */
function hashFor(){
  const v = state.view;
  if (!v) return state.tab;
  if (v.type==='booking') return 'b-'+v.id;
  if (v.type==='thread') return 't-'+v.id;
  if (v.type==='auto') return 'a-'+v.id;
  return 'v-'+v.type;
}
function applyHash(h){
  h = (h||'').replace(/^#/,'');
  if (TABS[h]) { state.view=null; state.tab=h; return true; }
  if (h.startsWith('b-') && bookings.find(b=>b.id===h.slice(2))) { state.view={type:'booking', id:h.slice(2), tab:'bookings'}; return true; }
  if (h.startsWith('t-') && threads.find(t=>t.id===h.slice(2))) { state.view={type:'thread', id:h.slice(2), tab:'inbox'}; return true; }
  if (h.startsWith('a-') && autos.find(a=>a.id===h.slice(2))) { state.view={type:'auto', id:h.slice(2), tab:'more'}; return true; }
  if (h.startsWith('v-') && VIEWS[h.slice(2)]) { state.view={type:h.slice(2), tab:'more'}; return true; }
  return false;
}
function go(){ closeSheet(); render(); const h='#'+hashFor(); if (location.hash!==h) history.pushState(null,'',h); }
window.addEventListener('popstate', () => { closeSheet(); if (applyHash(location.hash)) render(); });

/* ---------- actions ---------- */
function addTl(b, tone, txt, ts=NOW){ b.tl = b.tl.filter(t=>t[1]!=='pend'); b.tl.push([ts,tone,txt]); }
function threadFor(b){ let t = threads.find(x=>x.booking===b.id); if (!t){ t={id:'t'+b.id, booking:b.id, who:b.guest.name, unread:0, msgs:[]}; threads.unshift(t);} return t; }
const bk = el => bookings.find(x=>x.id===el.dataset.id);

const ACTIONS = {
  tab: el => { state.view=null; state.tab=el.dataset.tab; go(); },
  back: () => { state.view=null; go(); },
  view: el => { state.view={type:el.dataset.type, id:el.dataset.id, tab: state.view?state.view.tab:state.tab}; go(); },
  'open-booking': el => { state.view={type:'booking', id:el.dataset.id, tab: state.view?state.view.tab:state.tab}; go(); },
  'open-thread': el => { state.view={type:'thread', id:el.dataset.id, tab:'inbox'}; go(); },
  'open-thread-for': el => { const t=threadFor(bk(el)); state.view={type:'thread', id:t.id, tab:'inbox'}; go(); },
  'cal-month': el => { state.calMonth=el.dataset.ym; render(); },
  calunit: el => { state.calUnit=el.dataset.unit; render(); },
  bkfilter: el => { state.bkFilter=el.dataset.f; render(); },
  inboxmode: el => { state.inboxMode=el.dataset.m; render(); },
  day: el => daySheet(el.dataset.date),
  'close-sheet': () => closeSheet(),
  intro: () => introSheet(),
  toast: el => { closeSheet(); toast(el.dataset.msg); },
  ext: el => toast(`Opening ${el.dataset.name}`, 'The real app deep-links to the exact extranet page.'),
  call: el => { const b=bk(el); toast(`Calling ${b.guest.name}`, b.guest.phone.startsWith('via') ? `Through ${CH[b.channel].name}’s masked number` : b.guest.phone); },
  lang: () => toast('भाषा', 'Caretaker view: Hindi, Marathi or English'),
  'sw-toggle': el => { el.setAttribute('aria-checked', el.getAttribute('aria-checked')!=='true'); },
  'toggle-auto': (el, ev) => { ev.stopPropagation(); const a=autos.find(x=>x.id===el.dataset.id); a.on=!a.on; el.setAttribute('aria-checked', a.on); toast(a.on?'Automation on':'Automation off', a.name); if (el.dataset.stay) render(); },
  'add-sheet': () => addSheet(),
  'direct-form': el => directForm(el.dataset.date),
  'block-form': el => blockForm(el.dataset.unit, el.dataset.date),
  unblock: el => { blocks = blocks.filter(b=>b.id!==el.dataset.id); closeSheet(); toast('Unblocked', 'The nights are open again on every platform.'); render(); },
  'block-info': el => { const bl=blocks.find(b=>b.id===el.dataset.id); openSheet(`<h2>Blocked · ${fmtRange(bl.ci,bl.co)}</h2><div class="lead">${esc(bl.reason)} · ${unitName(bl.unit)}. Closed on all four platforms.</div><div class="acts"><button class="btn full" data-act="unblock" data-id="${bl.id}">Unblock these nights</button></div>`); },
  remind: el => { const b=bk(el); const t=threadFor(b); t.msgs.push(['out','',NOW,`Reminder: Kripya apni ${fmtRange(b.ci,b.co)} booking confirm karein 🙏 Bina confirmation ke dates hold nahi ho payengi.`, ['Haan, aa rahe hain','Cancel karna hai']]); addTl(b,'warn','Reminder sent by you'); b.tl.push([NOW,'pend','Waiting for a reply']); toast('Reminder sent', `${b.guest.name} · WhatsApp`); render(); },
  'remind-pay': el => { const b=bk(el); const t=threadFor(b); t.msgs.push(['out','',NOW,`Reminder: ₹${new Intl.NumberFormat('en-IN').format(b.pay.advance.amount)} advance abhi pending hai. Link: rzp.io/l/amberwood-${b.pay.advance.amount} · Dates sirf payment ke baad lock hoti hain.`]); addTl(b,'warn','Payment link resent by you'); b.tl.push([NOW,'pend','Waiting for the advance']); toast('Payment link resent', `${b.guest.name} · ${inr(b.pay.advance.amount)}`); render(); },
  'mark-confirmed': el => { const b=bk(el); b.status='confirmed'; if (b.pay.advance){ b.pay.advance.status='received'; } addTl(b,'good', b.pay.advance?`Advance ${inr(b.pay.advance.amount)} marked received by you · booking confirmed`:'Marked confirmed by you'); const t=threadFor(b); t.msgs.push(['out','auto',NOW,`Booking confirmed ✅ ${fmtRange(b.ci,b.co)} · ${unitName(b.unit)}. Check-in details aapko ek din pehle mil jayengi. Shukriya ${first(b.guest.name)} ji!`]); toast('Confirmed', `${b.guest.name} · ${fmtRange(b.ci,b.co)}`); render(); },
  checkin: el => { const b=bk(el); b.status='in_house'; addTl(b,'good',`Checked in · marked by ${state.view&&state.view.type==='caretaker'?CARETAKER:'you'}`); toast('Checked in', `${b.guest.name} · ${unitName(b.unit)}`); render(); },
  checkout: el => { const b=bk(el); b.status='checked_out'; addTl(b,'good',`Checked out · marked by ${state.view&&state.view.type==='caretaker'?CARETAKER:'you'}`); b.tl.push([addDays(TODAY,1)+'T11:00','pend','Thank-you and review request go tomorrow 11 AM']); toast('Checked out', `${b.guest.name} · review request goes tomorrow 11 AM`); render(); },
  'cancel-sheet': el => { const b=bk(el); openSheet(`<h2>Cancel this booking?</h2><div class="lead">${esc(b.guest.name)} · ${fmtRange(b.ci,b.co)} · ${unitName(b.unit)}. The nights reopen on every platform${b.channel==='mmt'?', and the MMT extranet opens so you can cancel there too':''}.</div><div class="acts"><button class="btn danger" data-act="cancel-release" data-id="${b.id}">Yes, cancel and release</button><button class="btn" data-act="close-sheet">Keep it</button></div>`); },
  'cancel-release': el => { const b=bk(el); b.status='cancelled'; addTl(b,'crit', b.channel==='mmt'?'Cancelled by you on the MMT extranet · dates released everywhere':'Cancelled by you · dates released everywhere'); const t=threadFor(b); t.msgs.push(['out','auto',NOW,`Aapki ${fmtRange(b.ci,b.co)} booking cancel kar di gayi hai kyunki confirmation nahi mili. Agar aap aana chahte hain to yahin message karein, dates available hone par hum dobara book kar denge.`]); toast('Cancelled, dates released', `${fmtRange(b.ci,b.co)} is open again on Airbnb, Booking.com, Agoda and MakeMyTrip`); state.view={type:'booking', id:b.id, tab:'bookings'}; go(); },
  qr: el => { const t=threads.find(x=>x.id===el.dataset.id); const b=bookings.find(x=>x.id===t.booking); const q=el.dataset.q; t.msgs.push(['in','',NOW,q]);
    if (q.startsWith('Haan')){ b.status='verified'; b.pay.advance.status='link_sent'; addTl(b,'good','Guest tapped “Haan, aa rahe hain”'); b.tl.push([NOW,'acc',`Payment link for ${inr(b.pay.advance.amount)} sent`]); b.tl.push([NOW,'pend','Waiting for the advance · reminder in 12 hours']); t.msgs.push(['out','auto',NOW,`Shukriya ${first(b.guest.name)} ji! Advance ${inr(b.pay.advance.amount)} ke liye secure link:\nrzp.io/l/amberwood-${b.pay.advance.amount}\n\nPayment hote hi booking confirm ho jayegi.`]); toast('Guest confirmed', `${b.guest.name} · advance link sent automatically`); }
    else { b.status='cancelled'; addTl(b,'crit','Guest tapped “Cancel karna hai” · dates released everywhere'); t.msgs.push(['out','auto',NOW,'Theek hai, booking cancel kar di gayi hai. Dhanyavaad batane ke liye 🙏']); toast('Guest cancelled', `${fmtRange(b.ci,b.co)} released on every platform`); }
    render(); },
  demo: () => demoSheet(),
  'demo-1': () => {
    if (bookings.find(x=>x.id==='bdemo')) { state.demoStep = Math.max(state.demoStep,1); closeSheet(); return; }
    const b = { id:'bdemo', ref:'NH7203460022', channel:'mmt', unit:'villa', guest:{name:'Arjun Mehta', phone:'+91 99••• ••318', pax:6}, ci:'2026-10-20', co:'2026-10-21', amount:14500, pay:{mode:'pay_at_property', advance:{amount:3000, status:'not_sent'}}, status:'unverified',
      tl:[[NOW,'warn','Booking received from MakeMyTrip · pay at property (read from the InGo email)'],[NOW,'acc','Dates held on Airbnb, Booking.com, Agoda'],[NOW,'acc','WhatsApp sent: please confirm, ₹3,000 advance'],[NOW,'pend','Waiting for a reply · reminder in 12 hours, flagged at 24']] };
    bookings.push(b);
    threads.unshift({ id:'tbdemo', booking:'bdemo', who:'Arjun Mehta', unread:0, msgs:[['out','auto',NOW,`Namaste Arjun ji 🙏\nAapki booking *Amberwood Stays, Lonavala · Main Villa* ke liye *20–21 Oct (1 night, 6 guests)* MakeMyTrip par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹3,000 advance pay karna hoga, balance ₹11,500 check-in par.`, ['Haan, aa rahe hain','Cancel karna hai']]] });
    state.demoStep = 1; state.view=null; state.tab='today'; go();
    toast('New booking from MakeMyTrip', 'Arjun Mehta · 20–21 Oct · pay at property · verification started');
    setTimeout(()=>toast('Dates held on Airbnb, Booking.com and Agoda', '20 Oct · Main Villa'), 1400);
  },
  'demo-2': () => { const b=bookings.find(x=>x.id==='bdemo'); const t=threads.find(x=>x.id==='tbdemo'); if (!b) return demoSheet(); t.msgs.push(['in','','2026-10-11T12:49','Haan, aa rahe hain']); b.status='verified'; b.pay.advance.status='link_sent'; addTl(b,'good','Guest tapped “Haan, aa rahe hain”','2026-10-11T12:49'); b.tl.push(['2026-10-11T12:49','acc','Payment link for ₹3,000 sent']); b.tl.push(['2026-10-11T12:49','pend','Waiting for the advance · reminder in 12 hours']); t.msgs.push(['out','auto','2026-10-11T12:49','Shukriya Arjun ji! Advance ₹3,000 ke liye secure link:\nrzp.io/l/amberwood-3000\n\nPayment hote hi booking confirm ho jayegi aur check-in details ek din pehle mil jayengi.']); state.demoStep=2; state.view={type:'thread', id:'tbdemo', tab:'inbox'}; go(); toast('Arjun Mehta confirmed', 'Advance link for ₹3,000 sent automatically'); },
  'demo-3': () => { const b=bookings.find(x=>x.id==='bdemo'); const t=threads.find(x=>x.id==='tbdemo'); if (!b) return demoSheet(); b.status='confirmed'; b.pay.advance.status='received'; addTl(b,'good','Advance ₹3,000 received via Razorpay (UPI)','2026-10-11T12:55'); b.tl.push(['2026-10-11T12:55','good','Booking confirmed · you and Ramesh bhai notified']); b.tl.push(['2026-10-19T09:00','pend','Check-in details go to the guest on 19 Oct, 9 AM']); t.msgs.push(['out','auto','2026-10-11T12:55','Advance ₹3,000 mil gaya, shukriya Arjun ji ✅ Aapki booking *20–21 Oct · Main Villa* ab confirmed hai. Balance ₹11,500 check-in par. Check-in details 19 Oct ko mil jayengi.']); state.demoStep=3; state.view={type:'booking', id:'bdemo', tab:'bookings'}; go(); toast('₹3,000 received from Arjun Mehta', 'Booking confirmed. 20–21 Oct is now locked on every platform.'); },
  'demo-flag': () => { const b=bookings.find(x=>x.id==='bdemo'); const t=threads.find(x=>x.id==='tbdemo'); if (!b) return demoSheet(); t.msgs.push(['out','auto','2026-10-12T00:33','Reminder: Kripya apni 20–21 Oct booking confirm karein 🙏']); t.msgs.push(['out','auto','2026-10-12T06:33','Last reminder: 20–21 Oct booking aaj 10:33 AM tak confirm na hone par cancel maani jayegi.']); b.status='flagged'; addTl(b,'warn','Reminder 1 sent · no reply','2026-10-12T00:33'); b.tl.push(['2026-10-12T06:33','warn','Reminder 2 sent · no reply']); b.tl.push(['2026-10-12T10:33','crit','Flagged: 24 hours, no reply, no advance · likely fake']); b.tl.push(['2026-10-12T10:33','pend','Your call: cancel on MMT and release the dates, or phone the guest']); state.demoStep=3; state.view=null; state.tab='today'; go(); toast('Likely fake booking', 'Arjun Mehta never replied in 24 hours. Cancel on MMT with one tap.'); },
  'demo-reset': () => { bookings = bookings.filter(b=>b.id!=='bdemo'); threads = threads.filter(t=>t.id!=='tbdemo'); state.demoStep=0; state.view=null; state.tab='today'; go(); toast('Demo reset'); },
  reset: () => { closeSheet(); location.hash='#today'; location.reload(); },
};

const FORMS = {
  send: f => { const inp=f.querySelector('input'); const text=inp.value.trim(); if (!text) return; const t=threads.find(x=>x.id===f.dataset.id); t.msgs.push(['out','',NOW,text]); inp.value=''; render(); },
  'add-direct': f => {
    const fd = new FormData(f);
    const ci = fd.get('ci') || addDays(TODAY,7), n = Math.max(1, Number(fd.get('n'))||1), amount = Number(fd.get('amount'))||0, adv = Number(fd.get('adv'))||0;
    const unit = fd.get('unit'), name = (fd.get('name')||'Guest').trim();
    const clash = bookings.find(x=>x.unit===unit && live(x) && overlaps(x, ci, addDays(ci,n))) || blocks.find(x=>x.unit===unit && overlaps(x, ci, addDays(ci,n)));
    if (clash) { toast('Those nights are not free', `${unitName(unit)} already has ${clash.guest?clash.guest.name:'a block'} on ${fmtRange(clash.ci,clash.co)}.`); return; }
    const b = { id:'bd'+Date.now(), ref:'DIR-0'+(100+bookings.filter(x=>x.channel==='direct').length), channel:'direct', unit, guest:{name, phone:(fd.get('phone')||'').trim()||'not given', pax:Number(fd.get('pax'))||2}, ci, co:addDays(ci,n), amount, pay:{mode:'pay_at_property', advance:{amount:adv, status:'not_sent'}}, status:'unverified',
      tl:[[NOW,'good','Direct booking added by you'],[NOW,'acc','Dates blocked on Airbnb, Booking.com, Agoda, MakeMyTrip'],[NOW,'acc',`WhatsApp sent: please confirm, ${inr(adv)} advance`],[NOW,'pend','Waiting for a reply · reminder in 12 hours']] };
    bookings.push(b);
    threads.unshift({ id:'t'+b.id, booking:b.id, who:name, unread:0, msgs:[['out','auto',NOW,`Namaste ${first(name)} ji 🙏\nAapki booking *${PROPERTY}, ${CITY} · ${unitName(unit)}* ke liye *${fmtRange(b.ci,b.co)} (${nightsWord(n)}, ${guestsWord(b.guest.pax)})* receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ${inr(adv)} advance pay karna hoga, balance ${inr(amount-adv)} check-in par.`, ['Haan, aa rahe hain','Cancel karna hai']]] });
    state.view={type:'booking', id:b.id, tab:'bookings'}; go();
    toast('Direct booking added', `${name} · ${fmtRange(b.ci,b.co)} · dates blocked on all four platforms`);
  },
  block: f => {
    const fd = new FormData(f);
    const ci = fd.get('ci') || addDays(TODAY,1), n = Math.max(1, Number(fd.get('n'))||1), unit = fd.get('unit');
    blocks.push({ id:'blk'+Date.now(), unit, ci, co:addDays(ci,n), reason:(fd.get('reason')||'Blocked by you').trim() });
    closeSheet(); state.view=null; state.tab='calendar'; state.calMonth=ci.slice(0,7); state.calUnit=unit; go();
    toast(`Blocked ${fmtRange(ci,addDays(ci,n))} · ${unitName(unit)}`, 'Closed on Airbnb, Booking.com, Agoda and MakeMyTrip.');
  },
};

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  const fn = ACTIONS[el.dataset.act]; if (fn) fn(el, ev);
});
document.addEventListener('submit', ev => {
  const f = ev.target.closest('[data-form]'); if (!f) return; ev.preventDefault();
  const fn = FORMS[f.dataset.form]; if (fn) fn(f);
});
document.addEventListener('change', ev => {
  const el = ev.target.closest('[data-change]'); if (!el) return;
  if (el.dataset.change==='bkch') { state.bkChannel = el.value; render(); }
});
document.addEventListener('keydown', ev => { if (ev.key==='Escape') closeSheet(); });
window.addEventListener('scroll', () => { $('topbar').classList.toggle('scrolled', window.scrollY > 6); }, { passive:true });

/* ---------- start ---------- */
applyHash(location.hash);
render();
history.replaceState(null,'','#'+hashFor());
(function(){
  let seen = false;
  try { seen = localStorage.getItem('atithi-intro')==='1'; } catch(e){}
  if (!seen && !state.view) { introSheet(); try { localStorage.setItem('atithi-intro','1'); } catch(e){} }
})();
