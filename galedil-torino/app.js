/* Galedil Torino: hero entrance (GALEDIL letters rise, photo strip slides in from the right and drifts left on scroll),
   header, full-screen menu, anchors, reveals, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: the floor plan of a flat renovated trade by trade with the scroll
   (walls, demolition, systems, floors, bathroom and kitchen, windows, drywall ceiling with LED). */
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
        setTimeout(function () { cb(el); }, (k++) * 70);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* hero strip drifts left as you scroll */
  var strip = d.querySelector('.strip');
  if (strip && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.4) strip.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
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

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('preventivo'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { planScene(false); });
    mm.add('(max-width: 899px)', function () { planScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function planScene(small) {
    var sec = d.querySelector('[data-scene]');
    var q = function (s) { return sec.querySelectorAll(s); };
    var walls = q('.wall'), demo = sec.querySelector('.demo'), pipe = sec.querySelector('.pipe');
    var wires = q('.wire, .wire-pt'), floors = q('.fl__r'), rooms = q('.room'), fix = q('.fix > *');
    var wins = q('.win path'), cove = sec.querySelector('.cove'), leds = q('.led circle');
    var steps = q('.steps li'), cnt = sec.querySelector('[data-count]'), barEl = sec.querySelector('[data-bar]');
    function dash(el) { var L = el.getTotalLength(); gsap.set(el, { strokeDasharray: L, strokeDashoffset: L }); }
    walls.forEach(dash); dash(pipe); dash(cove);
    gsap.set(demo, { autoAlpha: 0 });
    gsap.set(wires, { autoAlpha: 0 });
    gsap.set(floors, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(rooms, { autoAlpha: 0 });
    gsap.set(fix, { autoAlpha: 0, scale: .6, transformOrigin: '50% 50%' });
    gsap.set(wins, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
    gsap.set(leds, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
    gsap.set(barEl, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [];
    at[1] = 0; tl.to(walls, { strokeDashoffset: 0, duration: .8, stagger: .08, ease: 'power1.inOut' }, 0)
      .to(demo, { autoAlpha: 1, duration: .3 }, .5);
    at[2] = 1.3; tl.to(demo, { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 50%', duration: .6, ease: 'power2.in' }, 1.5);
    at[3] = 2.3; tl.to(pipe, { strokeDashoffset: 0, duration: .8, ease: 'power1.inOut' }, 2.3)
      .to(wires, { autoAlpha: 1, duration: .4, stagger: .06 }, 2.5);
    at[4] = 3.4; tl.to(floors, { scaleY: 1, duration: .55, stagger: .1 }, 3.4)
      .to(rooms, { autoAlpha: 1, duration: .3, stagger: .05 }, 3.9);
    at[5] = 4.5; tl.to(fix, { autoAlpha: 1, scale: 1, duration: .4, stagger: .08, ease: 'back.out(1.8)' }, 4.5);
    at[6] = 5.4; tl.to(wins, { autoAlpha: 1, scale: 1, duration: .3, stagger: .03 }, 5.4);
    at[7] = 6.3; tl.to(cove, { strokeDashoffset: 0, duration: .6 }, 6.3)
      .to(leds, { autoAlpha: 1, scale: 1, duration: .3, stagger: .05, ease: 'back.out(3)' }, 6.6)
      .to(barEl, { scaleX: 1, duration: 7.3, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 7.3);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 1;
      for (var k = 1; k < at.length; k++) if (t >= at[k]) s = k;
      if (s === last) return; last = s;
      cnt.textContent = '0' + s;
      steps.forEach(function (li) {
        var n = +li.getAttribute('data-step');
        li.classList.toggle('is-on', n === s);
        li.classList.toggle('is-done', n < s);
      });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=190%' : '+=280%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    sync();
  }
})();
