/* Edil Cinquarla: split hero (photo wipes in, slower parallax), header, full-screen phone menu, anchors, reveals,
   count-up, parallax, photo strip that drifts with scroll, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: rubble drops into a crusher, the jaws break it, the pieces fall through a screen
   and settle in three layers (coarse, medium, fine) that become the base under a new pavement. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.getElementById('header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 899 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var pick = a.getAttribute('data-pick');
      if (pick) { var sel = d.getElementById('f-int'); if (sel) sel.value = pick; }
      setTimeout(function () {
        window.scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60, behavior: reduce ? 'auto' : 'smooth' });
      }, menu.classList.contains('is-open') ? 50 : 0);
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

  /* count-up (sourced numbers only: the Google score and review count) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  });

  /* parallax: hero photo (desktop) and the plant photo */
  function para(el, amt, onlyWide) {
    if (!el || reduce) return;
    var t = false;
    var run = function () {
      t = false;
      if (onlyWide && window.innerWidth < 900) { el.style.transform = ''; return; }
      var r = el.parentElement.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height);
      el.style.transform = 'translate3d(0,' + ((p - .5) * amt).toFixed(2) + '%,0)';
    };
    window.addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }
  para(d.querySelector('[data-par]'), 12, true);
  para(d.querySelector('[data-par2]'), -14, false);

  /* photo strip drifts left as it crosses the screen */
  var strip = d.querySelector('[data-strip]');
  if (strip && !reduce) {
    var st2 = false;
    var drift = function () {
      st2 = false;
      var r = strip.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height), max = Math.max(0, strip.scrollWidth - window.innerWidth);
      strip.style.transform = 'translate3d(' + (-p * max).toFixed(1) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!st2) { st2 = true; requestAnimationFrame(drift); } }, { passive: true });
    drift();
  }

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa vi serve.' };
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
    rigScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function rigScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var NS = 'http://www.w3.org/2000/svg', svg = sec.querySelector('[data-rig]');
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function el(tag, attrs, parent) { var e = d.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
    function rock(cx, cy, r, n) {
      var pts = [];
      for (var i = 0; i < n; i++) { var a = (i / n) * Math.PI * 2 + rnd() * .5, rr = r * (.7 + rnd() * .45); pts.push((cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr * .85).toFixed(1)); }
      return 'M' + pts.join(' L') + ' Z';
    }
    var greys = ['#a3a9ac', '#8c9396', '#b9bdbe', '#767e82', '#c4c7c6'], brick = ['#b4654b', '#9c5440'];
    function col() { return rnd() < .18 ? brick[Math.floor(rnd() * 2)] : greys[Math.floor(rnd() * greys.length)]; }

    /* faint grid */
    var grid = sec.querySelector('[data-grid]');
    for (var gx = 0; gx <= 400; gx += 40) el('path', { d: 'M' + gx + ' 0 V620' }, grid);
    for (var gy = 0; gy <= 620; gy += 40) el('path', { d: 'M0 ' + gy + ' H400' }, grid);

    /* big chunks of rubble above the hopper */
    var chunksG = sec.querySelector('[data-chunks]'), chunks = [];
    [[150, 70, 30], [205, 54, 34], [256, 76, 28], [180, 104, 24], [232, 108, 26], [128, 112, 18], [276, 112, 18]].forEach(function (c) {
      var p = el('path', { d: rock(c[0], c[1], c[2], 7), fill: col(), stroke: '#1f2427', 'stroke-width': 1.5 }, chunksG);
      chunks.push(p);
    });

    /* fragments, drawn at their final place in the layers */
    var fragG = sec.querySelector('[data-frags]'), frags = { c: [], m: [], f: [] };
    function band(key, y0, y1, r, stepX, stepY) {
      for (var y = y1 - r - 2; y > y0 + r - 2; y -= stepY) {
        for (var x = 54 + r + rnd() * stepX * .5; x < 346 - r; x += stepX * (.85 + rnd() * .3)) {
          var p = el('path', { d: rock(x, y + (rnd() - .5) * 4, r * (.8 + rnd() * .35), key === 'f' ? 5 : 6), fill: col() }, fragG);
          p._x = x; p._y = y; frags[key].push(p);
        }
      }
    }
    band('c', 548, 602, 12, 27, 23);
    band('m', 492, 546, 6.5, 15, 13);
    band('f', 424, 490, 3.2, 9, 8);

    var jawL = sec.querySelector('[data-jaw="l"]'), jawR = sec.querySelector('[data-jaw="r"]');
    var screen = sec.querySelector('[data-screen]'), box = sec.querySelector('[data-box]'), slab = sec.querySelector('[data-slab]');
    var labs = sec.querySelectorAll('[data-lab]'), crusher = sec.querySelector('[data-crusher]');
    var steps = sec.querySelectorAll('[data-step]'), bar = sec.querySelector('[data-bar]');
    var head = sec.querySelector('.scene__copy');

    var all = frags.c.concat(frags.m, frags.f);
    gsap.set(all, { x: function (i, t) { return 200 - t._x + (rnd() - .5) * 40; }, y: function (i, t) { return 270 - t._y + (rnd() - .5) * 16; }, scale: .5, autoAlpha: 0, transformOrigin: '50% 50%' });
    gsap.set(chunks, { y: -260, autoAlpha: 0 });
    gsap.set([crusher, box], { autoAlpha: 0, y: 20 });
    gsap.set(screen, { autoAlpha: 0 });
    gsap.set(slab, { autoAlpha: 0, y: -120 });
    gsap.set(labs, { autoAlpha: 0, x: -8 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var stepAt = [0, .3, 2.0, 3.4, 7.0];
    tl.fromTo(head, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .4 }, 0)
      .to([crusher, box], { autoAlpha: 1, y: 0, duration: .4, stagger: .1 }, .05)
      .to(chunks, { y: 0, autoAlpha: 1, duration: .9, ease: 'bounce.out', stagger: .12 }, .3)
      /* the jaws bite three times */
      .to(jawL, { x: 12, duration: .18, repeat: 5, yoyo: true, ease: 'power1.inOut' }, 2.0)
      .to(jawR, { x: -12, duration: .18, repeat: 5, yoyo: true, ease: 'power1.inOut' }, 2.0)
      .to(chunks, { scale: .25, autoAlpha: 0, y: 120, transformOrigin: '50% 50%', duration: .9, ease: 'power2.in', stagger: .06 }, 2.1)
      .to(all, { autoAlpha: 1, scale: .7, duration: .3, stagger: { each: .004, from: 'random' } }, 2.6)
      .to(screen, { autoAlpha: .8, duration: .3 }, 3.2)
      .to(frags.c, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'power2.in', stagger: .02 }, 3.4)
      .to(labs[0], { autoAlpha: 1, x: 0, duration: .3 }, 4.4)
      .to(frags.m, { x: 0, y: 0, scale: 1, duration: 1, ease: 'power2.in', stagger: .012 }, 4.4)
      .to(labs[1], { autoAlpha: 1, x: 0, duration: .3 }, 5.4)
      .to(frags.f, { x: 0, y: 0, scale: 1, duration: .9, ease: 'power2.in', stagger: .006 }, 5.3)
      .to(labs[2], { autoAlpha: 1, x: 0, duration: .3 }, 6.4)
      .to([crusher, screen], { autoAlpha: .25, duration: .5 }, 6.8)
      .to(slab, { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out' }, 7.0)
      .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 8, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 8.0);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 1; j < stepAt.length; j++) if (t >= stepAt[j]) s = j;
      if (s !== last) { last = s; steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); }); }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: function () { return window.innerWidth < 900 ? '+=150%' : '+=220%'; },
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
