/* GP Immobiliare: hero number-led entrance (280 m² counts up beside the arched photo of the villa they sell),
   line reveal, header, full-screen menu, anchors, reveals, accordion, marquee, magnetic buttons, sticky phone bar,
   form validation, and the GSAP signature scene: their five real listings, pinned. Desktop: a horizontal strip driven
   by vertical scroll, each card unmasking as it enters, counter 01 / 05 and progress bar. Phone: a portrait deck,
   each card slides up over the last one. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* hero count-up (sourced: the villa listing says 280 m²) */
  var num = d.querySelector('[data-count]');
  if (num && !reduce) {
    var to = +num.getAttribute('data-count'), t0 = null;
    num.textContent = '0';
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - p, 3);
      num.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    };
    setTimeout(function () { requestAnimationFrame(step); }, 250);
  }

  var header = d.querySelector('[data-header]'), bar = d.querySelector('[data-bar]'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
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

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.closest('.acc__it'), open = !it.classList.contains('is-open');
      it.parentNode.querySelectorAll('.acc__it').forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.acc__btn').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sull\'immobile.' };
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
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
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
    listingsScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function listingsScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pin = sec.querySelector('.listings__pin'), track = sec.querySelector('[data-track]');
    var cards = Array.prototype.slice.call(sec.querySelectorAll('[data-card]'));
    var idx = sec.querySelector('[data-idx]'), prog = sec.querySelector('[data-prog]');
    var n = cards.length;
    function setIdx(p) {
      var k = Math.min(n, Math.floor(p * n * 0.999) + 1);
      idx.textContent = (k < 10 ? '0' : '') + k;
      prog.style.transform = 'scaleX(' + (0.2 + 0.8 * p).toFixed(3) + ')';
    }
    html.classList.add('st-on');
    var mm = gsap.matchMedia();

    /* desktop: horizontal strip */
    mm.add('(min-width: 980px)', function () {
      var dist = function () { var last = cards[cards.length - 1]; return Math.max(0, last.offsetLeft + last.offsetWidth + 48 - track.clientWidth); };
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin, pin: true, scrub: 0.7, start: 'top top', end: function () { return '+=' + Math.round(dist() * 1.15 + window.innerHeight * 0.6); },
          invalidateOnRefresh: true, onUpdate: function (s) { setIdx(s.progress); }
        }
      });
      gsap.set(cards, { clipPath: 'inset(0% 0% 0% 0% round 14px)' });
      cards.forEach(function (c, k) {
        if (k < 2) return;
        gsap.set(c, { clipPath: 'inset(0% 0% 0% 100% round 14px)' });
        gsap.set(c.querySelector('img'), { scale: 1.25 });
      });
      tl.to(track, { x: function () { return -dist(); }, ease: 'none', duration: 1 }, 0);
      cards.forEach(function (c, k) {
        if (k < 2) return;
        var at = Math.max(0, (k - 1.6) / (n - 1));
        tl.to(c, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: .28, ease: 'power2.out' }, at);
        tl.to(c.querySelector('img'), { scale: 1, duration: .4, ease: 'power2.out' }, at);
      });
      return function () { gsap.set(track, { x: 0 }); gsap.set(cards, { clearProps: 'clipPath' }); };
    });

    /* phone and tablet: portrait deck */
    mm.add('(max-width: 979px)', function () {
      gsap.set(cards, { yPercent: 0, scale: 1 });
      cards.forEach(function (c, k) { c.style.zIndex = k + 1; if (k) gsap.set(c, { yPercent: 115 }); });
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin, pin: true, scrub: 0.5, start: 'top top', end: '+=' + (n - 1) * 45 + '%',
          onUpdate: function (s) { setIdx(s.progress); }
        }
      });
      cards.forEach(function (c, k) {
        if (!k) return;
        var t = k - 1;
        tl.to(c, { yPercent: 0, duration: 1, ease: 'power2.out' }, t);
        tl.to(cards[k - 1], { scale: .92, autoAlpha: .35, duration: 1, ease: 'none' }, t);
      });
      return function () { gsap.set(cards, { clearProps: 'all' }); };
    });
    setIdx(0);
  }
})();
