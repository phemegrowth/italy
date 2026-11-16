/* Cavanna Immobiliare: type-first hero entrance (letters rise, photo strip slides in from the right and drifts with scroll),
   header, full-screen phone menu, anchors, reveals, services list that drives a sticky photo, process line,
   phone contact bar, form validation, and the GSAP signature scene: a map of their area draws itself
   (Po, Via Emilia, route west to Val Tidone and east to Parma), pins drop and a card shows a real listing per stop. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* the name fills the content width exactly */
  var mega = d.querySelector('.mega'), megaIn = d.querySelector('.mega__in');
  function fit() {
    if (!mega) return;
    mega.style.fontSize = '';
    var w = megaIn.getBoundingClientRect().width / (megaIn.style.transform ? 1 : 1), W = mega.clientWidth;
    var fs = parseFloat(getComputedStyle(mega).fontSize);
    if (w > 0) mega.style.fontSize = Math.min(fs * W / w, 320).toFixed(1) + 'px';
  }
  fit(); window.addEventListener('resize', fit);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);

  var yr = d.querySelector('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  /* header, phone bar, strip drift */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var strips = d.querySelectorAll('.strip__it');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
    if (!reduce && y < hero.offsetHeight + 200) {
      strips.forEach(function (s, i) { s.style.setProperty('--sx', (-y * (0.08 + i * 0.03)).toFixed(1) + 'px'); });
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  /* once the entrance has run, the drift must not be slowed by the entrance transition */
  setTimeout(function () { strips.forEach(function (s) { s.style.transition = 'transform .25s linear'; }); }, 2100);

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

  /* anchors with header offset */
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
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; setTimeout(function () { cb(el); }, (k++) * 80); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: the item crossing the reading line drives the photo */
  var items = d.querySelectorAll('.svc__it'), pics = d.querySelectorAll('.svc__pic');
  function act(i) {
    items.forEach(function (it) { it.classList.toggle('is-act', +it.dataset.i === i); });
    pics.forEach(function (p) { p.classList.toggle('is-on', +p.dataset.pic === i); });
  }
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) act(+e.target.dataset.i); }); }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { so.observe(it); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { act(+it.dataset.i); }); });
  act(0);

  /* process line */
  var list = d.querySelector('[data-line]'), line = d.querySelector('.steps__line');
  function stepLine() {
    if (!list) return;
    var r = list.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
    list.style.setProperty('--p', p.toFixed(3));
    if (line) { line.style.setProperty('--p', p.toFixed(3)); line.style.setProperty('--ly', (list.offsetTop + 14) + 'px'); }
  }
  window.addEventListener('scroll', stepLine, { passive: true }); window.addEventListener('resize', stepLine); stepLine();

  /* form */
  var form = d.querySelector('.form');
  if (form) form.addEventListener('submit', function (e) {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (inp) {
      var f = inp.closest('.f'), err = f.querySelector('.f__err'), msg = '';
      var v = inp.value.trim();
      if (!v) msg = 'Campo obbligatorio.';
      else if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Indirizzo email non valido.';
      else if (inp.type === 'tel' && v.replace(/\D/g, '').length < 8) msg = 'Numero di telefono non valido.';
      f.classList.toggle('is-bad', !!msg); err.textContent = msg;
      if (msg && ok) { ok = false; inp.focus(); }
    });
    if (!ok) e.preventDefault();
  });

  /* signature scene */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) {
    d.querySelectorAll('.pin').forEach(function (p) { p.classList.add('is-act'); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var cards = scene.querySelectorAll('.zc'), counter = scene.querySelector('[data-count]');
  var pins = scene.querySelectorAll('.pin');
  var shown = -1;
  function setStop(i) {
    if (i === shown) return; shown = i;
    cards.forEach(function (c) { c.classList.toggle('is-on', +c.dataset.card === i); });
    pins.forEach(function (p) { p.classList.toggle('is-act', +p.dataset.pin === i); });
    if (counter) counter.textContent = '0' + (i + 1);
  }

  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var po = scene.querySelector('.map__po'), em = scene.querySelector('.map__emilia');
      var rw = scene.querySelector('.map__route--w'), re = scene.querySelector('.map__route--e');
      [po, rw, re].forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
      gsap.set(em, { opacity: 0 });
      gsap.set(scene.querySelectorAll('.map__hills'), { opacity: 0, y: 30 });
      gsap.set(pins, { scale: 0, opacity: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
      gsap.set(scene.querySelector('.zone__cards'), { opacity: 0 });
      setStop(0);

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: phone ? '+=150%' : '+=260%', pin: true, scrub: 0.6,
          onUpdate: function (st) {
            var p = st.progress;
            setStop(p < 0.3 ? 0 : p < 0.45 ? 1 : p < 0.66 ? 2 : p < 0.84 ? 3 : 4);
          }
        }
      });
      tl.to(scene.querySelectorAll('.map__hills'), { opacity: 1, y: 0, duration: 0.1, stagger: 0.03 }, 0.02)
        .to(po, { strokeDashoffset: 0, duration: 0.14 }, 0.05)
        .to(em, { opacity: 1, duration: 0.06 }, 0.12)
        .to(scene.querySelector('.zone__cards'), { opacity: 1, duration: 0.06 }, 0.1)
        .to(scene.querySelector('.pin--home'), { scale: 1, opacity: 1, duration: 0.05, ease: 'back.out(2)' }, 0.16)
        .to(rw, { strokeDashoffset: 0, duration: 0.36 }, 0.3);
      /* west pins: Podenzano then Val Tidone, in order along the route */
      var west = scene.querySelectorAll('.pin[data-pin="1"], .pin[data-pin="2"]');
      west.forEach(function (p, i) { tl.to(p, { scale: 1, opacity: 1, duration: 0.04, ease: 'back.out(2)' }, 0.34 + i * 0.06); });
      tl.to(re, { strokeDashoffset: 0, duration: 0.24 }, 0.68)
        .to(scene.querySelector('.pin[data-pin="3"]'), { scale: 1, opacity: 1, duration: 0.04, ease: 'back.out(2)' }, 0.8)
        .to(scene.querySelector('.pin[data-pin="4"]'), { scale: 1, opacity: 1, duration: 0.04, ease: 'back.out(2)' }, 0.9)
        .to({}, { duration: 0.06 }, 0.94);
      return function () { shown = -1; };
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
