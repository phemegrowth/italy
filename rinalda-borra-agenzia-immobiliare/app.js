/* Rinalda Borra: header, full-screen menu, anchors, reveals, phone contact bar, form validation, and the GSAP
   signature scene (invented for her: an empty room is valued, staged, shot as a video tour and shrinks into a
   listing card, the four steps of her own marketing method). Hero cards fan out in CSS. */
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
    var msgs = { name: 'Scrivi nome e cognome.', phone: 'Serve un numero per richiamarti.', email: 'Indirizzo email non valido.', message: 'Due righe sulla tua richiesta.' };
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
  var sec = sceneEl, frame = sec.querySelector('.shot__frame'), b = sec.querySelector('.shot__b'), bimg = b.querySelector('img');
  var corners = sec.querySelectorAll('.shot__corners i'), rec = sec.querySelector('.shot__rec'), val = sec.querySelector('.shot__val');
  var card = sec.querySelector('.shot__card'), caps = sec.querySelectorAll('.scene__caps li');
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
    gsap.set(frame, { scale: 0.9, y: 0 });
    gsap.set(b, { clipPath: 'inset(0% 0% 0% 100%)' });
    gsap.set(bimg, { scale: 1.18, xPercent: 4 });
    gsap.set(corners, { opacity: 0, scale: 1.4 });
    gsap.set([rec, val], { opacity: 0, y: 12 });
    gsap.set(card, { opacity: 0, y: 60 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=230%', pin: sec.querySelector('.scene__stage'), scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setCap(p < 0.27 ? 0 : p < 0.5 ? 1 : p < 0.72 ? 2 : 3); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(frame, { scale: 1, duration: 0.12, ease: 'power2.out' }, 0)
      .to(val, { opacity: 1, y: 0, duration: 0.06 }, 0.08)
      .to(b, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.2, ease: 'power1.inOut' }, 0.27)
      .to(val, { opacity: 0, y: -12, duration: 0.05 }, 0.3)
      .to(corners, { opacity: 1, scale: 1, duration: 0.06, stagger: 0.01 }, 0.48)
      .to(rec, { opacity: 1, y: 0, duration: 0.05 }, 0.5)
      .to(bimg, { scale: 1, xPercent: -2, duration: 0.24 }, 0.48)
      .to([corners, rec], { opacity: 0, duration: 0.05 }, 0.72)
      .to(frame, { scale: small ? 0.74 : 0.7, y: small ? '-12%' : '-10%', borderRadius: 22, duration: 0.14, ease: 'power2.inOut' }, 0.74)
      .to(card, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.82)
      .to({}, { duration: 0.08 });
    setCap(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([frame, b, bimg, corners, rec, val, card], { clearProps: 'all' });
    };
  }
})();
