/* Global Costruzioni Italia: hero C (type-first: the name fills the width; a strip of four site photos slides in
   from the right and drifts left with scroll), header, phone menu, anchors, reveals, outlined numbers that fill red
   on hover, process line, sticky phone bar, form validation, and the GSAP signature scene "Dal disegno all'edificio"
   (catalogue 1, blueprint to building): pinned, a white elevation draws itself on a grid, then the building fills
   in floor by floor while a % counter climbs and the five stages light up. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* hero strip drifts left with scroll */
  var strip = d.querySelector('.strip');
  if (strip && !reduce) {
    var tk = false;
    var dr = function () {
      tk = false;
      var y = Math.min(window.scrollY, window.innerHeight * 1.3);
      strip.style.transform = 'translate3d(' + (-y * 0.25).toFixed(1) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(dr); } }, { passive: true });
  }

  /* process line */
  var wrapS = d.querySelector('.steps__wrap'), line = d.querySelector('.steps__line i');
  if (wrapS && line && !reduce) {
    var lp = function () {
      var r = wrapS.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    };
    window.addEventListener('scroll', lp, { passive: true });
    lp();
  }

  /* form validation */
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
    var mm = gsap.matchMedia();
    mm.add('(max-width: 899px)', function () { return scene(true); });
    mm.add('(min-width: 900px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var paths = sec.querySelectorAll('.bpl'), pic = sec.querySelector('.bp__pic'), svg = sec.querySelector('.bp__svg');
    var pct = sec.querySelector('[data-pct]'), steps = sec.querySelectorAll('.bp__steps li');
    paths.forEach(function (p) { var l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    gsap.set(pic, { clipPath: 'inset(100% 0% 0% 0%)' });
    var st0 = { v: 0 };
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(paths[2], { strokeDashoffset: 0, duration: .4 }, 0)
      .to(paths[0], { strokeDashoffset: 0, duration: 1 }, .1)
      .to(paths[1], { strokeDashoffset: 0, duration: .6 }, .6)
      .to(pic, { clipPath: 'inset(82% 0% 0% 0%)', duration: .6 }, 1.2)
      .to(pic, { clipPath: 'inset(55% 0% 0% 0%)', duration: .7 }, 1.9)
      .to(pic, { clipPath: 'inset(28% 0% 0% 0%)', duration: .7 }, 2.7)
      .to(pic, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7 }, 3.5)
      .to(svg, { opacity: .2, duration: .5 }, 3.8)
      .to(st0, { v: 100, duration: 3, onUpdate: function () { pct.textContent = Math.round(st0.v); } }, 1.2)
      .to({}, { duration: .4 });
    var last = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), c = t < 1.2 ? 0 : t < 1.9 ? 1 : t < 2.7 ? 2 : t < 3.6 ? 3 : 4;
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i === c); });
    });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { st.kill(); gsap.set([pic, svg].concat([].slice.call(paths)), { clearProps: 'all' }); };
  }
})();
