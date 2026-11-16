/* Obiettivo Casa: hero (G) with the 26 years counting up beside a photo that opens into the logo's house shape and
   the logo's red dot popping in, line reveal, header, phone menu, anchors, reveals, process line, magnetic buttons,
   phone bar, form validation, and the GSAP signature scene "In vendita adesso": the five live listings on a 3D ring
   that the scroll turns, front card outlined in red, counter 01 / 05. No JS or reduced motion: a swipeable strip. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  var bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
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
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* hero count-up: 26 years (2000 to 2026) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    el.textContent = '0';
    var t0 = null, dur = 1500;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    setTimeout(function () { requestAnimationFrame(step); }, 200);
  });

  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.pstep');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.03 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    ringScene(window.innerWidth < 861);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ringScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var wheel = sec.querySelector('[data-wheel]'), cards = sec.querySelectorAll('.lst'), idx = sec.querySelector('[data-idx]');
    var n = cards.length, step = 360 / n;
    var cw = small ? Math.min(window.innerWidth * 0.66, 300) : 430;
    var stageH = sec.querySelector('.ring__stage').getBoundingClientRect().height;
    sec.classList.add('is-3d');
    wheel.style.setProperty('--cw', cw + 'px');
    var ch = cards[0].offsetHeight;
    cards.forEach(function (c) { ch = Math.max(ch, c.offsetHeight); });
    wheel.style.setProperty('--ch', ch + 'px');
    var R = Math.round((cw / 2) / Math.tan(Math.PI / n)) + (small ? 18 : 40);
    cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
    var scale = small ? Math.min(1, (stageH * 0.92) / ch) : Math.min(1, (stageH * 0.9) / ch);
    var state = { rot: 0 };
    function paint() {
      wheel.style.transform = 'scale(' + scale.toFixed(3) + ') translateZ(' + (-R) + 'px) rotateY(' + state.rot.toFixed(2) + 'deg)';
      var front = ((Math.round(-Math.min(0, state.rot) / step) % n) + n) % n;
      cards.forEach(function (c, i) {
        var a = ((i * step + state.rot) % 360 + 540) % 360 - 180;
        var k = Math.cos(a * Math.PI / 180);
        c.style.opacity = Math.max(0, k * 0.85 + 0.15).toFixed(2);
        c.classList.toggle('is-front', i === front);
      });
      if (idx) idx.textContent = '0' + (front + 1);
    }
    gsap.set(wheel, { opacity: 0 });
    var tl = gsap.timeline();
    tl.to(wheel, { opacity: 1, duration: .4 }, 0)
      .fromTo(state, { rot: 40 }, { rot: 0, duration: .6, ease: 'power2.out', onUpdate: paint }, 0)
      .to(state, { rot: -step * (n - 1), duration: n - 1, ease: 'none', onUpdate: paint }, .7)
      .to({}, { duration: .4 });
    paint();
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=180%' : '+=260%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
  }
})();
