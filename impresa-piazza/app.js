/* Impresa Piazza: hero years count-up and round photo reveal, header, full-screen menu, anchors, reveals, count-up,
   road-marking line on the process, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene (a road cross-section built layer by layer, with the paver laying the asphalt). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* hero figure: years since founding (a quantity), counts up on load */
  var num = d.querySelector('[data-years]');
  if (num) {
    var to = new Date().getFullYear() - parseInt(num.getAttribute('data-years'), 10);
    num.textContent = to;
    if (!reduce) {
      num.textContent = '0';
      var t0 = null;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1300);
        num.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      });
      setTimeout(function () { var r = d.querySelector('.hero__ring'); if (r) r.classList.add('spin'); }, 2100);
    }
  }

  var hd = d.getElementById('hd');
  function onScroll() { hd.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
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

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#strada' ? 0 : hd.offsetHeight - 1);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up: team size */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var n = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var s0 = null;
      requestAnimationFrame(function step(t) {
        if (!s0) s0 = t;
        var k = Math.min(1, (t - s0) / 1200);
        el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* process: the road marking paints itself with the scroll */
  var mark = d.querySelector('.steps__road span'), road = d.querySelector('.steps__road');
  var tick = false;
  function frame() {
    tick = false;
    if (mark && road) {
      var r = road.getBoundingClientRect(), vh = window.innerHeight;
      mark.style.transform = 'scaleX(' + Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.7))).toFixed(3) + ')';
    }
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* phone contact bar */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(hero);
  else if (mbar) mbar.classList.add('is-on');

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete un nome o il nome dell\'azienda.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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

  /* signature scene: the road, layer by layer */
  var sec = d.querySelector('.road');
  function scene() {
    if (!sec) return;
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('is-static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var plug = q('.rd-plug'), cut = q('.rd-cut'), fond = q('.rd-fond'), base = q('.rd-base'), bind = q('.rd-bind'), usura = q('.rd-usura');
    var kerbs = qa('.rd-kerb rect'), marks = qa('.rd-mark rect'), paver = q('.rd-paver'), lamps = qa('.rd-lamp path, .rd-lamp rect');
    var steps = qa('.road__steps li'), n = q('.road__num'), name = q('.road__name'), bar = q('.road__bar span');
    var names = ['Scavo e bonifica', 'Fondazione in misto granulare', 'Strato di base', 'Binder', "Tappeto d'usura", 'Cordoli e segnaletica'];
    gsap.set([fond, base, bind, usura], { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(cut, { autoAlpha: 0 });
    gsap.set(kerbs, { y: -60, autoAlpha: 0 });
    gsap.set(marks, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(paver, { x: 0, autoAlpha: 0 });
    gsap.set(bar, { scaleX: 0 });
    gsap.set(lamps, { autoAlpha: 0 });
    var cur = -1;
    function setStep(k) {
      if (k === cur) return; cur = k;
      n.textContent = '0' + (k + 1); name.textContent = names[k];
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
    }
    setStep(0);
    var small = window.matchMedia('(max-width: 760px)').matches;
    var marksAt = [0, 1.4, 2.6, 3.8, 5.2, 6.6];
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%', pin: q('.road__pin'), scrub: 0.6,
        onUpdate: function (s) { var t = s.progress * tl.duration(), k = 0; marksAt.forEach(function (m, i) { if (t >= m) k = i; }); setStep(k); }
      }
    });
    tl.to(bar, { scaleX: 1, duration: 7.8 }, 0)
      // 01 dig: the soil plug lifts out, the cut line shows
      .to(plug, { y: -170, autoAlpha: 0, duration: 1.1, ease: 'power1.in' }, 0.1)
      .to(cut, { autoAlpha: 1, duration: 0.4 }, 0.7)
      // 02 to 05: layers spread left to right; the paver rides the asphalt layers
      .to(fond, { scaleX: 1, duration: 1 }, 1.4)
      .to(base, { scaleX: 1, duration: 1 }, 2.6)
      .to(paver, { autoAlpha: 1, duration: 0.2 }, 3.7)
      .fromTo(paver, { x: 80, y: 20 }, { x: 860, y: 20, duration: 1.2 }, 3.8)
      .to(bind, { scaleX: 1, duration: 1.2 }, 3.8)
      .fromTo(paver, { x: 80, y: -3 }, { x: 860, y: -3, duration: 1.3, immediateRender: false }, 5.2)
      .to(usura, { scaleX: 1, duration: 1.3 }, 5.2)
      .to(paver, { autoAlpha: 0, duration: 0.2 }, 6.4)
      .to(cut, { autoAlpha: 0, duration: 0.3 }, 6.4)
      // 06 kerbs drop in, the lane marking paints
      .to(kerbs, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, 6.6)
      .to(marks, { scaleX: 1, duration: 0.25, stagger: 0.15 }, 6.9)
      .to(lamps, { autoAlpha: 1, duration: 0.4 }, 7.3)
      .to({}, { duration: 0.6 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
