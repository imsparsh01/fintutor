const scenarios={
  mixed:{title:'Mixed financial picture',prompt:'Work out what FinTutor knows, what it cannot value, and whether any number is being treated as a verdict.',fixture:'Mira has three families, one unreadable investment value, one unclassified record and 3 of 4 Health areas measured.'},
  empty:{title:'Nothing recorded yet',prompt:'Find a useful route without adding financial details. Decide whether blank information looks like zero or failure.',fixture:'Kabir has no recorded holdings or goals.'},
  failure:{title:'One section fails',prompt:'Make Financial picture fail, then verify that Health, Arya and tools remain usable. Recover only the failed section.',fixture:'Use the retry control inside Financial picture.'},
  stale:{title:'Stale and offline',prompt:'Drop the connection. Determine which information is last-known, restore connection and refresh manually.',fixture:'No request is silently repeated.'},
  denied:{title:'Permission is lost',prompt:'Trigger an unauthorized response and verify that no financial content remains behind the recovery message.',fixture:'Permission loss is different from an ordinary network failure.'},
  switch:{title:'Switch accounts during load',prompt:'Switch from Mira to Kabir and verify that Mira disappears immediately and a late response cannot overwrite Kabir.',fixture:'The fixture log exposes the discarded late response.'},
  'all-actions':{title:'Find every destination',prompt:'Open every financial, teaching, tool, progress, context, privacy and account destination. Confirm each has a clear name.',fixture:'Panels are controlled stand-ins for navigation. Delete never removes anything.'}
};
const state={scenario:'mixed',account:'Mira',loading:false,pictureFailed:false,offline:false,denied:false,stale:false,invite:true,reward:true};
const money={Mira:{investments:'₹4,83,750',loans:'₹8,12,400',insurance:'Not valued yet'},Kabir:{investments:'Not recorded',loans:'Not recorded',insurance:'Not recorded'}};
const $=id=>document.getElementById(id);
function announce(message){$('announcement').textContent='';requestAnimationFrame(()=>{$('announcement').textContent=message});}
function log(message){$('route-log').textContent=message;announce(message)}
function route(title,body='This prototype confirms the route and its contract. Production navigation is unchanged.'){$('dialog-label').textContent='Controlled destination';$('dialog-title').textContent=title;$('dialog-body').textContent=body;$('panel-dialog').showModal();log(`Opened ${title}.`)}
function actionButton(label,routeName,extra=''){return `<button class="${extra}" data-route="${routeName}">${label}</button>`}
function render(){
  $('account-label').textContent=`${state.account}'s account`;
  const banner=$('banner');banner.hidden=true;banner.className='banner';
  if(state.denied){banner.hidden=false;banner.classList.add('error');banner.innerHTML=`Your session no longer has access. Financial information has been cleared. ${actionButton('Sign in again','Sign in','primary')}`;}
  else if(state.offline){banner.hidden=false;banner.innerHTML=`You are offline. Showing last-known information from 10:42 AM. ${actionButton('Connection restored','Restore connection')}`;}
  if(state.loading){$('home-content').innerHTML=`<section class="hero"><h1>Loading ${state.account}'s Home</h1><p class="freshness">Checking current records</p></section><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;bind();return;}
  if(state.denied){$('home-content').innerHTML=`<section class="empty-state"><h1>Sign in to continue</h1><p>We removed the previous subject's financial information as soon as access was lost.</p>${actionButton('Sign in again','Sign in','primary')}</section>`;bind();return;}
  const empty=state.account==='Kabir'||state.scenario==='empty';
  const freshness=state.stale||state.offline?'Last-known data from 10:42 AM':'Updated just now';
  let picture='';
  if(state.pictureFailed){picture=`<div class="error-card"><h3>Financial picture is unavailable</h3><p>Portfolio Health, Arya and the rest of Home are still available.</p><button id="retry-picture" class="primary">Try picture again</button></div>`;}
  else if(empty){picture=`<div class="empty-state"><h3>Nothing recorded yet</h3><p>Blank means unknown, not ₹0. You can look around without adding financial details.</p><div class="tool-grid">${actionButton('Add something','Portfolio')}${actionButton('Ask Arya','Chat')}</div></div>`;}
  else{picture=`<div class="ledger"><button class="ledger-row" data-route="Investments"><span class="ledger-label">Investments</span><span class="ledger-value">${money.Mira.investments}</span><span class="ledger-meta">3 recorded. 1 value needs review.</span></button><button class="ledger-row" data-route="Loans"><span class="ledger-label">Loans</span><span class="ledger-value">${money.Mira.loans}</span><span class="ledger-meta">2 recorded.</span></button><button class="ledger-row" data-route="Insurance"><span class="ledger-label">Insurance cash value</span><span class="ledger-value">${money.Mira.insurance}</span><span class="ledger-meta">1 policy recorded without a cash value. 1 record needs classification.</span></button></div>`;}
  $('home-content').innerHTML=`
    <section class="hero"><h1>Good ${new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, ${state.account}</h1><p class="freshness">${freshness}</p></section>
    ${state.invite?`<section class="arya"><h3>Optional personalization</h3><p>Five optional questions can tune where Arya begins. No amounts or account details.</p><div class="invite-actions">${actionButton('Personalize Arya','Personalization','primary')}<button id="dismiss-invite" class="text-action">Not now</button></div></section>`:''}
    <section class="section" id="picture"><h2 class="section-heading">Financial picture</h2>${picture}</section>
    <section class="section"><h2 class="section-heading">Portfolio Health</h2><div class="health"><button class="health-main" data-route="Portfolio Health" aria-label="Portfolio Health, ${empty?'not measured, no areas measured':'score 68, 3 of 4 areas measured'}"><span class="health-score">${empty?'Not measured':'68'}</span><span class="ledger-meta">${empty?'No areas measured':'3 of 4 areas measured'}</span></button><div class="health-detail">${['Investment rate|72','Insurance|64','Emergency buffer|68','Tax utilisation|Not measured'].map(x=>{const [a,b]=x.split('|');return `<button class="health-line" data-route="Portfolio Health: ${a}" aria-label="${a}, ${empty?'not measured':b}"><span>${a}</span><span>${empty?'Not measured':b}</span></button>`}).join('')}</div></div></section>
    <section class="section"><h2 class="section-heading">Ask Arya</h2><div class="arya"><h3>Understand one number or mechanism</h3><p>Arya can use your current records without choosing a path for you.</p>${actionButton('Start a conversation','Chat','primary')}</div></section>
    <section class="section"><h2 class="section-heading">Use a tool</h2><div class="tool-grid"><button class="tool" data-route="SIP goal calculator"><strong>SIP goal</strong><span>Monthly amount for a target corpus</span></button><button class="tool" data-route="Emergency runway scenario"><strong>Emergency runway</strong><span>Months your entered balances could cover</span></button></div><button class="text-action view-all" data-route="All calculators and scenarios">View all tools</button></section>
    <section class="section"><h2 class="section-heading">Learn</h2><div class="learn-list"><button class="list-button" data-route="Compounding lesson"><span>How compounding works</span><span>Open</span></button><button class="list-button" data-route="EMI lesson"><span>What an EMI contains</span><span>Open</span></button><button class="list-button" data-route="Insurance lesson"><span>What insurance transfers</span><span>Open</span></button></div></section>
    <section class="section"><h2 class="section-heading">Learning progress</h2><div class="progress"><h3>${empty?'Exploring':'Building'} stage</h3><p>Participation reflects learning activity, never changes in money.</p><div class="progress-line" aria-hidden="true"><span></span></div><p class="progress-meta">${empty?'0':'146'} participation points</p>${actionButton('View progress','Learning progress')}</div>${state.reward?`<div class="progress"><h3>A fact worth knowing</h3><p>Compounding describes how growth can build on prior growth. It does not predict a return.</p><button id="dismiss-reward" class="text-action">Dismiss</button></div>`:''}</section>
    <section class="section"><h2 class="section-heading">Your account and context</h2><div class="account-list">${actionButton('Personalization','Manage personalization')}${actionButton('Financial context','Manage optional financial context')}${actionButton('Privacy','Privacy Policy')}${actionButton('Export data','Download my data')}${actionButton('Sign out','Sign out')}${actionButton('Delete account','Delete my account','danger')}</div></section>`;
  bind();
}
function bind(){
  $('retry-picture')?.addEventListener('click',()=>{state.pictureFailed=false;render();log('Financial picture recovered once. Other sections were not reloaded.')});
  $('dismiss-invite')?.addEventListener('click',()=>{state.invite=false;render();log('Optional personalization invite dismissed.')});
  $('dismiss-reward')?.addEventListener('click',()=>{state.reward=false;render();log('Learning fact dismissed. Financial content did not change.')});
}
function applyScenario(name){state.scenario=name;state.account=name==='empty'?'Kabir':'Mira';state.loading=false;state.pictureFailed=name==='failure';state.offline=name==='stale';state.stale=name==='stale';state.denied=name==='denied';state.invite=true;state.reward=true;const s=scenarios[name];$('scenario-title').textContent=s.title;$('scenario-prompt').textContent=s.prompt;$('scenario-fixture').textContent=`Fixture: ${s.fixture}`;render();log(`Loaded scenario: ${s.title}.`)}
$('scenario').addEventListener('change',e=>applyScenario(e.target.value));
document.addEventListener('click',e=>{
  const target=e.target.closest('button');
  if(!target)return;
  if(target.id==='refresh'){if(state.offline){log('Refresh not sent while offline. Restore connection first.');return}state.stale=false;render();log('Home refreshed manually.');return}
  if(target.id==='drop-connection'){state.offline=true;state.stale=true;render();log('Connection dropped. Last-known data remains labelled.');return}
  if(target.id==='fail-picture'){state.pictureFailed=true;render();log('Financial picture failed locally. Other sections remain available.');return}
  if(target.id==='deny-request'){state.denied=true;render();log('Permission denied. Subject data cleared immediately.');return}
  if(target.id==='switch-account'){const from=state.account;state.account=from==='Mira'?'Kabir':'Mira';state.denied=false;state.loading=true;render();log(`Cleared ${from}'s content before loading ${state.account}.`);setTimeout(()=>{state.loading=false;render();log(`Loaded ${state.account}. Discarded a late ${from} response.`)},350);return}
  if(target.id==='reset-fixture'){applyScenario($('scenario').value);return}
  if(target.dataset.route==='Restore connection'){state.offline=false;render();log('Connection restored. Data remains stale until manual refresh.');return}
  if(target.dataset.route)route(target.dataset.route,target.dataset.route==='Delete my account'?'Controlled preview only. No data is deleted. Production requires reauthentication and separate confirmation.':undefined)
});
applyScenario('mixed');
