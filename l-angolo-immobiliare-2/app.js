/* L'Angolo Immobiliare: hero letters rise, photo reel slides in from the right and drifts with scroll, header, menu,
   anchors, reveals, count-up on the proof strip, review slider, form, and the GSAP signature scene: a radar map of the
   towns where their listings are, pins and lines appear by distance from Via Cividale, listing cards follow. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('[data-mbar]'), hero = d.querySelector('.hero');
  /* fit the giant name to the line */
  var word = d.querySelector('.hero__word');
  function fit() {
    if (!word) return;
    word.style.fontSize = '';
    var avail = word.parentNode.clientWidth, w = word.scrollWidth;
    if (w > avail) word.style.fontSize = (parseFloat(getComputedStyle(word).fontSize) * avail / w * 0.995) + 'px';
  }
  fit();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);
  window.addEventListener('resize', fit);
  var reel = d.querySelector('[data-reel]');
  if (reel) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { reel.classList.add('is-in'); }); });
    setTimeout(function () { reel.classList.add('is-live'); }, 1600);
  }
  var tick = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar && hero) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
    if (reel && !reduce && reel.classList.contains('is-live') && y < hero.offsetHeight * 1.2) {
      reel.style.setProperty('--rx', (-y * 0.45).toFixed(1) + 'px');
    }
  }
  window.addEventListener('scroll', function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; onScroll(); }); }, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('is-menu', open);
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
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id); if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
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

  /* count-up (sourced quantities only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toString(); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1300;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  });

  /* reviews slider */
  var rev = d.querySelector('[data-rev]'), rn = d.querySelector('[data-rev-n]');
  if (rev) {
    var its = rev.querySelectorAll('.rev__it');
    var cur = function () { var best = 0, bd = 1e9; its.forEach(function (it, i) { var dd = Math.abs(it.offsetLeft - rev.offsetLeft - rev.scrollLeft); if (dd < bd) { bd = dd; best = i; } }); return best; };
    var go = function (i) { i = Math.max(0, Math.min(its.length - 1, i)); rev.scrollTo({ left: its[i].offsetLeft - rev.offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); };
    d.querySelector('[data-prev]').addEventListener('click', function () { go(cur() - 1); });
    d.querySelector('[data-next]').addEventListener('click', function () { go(cur() + 1); });
    rev.addEventListener('scroll', function () { var c = cur() + 1; rn.textContent = '0' + c + ' / 0' + its.length; }, { passive: true });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla vostra richiesta.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : msgs[f.name];
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

  /* GSAP scene */
  var started = false;
  function start() {
    if (started) return; started = true;
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    radar();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
  setTimeout(start, 2500);

  function radar() {
    var sec = d.querySelector('[data-scene]'); if (!sec) return;
    var pins = sec.querySelectorAll('.pin'), lines = sec.querySelectorAll('.ln'), cards = sec.querySelectorAll('.lcard');
    var sweep = sec.querySelector('.radar__sweep'), rings = sec.querySelectorAll('.radar__rings circle');
    var kmEl = sec.querySelector('[data-km]'), townsEl = sec.querySelector('[data-towns]');
    var copy = sec.querySelector('.zone__copy'); var tl_ = sec.querySelector('[data-towns-l]');
    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 899px)', big: '(min-width: 900px)' }, function (ctx) {
      var small = ctx.conditions.small;
      var svg = sec.querySelector('.radar');
      svg.setAttribute('viewBox', small ? '150 250 640 680' : '140 250 620 700');
      gsap.fromTo(copy.children, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: .08, duration: .6, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 70%', toggleActions: 'play none none reverse' } });
      gsap.set(pins, { autoAlpha: 0 });
      gsap.set(pins, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
      lines.forEach(function (l) { var len = Math.hypot(l.x2.baseVal.value - 500, l.y2.baseVal.value - 500); l.style.strokeDasharray = len; l.style.strokeDashoffset = len; });
      gsap.set(rings, { scale: .2, autoAlpha: 0, transformOrigin: '500px 500px' });
      gsap.set(sweep, { rotation: 0, svgOrigin: '500 500' });

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.to(rings, { scale: 1, autoAlpha: 1, duration: .6, stagger: .15, ease: 'power2.out' }, 0)
        .to(sweep, { rotation: 720, duration: 6.4 }, 0);
      var N = pins.length, per = 5 / N, keyAt = [];
      pins.forEach(function (p, i) {
        var t = .7 + i * per;
        tl.to(lines[i], { strokeDashoffset: 0, duration: per * 1.2 }, t)
          .to(p, { autoAlpha: 1, scale: 1, duration: per * .9, ease: 'back.out(2)' }, t + per * .5);
        p.__t = t + per * .6;
      });
      tl.to({}, { duration: .5 }, 6.4);
      var cardIdx = [];
      cards.forEach(function (c) { cardIdx.push(+c.getAttribute('data-card')); });
      var lastC = -2, lastI = -2;
      tl.eventCallback('onUpdate', function () {
        var t = tl.time(), shown = -1;
        pins.forEach(function (p, i) { if (t >= p.__t) shown = i; });
        if (shown !== lastI) {
          lastI = shown;
          kmEl.textContent = shown < 0 ? '0' : pins[shown].getAttribute('data-km');
          townsEl.textContent = String(shown + 2); if (tl_) tl_.textContent = shown < 0 ? 'comune' : 'comuni';
          var ci = 0;
          cardIdx.forEach(function (ix, k) { if (ix <= shown) ci = k; });
          if (ci !== lastC) { lastC = ci; cards.forEach(function (c, k) { c.classList.toggle('is-on', k === ci); }); }
          pins.forEach(function (p, i) { p.classList.toggle('is-act', cardIdx[ci] === i); });
        }
      });
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=160%' : '+=260%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
      return function () { gsap.set([pins, rings, sweep, copy.children], { clearProps: 'all' }); lines.forEach(function (l) { l.style.strokeDasharray = ''; l.style.strokeDashoffset = ''; }); };
    });
  }
})();
