/* Every caretaker-facing string, in Hindi (Devanagari) and English. Numbers, times and ₹ stay in
   Western digits in both, as in the UX brief. Names of units and guests are not translated. */

export type Lang = "hi" | "en";

const HI_DAYS = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HI_MONTHS = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parts = (iso: string) => {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return { dow: d.getUTCDay(), day: d.getUTCDate(), month: d.getUTCMonth() };
};

export interface Strings {
  greeting: string;
  today: (iso: string) => string;
  tomorrowDate: (iso: string) => string;
  callOwner: string;
  callingOwner: (owner: string) => string;
  calling: (name: string) => string;
  checkouts: string;
  checkins: string;
  tasks: string;
  tomorrow: string;
  people: (n: number) => string;
  after: (time: string) => string;
  lateCheckout: string;
  guestLeft: string;
  guestArrived: string;
  call: string;
  callLabel: (name: string) => string;
  doneAt: (time: string) => string;
  done: string;
  paid: string;
  collect: (amount: string) => string;
  noCheckouts: string;
  noCheckins: string;
  markDone: string;
  taskToast: string;
  taskToastSub: string;
  tomorrowNone: string;
  tomorrowIn: (names: string) => string;
  tomorrowOut: (names: string) => string;
  stays: (first: string, unit: string) => string;
  offline: string;
  offlineSub: string;
  langLabel: string;
  task: {
    clean: { title: (unit: string) => string; when: string; detail: string };
    ready: { title: (unit: string) => string; when: string; detail: string };
  };
}

export const STRINGS: Record<Lang, Strings> = {
  hi: {
    greeting: "नमस्ते रमेश भाई",
    today: (iso) => {
      const p = parts(iso);
      return `आज, ${HI_DAYS[p.dow]} ${p.day} ${HI_MONTHS[p.month]}`;
    },
    tomorrowDate: (iso) => {
      const p = parts(iso);
      return `${HI_DAYS[p.dow]} ${p.day} ${HI_MONTHS[p.month]}`;
    },
    callOwner: "मालिक को कॉल करें",
    callingOwner: (owner) => `${owner} जी को कॉल कर रहे हैं…`,
    calling: (name) => `${name} को कॉल कर रहे हैं…`,
    checkouts: "चेक-आउट",
    checkins: "चेक-इन",
    tasks: "आज के काम",
    tomorrow: "कल",
    people: (n) => `${n} लोग`,
    after: (t) => `${t} के बाद`,
    lateCheckout: "देर से चेक-आउट",
    guestLeft: "गेस्ट चले गए",
    guestArrived: "गेस्ट आ गए",
    call: "कॉल",
    callLabel: (name) => `${name} को कॉल करें`,
    doneAt: (t) => `हो गया, ${t}`,
    done: "हो गया",
    paid: "पैसा ले लिया गया है, कुछ नहीं लेना",
    collect: (amount) => `चेक-इन पर ${amount} लेना है`,
    noCheckouts: "आज कोई चेक-आउट नहीं",
    noCheckins: "आज कोई चेक-इन नहीं",
    markDone: "काम पूरा",
    taskToast: "काम पूरा, मालिक को बता दिया",
    taskToastSub: "नेट न हो तो भी सेव हो गया",
    tomorrowNone: "कोई चेक-इन या चेक-आउट नहीं",
    tomorrowIn: (names) => `चेक-इन: ${names}`,
    tomorrowOut: (names) => `चेक-आउट: ${names}`,
    stays: (first, unit) => `${first} जी ${unit} में रहेंगे`,
    offline: "हर टैप बिना नेट के भी सेव होता है",
    offlineSub: "नेट आने पर मालिक को अपने आप भेज देंगे।",
    langLabel: "भाषा",
    task: {
      clean: { title: (u) => `${u} की सफ़ाई`, when: "1 PM से 4 PM", detail: "चादरें, तौलिये, बाथरूम" },
      ready: { title: (u) => `${u} तैयार`, when: "1 PM से पहले", detail: "तौलिये, पानी की बोतलें, AC चेक" },
    },
  },
  en: {
    greeting: "Namaste, Ramesh bhai",
    today: (iso) => {
      const p = parts(iso);
      return `Today, ${EN_DAYS[p.dow]} ${p.day} ${EN_MONTHS[p.month]}`;
    },
    tomorrowDate: (iso) => {
      const p = parts(iso);
      return `${EN_DAYS[p.dow]} ${p.day} ${EN_MONTHS[p.month]}`;
    },
    callOwner: "Call the owner",
    callingOwner: (owner) => `Calling ${owner}…`,
    calling: (name) => `Calling ${name}…`,
    checkouts: "Leaving today",
    checkins: "Arriving today",
    tasks: "Today’s work",
    tomorrow: "Tomorrow",
    people: (n) => `${n} ${n === 1 ? "person" : "people"}`,
    after: (t) => `after ${t}`,
    lateCheckout: "Late checkout",
    guestLeft: "Guest has left",
    guestArrived: "Guest has arrived",
    call: "Call",
    callLabel: (name) => `Call ${name}`,
    doneAt: (t) => `Done at ${t}`,
    done: "Done",
    paid: "Already paid, collect nothing",
    collect: (amount) => `Collect ${amount} at check-in`,
    noCheckouts: "No one leaves today",
    noCheckins: "No one arrives today",
    markDone: "Mark done",
    taskToast: "Done, the owner has been told",
    taskToastSub: "Saved even without internet",
    tomorrowNone: "No one arrives or leaves",
    tomorrowIn: (names) => `Arriving: ${names}`,
    tomorrowOut: (names) => `Leaving: ${names}`,
    stays: (first, unit) => `${first} stays in ${unit}`,
    offline: "Every tap saves, even without internet",
    offlineSub: "It reaches the owner as soon as the phone is back online.",
    langLabel: "Language",
    task: {
      clean: { title: (u) => `Clean ${u}`, when: "1 PM to 4 PM", detail: "Sheets, towels, bathrooms" },
      ready: { title: (u) => `${u} ready`, when: "Before 1 PM", detail: "Towels, water bottles, AC checked" },
    },
  },
};
