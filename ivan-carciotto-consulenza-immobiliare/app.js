/* Ivan Carciotto Consulenza Immobiliare: hero entrance (headline line by line, photo cards fan in and settle into a
   collage), header, full-screen phone menu, anchors, reveals, count-up, steps line drawing on scroll, review slider,
   magnetic buttons, phone bar, form validation, and the GSAP signature scene: a 3D ring of his real listings
   turned by scroll, the front card lit, with a 01 / 06 counter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header shrink + phone bar after the hero */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
    header.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already in view shows at once */
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

  /* count-up (review count only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count');
    if (reduce) { el.textContent = end + (el.getAttribute('data-suffix') || ''); return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (el.getAttribute('data-suffix') || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* steps: line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + .3) / st.length || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* review slider */
  var rs = d.querySelector('[data-rslide]');
  if (rs) {
    var qs = rs.querySelectorAll('.rq'), cur = 0, rc = d.querySelector('[data-rcount]');
    var show = function (n) {
      cur = (n + qs.length) % qs.length;
      qs.forEach(function (x, i) { x.classList.toggle('is-on', i === cur); });
      rc.textContent = (cur + 1) + ' / ' + qs.length;
    };
    d.querySelector('[data-prev]').addEventListener('click', function () { show(cur - 1); });
    d.querySelector('[data-next]').addEventListener('click', function () { show(cur + 1); });
    var x0 = null;
    rs.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    rs.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  /* magnetic buttons, desktop pointer only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivi nome e cognome.', phone: 'Serve un numero per richiamarti.', email: 'Scrivi un indirizzo email valido.', message: 'Scrivi due righe su cosa ti serve.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
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
    ringScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ringScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    html.classList.add('ring-on');
    var spin = sec.querySelector('.ring__spin'), cards = sec.querySelectorAll('.lc');
    var cnt = sec.querySelector('[data-cnt]'), bar = sec.querySelector('[data-bar]');
    var n = cards.length, step = 360 / n;
    sec.querySelectorAll('.lc img').forEach(function (i) { i.loading = 'eager'; });
    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 960px)', big: '(min-width: 961px)' }, function (ctx) {
      var small = ctx.conditions.small;
      var R = small ? 240 : 440;
      cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
      var state = { a: 0 };
      gsap.set(bar, { scaleX: 0 });
      var last = -1;
      function apply() {
        spin.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-state.a) + 'deg)';
        var k = Math.round(state.a / step) % n;
        if (k !== last) {
          last = k;
          cnt.textContent = '0' + (k + 1);
          cards.forEach(function (c, i) { c.classList.toggle('is-front', i === k); });
        }
      }
      var tl = gsap.timeline();
      // hold on each card: ease between snaps
      for (var i = 1; i < n; i++) tl.to(state, { a: i * step, duration: 1, ease: 'power2.inOut', onUpdate: apply }, (i - 1) * 1.3 + .3);
      tl.to(bar, { scaleX: 1, duration: (n - 1) * 1.3 + .3, ease: 'none' }, 0).to({}, { duration: .4 });
      apply();
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=160%' : '+=260%', pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
      return function () { tl.kill(); spin.style.transform = ''; cards.forEach(function (c) { c.style.transform = ''; }); };
    });
  }
})();
