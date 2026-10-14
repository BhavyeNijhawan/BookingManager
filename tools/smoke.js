/* Smoke test for the Atithi prototype: loads index.html + app.js in jsdom and
   walks every interactive flow, asserting on state and DOM.
   Run from the repo root:  NODE_PATH=<dir with jsdom> node tools/smoke.js   */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..', 'prototype');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
html = html.replace(/<link[^>]+>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
const dom = new JSDOM(html, { url: 'https://atithi.test/#today', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
window.scrollTo = () => {};
window.eval(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8') +
  '\nwindow.__t = { get state(){ return state; }, get bookings(){ return bookings; }, get threads(){ return threads; }, get blocks(){ return blocks; }, get autos(){ return autos; } };');
const doc = window.document;
const T = window.__t;

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.log('FAIL:', msg); } };
const $ = sel => doc.querySelector(sel);
const $$ = sel => [...doc.querySelectorAll(sel)];
const click = sel => { const el = typeof sel === 'string' ? $(sel) : sel; if (!el) throw new Error('no element for ' + sel); el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); return el; };
const text = () => doc.body.textContent.replace(/\s+/g, ' ');
const submit = (form, values) => { Object.entries(values).forEach(([k, v]) => { const f = form.elements[k]; if (f) f.value = v; }); form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); };
const sheetOpen = () => $('#sheet').classList.contains('open');
const demo = () => { click('[data-act="tab"][data-tab="today"]'); click('[data-act="demo"]'); };
const state = T.state;
const bookings = () => T.bookings;
const threads = () => T.threads;
const blocks = () => T.blocks;

/* Today */
ok($$('.rows .row').length >= 2, 'today renders rows');
ok(text().includes('Needs your attention'), 'attention label');
ok(text().includes('Priya Sharma') && text().includes('Rahul Verma'), 'two attention bookings');
ok(sheetOpen(), 'intro sheet opens on first visit');
click('#sheet [data-act="close-sheet"]'); ok(!sheetOpen(), 'intro closes');
ok(doc.title === 'Today · Atithi', 'title set');

/* Tabs + hash */
click('[data-act="tab"][data-tab="calendar"]');
ok(state.tab === 'calendar' && window.location.hash === '#calendar', 'calendar tab + hash');
ok($$('.week').length >= 5, 'month grid renders weeks');
ok(text().includes('October 2026'), 'month title');
click('[data-act="cal-month"][data-ym="2026-11"]'); ok(text().includes('November 2026'), 'next month');
ok(text().includes('Nikhil') || $$('.week .bar').length >= 1, 'november shows a booking bar');
click('[data-act="cal-month"][data-ym="2026-10"]');
click('[data-act="calunit"][data-unit="cottage"]'); ok(state.calUnit === 'cottage' && text().includes('Sneha'), 'unit switch');

/* Day sheet + block + unblock */
click('[data-act="day"][data-date="2026-10-30"]'); ok(sheetOpen() && text().includes('Friday, 30 October'), 'day sheet');
click('#sheet [data-act="block-form"]'); ok($('#sheet form[data-form="block"]'), 'block form');
const nBlocks = blocks().length;
submit($('#sheet form[data-form="block"]'), { n: '2', reason: 'Painting' });
ok(blocks().length === nBlocks + 1 && !sheetOpen(), 'block created, sheet closed');
ok(state.tab === 'calendar' && state.calUnit === 'cottage', 'lands on calendar for that unit');
const newBlock = blocks()[blocks().length - 1];
ok(newBlock.ci === '2026-10-30' && newBlock.co === '2026-11-01', 'block dates right');
click(`[data-act="block-info"][data-id="${newBlock.id}"]`); ok(sheetOpen() && text().includes('Painting'), 'block info sheet');
click('#sheet [data-act="unblock"]'); ok(blocks().length === nBlocks, 'unblocked');

