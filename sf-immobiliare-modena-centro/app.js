/* SF Immobiliare Modena Centro: split hero (blue curtain lifts off the photo, photo parallax), header, full-screen menu,
   anchors, reveals, accordion, step line, phone contact bar, form validation and the GSAP signature scene:
   eight listings on a 3D ring that the scroll turns, one to the front at a time, with a 01 / 08 counter. */
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
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
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


  /* hero photo parallax: slower than the page */
  var hp = d.querySelector('.hero__pic img');
  if (hp && !reduce) {
    var rq = false;
    window.addEventListener('scroll', function () {
      if (rq) return; rq = true;
      requestAnimationFrame(function () {
        rq = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.3) hp.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* accordion: one open at a time, height animation */
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

  /* menu colours */
  var obs = new MutationObserver(function () { d.body.classList.toggle('menu-open', menu.classList.contains('is-open')); });
  obs.observe(menu, { attributes: true, attributeFilter: ['class'] });

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

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

  /* GSAP signature scene: listings on a ring turned by the scroll */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return ringScene(false); });
    mm.add('(max-width: 899px)', function () { return ringScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ringScene(small) {
    var sec = d.querySelector('[data-scene]');
    var stage = sec.querySelector('.ring__stage'), wheel = sec.querySelector('.ring__wheel'), cards = sec.querySelectorAll('.card');
    var cnt = sec.querySelector('[data-count]');
    var N = cards.length, step = 360 / N, R = 0;
    function layout() {
      var w = wheel.offsetWidth;
      R = Math.round((w / 2) / Math.tan(Math.PI / N) + (small ? 18 : 40));
      cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
    }
    layout();
    var state = { a: 0 };
    function paint() {
      wheel.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-state.a).toFixed(2) + 'deg)';
      var front = Math.round(state.a / step) % N;
      cards.forEach(function (c, i) {
        var diff = Math.abs((((i * step - state.a) % 360) + 540) % 360 - 180);
        c.style.opacity = diff > 100 ? 0 : (1 - diff / 140).toFixed(2);
        c.classList.toggle('is-front', i === front);
      });
      cnt.textContent = ('0' + (front + 1)).slice(-2);
    }
    gsap.set(sec.querySelectorAll('.ring__head > *'), { autoAlpha: 0, y: 24 });
    gsap.set(stage, { autoAlpha: 0, scale: .85 });
    paint();
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(sec.querySelectorAll('.ring__head > *'), { autoAlpha: 1, y: 0, duration: .5, stagger: .08, ease: 'power2.out' }, 0);
    tl.to(stage, { autoAlpha: 1, scale: 1, duration: .6, ease: 'power2.out' }, .1);
    tl.to(state, { a: step * (N - 1), duration: N - 1, ease: 'none', onUpdate: paint, snap: false }, .7);
    tl.to({}, { duration: .4 });
    ScrollTrigger.create({
      animation: tl, trigger: sec, start: 'top top', end: small ? '+=260%' : '+=320%',
      pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
      onRefresh: function () { layout(); paint(); },
      onToggle: function (s) { scenePinned = s.isActive; bar(); }
    });
    return function () { wheel.style.transform = ''; cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; }); gsap.set(stage, { clearProps: 'all' }); };
  }
})();
