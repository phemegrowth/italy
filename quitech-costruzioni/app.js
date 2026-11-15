/* Quitech Costruzioni: hero (fanned cards settle into a collage + line reveal), header, menu, anchors, reveals,
   project clip reveals, count-up, accordion, magnetic buttons, phone bar, form, and the GSAP scene:
   Residenza L'Ulivo drawn as a blueprint, then built floor by floor with the scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight - 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 59;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  d.querySelectorAll('.h2, .lead, .proj, .v, .matteo p, .pull, .acc__it, .serv__pic, .matteo__pic, .form, .contact__list, .mapbox').forEach(function (el) { el.classList.add('r'); });
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

  /* service list: hover or centre item swaps the photo (desktop) */
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

  /* drag strip */
  var strip = d.querySelector('[data-drag]');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
  }

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
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

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Due righe su cosa cercate.' };
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
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });


  /* count-up (sourced numbers only) */
  var counts = d.querySelectorAll('[data-count]');
  reveal(counts, function (el) {
    if (reduce) return;
    var to = +el.getAttribute('data-count'), t0 = null;
    el.textContent = '0';
    function step(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  });

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* GSAP scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    buildScene(window.innerWidth < 761);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function buildScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var bps = q('.bp'), floors = q('.floor'), pv = q('.pv'), trees = q('.trees'), dim = q('.dim'), coat = q('.coat');
    var tags = q('.tag'), pct = sec.querySelector('[data-pct]'), now = sec.querySelector('[data-now]'), bar = sec.querySelector('[data-bar]');
    var msgs = ['Il progetto: tre palazzine di tre piani intorno a un cortile.', 'Muri da 40 cm di spessore totale.', 'Piano terra, primo, secondo: si sale.', 'Cappotto isolante da 13 cm in facciata.', 'Fotovoltaico sul tetto.', 'Cortile e giardini privati. 18 appartamenti.'];
    if (small) sec.querySelector('.bpsvg').setAttribute('viewBox', '40 150 920 345');
    gsap.set(bps, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(floors, { scaleY: 0, transformOrigin: '50% 100%', autoAlpha: 0 });
    gsap.set(pv, { autoAlpha: 0, y: -20 });
    gsap.set(trees, { autoAlpha: 0, scale: .6, transformOrigin: '50% 100%' });
    gsap.set(dim, { autoAlpha: 0 }); gsap.set(coat, { autoAlpha: 0, x: 16 });
    gsap.set(tags, { autoAlpha: 0, y: 10 });
    gsap.set(bar, { scaleX: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(bps, { strokeDashoffset: 0, duration: 1.6, stagger: .06, ease: 'power1.inOut' }, 0)
      .to(tags[0], { autoAlpha: 1, y: 0, duration: .3 }, .3)
      .to(dim, { autoAlpha: 1, duration: .3 }, 1.6)
      .to(tags[1], { autoAlpha: 1, y: 0, duration: .3 }, 1.7);
    floors.forEach(function (f, i) { tl.to(f, { scaleY: 1, autoAlpha: 1, duration: .8, ease: 'power3.out' }, 2.2 + i * .9); });
    tl.to(coat, { autoAlpha: 1, x: 0, duration: .5 }, 4.9)
      .to(tags[2], { autoAlpha: 1, y: 0, duration: .3 }, 5)
      .to(pv, { autoAlpha: 1, y: 0, duration: .4, stagger: .03 }, 5.6)
      .to(tags[3], { autoAlpha: 1, y: 0, duration: .3 }, 5.8)
      .to(trees, { autoAlpha: 1, scale: 1, duration: .6 }, 6.6)
      .to(tags[4], { autoAlpha: 1, y: 0, duration: .3 }, 6.8)
      .to(bar, { scaleX: 1, duration: 7.4, ease: 'none' }, 0)
      .to({}, { duration: .5 });
    var at = [0, 1.6, 2.2, 4.9, 5.6, 6.6], last = -1, lastP = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), s = 0, p = Math.round(Math.min(1, t / 7.2) * 100);
      for (var k = 0; k < at.length; k++) if (t >= at[k]) s = k;
      if (p !== lastP) { lastP = p; pct.textContent = p; }
      if (s !== last) { last = s; now.textContent = msgs[s]; }
    });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    pct.textContent = '0'; now.textContent = msgs[0];
  }
})();
