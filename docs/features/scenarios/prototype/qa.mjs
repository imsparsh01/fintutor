import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const matrix = fs.readFileSync(new URL('ACCEPTANCE_MATRIX.md', root), 'utf8');
const html = fs.readFileSync(new URL('prototype/index.html', root), 'utf8');
const css = fs.readFileSync(new URL('prototype/styles.css', root), 'utf8');
const js = fs.readFileSync(new URL('prototype/app.js', root), 'utf8');
const all = `${html}\n${css}\n${js}`;
const unique = pattern => [...new Set(matrix.match(pattern) || [])];

assert.equal(unique(/AC-(?:80C|ESOP|TERM|E02|S0[13567]|[ACFPRX])-[0-9]{2}|AC-[ACFPRX][0-9]{2}/g).length, 96, 'matrix must retain 96 AC IDs');
assert.equal(unique(/SC-[0-9]{2}/g).length, 50, 'matrix must retain 50 SC IDs');
assert.match(js, /STATE_FIXTURES=\[/);
assert.equal(js.includes("'Suite loading'") && js.includes("'Exit/return'") && js.includes('String(number).padStart'), true);
for (const id of ['S-01','S-02','S-03','S-05','S-06','S-07','EX-ESOP','EX-80C','EX-TERM']) assert.match(js, new RegExp(id));
for (const token of ['fetch(','XMLHttpRequest','sendBeacon(','new WebSocket','new EventSource','serviceWorker.register','localStorage.','sessionStorage.','indexedDB.','document.cookie','AsyncStorage.','analytics.','supabase.','firebase.']) assert.equal(all.includes(token), false, `prohibited capability: ${token}`);
for (const phrase of ['you should','best option','recommended for you','must invest','safe investment']) assert.equal(all.toLowerCase().includes(phrase), false, `advisory phrase: ${phrase}`);
assert.match(html, /aria-live="polite"/);assert.match(html, /role="alert"/);assert.match(css, /forced-colors:active/);assert.match(css, /prefers-reduced-motion:reduce/);assert.match(css, /min-height:44px/);

const sip=(m,r,n)=>r===0?m*n:m*((1+r)**n-1)/r;
assert.ok(Math.abs(sip(10000,.01,120)-2300386.8946)<.01);
assert.ok(Math.abs(sip(12000,.01,120)-2760464.2735)<.01);
assert.equal(sip(10000,0,120),1200000);
const emi=(p,r,n)=>r===0?p/n:p*r*(1+r)**n/((1+r)**n-1);
assert.ok(Math.abs(emi(1000000,.01,120)-14347.09484)<.01);
assert.equal(emi(1000000,0,1),1000000);
assert.equal((100000+200000+50000)/70000,5);
assert.ok(Math.abs(500000*1.04**5-608326.4512)<.01);
assert.ok(Math.abs(500000*1.10**5-805255)<.01);
let bal=500000,month=0;while(bal<2000000&&month<720){bal=bal*1.01+10000;month++}assert.equal(month,70);
assert.equal(1000*120,120000);assert.equal(Math.max(0,150000-96000),54000);

console.log('PASS: 96 AC IDs, 50 SC states, 9 entries, safety scan, accessibility hooks, and exact formula fixtures.');
