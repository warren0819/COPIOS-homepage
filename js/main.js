if (window.top !== window.self) {
  try { window.top.location = window.self.location; } catch {}
}

const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const navMobile = document.getElementById('navMobile');
const menuToggle = document.getElementById('menuToggle');

menuToggle.addEventListener('click', () => {
  const open = navMobile.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
});

navMobile.addEventListener('click', (e) => {
  if (e.target.matches('a')) {
    navMobile.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

const navLinks = [...document.querySelectorAll('.nav-desktop a')];
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) =>
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)
    );
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach((s) => spyObserver.observe(s));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

(function () {
  var FOUNDED = 2026;
  var now = new Date().getFullYear();
  document.getElementById('year').textContent =
    now > FOUNDED ? FOUNDED + '-' + now : String(FOUNDED);
})();

const T1 = 5;
const T2 = 4000;

const brand = document.querySelector('.brand');
const libModal = document.getElementById('libModal');
const libList = document.getElementById('libList');
const libCancel = document.getElementById('libCancel');
const pwModal = document.getElementById('pwModal');
const pwForm = document.getElementById('pwForm');
const pwInput = document.getElementById('pwInput');
const pwError = document.getElementById('pwError');
const pwCancel = document.getElementById('pwCancel');
const deck = document.getElementById('deck');
const deckFrame = document.getElementById('deckFrame');

let c1 = 0;
let t1 = null;

brand.addEventListener('click', (e) => {
  c1 += 1;
  clearTimeout(t1);
  t1 = setTimeout(() => { c1 = 0; }, T2);
  if (c1 >= T1) {
    c1 = 0;
    e.preventDefault();
    if (keyCache) openLibrary(); else openPwModal();
  }
});

function renderLibrary(docs) {
  libList.textContent = '';
  docs.forEach((doc, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lib-item';
    btn.innerHTML =
      '<span class="lib-no"></span>' +
      '<span class="lib-text"><span class="lib-name"></span>' +
      '<span class="lib-desc"></span></span>';
    btn.querySelector('.lib-no').textContent = doc.no;
    btn.querySelector('.lib-name').textContent = doc.name;
    btn.querySelector('.lib-desc').textContent = doc.desc;
    btn.addEventListener('click', () => selectDoc(i));
    li.appendChild(btn);
    libList.appendChild(li);
  });
}

let ovState = false;
let ovPopping = false;

const ovOpen = () => !deck.hidden || !libModal.hidden || !pwModal.hidden;

function ovEnter() {
  if (ovState) return;
  ovState = true;
  history.pushState({ v: 1 }, '');
}

function ovLeave() {
  if (!ovState) return;
  ovState = false;
  ovPopping = true;
  history.back();
}

window.addEventListener('popstate', () => {
  if (ovPopping) { ovPopping = false; return; }
  ovState = false;
  if (!ovOpen()) return;
  deck.hidden = true;
  libModal.hidden = true;
  pwModal.hidden = true;
  document.body.style.overflow = '';
  frameReset();
});

function openLibrary() {
  libModal.hidden = false;
  libList.querySelector('.lib-item')?.focus();
  ovEnter();
}

function closeLibrary() {
  libModal.hidden = true;
}

function exitLibrary() {
  closeLibrary();
  ovLeave();
}

libCancel.addEventListener('click', exitLibrary);
libModal.addEventListener('click', (e) => {
  if (e.target === libModal) exitLibrary();
});

function openPwModal() {
  pwError.hidden = true;
  pwInput.value = '';
  pwModal.hidden = false;
  pwInput.focus();
  ovEnter();
}

function closePwModal() {
  pwModal.hidden = true;
}

function exitPwModal() {
  closePwModal();
  ovLeave();
}

pwCancel.addEventListener('click', exitPwModal);
pwModal.addEventListener('click', (e) => {
  if (e.target === pwModal) exitPwModal();
});

const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

let payloadCache = null;
let keyCache = null;

async function loadPayload() {
  if (payloadCache) return payloadCache;
  const src = window.DECK_ENC ? Promise.resolve(window.DECK_ENC) : fetch('assets/data.bin')
    .then((res) => { if (!res.ok) throw new Error('e'); return res.json(); });
  payloadCache = await src;
  return payloadCache;
}

function itemAt(payload, index) {
  if (Array.isArray(payload.items)) return payload.items[index];
  return index === 0 ? { iv: payload.iv, data: payload.data } : undefined;
}

async function readIndex(payload, key) {
  if (payload.index) {
    return JSON.parse(await decryptItem(payload.index, key));
  }
  const count = Array.isArray(payload.items) ? payload.items.length : 1;
  return Array.from({ length: count }, (_, i) => ({
    no: String(i + 1).padStart(2, '0'), name: '자료 ' + (i + 1), desc: '',
  }));
}

async function deriveKey(payload, password) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(payload.salt), iterations: payload.iter, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
}

async function decryptItem(item, key) {
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(item.iv) }, key, b64ToBytes(item.data)
  );
  return new TextDecoder().decode(plain);
}

async function selectDoc(index) {
  const item = itemAt(payloadCache, index);
  if (!item) return;
  closeLibrary();
  openDeck(await decryptItem(item, keyCache));
}

pwForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = pwForm.querySelector('button[type=submit]');
  submitBtn.disabled = true;
  let payload;
  try {
    payload = await loadPayload();
  } catch {
    pwError.textContent = '지금은 열 수 없습니다. 잠시 후 다시 시도해 주세요.';
    pwError.hidden = false;
    submitBtn.disabled = false;
    return;
  }
  try {
    const key = await deriveKey(payload, pwInput.value);
    const docs = await readIndex(payload, key);
    keyCache = key;
    renderLibrary(docs);
    closePwModal();
    openLibrary();
  } catch {
    pwError.textContent = '비밀번호가 일치하지 않습니다.';
    pwError.hidden = false;
    pwInput.select();
  } finally {
    submitBtn.disabled = false;
  }
});

let deckUrl = null;

function frameGo(url) {
  const w = deckFrame.contentWindow;
  if (w) w.location.replace(url);
  else deckFrame.src = url;
}

function frameReset() {
  frameGo('about:blank');
  if (deckUrl) { URL.revokeObjectURL(deckUrl); deckUrl = null; }
}

function openDeck(html) {
  const blob = new Blob([html], { type: 'text/html' });
  if (deckUrl) URL.revokeObjectURL(deckUrl);
  deckUrl = URL.createObjectURL(blob);
  frameGo(deckUrl);
  deck.hidden = false;
  document.body.style.overflow = 'hidden';
  deckFrame.addEventListener('load', () => deckFrame.contentWindow?.focus(), { once: true });
  ovEnter();
}

function closeDeck() {
  deck.hidden = true;
  document.body.style.overflow = '';
  frameReset();
  if (keyCache) openLibrary();
  else ovLeave();
}

window.addEventListener('message', (e) => {
  if (e.source !== deckFrame.contentWindow) return;
  if (e.data === 'copios:home') closeDeck();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!pwModal.hidden) { exitPwModal(); return; }
  if (!deck.hidden) { closeDeck(); return; }
  if (!libModal.hidden) exitLibrary();
});
