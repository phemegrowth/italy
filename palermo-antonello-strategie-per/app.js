/* Antonello Palermo: header, full-screen menu, anchors, reveals, count-up, accordion, phone contact bar,
   form validation and the GSAP signature scene (catalogue 7, sticky list drives the photo):
   the five steps of his method light up one by one while the photo for each crossfades and slowly scales. */
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
  reveal(d.querySelectorAll('.steps'), function (el) { el.classList.add('is-drawn'); });

  /* count-up (sourced quantities only: rating, review count) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1400;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  /* accordion with height animation */
  var accs = d.querySelectorAll('.acc__i');
  accs.forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = function () { det.open = false; };
      } else {
        accs.forEach(function (o) { if (o !== det && o.open) o.open = false; });
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    });
  });

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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sulla casa.' };
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

  /* GSAP signature scene: the five steps, the active one lights up and its photo crossfades and slowly scales */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return listScene(false); });
    mm.add('(max-width: 760px)', function () { return listScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function listScene(small) {
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage');
    var items = sec.querySelectorAll('.scene__list li'), pics = sec.querySelectorAll('.scene__pics img'), bar = sec.querySelector('.scene__bar i');
    var n = items.length, cur = -1;
    function set(i) {
      if (i === cur) return; cur = i;
      items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    }
    gsap.set(pics, { opacity: 0, scale: 1.12 });
    gsap.set(pics[0], { opacity: 1 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=260%' : '+=320%', pin: stage, scrub: 0.5,
        onUpdate: function (s) { set(Math.min(n - 1, Math.floor(s.progress * n * 0.999))); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(bar, { scaleX: 1, duration: n }, 0);
    for (var i = 0; i < n; i++) {
      tl.to(pics[i], { scale: 1, duration: 1 }, i);
      if (i > 0) tl.to(pics[i], { opacity: 1, duration: 0.25 }, i - 0.1);
    }
    set(0);
    return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set(pics, { clearProps: 'all' }); gsap.set(bar, { clearProps: 'all' }); };
  }
})();
