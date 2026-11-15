/* Vns Impresa Edile: hero reel (photos drift left with scroll), header, full-screen menu, anchors, reveals,
   service list that swaps the photo, drag strip, step line, phone contact bar, form validation,
   and the GSAP signature scene: one wall built coat after coat by the scroll
   (bricks, intonaco with the trowel, rasatura, fondo, then the colour with the roller). */
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
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
  reveal(d.querySelectorAll('.steps'), function (el) { el.classList.add('is-drawn'); });

  /* hero reel drifts left on scroll */
  var track = d.querySelector('.reel__track');
  if (track && !reduce) {
    var rt = false;
    var drift = function () {
      rt = false;
      var y = window.scrollY;
      if (y < window.innerHeight * 1.5) track.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!rt) { rt = true; requestAnimationFrame(drift); } }, { passive: true });
  }

  /* services: the active row swaps the photo (hover on desktop, scroll position everywhere) */
  var rows = d.querySelectorAll('.svc__i'), pics = d.querySelectorAll('.svc__pic img');
  function act(i) {
    rows.forEach(function (r, k) { r.classList.toggle('is-act', k === i); });
    pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
  }
  rows.forEach(function (r, k) { r.addEventListener('mouseenter', function () { act(k); }); });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) act(+e.target.getAttribute('data-img')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { so.observe(r); });
  }

  /* drag strip (mouse) */
  var strip = d.querySelector('.strip');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
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

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
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
      if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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
    mm.add('(min-width: 900px)', function () { wallScene(false); });
    mm.add('(max-width: 899px)', function () { wallScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    var frame = sec.querySelector('.wall__frame');
    var L = sec.querySelectorAll('.wall__l');
    var trowel = sec.querySelector('.trowel'), roller = sec.querySelector('.roller');
    var items = sec.querySelectorAll('.layers li'), sx = sec.querySelectorAll('.sx');
    var cnt = sec.querySelector('[data-count]'), barEl = sec.querySelector('[data-bar]');
    var W = function () { return frame.offsetWidth; }, H = function () { return frame.offsetHeight; };
    var tw = function () { return trowel.offsetWidth; }, rw = function () { return roller.offsetWidth; };

    gsap.set(L[0], { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set([L[1], L[3]], { clipPath: 'inset(0% 0% 100% 0%)' });
    gsap.set([L[2], L[4]], { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set([trowel, roller], { autoAlpha: 0 });
    gsap.set(sx, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(barEl, { scaleX: 0 }); cnt.textContent = '0';
    gsap.set(sec.querySelectorAll('.scene__copy > *'), { autoAlpha: 0, y: 24 });

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(sec.querySelectorAll('.scene__copy > *'), { autoAlpha: 1, y: 0, duration: .35, stagger: .06, ease: 'power2.out' }, 0);
    /* 1 bricks rise course by course */
    tl.to(L[0], { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'steps(8)' }, .3);
    tl.to(sx[0], { scaleX: 1, duration: .4 }, .8);
    /* 2 intonaco: trowel travels down, plaster follows it */
    tl.set(trowel, { autoAlpha: 1, x: function () { return (W() - tw()) / 2; }, y: function () { return -tw() * .4; } }, 1.35);
    tl.to(trowel, { y: function () { return H() - tw() * .2; }, duration: 1 }, 1.35);
    tl.to(L[1], { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, 1.35);
    tl.to(sx[1], { scaleX: 1, duration: .4 }, 1.9);
    /* 3 rasatura: trowel sweeps left to right */
    tl.set(trowel, { x: function () { return -tw() * .6; }, y: function () { return H() * .45; } }, 2.45);
    tl.to(trowel, { x: function () { return W() - tw() * .3; }, duration: 1 }, 2.45);
    tl.to(L[2], { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, 2.45);
    tl.to(sx[2], { scaleX: 1, duration: .4 }, 3);
    tl.to(trowel, { autoAlpha: 0, duration: .1 }, 3.45);
    /* 4 fondo: roller down */
    tl.set(roller, { autoAlpha: 1, x: function () { return (W() - rw()) / 2; }, y: function () { return -rw() * .3; } }, 3.55);
    tl.to(roller, { y: function () { return H() - rw() * .45; }, duration: 1 }, 3.55);
    tl.to(L[3], { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, 3.55);
    tl.to(sx[3], { scaleX: 1, duration: .4 }, 4.1);
    /* 5 colore: roller sweeps across */
    tl.set(roller, { x: function () { return -rw() * .5; }, y: function () { return H() * .3; } }, 4.65);
    tl.to(roller, { x: function () { return W() - rw() * .4; }, duration: 1.1 }, 4.65);
    tl.to(L[4], { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1 }, 4.65);
    tl.to(sx[4], { scaleX: 1, duration: .4 }, 5.3);
    tl.to(roller, { autoAlpha: 0, y: '-=40', duration: .3 }, 5.8);
    tl.to(barEl, { scaleX: 1, duration: 6.1 }, 0);
    tl.to({}, { duration: .3 }, 6.1);

    var marks = [0.3, 1.35, 2.45, 3.55, 4.65];
    var total = tl.duration();
    var last = -1;
    function upd(self) {
      var t = self.progress * total, n = 0;
      marks.forEach(function (m, i) { if (t >= m) n = i + 1; });
      if (n === last) return; last = n;
      cnt.textContent = n;
      items.forEach(function (li, i) { li.classList.toggle('is-on', small ? i === n - 1 : i < n); });
    }
    ScrollTrigger.create({
      animation: tl, trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%',
      pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: upd, onToggle: function (s) { scenePinned = s.isActive; bar(); }
    });
    return function () { gsap.set([L, trowel, roller, sx, barEl], { clearProps: 'all' }); };
  }
})();
