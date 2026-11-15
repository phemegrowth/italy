/* Minerva Case: hero (headline line reveal, a reel of tall photos slides in and drifts left with the scroll, slow zoom),
   header, full-screen menu, sticky contact bar, anchors, reveals, accordion (one open at a time), sellers' line that draws on scroll,
   magnetic buttons, form, and the GSAP signature scene: the province of Brescia draws itself, the lakes fill, and a dashed
   route runs from the office in Via San Polo to the places of their listings while the stops advance. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + sticky phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 960 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#mappa' ? 0 : header.offsetHeight - 1);
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

  /* rAF scroll helper */
  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () {
      if (t) return; t = true;
      requestAnimationFrame(function () { t = false; fn(); });
    }, { passive: true });
    fn();
  }


  /* hero reel drifts left with scroll (transform only) */
  var reelT = d.querySelector('[data-reel]');
  if (reelT && !reduce) {
    onFrameScroll(function () {
      var y = Math.min(window.scrollY, window.innerHeight * 1.2);
      reelT.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
    });
  }

  /* accordion: one open at a time, smooth height */
  var accs = Array.prototype.slice.call(d.querySelectorAll('.acc__item'));
  accs.forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__body');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) { if (!det.open) accs.forEach(function (o) { if (o !== det) o.open = false; }); return; }
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease' }).onfinish = function () { det.open = false; };
      } else {
        accs.forEach(function (o) { if (o !== det && o.open) o.open = false; });
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.1,1)' });
      }
    });
  });

  /* count-up of the years in business, when the number comes into view */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }, { threshold: .5 });
    io.observe(el);
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.05)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
  });

  /* drag strip for reviews (mouse only; touch scrolls natively) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* magnetic buttons (desktop pointer only) */
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe su cosa vi serve.' };
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
    mm.add('(min-width: 961px)', function () { return mapScene(false); });
    mm.add('(max-width: 960px)', function () { return mapScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mapScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var prov = sec.querySelector('.map__prov'), lakes = sec.querySelectorAll('.map__lake');
    var routes = sec.querySelectorAll('.map__route');
    var home = sec.querySelector('.map__pin--home circle'), homeL = sec.querySelector('.map__lbl--home');
    var pins = [1, 2, 3].map(function (i) { return sec.querySelector('[data-pin="' + i + '"] circle'); });
    var lbls = [1, 2, 3].map(function (i) { return sec.querySelector('[data-lbl="' + i + '"]'); });
    var soft = sec.querySelectorAll('.map__lbl--lake, .map__lbl--area');
    var stops = Array.prototype.slice.call(sec.querySelectorAll('.stops li'));
    var plen = prov.getTotalLength();
    var rl = Array.prototype.map.call(routes, function (r) { return r.getTotalLength(); });
    gsap.set(prov, { strokeDasharray: plen, strokeDashoffset: plen, fillOpacity: 0 });
    gsap.set(lakes, { opacity: 0 });
    Array.prototype.forEach.call(routes, function (r, i) { gsap.set(r, { strokeDasharray: rl[i] + ' ' + rl[i], strokeDashoffset: rl[i] }); });
    gsap.set([home].concat(pins), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set([homeL].concat(lbls, Array.prototype.slice.call(soft)), { autoAlpha: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to(prov, { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut' }, 0)
      .to(prov, { fillOpacity: 1, duration: .4 }, .8)
      .to(lakes, { opacity: 1, duration: .4, stagger: .08 }, .9)
      .to(soft, { autoAlpha: 1, duration: .3 }, 1.1)
      .to(home, { scale: 1, duration: .3, ease: 'back.out(3)' }, 1.0)
      .to(homeL, { autoAlpha: 1, duration: .25 }, 1.1)
      .to(pins[0], { scale: 1, duration: .3, ease: 'back.out(3)' }, 1.5)
      .to(lbls[0], { autoAlpha: 1, duration: .25 }, 1.55)
      .to(routes[0], { strokeDashoffset: 0, duration: .8, ease: 'none' }, 1.9)
      .to(pins[1], { scale: 1, duration: .3, ease: 'back.out(3)' }, 2.6)
      .to(lbls[1], { autoAlpha: 1, duration: .25 }, 2.65)
      .to(routes[1], { strokeDashoffset: 0, duration: .9, ease: 'none' }, 2.9)
      .to(pins[2], { scale: 1, duration: .3, ease: 'back.out(3)' }, 3.7)
      .to(lbls[2], { autoAlpha: 1, duration: .25 }, 3.75)
      .to({}, { duration: .5 }, 4.0);
    var at = [0, 1.5, 2.6, 3.7], last = -1;
    function sync() {
      var t = tl.time(), k = 0;
      for (var j = 0; j < at.length; j++) if (t >= at[j]) k = j;
      if (k === last) return;
      last = k;
      stops.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { body.classList.toggle('in-scene', self.isActive); }
    });
    sync();
    return function () {
      st.kill(); tl.kill(); body.classList.remove('in-scene');
      gsap.set([prov, home, homeL].concat(pins, lbls, Array.prototype.slice.call(lakes), Array.prototype.slice.call(routes), Array.prototype.slice.call(soft)), { clearProps: 'all' });
      stops.forEach(function (li) { li.classList.remove('is-on'); });
    };
  }
})();
