/* BT Costruzioni: hero hand of cards (CSS entrance on the first frame), header, menu, anchors, reveals, count-up,
   accordion, drag strip, magnetic buttons, phone bar, form, method line and the GSAP signature scene: TORINO cut out
   of a graphite layer; the scroll flies through the stroke of the I until the building site photo fills the screen. */
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
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * .75);
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

  /* count-up (years in business, sourced) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) return;
    el.textContent = '0';
    reveal([el], function () {
      var t0 = null;
      var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  });

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it, i, all) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('[data-drag]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('mousedown', function (e) { down = true; moved = 0; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); moved = e.pageX - sx; strip.scrollLeft = sl - moved; });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* GSAP */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    maskScene(window.innerWidth < 701);
    lineScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function maskScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var svg = sec.querySelector('[data-mask]'), txt = svg.querySelector('.mtext'), copy = sec.querySelector('.scene__copy'), photo = sec.querySelector('.scene__photo img');
    // origin = centre of the I's stroke, in screen px of the section
    var origin = function () {
      try {
        var box = txt.getExtentOfChar(3), r = svg.getBoundingClientRect();
        var ctm = txt.getScreenCTM(), p = svg.createSVGPoint();
        p.x = box.x + box.width / 2; p.y = box.y + box.height * .55;
        var s = p.matrixTransform(ctm);
        return (s.x - r.left) + 'px ' + (s.y - r.top) + 'px';
      } catch (e) { return '50% 50%'; }
    };
    gsap.set(svg, { transformOrigin: origin() });
    var tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=130%' : '+=200%', pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
        onRefresh: function () { gsap.set(svg, { transformOrigin: origin() }); } }
    });
    tl.fromTo(svg, { scale: 1 }, { scale: small ? 26 : 24, ease: 'power2.in', duration: .7 }, .06)
      .fromTo(photo, { scale: 1.25 }, { scale: 1, ease: 'none', duration: .76 }, 0)
      .to(svg, { opacity: 0, duration: .08 }, .68)
      .to(copy, { opacity: 1, y: 0, duration: .16, ease: 'power2.out' }, .74)
      .to({}, { duration: .1 });
  }

  function lineScene() {
    var w = d.querySelector('[data-steps]');
    if (!w || window.matchMedia('(max-width: 980px)').matches) return;
    gsap.fromTo(w.querySelector('[data-line]'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: w, start: 'top 75%', end: 'top 30%', scrub: .5 } });
  }
})();
