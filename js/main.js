// ===== Header: shadow on scroll =====
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile navigation =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
});

nav.addEventListener('click', (e) => {
  if (e.target.matches('.nav-link')) {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// ===== Active nav link on scroll =====
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) =>
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)
    );
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach((s) => sectionObserver.observe(s));

// ===== Reveal on scroll =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ===== Count-up stats =====
const animateCount = (el) => {
  const target = Number(el.dataset.count);
  const duration = 1200;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

// ===== Contact form (opens mail client) =====
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const subject = encodeURIComponent(`[홈페이지 문의] ${data.get('name')}`);
  const body = encodeURIComponent(
    `성함: ${data.get('name')}\n이메일: ${data.get('email')}\n\n${data.get('message')}`
  );
  window.location.href = `mailto:contact@copios.co.kr?subject=${subject}&body=${body}`;
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();
