/* ================================================================
   Rajdhani Grih Boys Hostel  —  script.js
   ================================================================ */

'use strict';

/* ---- Tiny helpers ---- */
const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];


/* ================================================================
   1. BACK TO TOP  (declared first — referenced by Navbar's onScroll)
   ================================================================ */
const BackToTop = (() => {
  const btn = $('#btt');

  function toggle() {
    btn?.classList.toggle('visible', window.scrollY > 450);
  }

  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  return { toggle };
})();


/* ================================================================
   2. NAVBAR
   ================================================================ */
(function Navbar() {
  const navbar   = $('#navbar');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id]');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    let active = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 110) active = sec.id;
    });
    navLinks.forEach(link => {
      const id = link.getAttribute('href').slice(1);
      link.classList.toggle('active', id === active);
    });

    BackToTop.toggle();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navLinks.forEach(link => link.addEventListener('click', () => MobileMenu.close()));
})();


/* ================================================================
   3. MOBILE MENU
   ================================================================ */
const MobileMenu = (() => {
  const btn      = $('#hamburger');
  const navLinks = $('#navLinks');

  function open() {
    btn.classList.add('open');
    navLinks.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    btn.classList.remove('open');
    navLinks.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function toggle() {
    navLinks.classList.contains('open') ? close() : open();
  }

  if (btn) {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
  }

  document.addEventListener('click', e => {
    if (navLinks?.classList.contains('open') && !e.target.closest('.nav-container')) {
      close();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  return { open, close, toggle };
})();


/* ================================================================
   4. SMOOTH SCROLL
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
    ) || 72;

    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - navH - 12,
      behavior: 'smooth',
    });
  });
});


/* ================================================================
   5. FAQ ACCORDION
   ================================================================ */
(function FAQ() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ================================================================
   6. CONTACT FORM
   ================================================================ */
(function ContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (validate()) {
      showToast('Enquiry sent! We\'ll contact you soon.');
      form.reset();
      $$('[data-error]', form).forEach(el => el.remove());
      $$('.error', form).forEach(el => el.classList.remove('error'));
    }
  });

  $$('input, select, textarea', form).forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });

  function validate() {
    let ok = true;

    $$('[required]', form).forEach(field => {
      if (!field.value.trim()) { markError(field); ok = false; }
    });

    const phone = $('#phone', form);
    if (phone?.value && !/^\+?[\d\s\-()]{8,15}$/.test(phone.value.trim())) {
      markError(phone); ok = false;
    }

    const email = $('#email', form);
    if (email?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      markError(email); ok = false;
    }

    return ok;
  }

  function markError(field) {
    field.classList.add('error');
    field.focus();
  }
})();


/* ================================================================
   7. TOAST NOTIFICATION
   ================================================================ */
function showToast(msg) {
  const toast = $('#toast');
  if (!toast) return;

  if (msg) toast.querySelector('span').textContent = msg;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3800);
}


/* ================================================================
   8. SCROLL REVEAL  (IntersectionObserver)
   ================================================================ */
(function ScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('[data-reveal-item]').forEach(el => el.classList.add('revealed'));
    return;
  }

  document.documentElement.classList.add('js-ready');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

  $$('[data-reveal-item]').forEach(el => obs.observe(el));
})();


/* ================================================================
   9. HERO KPI COUNTER ANIMATION
   ================================================================ */
(function KPICounters() {
  if (!('IntersectionObserver' in window)) return;

  const kpis = $$('.kpi-num[data-count]');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.7 });

  kpis.forEach(el => obs.observe(el));

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const prefix   = el.dataset.prefix  || '';
    const suffix   = el.dataset.suffix  || '';
    const isFloat  = String(target).includes('.');
    const duration = 1400;
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * target;
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }
})();


/* ================================================================
   10. HERO VISUAL — subtle parallax on mouse move (desktop only)
   ================================================================ */
(function HeroParallax() {
  const heroVisual = $('.hero-visual');
  if (!heroVisual || window.innerWidth < 960) return;

  let ticking = false;

  document.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      heroVisual.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;
      ticking = false;
    });
  });
})();


/* ================================================================
   11. NAVBAR LINK — underline slide indicator (desktop only)
   ================================================================ */
(function NavIndicator() {
  const nav = $('#navLinks');
  if (!nav || window.innerWidth < 641) return;

  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.style.cssText = `
    position:absolute; bottom:0; height:2px;
    background:var(--blue); border-radius:2px;
    transition:left .25s ease, width .25s ease;
    pointer-events:none;
  `;
  nav.style.position = 'relative';
  nav.appendChild(indicator);

  function moveIndicator(link) {
    const r  = link.getBoundingClientRect();
    const nr = nav.getBoundingClientRect();
    indicator.style.left  = (r.left - nr.left) + 'px';
    indicator.style.width = r.width + 'px';
  }

  $$('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicator(link));
  });

  nav.addEventListener('mouseleave', () => {
    const active = $('.nav-link.active', nav);
    if (active) moveIndicator(active);
    else indicator.style.width = '0';
  });

  const active = $('.nav-link.active', nav);
  if (active) {
    indicator.style.transition = 'none';
    moveIndicator(active);
    requestAnimationFrame(() => { indicator.style.transition = ''; });
  }
})();
