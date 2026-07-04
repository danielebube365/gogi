(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* year */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* nav: transparent over hero, solid once the content curtain covers it */
  const nav = $('#nav');
  const onScroll = () => {
    nav.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.85);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* mobile menu */
  const toggle = $('#navToggle'), mobile = $('#navMobile');
  if (toggle && mobile) {
    const set = (open) => {
      mobile.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => set(!mobile.classList.contains('open')));
    $$('a', mobile).forEach((a) => a.addEventListener('click', () => set(false)));
  }

  /* scroll reveal */
  const reveals = new Set($$('.reveal'));
  const show = (el) => { el.classList.add('in'); reveals.delete(el); };
  if (reduced) { reveals.forEach(show); }
  else {
    const check = () => { const vh = innerHeight; reveals.forEach((el) => { if (el.getBoundingClientRect().top < vh * 0.9) show(el); }); };
    requestAnimationFrame(check);
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { threshold: 0.08 });
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* hero video: play while visible, pause once the curtain covers it (saves CPU) */
  const hv = $('.hero__media video');
  if (hv) {
    hv.muted = true; hv.setAttribute('muted', '');
    const kick = () => hv.play().catch(() => {});
    if (reduced) { hv.removeAttribute('autoplay'); }
    else {
      kick();
      let ticking = false;
      const manage = () => {
        ticking = false;
        if (window.scrollY > window.innerHeight) { if (!hv.paused) hv.pause(); }
        else if (hv.paused) kick();
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(manage); } }, { passive: true });
      document.addEventListener('visibilitychange', () => { if (!document.hidden && window.scrollY <= window.innerHeight) kick(); });
    }
  }
})();
