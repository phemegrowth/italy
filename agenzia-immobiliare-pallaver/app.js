/* Agenzia Immobiliare Pallaver: header, full-screen menu, anchors, reveals, type-first hero (the name is fitted to
   the full width, letters rise, a rule draws, the photo strip slides in from the right), steps line drawing on
   scroll, phone contact bar, form validation and the GSAP signature scene (catalogue 3, text-mask fly-through:
   BOLZANO on desktop, CASA on phones, cut out of a solid layer, the camera flies through a letter stroke). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('is-ready'); html.classList.add('no-pin'); }
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

  /* steps line, rAF-throttled scroll handler */
  var hero = d.querySelector('.hero');
  var steps = d.querySelector('[data-line]');
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    if (steps && !reduce) {
      var sr = steps.getBoundingClientRect();
      var q = Math.min(1, Math.max(0, (vh * 0.75 - sr.top) / Math.max(1, sr.height)));
      steps.style.setProperty('--line-p', q.toFixed(3));
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();

  /* phone contact bar: after the hero, hidden while the scene is pinned and in the contact section */
  var pbar = d.querySelector('.pbar'), contact = d.getElementById('contatti'), scenePinned = false;
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe su cosa vi serve.' };
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

  /* fit the name to the full width */
  var name = d.querySelector('.hero__name');
  function fitName() {
    if (!name) return;
    name.style.fontSize = '';
    name.style.justifyContent = 'flex-start';
    var w = name.clientWidth, s = 0;
    Array.prototype.forEach.call(name.children, function (c) { s += c.getBoundingClientRect().width; });
    if (s > 0) {
      var fs = parseFloat(getComputedStyle(name).fontSize) * (w * 0.985) / s;
      name.style.fontSize = Math.min(fs, 320).toFixed(1) + 'px';
    }
    name.style.justifyContent = '';
  }
  fitName();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fitName);
  window.addEventListener('resize', fitName);

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-pin'); return; }
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
    var svg = sec.querySelector('.mask'), bg = sec.querySelector('.mask__bg'), fill = sec.querySelector('.mask__fill');
    var txt = sec.querySelector('.mask__t'), cap = sec.querySelector('.scene__cap'), hint = sec.querySelector('.scene__hint');
    var img = sec.querySelector('.scene__img');
    var word = small ? 'CASA' : 'BOLZANO';
    var idx = small ? 0 : 2;          /* C on phones, L on desktop: fly through the letter's stem */
    var ox = small ? 0.12 : 0.18;
    var W = stage.clientWidth, H = stage.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    [bg, fill].forEach(function (r) { r.setAttribute('x', 0); r.setAttribute('y', 0); r.setAttribute('width', W); r.setAttribute('height', H); });
    txt.textContent = word;
    txt.setAttribute('x', W / 2); txt.setAttribute('y', H / 2);
    txt.setAttribute('font-size', 100);
    var bw = txt.getComputedTextLength() || 1;
    var fsz = Math.min((W * 0.9) / bw * 100, H * 0.62);
    txt.setAttribute('font-size', fsz.toFixed(1));
    var ext = txt.getExtentOfChar(idx);
    var cx = ext.x + ext.width * ox, cy = ext.y + ext.height * 0.55;
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.fromTo(txt, { scale: 1 }, { scale: small ? 30 : 34, svgOrigin: cx + ' ' + cy, ease: 'power3.in', duration: 0.72 }, 0)
      .fromTo(img, { scale: 1.18 }, { scale: 1, duration: 0.8 }, 0)
      .to(hint, { opacity: 0, duration: 0.06 }, 0.02)
      .to(fill, { opacity: 0, duration: 0.08 }, 0.66)
      .fromTo(cap, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' }, 0.76)
      .to({}, { duration: 0.08 }, 0.92);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%', pin: stage, scrub: 0.4, animation: tl,
      onToggle: function (s) { scenePinned = s.isActive; pb(); }
    });
    return function () { st.kill(); tl.kill(); gsap.set([txt, img, fill, cap, hint], { clearProps: 'all' }); };
  }
})();
