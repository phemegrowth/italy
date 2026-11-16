/* E.L. Costruzioni: header, full-screen menu, anchors, reveals, list-driven photo, step line, phone contact bar,
   form validation, and the GSAP signature scene (catalogue 4, before / after scrub: an old bathroom becomes
   a finished one as the wipe crosses, with four captions for the stages of the job). */
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

  /* services: the active row swaps the photo (hover on desktop, scroll position everywhere) */
  var rows = d.querySelectorAll('.svc__list li'), pics = d.querySelectorAll('.svc__pics img');
  function setRow(k) {
    rows.forEach(function (r, j) { r.classList.toggle('is-on', j === k); });
    var img = +rows[k].getAttribute('data-img');
    pics.forEach(function (p, j) { p.classList.toggle('is-on', j === img); });
  }
  rows.forEach(function (r, j) { r.addEventListener('mouseenter', function () { setRow(j); }); });
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setRow(Array.prototype.indexOf.call(rows, en.target)); });
    }, { rootMargin: window.innerWidth < 761 ? '-62% 0px -30% 0px' : '-45% 0px -45% 0px' });
    rows.forEach(function (r) { rio.observe(r); });
  }
  setRow(0);

  /* phone contact bar: after the hero, hidden in the scene and in the contact section */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), sceneEl = d.querySelector('.scene'), scenePinned = false;
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
  var sec = sceneEl, after = sec.querySelector('.ba__after'), bar = sec.querySelector('.ba__bar'), caps = sec.querySelectorAll('.scene__caps li');
  var labs = sec.querySelectorAll('.ba__lab');
  function setCap(k) { caps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); }); }
  function staticScene() { sec.classList.add('scene--static'); }
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
    var st = { p: 0 };
    function draw() {
      var x = 100 - st.p;
      after.style.clipPath = 'inset(0 0 0 ' + x + '%)';
      bar.style.left = x + '%';
    }
    st.p = 0; draw();
    gsap.set(labs, { opacity: 0 });
    gsap.set(sec.querySelector('.ba'), { clipPath: 'inset(8% 8% 8% 8%)' });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: sec.querySelector('.scene__stage'), scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setCap(p < 0.3 ? 0 : p < 0.55 ? 1 : p < 0.8 ? 2 : 3); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(sec.querySelector('.ba'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.14, ease: 'power2.out' }, 0)
      .to(labs, { opacity: 1, duration: 0.06 }, 0.1)
      .to(st, { p: 100, duration: 0.7, onUpdate: draw }, 0.18)
      .to({}, { duration: 0.1 });
    setCap(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([labs, sec.querySelector('.ba')], { clearProps: 'all' });
      after.style.clipPath = ''; bar.style.left = '';
    };
  }
})();
