/* Ve.Ro. Impresa Edile homepage. Signature scene (catalogue 10, 3D card ring): the six trades sit on a ring;
   the pinned section turns the ring with scroll, counter 01 / 06 and a progress bar.
   The rest (menu, reveals, step line, count-up, form) is in the shared block below. */
window.__scene = function (c) {
  var d = c.d, sec = d.querySelector('.ring');
  if (!sec) return;
  if (c.reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('no-scene'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var wheel = sec.querySelector('.ring__wheel'), cards = sec.querySelectorAll('.rc'), now = sec.querySelector('.ring__now'),
      bar = sec.querySelector('.ring__bar'), stage = sec.querySelector('.ring__stage'), head = sec.querySelector('.ring__head');
  function size() {
    var w = window.innerWidth, small = w < 700;
    var cw = small ? Math.min(250, w * 0.64) : 340, ch = small ? Math.min(360, stage.clientHeight * 0.9) : Math.min(470, stage.clientHeight * 0.92);
    var rad = Math.round(cw * (small ? 0.98 : 1.18));
    sec.style.setProperty('--cw', cw + 'px'); sec.style.setProperty('--ch', ch + 'px'); sec.style.setProperty('--rad', rad + 'px');
    return rad;
  }
  var rad = size();
  var st = { a: 0 };
  function apply() {
    wheel.style.transform = 'translateZ(' + (-rad) + 'px) rotateY(' + (-st.a) + 'deg)';
    var k = ((Math.round(st.a / 60) % 6) + 6) % 6;
    cards.forEach(function (el, i) { el.classList.toggle('is-front', i === k); });
    now.textContent = '0' + (k + 1);
  }
  gsap.set([head, stage, bar], { autoAlpha: 0, y: 30 });
  apply();
  var small = window.innerWidth < 700;
  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%', pin: sec.querySelector('.ring__pin'), scrub: 0.7,
      onUpdate: function (s) { bar.style.setProperty('--p', s.progress.toFixed(3)); },
      invalidateOnRefresh: true
    }
  });
  tl.to([head, stage, bar], { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.02, ease: 'power2.out' }, 0)
    .to(st, { a: 300, duration: 0.85, onUpdate: apply }, 0.1)
    .to({}, { duration: 0.05 });
  window.addEventListener('resize', function () { rad = size(); apply(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
};
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-pinned') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already on screen shows at once) */
  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* progress line on the steps */
  var steps = d.querySelector('[data-line]'), tick = false;
  function frame() {
    tick = false;
    var vh = window.innerHeight;
    if (steps) {
      var s = steps.getBoundingClientRect();
      steps.style.setProperty('--p', Math.min(1, Math.max(0, (vh * 0.8 - s.top) / (s.height * 0.9))).toFixed(4));
    }
    if (window.__onFrame) window.__onFrame(vh);
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  } else if (steps) steps.style.setProperty('--p', 1);

  /* years counted up (a quantity: years since a sourced year) */
  d.querySelectorAll('[data-years]').forEach(function (el) {
    var to = new Date().getFullYear() - parseInt(el.getAttribute('data-years'), 10);
    el.textContent = to;
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null, dur = 1400;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* magnetic buttons, desktop only */
  if (!reduce && fine) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate un nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (yy) { yy.textContent = new Date().getFullYear(); });

  /* page-specific scene, built after fonts are ready */
  window.__ctx = { d: d, reduce: reduce, fine: fine };
  function go() { if (window.__scene) window.__scene(window.__ctx); }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(go); else go();
})();
