/* Principe & Conti, Torino: cinematic hero entrance, header, full-screen phone menu, anchors, reveals, accordion,
   steps line, magnetic buttons, phone bar, form, and the GSAP signature scene: a schematic map of the province where
   rivers draw, pins drop with dotted routes from the office (Grugliasco, Trana, Caprie, San Giorgio Canavese), then the
   camera zooms into Torino and three quarter pins land (Vanchiglia, Corso Belgio, Barriera di Milano). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var y = d.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var sy = window.scrollY;
    header.classList.toggle('is-small', sy > 30);
    if (mbar) mbar.classList.toggle('is-on', sy > hero.offsetHeight - 120);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.classList.contains('scene') ? 0 : header.offsetHeight - 1);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* steps: line draws with scroll, dots light up */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.st');
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

  /* magnetic buttons (desktop only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: "Scriveteci in due righe cosa vi serve." };
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
    var req = form.querySelectorAll('[required]');
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); f.addEventListener('input', function () { if (f.closest('.field').classList.contains('has-err')) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* signature scene: the map */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var stops = scene.querySelectorAll('.stops li'), N = stops.length;
  var count = scene.querySelector('.scene__count b'), bar = scene.querySelector('.scene__bar i');
  var layer = scene.querySelector('.map__layer');
  function pin(k) { return scene.querySelector('[data-pin="' + k + '"]'); }
  function setState(p) {
    var k = Math.max(0, Math.min(N - 1, Math.floor(p * N * 0.999)));
    stops.forEach(function (li, i) { li.classList.toggle('is-now', i === k); });
    scene.querySelectorAll('.pin').forEach(function (p) { var n = +p.getAttribute('data-pin'); p.classList.toggle('is-now', n === k || (k === 5 && n === 0)); });
    count.textContent = String(k + 1).padStart(2, '0');
    bar.style.transform = 'scaleX(' + Math.max(0.02, p).toFixed(3) + ')';
  }
  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', wide: '(min-width: 701px)' }, function (c) {
      var phone = c.conditions.phone;
      var rivers = scene.querySelectorAll('.map__river');
      rivers.forEach(function (r) { var L = r.getTotalLength(); gsap.set(r, { strokeDasharray: L, strokeDashoffset: L }); });
      var routes = scene.querySelectorAll('.map__routes path');
      gsap.set(routes, { opacity: 0 });
      var pins = scene.querySelectorAll('.pin');
      gsap.set(pins, { opacity: 0, y: -24 });
      gsap.set(pin(0), { opacity: 1, y: 0 });
      gsap.set(layer, { scale: 1 });
      var tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: scene, start: 'top top', end: phone ? '+=170%' : '+=280%', pin: scene.querySelector('.scene__pin'), scrub: 0.6,
          onUpdate: function (s) { setState(s.progress); } }
      });
      tl.to(rivers, { strokeDashoffset: 0, duration: 0.8, stagger: 0.1, ease: 'none' }, 0);
      [1, 2, 3, 4].forEach(function (k, i) {
        var at = 1 + i;
        tl.to(routes[i], { opacity: 1, duration: 0.4 }, at);
        var L = routes[i].getTotalLength(); tl.fromTo(routes[i], { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.6 }, at);
        tl.to(pin(k), { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, at + 0.35);
      });
      tl.to([routes, pin(1), pin(2), pin(3), pin(4)], { opacity: 0, duration: 0.5 }, 5);
      tl.to(layer, { scale: 4, duration: 1, ease: 'power2.inOut' }, 5);
      tl.to(rivers, { strokeWidth: function (i, el) { return parseFloat(getComputedStyle(el).strokeWidth) / 3.2; }, duration: 1, ease: 'power2.inOut' }, 5);
      tl.to(scene.querySelector('.map__ridge'), { opacity: 0, duration: 0.5 }, 5);
      tl.fromTo(scene.querySelector('.map__ring'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6 }, 5.5);
      tl.to(pin(0), { opacity: 0, duration: 0.3 }, 5.7);
      [6, 7, 8].forEach(function (k, i) { tl.to(pin(k), { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, 6 + i); });
      tl.to({}, { duration: 0.5 });
      setState(0);
      return function () { gsap.set([layer, pins, routes, rivers, scene.querySelector('.map__ring'), scene.querySelector('.map__ridge')], { clearProps: 'all' }); };
    });
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () {
    build();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
