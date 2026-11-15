/* Immobiliare Urru: hero entrance (four photo cards fly in from a stack and settle into a collage, rating tag pops,
   line reveal), header, menu, anchors, reveals, count-ups (25 reviews, 19 listings, 24 five-star), magnetic buttons,
   phone bar, form validation, and the GSAP signature scene: their eight real listings on a 3D ring turned by scroll
   (desktop) or a deck of cards dealt one by one (phone), with a 01 / 08 counter. */
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
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); if (id === '#top') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
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

  /* count-ups: 25 reviews, 19 listings online, 24 five-star reviews */
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* services: hover, or the item nearest mid-screen, swaps the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.svc__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  if (!reduce) {
    var lt = false;
    window.addEventListener('scroll', function () {
      if (lt) return; lt = true;
      requestAnimationFrame(function () {
        lt = false;
        var mid = window.innerHeight * 0.55, best = null, bd = 1e9;
        items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
        if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
      });
    }, { passive: true });
  }

  /* method line */
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



  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    ringScene(window.innerWidth < 980);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ringScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var cards = Array.prototype.slice.call(sec.querySelectorAll('.lst'));
    var N = cards.length, step = 360 / N, R = 480;
    var phase = sec.querySelector('[data-phase]');
    var wheel = sec.querySelector('.ring__wheel');
    var st = { p: 0 };
    var lastFront = -1;
    function render() {
      var p = st.p;
      cards.forEach(function (c, i) {
        if (small) {
          var dd = i - p;
          if (dd < 0) {
            gsap.set(c, { x: dd * 120 + '%', y: 0, rotation: dd * 10, scale: 1, autoAlpha: Math.max(0, 1 + dd * 1.2), zIndex: 100 - i });
          } else {
            gsap.set(c, { x: 0, y: Math.min(dd, 3) * 14, rotation: 0, scale: 1 - Math.min(dd, 3) * .05, autoAlpha: dd < 3.2 ? 1 : 0, zIndex: 100 - i });
          }
        } else {
          var a = i * step - p * step;
          var rad = a * Math.PI / 180, cz = Math.cos(rad);
          gsap.set(c, { transform: 'rotateY(' + a + 'deg) translateZ(' + R + 'px)', autoAlpha: Math.max(.08, (cz + 1) / 2), zIndex: Math.round(cz * 100) + 100 });
        }
      });
      if (!small) gsap.set(wheel, { transform: 'translateZ(' + (-R) + 'px)' });
      var f = Math.min(N - 1, Math.max(0, Math.round(p)));
      if (f !== lastFront) {
        lastFront = f;
        if (phase) phase.textContent = (f + 1 < 10 ? '0' : '') + (f + 1);
        cards.forEach(function (c, i) { c.classList.toggle('is-front', i === f); });
      }
    }
    var tl = gsap.timeline();
    tl.fromTo(sec.querySelector('.ring__stage'), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power2.out' })
      .to(st, { p: N - 1, duration: N - 1, ease: 'none', onUpdate: render })
      .to({}, { duration: .4 });
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=260%' : '+=320%',
      pin: true, scrub: .7, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    render();
  }
})();
