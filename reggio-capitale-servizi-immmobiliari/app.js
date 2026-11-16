/* Reggio Capitale Servizi Immobiliari: header, menu, anchors, reveals, count-up (Google rating and reviews),
   hero cards that fan out and drift, drag strip of listings, phone bar, form validation, and the GSAP signature scene:
   a door that opens with the scroll onto a bright room, while the four owner services light up in turn. */
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
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* hero cards drift apart a little with scroll, once the fan-out is over */
  var cards = d.querySelectorAll('.card');
  if (!reduce && cards.length) {
    setTimeout(function () {
      var k = [[-0.05, -0.08], [0.05, -0.12], [0.02, 0.06], [-0.06, 0.04]];
      var tick = function () {
        var y = Math.min(window.scrollY, 900);
        cards.forEach(function (c, i) { c.classList.add('is-drift'); c.style.transform = 'translate(' + (y * k[i][0]) + 'px,' + (y * k[i][1]) + 'px) rotate(var(--r0))'; });
      };
      window.addEventListener('scroll', function () { requestAnimationFrame(tick); }, { passive: true });
    }, 1500);
  }

  /* drag to scroll the listings strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('mousedown', function (e) { down = true; moved = false; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; var dx = e.pageX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

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

  /* count-up: Google rating and review count only */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  d.querySelectorAll('[data-track-none]').forEach(function (l) {
    var st = l.querySelectorAll('.tk');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla richiesta.' };
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
    scene(window.innerWidth < 900);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var L = sec.querySelector('.door__leaf--l'), R = sec.querySelector('.door__leaf--r'), room = sec.querySelector('.door__room img'),
      steps = sec.querySelectorAll('.st'), cnt = sec.querySelector('.door__count b'), n = steps.length;
    gsap.set(room, { scale: 1.18, transformOrigin: '50% 50%' });
    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      if (cnt) cnt.textContent = '0' + (i + 1);
    }
    setStep(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%',
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (s) { setStep(Math.max(0, Math.min(n - 1, Math.floor(s.progress * n * 0.999)))); }
      }
    });
    tl.to([L, R], { x: function (i) { return i ? 3 : -3; }, duration: .25 }, .1)
      .to(L, { rotationY: -108, duration: 1.6, ease: 'power1.inOut' }, .4)
      .to(R, { rotationY: 108, duration: 1.6, ease: 'power1.inOut' }, .4)
      .to(room, { scale: 1, duration: 2.2 }, .4)
      .to({}, { duration: .8 });
  }
})();
