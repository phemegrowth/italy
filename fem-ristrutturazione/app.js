/* FEM Ristrutturazione, Torino: curtain hero entrance, header, full-screen phone menu, anchors, reveals,
   services photo follows the active item, drag strip of their own photos, steps line, magnetic buttons, phone bar, form,
   and the GSAP signature scene: a floor section that builds up layer by layer with scroll (slab, insulation,
   radiant pipes, screed, waterproofing, adhesive, tile), with a 01/07 meter and the layer list. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var y = d.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var sy = window.scrollY;
    header.classList.toggle('is-small', sy > 30);
    if (mbar) mbar.classList.toggle('is-on', sy > hero.offsetHeight - 120);
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.classList.contains('scene') ? 0 : header.offsetHeight - 1);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: hover, or the item nearest the middle of the screen, picks the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
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
      var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.35) showPic(best.getAttribute('data-for'), best);
    });
  }, { passive: true });

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('mousedown', function (e) { down = true; moved = false; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* steps: line draws with scroll, dots light up */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.steps__it');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
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
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Raccontateci in due righe il lavoro.' };
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
    var req = form.querySelectorAll('[required]');
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); f.addEventListener('input', function () { if (f.closest('.field').classList.contains('has-err')) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* signature scene: the floor builds up with scroll */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var lys = scene.querySelectorAll('.sec__ly'), lis = scene.querySelectorAll('.layers li');
  var count = scene.querySelector('.scene__count b'), bar = scene.querySelector('.scene__bar i');
  var n = lys.length;
  function setState(p) {
    var k = Math.max(0, Math.min(n - 1, Math.floor(p * n * 0.999 + 0.02)));
    lis.forEach(function (li, i) { li.classList.toggle('is-on', i <= k); li.classList.toggle('is-now', i === k); });
    count.textContent = String(k + 1).padStart(2, '0');
    bar.style.transform = 'scaleX(' + Math.max(0.02, p).toFixed(3) + ')';
  }
  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', wide: '(min-width: 701px)' }, function (c) {
      var phone = c.conditions.phone;
      gsap.set([].slice.call(lys, 1), { yPercent: -60, y: -40, opacity: 0 });
      gsap.set(scene.querySelectorAll('.sec__ly--tubi i'), { scale: 0 });
      gsap.set(scene.querySelector('.sec__top'), { opacity: 0 });
      var tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: phone ? '+=140%' : '+=240%', pin: scene.querySelector('.scene__pin'), scrub: 0.6,
          onUpdate: function (s) { setState(s.progress); }
        }
      });
      lys.forEach(function (ly, i) {
        var at = i - 0.6;
        if (i > 0) tl.to(ly, { yPercent: 0, y: 0, opacity: 1, duration: 0.8 }, at);
        if (ly.classList.contains('sec__ly--tubi')) tl.to(ly.querySelectorAll('i'), { scale: 1, duration: 0.5, stagger: 0.04, ease: 'back.out(2)' }, at + 0.3);
        if (ly.classList.contains('sec__ly--tile')) tl.from(ly.querySelectorAll('i'), { y: -50, opacity: 0, duration: 0.5, stagger: 0.12 }, at);
      });
      tl.to(scene.querySelector('.sec__top'), { opacity: 1, duration: 0.4 }, n - 0.8);
      tl.to({}, { duration: 0.6 });
      setState(0);
      return function () { gsap.set(lys, { clearProps: 'all' }); };
    });
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () {
    build();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
