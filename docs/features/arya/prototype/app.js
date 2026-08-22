const requestedTheme = new URLSearchParams(window.location.search).get('theme');
if (requestedTheme === 'light' || requestedTheme === 'dark') {
  document.documentElement.dataset.theme = requestedTheme;
}

const tasks = [
  {
    id: 'mechanism',
    title: 'Personal mechanism',
    prompt: 'You do not understand why the recorded home-loan balance moves slowly. Find one explanation and decide what, if anything, you would ask next.',
    draft: 'Why does my home-loan balance fall so slowly?',
    context: 'Recorded context: Home Loan, ₹38,000 EMI, 9% p.a., 18 years remaining',
  },
  {
    id: 'named-product',
    title: 'Named product and privacy',
    prompt: 'Ask whether the named mutual fund in the fixture is good. Then determine what Arya receives and whether it evaluated the named product.',
    draft: 'Is my HDFC Equity Opportunities fund good?',
    context: 'Recorded context: HDFC Equity Opportunities, equity mutual fund, risk bucket high',
  },
  {
    id: 'new-holding',
    title: 'New holding confirmation',
    prompt: 'Tell Arya about the personal loan in the fixture. Work out whether it is saved, then add it only if the displayed details are correct.',
    draft: 'I have a personal loan with ₹4,80,000 left, 14.5% interest and a ₹15,800 EMI.',
    context: '',
  },
  {
    id: 'ambiguous',
    title: 'Ambiguous holding',
    prompt: 'Update a card interest rate when two recorded cards could match. Ensure the intended record is the one changed.',
    draft: 'My credit card rate is 42% now.',
    context: 'Recorded context: two credit-card records',
  },
  {
    id: 'stale',
    title: 'Stale confirmation',
    prompt: 'Apply a proposed personal-loan EMI update after the stored value changes elsewhere. Decide whether the final value is the one you intended.',
    draft: 'My personal-loan EMI changed to ₹16,200.',
    context: 'Recorded context: Personal Loan, ₹15,800 EMI',
  },
  {
    id: 'provider',
    title: 'Provider failure',
    prompt: 'Send the prepared question while Arya is unavailable. Recover without retyping and without losing control of whether the question is resent.',
    draft: 'What does 42% annual interest do to my card balance?',
    context: 'Recorded context: Credit Card A, ₹62,400 balance, 42% p.a.',
  },
  {
    id: 'restart',
    title: 'Session restart',
    prompt: 'Complete one exchange, restart the fixture, then ask what Arya remembers.',
    draft: 'What do you remember from our last conversation?',
    context: 'Current records remain available after a restart',
    sessionNote: 'This is a fresh conversation. Arya can use your current records, but not your previous chat.',
  },
];

const state = {
  task: tasks[0],
  sent: false,
  turn: 0,
  selectedCandidate: null,
  staleSeen: false,
  providerRetried: false,
};

const taskSelect = document.querySelector('#task-select');
const taskTitle = document.querySelector('#task-title');
const taskPrompt = document.querySelector('#task-prompt');
const contextBar = document.querySelector('#context-bar');
const sessionNote = document.querySelector('#session-note');
const messages = document.querySelector('#messages');
const composer = document.querySelector('#composer');
const sendButton = document.querySelector('#send-button');
const privacyDialog = document.querySelector('#privacy-dialog');

for (const task of tasks) {
  const option = document.createElement('option');
  option.value = task.id;
  option.textContent = task.title;
  taskSelect.append(option);
}

function figure(value) {
  return `<span class="figure">${value}</span>`;
}

function resetTask(taskId) {
  state.task = tasks.find((task) => task.id === taskId) || tasks[0];
  state.sent = false;
  state.turn = 0;
  state.selectedCandidate = null;
  state.staleSeen = false;
  state.providerRetried = false;
  taskSelect.value = state.task.id;
  taskTitle.textContent = state.task.title;
  taskPrompt.textContent = state.task.prompt;
  composer.value = state.task.draft;
  composer.disabled = false;
  sendButton.disabled = false;
  sendButton.textContent = 'Send';
  contextBar.hidden = !state.task.context;
  contextBar.textContent = state.task.context;
  sessionNote.hidden = !state.task.sessionNote;
  sessionNote.textContent = state.task.sessionNote || '';
  renderEmpty();
  for (const checkbox of document.querySelectorAll('.check-row input')) checkbox.checked = false;
}

