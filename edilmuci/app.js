/* EdilMuci: horizontal photo reel hero that drifts with scroll, header, menu, anchors, reveals, service image swap,
   method line drawn by scroll, sticky phone bar, form validation, and the GSAP signature scene
   "Un tetto, strato per strato": the house outline draws, then the six layers of a roof drop in one by one. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var track = d.querySelector('.reel__track');
  var line = d.querySelector('.how__bar b'), steps = d.querySelector('.how__row');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
    if (!reduce && track && y < hero.offsetHeight * 1.5) {
      var k = window.innerWidth < 900 ? 0.55 : 0.4;
      track.style.transform = 'translate3d(' + (-y * k).toFixed(1) + 'px,0,0)';
    }
    if (line && steps && !reduce) {
      var r = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      line.style.setProperty('--p', p.toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
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

  /* services: the sticky photo follows the item in the middle of the screen (desktop), or the hovered one */
  var items = d.querySelectorAll('.what__list li'), pics = d.querySelectorAll('.what__pics img');
  function setPic(i) {
    pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
    items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
  }
  items.forEach(function (li, i) { li.addEventListener('mouseenter', function () { setPic(i); }); });
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) setPic(+e.target.getAttribute('data-pic')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { io2.observe(li); });
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
    mm.add('(max-width: 900px)', function () { return scene(true); });
    mm.add('(min-width: 901px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var draws = sec.querySelectorAll('.draw'), lays = sec.querySelectorAll('.lay');
    var labels = sec.querySelectorAll('.roof__list li'), count = sec.querySelector('.roof__count b');
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(lays, { autoAlpha: 0, y: -90 });
    tl.to(draws, { strokeDashoffset: 0, duration: 1, stagger: .15, ease: 'power1.inOut' }, 0);
    var at = [];
    lays.forEach(function (g, i) {
      var t0 = 1.1 + i * .7;
      at.push(t0 + .35);
      tl.to(g, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, t0);
    });
    tl.to({}, { duration: .6 });
    var last = -2;
    function upd() {
      var t = tl.time(), c = -1;
      for (var k = 0; k < at.length; k++) if (t >= at[k] - .3) c = k;
      if (c === last) return;
      last = c;
      labels.forEach(function (li, k) { li.classList.toggle('is-on', k <= c); li.classList.toggle('is-now', k === c); });
      count.textContent = '0' + Math.max(0, c + 1);
    }
    tl.eventCallback('onUpdate', upd);
    upd();
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () {
      st.kill(); tl.kill();
      gsap.set([].slice.call(draws).concat([].slice.call(lays)), { clearProps: 'all' });
      labels.forEach(function (li) { li.classList.remove('is-on', 'is-now'); });
      count.textContent = '06';
    };
  }
})();
