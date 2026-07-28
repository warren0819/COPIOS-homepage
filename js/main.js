// ===== Header hairline on scroll =====
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile menu =====
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

// ===== Scrollspy: highlight current section in nav =====
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

// ===== Reveal on scroll =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ===== Footer year =====
// 설립연도(2026)는 고정, 이후 해에는 "2026-현재연도" 범위로 자동 표기
(function () {
  var FOUNDED = 2026;
  var now = new Date().getFullYear();
  document.getElementById('year').textContent =
    now > FOUNDED ? FOUNDED + '-' + now : String(FOUNDED);
})();

const CLICKS_REQUIRED = 5;
const CLICK_WINDOW_MS = 4000;

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

let clickCount = 0;
let clickTimer = null;

// 인증 전에는 자료가 몇 개인지도, 제목이 무엇인지도 알 수 없다.
// 목록은 비밀번호로 복호화한 뒤에야 만들어진다.
brand.addEventListener('click', () => {
  clickCount += 1;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { clickCount = 0; }, CLICK_WINDOW_MS);
  if (clickCount >= CLICKS_REQUIRED) {
    clickCount = 0;
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

function openLibrary() {
  libModal.hidden = false;
  libList.querySelector('.lib-item')?.focus();
}

function closeLibrary() {
  libModal.hidden = true;
}

libCancel.addEventListener('click', closeLibrary);
libModal.addEventListener('click', (e) => {
  if (e.target === libModal) closeLibrary();
});

function openPwModal() {
  pwError.hidden = true;
  pwInput.value = '';
  pwModal.hidden = false;
  pwInput.focus();
}

function closePwModal() {
  pwModal.hidden = true;
}

pwCancel.addEventListener('click', closePwModal);
pwModal.addEventListener('click', (e) => {
  if (e.target === pwModal) closePwModal();
});

const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

let payloadCache = null;
let keyCache = null;

async function loadPayload() {
  if (payloadCache) return payloadCache;
  const src = window.DECK_ENC ? Promise.resolve(window.DECK_ENC) : fetch('assets/data.bin')
    .then((res) => { if (!res.ok) throw new Error('payload fetch failed'); return res.json(); });
  payloadCache = await src;
  return payloadCache;
}

// 자료 1개짜리 예전 형식과 여러 개를 담는 현재 형식을 함께 지원한다.
function itemAt(payload, index) {
  if (Array.isArray(payload.items)) return payload.items[index];
  return index === 0 ? { iv: payload.iv, data: payload.data } : undefined;
}

// 목록도 암호화되어 있다. 없는 경우(예전 형식)에는 제목 없이 번호만 보여준다.
async function readIndex(payload, key) {
  if (payload.index) {
    const json = await decryptItem(payload.index, key);
    return JSON.parse(json);
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
  try {
    const payload = await loadPayload();
    const key = await deriveKey(payload, pwInput.value);
    // 목록 복호화가 곧 비밀번호 검증이다. 실패하면 목록도 열리지 않는다.
    const docs = await readIndex(payload, key);
    keyCache = key;
    renderLibrary(docs);
    closePwModal();
    openLibrary();
  } catch {
    pwError.hidden = false;
    pwInput.select();
  } finally {
    submitBtn.disabled = false;
  }
});

function openDeck(html) {
  const blob = new Blob([html], { type: 'text/html' });
  deckFrame.src = URL.createObjectURL(blob);
  deck.hidden = false;
  document.body.style.overflow = 'hidden';
  deckFrame.addEventListener('load', () => deckFrame.contentWindow?.focus(), { once: true });
}

// 인증을 마친 뒤에는 목록으로 돌아가 다른 자료를 바로 열 수 있게 한다.
function closeDeck() {
  deck.hidden = true;
  document.body.style.overflow = '';
  URL.revokeObjectURL(deckFrame.src);
  deckFrame.src = 'about:blank';
  if (keyCache) openLibrary();
}

window.addEventListener('message', (e) => {
  if (e.data === 'copios:home') closeDeck();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!pwModal.hidden) { closePwModal(); return; }
  if (!deck.hidden) { closeDeck(); return; }
  if (!libModal.hidden) closeLibrary();
});
