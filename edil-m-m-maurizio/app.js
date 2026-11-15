/* Edil M.M.: hero entrance (arch photo unmask, line reveal) with slow photo parallax, header, menu, anchors, reveals,
   photo strip with drag, sticky phone bar, form validation, and the GSAP signature scene "Dentro la parete di un bagno":
   with scroll the hot and cold pipes draw, the masonry rises over them, the waterproofing sweeps across, the tiles and
   fixtures close the wall. Each layer lights its label (desktop list, phone caption). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
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
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); if (id === '#top' && a.getAttribute('aria-disabled') !== 'true') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
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

  /* review strip: mouse drag (touch scrolls natively) */
  var strip = d.querySelector('.strip');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
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

  /* hero photo parallax: moves slower than the page */
  var hp = d.querySelector('.hero__frame img');
  if (hp && !reduce) {
    var tk = false;
    window.addEventListener('scroll', function () {
      if (tk) return; tk = true;
      requestAnimationFrame(function () { tk = false; var y = window.scrollY; if (y < window.innerHeight * 1.2) hp.style.transform = 'translate3d(0,' + (-y * 0.12).toFixed(1) + 'px,0)'; });
    }, { passive: true });
  }

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
    var pipes = sec.querySelectorAll('.pipe'), fits = sec.querySelectorAll('.fit');
    var rb = sec.querySelector('.cr--b'), rs = sec.querySelector('.cr--s'), rt = sec.querySelector('.cr--t');
    var items = sec.querySelectorAll('.layers li'), phase = sec.querySelector('[data-phase]'), now = sec.querySelector('[data-now]');
    var names = ['Impianto: acqua calda e fredda', 'Muratura e tracce chiuse', 'Impermeabilizzazione', 'Rivestimento e sanitari'];
    pipes.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(fits, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(rb, { attr: { y: 460, height: 0 } });
    gsap.set(rs, { attr: { width: 0 } });
    gsap.set(rt, { attr: { y: 460, height: 0 } });

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(pipes, { strokeDashoffset: 0, duration: 1.4, stagger: .12, ease: 'power1.inOut' }, 0)
      .to(fits, { scale: 1, duration: .3, stagger: .05, ease: 'back.out(2)' }, 1.3)
      .to(rb, { attr: { y: 20, height: 440 }, duration: 1.4, ease: 'power1.inOut' }, 2.1)
      .to(rs, { attr: { width: 360 }, duration: 1.1, ease: 'power1.inOut' }, 3.8)
      .to(rt, { attr: { y: 20, height: 440 }, duration: 1.4, ease: 'power1.inOut' }, 5.2)
      .to({}, { duration: .5 });
    var at = [0, 2.1, 3.8, 5.2], last = -1;
    function sync() {
      var t = tl.time(), c = 0;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) c = k;
      if (c === last) return;
      last = c;
      items.forEach(function (it, i) { it.classList.toggle('is-on', i <= c); it.classList.toggle('is-now', i === c); });
      phase.textContent = '0' + (c + 1);
      now.textContent = names[c];
    }
    tl.eventCallback('onUpdate', sync);
    sync();
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
  }
})();
