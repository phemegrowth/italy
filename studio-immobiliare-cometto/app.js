/* Studio Immobiliare Cometto: header, full-screen menu, anchors, reveals, accordion, count-up, timeline line,
   phone contact bar, form validation, and the GSAP signature scene (catalogue 3, text-mask fly-through:
   NOVARA is cut out of a navy layer, the scroll flies through the V into the city, then the quarters rise). */
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
    d.body.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (already-visible elements show at once) */
  function reveal(els, cb, margin) {
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
    }, { rootMargin: margin || '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * .9) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });
  reveal(d.querySelectorAll('.tl'), function (el) { el.classList.add('is-drawn'); }, '0px 0px -25% 0px');

  /* count-up (years in business only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  /* accordion */
  d.querySelectorAll('.acc__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.acc__item'), open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* phone contact bar: after the hero, hidden in the scene and in the contact section */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), sceneEl = d.querySelector('.scene'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    var sr = sceneEl.getBoundingClientRect(), inScene = sr.top < 2 && sr.bottom > window.innerHeight - 2;
    pbar.classList.toggle('is-on', past && !scenePinned && !inScene && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sulla vostra richiesta.' };
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
  var sec = sceneEl, stage = sec.querySelector('.scene__stage'), svg = sec.querySelector('.scene__mask'), word = sec.querySelector('.mword');
  var photo = sec.querySelector('.scene__photo'), intro = sec.querySelector('.scene__intro'), out = sec.querySelector('.scene__out');
  var zones = sec.querySelectorAll('.zones li'), outH = out.querySelector('h2');
  function staticScene() { sec.classList.add('scene--static'); }

  /* size the word to the stage and return the fly-through point (inside the V, near its base) */
  function layout() {
    var w = stage.clientWidth, h = stage.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    word.setAttribute('font-size', 200);
    word.style.fontSize = '200px';
    word.style.letterSpacing = '-4px';
    word.setAttribute('x', w / 2);
    var len = word.getComputedTextLength() || 1;
    var fs = Math.min(200 * (w * (w < 700 ? .92 : .82)) / len, h * .42);
    var y = h * (w < 700 ? .56 : .6);
    word.setAttribute('font-size', fs.toFixed(1));
    word.style.fontSize = fs.toFixed(1) + 'px';
    word.setAttribute('y', y.toFixed(1));
    try { var bb = word.getBBox(); word.setAttribute('x', (w / 2 + (w / 2 - (bb.x + bb.width / 2))).toFixed(1)); } catch (e) {}
    var ox = w / 2, oy = y - fs * .1;
    try {
      var c = word.getExtentOfChar(2);
      ox = c.x + c.width / 2;
    } catch (e) {}
    return { x: ox, y: oy };
  }

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { staticScene(); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return build(false); });
    mm.add('(max-width: 760px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var o = layout();
    gsap.set(svg, { transformOrigin: o.x + 'px ' + o.y + 'px', scale: 1, opacity: 1 });
    gsap.set(photo, { scale: 1.3 });
    gsap.set(out, { opacity: 0 });
    gsap.set(outH, { y: 40 });
    gsap.set(zones, { opacity: 0, y: 24 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%', pin: stage, scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: function () { var p = layout(); gsap.set(svg, { transformOrigin: p.x + 'px ' + p.y + 'px' }); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(intro, { opacity: 0, y: -30, duration: 0.12 }, 0.06)
      .to(svg, { scale: small ? 46 : 38, duration: 0.56, ease: 'power3.in' }, 0.1)
      .to(photo, { scale: 1, duration: 0.7, ease: 'power1.out' }, 0.1)
      .to(svg, { opacity: 0, duration: 0.06 }, 0.6)
      .to(out, { opacity: 1, duration: 0.08 }, 0.68)
      .to(outH, { y: 0, duration: 0.12, ease: 'power2.out' }, 0.68)
      .to(zones, { opacity: 1, y: 0, duration: 0.08, stagger: 0.012, ease: 'power2.out' }, 0.74)
      .to({}, { duration: 0.08 });
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([svg, photo, intro, out, outH, zones], { clearProps: 'all' });
    };
  }
})();
