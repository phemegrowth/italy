/* Edil San Marco: header, full-screen menu, anchors, reveals, services accordion with swapping photo,
   drag strip, step line, phone contact bar, form validation, and the GSAP signature scene
   (catalogue 2, exploded floors: one building photo sliced into five bands that pull apart with scroll,
   each band labelled from the foundations up). */
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
  reveal(d.querySelectorAll('.steps__line'), function (el) { el.classList.add('is-drawn'); }, '0px 0px -25% 0px');

  /* services accordion: one open at a time, the photo follows */
  var items = d.querySelectorAll('.acc__item'), pics = d.querySelectorAll('.svc__pic img');
  function openItem(k) {
    items.forEach(function (it, j) {
      var on = j === k;
      it.classList.toggle('is-open', on);
      it.querySelector('button').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    var img = +items[k].querySelector('button').getAttribute('data-img');
    pics.forEach(function (p, j) { p.classList.toggle('is-on', j === img); });
  }
  items.forEach(function (it, j) {
    it.querySelector('button').addEventListener('click', function () { openItem(j); });
  });

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }

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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul progetto.' };
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

  /* GSAP signature scene: exploded floors */
  var sec = sceneEl, slices = sec.querySelectorAll('.ex__s'), labs = sec.querySelectorAll('.ex__labels li'), count = sec.querySelector('[data-count]');
  function staticScene() { sec.classList.add('scene--static'); labs.forEach(function (l) { l.classList.add('is-on'); }); count.textContent = '05'; }
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
    var g = small ? 12 : 24, bld = sec.querySelector('.ex__bld');
    var order = [4, 3, 2, 1, 0]; /* foundations first */
    function setStep(k) {
      labs.forEach(function (l, j) { l.classList.toggle('is-on', order.indexOf(j) <= k); });
      count.textContent = '0' + (k + 1);
      sec.classList.toggle('is-split', k >= 1);
    }
    gsap.set(bld, { clipPath: 'inset(12% 14% 12% 14%)' });
    gsap.set(slices, { y: 0 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=125%' : '+=240%', pin: sec.querySelector('.scene__stage'), scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setStep(p < 0.2 ? 0 : p < 0.38 ? 1 : p < 0.56 ? 2 : p < 0.74 ? 3 : 4); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(bld, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16, ease: 'power2.out' }, 0);
    /* each band leaves its neighbours in turn, from the foundations up */
    order.forEach(function (i, k) {
      tl.to(slices[i], { y: (i - 2) * g, duration: 0.14, ease: 'power1.inOut' }, 0.16 + k * 0.13);
    });
    tl.to({}, { duration: 0.12 });
    setStep(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([bld, slices], { clearProps: 'all' });
    };
  }
})();
