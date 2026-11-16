/* Edil Art: blueprint hero entrance (CSS, first frame), header, menu, anchors, reveals, count-up, magnetic buttons,
   phone bar, form, work list image swap, process line and the GSAP signature scene: a wall section (cappotto)
   that builds up layer by layer with scroll, labels and a percentage in sync. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * .7);
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 60), behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up (sourced numbers only: Google rating and review count) */
  function count(el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1200;
    el.textContent = fmt(0);
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), count);

  /* magnetic buttons (desktop only) */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
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

  /* work list: image follows the item under the pointer (desktop) */
  var pics = d.querySelectorAll('.wl__pics img'), items = d.querySelectorAll('[data-swap] .wl__it');
  function swap(it) {
    items.forEach(function (x) { x.classList.toggle('is-on', x === it); });
    var n = +it.getAttribute('data-img');
    pics.forEach(function (p, i) { p.classList.toggle('is-on', i === n); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { swap(it); }); });

  /* GSAP */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var small = window.innerWidth < 701;
    if (!window.matchMedia('(pointer: fine)').matches || window.innerWidth < 981) {} else {
      items.forEach(function (it) { ScrollTrigger.create({ trigger: it, start: 'top 55%', end: 'bottom 55%', onToggle: function (s) { if (s.isActive) swap(it); } }); });
    }
    wallScene(small);
    lineScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var layers = sec.querySelectorAll('[data-layer]'), labels = sec.querySelectorAll('.ly__it'), pct = sec.querySelector('[data-pct]');
    var N = layers.length, last = -1, o = { v: 0 };
    gsap.set(layers, { xPercent: 0, x: function () { return window.innerWidth; } });
    pct.textContent = '0';
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=220%',
        pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var i = Math.min(N - 1, Math.floor(self.progress * N * .999));
          if (self.progress < .02) i = -1;
          if (i !== last) { labels.forEach(function (l, k) { l.classList.toggle('is-on', k <= i && k === i); }); last = i; }
        }
      }
    });
    layers.forEach(function (l, i) {
      tl.to(l, { x: 0, ease: 'power3.out', duration: 1 }, i * 1);
    });
    tl.to(o, { v: 100, ease: 'none', duration: N, onUpdate: function () { pct.textContent = Math.round(o.v); } }, 0);
    tl.to({}, { duration: .4 });
  }

  function lineScene() {
    var w = d.querySelector('[data-steps]');
    if (!w) return;
    var i = w.querySelector('[data-line]');
    var vertical = window.matchMedia('(max-width: 980px)').matches;
    gsap.fromTo(i, vertical ? { scaleY: 0, scaleX: 1 } : { scaleX: 0 }, {
      scaleX: 1, scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: w, start: 'top 75%', end: vertical ? 'bottom 60%' : 'top 30%', scrub: .5 }
    });
  }
})();
