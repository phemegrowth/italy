/* Etica Real Estate homepage: hero entrance and photo parallax, header, full-screen menu, anchors, reveals,
   services accordion with photo swap, snail and step lines driven by scroll, count-up, phone bar, magnetic buttons,
   form validation, and the GSAP signature scene (fly through the I of BRESCIA into the city). */
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
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset (the pinned scene starts at its own top) */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#brescia' || id === '#top' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: id === '#top' ? 0 : top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals, with the above-the-fold guard */
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

  /* scroll-linked: hero photo parallax (slower than the page), snail crawl, step line */
  var heroImg = d.querySelector('.hero__img'), heroFrame = d.querySelector('.hero__frame');
  var snail = d.querySelector('.snail'), about = d.querySelector('.about');
  var steps = d.querySelector('[data-line]');
  var tick = false;
  function clamp01(v) { return Math.min(1, Math.max(0, v)); }
  function frame() {
    tick = false;
    var vh = window.innerHeight;
    if (heroImg && heroFrame) {
      var r = heroFrame.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) heroImg.style.translate = '0 ' + (clamp01((vh - r.top) / (vh + r.height)) * 12 - 4).toFixed(2) + '%';
    }
    if (snail && about) {
      var a = about.getBoundingClientRect();
      snail.style.setProperty('--p', clamp01((vh - a.top) / (a.height + vh * 0.2)).toFixed(4));
    }
    if (steps) {
      var s = steps.getBoundingClientRect();
      steps.style.setProperty('--p', clamp01((vh * 0.8 - s.top) / (s.height * 0.9)).toFixed(4));
    }
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    window.addEventListener('resize', frame);
    frame();
  }

  /* count-up of a quantity (49 Google reviews) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null, dur = 1400;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* services: tap, hover or focus opens a line and swaps the photo */
  var pic = d.querySelector('[data-swap]'), sItems = d.querySelectorAll('.serv__list li');
  function setServ(li) {
    sItems.forEach(function (x) { x.classList.toggle('is-on', x === li); x.querySelector('button').setAttribute('aria-expanded', x === li ? 'true' : 'false'); });
    var src = li.getAttribute('data-img');
    if (!pic || !src || pic.getAttribute('src') === src) return;
    pic.classList.add('is-fade');
    setTimeout(function () { pic.src = src; pic.classList.remove('is-fade'); }, reduce ? 0 : 260);
  }
  sItems.forEach(function (li) {
    var b = li.querySelector('button');
    b.setAttribute('aria-expanded', li.classList.contains('is-on') ? 'true' : 'false');
    b.addEventListener('click', function () { setServ(li); });
    li.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setServ(li); });
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla vostra richiesta.' };
    var req = form.querySelectorAll('[required]');
    function check(f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* signature scene: the word BRESCIA is cut out of the page, the scroll flies through the stem of its I */
  function scene() {
    var sec = d.querySelector('.city');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    sec.classList.add('scene-on');
    var pin = sec.querySelector('.city__pin'), svg = sec.querySelector('.city__mask');
    var mask = svg.querySelector('mask'), rects = svg.querySelectorAll('rect'), word = svg.querySelector('.city__word');
    var photo = sec.querySelector('.city__photo img'), top = sec.querySelector('.city__top'), bottom = sec.querySelector('.city__bottom');
    var end = sec.querySelector('.city__end');
    var NS = 'http://www.w3.org/2000/svg';
    var meas = d.createElementNS(NS, 'text');
    meas.setAttribute('class', 'city__word'); meas.style.fill = 'none'; meas.style.opacity = '0'; meas.setAttribute('text-anchor', 'middle');
    svg.appendChild(meas);
    var S = 40;

    function layout() {
      var w = pin.clientWidth, h = pin.clientHeight, small = w < 700;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      mask.setAttribute('width', w); mask.setAttribute('height', h);
      rects.forEach(function (r) { r.setAttribute('width', w); r.setAttribute('height', h); });
      var f = 100, lines = small ? ['BRE', 'SCIA'] : ['BRESCIA'];
      [word, meas].forEach(function (t) {
        while (t.firstChild) t.removeChild(t.firstChild);
        lines.forEach(function (txt) { var ts = d.createElementNS(NS, 'tspan'); ts.textContent = txt; t.appendChild(ts); });
      });
      meas.setAttribute('font-size', f);
      var L = 0;
      meas.querySelectorAll('tspan').forEach(function (ts) { L = Math.max(L, ts.getComputedTextLength()); });
      L = L || 520;
      f = f * (w * (small ? 0.86 : 0.84)) / L;
      if (small) f = Math.min(f, h * 0.24);
      var lh = f * 0.92, y0 = Math.round(h * 0.5 - (lines.length - 1) * lh / 2 + f * 0.34);
      [word, meas].forEach(function (t) {
        t.setAttribute('font-size', f.toFixed(1)); t.setAttribute('x', w / 2); t.setAttribute('y', y0);
        t.querySelectorAll('tspan').forEach(function (ts, i) { ts.setAttribute('x', w / 2); ts.setAttribute('y', Math.round(y0 + i * lh)); });
      });
      var y = Math.round(y0 + (lines.length - 1) * lh);
      var ex;
      try { ex = meas.getExtentOfChar(5); } catch (e) { ex = { x: w / 2 + f * 1.1, y: y - f * 0.7, width: f * 0.3, height: f * 0.7 }; }
      var cx = ex.x + ex.width / 2, cy = y - f * 0.36;
      var stem = Math.max(4, ex.width * 0.32);
      S = Math.min(140, Math.max(w, h) / stem * 1.6);
      gsap.set(svg, { transformOrigin: cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px' });
    }
    layout();

    var small = pin.clientWidth < 700;
    gsap.set(word, { attr: { 'fill-opacity': 0 } });
    gsap.set([top, bottom], { autoAlpha: 0, y: 24 });
    gsap.set(end, { autoAlpha: 0, y: 60 });
    gsap.set(photo, { scale: 1.25 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=150%' : '+=230%', pin: pin, scrub: 0.6, anticipatePin: 1 }
    });
    tl.to(word, { attr: { 'fill-opacity': 1 }, duration: 0.8 }, 0)
      .to([top, bottom], { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.15 }, 0.2)
      .to([top, bottom], { autoAlpha: 0, y: -16, duration: 0.4 }, 1.4)
      .to(svg, { scale: function () { return S; }, duration: 2.6, ease: 'power3.in' }, 1.4)
      .to(photo, { scale: 1, duration: 2.8, ease: 'power1.out' }, 1.4)
      .to(svg, { autoAlpha: 0, duration: 0.3 }, 3.8)
      .to(end, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 4.0)
      .to({}, { duration: 0.7 });

    var lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(window.innerWidth - lastW) < 2) return;
      lastW = window.innerWidth; layout(); ScrollTrigger.refresh();
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
