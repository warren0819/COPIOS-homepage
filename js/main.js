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
const pwModal = document.getElementById('pwModal');
const pwForm = document.getElementById('pwForm');
const pwInput = document.getElementById('pwInput');
const pwError = document.getElementById('pwError');
const pwCancel = document.getElementById('pwCancel');
const deck = document.getElementById('deck');
const deckFrame = document.getElementById('deckFrame');

let clickCount = 0;
let clickTimer = null;

brand.addEventListener('click', () => {
  clickCount += 1;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { clickCount = 0; }, CLICK_WINDOW_MS);
  if (clickCount >= CLICKS_REQUIRED) {
    clickCount = 0;
    openPwModal();
  }
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

async function loadPayload() {
  if (window.DECK_ENC) return window.DECK_ENC;
  const res = await fetch('assets/data.bin');
  if (!res.ok) throw new Error('payload fetch failed');
  return res.json();
}

async function decryptDeck(password) {
  const p = await loadPayload();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(p.salt), iterations: p.iter, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(p.iv) }, key, b64ToBytes(p.data)
  );
  return new TextDecoder().decode(plain);
}

pwForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = pwForm.querySelector('button[type=submit]');
  submitBtn.disabled = true;
  try {
    const html = await decryptDeck(pwInput.value);
    closePwModal();
    openDeck(html);
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

function closeDeck() {
  deck.hidden = true;
  document.body.style.overflow = '';
  URL.revokeObjectURL(deckFrame.src);
  deckFrame.src = 'about:blank';
}

window.addEventListener('message', (e) => {
  if (e.data === 'copios:home') closeDeck();
});

document.addEventListener('keydown', (e) => {
  if (!pwModal.hidden && e.key === 'Escape') { closePwModal(); return; }
  if (!deck.hidden && e.key === 'Escape') closeDeck();
});
