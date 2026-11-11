/* EGOLINE Infissi: hero entrance and photo parallax, header, full-screen phone menu, anchors, reveals, count-up,
   accordion, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene: one window,
   measured, the old one removed, the new frame fitted, sashes and glass, sealing, then a sash opens on the view. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header shrink + phone bar after the hero */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
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
    header.classList.toggle('menu-open', open);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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

  /* count-up (review count only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count');
    if (reduce) { el.textContent = end; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* hero photo moves slower than the page */
  var par = d.querySelector('[data-par] picture');
  if (par && !reduce) {
    var pt = false;
    window.addEventListener('scroll', function () {
      if (pt) return; pt = true;
      requestAnimationFrame(function () {
        pt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.4) par.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* accordion: one open at a time */
  var acc = d.querySelector('[data-acc]');
  if (acc) {
    acc.querySelectorAll('.acc__it').forEach(function (it) {
      var b = it.querySelector('button');
      b.addEventListener('click', function () {
        var open = !it.classList.contains('is-open');
        acc.querySelectorAll('.acc__it').forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
        if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  /* magnetic buttons, desktop pointer only */
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
    var msgs = { name: 'Scrivi nome e cognome.', phone: 'Serve un numero per richiamarti.', email: 'Scrivi un indirizzo email valido.', message: 'Scrivi due righe su cosa ti serve.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
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
    windowScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function windowScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelector(s); };
    var dims = q('.w-dims'), old = q('.w-old'), frame = q('.w-frame'), sL = q('.w-sashL'), sR = q('.w-sashR');
    var seal = q('.w-seal'), view = q('.w-view'), glass = sec.querySelectorAll('.w-glass');
    var cnt = q('[data-cnt]'), name = q('[data-name]'), bar = q('[data-bar]'), steps = sec.querySelectorAll('.scene__list li');
    var names = ['', 'Misure', 'Smontaggio', 'Telaio', 'Ante e vetri', 'Sigillatura e pulizia'];
    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 960px)', big: '(min-width: 961px)' }, function (ctx) {
      var small = ctx.conditions.small;
      gsap.set(dims, { autoAlpha: 0 });
      gsap.set(dims.querySelectorAll('.w-dim'), { attr: { 'stroke-dasharray': 260, 'stroke-dashoffset': 260 } });
      gsap.set(old, { autoAlpha: 1, y: 0 });
      gsap.set(frame, { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });
      gsap.set(sL, { x: -130, autoAlpha: 0 });
      gsap.set(sR, { x: 130, autoAlpha: 0, scaleX: 1, svgOrigin: '266 240' });
      gsap.set(glass, { autoAlpha: 0 });
      gsap.set(seal, { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });
      gsap.set(view, { autoAlpha: .25, scale: 1.12, transformOrigin: '50% 50%' });
      gsap.set(bar, { scaleX: 0 });

      var at = [0, 0.3, 1.5, 2.7, 3.9, 5.1];
      var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
      tl.to(dims, { autoAlpha: 1, duration: .2 }, at[1])
        .to(dims.querySelectorAll('.w-dim'), { attr: { 'stroke-dashoffset': 0 }, duration: .9, stagger: .15 }, at[1])
        .to(old, { y: 40, autoAlpha: 0, duration: .9, ease: 'power2.in' }, at[2])
        .to(dims, { autoAlpha: 0, duration: .4 }, at[2] + .6)
        .to(view, { autoAlpha: .55, duration: .9 }, at[2])
        .to(frame, { attr: { 'stroke-dashoffset': 0 }, duration: 1 }, at[3])
        .to(sL, { x: 0, autoAlpha: 1, duration: .8, ease: 'power3.out' }, at[4])
        .to(sR, { x: 0, autoAlpha: 1, duration: .8, ease: 'power3.out' }, at[4] + .15)
        .to(glass, { autoAlpha: 1, duration: .5 }, at[4] + .5)
        .to(seal, { attr: { 'stroke-dashoffset': 0 }, duration: .8 }, at[5])
        .to(view, { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'none' }, at[5])
        .to(sR, { scaleX: .22, duration: .9, ease: 'power2.inOut' }, at[5] + .7)
        .to(bar, { scaleX: 1, duration: 6.5, ease: 'none' }, 0)
        .to({}, { duration: .5 }, 6.5);

      var last = -1;
      function sync() {
        var t = tl.time(), s = 1;
        for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
        if (s === last) return;
        last = s;
        cnt.textContent = '0' + s;
        name.textContent = names[s];
        steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); });
      }
      tl.eventCallback('onUpdate', sync);
      sync();
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=250%', pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
      return function () { tl.kill(); };
    });
  }
})();
