/* Special Case: hero reel (tall photos unmask, then drift left with the scroll while the headline holds),
   header, full-screen menu, anchors, reveals, phone contact bar, form validation, and the GSAP signature scene:
   a route draws from the office in Via Cavour across the south of Torino, pin by pin, through their seven real listings. */
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
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 90);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* hero reel drifts left as you scroll */
  var reel = d.querySelector('.reel');
  if (reel && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.5) reel.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sulla casa.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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

  /* GSAP signature scene: the route */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 980px)', function () { routeScene(false); });
    mm.add('(max-width: 979px)', function () { routeScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function routeScene(small) {
    var sec = d.querySelector('[data-scene]');
    var legs = sec.querySelectorAll('.legs path'), pins = sec.querySelectorAll('.pins circle');
    var items = sec.querySelectorAll('.lst li'), home = sec.querySelector('.home');
    var towns = sec.querySelectorAll('.towns text'), cnt = sec.querySelector('[data-count]');
    legs.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }); });
    gsap.set(pins, { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
    gsap.set(home, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
    gsap.set(towns, { autoAlpha: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(home, { scale: 1, duration: .3, ease: 'back.out(2.5)' }, 0)
      .to(towns, { autoAlpha: 1, duration: .3, stagger: .05 }, .1);
    var at = [];
    legs.forEach(function (p, i) {
      var t0 = .5 + i;
      at[i] = t0 + .55;
      tl.to(p, { strokeDashoffset: 0, duration: .6, ease: 'power1.inOut' }, t0)
        .to(pins[i], { scale: 1, autoAlpha: 1, duration: .3, ease: 'back.out(3)' }, t0 + .5);
    });
    tl.to({}, { duration: .5 }, .5 + legs.length);

    var last = -2;
    function sync() {
      var t = tl.time(), s = -1;
      for (var k = 0; k < at.length; k++) if (t >= at[k] - .05) s = k;
      if (s < 0) s = 0;
      if (s === last) return; last = s;
      items.forEach(function (li, i) { li.classList.toggle('is-on', i === s); });
      pins.forEach(function (c, i) { c.classList.toggle('is-on', i === s); });
      cnt.textContent = '0' + (s + 1);
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=180%' : '+=260%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    sync();
    return function () { st.kill(); items.forEach(function (li) { li.classList.remove('is-on'); }); };
  }
})();
