/* Elmo Bianchini: hero entrance (grid and frame draw, their photo is revealed inside the frame, headline lines rise),
   header, full-screen menu, anchors, reveals, accordion, count-up, places line, magnetic buttons, phone bar, form,
   and the GSAP signature scene: a mosaic laid tessera by tessera with scroll (drawing, border, field, their pebble, grout and polish). */
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
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 160);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('is-menu', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 57, behavior: reduce ? 'auto' : 'smooth' });
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

  /* count-up (quantities only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    el.textContent = '0';
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1400);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it, i, all) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* places: the line runs from Udine downwards with scroll */
  var places = d.querySelector('[data-places]');
  if (places) {
    var pls = places.querySelectorAll('.pl');
    var drawP = function () {
      var r = places.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height * 0.9)));
      places.style.setProperty('--p', p.toFixed(3));
      pls.forEach(function (li, i) { li.classList.toggle('is-lit', p >= i / (pls.length - 1) - 0.02); });
    };
    window.addEventListener('scroll', drawP, { passive: true });
    window.addEventListener('resize', drawP);
    drawP();
  }

  /* magnetic buttons */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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
    var mm = gsap.matchMedia();
    mm.add('(max-width: 1023px)', function () { return mosaic(true); });
    mm.add('(min-width: 1024px)', function () { return mosaic(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mosaic(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var num = sec.querySelector('[data-tiles]'), lis = q('.phases li');
    var C = 270;
    function pos(el) { return { x: +el.getAttribute('x'), y: +el.getAttribute('y') }; }
    var g1 = q('.m-g1 .m-t').sort(function (a, b) {
      var ra = +a.getAttribute('data-r'), rb = +b.getAttribute('data-r');
      if (ra !== rb) return ra - rb;
      var pa = pos(a), pb = pos(b);
      return Math.atan2(pa.y - C, pa.x - C) - Math.atan2(pb.y - C, pb.x - C);
    });
    var g2 = q('.m-g2 .m-t').sort(function (a, b) { var pa = pos(a), pb = pos(b); return (pa.y - pb.y) || (pa.x - pb.x); });
    var g3 = q('.m-g3 .m-t').sort(function (a, b) { return pos(b).y - pos(a).y; });
    var vl = q('.m-gl--v'), hl = q('.m-gl--h'), guide = q('.m-guide'), grid = q('.m-grid'), sheen = q('.m-sheen');
    var total = g1.length + g2.length + g3.length;

    gsap.set(vl, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(hl, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(guide, { autoAlpha: 0 });
    gsap.set(sheen, { x: 0 });
    var grout = q('.m-grout');
    gsap.set(grout, { autoAlpha: 0, scale: .92, transformOrigin: '50% 50%' });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, 0, 1.2, 4.0, 6.8, 8.6];
    function lay(tiles, t0, span) {
      tl.from(tiles, { autoAlpha: 0, y: function () { return gsap.utils.random(-90, -30); }, x: function () { return gsap.utils.random(-24, 24); }, rotation: function () { return '+=' + gsap.utils.random(-35, 35); }, scale: 1.35, transformOrigin: '50% 50%', duration: .45, stagger: span / tiles.length, ease: 'power3.out', immediateRender: true }, t0);
    }
    tl.to(grout, { autoAlpha: 1, scale: 1, duration: .5 }, 0)
      .to(vl, { scaleY: 1, duration: .8, stagger: .02, ease: 'power1.inOut' }, .05)
      .to(hl, { scaleX: 1, duration: .8, stagger: .02, ease: 'power1.inOut' }, .2)
      .to(guide, { autoAlpha: 1, duration: .4 }, .7);
    lay(g1, 1.2, 2.4);
    lay(g2, 4.0, 2.3);
    lay(g3, 6.8, 1.3);
    tl.to(grid, { autoAlpha: 0, duration: .6 }, 7.6)
      .to(guide, { autoAlpha: 0, duration: .4 }, 8.2)
      .to(sheen, { x: 1100, duration: 1.6, ease: 'power1.inOut' }, 8.7)
      .to({}, { duration: .5 }, 10.3);

    var spans = [[1.2, 2.4, g1.length], [4.0, 2.3, g2.length], [6.8, 1.3, g3.length]];
    var lastS = -1, lastN = -1;
    function sync() {
      var t = tl.time(), n = 0, s = 1;
      spans.forEach(function (sp) { var p = Math.max(0, Math.min(1, (t - sp[0]) / (sp[1] + .2))); n += Math.round(p * sp[2]); });
      for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
      if (n !== lastN) { lastN = n; num.textContent = n; }
      if (s !== lastS) { lastS = s; lis.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); }); }
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
    return function () { st.kill(); tl.progress(1).kill(); gsap.set([vl, hl, guide, sheen, grid, grout], { clearProps: 'all' }); num.textContent = total; };
  }
})();
