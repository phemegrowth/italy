/* Nuove Costruzioni Edili: hero entrance (arch photo rises, headline line reveal, years count-up), header, full-screen menu,
   sticky phone bar, anchors, reveals, service list that swaps the photo, process line, form validation,
   and the GSAP signature scene: a wall built layer by layer (masonry, insulation boards, mesh, base coat, stamped stone finish). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('rm', 'is-ready'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
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
  window.addEventListener('resize', function () { if (window.innerWidth > 1080 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
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

  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; fn(); }); }, { passive: true });
    fn();
  }

  /* count-up of years (sourced: founded 1994) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1300); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }, { threshold: .3 });
    io.observe(el);
  });

  /* services: the item in the middle of the screen (or hovered) swaps the photo */
  var pics = d.querySelectorAll('.svc__pic img'), items = d.querySelectorAll('.svc__list li');
  function setPic(i) {
    pics.forEach(function (p) { p.classList.toggle('is-on', +p.getAttribute('data-pic') === i); });
    items.forEach(function (it) { it.classList.toggle('is-on', +it.getAttribute('data-for') === i); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { setPic(+it.getAttribute('data-for')); }); });
  if (window.innerWidth > 700) onFrameScroll(function () {
    var mid = window.innerHeight * 0.55, best = -1, bd = 1e9;
    items.forEach(function (it) { var r = it.getBoundingClientRect(); var dd = Math.abs(r.top + r.height / 2 - mid); if (dd < bd && r.top < window.innerHeight && r.bottom > 0) { bd = dd; best = +it.getAttribute('data-for'); } });
    if (best >= 0) setPic(best);
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
  });

  /* magnetic buttons, desktop only */
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul lavoro.' };
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

  /* ---------- signature scene: the wall, layer by layer ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var steps = scene.querySelectorAll('.wall__steps li'), cur = scene.querySelector('.wall__cur'), bar = scene.querySelector('.wall__bar');
  var boards = scene.querySelectorAll('.l2 i'), mesh = scene.querySelector('.l3 path'), secs = scene.querySelectorAll('.wall__section span');
  function setStep(i) {
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    cur.textContent = '0' + (i + 1);
  }
  function build() {
    var phone = window.innerWidth <= 700;
    gsap.set(boards, { opacity: 0, scale: .7, y: -30 });
    gsap.set(mesh, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(scene.querySelector('.l4'), { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(scene.querySelector('.l5'), { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(secs, { scaleY: 0, transformOrigin: 'bottom' });
    gsap.set(secs[0], { scaleY: 1 });
    gsap.set(scene.querySelector('.wall__stage'), { scale: phone ? 1 : .92, rotate: phone ? 0 : -2 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=170%' : '+=260%', pin: scene.querySelector('.wall__pin'), scrub: .6, anticipatePin: 1,
        onUpdate: function (st) {
          var p = st.progress, i = Math.min(4, Math.floor(p * 5.2));
          setStep(i);
          bar.style.setProperty('--p', p.toFixed(3));
        },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(scene.querySelector('.wall__stage'), { scale: 1, rotate: 0, duration: 1 }, 0)
      .to(boards, { opacity: 1, scale: 1, y: 0, duration: .5, stagger: .06, ease: 'power2.out' }, 1)
      .to(secs[1], { scaleY: 1, duration: .6 }, 1.2)
      .to(mesh, { strokeDashoffset: 0, duration: 1.2 }, 2.2)
      .to(secs[2], { scaleY: 1, duration: .6 }, 2.4)
      .to(scene.querySelector('.l4'), { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power1.inOut' }, 3.4)
      .to(secs[3], { scaleY: 1, duration: .6 }, 3.6)
      .to(scene.querySelector('.l5'), { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power1.inOut' }, 4.6)
      .to(secs[4], { scaleY: 1, duration: .6 }, 4.8)
      .to({}, { duration: .5 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
