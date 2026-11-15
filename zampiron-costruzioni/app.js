/* Zampiron Costruzioni: hero years count-up and slanted photo reveal, header, full-screen menu, anchors, reveals,
   process line, drag strip, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene (a historic facade surveyed by drone, diagnosed, tied, restored and handed over). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* hero figure: years since 1954 (a quantity) */
  var num = d.querySelector('[data-years]');
  if (num) {
    var to = new Date().getFullYear() - parseInt(num.getAttribute('data-years'), 10);
    num.textContent = to;
    var lab = num.parentNode; if (lab) lab.setAttribute('aria-label', to + ' anni di cantieri, dal 1954');
    if (!reduce) {
      num.textContent = '0';
      var t0 = null;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1300);
        num.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      });
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#cantiere' ? 0 : hd.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  var els = Array.prototype.slice.call(d.querySelectorAll('.r'));
  if (!('IntersectionObserver' in window) || reduce) els.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('is-in'); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* process line draws with the scroll */
  var line = d.querySelector('.steps__line span'), lineBox = d.querySelector('.steps__line');
  var tick = false;
  function frame() {
    tick = false;
    if (line && lineBox) {
      var r = lineBox.getBoundingClientRect(), vh = window.innerHeight;
      line.style.transform = 'scaleX(' + Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.6))).toFixed(3) + ')';
    }
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('.strip');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx); });
  }

  /* phone contact bar: after the hero, hidden while the scene is pinned */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(hero);
  else if (mbar) mbar.classList.add('is-on');

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* accordion: one open at a time */
  var acc = d.querySelectorAll('.acc details');
  acc.forEach(function (dt) { dt.addEventListener('toggle', function () { if (dt.open) acc.forEach(function (o) { if (o !== dt) o.open = false; }); }); });

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

  /* signature scene: survey, diagnosis, seismic ties, restoration, handover */
  var sec = d.querySelector('.scene');
  function dash(el) { var L = el.getTotalLength ? el.getTotalLength() : 600; el.style.strokeDasharray = L; el.style.strokeDashoffset = L; return L; }
  function scene() {
    if (!sec) return;
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('is-static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var q = function (s) { return sec.querySelector(s); }, qa = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var outl = [q('.f-out'), q('.f-cornice')].concat(qa('.f-win path, .f-win circle'));
    var cracks = qa('.f-crack path'), marks = qa('.f-mark circle');
    var ring = q('.f-ring path'), ties = qa('.f-tie path'), plates = qa('.f-plate rect');
    var plaster = q('.f-plaster'), brick = q('.f-brick'), shut = qa('.f-shut rect');
    var drone = q('.f-drone'), scan = q('.f-scan'), ok = q('.f-ok');
    var steps = qa('.scene__steps li'), n = q('.scene__num'), name = q('.scene__name'), bar = q('.scene__bar span');
    var names = steps.map(function (li) { return li.querySelector('b').textContent; });

    outl.forEach(dash); cracks.forEach(dash);
    gsap.set(outl, { fillOpacity: 0 });
    gsap.set(brick, { opacity: 1 });
    gsap.set(plaster, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(marks, { scale: 0, transformOrigin: '50% 50%', opacity: 1 });
    gsap.set(q('.f-crack'), { opacity: 0 });
    gsap.set(q('.f-mark'), { opacity: 1 });
    gsap.set([ring].concat(ties), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(plates, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(shut, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(drone, { x: 60, y: 30, autoAlpha: 0 });
    gsap.set(scan, { y: 92, autoAlpha: 0 });
    gsap.set(ok, { x: 600, y: 120, scale: 0, transformOrigin: '50% 50%' });
    gsap.set(bar, { scaleX: 0 });

    var cur = -1;
    function setStep(k) {
      if (k === cur) return; cur = k;
      n.textContent = '0' + (k + 1); name.textContent = names[k];
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
    }
    setStep(0);
    var small = window.matchMedia('(max-width: 760px)').matches;
    var at = [0, 1.7, 3.1, 4.7, 6.3];
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: q('.scene__pin'), scrub: 0.6,
        onToggle: function (s) { var mb = d.querySelector('.mbar'); if (mb) mb.classList.toggle('is-hidden', s.isActive); },
        onUpdate: function (s) { var t = s.progress * tl.duration(), k = 0; at.forEach(function (m, i) { if (t >= m) k = i; }); setStep(k); }
      }
    });
    tl.to(bar, { scaleX: 1, duration: 7.4 }, 0)
      // 01 survey: the drone crosses the facade, a scan line sweeps down, the outline is drawn
      .to(drone, { autoAlpha: 1, duration: 0.15 }, 0)
      .to(drone, { x: 740, duration: 1.5, ease: 'sine.inOut' }, 0)
      .to(scan, { autoAlpha: 1, duration: 0.1 }, 0.1)
      .to(scan, { y: 470, duration: 1.3 }, 0.1)
      .to(scan, { autoAlpha: 0, duration: 0.15 }, 1.4)
      .to(outl, { strokeDashoffset: 0, duration: 1.3, stagger: 0.04 }, 0.1)
      .to(drone, { autoAlpha: 0, duration: 0.15 }, 1.5)
      // 02 diagnosis: cracks and dashed marks
      .to(q('.f-crack'), { opacity: 1, duration: 0.05 }, 1.75)
      .to(cracks, { strokeDashoffset: 0, duration: 0.7, stagger: 0.18 }, 1.8)
      .to(marks, { scale: 1, duration: 0.35, stagger: 0.18, ease: 'back.out(2)' }, 2.1)
      // 03 seismic: ring beam, tie rods, anchor plates
      .to(ring, { scaleX: 1, duration: 0.6 }, 3.2)
      .to(ties, { scaleX: 1, duration: 0.6, stagger: 0.2 }, 3.5)
      .to(plates, { scale: 1, duration: 0.3, stagger: 0.06, ease: 'back.out(2)' }, 4.0)
      // 04 restoration: plaster rises, cracks and marks go, shutters open
      .to(plaster, { scaleY: 1, duration: 1.1, ease: 'power1.inOut' }, 4.8)
      .to([q('.f-crack'), q('.f-mark')], { opacity: 0, duration: 0.6 }, 5.2)
      .to(brick, { opacity: 0, duration: 0.3 }, 5.8)
      .to(shut, { scaleY: 1, duration: 0.3, stagger: 0.04 }, 5.6)
      // 05 handover: a check badge
      .to(ok, { scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, 6.4)
      .to({}, { duration: 0.6 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