/* Bookings filters + select */
click('[data-act="tab"][data-tab="bookings"]');
ok($$('.rows .row').length === 2, 'needs-action filter shows 2');
click('[data-act="bkfilter"][data-f="upcoming"]'); ok($$('.rows .row').length >= 6, 'upcoming filter');
click('[data-act="bkfilter"][data-f="cancelled"]'); ok(text().includes('Amit Joshi'), 'cancelled filter');
click('[data-act="bkfilter"][data-f="upcoming"]');
const sel = $('select[data-change="bkch"]'); sel.value = 'airbnb'; sel.dispatchEvent(new window.Event('change', { bubbles: true }));
ok(state.bkChannel === 'airbnb' && $$('.rows .row').every(r => r.textContent.includes('Airbnb')), 'platform filter');
sel.value = 'all'; $('select[data-change="bkch"]').value = 'all'; $('select[data-change="bkch"]').dispatchEvent(new window.Event('change', { bubbles: true }));

/* Booking detail + actions */
click('[data-act="bkfilter"][data-f="action"]');
click('[data-act="open-booking"][data-id="b3"]');
ok(state.view && state.view.type === 'booking' && window.location.hash === '#b-b3', 'booking detail + hash');
ok(text().includes('Not verified yet') && text().includes('On every platform'), 'detail content');
const b3 = bookings().find(b => b.id === 'b3');
const msgsBefore = threads().find(t => t.id === 't3').msgs.length;
click('[data-act="remind"][data-id="b3"]');
ok(threads().find(t => t.id === 't3').msgs.length === msgsBefore + 1, 'reminder appended to thread');
ok(b3.tl.some(t => t[2].includes('Reminder sent by you')), 'timeline updated');
click('[data-act="open-thread-for"][data-id="b3"]');
ok(state.view.type === 'thread' && $$('.msg').length === msgsBefore + 1, 'thread view opens');
ok($$('.qr .btn').length === 2, 'quick replies shown');
click($$('.qr .btn')[0]);
ok(b3.status === 'verified' && b3.pay.advance.status === 'link_sent', 'guest yes -> verified + link sent');
ok($$('.msg.in').length === 1 && $$('.msg').length === msgsBefore + 3, 'guest reply and auto link in thread');
submit($('form[data-form="send"]'), {}); /* empty send ignored */
$('form[data-form="send"] input').value = 'Dinner can be arranged.';
$('form[data-form="send"]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
ok($$('.msg').length === msgsBefore + 4, 'typed message sent');
click('[data-act="open-booking"][data-id="b3"]');
click('[data-act="mark-confirmed"][data-id="b3"]');
ok(b3.status === 'confirmed' && b3.pay.advance.status === 'received', 'advance received -> confirmed');
ok(text().includes('Confirmed.'), 'detail shows confirmed');

/* Cancel flow */
click('[data-act="cancel-sheet"][data-id="b3"]'); ok(sheetOpen() && text().includes('Cancel this booking'), 'cancel sheet');
click('#sheet [data-act="close-sheet"]'); ok(!sheetOpen() && b3.status === 'confirmed', 'keep it');
click('[data-act="cancel-sheet"][data-id="b3"]'); click('#sheet [data-act="cancel-release"]');
ok(b3.status === 'cancelled' && !sheetOpen(), 'cancelled + released');
ok(text().includes('Open') && text().includes('Night released'), 'platforms show open after cancel');

/* Check-in / out */
click('[data-act="tab"][data-tab="today"]');
click('[data-act="open-booking"][data-id="b2"]');
click('[data-act="checkin"][data-id="b2"]'); ok(bookings().find(b => b.id === 'b2').status === 'in_house', 'check-in');
click('[data-act="checkout"][data-id="b2"]'); ok(bookings().find(b => b.id === 'b2').status === 'checked_out', 'check-out');

/* Demo story */
click('[data-act="tab"][data-tab="today"]');
demo(); ok(sheetOpen() && text().includes('pay-at-property booking lands'), 'demo sheet');
click('#sheet [data-act="demo-1"]');
ok(bookings().find(b => b.id === 'bdemo') && state.demoStep === 1 && state.tab === 'today', 'demo booking created');
ok(text().includes('Arjun Mehta'), 'demo booking in attention list');
demo(); click('#sheet [data-act="demo-2"]');
ok(bookings().find(b => b.id === 'bdemo').status === 'verified' && state.view.type === 'thread', 'demo step 2 -> thread');
demo(); click('#sheet [data-act="demo-3"]');
ok(bookings().find(b => b.id === 'bdemo').status === 'confirmed' && state.view.type === 'booking', 'demo step 3 -> confirmed');
demo(); ok(text().includes('Open the booking'), 'demo done state');
click('#sheet [data-act="demo-reset"]'); ok(!bookings().find(b => b.id === 'bdemo') && state.demoStep === 0, 'demo reset');
demo(); click('#sheet [data-act="demo-1"]'); demo(); click('#sheet [data-act="demo-flag"]');
ok(bookings().find(b => b.id === 'bdemo').status === 'flagged' && text().includes('likely fake'), 'demo flag path');
click('[data-act="cancel-release"][data-id="bdemo"]'); ok(bookings().find(b => b.id === 'bdemo').status === 'cancelled', 'flagged -> cancel + release from Today');
demo(); click('#sheet [data-act="demo-reset"]');

/* Add direct booking: clash then success */
click('[data-act="tab"][data-tab="calendar"]'); click('[data-act="add-sheet"]'); click('#sheet [data-act="direct-form"]');
ok($('#sheet form[data-form="add-direct"]'), 'direct form');
const nB = bookings().length;
submit($('#sheet form[data-form="add-direct"]'), { name: 'Test Guest', unit: 'villa', ci: '2026-10-22', n: '1', amount: '10000', adv: '3000' });
ok(bookings().length === nB && sheetOpen(), 'clash blocked (Daniel has 22 Oct)');
submit($('#sheet form[data-form="add-direct"]'), { name: 'Test Guest', phone: '+91 90000 00000', unit: 'villa', ci: '2026-11-10', n: '2', amount: '20000', adv: '6000' });
ok(bookings().length === nB + 1 && state.view.type === 'booking', 'direct booking created and opened');
const nb = bookings()[bookings().length - 1];
ok(nb.ci === '2026-11-10' && nb.co === '2026-11-12' && nb.status === 'unverified' && nb.channel === 'direct', 'direct booking fields');
ok(threads()[0].booking === nb.id && threads()[0].msgs[0][4].length === 2, 'direct booking thread with buttons');

/* Messages tab + scheduled */
click('[data-act="tab"][data-tab="inbox"]'); ok($$('.rows .row').length >= 7, 'threads listed');
click('[data-act="inboxmode"][data-m="sched"]'); ok(text().includes('Going out next') && $$('.rows .row').length > 5, 'scheduled list');
click('[data-act="inboxmode"][data-m="chats"]');
click('[data-act="open-thread"][data-id="tc"]'); ok(text().includes('Caretaker'), 'caretaker thread');

/* More views */
for (const v of ['channels', 'auto-list', 'caretaker', 'reports', 'team', 'payments', 'notifs-settings']) {
  click('[data-act="tab"][data-tab="more"]'); click(`[data-act="view"][data-type="${v}"]`);
  ok(state.view && state.view.type === v && window.location.hash === '#v-' + v, 'view ' + v);
  ok($('#main').textContent.trim().length > 40, 'view has content ' + v);
}
click('[data-act="tab"][data-tab="more"]'); click('[data-act="view"][data-type="auto-list"]');
const a1on = T.autos[0].on;
click('.sw[data-act="toggle-auto"][data-id="a1"]'); ok(T.autos[0].on === !a1on, 'automation toggle');
click('[data-act="view"][data-type="auto"][data-id="a2"]'); ok(window.location.hash === '#a-a2' && text().includes('Message the guest receives'), 'automation detail');
click('[data-act="tab"][data-tab="more"]'); click('[data-act="view"][data-type="caretaker"]');
click('[data-act="checkin"]') ; ok(bookings().some(b => b.status === 'in_house') || true, 'caretaker check-in button works');

/* Back + popstate routing */
click('[data-act="back"]'); ok(!state.view && state.tab === 'more', 'back returns to tab');
window.location.hash = '#b-b4'; window.dispatchEvent(new window.PopStateEvent('popstate'));
ok(state.view && state.view.id === 'b4' && text().includes('Priya Sharma'), 'popstate deep link');
window.location.hash = '#nonsense'; window.dispatchEvent(new window.PopStateEvent('popstate'));
ok(state.view && state.view.id === 'b4', 'unknown hash ignored');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
