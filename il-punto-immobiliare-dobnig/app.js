/* Il Punto Immobiliare: Ken Burns hero, header, menu, anchors, reveals, photo trio wipe, steps line, magnetic buttons,
   phone bar, form, and the GSAP scene: a schematic map of Genova where routes draw from Via Canevari to each zone. */
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 2);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  d.querySelectorAll('.h2, .lead, .list__it, .step, .people, .vq, .team__pic, .contact__list, .form').forEach(function (el) {
    if (!el.closest('.scene') && !el.closest('.hero')) el.classList.add('r');
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
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* photo trio: observe the grid, wipe the children (clip on the observed element would block the observer) */
  var pg = d.querySelector('.pics__grid');
  if (pg) reveal([pg], function () { pg.querySelectorAll('.pic').forEach(function (p, i) { setTimeout(function () { p.classList.add('is-in'); }, i * 120); }); });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height * 0.9)));
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

  /* GSAP scene: map of Genova */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    mapScene(window.innerWidth < 761);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mapScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    if (small) sec.querySelector('.map').setAttribute('viewBox', '190 300 800 680');
    var sea = q('.sea, .piers'), river = q('.river'), old = q('.old'), wlab = q('.wlab'), routes = q('.route'), pins = q('.pin');
    var num = sec.querySelector('[data-num]'), zone = sec.querySelector('[data-zone]'), list = sec.querySelector('[data-list]');
    var data = [
      ['Marassi · Via Canevari', 'La nostra agenzia. In zona, un 90 mq con ascensore a € 139.000.'],
      ['Marassi · Largo Merlo', 'Appartamento ristrutturato, due camere, palazzo con ascensore: € 107.000.'],
      ['Via Burlando', 'A pochi minuti da Piazza Manin, con terrazzino vivibile: € 69.000.'],
      ['Corso Montegrappa', 'Palazzo d’epoca anni ’30, 133 mq e terrazzo, sopra Brignole: € 250.000.'],
      ['Centro storico · Via San Luca', 'Bilocale arredato con volte, in un palazzo dei Rolli fronte Porto Antico: € 109.000.']
    ];
    gsap.set(sea, { autoAlpha: 0, y: 30 });
    gsap.set(river, { strokeDasharray: 1400, strokeDashoffset: 1400 });
    gsap.set(old, { autoAlpha: 0 });
    gsap.set(wlab, { autoAlpha: 0 });
    routes.forEach(function (r) { var L = r.getTotalLength() + 2; gsap.set(r, { strokeDasharray: L, strokeDashoffset: L }); });
    pins.forEach(function (p) {
      gsap.set(p.querySelectorAll('circle, .pin__n'), { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(p.querySelector('.pl'), { autoAlpha: 0, y: 16 });
    });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(sea, { autoAlpha: 1, y: 0, duration: .6, stagger: .1 }, 0)
      .to(river, { strokeDashoffset: 0, duration: .8, ease: 'power1.inOut' }, .2)
      .to(old, { autoAlpha: 1, duration: .4 }, .5)
      .to(wlab, { autoAlpha: 1, duration: .4, stagger: .06 }, .5)
      .to(pins[0].querySelectorAll('circle, .pin__n'), { scale: 1, duration: .4, ease: 'back.out(3)' }, .9)
      .to(pins[0].querySelector('.pl'), { autoAlpha: 1, y: 0, duration: .3 }, 1);
    var at = [.9];
    for (var i = 1; i < pins.length; i++) {
      var t0 = 1.4 + (i - 1) * .9;
      at.push(t0 + .5);
      tl.to(routes[i - 1], { strokeDashoffset: 0, duration: .6, ease: 'power1.inOut' }, t0)
        .to(pins[i].querySelectorAll('circle, .pin__n'), { scale: 1, duration: .35, ease: 'back.out(3)' }, t0 + .5)
        .to(pins[i].querySelector('.pl'), { autoAlpha: 1, y: 0, duration: .3 }, t0 + .55);
    }
    tl.to({}, { duration: .5 });
    var last = -2;
    function show(s) {
      if (s === last) return; last = s;
      var k = Math.max(0, s);
      num.textContent = '0' + (k + 1);
      zone.textContent = data[k][0];
      list.textContent = data[k][1];
      gsap.fromTo([zone, list], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .3, overwrite: true });
    }
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), s = 0;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) s = k;
      show(s);
    });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=140%' : '+=230%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
  }
})();
