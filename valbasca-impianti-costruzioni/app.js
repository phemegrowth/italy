/* Valbasca Impianti e Costruzioni: hero (headline line reveal, reel of their own photos unmasks and drifts
   left on scroll), header, phone menu, anchors, reveals, count-up of their own numbers, guarantee bar,
   magnetic buttons, phone contact bar, form, and the GSAP signature scene "blueprint to building":
   pinned, a hairline elevation of the villa draws itself, then the real photo fills in floor by floor
   from the plinth to the roof while the step list and the % built follow the scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };

  /* header, phone bar, reel drift */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar'), reel = d.querySelector('[data-reel]');
  var tick = false;
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.55);
    if (reel && !reduce && !tick) {
      tick = true;
      requestAnimationFrame(function () {
        tick = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.6) reel.style.transform = 'translate3d(' + (-y * (window.innerWidth < 901 ? 0.55 : 0.45)).toFixed(1) + 'px,0,0)';
      });
    }
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
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.getAttribute('aria-disabled') === 'true') return;
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#cantiere' ? 0 : header.offsetHeight - 1);
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
  reveal(d.querySelectorAll('[data-gbar]'), function (el) { el.classList.add('is-in'); });

  /* count-up (their own figures: years, projects, square metres) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  /* magnetic buttons */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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

  /* GSAP scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    bpScene(window.innerWidth < 901);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function bpScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var lines = q('.bp__lines path'), grid = sec.querySelector('.bp__grid'), photo = sec.querySelector('.bp__photo');
    var steps = q('[data-steps-bp] li'), pct = sec.querySelector('[data-pct]'), txt = q('.bp__txt > .label, .bp__txt > .h2, .bp__steps, .bp__note');
    var frame = sec.querySelector('[data-frame]');

    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(grid, { autoAlpha: 0 });
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(frame, { autoAlpha: 0, y: 30 });
    gsap.set(txt, { autoAlpha: 0, y: 24 });

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    var at = [0, .5, 2.2, 3.4, 4.6, 5.8];
    tl.to(frame, { autoAlpha: 1, y: 0, duration: .4, ease: 'power2.out' }, 0)
      .to(txt, { autoAlpha: 1, y: 0, duration: .4, stagger: .08, ease: 'power2.out' }, .1)
      .to(grid, { autoAlpha: 1, duration: .4 }, .4)
      .to(lines, { strokeDashoffset: 0, duration: 1.1, stagger: .09, ease: 'power1.inOut' }, .5)
      .to(photo, { clipPath: 'inset(76% 0% 0% 0%)', duration: 1, ease: 'power2.out' }, at[2])
      .to(photo, { clipPath: 'inset(42% 0% 0% 0%)', duration: 1, ease: 'power2.out' }, at[3])
      .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.out' }, at[4])
      .to(lines, { autoAlpha: 0, duration: .6 }, at[5])
      .to(grid, { autoAlpha: 0, duration: .6 }, at[5])
      .to({}, { duration: .7 }, 6.4);
    var total = 6.4;
    var lastS = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), s = 1;
      for (var i = 1; i < at.length; i++) if (t >= at[i] - .15) s = i;
      pct.textContent = Math.min(100, Math.round(Math.max(0, (t - .5) / (total - .9)) * 100));
      if (s !== lastS) {
        lastS = s;
        steps.forEach(function (li) { var n = +li.getAttribute('data-s'); li.classList.toggle('is-on', n === s); li.classList.toggle('is-done', n < s); });
      }
    });
    steps.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-s') === '1'); });
    pct.textContent = '0';

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
  }
})();
