/* Account-entry interactive fixture prototype — BQ-116.
 *
 * Fixture-only: no network, no FastAPI, no Supabase, no framework, no build step.
 * Realizes the behaviour fixed in docs/features/account-entry/ACCEPTANCE_MATRIX.md
 * (Sections A + B) and the three owner-ruled decisions:
 *   D-153 — session-expiry / network-loss = non-blocking banner + manual retry
 *   D-154 — invalid-credentials / duplicate-registration copy = neutral & ENUMERATION-SAFE
 *   D-155 — logout / account-switch = active clear of device-local state (no residue)
 *
 * Nothing here is persisted; all state is in-memory and resets when a task changes.
 */

/* Optional deterministic theme for review: ?theme=light | ?theme=dark */
const requestedTheme = new URLSearchParams(window.location.search).get('theme');
if (requestedTheme === 'light' || requestedTheme === 'dark') {
  document.documentElement.dataset.theme = requestedTheme;
}

/* -------------------------------------------------------------------------- */
/* Fixture data (in-memory only)                                              */
/* -------------------------------------------------------------------------- */

const FIXTURE_ACCOUNTS = {
  'mira@example.in':        { password: 'monsoon-lily-42', confirmed: true,  name: 'Mira',
                              baseline: { groups: '3 recorded', unknown: '1 value', net: '₹32,900 / mo' } },
  'kabir@example.in':       { password: 'harbour-kite-19', confirmed: true,  name: 'Kabir',
                              baseline: { groups: '1 recorded', unknown: '0 values', net: '₹9,000 / mo' } },
  'unconfirmed@example.in': { password: 'pending-oak-7',   confirmed: false, name: 'Devi' },
};

/* Neutral, enumeration-safe copy (D-154). The SAME message is used for
 * wrong-password and unknown-email; the SAME handoff is used for a new and an
 * already-registered email. No branch surfaces which cause occurred. */
const MISMATCH_MSG   = "We couldn't sign you in. Check your email and password, then try again.";
const OFFLINE_MSG    = "Couldn't connect. Check your connection and try again — your details are kept.";
const REG_HANDOFF    = "Check your email to continue. If you already have an account, sign in instead; otherwise confirm your new account from the link we sent, then sign in.";
const CONFIRM_MSG    = "Almost there — confirm your email to finish setting up your account, then sign in. We've re-sent the confirmation link.";

/* -------------------------------------------------------------------------- */
/* Owner-validation tasks (ACCEPTANCE_MATRIX.md Section E)                     */
/* -------------------------------------------------------------------------- */

