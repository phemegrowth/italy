/* AM Edilizia: hero H (blue curtain lifts, AM monogram shrinks, headline lines rise), header, phone menu, anchors,
   reveals with clip-path image wipes, services accordion, process rail, phone contact bar, form,
   and the GSAP signature scene: a pinned before / after wipe driven by scroll (left to right on desktop,
   bottom to top on phones), with three captions and a percentage. */
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
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* accordion: one open at a time */
  var items = d.querySelectorAll('.acc__it');
  items.forEach(function (it) {
    var bt = it.querySelector('.acc__bt');
    bt.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      items.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.acc__bt').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); bt.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* process: steps light up, rail fills */
  var list = d.querySelector('[data-steps]'), rail = d.querySelector('[data-rail]');
  if (list) {
    var st = list.querySelectorAll('.pstep');
    var draw = function () {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / (r.height)));
      if (rail) rail.parentNode.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length || p === 1); });
    };
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  }

  /* phone contact bar */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero) {
    var mb = function () { mbar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 60); };
    window.addEventListener('scroll', mb, { passive: true });
    mb();
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Diteci in due righe che cosa c\'è da fare.' };
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

  /* GSAP before / after */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    baScene(window.innerWidth <= 760);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function baScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var after = sec.querySelector('[data-after]'), line = sec.querySelector('[data-line]');
    var frame = sec.querySelector('.ba__frame'), head = sec.querySelector('.ba__head');
    var caps = sec.querySelectorAll('.ba__cap'), pct = sec.querySelector('[data-pct]'), bar = sec.querySelector('[data-bar]');
    var tags = sec.querySelectorAll('.ba__tag'), beforeImg = sec.querySelector('.ba__img--before img'), afterImg = after.querySelector('img');
    var hidden = small ? 'inset(100% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)';

    gsap.set(head, { autoAlpha: 0, y: 24 });
    gsap.set(frame, { autoAlpha: 0, scale: 0.94 });
    gsap.set(tags, { autoAlpha: 0 });
    var capsWrap = sec.querySelector('.ba__caps'), meter = sec.querySelector('.ba__meter');
    gsap.set([capsWrap, meter], { autoAlpha: 0 });
    gsap.set(after, { clipPath: hidden });
    if (small) gsap.set(line, { yPercent: 0, top: '100%' }); else gsap.set(line, { left: '0%' });
    gsap.set(afterImg, { scale: 1.12 });

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(head, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to(frame, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0.1)
      .to(tags, { autoAlpha: 1, duration: 0.3, stagger: 0.1 }, 0.5)
      .to([capsWrap, meter], { autoAlpha: 1, duration: 0.3 }, 0.5)
      .to(after, { clipPath: 'inset(0% 0% 0% 0%)', duration: 3 }, 0.9)
      .to(afterImg, { scale: 1, duration: 3 }, 0.9)
      .to(beforeImg, { scale: 1.06, duration: 3 }, 0.9)
      .to(line, small ? { top: '0%', duration: 3 } : { left: '100%', duration: 3 }, 0.9)
      .to(line, { autoAlpha: 0, duration: 0.2 }, 3.9)
      .to({}, { duration: 0.5 }, 4.1);

    var last = -1;
    tl.eventCallback('onUpdate', function () {
      var p = Math.max(0, Math.min(1, (tl.time() - 0.9) / 3));
      var k = p < 0.3 ? 0 : (p < 0.72 ? 1 : 2);
      if (k !== last) { last = k; caps.forEach(function (c) { c.classList.toggle('is-on', +c.getAttribute('data-cap') === k); }); }
      pct.textContent = Math.round(p * 100);
      bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    });

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=200%',
      pin: true, scrub: 0.6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
  }
})();
