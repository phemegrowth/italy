/* Mediocasa Immobiliare, Verona: hero entrance (Ken Burns photo, panel, headline lines), header, full-screen phone menu,
   anchors, reveals, auction steps line, magnetic buttons, phone bar, form, and the GSAP signature scene:
   a 3D ring of the six listings in the window, turned by scroll, snapping to the front card, with a 01 / 06 counter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('rm', 'is-ready'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
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

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('mousedown', function (e) { down = true; moved = false; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* count-up (233 Google reviews) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    el.textContent = '0';
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* auction steps: line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / r.height));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it) { var tr = it.getBoundingClientRect(); it.classList.toggle('is-lit', reduce || tr.top < vh * 0.75); });
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
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
    ringScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ringScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var rot = sec.querySelector('[data-rot]'), cards = sec.querySelectorAll('.lc');
    var cur = sec.querySelector('[data-cur]'), bar = sec.querySelector('[data-bar]');
    var N = cards.length, step = 360 / N, R = small ? 230 : 460;
    cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
    var state = { a: 0 }, ring = sec.querySelector('[data-ring]');
    gsap.set(ring, { autoAlpha: 0, y: 40 });
    function paint() {
      var a = state.a, front = Math.round(-a / step);
      front = ((front % N) + N) % N;
      cards.forEach(function (c, i) {
        var ang = ((i * step + a) % 360 + 360) % 360; if (ang > 180) ang -= 360;
        var f = Math.cos(ang * Math.PI / 180);
        c.style.opacity = (0.15 + 0.85 * Math.max(0, f)).toFixed(3);
        c.classList.toggle('is-front', i === front);
      });
      rot.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + a.toFixed(2) + 'deg)';
      cur.textContent = '0' + (front + 1);
    }
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(ring, { autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out' }, 0)
      .to(state, { a: -step * (N - 1), duration: N - 1, ease: 'none', onUpdate: paint }, .5)
      .to(bar, { scaleX: 1, duration: N - .5 }, 0)
      .to({}, { duration: .4 });
    var D = tl.duration(), pts = [0];
    for (var k = 0; k < N; k++) pts.push((.5 + k) / D);
    pts.push(1);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%',
      pin: true, scrub: .7, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      snap: { snapTo: pts, inertia: false, duration: { min: .2, max: .5 }, delay: .15, ease: 'power1.inOut' }
    });
    paint();
  }
})();