const tasks = [
  { id: 'register-new', title: 'Register a new account',
    prompt: 'Create an account with a fresh email of your choosing. Read the response and decide whether you are signed in yet.',
    fixtures: 'Any email that is not one of the fixture accounts is treated as new.',
    setup: s => { s.screen = 'register'; } },

  { id: 'signin-returning', title: 'Sign in as a returning user',
    prompt: 'Sign in, then answer without help: are you signed in, and whose account is this?',
    fixtures: 'mira@example.in · monsoon-lily-42',
    setup: s => { s.screen = 'login'; s.emailValue = 'mira@example.in'; } },

  { id: 'restart-resume', title: 'Reopen the app with a saved session',
    prompt: 'Use the “Relaunch app” fixture control to simulate closing and reopening. Watch what happens before any screen settles.',
    fixtures: 'You start already signed in as Mira.',
    setup: s => { signInFixture(s, 'mira@example.in'); } },

  { id: 'wrong-password', title: 'Wrong password vs. unknown email',
    prompt: 'First sign in with a wrong password for the fixture account, then try an email that has no account. Compare the two responses word for word.',
    fixtures: 'Known: mira@example.in · Unknown: anything else. Passwords are your choice for this task.',
    setup: s => { s.screen = 'login'; s.emailValue = 'mira@example.in'; } },

  { id: 'duplicate-registration', title: 'Register an already-used email',
    prompt: 'Register mira@example.in, then register a brand-new email. Compare the two responses — does either reveal whether the address already has an account?',
    fixtures: 'Already registered: mira@example.in',
    setup: s => { s.screen = 'register'; s.emailValue = 'mira@example.in'; } },

  { id: 'unconfirmed-email', title: 'A registered-but-unconfirmed account',
    prompt: 'Sign in with the unconfirmed fixture account (correct password). Note where it points you and that no session is granted.',
    fixtures: 'unconfirmed@example.in · pending-oak-7',
    setup: s => { s.screen = 'login'; s.emailValue = 'unconfirmed@example.in'; } },

  { id: 'expired-session', title: 'Session expires mid-use',
    prompt: 'While signed in, use “Expire session”. Check what shows behind the banner, then recover the way it offers.',
    fixtures: 'You start signed in as Mira.',
    setup: s => { signInFixture(s, 'mira@example.in'); } },

  { id: 'offline', title: 'Connection lost mid-use',
    prompt: 'While signed in, use “Drop connection”, then Retry. Then use “Restore connection” and Retry again. Was your place preserved? Was anything resent silently?',
    fixtures: 'You start signed in as Mira.',
    setup: s => { signInFixture(s, 'mira@example.in'); } },

  { id: 'permission-denied', title: 'A request comes back unauthorized',
    prompt: 'While signed in, use “Deny a request” (a 401). Check what is shown and how you recover.',
    fixtures: 'You start signed in as Mira.',
    setup: s => { signInFixture(s, 'mira@example.in'); } },

  { id: 'logout', title: 'Log out cleanly',
    prompt: 'Log out. On the login screen that follows, look for any trace of the previous account.',
    fixtures: 'You start signed in as Mira.',
    setup: s => { signInFixture(s, 'mira@example.in'); } },

  { id: 'account-switch', title: 'Switch accounts on one device',
    prompt: 'Switch account, then sign in as the second fixture account. At any point, does any of the first account’s data appear?',
    fixtures: 'From Mira → sign in as kabir@example.in · harbour-kite-19',
    setup: s => { signInFixture(s, 'mira@example.in'); } },

  { id: 'not-configured', title: 'A build with no configuration',
    prompt: 'Read the state a misconfigured build lands on. Is any sign-in screen reachable? Use “Turn config on” to leave it.',
    fixtures: 'Simulates absent Supabase env vars (D-052).',
    setup: s => { s.configured = false; } },
];

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

let switchToken = 0; // invalidates late in-flight responses on logout/switch

function baseState() {
  return {
    taskId: null,
    configured: true,
    online: true,
    screen: 'login',      // login | register | loading | home | confirm | permdenied
    session: null,        // { email } when a verified fixture session is live
    emailValue: '',
    passwordValue: '',
    submitting: false,
    loginError: null,     // { message }
    registerNotice: null, // { message, error? }
    confirmName: null,
    banner: null,         // 'expired' | 'offline'
    clearedNote: false,   // active-clear evidence on the post-logout/switch login
    persisted: null,      // email of a persisted session, for relaunch
    fixtureLog: '',
  };
}

let state = baseState();

function signInFixture(s, email) { s.session = { email }; s.screen = 'home'; }
function nameFor(email) { return (FIXTURE_ACCOUNTS[email] && FIXTURE_ACCOUNTS[email].name) || email; }

/* -------------------------------------------------------------------------- */
/* Resolvers — the enumeration-safety guarantee lives here (D-154)            */
/* -------------------------------------------------------------------------- */

function resolveLogin(email, password) {
  if (!state.online) return { kind: 'offline' };
  const acct = FIXTURE_ACCOUNTS[String(email).trim().toLowerCase()];
  // Unknown email and wrong password collapse into ONE identical branch — the
  // response cannot distinguish them. Only a correct password (a proven owner)
  // can ever reach 'confirm' or 'success', so a mere address-guesser never sees
  // any account-revealing copy.
  if (!acct || acct.password !== password) return { kind: 'mismatch' };
  if (!acct.confirmed) return { kind: 'confirm', email: String(email).trim().toLowerCase() };
  return { kind: 'success', email: String(email).trim().toLowerCase() };
}

