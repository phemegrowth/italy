/* Imperium Costruzioni: hero A (slow scale + line reveal), header, menu, phone bar, anchors, reveals, service photo swap,
   drag strip, steps line, magnetic buttons, form validation, and the GSAP signature scene:
   the word CASA cut out of an ink layer; scroll flies through the stroke of the C into a finished room. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1000 && menu.classList.contains('is-open')) setMenu(false); });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : 60);
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

  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; fn(); }); }, { passive: true });
    fn();
  }

  /* services: the photo beside the list follows the item in the middle of the screen (desktop), hover too */
  var swap = d.querySelector('[data-swap]'), items = d.querySelectorAll('.svc__list li'), curImg = 'mansarda';
  function show(name) {
    if (!swap || name === curImg) return;
    curImg = name;
    swap.classList.add('is-fade');
    setTimeout(function () { swap.src = './assets/img/' + name + '.jpg'; swap.onload = function () { swap.classList.remove('is-fade'); }; }, 220);
  }
  function setItem(li) { items.forEach(function (x) { x.classList.toggle('is-on', x === li); }); show(li.getAttribute('data-img')); }
  if (items.length && window.matchMedia('(min-width: 1000px)').matches) {
    items.forEach(function (li) { li.addEventListener('mouseenter', function () { setItem(li); }); });
    onFrameScroll(function () {
      var mid = window.innerHeight * 0.5, best = null, dist = 1e9;
      items.forEach(function (li) { var r = li.getBoundingClientRect(); var dd = Math.abs(r.top + r.height / 2 - mid); if (dd < dist) { dist = dd; best = li; } });
      if (best && dist < window.innerHeight * 0.35) setItem(best);
    });
  }

  /* drag strip */
  d.querySelectorAll('.strip').forEach(function (s) {
    var bar = s.parentNode.querySelector('.strip__bar');
    function upd() { var m = s.scrollWidth - s.clientWidth; var p = m > 0 ? s.scrollLeft / m : 1; if (bar) bar.style.setProperty('--p', (0.15 + p * 0.85).toFixed(3)); }
    s.addEventListener('scroll', upd, { passive: true }); upd();
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; s.scrollLeft = l0 - (e.clientX - x0); });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
  });

  /* steps line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
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

  /* ---------- signature scene: fly through the C of CASA ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var pin = scene.querySelector('.mask__pin'), svg = scene.querySelector('.mask__svg'), txt = scene.querySelector('.mm-txt');
  var cover = scene.querySelector('.mask__cover'), photo = scene.querySelector('.mask__photo img');
  var top = scene.querySelector('.mask__top'), bot = scene.querySelector('.mask__bot'), end = scene.querySelector('.mask__end');

  /* find a point inside the left stroke of the C, by drawing the word on a canvas with the same font */
  function strokePoint(w, h, fs) {
    var c = d.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d');
    x.font = '800 ' + fs + 'px Parkinsans, sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('CASA', w / 2, h / 2);
    var row = Math.round(h / 2), data = x.getImageData(0, row, w, 1).data, a = -1, b = -1;
    for (var i = 0; i < w; i++) { var on = data[i * 4 + 3] > 128; if (on && a < 0) a = i; if (!on && a >= 0) { b = i; break; } }
    if (a < 0) return { x: w / 2 - fs, y: h / 2, sw: fs * .14 };
    return { x: (a + b) / 2, y: h / 2, sw: Math.max(4, b - a) };
  }

  function build() {
    var w = pin.clientWidth, h = pin.clientHeight, phone = w <= 700;
    var fs = Math.round(Math.min(w * 0.27, h * 0.36));
    txt.setAttribute('font-size', fs);
    var p = strokePoint(w, h, fs);
    var S = Math.max(w, h) * 2.2 / p.sw;
    gsap.set(svg, { transformOrigin: p.x + 'px ' + p.y + 'px', scale: 1 });
    gsap.set([top, bot], { opacity: 0, y: 20 });
    gsap.set(end, { opacity: 0, y: 40 });
    gsap.set(photo, { scale: 1.18 });
    gsap.set(cover, { opacity: 1 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=140%' : '+=220%', pin: pin, scrub: .6, anticipatePin: 1,
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to([top, bot], { opacity: 1, y: 0, duration: .35, stagger: .08, ease: 'power2.out' }, 0)
      .to([top, bot], { opacity: 0, duration: .2 }, .75)
      .to(svg, { scale: S, duration: 1.4, ease: 'power2.in' }, .8)
      .to(photo, { scale: 1, duration: 1.6, ease: 'power1.out' }, .8)
      .to(cover, { opacity: 0, duration: .25 }, 1.95)
      .to(end, { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, 2.15)
      .to({}, { duration: .45 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.load ? d.fonts.load('800 100px Parkinsans').then(function () { return d.fonts.ready; }) : Promise.resolve()).then(start, start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
