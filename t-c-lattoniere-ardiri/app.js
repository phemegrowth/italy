/* T&C Lattoniere: type-first hero (name across the screen, photo strip slides in from the right and drifts left), header,
   full-screen menu, anchors, reveals (service photos wipe in), step line, phone contact bar, form validation and the
   GSAP signature scene: a roof section built layer by layer with the scroll (travi, tavolato, guaina, isolante, listelli,
   coppi one by one, lattoneria), then the rain falls and runs into the copper gutter. */
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


  /* hero strip drifts left with the scroll */
  var strip = d.querySelector('.hero__strip');
  if (strip && !reduce) {
    var rq = false;
    window.addEventListener('scroll', function () {
      if (rq) return; rq = true;
      requestAnimationFrame(function () {
        rq = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.4) strip.style.transform = 'translate3d(' + (-y * 0.25).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
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

  /* GSAP signature scene: a roof built layer by layer, then the rain runs into the gutter */
  var CAPS = [
    'Travi: la struttura in legno che regge tutto.',
    'Tavolato: le tavole che chiudono la struttura.',
    'Guaina: lo strato che ferma l\'acqua.',
    'Isolante: caldo d\'inverno fuori, fresco d\'estate dentro.',
    'Listelli: sostengono il manto e lasciano respirare il tetto.',
    'Coppi: il manto, posato uno per uno.',
    'Lattoneria: grondaia, pluviale e scossalina portano via l\'acqua.'
  ];
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return roofScene(false); });
    mm.add('(max-width: 899px)', function () { return roofScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function roofScene(small) {
    var sec = d.querySelector('[data-scene]');
    var ly = sec.querySelectorAll('.ly'), lbl = sec.querySelectorAll('.lbl'), cps = sec.querySelectorAll('.cp');
    var rain = sec.querySelectorAll('.rain line'), water = sec.querySelector('.water');
    var capN = sec.querySelector('[data-cap-n]'), cap = sec.querySelector('[data-cap]'), chips = sec.querySelectorAll('.chips li');
    var svg = sec.querySelector('.roof');
    if (small) svg.setAttribute('viewBox', '110 110 710 490');
    gsap.set([ly[0], ly[1], ly[2], ly[3], ly[4], ly[6]], { autoAlpha: 0, y: -70 });
    gsap.set(ly[5], { autoAlpha: 1, y: 0 });
    gsap.set(cps, { autoAlpha: 0, y: -40 });
    gsap.set(lbl, { autoAlpha: 0, x: -16 });
    gsap.set(rain, { autoAlpha: 0, y: -120 });
    gsap.set(water, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(sec.querySelectorAll('.scene__head > *'), { autoAlpha: 0, y: 24 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(sec.querySelectorAll('.scene__head > *'), { autoAlpha: 1, y: 0, duration: .4, stagger: .06 }, 0);
    var marks = [];
    [0, 1, 2, 3, 4].forEach(function (i) {
      var t = .3 + i * .8; marks.push(t);
      tl.to(ly[i], { autoAlpha: 1, y: 0, duration: .6 }, t);
      tl.to(lbl[i], { autoAlpha: 1, x: 0, duration: .4 }, t + .2);
    });
    var tc = .3 + 5 * .8; marks.push(tc);
    tl.to(cps, { autoAlpha: 1, y: 0, duration: .35, stagger: .06 }, tc);
    tl.to(lbl[5], { autoAlpha: 1, x: 0, duration: .4 }, tc + .2);
    var tg = tc + 1.2; marks.push(tg);
    tl.to(ly[6], { autoAlpha: 1, y: 0, duration: .6 }, tg);
    tl.to(lbl[6], { autoAlpha: 1, x: 0, duration: .4 }, tg + .2);
    tl.to(rain, { autoAlpha: 1, duration: .2, stagger: .01 }, tg + .6);
    tl.to(rain, { y: 260, duration: 1.2, ease: 'none', stagger: .02 }, tg + .6);
    tl.to(water, { scaleY: 1, duration: .8 }, tg + 1.1);
    tl.to({}, { duration: .3 });
    var total = tl.duration(), last = -1;
    function upd(self) {
      var t = self.progress * total, n = 0;
      marks.forEach(function (m, i) { if (t >= m) n = i; });
      if (n === last) return; last = n;
      capN.textContent = '0' + (n + 1);
      cap.textContent = CAPS[n];
      chips.forEach(function (c, i) { c.classList.toggle('is-on', i <= n); });
    }
    upd({ progress: 0 });
    ScrollTrigger.create({
      animation: tl, trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%',
      pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: upd, onToggle: function (s) { scenePinned = s.isActive; bar(); }
    });
    return function () { svg.setAttribute('viewBox', '0 0 820 600'); gsap.set([].slice.call(ly).concat([].slice.call(lbl), [].slice.call(cps), [].slice.call(rain), [water]), { clearProps: 'all' }); };
  }
})();