function resolveRegister() {
  if (!state.online) return { kind: 'offline' };
  // Deliberately does NOT branch on whether the email already exists: a new and
  // an already-registered email produce the identical handoff.
  return { kind: 'handoff' };
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

function readInputs() {
  const e = document.getElementById('email');
  const p = document.getElementById('password');
  if (e) state.emailValue = e.value;
  if (p) state.passwordValue = p.value;
}

function submitLogin() {
  if (state.submitting) return; // duplicate submit suppressed (AC-SB-2)
  readInputs();
  state.loginError = null;
  state.submitting = true;
  render();
  setTimeout(() => {
    state.submitting = false;
    const r = resolveLogin(state.emailValue, state.passwordValue);
    if (r.kind === 'success') {
      state.session = { email: r.email };
      state.screen = 'home';
      state.passwordValue = '';
      state.clearedNote = false;
      state.banner = null;
    } else if (r.kind === 'confirm') {
      state.screen = 'confirm';
      state.confirmName = nameFor(r.email);
    } else if (r.kind === 'offline') {
      state.loginError = { message: OFFLINE_MSG };   // input preserved (AC-OF-1)
    } else {
      state.loginError = { message: MISMATCH_MSG };  // identical for wrong-pw & unknown-email
    }
    render();
  }, 700);
}

function submitRegister() {
  if (state.submitting) return;
  readInputs();
  state.registerNotice = null;
  state.submitting = true;
  render();
  setTimeout(() => {
    state.submitting = false;
    const r = resolveRegister();
    if (r.kind === 'offline') state.registerNotice = { message: OFFLINE_MSG, error: true };
    else state.registerNotice = { message: REG_HANDOFF };  // identical for new & duplicate
    render();
  }, 700);
}

/* Active clear of device-local state (D-155). Blanks the prior subject
 * immediately (not at next load) and discards any late in-flight response. */
function activeClear(prefillEmail) {
  const priorName = state.session ? nameFor(state.session.email) : 'the previous account';
  state.session = null;
  state.banner = null;
  state.confirmName = null;
  state.loginError = null;
  state.registerNotice = null;
  state.passwordValue = '';
  state.emailValue = prefillEmail || '';
  state.clearedNote = true;
  state.screen = 'login';
  state.fixtureLog = '';
  render();
  const token = ++switchToken;
  setTimeout(() => {
    if (token === switchToken) {
      logFixture('A late response from ' + priorName + ' arrived after teardown and was discarded — it was not rendered.');
    }
  }, 900);
}

function relaunch() {
  state.persisted = state.session ? state.session.email : null;
  state.banner = null;
  state.clearedNote = false;
  state.screen = 'loading';
  render();
  setTimeout(() => {
    if (state.persisted) { state.session = { email: state.persisted }; state.screen = 'home'; }
    else { state.screen = 'login'; }
    render();
  }, 750);
}

function expireSession() {
  if (!state.session) return;
  state.banner = 'expired'; // render() hides all subject data behind it (AC-EX-2)
  render();
}

function reauthFromExpiry() {
  const email = state.session ? state.session.email : '';
  state.session = null;
  state.banner = null;
  state.screen = 'login';
  state.emailValue = email; // convenience; a password is still required
  state.passwordValue = '';
  render();
}

function denyRequest() {
  if (!state.session) return;
  state.screen = 'permdenied';
  render();
}

function reauthFromPerm() {
  const email = state.session ? state.session.email : '';
  state.session = null;
  state.screen = 'login';
  state.emailValue = email;
  state.passwordValue = '';
  render();
}

function dropConnection() {
  state.online = false;
  if (state.session && state.screen === 'home' && state.banner !== 'expired') state.banner = 'offline';
  render();
}

function restoreConnection() {
  state.online = true; // banner stays until the user manually retries (D-153)
  render();
}

function retryOffline() {
  if (state.online) {
    state.banner = null;
    logFixture('Reconnected. The pending request was retried once — no duplicate action occurred.');
  } else {
    logFixture('Still offline — nothing was resent.');
  }
  render();
}

function toggleConfig() {
  state.configured = !state.configured;
  state.banner = null;
  render();
}

function logFixture(msg) { state.fixtureLog = msg; render(); }

/* -------------------------------------------------------------------------- */
/* Views                                                                      */
/* -------------------------------------------------------------------------- */

const BRAND = '<div class="brandrow"><span class="avatar" aria-hidden="true">F</span>' +
  '<span><strong>FinTutor</strong><small>Learn your money from first principles</small></span></div>';

function loginHTML() {
  const err = state.loginError;
  const invalid = err ? ' aria-invalid="true" aria-describedby="login-error"' : '';
  return BRAND +
    (state.clearedNote
      ? '<div class="cleared-note">Signed out. Cached data for the previous account was cleared from this device.</div>'
      : '') +
    '<h2 class="title">Sign in</h2>' +
    '<p class="lede">Enter your email and password to continue.</p>' +
    (err ? '<div class="form-error" id="login-error"><span class="mark" aria-hidden="true">!</span><p>' + err.message + '</p></div>' : '') +
    '<div class="field"><label for="email">Email</label>' +
      '<input id="email" type="email" autocomplete="username" value="' + escapeAttr(state.emailValue) + '"' + invalid + '></div>' +
    '<div class="field"><label for="password">Password</label>' +
      '<input id="password" type="password" autocomplete="current-password" value="' + escapeAttr(state.passwordValue) + '"' + invalid + '></div>' +
    '<button class="primary-button" type="button" data-action="login-submit" aria-busy="' + state.submitting + '"' + (state.submitting ? ' disabled' : '') + '>Sign in</button>' +
    '<div class="link-row"><button class="link-button" type="button" data-action="goto-register">Create an account</button>' +
      '<button class="link-button" type="button" data-action="privacy">Privacy Policy</button></div>';
}

function registerHTML() {
  const n = state.registerNotice;
  return BRAND +
    '<h2 class="title">Create your account</h2>' +
    '<p class="lede">Use an email you can confirm. You will finish by confirming it, then signing in.</p>' +
    (n ? '<div class="notice-card"><strong>' + (n.error ? "Couldn't connect" : 'Check your email') + '</strong>' + n.message + '</div>' : '') +
    '<div class="field"><label for="email">Email</label>' +
      '<input id="email" type="email" autocomplete="username" value="' + escapeAttr(state.emailValue) + '"></div>' +
    '<div class="field"><label for="password">Password</label>' +
      '<input id="password" type="password" autocomplete="new-password" value="' + escapeAttr(state.passwordValue) + '"></div>' +
    '<button class="primary-button" type="button" data-action="register-submit" aria-busy="' + state.submitting + '"' + (state.submitting ? ' disabled' : '') + '>Create account</button>' +
    '<div class="link-row"><span class="muted">Already have an account?</span>' +
      '<button class="link-button" type="button" data-action="goto-login">Sign in</button>' +
      '<button class="link-button" type="button" data-action="privacy">Privacy Policy</button></div>';
}

function confirmHTML() {
  return BRAND +
    '<h2 class="title">Confirm your email</h2>' +
    '<div class="notice-card"><strong>One more step</strong>' + CONFIRM_MSG + '</div>' +
    '<button class="secondary-button" type="button" data-action="goto-login">Back to sign in</button>';
}

function gateHTML() {
  return '<div class="gate"><div class="spinner" aria-hidden="true"></div><p>Restoring your session…</p></div>';
}

function homeHTML() {
  const acct = FIXTURE_ACCOUNTS[state.session.email];
  return BRAND +
    '<span class="session-pill"><span class="dot" aria-hidden="true"></span>Signed in as ' + acct.name + '</span>' +
    '<h2 class="title">Your baseline</h2>' +
    '<p class="lede">This is ' + acct.name + "'s account. Only this signed-in account's data is loaded.</p>" +
    '<div class="data-card"><h3>Recorded picture</h3><div class="facts">' +
      '<span>Recorded groups</span><strong>' + acct.baseline.groups + '</strong>' +
      '<span>Unknown values</span><strong>' + acct.baseline.unknown + '</strong>' +
      '<span>Monthly net</span><strong>' + acct.baseline.net + '</strong>' +
    '</div></div>' +
    '<p class="fixture-note">Fixture data, shown only to make an account boundary visible.</p>' +
    '<div class="button-stack">' +
      '<button class="secondary-button" type="button" data-action="switch-account">Switch account</button>' +
      '<button class="secondary-button" type="button" data-action="logout">Log out</button>' +
    '</div>';
}

function expiredHomeHTML() {
  return BRAND +
    '<div class="empty-secure"><span class="lock" aria-hidden="true">🔒</span>' +
    '<p>You are signed out. Nothing from the previous session is shown here — sign in again to continue.</p></div>';
}

function permDeniedHTML() {
  return BRAND +
    '<h2 class="title">Please sign in again</h2>' +
    '<p class="lede">We couldn’t verify your access, so nothing is shown. Signing in again never reveals another account’s data.</p>' +
    '<button class="primary-button" type="button" data-action="reauth-perm">Sign in again</button>';
}

function notConfiguredHTML() {
  return '<div class="dev-state"><h2>Set-up required</h2>' +
    '<p>This build has no Supabase configuration, so account entry can’t start. This is a developer set-up step, not an app error.</p>' +
    '<ol class="steps"><li>Add <code>EXPO_PUBLIC_SUPABASE_URL</code> and <code>EXPO_PUBLIC_SUPABASE_ANON_KEY</code> to <code>app/.env</code>.</li>' +
    '<li>Restart the app.</li></ol>' +
    '<p>No sign-in screen is reachable until configuration is added.</p></div>';
}

function screenHTML() {
  if (!state.configured) return notConfiguredHTML();
  switch (state.screen) {
    case 'loading':   return gateHTML();
    case 'register':  return registerHTML();
    case 'confirm':   return confirmHTML();
    case 'permdenied':return permDeniedHTML();
    case 'home':      return state.banner === 'expired' ? expiredHomeHTML() : homeHTML();
    case 'login':
    default:          return loginHTML();
  }
}

function bannerRender(el) {
  if (state.configured && state.banner === 'expired') {
    el.dataset.kind = 'expired';
    el.innerHTML = '<div class="banner-body"><strong>Session expired</strong>' +
      '<span>Please sign in again to continue. Nothing here is showing stale data.</span></div>' +
      '<button type="button" data-action="reauth-expiry">Sign in again</button>';
    el.hidden = false;
  } else if (state.configured && state.banner === 'offline') {
    el.dataset.kind = 'offline';
    el.innerHTML = '<div class="banner-body"><strong>Couldn’t connect</strong>' +
      '<span>We’ll keep your place. Retry when you’re back online.</span></div>' +
      '<button type="button" data-action="retry-offline">Retry</button>';
    el.hidden = false;
  } else {
    el.hidden = true;
    el.removeAttribute('data-kind');
    el.innerHTML = '';
  }
}

function controlsHTML() {
  const b = [];
  b.push('<button type="button" data-action="relaunch">Relaunch app</button>');
  b.push('<button type="button" data-action="toggle-config">' + (state.configured ? 'Turn config off' : 'Turn config on') + '</button>');
  if (state.configured) {
    b.push(state.online
      ? '<button type="button" data-action="drop">Drop connection</button>'
      : '<button type="button" data-action="restore">Restore connection</button>');
    if (state.session && state.screen === 'home' && state.banner !== 'expired') {
      b.push('<button type="button" data-action="expire">Expire session</button>');
      b.push('<button type="button" data-action="deny">Deny a request</button>');
    }
  }
  return b.join('') + '<p class="log">' + escapeHtml(state.fixtureLog) + '</p>';
}

/* -------------------------------------------------------------------------- */
/* Render                                                                     */
/* -------------------------------------------------------------------------- */

const bannerEl = document.getElementById('banner');
const screenEl = document.getElementById('screen');
const controlsEl = document.getElementById('fixture-controls');

function render() {
  bannerRender(bannerEl);
  screenEl.innerHTML = screenHTML();
  controlsEl.innerHTML = controlsHTML();
}

/* -------------------------------------------------------------------------- */
/* Task panel                                                                 */
/* -------------------------------------------------------------------------- */

const select = document.getElementById('task-select');
const taskTitle = document.getElementById('task-title');
const taskPrompt = document.getElementById('task-prompt');
const taskFixtures = document.getElementById('task-fixtures');

for (const task of tasks) {
  const opt = document.createElement('option');
  opt.value = task.id;
  opt.textContent = task.title;
  select.append(opt);
}

function resetTask(id) {
  const task = tasks.find(t => t.id === id) || tasks[0];
  state = baseState();
  state.taskId = task.id;
  if (task.setup) task.setup(state);
  taskTitle.textContent = task.title;
  taskPrompt.textContent = task.prompt;
  taskFixtures.textContent = task.fixtures ? ('Fixtures — ' + task.fixtures) : '';
  document.querySelectorAll('.task-panel fieldset input').forEach(x => { x.checked = false; });
  render();
}

/* -------------------------------------------------------------------------- */
/* Wiring                                                                      */
/* -------------------------------------------------------------------------- */

const ACTIONS = {
  'login-submit': submitLogin,
  'register-submit': submitRegister,
  'goto-register': () => { state.screen = 'register'; state.loginError = null; render(); },
  'goto-login': () => { state.screen = 'login'; state.registerNotice = null; state.confirmName = null; render(); },
  'privacy': () => logFixture('Privacy Policy would open here — omitted from this fixture.'),
  'switch-account': () => activeClear('kabir@example.in'),
  'logout': () => activeClear(''),
  'reauth-expiry': reauthFromExpiry,
  'reauth-perm': reauthFromPerm,
  'retry-offline': retryOffline,
  'relaunch': relaunch,
  'toggle-config': toggleConfig,
  'expire': expireSession,
  'drop': dropConnection,
  'restore': restoreConnection,
  'deny': denyRequest,
};

document.addEventListener('click', e => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const fn = ACTIONS[target.dataset.action];
  if (fn) fn();
});

