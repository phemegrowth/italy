/* ColorLux: hero D (four colour cards fly out of the stack into a collage, two paint chips land last), header,
   menu, anchors, reveals, marquee proof strip (CSS), service list that swaps the photo, drag strip, process line,
   sticky phone bar, form validation, and the GSAP signature scene "La mazzetta colori": pinned, scroll opens a
   colour fan deck card by card and a roller repaints the drawn room in each colour (Bianco, Salvia, Ottanio, Ocra,
   Corallo) with a caption per colour. Phone: room on top, deck and caption side by side below, shorter pin. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  /* services: the active row (hover on desktop, scroll position everywhere) swaps the photo */
  var rows = d.querySelectorAll('.svc__list li'), pics = d.querySelectorAll('.svc__photo img');
  function act(k) {
    rows.forEach(function (r) { r.classList.toggle('is-act', r.getAttribute('data-k') === String(k)); });
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-k') === String(k)); });
  }
  rows.forEach(function (r) { r.addEventListener('mouseenter', function () { act(r.getAttribute('data-k')); }); });
  function svcScroll() {
    var mid = window.innerHeight * 0.5, best = null;
    rows.forEach(function (r) { var b = r.getBoundingClientRect(); if (b.top < mid) best = r; });
    if (best) act(best.getAttribute('data-k'));
  }
  window.addEventListener('scroll', svcScroll, { passive: true });
  svcScroll();

  /* drag to scroll the gallery strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { s.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { s.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

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
    scene(window.innerWidth < 701);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var walls = sec.querySelectorAll('[data-wall]'), roller = sec.querySelector('[data-roller]');
    var cards = sec.querySelectorAll('[data-card]'), caps = sec.querySelectorAll('.tint__caps li');
    var count = sec.querySelector('[data-count]'), name = sec.querySelector('[data-name]');
    var names = ['Bianco', 'Salvia', 'Ottanio', 'Ocra', 'Corallo'];
    var spread = small ? [-22, -11, 0, 11, 22] : [-36, -18, 0, 18, 36], last = -1;
    function set(k) {
      if (k === last) return;
      last = k;
      caps.forEach(function (c, i) { c.classList.toggle('is-act', i === k); });
      cards.forEach(function (c, i) { c.classList.toggle('is-act', i === k); });
      count.textContent = '0' + (k + 1);
      name.textContent = names[k];
    }
    gsap.set(cards, { rotation: 0, y: 30, opacity: 0 });
    gsap.set(walls, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(roller, { opacity: 0, y: 0 });
    var seg = 0.19;
    var tl = gsap.timeline({
      onUpdate: function () {
        var p = tl.time();
        set(p < 0.17 ? 0 : Math.min(4, 1 + Math.floor((p - 0.17) / seg)));
      },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%',
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true
      }
    });
    // the deck opens: cards rise and fan out one by one
    cards.forEach(function (c, i) {
      tl.to(c, { opacity: 1, y: 0, rotation: spread[i], duration: 0.1, ease: 'power2.out' }, 0.02 + i * 0.025);
    });
    // the roller repaints the wall, one colour per segment
    walls.forEach(function (w, i) {
      var t0 = 0.16 + i * seg;
      tl.set(roller, { opacity: 1, y: 0 }, t0)
        .to(w, { scaleY: 1, duration: seg * 0.8, ease: 'none' }, t0)
        .to(roller, { y: 372, duration: seg * 0.8, ease: 'none' }, t0)
        .set(roller, { opacity: 0 }, t0 + seg * 0.8);
      tl.to(cards[i + 1], { y: -14, duration: seg * 0.3 }, t0)
        .to(cards[i + 1], { y: 0, duration: seg * 0.3 }, t0 + seg * 0.7);
    });
    tl.to({}, { duration: 0.05 });
    set(0);
  }
})();
