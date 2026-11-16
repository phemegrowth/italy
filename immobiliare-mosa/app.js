/* Immobiliare Mosa: hero entrance (the '80 figure rises, headline lines, arched photo opens), header, phone menu, anchors,
   reveals, process line, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   the word CREMONA cut out of a deep teal layer; scroll flies through the stem of the E into the city. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

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
    header.classList.toggle('menu-open', open);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
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

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla vostra richiesta.' };
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

  /* fit the word to the visible part of the sliced SVG (works on wide and tall screens) */
  var sec = d.querySelector('[data-scene]');
  var svg = sec && sec.querySelector('.scene__mask'), word = sec && sec.querySelector('.scene__word');
  function fitWord() {
    if (!svg) return;
    var w = svg.clientWidth, h = svg.clientHeight, s = Math.max(w / 1000, h / 1000);
    var visW = w / s;
    word.style.fontSize = '230px';
    var bw = word.getBBox().width || 800;
    var fs = Math.min(300, 230 * (visW * (w < 700 ? 0.9 : 0.78)) / bw);
        word.style.fontSize = fs.toFixed(1) + 'px';
  }

  /* GSAP signature scene */
  function start() {
    fitWord();
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return flyScene(false); });
    mm.add('(max-width: 699px)', function () { return flyScene(true); });
    var rf = function () { fitWord(); ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function flyScene(small) {
    var photo = sec.querySelector('.scene__photo'), layer = sec.querySelector('.scene__layer'),
        copy = sec.querySelector('.scene__copy'), hint = sec.querySelector('.scene__hint');
    fitWord();
    /* origin: a point inside the left stem of the E (third letter) */
    var origin = function () {
      var b;
      try { b = word.getExtentOfChar(2); } catch (e) { return '50% 50%'; }
      var m = word.getScreenCTM(), r = svg.getBoundingClientRect();
      var pt = svg.createSVGPoint();
      pt.x = b.x + b.width * 0.3; pt.y = b.y + b.height * 0.5;
      var p = pt.matrixTransform(m);
      return (p.x - r.left).toFixed(1) + 'px ' + (p.y - r.top).toFixed(1) + 'px';
    };
    gsap.set(svg, { scale: 1, transformOrigin: origin() });
    gsap.set(copy, { autoAlpha: 0, y: 40 });
    gsap.set(photo, { scale: 1.18 });
    var tl = gsap.timeline();
    tl.to(svg, { scale: small ? 40 : 60, duration: 2, ease: 'power3.in' }, 0)
      .to(photo, { scale: 1, duration: 2.4, ease: 'none' }, 0)
      .to(hint, { autoAlpha: 0, duration: .3 }, 0)
      .to(layer, { opacity: 0, duration: .35 }, 1.7)
      .to(copy, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, 2.05)
      .to({}, { duration: .35 });
    var stt = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onRefreshInit: function () { gsap.set(svg, { scale: 1 }); fitWord(); gsap.set(svg, { transformOrigin: origin() }); }
    });
    return function () { stt.kill(); tl.kill(); gsap.set([svg, copy, photo, layer, hint], { clearProps: 'all' }); };
  }
})();
