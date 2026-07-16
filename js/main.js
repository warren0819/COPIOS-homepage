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
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Hidden presentation gate: click COPIOS wordmark 5 times =====
const PW_HASH = '4afcbc9fb197fa48a4ac99e56504fac269110b336e899595467f1fa5e9293ed7';
const CLICKS_REQUIRED = 5;
const CLICK_WINDOW_MS = 4000;

const brand = document.querySelector('.brand');
const pwModal = document.getElementById('pwModal');
const pwForm = document.getElementById('pwForm');
const pwInput = document.getElementById('pwInput');
const pwError = document.getElementById('pwError');
const pwCancel = document.getElementById('pwCancel');
const deck = document.getElementById('deck');
const deckCount = document.getElementById('deckCount');
const deckClose = document.getElementById('deckClose');
const deckPrev = document.getElementById('deckPrev');
const deckNext = document.getElementById('deckNext');
const slides = [...deck.querySelectorAll('.slide')];

let clickCount = 0;
let clickTimer = null;
let currentSlide = 0;

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

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

pwForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const hash = await sha256Hex(pwInput.value);
  if (hash === PW_HASH) {
    closePwModal();
    openDeck();
  } else {
    pwError.hidden = false;
    pwInput.select();
  }
});

function showSlide(index) {
  currentSlide = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
  deckCount.textContent = `${currentSlide + 1} / ${slides.length}`;
  deckPrev.disabled = currentSlide === 0;
  deckNext.disabled = currentSlide === slides.length - 1;
}

function openDeck() {
  deck.hidden = false;
  document.body.style.overflow = 'hidden';
  showSlide(0);
}

function closeDeck() {
  deck.hidden = true;
  document.body.style.overflow = '';
}

deckClose.addEventListener('click', closeDeck);
deckPrev.addEventListener('click', () => showSlide(currentSlide - 1));
deckNext.addEventListener('click', () => showSlide(currentSlide + 1));

document.addEventListener('keydown', (e) => {
  if (!pwModal.hidden && e.key === 'Escape') { closePwModal(); return; }
  if (deck.hidden) return;
  if (e.key === 'Escape') closeDeck();
  if (e.key === 'ArrowRight' || e.key === ' ') showSlide(currentSlide + 1);
  if (e.key === 'ArrowLeft') showSlide(currentSlide - 1);
});
