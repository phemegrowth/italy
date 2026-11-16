/* La Bosca: blueprint hero (grid and frame draw in), header, menu, anchors, reveals, list that drives the photo,
   magnetic buttons, phone bar, form, and the GSAP scene: a stained wall treated, filled and painted layer by layer. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight - 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 2);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  d.querySelectorAll('.h2, .lead, .sl__it, .vq, .about__mark, .contact__list, .form').forEach(function (el) {
    if (!el.closest('.scene') && !el.closest('.hero')) el.classList.add('r');
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
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: hover (desktop) or the item nearest the middle of the screen swaps the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.sl__it');
  function showPic(item) {
    var k = item.getAttribute('data-for');
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it); }); it.addEventListener('click', function () { showPic(it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * 0.55, best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.3) showPic(best);
    });
  }, { passive: true });

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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Due righe su cosa cercate.' };
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

  /* GSAP scene: the wall */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    wallScene(window.innerWidth < 761);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelector(s); };
    var wall = q('.wall'), stains = sec.querySelectorAll('.stain, .leak'), treat = q('.w--treat'), stucco = q('.w--stucco'), blade = q('.blade'), paint = q('.w--paint'), roller = q('.roller');
    var lays = sec.querySelectorAll('[data-lay]'), count = q('[data-count]');
    gsap.set(wall, { autoAlpha: 0, scale: .9, rotation: -2 });
    gsap.set(treat, { autoAlpha: 0, xPercent: -60 });
    gsap.set(stucco, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(paint, { clipPath: 'inset(0% 0% 100% 0%)' });
    gsap.set(roller, { autoAlpha: 0 });
    gsap.set(blade, { autoAlpha: 0 });
    var tl = gsap.timeline();
    tl.to(wall, { autoAlpha: 1, scale: 1, rotation: 0, duration: .4, ease: 'power2.out' }, 0)
      /* 02 antimuffa: a sheen sweeps across, stains fade */
      .to(treat, { autoAlpha: 1, xPercent: 60, duration: 1, ease: 'none' }, 1.4)
      .to(stains, { autoAlpha: 0, duration: .8, stagger: .08 }, 1.7)
      .to(treat, { autoAlpha: 0, duration: .3 }, 2.4)
      /* 03 stuccatura: the blade pulls the filler from left to right */
      .to(blade, { autoAlpha: 1, duration: .1 }, 2.8)
      .to(stucco, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power1.inOut' }, 2.8)
      .to(blade, { autoAlpha: 0, duration: .15 }, 3.75)
      /* 04 pittura: the roller comes down */
      .to(roller, { autoAlpha: 1, duration: .1 }, 4.1)
      .to(paint, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power1.inOut' }, 4.1)
      .to(roller, { autoAlpha: 0, duration: .2 }, 5.1)
      .to({}, { duration: .5 });
    var marks = [0, 1.4, 2.8, 4.1], last = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), s = 0;
      for (var k = 0; k < marks.length; k++) if (t >= marks[k]) s = k;
      if (s === last) return; last = s;
      lays.forEach(function (l, i) { l.classList.toggle('is-on', i === s); });
      count.textContent = '0' + (s + 1);
    });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
  }
})();
