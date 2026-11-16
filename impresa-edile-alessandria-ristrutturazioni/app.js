/* RSC Servizi: header, full-screen menu, anchors, reveals, reel hero that drifts with scroll, phone contact bar,
   form validation and the GSAP signature scene (pour: the finished room rises over the open site). */
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

  /* hero reel: the photo strip drifts left as the page scrolls (transform only) */
  var track = d.querySelector('.reel__track');
  function drift() {
    if (!track || reduce) return;
    var y = Math.min(window.scrollY, window.innerHeight * 1.2);
    track.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)';
  }
  window.addEventListener('scroll', drift, { passive: true });
  drift();

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

  /* GSAP signature scene (catalogue 11, pour): pinned; the finished room rises over the open site
     behind a moving wave edge, the level counter follows and the four phases light up. */
  var bEl = d.querySelector('.pour__b'), lvl = d.querySelector('.pour__lvl b'), steps = d.querySelectorAll('.pour__steps li');
  function wave(h, ph) {
    var amp = 3.2 * Math.sin(Math.PI * Math.min(1, Math.max(0, h))), pts = [], base = (1 - h) * 100;
    if (h <= 0) return 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)';
    for (var x = 0; x <= 100; x += 4) pts.push(x + '% ' + (base + amp * Math.sin(x / 100 * Math.PI * 3 + ph)).toFixed(2) + '%');
    pts.push('100% 100%', '0 100%');
    return 'polygon(' + pts.join(',') + ')';
  }
  function paint(h) {
    bEl.style.clipPath = wave(h, h * 9);
    if (lvl) lvl.textContent = Math.round(h * 100);
    var k = h < 0.25 ? 0 : h < 0.5 ? 1 : h < 0.8 ? 2 : 3;
    steps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
  }
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    paint(0);
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
    var sec = d.querySelector('.pour'), stage = sec.querySelector('.pour__stage'), head = sec.querySelector('.pour__head'), frame = sec.querySelector('.pour__frame');
    var st = { h: 0 };
    gsap.set(head, { opacity: 0, y: 30 });
    gsap.set(frame, { scale: 0.94 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: stage, scrub: 0.6,
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(head, { opacity: 1, y: 0, duration: 0.1 }, 0)
      .to(frame, { scale: 1, duration: 0.12 }, 0)
      .to(st, { h: 1, duration: 0.78, onUpdate: function () { paint(st.h); } }, 0.12)
      .to({}, { duration: 0.08 });
    return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set([head, frame], { clearProps: 'all' }); bEl.style.clipPath = ''; };
  }
})();
