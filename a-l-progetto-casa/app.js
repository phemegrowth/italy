/* A.L Progetto Casa: header, full-screen menu, anchors, reveals, count-up, services photo swap,
   phone contact bar, form validation, and the GSAP signature scene (blueprint to home, after catalogue 1:
   the two house lines of their logo draw themselves, the room fills inside, then the house opens to the full frame). */
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
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * .9) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up: none on this page (no sourced quantities) */
  /* (kept out on purpose) */

  /* services: the photo beside the list follows hover (desktop) and the row nearest the middle of the screen */
  var rows = d.querySelectorAll('.svc__list li'), pics = d.querySelectorAll('.svc__pic img');
  function act(i) {
    rows.forEach(function (r, j) { r.classList.toggle('is-act', j === i); });
    pics.forEach(function (p, j) { p.classList.toggle('is-on', j === i); });
  }
  rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { act(i); }); });
  if ('IntersectionObserver' in window) {
    var mid = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) act(+e.target.dataset.img); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { mid.observe(r); });
  }

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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sulla casa, per favore.' };
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
  var sec = d.querySelector('.plan');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('plan--static'); return; }
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
    var stage = sec.querySelector('.plan__stage');
    var house = sec.querySelector('.plan__house'), fill = sec.querySelector('.plan__fill'), img = fill.querySelector('img');
    var l1 = sec.querySelector('.l1'), l2 = sec.querySelector('.l2'), l3 = sec.querySelector('.l3');
    var steps = sec.querySelectorAll('.plan__steps li'), num = sec.querySelector('.plan__num'), bar = sec.querySelector('.plan__bar i');
    var head = sec.querySelectorAll('.plan__copy > .eyebrow, .plan__copy > h2');
    var curK = -1;
    function set(k) {
      if (k === curK) return; curK = k;
      steps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
      num.textContent = '0' + (k + 1);
    }
    /* redraw the house lines in pixels so the dash draw-on is exact (the static version scales a 100x100 box) */
    var svg = sec.querySelector('.plan__lines'), frame = sec.querySelector('.plan__frame');
    function geo() {
      var w = frame.clientWidth, h = frame.clientHeight, X = function (v) { return (v * w / 100).toFixed(1); }, Y = function (v) { return (v * h / 100).toFixed(1); };
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      l1.setAttribute('d', 'M0 ' + Y(100) + 'V' + Y(38) + 'L' + X(50) + ' 0L' + X(100) + ' ' + Y(38) + 'V' + Y(100));
      l2.setAttribute('d', 'M' + X(30) + ' ' + Y(100) + 'V' + Y(58) + 'L' + X(62) + ' ' + Y(30) + 'L' + X(94) + ' ' + Y(58) + 'V' + Y(100));
      l3.setAttribute('d', 'M0 ' + (h - 0.75) + 'H' + w);
      [l1, l2, l3].forEach(function (l) { l.style.vectorEffect = 'none'; });
    }
    geo();
    ScrollTrigger.addEventListener('refreshInit', geo);
    gsap.set([l1, l2, l3], { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(fill, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(house, { clipPath: 'polygon(0% 100%, 0% 38%, 50% 0%, 100% 38%, 100% 100%)' });
    gsap.set(img, { scale: 1.18 });
    gsap.set(bar, { scaleX: 0 });
    gsap.set(head, { opacity: 0, y: 24 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; set(p < 0.26 ? 0 : p < 0.5 ? 1 : p < 0.74 ? 2 : 3); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(head, { opacity: 1, y: 0, duration: 0.06, stagger: 0.02, ease: 'power2.out' }, 0)
      .to(l3, { strokeDashoffset: 0, duration: 0.1 }, 0.04)
      .to(l1, { strokeDashoffset: 0, duration: 0.2 }, 0.08)
      .to(l2, { strokeDashoffset: 0, duration: 0.18 }, 0.16)
      .to(fill, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.34, ease: 'power1.inOut' }, 0.3)
      .to(img, { scale: 1.06, duration: 0.34 }, 0.3)
      .to(l2, { opacity: 0, duration: 0.08 }, 0.56)
      .to(house, { clipPath: 'polygon(0% 100%, 0% 0%, 50% 0%, 100% 0%, 100% 100%)', duration: 0.24, ease: 'power2.inOut' }, 0.7)
      .to(l1, { opacity: 0, duration: 0.1 }, 0.7)
      .to(img, { scale: 1, duration: 0.24 }, 0.7)
      .to(bar, { scaleX: 1, duration: 1 }, 0)
      .to({}, { duration: 0.06 });
    set(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      ScrollTrigger.removeEventListener('refreshInit', geo);
      gsap.set([l1, l2, l3, fill, house, img, bar, head], { clearProps: 'all' });
    };
  }
})();
