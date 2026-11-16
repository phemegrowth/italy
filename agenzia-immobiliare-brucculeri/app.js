/* Agenzia Immobiliare Brucculeri: header, menu, anchors, reveals, service tabs, process line, phone bar,
   form validation, and the GSAP signature scene: a giant MANTOVA (CASA on phones) cut out of a deep green
   layer shows a Mantova street; scroll flies through the stroke of one letter until the street fills the screen. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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

  /* service tabs */
  var tabs = d.querySelectorAll('[role="tab"]'), ink = d.querySelector('.tabs__ink');
  function inkTo(t) { if (!ink || !t) return; ink.style.width = t.offsetWidth + 'px'; ink.style.transform = 'translateX(' + t.offsetLeft + 'px)'; }
  function pick(t) {
    tabs.forEach(function (o) {
      var on = o === t, p = d.getElementById(o.getAttribute('aria-controls'));
      o.setAttribute('aria-selected', on ? 'true' : 'false');
      o.tabIndex = on ? 0 : -1;
      p.hidden = !on; p.classList.toggle('is-on', on);
    });
    inkTo(t);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!k) return;
      e.preventDefault();
      var n = tabs[(i + k + tabs.length) % tabs.length]; pick(n); n.focus();
    });
  });
  inkTo(tabs[0]);
  window.addEventListener('resize', function () { inkTo(d.querySelector('[role="tab"][aria-selected="true"]')); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { inkTo(d.querySelector('[role="tab"][aria-selected="true"]')); });

  /* process line drawn by scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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
    scene(window.innerWidth < 701);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var svg = sec.querySelector('.fly__mask'), word = sec.querySelector('#word'), photo = sec.querySelector('.fly__photo img'), copy = sec.querySelector('.fly__copy');
    var rects = svg.querySelectorAll('rect'), mask = svg.querySelector('mask'), ci = 3, fx = .5, fy = .62;
    if (small) {
      /* portrait: a 900 x 1600 canvas and a shorter word that fits the phone */
      svg.setAttribute('viewBox', '0 0 900 1600');
      mask.setAttribute('width', '900'); mask.setAttribute('height', '1600');
      rects.forEach(function (r) { r.setAttribute('width', '900'); r.setAttribute('height', '1600'); });
      word.textContent = 'CASA'; word.setAttribute('x', '450'); word.setAttribute('y', '880');
      word.style.fontSize = '230px'; word.style.letterSpacing = '-5px';
      ci = 0; fx = .14; fy = .55;
    }
    /* zoom origin: inside the stroke of one letter (the T of MANTOVA, the C of CASA), in screen pixels */
    function origin() {
      var b = word.getExtentOfChar(ci), m = word.getScreenCTM(), pt = svg.createSVGPoint();
      pt.x = b.x + b.width * fx; pt.y = b.y + b.height * fy;
      var s = pt.matrixTransform(m), r = svg.getBoundingClientRect();
      return (s.x - r.left) + 'px ' + (s.y - r.top) + 'px';
    }
    gsap.set(svg, { transformOrigin: origin(), scale: 1 });
    gsap.set(copy, { autoAlpha: 0, y: 40 });
    gsap.set(photo, { scale: 1.18 });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onRefresh: function () { gsap.set(svg, { transformOrigin: origin() }); }
      }
    });
    tl.to({}, { duration: .3 })
      .to(svg, { scale: small ? 22 : 24, duration: 2, ease: 'power3.in' }, .3)
      .to(photo, { scale: 1, duration: 2.2, ease: 'power1.out' }, .3)
      .to(svg, { autoAlpha: 0, duration: .25 }, 2.1)
      .to(copy, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, 2.3)
      .to({}, { duration: .6 });
  }
})();
