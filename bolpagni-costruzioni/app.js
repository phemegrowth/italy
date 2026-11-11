/* Bolpagni Costruzioni homepage: hero entrance and reel drift, header, full-screen menu, anchors, reveals,
   years count-up, step line, phone bar, magnetic buttons, form validation,
   and the GSAP signature scene (the building pulled apart into its five layers, then put back together). */
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
    html.classList.toggle('menu-open', open);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#edificio' ? 0 : header.offsetHeight - 1);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* scroll-linked: reel drifts left (and slides under the headline panel on desktop), step line draws */
  var track = d.querySelector('.reel__track'), steps = d.querySelector('[data-line]'), tick = false;
  function frame() {
    tick = false;
    var vh = window.innerHeight;
    if (track) track.style.translate = (-Math.min(window.scrollY, vh * 1.4) * 0.45).toFixed(1) + 'px 0';
    if (steps) {
      var s = steps.getBoundingClientRect();
      steps.style.setProperty('--p', Math.min(1, Math.max(0, (vh * 0.8 - s.top) / (s.height * 0.9))).toFixed(4));
    }
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* years in business, counted up (a quantity: years since 1993) */
  d.querySelectorAll('[data-years]').forEach(function (el) {
    var to = new Date().getFullYear() - parseInt(el.getAttribute('data-years'), 10);
    el.textContent = to;
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
    var msgs = { name: 'Indicate un nome o un\'azienda.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete il progetto in due righe.' };
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

  /* signature scene: exploded floors */
  function scene() {
    var sec = d.querySelector('.ex');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) { if (sec) sec.classList.add('no-scene'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var q = function (s) { return sec.querySelector(s); };
    var pin = q('.ex__pin'), stack = q('.ex__stack');
    var slices = Array.prototype.slice.call(sec.querySelectorAll('.slice')).reverse(); // bottom (foundations) first
    var items = sec.querySelectorAll('.ex__list li');
    var txt = [q('.ex__txt .label'), q('.ex__txt .h2'), q('.ex__list')];
    var small = window.innerWidth < 761, G = small ? 18 : 30;
    function setOn(k) { items.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-i') === k); }); }
    gsap.set(stack, { autoAlpha: 0, y: 40 });
    gsap.set(txt, { autoAlpha: 0, y: 24 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=160%' : '+=260%', pin: pin, scrub: 0.6,
        onUpdate: function (s) {
          var t = s.progress * tl.duration();
          setOn(t < 1.4 ? -1 : t > 5.6 ? -1 : Math.min(4, Math.floor((t - 1.4) / 0.8)));
        }
      }
    });
    tl.to(stack, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to(txt, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, 0.1);
    // pull the building apart: foundations go down, the roof goes up, alternate small side shifts
    slices.forEach(function (sl, i) {
      tl.to(sl, { y: (2 - i) * G, x: (i % 2 ? 1 : -1) * G * 0.4, duration: 0.9, ease: 'power2.inOut' }, 0.6);
      tl.to(sl.querySelector('.slice__tag'), { autoAlpha: 1, duration: 0.3 }, 1.4 + i * 0.8);
    });
    tl.to(stack, { '--e': 1, duration: 0.5 }, 0.8);
    // put it back together at the end
    tl.to(slices, { y: 0, x: 0, duration: 0.9, ease: 'power2.inOut' }, 5.6);
    tl.to(sec.querySelectorAll('.slice__tag'), { autoAlpha: 0, duration: 0.4 }, 5.6);
    tl.to(stack, { '--e': 0, duration: 0.5 }, 5.8);
    tl.to({}, { duration: 0.6 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
