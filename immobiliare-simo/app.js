/* Immobiliare Simo: type-first hero (name fitted to the width, photo strip slides in), header, phone menu,
   anchors, reveals, count-up, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a 3D ring of six cards (what they do) turned by the scroll and snapping to the front card. */
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
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.8);
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

  /* anchors with header offset; the no-op language link does nothing */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 4);
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

  /* type-first hero: each line of the name is fitted to the full width */
  var fits = d.querySelectorAll('[data-fit]');
  function fitAll() {
    fits.forEach(function (f) {
      if (getComputedStyle(f).display === 'none') return;
      var inn = f.querySelector('.fit__in');
      f.style.fontSize = '';
      var base = parseFloat(getComputedStyle(f).fontSize), w = inn.getBoundingClientRect().width, W = f.clientWidth;
      if (w > 0) f.style.fontSize = Math.min(base * W / w * 0.995, 420).toFixed(1) + 'px';
    });
  }
  fitAll();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fitAll);
  window.addEventListener('resize', fitAll);

  /* count-up (sourced quantities only) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseFloat(el.dataset.count);
    if (reduce) return;
    el.textContent = '0';
    reveal([el], function () {
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + 0.3) / st.length || p === 1); });
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
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Due righe sulla vostra richiesta.' };
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

  /* GSAP signature scene: a 3D ring of six cards turned by the scroll */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return ring(false); });
    mm.add('(max-width: 699px)', function () { return ring(true); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ring(small) {
    var pin = sec.querySelector('.ring__pin'), wheel = sec.querySelector('.ring__wheel');
    var cards = wheel.querySelectorAll('.rc'), cur = sec.querySelector('.ring__cur');
    var n = cards.length, step = 360 / n;
    function radius() { var w = cards[0].offsetWidth; return Math.round((w / 2) / Math.tan(Math.PI / n) + (small ? 20 : 60)); }
    /* each card sits on the ring: rotate around the wheel centre, then push out by R */
    function layout() {
      var R = radius();
      cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
      wheel.style.transform = 'translateZ(' + (-R) + 'px) rotateY(0deg)';
      wheel.dataset.r = R;
    }
    layout();
    var state = { a: 0 }, last = -1;
    function render() {
      var R = +wheel.dataset.r;
      wheel.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-state.a).toFixed(2) + 'deg)';
      var i = ((Math.round(state.a / step) % n) + n) % n;
      if (i !== last) { last = i; cards.forEach(function (c, k) { c.classList.toggle('is-front', k === i); }); cur.textContent = '0' + (i + 1); }
    }
    var tw = gsap.to(state, {
      a: step * (n - 1), ease: 'none', onUpdate: render,
      scrollTrigger: {
        trigger: sec, pin: pin, scrub: 0.8, start: 'top top', end: small ? '+=170%' : '+=260%', anticipatePin: 1,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.15, max: 0.4 }, ease: 'power1.inOut' }
      }
    });
    render();
    var onR = function () { layout(); render(); };
    window.addEventListener('resize', onR);
    return function () { window.removeEventListener('resize', onR); cards.forEach(function (c) { c.style.transform = ''; c.classList.remove('is-front'); }); wheel.style.transform = ''; };
  }
})();
