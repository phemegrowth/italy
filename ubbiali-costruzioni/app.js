/* Ubbiali Costruzioni: hero entrance (the 1.129 homes count up, headline lines, photo opens in the shape of a house), header,
   phone menu, anchors, reveals, count-ups, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   seven of their own site photos on a 3D ring that the scroll turns, snapping to the front card. */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul vostro progetto.' };
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


  /* count-ups: sourced quantities only */
  function fmt(n, sep) { var s = String(Math.round(n)); return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s; }
  function countUp(el) {
    var to = +el.getAttribute('data-count'), sep = el.getAttribute('data-sep') || '';
    if (reduce) { el.textContent = fmt(to, sep); return; }
    var t0 = null, dur = 1400;
    el.textContent = fmt(0, sep);
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)), sep); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), countUp);

  /* GSAP signature scene: 3D ring */
  var sec = d.querySelector('[data-scene]');
  html.classList.add('no-ring');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.remove('no-ring');
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return ring(false); });
    mm.add('(max-width: 699px)', function () { return ring(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ring(small) {
    var spin = sec.querySelector('[data-ring]'), cards = spin.querySelectorAll('.rc'), caps = sec.querySelectorAll('.ring__caps li'), cur = sec.querySelector('[data-cur]');
    var n = cards.length, step = 360 / n;
    var cw = small ? Math.min(240, window.innerWidth * 0.62) : Math.min(470, window.innerWidth * 0.31);
    var R = Math.round((cw / 2) / Math.tan(Math.PI / n) + (small ? 18 : 40));
    spin.style.setProperty('--cw', cw + 'px');
    cards.forEach(function (c, i) { c.style.setProperty('--cw', cw + 'px'); c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
    var st = { a: 0 }, last = -1;
    var paint = function () {
      spin.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-st.a) + 'deg)';
      var i = ((Math.round(st.a / step) % n) + n) % n;
      if (i === last) return; last = i;
      cards.forEach(function (c, k) { c.classList.toggle('is-front', k === i); });
      caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
      if (cur) cur.textContent = '0' + (i + 1);
    };
    paint();
    var tw = gsap.to(st, { a: (n - 1) * step, ease: 'none', onUpdate: paint });
    var stt = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%',
      pin: true, scrub: .7, anticipatePin: 1, animation: tw, invalidateOnRefresh: true,
      snap: { snapTo: 1 / (n - 1), directional: false, inertia: false, duration: { min: .2, max: .6 }, delay: .1, ease: 'power2.inOut' }
    });
    return function () { stt.kill(); tw.kill(); spin.style.transform = ''; cards.forEach(function (c) { c.style.transform = ''; c.classList.remove('is-front'); }); };
  }
})();
