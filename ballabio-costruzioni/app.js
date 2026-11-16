/* Ballabio Costruzioni: header, full-screen menu, anchors, reveals, phone contact bar, form validation,
   number-led hero (CSS) and the GSAP signature scene (catalogue 1, blueprint to building). */
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul progetto.' };
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

  /* GSAP signature scene: blueprint to building. The elevation lines draw themselves on the dark grid,
     then the building photo rises floor by floor inside them while a counter shows the % built. */
  function start() {
    var sec = d.querySelector('.scene');
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('scene--static'); return; }
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
    var lines = sec.querySelectorAll('.bp__svg rect, .bp__svg line'), photo = sec.querySelector('.bp__photo');
    var pct = sec.querySelector('.bp__pct b'), steps = sec.querySelectorAll('.bp__steps li');
    var st = { b: 0 }, cur = -1;
    function set(k) { if (k === cur) return; cur = k; steps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); }); }
    function paint() {
      /* rise in five floor steps, eased inside each floor */
      var floors = 5, f = st.b * floors, base = Math.floor(f), frac = f - base;
      var h = Math.min(1, (base + Math.min(1, frac * 1.6)) / floors);
      photo.style.clipPath = 'inset(' + ((1 - h) * 100).toFixed(2) + '% 0 0 0)';
      pct.textContent = Math.round(st.b * 100);
    }
    gsap.set(lines, { strokeDashoffset: 1 });
    st.b = 0; paint();
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; set(p < 0.25 ? 0 : p < 0.48 ? 1 : p < 0.72 ? 2 : 3); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(lines, { strokeDashoffset: 0, duration: 0.22, stagger: 0.012 }, 0)
      .to(st, { b: 1, duration: 0.66, onUpdate: paint }, 0.26)
      .to(lines, { opacity: 0.35, duration: 0.2 }, 0.7)
      .to({}, { duration: 0.08 });
    set(0);
    return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set(lines, { clearProps: 'all' }); photo.style.clipPath = ''; pct.textContent = '0'; };
  }
})();
