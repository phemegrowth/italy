/* Garavaglia studio immobiliare: hero type-first entrance (CSS, first frame), header, menu, anchors, reveals,
   count-up, magnetic buttons, phone bar, form, process line, hero strip drift and the GSAP signature scene:
   the word VARESE cut out of the page; scrolling flies through the stem of the R into the garden photo. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * .7);
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 60), behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up (sourced numbers only: Google rating and review count) */
  function count(el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1200;
    el.textContent = fmt(0);
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), count);

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

  /* GSAP */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var small = window.innerWidth < 701;
    drift(small);
    maskScene(small);
    lineScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.load) Promise.all([d.fonts.ready, d.fonts.load('600 100px Vollkorn')]).then(start, start);
  else window.addEventListener('load', start);

  function drift(small) {
    var s = d.querySelector('[data-drift]');
    if (!s) return;
    gsap.to(s, { x: small ? -140 : -260, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .4 } });
  }

  /* VARESE mask: an SVG the size of the stage, the word cut out of a ground-coloured layer.
     The zoom origin is measured on a canvas: the middle of the R's stem at mid cap height. */
  function maskScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var stage = sec.querySelector('.scene__stage'), holder = sec.querySelector('[data-mask]');
    var img = sec.querySelector('.scene__img img'), panel = sec.querySelector('[data-panel]');
    var caps = sec.querySelectorAll('[data-cap]');
    var WORD = 'VARESE', FONT = '600 {s}px Vollkorn, Georgia, serif';

    function build() {
      var w = stage.clientWidth, h = stage.clientHeight;
      var c = d.createElement('canvas'), x = c.getContext('2d');
      c.width = w; c.height = h;
      x.font = FONT.replace('{s}', 100);
      var per = x.measureText(WORD).width / 100;
      var fs = Math.round(Math.min(w * (small ? .9 : .78) / per, h * .42));
      x.font = FONT.replace('{s}', fs);
      var m = x.measureText(WORD), capH = x.measureText('R').actualBoundingBoxAscent || fs * .68;
      var base = Math.round(h * (small ? .64 : .52) + capH / 2);
      var left = w / 2 - m.width / 2;
      x.fillStyle = '#000'; x.textBaseline = 'alphabetic';
      x.fillText(WORD, left, base);
      var rx = left + x.measureText('VA').width, rw = x.measureText('R').width;
      var row = Math.round(base - capH * .5), data = x.getImageData(0, row, w, 1).data;
      var a = -1, b = -1;
      for (var i = Math.floor(rx); i < rx + rw; i++) {
        var on = data[i * 4 + 3] > 128;
        if (on && a < 0) a = i;
        if (!on && a >= 0) { b = i; break; }
      }
      var ox = a >= 0 ? (a + (b > a ? b : a + 2)) / 2 : rx + rw * .16;
      var ns = 'http://www.w3.org/2000/svg';
      holder.innerHTML = '<svg xmlns="' + ns + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
        '<defs><mask id="vmask" maskUnits="userSpaceOnUse" x="0" y="0" width="' + w + '" height="' + h + '">' +
        '<rect width="' + w + '" height="' + h + '" fill="white"/>' +
        '<text x="' + left.toFixed(1) + '" y="' + base + '" font-family="Vollkorn, Georgia, serif" font-weight="600" font-size="' + fs + '" fill="#000">' + WORD + '</text>' +
        '</mask></defs><rect width="' + w + '" height="' + h + '" fill="#f5f7f5" mask="url(#vmask)"/></svg>';
      holder.style.transformOrigin = ox.toFixed(1) + 'px ' + row + 'px';
      var stem = b > a ? b - a : 6;
      return Math.max(24, Math.min(90, (w * 1.6) / stem));
    }

    var S = build();
    gsap.set(panel, { y: 70, autoAlpha: 0 });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%',
        pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
        onRefresh: function () { S = build(); }
      }
    });
    tl.to(caps, { autoAlpha: 0, duration: .08 }, 0)
      .fromTo(holder, { scale: 1 }, { scale: function () { return S; }, ease: 'power3.in', duration: .66 }, .06)
      .to(holder, { autoAlpha: 0, duration: .06 }, .66)
      .fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none', duration: .74 }, 0)
      .to(panel, { y: 0, autoAlpha: 1, ease: 'power2.out', duration: .16 }, .76)
      .to({}, { duration: .08 });
  }

  function lineScene() {
    var w = d.querySelector('[data-steps]');
    if (!w) return;
    var i = w.querySelector('[data-line]');
    var vertical = window.matchMedia('(max-width: 980px)').matches;
    gsap.fromTo(i, vertical ? { scaleY: 0, scaleX: 1 } : { scaleX: 0 }, {
      scaleX: 1, scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: w, start: 'top 75%', end: vertical ? 'bottom 60%' : 'top 30%', scrub: .5 }
    });
  }
})();
