/* NewEdil Costruzioni: hero entrance (emerald curtain wipes off the photo, mark turns once, line reveal), header, menu,
   anchors, reveals, count-up of the 25 Google reviews, accordion, drag strip of reviews, process line, magnetic buttons,
   phone bar, form validation, and the GSAP signature scene "Aprire un muro portante": a wall elevation draws itself,
   props go in under the slab, the steel frame (cerchiatura) draws, then the bricks drop away to open onto the garden. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  var bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
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
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); if (id === '#top') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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

  /* count-up: 25 Google reviews */
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* services: hover, or the item nearest mid-screen, swaps the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.svc__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  if (!reduce) {
    var lt = false;
    window.addEventListener('scroll', function () {
      if (lt) return; lt = true;
      requestAnimationFrame(function () {
        lt = false;
        var mid = window.innerHeight * 0.55, best = null, bd = 1e9;
        items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
        if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
      });
    }, { passive: true });
  }

  /* method line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.pstep');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.03 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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


  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('mousedown', function (e) { down = true; moved = false; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - x0; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = l0 - dx; });
    s.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') s.scrollBy({ left: 300, behavior: 'smooth' }); if (e.key === 'ArrowLeft') s.scrollBy({ left: -300, behavior: 'smooth' }); });
  });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    wallScene(window.innerWidth < 861);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var lines = q('.w-line'), dims = q('.dims .draw'), props = q('.prop'), frame = sec.querySelector('.fr');
    var cover = sec.querySelector('.cover'), garden = sec.querySelector('.garden image');
    var steps = q('.wall__steps li'), phase = sec.querySelector('[data-phase]'), now = sec.querySelector('[data-now]');
    var names = ['Rilievo e calcolo', 'Puntelli', 'Cerchiatura in acciaio', 'Apertura'];
    function prep(el) {
      if (el.getAttribute('stroke-dasharray')) { gsap.set(el, { autoAlpha: 0 }); return; }
      var L = el.getTotalLength ? el.getTotalLength() : 1000;
      gsap.set(el, { strokeDasharray: L, strokeDashoffset: L });
    }
    lines.forEach(prep); dims.forEach(prep); prep(frame);
    gsap.set(q('.w-fill, .w-slab, .cover, .garden'), { autoAlpha: 0 });
    gsap.set(props, { y: -50, autoAlpha: 0 });
    gsap.set(cover, { scaleY: 1, svgOrigin: '300 396' });
    gsap.set(garden, { scale: 1.15, svgOrigin: '300 273' });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, 1.6, 2.8, 4.0];
    tl.to(lines, { strokeDashoffset: 0, duration: 1, stagger: .15, ease: 'power1.inOut' }, 0)
      .to(q('.w-fill, .w-slab, .cover'), { autoAlpha: 1, duration: .6 }, .3)
      .set(sec.querySelector('.garden'), { autoAlpha: 1 }, .9)
      .to(dims, { strokeDashoffset: 0, autoAlpha: 1, duration: .6, stagger: .1 }, .8)
      .to(props, { y: 0, autoAlpha: 1, duration: .6, stagger: .15, ease: 'back.out(1.6)' }, at[1])
      .to(frame, { strokeDashoffset: 0, duration: 1.0, ease: 'power1.inOut' }, at[2])
      .to(dims, { autoAlpha: 0, duration: .4 }, at[3])
      .to(cover, { scaleY: 0, duration: .9, ease: 'power2.in' }, at[3])
      .to(garden, { scale: 1, duration: 1.4, ease: 'power1.out' }, at[3] + .3)
      .to(props, { y: -30, autoAlpha: 0, duration: .5, stagger: .08 }, at[3] + 1.0)
      .to({}, { duration: .6 });

    var last = -2;
    function sync() {
      var t = tl.time(), c = 0;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) c = k;
      if (c === last) return;
      last = c;
      if (phase) phase.textContent = '0' + (c + 1) + ' / 04';
      if (now) now.textContent = names[c];
      steps.forEach(function (li, i) { li.classList.toggle('is-act', i === c); li.classList.toggle('is-done', i < c); });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
