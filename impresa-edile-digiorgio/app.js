/* Impresa Edile Digiorgio homepage: hero entrance and reel drift, header, full-screen menu, anchors, reveals,
   count-ups, cursor photo on the service rows (desktop), phone bar, magnetic buttons, form validation,
   and the GSAP signature scene (blueprint to building, floor by floor). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('menu-open', open);
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
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#cantiere' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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

  /* hero reel drifts left as the page scrolls */
  var track = d.querySelector('.reel__track'), tick = false;
  function frame() {
    tick = false;
    if (track) {
      var y = Math.min(window.scrollY, window.innerHeight * 1.5);
      track.style.translate = (-y * 0.35).toFixed(1) + 'px 0';
    }
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* count-ups of quantities (rating, number of reviews) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    function fmt(v) { return v.toFixed(dec).replace('.', ','); }
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = fmt(0);
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null, dur = 1300;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(to * e);
        if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* service rows: the photo follows the cursor (desktop only) */
  var cp = d.querySelector('.cursor-pic'), rows = d.querySelector('[data-cursor]');
  if (cp && rows && fine && !reduce) {
    var img = cp.querySelector('img'), x = 0, y = 0, cx = 0, cy = 0, run = false;
    function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cp.style.translate = cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px';
      if (run) requestAnimationFrame(loop);
    }
    rows.querySelectorAll('.row').forEach(function (r) {
      r.addEventListener('mouseenter', function () { img.src = r.getAttribute('data-img'); });
    });
    rows.addEventListener('mouseenter', function (e) { x = cx = e.clientX + 170; y = cy = e.clientY; cp.classList.add('is-on'); run = true; requestAnimationFrame(loop); });
    rows.addEventListener('mousemove', function (e) { x = e.clientX + 170; y = e.clientY; });
    rows.addEventListener('mouseleave', function () { cp.classList.remove('is-on'); run = false; });
  }

  /* magnetic buttons, desktop only */
  if (!reduce && fine) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
    var req = form.querySelectorAll('[required]');
    function check(f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (yy) { yy.textContent = new Date().getFullYear(); });

  /* signature scene: blueprint to building */
  function scene() {
    var sec = d.querySelector('.bp');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) { if (sec) sec.classList.add('no-scene'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    sec.classList.add('scene-on');
    var pin = sec.querySelector('.bp__pin'), q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var paths = qa('.bp__draw path'), photo = q('.bp__photo'), dims = q('.bp__dims');
    var steps = qa('.bp__steps li'), pct = q('[data-pct]'), txt = [q('.bp__txt .label'), q('.bp__txt .h2'), q('.bp__steps'), q('.bp__pct')];
    var small = window.innerWidth < 761;
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(dims, { autoAlpha: 0 });
    gsap.set(txt, { autoAlpha: 0, y: 24 });
    var st = { p: 0 };
    pct.textContent = '0';

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%', pin: pin, scrub: 0.6,
        onUpdate: function (s) {
          var t = s.progress * tl.duration(), k = t < 1.3 ? 0 : t < 2.5 ? 1 : t < 5.5 ? 2 : 3;
          steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
        }
      }
    });
    tl.to(txt, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, 0);
    // 01 survey and 02 drawing: the elevation draws itself, outline first, then floors and windows
    paths.forEach(function (p, i) { tl.to(p, { strokeDashoffset: 0, duration: 0.7 }, 0.3 + i * 0.3); });
    tl.to(dims, { autoAlpha: 1, duration: 0.4 }, 2.1);
    // 03 the building goes up floor by floor (five floors, a short hold on each slab)
    var tops = [80, 60, 40, 20, 0];
    tops.forEach(function (v, i) {
      tl.to(photo, { clipPath: 'inset(' + v + '% 0% 0% 0%)', duration: 0.45, ease: 'power2.out' }, 2.6 + i * 0.58);
    });
    tl.to(st, { p: 100, duration: 2.8, onUpdate: function () { pct.textContent = Math.round(st.p); } }, 2.6);
    // 04 finishes: the drawing steps back, the real building stays
    tl.to(q('.bp__draw'), { opacity: 0.22, duration: 0.6 }, 5.6);
    tl.to({}, { duration: 0.8 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
