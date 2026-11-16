/* Edil Lario Cad: hero entrance (Ken Burns + line reveal), header, phone menu, anchors, reveals, count-ups, work list photo swap,
   drag strip, process line, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a road cross-section that builds up layer by layer as you scroll (terrain, foundation, base, binder, wearing course, markings). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js', 'no-st');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.8);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60;
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

  /* count-ups: sourced quantities only */
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1300;
    el.textContent = '0';
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), countUp);

  /* work list: the line nearest the middle of the screen (or hovered) drives the photo */
  var wls = d.querySelectorAll('.wl'), pics = d.querySelectorAll('.work__pics img');
  function setPic(i) {
    pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
    wls.forEach(function (w, k) { w.classList.toggle('is-act', k === i); });
  }
  function workScroll() {
    var mid = window.innerHeight * 0.55, best = 0, bd = 1e9;
    wls.forEach(function (w, k) { var r = w.getBoundingClientRect(); var dd = Math.abs(r.top + r.height / 2 - mid); if (dd < bd) { bd = dd; best = k; } });
    setPic(best);
  }
  window.addEventListener('scroll', workScroll, { passive: true });
  wls.forEach(function (w, k) { w.addEventListener('mouseenter', function () { setPic(k); }); });
  workScroll();

  /* drag strip */
  var strip = d.querySelector('[data-drag]'), sbar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); } strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    var sp = function () { var m = strip.scrollWidth - strip.clientWidth; var p = m > 0 ? strip.scrollLeft / m : 1; if (sbar) sbar.style.transform = 'scaleX(' + (0.2 + p * 0.8).toFixed(3) + ')'; };
    strip.addEventListener('scroll', sp, { passive: true });
    sp();
  }

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

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

  /* GSAP signature scene: the road section builds up with the scroll */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.remove('no-st');
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return build(false); });
    mm.add('(max-width: 699px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var lys = sec.querySelectorAll('.ly'), tgs = sec.querySelectorAll('.tg'), caps = sec.querySelectorAll('.scene__caps li'),
        cur = sec.querySelector('[data-cur]'), bar = sec.querySelector('[data-bar]'), n = lys.length, last = -1,
        svg = sec.querySelector('svg.road'), ghost = sec.querySelector('.ghost');
    svg.setAttribute('viewBox', svg.getAttribute(small ? 'data-vb-small' : 'data-vb-wide'));
    gsap.set(lys, { yPercent: 0, y: -160, opacity: 0 });
    gsap.set(tgs, { opacity: 0, x: 20 });
    gsap.set(bar, { scaleX: 0 });
    gsap.set(ghost, { strokeDasharray: '8 7', opacity: 1 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(ghost, { opacity: .35, duration: n * 1.1 }, 0);
    lys.forEach(function (ly, i) {
      tl.to(ly, { y: 0, opacity: 1, duration: 1 }, i * 1.1);
      if (tgs[i]) tl.to(tgs[i], { opacity: 1, x: 0, duration: .5 }, i * 1.1 + .6);
    });
    tl.to(bar, { scaleX: 1, ease: 'none', duration: n * 1.1 + .4 }, 0);
    var set = function (p) {
      var i = Math.min(n - 1, Math.floor(p * n * 0.999 + 0.12));
      if (i === last) return; last = i;
      caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
      if (cur) cur.textContent = '0' + (i + 1);
    };
    set(0);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onUpdate: function (s) { set(s.progress); }
    });
    return function () { st.kill(); tl.kill(); svg.setAttribute('viewBox', svg.getAttribute('data-vb-wide')); gsap.set(ghost, { clearProps: 'all' }); gsap.set(lys, { clearProps: 'all' }); gsap.set(tgs, { clearProps: 'all' }); gsap.set(bar, { clearProps: 'all' }); };
  }
})();