function renderEmpty() {
  messages.innerHTML = `
    <div class="empty-state fade-in">
      <h2>Start with what feels unclear.</h2>
      <p>Arya explains mechanisms using your recorded context. The decision stays with you.</p>
      <div class="suggestion-stack">
        <button class="suggestion-button" type="button" data-fill="${escapeAttribute(state.task.draft)}">Use the prepared question</button>
        ${state.task.id === 'restart' ? '<button class="suggestion-button" type="button" data-action="restart">Restart the fixture first</button>' : ''}
      </div>
    </div>`;
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function addUserMessage(text) {
  messages.insertAdjacentHTML('beforeend', `<div class="message user fade-in">${escapeAttribute(text)}</div>`);
}

function addAssistantMessage(html) {
  messages.insertAdjacentHTML('beforeend', `<div class="message assistant fade-in">${html}</div>`);
}

function showSkeleton() {
  messages.insertAdjacentHTML('beforeend', '<div class="skeleton" id="loading-block" aria-label="Arya is preparing an explanation"><span></span><span></span><span></span></div>');
}

function removeSkeleton() {
  document.querySelector('#loading-block')?.remove();
}

function setSending(sending) {
  composer.disabled = sending;
  sendButton.disabled = sending;
  sendButton.textContent = sending ? 'Sending' : 'Send';
}

function scrollMessages() {
  messages.scrollTop = messages.scrollHeight;
}

function sendCurrent() {
  const text = composer.value.trim();
  if (!text || sendButton.disabled) return;
  if (!state.sent) messages.innerHTML = '';
  state.sent = true;
  addUserMessage(text);
  composer.value = '';
  setSending(true);
  showSkeleton();
  scrollMessages();
  window.setTimeout(() => {
    removeSkeleton();
    renderResponse();
    state.turn += 1;
    setSending(false);
    scrollMessages();
  }, 360);
}

function renderResponse() {
  switch (state.task.id) {
    case 'mechanism':
      if (state.turn === 0) {
        addAssistantMessage(`<p>Your EMI is ${figure('₹38,000')}. At ${figure('9% p.a.')}, each payment first covers that month's interest; only the remainder reduces principal.</p><p>Early in an ${figure('18-year')} schedule, the interest share is larger because it is calculated on a larger balance. As the balance falls, more of the same EMI reaches principal.</p>`);
        messages.insertAdjacentHTML('beforeend', '<div class="system-card fade-in"><div class="card-label">Continue if useful</div><p>You can look at how one extra principal payment changes the schedule, or stop here.</p><button class="secondary-button" type="button" data-action="follow-up">Show the prepayment mechanism</button></div>');
      } else {
        addAssistantMessage(`<p>An extra principal payment reduces the balance before later interest is calculated. At the recorded ${figure('9% p.a.')}, every ${figure('₹1 lakh')} removed from principal avoids about ${figure('₹9,000')} of first-year interest, before accounting for the payment date and remaining schedule.</p><p>That shows the mechanism, not whether you should make the payment. The amount you want to keep accessible is still your choice.</p>`);
      }
      break;
    case 'named-product':
      addAssistantMessage(`<p>I don't evaluate or rate a named fund. I can still explain the recorded characteristics.</p><p>This holding is recorded as an equity mutual fund with a high risk bucket. Its value can move with the underlying equity market, so the mechanism to examine is how that variability interacts with your time horizon and goal.</p>`);
      messages.insertAdjacentHTML('beforeend', '<div class="system-card fade-in"><div class="card-label">Name boundary</div><p>The recognisable name was replaced locally before the teaching request. Open “What Arya receives” to inspect the boundary.</p></div>');
      break;
    case 'new-holding':
      addAssistantMessage(`<p>At ${figure('14.5% p.a.')}, the interest portion is calculated against the outstanding principal before the rest of each ${figure('₹15,800')} payment reduces that principal.</p>`);
      renderNewProposal();
      break;
    case 'ambiguous':
      addAssistantMessage(`<p>A rate of ${figure('42% p.a.')} means unpaid balance compounds at roughly ${figure('3.5%')} per month before payments. I found two recorded cards, so I cannot tell which record you meant.</p>`);
      renderCandidates();
      break;
    case 'stale':
      addAssistantMessage(`<p>A changed EMI alters how much of each month's payment can reach principal after interest. Review the proposed record update before saving it.</p>`);
      renderStaleProposal(false);
      break;
    case 'provider':
      renderProviderError();
      break;
    case 'restart':
      addAssistantMessage(`<p>I can use your current recorded financial context, but I do not remember previous conversations. If a detail matters and is not in your baseline, I do not know it.</p>`);
      break;
  }
}

function renderNewProposal() {
  messages.insertAdjacentHTML('beforeend', `
    <section class="proposal-card fade-in" aria-label="Holding proposal">
      <div class="card-label">Not saved yet</div>
      <strong>New personal loan</strong>
      <div class="diff-grid">
        <div><span>Outstanding</span><strong>₹4,80,000</strong></div>
        <div><span>Interest rate</span><strong>14.5%</strong></div>
        <div><span>Monthly EMI</span><strong>₹15,800</strong></div>
        <div><span>Record action</span><strong>Add new</strong></div>
      </div>
      <p>Nothing from this conversation is written until you confirm.</p>
      <div class="button-row">
        <button class="primary-button" type="button" data-action="save-new">Add to baseline</button>
        <button class="secondary-button" type="button" data-action="dismiss">Not now</button>
      </div>
    </section>`);
}

function renderCandidates() {
  messages.insertAdjacentHTML('beforeend', `
    <section class="proposal-card fade-in" aria-label="Choose a holding">
      <div class="card-label">Choose the record</div>
      <strong>Which card did you mean?</strong>
      <div class="candidate-list">
        <button class="secondary-button" type="button" aria-pressed="false" data-candidate="Card A">Card A, balance ₹62,400, stored rate 39%</button>
        <button class="secondary-button" type="button" aria-pressed="false" data-candidate="Card B">Card B, balance ₹18,750, stored rate 36%</button>
        <button class="secondary-button" type="button" aria-pressed="false" data-candidate="new">Add this as a new card</button>
      </div>
      <p>No record is selected by default.</p>
    </section>`);
}

function renderCandidateDiff(candidate) {
  document.querySelector('[aria-label="Choose a holding"]')?.remove();
  if (candidate === 'new') {
    messages.insertAdjacentHTML('beforeend', '<div class="error-card fade-in"><strong>More detail needed</strong><p>A new card needs a balance or other identifying detail before it can be reviewed safely.</p></div>');
    return;
  }
  const stored = candidate === 'Card A' ? '39%' : '36%';
  messages.insertAdjacentHTML('beforeend', `
    <section class="proposal-card fade-in" aria-label="Stored and proposed comparison">
      <div class="card-label">Not saved yet</div>
      <strong>${candidate}</strong>
      <div class="diff-grid">
        <div><span>Stored rate</span><strong>${stored}</strong></div>
        <div><span>Proposed rate</span><strong>42%</strong></div>
      </div>
      <p>Only the confirmed interest-rate field will change.</p>
      <div class="button-row">
        <button class="primary-button" type="button" data-action="save-candidate">Update ${candidate}</button>
        <button class="secondary-button" type="button" data-action="dismiss">Not now</button>
      </div>
    </section>`);
}

function renderStaleProposal(refreshed) {
  const stored = refreshed ? '₹16,050' : '₹15,800';
  messages.insertAdjacentHTML('beforeend', `
    <section class="proposal-card fade-in" aria-label="${refreshed ? 'Refreshed comparison' : 'Holding proposal'}">
      <div class="card-label">${refreshed ? 'Review refreshed comparison' : 'Not saved yet'}</div>
      <strong>Personal Loan</strong>
      <div class="diff-grid">
        <div><span>Stored EMI</span><strong>${stored}</strong></div>
        <div><span>Proposed EMI</span><strong>₹16,200</strong></div>
      </div>
      <p>${refreshed ? 'This holding changed elsewhere. Review the new stored value before applying your proposal.' : 'Only the confirmed EMI field will change.'}</p>
      <div class="button-row">
        <button class="primary-button" type="button" data-action="save-stale">${refreshed ? 'Confirm ₹16,200' : 'Update EMI'}</button>
        <button class="secondary-button" type="button" data-action="dismiss">Not now</button>
      </div>
    </section>`);
}

function renderProviderError() {
  messages.insertAdjacentHTML('beforeend', `
    <div class="error-card fade-in" role="alert">
      <strong>Arya is temporarily unavailable</strong>
      <p>Your question was not resent and no partial answer was shown.</p>
      <button class="primary-button" type="button" data-action="retry-provider">Retry question</button>
    </div>`);
}

function showSaved(title, body) {
  document.querySelector('.proposal-card')?.remove();
  messages.insertAdjacentHTML('beforeend', `<div class="system-card fade-in" role="status"><div class="card-label">Saved</div><strong>${title}</strong><p>${body}</p></div>`);
  scrollMessages();
}

function handleAction(action, target) {
  if (action === 'follow-up') {
    composer.value = 'How does one extra principal payment change the schedule?';
    composer.focus();
  }
  if (action === 'save-new') showSaved('Added to your baseline', 'The personal-loan details are now recorded. You can edit or recategorise them from Loans.');
  if (action === 'save-candidate') showSaved('Updated in your baseline', `${state.selectedCandidate}'s recorded interest rate now reflects the confirmed information.`);
  if (action === 'dismiss') {
    target.closest('.proposal-card')?.remove();
    messages.insertAdjacentHTML('beforeend', '<div class="session-note fade-in">No change was saved.</div>');
  }
  if (action === 'save-stale') {
    if (!state.staleSeen) {
      state.staleSeen = true;
      target.closest('.proposal-card')?.remove();
      renderStaleProposal(true);
    } else {
      showSaved('Updated in your baseline', 'The EMI now reflects the refreshed comparison you confirmed.');
    }
  }
  if (action === 'retry-provider') {
    target.closest('.error-card')?.remove();
    showSkeleton();
    window.setTimeout(() => {
      removeSkeleton();
      addAssistantMessage(`<p>On a recorded balance of ${figure('₹62,400')}, ${figure('42% p.a.')} is roughly ${figure('3.5%')} a month before payments. If a month began and ended at the same balance, that monthly interest would be about ${figure('₹2,184')}.</p><p>The actual balance path depends on new spending and payment timing, both of which are still unknown here.</p>`);
      scrollMessages();
    }, 360);
  }
  if (action === 'restart') {
    sessionNote.hidden = false;
    sessionNote.textContent = state.task.sessionNote;
    messages.innerHTML = '';
    composer.value = state.task.draft;
    state.sent = false;
    messages.insertAdjacentHTML('beforeend', '<div class="empty-state fade-in"><h2>Start a fresh conversation.</h2><p>Your current recorded context is available. Previous chat messages are not.</p></div>');
  }
}

taskSelect.addEventListener('change', () => resetTask(taskSelect.value));
sendButton.addEventListener('click', sendCurrent);
composer.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendCurrent();
  }
});

messages.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.fill) {
    composer.value = target.dataset.fill;
    composer.focus();
    return;
  }
  if (target.dataset.candidate) {
    state.selectedCandidate = target.dataset.candidate;
    renderCandidateDiff(state.selectedCandidate);
    scrollMessages();
    return;
  }
  if (target.dataset.action) handleAction(target.dataset.action, target);
});

document.querySelector('#privacy-button').addEventListener('click', () => privacyDialog.showModal());
document.querySelector('#close-privacy').addEventListener('click', () => privacyDialog.close());
privacyDialog.addEventListener('click', (event) => {
  if (event.target === privacyDialog) privacyDialog.close();
});

resetTask(tasks[0].id);
