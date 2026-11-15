/* Edil Mc srl: hero entrance (EDIL MC letters rise, photo strip slides in from the right and drifts left on scroll),
   header, full-screen menu, anchors, reveals, service list that swaps the photo, drag strip, steps line,
   phone contact bar, form validation, and the GSAP signature scene: one house comes apart into five jobs
   (roof, windows and shutters, walls, window frames, entrance) and closes again, "chiavi in mano". */
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

  /* hero strip drifts left with the scroll */
  var strip = d.querySelector('.strip');
  if (strip && !reduce) {
    var rt = false;
    setTimeout(function () { strip.classList.add('is-drift'); }, 1500);
    window.addEventListener('scroll', function () {
      if (rt || !strip.classList.contains('is-drift')) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.5) strip.style.transform = 'translate3d(' + (-y * 0.4).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* services: the item in the middle of the screen (or hovered) drives the photo */
  var items = d.querySelectorAll('.svc__list li'), pics = d.querySelectorAll('.svc__pic img');
  function setSvc(k) {
    items.forEach(function (li) { li.classList.toggle('is-act', li.getAttribute('data-k') === k); });
    pics.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-k') === k); });
  }
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) setSvc(e.target.getAttribute('data-k')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { so.observe(li); });
  }
  items.forEach(function (li) { li.addEventListener('mouseenter', function () { setSvc(li.getAttribute('data-k')); }); });
  setSvc('0');

  /* drag strip (mouse); touch scrolls natively */
  var drag = d.querySelector('.drag');
  if (drag && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    drag.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); drag.scrollLeft = sl - (e.pageX - sx) * 1.2; });
  }

  /* steps line draws with the scroll */
  var stepsList = d.querySelector('.steps__list');
  if (stepsList && !reduce) {
    stepsList.style.setProperty('--p', 0);
    var st = false;
    var drawSteps = function () {
      st = false;
      var r = stepsList.getBoundingClientRect(), h = window.innerHeight;
      var p = Math.min(1, Math.max(0, (h * 0.85 - r.top) / (r.height + h * 0.35)));
      stepsList.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!st) { st = true; requestAnimationFrame(drawSteps); } }, { passive: true });
    drawSteps();
  }

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* phone contact bar: after the hero, hidden in the scene and at the form */
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
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { houseScene(false); });
    mm.add('(max-width: 899px)', function () { houseScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function houseScene(small) {
    var sec = d.querySelector('[data-scene]');
    var house = sec.querySelector('.house');
    var slices = sec.querySelectorAll('.sl'), edges = sec.querySelectorAll('.sl b'), tags = sec.querySelectorAll('.tags li');
    var cnt = sec.querySelector('[data-count]'), barEl = sec.querySelector('[data-bar]'), endTxt = sec.querySelector('.scene__end');
        var gap = function () { return house.offsetHeight * (small ? 0.075 : 0.065); };
    var off = function (i) { return function () { return (i - 2) * gap(); }; };

    gsap.set(house, { autoAlpha: 0, scale: .9 });
    gsap.set(tags, { autoAlpha: 0, x: -12 });
    gsap.set(endTxt, { autoAlpha: 0, y: 16 });
    gsap.set(barEl, { scaleX: 0 });
    gsap.set(edges, { autoAlpha: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(house, { autoAlpha: 1, scale: 1, duration: .6 }, 0)
      .to(edges, { autoAlpha: 1, duration: .4 }, .9);
    slices.forEach(function (s, i) {
      tl.to(s, { y: off(i), x: (i % 2 ? 1 : -1) * (small ? 4 : 10), duration: 1, ease: 'power2.inOut' }, .9);
    });
    var at = [];
    tags.forEach(function (t, i) {
      at[i] = 1.6 + i * .7;
      tl.to(t, { autoAlpha: 1, x: 0, y: off(i), duration: .35 }, at[i]);
    });
    var closeAt = 1.6 + 5 * .7 + .3;
    tl.to(tags, { autoAlpha: 0, duration: .3 }, closeAt);
    slices.forEach(function (s) { tl.to(s, { y: 0, x: 0, duration: .9, ease: 'power2.inOut' }, closeAt + .1); });
    tl.to(edges, { autoAlpha: 0, duration: .4 }, closeAt + .6);
    tl.to(endTxt, { autoAlpha: 1, y: 0, duration: .5 }, closeAt + .7)
      .to(barEl, { scaleX: 1, duration: closeAt + 1.2, ease: 'none' }, 0)
      .to({}, { duration: .4 }, closeAt + 1.2);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) s = k;
      if (s === last) return; last = s;
      cnt.textContent = '0' + (s + 1);
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    sync();
  }
})();
