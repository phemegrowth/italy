/* AM Tutto Tetti homepage. Signature scene (catalogue 5, layered section, re-made for a roof): a roof slope in
   section builds itself with scroll: timber beams run out along the slope, then the boarding, insulation and
   membrane, battens and coppi settle onto it one by one, and finally the gutter and downpipe drop in.
   The five-step list lights up in sync. Shared block (menu, reveals, form) below. */
window.__scene = function (c) {
  var d = c.d, sec = d.querySelector('.roof');
  if (!sec) return;
  if (c.reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('no-scene'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var q = function (s) { return sec.querySelector(s); };
  var items = sec.querySelectorAll('.roof__list li');
  var L = [0, 1, 2, 3, 4].map(function (i) { return q('.ly' + i); });
  var small = window.innerWidth < 700;
  function setOn(k) { items.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-i') === k); }); }
  var txt = [q('.roof__txt .label'), q('.roof__txt .h2'), q('.roof__list')];
  gsap.set(txt, { autoAlpha: 0, y: 24 });
  gsap.set(q('.r-wall'), { autoAlpha: 0 });
  gsap.set(L[0], { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set([L[1], L[2], L[3]], { autoAlpha: 0, y: -90 });
  gsap.set(L[4], { autoAlpha: 0, y: -60 });
  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%', pin: q('.roof__pin'), scrub: 0.6,
      onUpdate: function (s) {
        var t = s.progress;
        setOn(t < 0.1 ? -1 : t < 0.28 ? 0 : t < 0.46 ? 1 : t < 0.64 ? 2 : t < 0.82 ? 3 : 4);
      }
    }
  });
  tl.to(txt, { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.015, ease: 'power2.out' }, 0)
    .to(q('.r-wall'), { autoAlpha: 1, duration: 0.06 }, 0.04)
    .to(L[0], { scaleX: 1, duration: 0.16, ease: 'power1.inOut' }, 0.1)
    .to(L[1], { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.3)
    .to(L[2], { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.48)
    .to(L[3], { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.66)
    .to(L[4], { autoAlpha: 1, y: 0, duration: 0.1, ease: 'bounce.out' }, 0.84)
    .to({}, { duration: 0.06 });
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