// Keep typed values in state without re-rendering (so the caret is never lost).
document.addEventListener('input', e => {
  if (e.target.id === 'email') state.emailValue = e.target.value;
  if (e.target.id === 'password') state.passwordValue = e.target.value;
});

select.addEventListener('change', e => resetTask(e.target.value));

/* -------------------------------------------------------------------------- */
/* Small escapers                                                             */
/* -------------------------------------------------------------------------- */

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
function escapeAttr(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* -------------------------------------------------------------------------- */
/* Enumeration self-check (D-154 evidence, logged to the console)             */
/* -------------------------------------------------------------------------- */

(function enumerationSelfCheck() {
  const wrongPw = resolveLogin('mira@example.in', 'definitely-not-it'); // known email, wrong password
  const unknown = resolveLogin('ghost@nowhere.in', 'definitely-not-it'); // unknown email
  const indistinguishable = wrongPw.kind === unknown.kind && wrongPw.kind === 'mismatch';
  console.log('[BQ-116] D-154 enumeration check — wrong-password:', wrongPw.kind,
    '| unknown-email:', unknown.kind, '| indistinguishable:', indistinguishable, '| shown copy:', MISMATCH_MSG);
  console.assert(indistinguishable, 'D-154 VIOLATION: wrong-password and unknown-email must be indistinguishable');
})();

/* Boot */
resetTask(tasks[0].id);
