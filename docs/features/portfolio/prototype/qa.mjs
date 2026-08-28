import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=path.dirname(new URL(import.meta.url).pathname);
const feature=path.resolve(root,'..');
const read=file=>fs.readFileSync(file,'utf8');
const html=read(path.join(root,'index.html'));
const css=read(path.join(root,'styles.css'));
const js=read(path.join(root,'app.js'));
const matrix=read(path.join(feature,'ACCEPTANCE_MATRIX.md'));
const evidencePath=path.join(feature,'QA_EVIDENCE.md');
const evidence=fs.existsSync(evidencePath)?read(evidencePath):'';
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};

const forbidden=[/fetch\s*\(/,/XMLHttpRequest/,/localStorage/,/sessionStorage/,/indexedDB/,/document\.cookie/,/serviceWorker/,/sendBeacon/,/WebSocket/,/EventSource/];
for(const pattern of forbidden)check(!pattern.test(html+css+js),`Forbidden API present: ${pattern}`);
for(const scenario of ['complete','empty','mixed','manage','delete','teaching','health','recovery','isolation','all-routes'])check(js.includes(`${scenario}:`)||html.includes(`value="${scenario}"`),`Missing scenario: ${scenario}`);
for(const fixture of ['Aarav','Mira','Kabir','Meera'])check(js.includes(`${fixture}:`),`Missing fixture account: ${fixture}`);
for(const behavior of ['save-edit','confirm-category','lost-response','delete-conflict','delete-success','fail-context','save-context','offline-cache','offline-empty','permission','switch','signout','unowned'])check(js.includes(behavior),`Missing behavior: ${behavior}`);

check((html.match(/<h1/g)||[]).length===0,'Static shell must not add a competing page h1');
check(html.includes('aria-live="polite"')&&html.includes('role="alert"'),'Missing live status or alert semantics');
check(html.includes('<dialog')&&html.includes('aria-labelledby="dialog-title"'),'Dialog title is not associated');
check(css.includes('min-height:44px'),'44px target baseline missing');
check(css.includes('prefers-reduced-motion:reduce'),'Reduced-motion override missing');
check(css.includes('[data-theme=light]')&&css.includes('[data-theme=dark]'),'Explicit light/dark themes missing');
check(css.includes('@media(max-width:430px)'),'Mobile collapse missing');
check(!/[—–]/.test(html+js),'Visible prototype copy contains a forbidden long dash');

const ids=[...matrix.matchAll(/\| (AC-[A-Z]\d{2}) \|/g)].map(match=>match[1]);
check(ids.length===96,`Expected 96 acceptance criteria, found ${ids.length}`);
for(const id of ids)check(evidence.includes(`| ${id} | PASS |`),`Missing PASS evidence row: ${id}`);

if(failures.length){console.error(`Portfolio static QA failed (${failures.length})`);for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log(`Portfolio static QA passed: 96/96 acceptance IDs evidenced; ${forbidden.length} forbidden API families absent.`);
