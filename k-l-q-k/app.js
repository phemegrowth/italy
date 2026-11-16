/* Kleqka Safet: hero entrance (line reveal, reel unmask) and reel drift on scroll, header, full-screen menu, anchors,
   reveals, services list that swaps the photo, drag strip, method line, magnetic buttons, phone contact bar, form
   validation, and the GSAP signature scene "Il ponteggio": a scaffold rises bay by bay in front of a Venetian facade
   (base plates, standards and ledgers, decks with orange guardrails, ties and braces, protective net). */
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
  var track = d.querySelector('.reel__track');
  var ticking = false;
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
    if (track && !reduce && !ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = Math.min(window.scrollY, hero.offsetHeight * 1.2);
        track.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)';
      });
    }
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

  /* drag strip (mouse); touch uses native scroll */
  d.querySelectorAll('.drag').forEach(function (el) {
    var down = false, sx = 0, sl = 0;
    el.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = el.scrollLeft; el.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { down = false; el.classList.remove('is-down'); });
    el.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); el.scrollLeft = sl - (e.pageX - sx) * 1.2; });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { el.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { el.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* method line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / Math.max(r.height, 200)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    scaffold(window.innerWidth < 980);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scaffold(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var base = q('.sc-base'), std = q('.std'), leds = q('.led'), decks = q('.deck'), brace = q('.brace'), ties = q('.ties circle'), net = q('.sc-net');
    var lis = q('.scene__list li'), phase = sec.querySelector('[data-phase]'), pbar = sec.querySelector('.scene__bar');

    gsap.set(base, { autoAlpha: 0, y: 14 });
    gsap.set(std, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(leds, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(decks, { autoAlpha: 0, y: 18 });
    gsap.set(brace, { autoAlpha: 0 });
    gsap.set(ties, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(net, { scaleY: 0, transformOrigin: '50% 0%' });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, 0.8, 2.6, 4.5, 5.6];
    tl.to(base, { autoAlpha: 1, y: 0, duration: .6 }, 0)
      .to(std, { scaleY: 1, duration: 1.6, ease: 'power1.inOut' }, at[1]);
    leds.forEach(function (l, i) { tl.to(l, { scaleX: 1, duration: .45 }, at[1] + .2 + i * .28); });
    decks.forEach(function (dk, i) { tl.to(dk, { autoAlpha: 1, y: 0, duration: .45, ease: 'back.out(1.6)' }, at[2] + i * .32); });
    tl.to(brace, { autoAlpha: 1, duration: .5 }, at[3])
      .to(ties, { scale: 1, duration: .35, stagger: .1, ease: 'back.out(2)' }, at[3] + .2)
      .to(net, { scaleY: 1, duration: 1.1, ease: 'power2.inOut' }, at[4])
      .to({}, { duration: .5 });

    var last = -2;
    function sync() {
      var tt = tl.time(), c = 0;
      for (var k = 0; k < at.length; k++) if (tt >= at[k]) c = k;
      if (pbar) pbar.style.setProperty('--p', (tl.progress()).toFixed(3));
      if (c === last) return;
      last = c;
      if (phase) phase.textContent = '0' + (c + 1);
      lis.forEach(function (li, i) { li.classList.toggle('is-act', i === c); li.classList.toggle('is-done', i < c); });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
