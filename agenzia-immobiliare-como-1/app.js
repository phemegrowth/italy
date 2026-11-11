/* Agenzia Immobiliare Como: hero entrance (giant COMO rises letter by letter, photo strip slides in from the right),
   header, phone menu, anchors, reveals, service list drives the photo, calculator, drag strip, process line,
   magnetic buttons, phone contact bar, form, and the GSAP signature scene "il conto dell'1%":
   pinned, the scroll draws a 3% bar, then the 1% bar, the difference turns into "restano a voi" and counts up. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };

  /* header */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight - window.innerHeight * 0.3);
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

  /* language switch is a placeholder */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.getAttribute('aria-disabled') === 'true') return;
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#conto' ? 0 : header.offsetHeight - 1);
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

  /* hero strip drifts left on scroll (desktop and phone) */
  var strip = d.querySelector('[data-strip]');
  if (strip && !reduce) {
    var hs = false;
    window.addEventListener('scroll', function () {
      if (hs) return; hs = true;
      requestAnimationFrame(function () {
        hs = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.6) strip.style.transform = 'translate3d(' + (-y * (window.innerWidth < 901 ? 0.5 : 0.22)).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* services: hover, or the item nearest the middle on scroll, swaps the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.si');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * (window.innerWidth < 901 ? 0.62 : 0.5), best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
    });
  }, { passive: true });

  /* calculator */
  var range = d.getElementById('prezzo');
  if (range) {
    var oP = d.getElementById('out-p'), o1 = d.getElementById('out-1'), oD = d.getElementById('out-d');
    var upd = function () {
      var v = +range.value;
      oP.textContent = '€ ' + fmt(v);
      o1.textContent = '€ ' + fmt(v * 0.01);
      oD.textContent = '€ ' + fmt(v * 0.02);
      range.style.setProperty('--fill', ((v - range.min) / (range.max - range.min) * 100).toFixed(1) + '%');
    };
    range.addEventListener('input', upd);
    upd();
  }

  /* drag strip (mouse); touch uses native scroll */
  var drag = d.querySelector('[data-drag]');
  if (drag) {
    var down = false, sx = 0, sl = 0;
    drag.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); drag.scrollLeft = sl - (e.pageX - sx) * 1.3; });
    drag.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { drag.scrollBy({ left: 300, behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { drag.scrollBy({ left: -300, behavior: 'smooth' }); }
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa vi serve.' };
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
    contoScene(window.innerWidth < 901);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function contoScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var $ = function (s) { return sec.querySelector(s); };
    var pic = $('.conto__pic'), img = $('.conto__pic img'), price = $('[data-price]');
    var eyebrow = $('.eyebrow'), h2 = $('.h2');
    var b3 = $('[data-bar3]'), b1 = $('[data-bar1]');
    var f3 = b3.querySelector('.bar__fill'), f1 = b1.querySelector('.bar__fill'), save = b1.querySelector('.bar__save');
    var v3 = $('[data-v3]'), v1 = $('[data-v1]'), keep = $('[data-keep]'), saveN = $('[data-save]'), note = $('[data-note]');
    var nums = { a: 0, b: 0, c: 0 };
    var paint = function () { v3.textContent = '€ ' + fmt(nums.a); v1.textContent = '€ ' + fmt(nums.b); saveN.textContent = fmt(nums.c); };

    gsap.set(pic, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(img, { scale: 1.18 });
    gsap.set([price, eyebrow, h2, b3, b1, keep, note], { autoAlpha: 0, y: 24 });
    gsap.set([f3, f1], { scaleX: 0 });
    gsap.set(save, { scaleX: 0 });
    paint();

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(pic, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 0)
      .to(img, { scale: 1, duration: 4.6, ease: 'none' }, 0)
      .to([eyebrow, h2], { autoAlpha: 1, y: 0, duration: .5, stagger: .12 }, .3)
      .to(price, { autoAlpha: 1, y: 0, duration: .5 }, .8)
      .to(b3, { autoAlpha: 1, y: 0, duration: .4 }, 1.2)
      .to(f3, { scaleX: 1, duration: .9, ease: 'power1.inOut' }, 1.4)
      .to(nums, { a: 12000, duration: .9, ease: 'power1.inOut', onUpdate: paint }, 1.4)
      .to(b1, { autoAlpha: 1, y: 0, duration: .4 }, 2.3)
      .to(f1, { scaleX: 1, duration: .6, ease: 'power1.inOut' }, 2.5)
      .to(nums, { b: 4000, duration: .6, ease: 'power1.inOut', onUpdate: paint }, 2.5)
      .to(save, { scaleX: 1, duration: .8, ease: 'power1.inOut' }, 3.2)
      .to(keep, { autoAlpha: 1, y: 0, duration: .4 }, 3.2)
      .to(nums, { c: 8000, duration: .9, ease: 'power1.out', onUpdate: paint }, 3.3)
      .to(note, { autoAlpha: 1, y: 0, duration: .4 }, 4.1)
      .to({}, { duration: .5 }, 4.5);

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
  }
})();
