/* M.G2P Costruzioni, Torino: type-first hero with a photo strip sliding in from the right, header, full-screen phone
   menu, anchors, reveals, sticky service counter and clip reveals, masonry captions, method line, magnetic buttons, phone
   bar, form, and the GSAP signature scene: a facade gets its external insulation with scroll (old render with heat
   escaping, insulation boards bottom-up in a staggered bond, anchors, reinforced skim with mesh, final colour). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var y = d.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var sy = window.scrollY;
    header.classList.toggle('is-small', sy > 30);
    if (mbar) mbar.classList.toggle('is-on', sy > hero.offsetHeight - 120);
  }
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.classList.contains('scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already in view shows at once */
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

  /* services: counter follows the item in view, figures unmask */
  var wis = d.querySelectorAll('.wl__it'), wc = d.querySelector('[data-wc]');
  reveal(wis, function (el) { el.classList.add('is-in'); });
  if (wc) window.addEventListener('scroll', function () {
    var mid = window.innerHeight * 0.55, best = null, bd = 1e9;
    wis.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
    if (best) wc.textContent = best.getAttribute('data-wi');
  }, { passive: true });

  /* steps: line draws with scroll, dots light up */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.mt');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
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
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: "Scriveteci in due righe cosa c'è da fare." };
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
    var req = form.querySelectorAll('[required]');
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); f.addEventListener('input', function () { if (f.closest('.field').classList.contains('has-err')) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* signature scene: the facade gets its coat */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var lis = scene.querySelectorAll('.steps5 li'), N = lis.length;
  var count = scene.querySelector('.scene__count b'), bar = scene.querySelector('.scene__bar i');
  function setState(p) {
    var k = Math.max(0, Math.min(N - 1, Math.floor(p * N * 0.999)));
    lis.forEach(function (li, i) { li.classList.toggle('is-on', i < k); li.classList.toggle('is-now', i === k); });
    count.textContent = String(k + 1).padStart(2, '0');
    bar.style.transform = 'scaleX(' + Math.max(0.02, p).toFixed(3) + ')';
  }
  function q(s) { return scene.querySelectorAll(s); }
  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', wide: '(min-width: 701px)' }, function (c) {
      var phone = c.conditions.phone;
      var rows = [];
      q('.fac__panels rect').forEach(function (r) { var k = +r.getAttribute('data-row'); (rows[k] = rows[k] || []).push(r); });
      gsap.set(q('.fac__panels rect'), { opacity: 0, y: 14 });
      gsap.set(q('.fac__dots circle'), { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(q('.fac__mesh'), { opacity: 0 });
      gsap.set(q('.fac__paint'), { scaleY: 0, transformOrigin: '50% 0%', transformBox: 'fill-box' });
      var heat = q('.fac__heat path');
      var tl = gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: scene, start: 'top top', end: phone ? '+=150%' : '+=260%', pin: scene.querySelector('.scene__pin'), scrub: 0.6, onUpdate: function (s) { setState(s.progress); } } });
      tl.fromTo(heat, { opacity: 0.5 }, { opacity: 1, duration: 0.5, yoyo: true, repeat: 1 }, 0);
      rows.forEach(function (row, i) { tl.to(row, { opacity: 1, y: 0, duration: 0.25, stagger: 0.03 }, 1 + i * 0.07); });
      tl.to(q('.fac__cracks'), { opacity: 0, duration: 0.4 }, 1.4);
      tl.to(heat, { opacity: 0.35, duration: 0.8 }, 1.2);
      tl.to(q('.fac__dots circle'), { scale: 1, duration: 0.3, stagger: { each: 0.008, from: 'end' }, ease: 'back.out(3)' }, 2.1);
      tl.to(q('.fac__mesh'), { opacity: 1, duration: 0.6 }, 3.1);
      tl.to(q('.fac__dots circle'), { opacity: 0.25, duration: 0.5 }, 3.3);
      tl.to(q('.fac__paint'), { scaleY: 1, duration: 0.8, ease: 'power1.inOut' }, 4.05);
      tl.to(heat, { opacity: 0, duration: 0.4 }, 4.3);
      tl.to({}, { duration: 0.3 });
      setState(0);
      return function () { gsap.set(q('.fac *'), { clearProps: 'all' }); };
    });
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () {
    build();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
