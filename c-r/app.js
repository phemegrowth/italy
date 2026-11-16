/* C.R.E. Cremona: header, full-screen menu, anchors, reveals, step line, phone contact bar, form validation,
   and the GSAP signature scene (catalogue 6, pinned horizontal: vertical scroll drives a strip of six cards,
   one per building use from their own site, each card unmasks as it enters, with a 01 / 06 counter and bar). */
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
  reveal(d.querySelectorAll('.steps__line'), function (el) { el.classList.add('is-drawn'); }, '0px 0px -20% 0px');

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), sceneEl = d.querySelector('.scene'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    var sr = sceneEl.getBoundingClientRect(), inScene = sr.top < 2 && sr.bottom > window.innerHeight - 2;
    pbar.classList.toggle('is-on', past && !scenePinned && !inScene && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

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

  /* GSAP signature scene: pinned horizontal */
  var sec = sceneEl, track = sec.querySelector('.hz__track'), cards = sec.querySelectorAll('.hz__card'), count = sec.querySelector('[data-count]'), bar = sec.querySelector('.scene__bar i');
  function staticScene() { sec.classList.add('scene--static'); bar.style.transform = 'none'; count.textContent = '06'; }
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
    var figs = sec.querySelectorAll('.hz__card figure');
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    var D = dist() || 1, W = window.innerWidth;
    var lefts = Array.prototype.map.call(cards, function (c) { return c.offsetLeft; });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 1.15 : 1.1) + window.innerHeight * .25); },
        pin: sec.querySelector('.scene__stage'), scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: function (s) {
          var k = Math.min(5, Math.floor(s.progress * 6));
          count.textContent = '0' + (k + 1);
          bar.style.transform = 'scaleX(' + Math.max(1 / 6, s.progress) + ')';
        },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(track, { x: function () { return -dist(); }, duration: 1 }, 0);
    figs.forEach(function (f, i) {
      var enter = (lefts[i] - W * 0.92) / D; /* progress at which the card's left edge comes in */
      if (enter <= 0) return;
      gsap.set(f, { clipPath: 'inset(0% 0% 0% 100%)' });
      tl.to(f, { clipPath: 'inset(0% 0% 0% 0%)', duration: .2, ease: 'power2.out' }, Math.min(.8, enter));
    });
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([track, figs], { clearProps: 'all' });
    };
  }
})();
