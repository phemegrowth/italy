/* FCB Costruzioni: header, full-screen menu, anchors, reveals, curtain hero (CSS), service list that swaps the photo,
   steps line that draws on scroll, phone contact bar, form validation and the GSAP signature scene (catalogue 5,
   layered wall: a facade builds up with the scroll, brick, mesh, render, cornices, colour). */
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

  /* services: the active item swaps the photo (hover or tap on desktop, scroll position on phones) */
  var svcItems = d.querySelectorAll('.svc__list li'), sps = d.querySelectorAll('.sp');
  function svcOn(k) {
    svcItems.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    sps.forEach(function (im, i) { im.classList.toggle('is-on', i === k); });
  }
  svcItems.forEach(function (li, i) {
    li.addEventListener('mouseenter', function () { svcOn(i); });
    li.addEventListener('click', function () { svcOn(i); });
  });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) svcOn(+e.target.getAttribute('data-k')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    svcItems.forEach(function (li) { sio.observe(li); });
  }
  svcOn(0);

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
    var items = sec.querySelectorAll('.layers li');
    var num = sec.querySelector('.wall__n b'), bar = sec.querySelector('.wall__bar');
    var mesh = sec.querySelector('.wall__mesh'), render = sec.querySelector('.wall__render');
    var paint = sec.querySelector('.wall__paint'), deco = sec.querySelectorAll('.deco .d');
    var n = items.length, cur = -1;
    deco.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.dataset.l = L; });
    function show(k) {
      if (k === cur) return;
      cur = k;
      items.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
      num.textContent = '0' + (k + 1);
    }
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.set(mesh, { opacity: 0 }, 0)
      .set(render, { clipPath: 'inset(100% 0% 0% 0%)' }, 0)
      .set(paint, { clipPath: 'inset(0% 100% 0% 0%)' }, 0)
      .set(deco, { strokeDashoffset: function (i, el) { return el.dataset.l; } }, 0)
      .to(mesh, { opacity: 1, duration: 0.14 }, 0.2)
      .to(render, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16 }, 0.4)
      .to(deco, { strokeDashoffset: 0, duration: 0.14, stagger: 0.012 }, 0.6)
      .to(paint, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.14 }, 0.8)
      .to({}, { duration: 0.06 }, 0.94);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: stage, scrub: 0.4, animation: tl,
      onToggle: function (s) { scenePinned = s.isActive; pb(); },
      onUpdate: function (s) {
        var p = s.progress;
        show(Math.min(n - 1, Math.floor(p * n * 0.999)));
        bar.style.setProperty('--p', (0.06 + p * 0.94).toFixed(3));
      }
    });
    show(0);
    return function () { st.kill(); tl.kill(); gsap.set([mesh, render, paint], { clearProps: 'all' }); gsap.set(deco, { clearProps: 'all' }); };
  }
})();
