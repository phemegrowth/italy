/* Eco Casa: hero curtain (teal panel wipes up, house mark turns in), line reveal, header, menu, anchors, reveals,
   marquee, process line, magnetic buttons, sticky phone bar, form validation, and the GSAP signature scene:
   "Da cima a fondo", the word CASA cut out of a teal layer; scroll flies through a letter stroke into the renovated kitchen. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header');
  var bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / (r.height)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
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
    flyScene(window.innerWidth < 861);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function flyScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var word = sec.querySelector('.fly__word'), text = sec.querySelector('.fly__text');
    var photo = sec.querySelector('.fly__photo'), mask = sec.querySelector('.fly__mask');
    var intro = sec.querySelector('.fly__intro'), out = sec.querySelector('.fly__out');

    /* find a point inside a letter stroke, near the middle of the word (canvas copy of the SVG text) */
    var ox = 500, oy = 470;
    try {
      var c = d.createElement('canvas'); c.width = 1000; c.height = 1000;
      var x = c.getContext('2d');
      var cs = getComputedStyle(text);
      x.font = '800 ' + cs.fontSize + ' Unbounded';
      if ('letterSpacing' in x) x.letterSpacing = cs.letterSpacing;
      x.textAlign = 'center'; x.fillStyle = '#000';
      x.fillText('CASA', 500, 560);
      var data = x.getImageData(0, 0, 1000, 1000).data, best = 1e9;
      var fs = parseFloat(getComputedStyle(text).fontSize) || 300;
      for (var yy = Math.round(560 - fs * .7); yy <= 550; yy += 4) {
        var run = -1;
        for (var xx = 150; xx <= 850; xx++) {
          var on = data[(yy * 1000 + xx) * 4 + 3] > 200;
          if (on && run < 0) run = xx;
          if ((!on || xx === 850) && run >= 0) {
            var mid = (run + xx) / 2, w = xx - run;
            var dd = Math.abs(mid - 500) + Math.abs(yy - (560 - fs * .36)) * .5 - w * .8;
            if (w > 24 && dd < best) { best = dd; ox = mid; oy = yy; }
            run = -1;
          }
        }
      }
    } catch (e) {}

    gsap.set(out, { autoAlpha: 0, y: 40 });
    gsap.set(photo, { scale: 1.18 });
    var tl = gsap.timeline();
    tl.to(intro, { autoAlpha: 0, duration: .3 }, .4)
      .to(word, { scale: small ? 34 : 28, svgOrigin: ox + ' ' + oy, ease: 'power3.in', duration: 2 }, 0)
      .to(photo, { scale: 1, ease: 'none', duration: 2.6 }, 0)
      .to(mask, { autoAlpha: 0, duration: .25 }, 1.85)
      .to(out, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, 2.1)
      .to({}, { duration: .5 });
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
  }
})();
