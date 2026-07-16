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
