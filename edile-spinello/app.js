/* Edile Spinello: hero reel (slides in, drifts left on scroll), header, menu, anchors, reveals, count-up,
   services list that drives the photo, drag gallery, process line, phone bar, form validation,
   and the GSAP signature scene: one condominium split into five parts, roof to drains. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
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
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
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

  /* count-up (sourced numbers only: 30 years, 39 reviews) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count');
    if (reduce) { el.textContent = end; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1300);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  /* hero reel drifts left as you scroll */
  var track = d.querySelector('[data-reel]');
  if (track && !reduce) {
    setTimeout(function () { track.classList.add('is-live'); }, 1500);
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt || !track.classList.contains('is-live')) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.5) track.style.transform = 'translate3d(' + (-y * 0.4).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

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

  /* services list drives the photo: active line by scroll, also by hover on desktop */
  var items = d.querySelectorAll('.wlist__it'), pics = d.querySelectorAll('[data-pic]');
  function setW(i) {
    items.forEach(function (it) { it.classList.toggle('is-on', +it.getAttribute('data-w') === i); });
    pics.forEach(function (p) { p.classList.toggle('is-on', +p.getAttribute('data-pic') === i); });
  }
  if ('IntersectionObserver' in window) {
    var wio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) setW(+e.target.getAttribute('data-w')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { wio.observe(it); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { setW(+it.getAttribute('data-w')); }); });

  /* drag gallery (mouse); touch scrolls natively */
  var strip = d.querySelector('[data-drag]');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx) * 1.2; });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: 'smooth' });
    });
  }

  /* process line draws with scroll */
  var steps = d.querySelector('[data-steps]');
  if (steps && !reduce) {
    var lt = false;
    var drawLine = function () {
      lt = false;
      var r = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.3)));
      steps.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!lt) { lt = true; requestAnimationFrame(drawLine); } }, { passive: true });
    drawLine();
  }

  /* phone contact bar: after the hero, hidden in the scene pin and near the form */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('preventivo'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
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
    mm.add('(min-width: 1000px)', function () { scene(false); });
    mm.add('(max-width: 999px)', function () { scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    var sls = sec.querySelectorAll('.sl'), labs = sec.querySelectorAll('.lab');
    var copy = sec.querySelectorAll('.scene__copy > *'), cnt = sec.querySelector('[data-scount]'), sbar = sec.querySelector('[data-sbar]');
    var gap = small ? 10 : 22;
    gsap.set(sls, { y: 0, x: 0 });
    gsap.set(labs, { autoAlpha: 0, x: 24 });
    gsap.set(copy, { autoAlpha: 0, y: 24 });
    gsap.set(sbar, { scaleX: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(copy, { autoAlpha: 1, y: 0, duration: .5, stagger: .08 }, 0);
    /* the building splits: each slice moves away from the middle one, odd slices shift sideways */
    sls.forEach(function (s, k) {
      tl.to(s, { y: (k - 2) * gap, x: small ? 0 : (k % 2 ? 14 : -6), '--edge': 1, duration: 1.2, ease: 'power2.inOut' }, .5);
    });
    tl.to(labs, { y: function (k) { return (k - 2) * gap; }, duration: 1.2, ease: 'power2.inOut' }, .5);
    var at = [];
    labs.forEach(function (l, k) {
      at[k] = 1.1 + k * .55;
      tl.to(l, { autoAlpha: 1, x: 0, duration: .45 }, at[k]);
    });
    tl.to(sbar, { scaleX: 1, duration: 1.1 + labs.length * .55, ease: 'none' }, .5)
      .to({}, { duration: .5 });
    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) s = k;
      if (s === last) return; last = s;
      cnt.textContent = '0' + (s + 1);
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    sync();
  }
})();
