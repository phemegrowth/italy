/* Hysa Eduart Impresa Edile: hero F entrance (frame lines draw, photo opens inside, headline lines rise), header, phone menu,
   anchors, reveals, service photo swap, drag strip with progress, process line, magnetic buttons, phone contact bar, form,
   and the GSAP signature scene: one bathroom in section, renovated trade by trade with scroll
   (demolition and chases, plumbing and wiring, underfloor heating + screed + floor, wall slabs, paint and fixtures). */
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
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
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
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: hover or the item nearest the middle swaps the sticky photo (desktop) */
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

  /* drag strip + progress */
  var strip = d.querySelector('[data-strip]'), sbar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      if (sbar) sbar.style.transform = 'scaleX(' + (0.15 + p * 0.85).toFixed(3) + ')';
    };
    strip.addEventListener('scroll', upd, { passive: true });
    upd();
    if (window.matchMedia('(pointer: fine)').matches) {
      var down = false, sx = 0, sl = 0, moved = false;
      strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
      window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; strip.scrollLeft = sl - dx; });
      window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
      strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    }
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
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

  /* phone contact bar: shown once the hero is scrolled past */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero) {
    var mb = function () { mbar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 40); };
    window.addEventListener('scroll', mb, { passive: true });
    mb();
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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
    roomScene(window.innerWidth <= 760);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function roomScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var one = function (s) { return sec.querySelector(s); };
    var structure = q('.s-slab, .s-ceil, .s-wall, .s-edge, .s-win, .s-win-l');
    var old = q('.old rect'), traces = q('.traces path');
    var lines = q('.pipe, .wire, .heat');
    var boxes = q('.box rect'), screed = one('.screed'), ftiles = q('.ftile rect');
    var wtiles = Array.prototype.slice.call(q('.wtile rect')).sort(function (a, b) { return (+b.getAttribute('y')) - (+a.getAttribute('y')) || (+a.getAttribute('x')) - (+b.getAttribute('x')); });
    var paint = q('.paint'), fix = q('.fix > *');
    var labs = function (n) { return one('.lab--' + n); };
    var quote = one('[data-quote]'), cnt = one('[data-count]'), bar = one('[data-bar]'), now = one('[data-now]');
    var stepsEl = q('.ssteps li');
    var desc = ['Scorrete: la stanza si rifà sotto i vostri occhi.', 'Via i vecchi rivestimenti, poi si aprono le tracce per i nuovi impianti.', 'Tubi dell\'acqua e linee elettriche nuove, dove servono davvero.', 'Riscaldamento a pavimento, massetto, poi la posa del pavimento.', 'Lastre grandi a parete, in fila e in bolla.', 'Pittura, sanitari, specchio e scaldasalviette. La stanza è pronta.'];
    var descEl = one('[data-desc]'), stamp = one('.stamp');
    var names = ['', 'Demolizioni e tracce', 'Impianto idraulico ed elettrico', 'Massetto e pavimento', 'Rivestimenti', 'Tinteggiatura e finiture'];

    lines.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.set(structure, { autoAlpha: 0 });
    gsap.set(old, { autoAlpha: 0 });
    gsap.set(traces, { autoAlpha: 0 });
    gsap.set(boxes, { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 50%' });
    gsap.set(screed, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(ftiles, { autoAlpha: 0, y: -40 });
    gsap.set(wtiles, { autoAlpha: 0, y: 26 });
    gsap.set(paint, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(fix, { autoAlpha: 0, y: 18 });
    gsap.set(q('.lab'), { autoAlpha: 0 });
    gsap.set(quote, { autoAlpha: 0, y: 14 });
    gsap.set(bar, { scaleX: 0 });
    gsap.set(stamp, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var stepAt = [0, 0.7, 1.9, 3.2, 4.5, 5.8];
    /* the room as it is */
    tl.to(structure, { autoAlpha: 1, duration: 0.3, stagger: 0.03 }, 0)
      .to(old, { autoAlpha: 1, duration: 0.25, stagger: { amount: 0.3 } }, 0.15);
    /* 1 demolition + chases */
    tl.to(old, { autoAlpha: 0, y: 70, rotation: function (i) { return (i % 2 ? 1 : -1) * (6 + i % 9); }, duration: 0.5, ease: 'power2.in', stagger: { amount: 0.45, from: 'random' } }, 0.7)
      .to(traces, { autoAlpha: 1, duration: 0.35, stagger: 0.08 }, 1.3);
    if (!small) tl.to(labs(1), { autoAlpha: 1, duration: 0.25 }, 1.4);
    /* 2 plumbing + wiring */
    tl.to(q('.pipe, .wire'), { strokeDashoffset: 0, duration: 0.9, ease: 'none', stagger: 0.12 }, 1.9)
      .to(boxes, { autoAlpha: 1, scale: 1, duration: 0.25, stagger: 0.08, ease: 'back.out(2)' }, 2.6);
    if (!small) tl.to(labs(2), { autoAlpha: 1, duration: 0.25 }, 2.4).to(labs(1), { autoAlpha: 0, duration: 0.2 }, 3.1);
    /* 3 underfloor heating, screed, floor */
    tl.to(q('.heat'), { strokeDashoffset: 0, duration: 0.5, ease: 'none' }, 3.2)
      .to(screed, { scaleY: 1, duration: 0.4 }, 3.7)
      .to(ftiles, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.07, ease: 'power3.out' }, 4.0);
    if (!small) tl.to(labs(3), { autoAlpha: 1, duration: 0.25 }, 3.4).to(labs(2), { autoAlpha: 0, duration: 0.2 }, 4.4);
    /* 4 wall slabs, bottom row first */
    tl.to(traces, { autoAlpha: 0, duration: 0.3 }, 4.5)
      .to(wtiles, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08, ease: 'power3.out' }, 4.5);
    if (!small) tl.to(labs(4), { autoAlpha: 1, duration: 0.25 }, 5.0).to(labs(3), { autoAlpha: 0, duration: 0.2 }, 5.6);
    /* 5 paint, then fixtures */
    tl.to(paint, { scaleY: 1, duration: 0.6, ease: 'power1.inOut' }, 5.8);
    if (!small) tl.to(labs(4), { autoAlpha: 0, duration: 0.2 }, 6.2);
    tl.to(fix, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05 }, 6.4)
      .to(stamp, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, 7.1)
      .to(quote, { autoAlpha: 1, y: 0, duration: 0.4 }, 7.3)
      .to(bar, { scaleX: 1, duration: 7.6, ease: 'none' }, 0)
      .to({}, { duration: 0.5 }, 7.7);

    var lastS = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 1; j < stepAt.length; j++) if (t >= stepAt[j]) s = j;
      if (s === lastS) return;
      lastS = s;
      cnt.textContent = '0' + s;
      stepsEl.forEach(function (li) { var k = +li.getAttribute('data-step'); li.classList.toggle('is-on', k === s); li.classList.toggle('is-done', k < s); });
      if (now) now.innerHTML = s ? '<b>0' + s + '</b>' + names[s] : '';
      if (descEl) descEl.textContent = desc[s];
    }
    tl.eventCallback('onUpdate', sync);

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=135%' : '+=230%',
      pin: true, scrub: 0.6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
