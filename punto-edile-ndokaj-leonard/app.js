/* Punto Edile: header, full-screen menu, anchors, reveals, service photo swap, step line, phone contact bar,
   form validation, split hero entrance and the GSAP signature scene (catalogue 1, blueprint to building). */
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

  /* reveals */
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

  /* services: the sticky photo follows the row in view (desktop) or the hovered row */
  var pic = d.querySelector('.svc__pic img'), rows = d.querySelectorAll('.svc__list li');
  function swap(li) {
    var src = li.getAttribute('data-img');
    rows.forEach(function (r) { r.classList.toggle('is-active', r === li); });
    if (!pic || pic.getAttribute('src') === src) return;
    if (reduce) { pic.src = src; return; }
    pic.classList.add('is-swap');
    setTimeout(function () { pic.src = src; pic.onload = function () { pic.classList.remove('is-swap'); }; }, 220);
  }
  rows.forEach(function (li) { li.addEventListener('mouseenter', function () { swap(li); }); });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) swap(e.target); }); }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (li) { so.observe(li); });
  }

  /* step line draws with scroll */
  var steps = d.querySelector('.steps');
  function stepLine() {
    if (!steps) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
    steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
  }
  window.addEventListener('scroll', stepLine, { passive: true });
  stepLine();

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
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

  /* GSAP signature scene: the elevation draws itself line by line, then the real building rises
     inside it floor by floor, the % counter follows and the four phases light up. */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
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
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage');
    var photo = sec.querySelector('.scene__photo'), frame = sec.querySelector('.scene__frame');
    var shapes = sec.querySelectorAll('.pl--main rect, .pl--main line'), grid = sec.querySelectorAll('.pl--grid line');
    var plan = sec.querySelector('.scene__plan'), pct = sec.querySelector('.scene__pct b'), steps = sec.querySelectorAll('.scene__steps li');
    var head = sec.querySelector('.scene__head');
    shapes.forEach(function (s) {
      s.setAttribute('pathLength', '100');
      s.style.strokeDasharray = '100'; s.style.strokeDashoffset = '100';
    });
    var st = { b: 0 };
    function paint() {
      photo.style.clipPath = 'inset(' + (100 - st.b * 100).toFixed(2) + '% 0 0 0)';
      pct.textContent = Math.round(st.b * 100);
    }
    paint();
    gsap.set(grid, { opacity: 0 });
    gsap.set(frame, { scale: 0.92, opacity: 0.4 });
    gsap.set(head, { opacity: 0, y: 30 });
    function setStep(k) { steps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); }); }
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=240%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setStep(p < 0.3 ? 0 : p < 0.55 ? 1 : p < 0.8 ? 2 : 3); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(head, { opacity: 1, y: 0, duration: 0.08 }, 0)
      .to(frame, { scale: 1, opacity: 1, duration: 0.1 }, 0)
      .to(grid, { opacity: 1, duration: 0.08, stagger: 0.01 }, 0.06)
      .to(shapes, { strokeDashoffset: 0, duration: 0.3, stagger: 0.012 }, 0.1)
      /* floor by floor: four steps with a short hold on each slab */
      .to(st, { b: 0.2, duration: 0.1, onUpdate: paint }, 0.42)
      .to(st, { b: 0.4, duration: 0.1, onUpdate: paint }, 0.53)
      .to(st, { b: 0.6, duration: 0.1, onUpdate: paint }, 0.64)
      .to(st, { b: 0.8, duration: 0.1, onUpdate: paint }, 0.75)
      .to(st, { b: 1, duration: 0.08, onUpdate: paint }, 0.86)
      .to(plan, { opacity: 0.18, duration: 0.08 }, 0.86)
      .to({}, { duration: 0.06 });
    setStep(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([head, frame, grid, plan], { clearProps: 'all' });
      shapes.forEach(function (s) { s.style.strokeDasharray = ''; s.style.strokeDashoffset = ''; });
      photo.style.clipPath = '';
    };
  }
})();
