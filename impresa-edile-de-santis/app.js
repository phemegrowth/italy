/* Impresa Edile De Santis: header, full-screen menu, anchors, reveals, list-driven photo, step line,
   phone contact bar, form validation, and the GSAP signature scene (catalogue 1, blueprint to building:
   the drawing traces itself, then the wall rises course by course, openings get their lintels, the plaster goes on). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (already-visible elements show at once) */
  function reveal(els, cb, margin) {
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
    }, { rootMargin: margin || '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * .9) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });
  reveal(d.querySelectorAll('.steps__line'), function (el) { el.classList.add('is-drawn'); }, '0px 0px -25% 0px');

  /* services: the active row swaps the photo (hover/focus on desktop, scroll position everywhere) */
  var rows = d.querySelectorAll('.svc__list li'), pics = d.querySelectorAll('.svc__pics img');
  function setRow(k) {
    rows.forEach(function (r, j) { r.classList.toggle('is-on', j === k); });
    pics.forEach(function (p, j) { p.classList.toggle('is-on', j === k); });
  }
  rows.forEach(function (r, j) {
    r.addEventListener('mouseenter', function () { setRow(j); });
  });
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setRow(+en.target.getAttribute('data-img')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { rio.observe(r); });
  }
  setRow(0);

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false, sceneEl = d.querySelector('.scene');
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    var sr = sceneEl.getBoundingClientRect(), inScene = sr.top < 2 && sr.bottom > window.innerHeight - 2;
    pbar.classList.toggle('is-on', past && !scenePinned && !inScene && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  var sec = d.querySelector('.scene'), pct = sec.querySelector('[data-pct]');
  function staticScene() { sec.classList.add('scene--static'); pct.textContent = '100'; }
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { staticScene(); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return build(false); });
    mm.add('(max-width: 760px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var stage = sec.querySelector('.scene__stage');
    var lines = sec.querySelectorAll('.bp path'), texts = sec.querySelectorAll('.draw .t');
    var bricks = sec.querySelector('.draw__bricks'), plaster = sec.querySelector('.draw__plaster');
    var roof = sec.querySelector('.draw__roof'), lintels = sec.querySelectorAll('.lintels rect');
    var labs = sec.querySelectorAll('.scene__labs li'), head = sec.querySelector('.scene__head');
    var extras = sec.querySelectorAll('.draw__pct, .draw__tag, .holes');
    var cur = -1, count = { v: 0 };
    function set(k) {
      if (k === cur) return; cur = k;
      labs.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
    }
    gsap.set(lines, { strokeDashoffset: 1 });
    gsap.set(texts, { opacity: 0 });
    gsap.set(bricks, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(plaster, { clipPath: 'inset(0% 0% 0% 100%)' });
    gsap.set(roof, { clipPath: 'polygon(0% 100%, 0% 100%, 100% 100%, 100% 100%)' });
    gsap.set(lintels, { opacity: 0, y: -14 });
    gsap.set(extras, { opacity: 0 });
    pct.textContent = '0';
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=240%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; set(p < 0.24 ? 0 : p < 0.62 ? 1 : p < 0.78 ? 2 : 3); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(extras, { opacity: 1, duration: 0.05 }, 0.04)
      .to(lines, { strokeDashoffset: 0, duration: 0.16, stagger: 0.02 }, 0.03)
      .to(texts, { opacity: 1, duration: 0.04 }, 0.18)
      .to(bricks, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.36 }, 0.24)
      .to(count, { v: 100, duration: 0.36, onUpdate: function () { pct.textContent = Math.round(count.v); } }, 0.24)
      .to(lintels, { opacity: 1, y: 0, duration: 0.1, stagger: 0.015, ease: 'power2.out' }, 0.62)
      .to(roof, { clipPath: 'polygon(0% 100%, 50% 0%, 50% 0%, 100% 100%)', duration: 0.1 }, 0.78)
      .to(plaster, { clipPath: 'inset(0% 0% 0% 45%)', duration: 0.14 }, 0.82)
      .to({}, { duration: 0.06 });
    set(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([lines, texts, bricks, plaster, roof, lintels, head, extras], { clearProps: 'all' });
    };
  }
})();
