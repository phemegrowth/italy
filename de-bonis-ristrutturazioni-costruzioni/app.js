/* De Bonis Ristrutturazioni: hero entrance (5,0 rises, stars pop, headline lines, doorway photo opens and drifts), header,
   phone menu, anchors, reveals, services accordion that drives the photo, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: before / structure / finished scrub on their own shop job, with a moving wipe line. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

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
    header.classList.toggle('menu-open', open);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : 64);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
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

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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

  /* services accordion drives the photo */
  var acc = d.querySelector('[data-acc]'), pics = d.querySelectorAll('.svc__pics img');
  if (acc) {
    var items = acc.querySelectorAll('.acc__it');
    var set = function (it) {
      items.forEach(function (x) { var on = x === it; x.classList.toggle('is-on', on); x.querySelector('button').setAttribute('aria-expanded', on ? 'true' : 'false'); });
      var k = +it.getAttribute('data-img');
      pics.forEach(function (p, i) { p.classList.toggle('is-on', i === k); });
    };
    items.forEach(function (it) {
      it.querySelector('button').addEventListener('click', function () { set(it); });
      if (window.matchMedia('(hover: hover)').matches) it.addEventListener('mouseenter', function () { set(it); });
    });
  }

  /* GSAP signature scene: before / structure / finished */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) { html.classList.add('scene-static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return scene(false); });
    mm.add('(max-width: 699px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var l2 = sec.querySelector('[data-l2]'), l3 = sec.querySelector('[data-l3]'), line = sec.querySelector('[data-line]');
    var caps = sec.querySelectorAll('.caps li'), tags = sec.querySelectorAll('.ba__tags li');
    var w = { a: 100, b: 100 }, last = -1;
    var paint = function () {
      l2.style.clipPath = 'inset(0 0 0 ' + w.a + '%)';
      l3.style.clipPath = 'inset(0 0 0 ' + w.b + '%)';
      var x = w.b < 100 ? w.b : w.a;
      line.style.left = x + '%';
      line.style.opacity = (x > 0.5 && x < 99.5) ? 1 : 0;
      var i = w.b < 50 ? 2 : w.a < 50 ? 1 : 0;
      if (i !== last) { last = i; caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); }); tags.forEach(function (c, k) { c.classList.toggle('is-on', k === i); }); }
    };
    var tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: paint });
    tl.to({}, { duration: .3 });
    tl.to(w, { a: 0, duration: 1, ease: 'power1.inOut' });
    tl.to({}, { duration: .35 });
    tl.to(w, { b: 0, duration: 1, ease: 'power1.inOut' });
    tl.to({}, { duration: .3 });
    paint();
    var stt = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { stt.kill(); tl.kill(); [l2, l3].forEach(function (l) { l.style.clipPath = ''; }); line.style.cssText = ''; };
  }
})();
