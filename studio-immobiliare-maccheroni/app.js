/* Studio Immobiliare Maccheroni: hero entrance (line reveal, reel slides in), reel drifts on scroll, header, full-screen
   menu, sticky phone bar, anchors, reveals, review drag strip, about parallax, process line, magnetic buttons, form,
   and the GSAP signature scene: from the office in Piazza Montanari a route draws to each zone with a listing,
   the pin drops, the side list and the counter follow. Phones get a portrait layout with one large card. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + sticky phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 960 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#zone' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* rAF scroll helper */
  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () {
      if (t) return; t = true;
      requestAnimationFrame(function () { t = false; fn(); });
    }, { passive: true });
    fn();
  }

  /* hero reel drifts left as you scroll */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    onFrameScroll(function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.5) reel.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
    });
  }

  /* about photo parallax */
  var par = d.querySelector('[data-par] img');
  if (par && !reduce) {
    onFrameScroll(function () {
      var r = par.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      par.style.transform = 'translate3d(0,' + (-8 + p * -10).toFixed(2) + '%,0)';
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.05)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
  });

  /* drag strip for reviews (mouse only; touch scrolls natively) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe su cosa vi serve.' };
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
    var mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', function () { return zoneScene(false); });
    mm.add('(max-width: 960px)', function () { return zoneScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function zoneScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var routes = q('.m-route'), pins = q('.m-pin'), labs = q('.m-lab'), items = q('.zlist li');
    var side = sec.querySelector('.scene__side'), cnt = sec.querySelector('[data-zc]'), bar = sec.querySelector('[data-zbar]');
    var N = routes.length;

    routes.forEach(function (r) { var L = r.getTotalLength(); r.style.strokeDasharray = L + ' ' + L; r.style.strokeDashoffset = L; });
    gsap.set(pins, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(labs, { autoAlpha: 0 });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [];
    for (var i = 0; i < N; i++) {
      var t0 = .3 + i;
      at[i] = t0 + .45;
      tl.to(routes[i], { strokeDashoffset: 0, duration: .55, ease: 'power1.inOut' }, t0)
        .to(pins[i], { scale: 1, duration: .35, ease: 'back.out(2.4)' }, t0 + .45);
      if (!small) tl.to(labs[i], { autoAlpha: 1, duration: .25 }, t0 + .5);
      if (i > 0) tl.to(routes[i - 1], { opacity: .35, duration: .3 }, t0);
    }
    tl.to(routes[N - 1], { opacity: .35, duration: .3 }, N + .3)
      .to(bar, { scaleX: 1, duration: N + .3, ease: 'none' }, 0)
      .to({}, { duration: .5 }, N + .4);

    var last = -2;
    function sync() {
      var t = tl.time(), k = -1;
      for (var j = 0; j < N; j++) if (t >= at[j]) k = j;
      if (k === last) return;
      last = k;
      cnt.textContent = (k + 1 < 10 ? '0' : '') + (k + 1);
      items.forEach(function (li, j) { li.classList.toggle('is-on', j === k); li.classList.toggle('is-done', j < k); });
      pins.forEach(function (p, j) { p.classList.toggle('is-on', j === k); });
      side.classList.toggle('has-on', k >= 0);
    }
    tl.eventCallback('onUpdate', sync);

    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      routes.forEach(function (r) { r.style.strokeDasharray = ''; r.style.strokeDashoffset = ''; r.style.opacity = ''; });
      gsap.set(pins.concat(labs, [bar]), { clearProps: 'all' });
      items.forEach(function (li) { li.classList.remove('is-on', 'is-done'); });
    };
  }
})();
