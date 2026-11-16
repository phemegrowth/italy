/* Immobiliare Massera: hero reel (photos wipe in, then the reel drifts left with scroll while the headline stays),
   header, phone menu, anchors, reveals, accordion, steps line, phone contact bar, form validation and the GSAP
   signature scene: a 3D ring of the eight real rentals, turned by scroll and snapping to the front card. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'static');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });
  var yr = d.querySelector('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  /* header, phone bar, reel drift */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var track = d.querySelector('.reel__track'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 100);
    if (track && !reduce && y < hero.offsetHeight * 1.5) {
      var max = Math.max(0, track.scrollWidth - track.parentElement.clientWidth + 40);
      var p = Math.min(1, y / (hero.offsetHeight * 0.9));
      track.style.transform = 'translate3d(' + (-max * p).toFixed(1) + 'px,0,0)';
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* menu */
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
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id); if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) { if (!en.isIntersecting) return; var el = en.target; setTimeout(function () { cb(el); }, (k++) * 80); io.unobserve(el); });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* accordion */
  d.querySelectorAll('.acc__it').forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* steps line */
  var list = d.querySelector('[data-line]');
  function stepLine() {
    if (!list) return;
    var r = list.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height)));
    list.style.setProperty('--p', p.toFixed(3));
  }
  window.addEventListener('scroll', stepLine, { passive: true }); stepLine();

  /* form */
  var form = d.querySelector('.form');
  if (form) form.addEventListener('submit', function (e) {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (inp) {
      var f = inp.closest('.f'), err = f.querySelector('.f__err'), msg = '', v = inp.value.trim();
      if (!v) msg = 'Campo obbligatorio.';
      else if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Indirizzo email non valido.';
      else if (inp.type === 'tel' && v.replace(/\D/g, '').length < 8) msg = 'Numero di telefono non valido.';
      f.classList.toggle('is-bad', !!msg); err.textContent = msg;
      if (msg && ok) { ok = false; inp.focus(); }
    });
    if (!ok) e.preventDefault();
  });

  /* signature scene: the ring */
  var scene = d.querySelector('[data-scene]');
  var cards = scene ? scene.querySelectorAll('.card') : [];
  cards.forEach(function (c, i) { c.style.setProperty('--i', i); });
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('static'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var ring = scene.querySelector('.ring'), stage = scene.querySelector('.stage'), counter = scene.querySelector('[data-count]');
  var N = cards.length, step = 360 / N, front = -1;

  function paint(angle) {
    ring.style.setProperty('--a', angle.toFixed(2) + 'deg');
    var f = Math.round(-angle / step);
    f = Math.max(0, Math.min(N - 1, f));
    cards.forEach(function (c, i) {
      var diff = Math.abs(((i * step + angle) % 360 + 540) % 360 - 180);
      /* diff: 0 = facing us, 180 = behind */
      c.style.setProperty('--dim', (0.85 * Math.min(1, diff / 110)).toFixed(2));
    });
    if (f !== front) {
      front = f;
      cards.forEach(function (c, i) { c.classList.toggle('is-front', i === f); });
      if (counter) counter.textContent = '0' + (f + 1);
    }
  }

  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var st = { a: 0 };
      gsap.set(stage, { opacity: 0, y: 60 });
      paint(0);
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: phone ? '+=170%' : '+=280%', pin: true, scrub: 0.5,
          snap: { snapTo: function (v) { var s = 1 / (N - 1); var a = Math.max(0, (v - 0.08) / 0.92); return Math.min(1, 0.08 + Math.round(a / s) * s * 0.92); }, duration: { min: 0.15, max: 0.4 }, ease: 'power1.inOut', delay: 0.05, inertia: false }
        }
      });
      tl.to(stage, { opacity: 1, y: 0, duration: 0.08 }, 0)
        .to(st, { a: -(N - 1) * step, duration: 0.92, onUpdate: function () { paint(st.a); } }, 0.08);
    });
  }
  var go = function () {
    build();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    /* late layout changes (lazy images, fonts) move the scene: refresh once things settle */
    if ('ResizeObserver' in window) {
      var lastH = d.body.scrollHeight, t;
      new ResizeObserver(function () {
        if (Math.abs(d.body.scrollHeight - lastH) < 2) return;
        lastH = d.body.scrollHeight; clearTimeout(t); t = setTimeout(function () { ScrollTrigger.refresh(); lastH = d.body.scrollHeight; }, 250);
      }).observe(d.body);
    }
  };
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(go); else go();
})();
