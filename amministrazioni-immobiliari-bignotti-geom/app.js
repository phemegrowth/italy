/* Amministrazioni Immobiliari Bignotti homepage: hero entrance (cards fan out and settle), header, full-screen menu,
   anchors, reveals, count-ups, drag strip with progress, phone bar, magnetic buttons, form validation,
   and the GSAP signature scene (the main door opens on the courtyard). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#portone' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.left < window.innerWidth) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-ups of quantities (rating, number of reviews) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    function fmt(v) { return v.toFixed(dec).replace('.', ','); }
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = fmt(0);
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null, dur = 1300;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(to * e);
        if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* services strip: drag with the mouse, swipe on touch, progress bar */
  var strip = d.querySelector('[data-drag]'), sbar = d.querySelector('.strip__bar span');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    function prog() { if (sbar) sbar.style.transform = 'scaleX(' + Math.min(1, (strip.scrollLeft + strip.clientWidth) / strip.scrollWidth).toFixed(3) + ')'; }
    strip.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = strip.scrollLeft; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) strip.classList.add('is-drag');
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 340, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -340, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* magnetic buttons, desktop only */
  if (!reduce && fine) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul condominio.' };
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
  d.querySelectorAll('[data-year]').forEach(function (yy) { yy.textContent = new Date().getFullYear(); });

  /* signature scene: the portone opens on the courtyard, the method steps follow */
  function scene() {
    var sec = d.querySelector('.door');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) { if (sec) sec.classList.add('no-scene'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    sec.classList.add('scene-on');
    var q = function (s) { return sec.querySelector(s); };
    var pin = q('.door__pin'), frame = q('.door__frame'), L = q('.door__leaf--l'), R = q('.door__leaf--r');
    var img = q('.door__inside img'), num = q('.door__num'), steps = sec.querySelectorAll('.door__steps li');
    var txt = [q('.door__txt .label'), q('.door__txt .h2'), q('.door__steps')];
    var small = window.innerWidth < 761;
    gsap.set(frame, { autoAlpha: 0, y: 40 });
    gsap.set(txt, { autoAlpha: 0, y: 24 });
    gsap.set(img, { scale: 1.25 });
    gsap.set([L, R], { rotationY: 0 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: pin, scrub: 0.6,
        onUpdate: function (s) {
          var t = s.progress * tl.duration(), k = t < 1.4 ? 0 : t < 2.6 ? 1 : t < 3.8 ? 2 : 3;
          steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
        }
      }
    });
    tl.to(frame, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to(txt, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, 0.1)
      .to(L, { rotationY: 78, duration: 2.2, ease: 'power1.inOut' }, 0.7)
      .to(R, { rotationY: -78, duration: 2.2, ease: 'power1.inOut' }, 0.7)
      .to(img, { scale: 1, duration: 3.2, ease: 'power1.out' }, 0.9)
      .to(num, { autoAlpha: 0, duration: 0.4 }, 3.2)
      .to({}, { duration: 1.2 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
