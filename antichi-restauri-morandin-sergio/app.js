/* Antichi Restauri di Morandin Sergio: curtain hero, header, full-screen menu, anchors, reveals, service photo swap,
   drag strip, steps line, sticky phone bar, magnetic buttons, form validation, and the GSAP signature scene
   (layered wall: a damaged wall gets its lime plaster back, one layer per scroll step). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'rm');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), bar = d.querySelector('.bar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 900 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = (id === '#strati' && html.classList.contains('is-wall')) ? 0 : header.offsetHeight - 1;
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off;
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

  /* services: the photo follows the hovered or the visible item */
  var media = d.querySelectorAll('.svc__media img'), items = d.querySelectorAll('.svc__list li');
  function show(k) {
    media.forEach(function (m) { m.classList.toggle('is-on', m.getAttribute('data-k') === k); });
    items.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-k') === k); });
  }
  items.forEach(function (li) {
    li.addEventListener('mouseenter', function () { show(li.getAttribute('data-k')); });
  });
  if ('IntersectionObserver' in window && window.matchMedia('(min-width: 900px)').matches) {
    var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) show(e.target.getAttribute('data-k')); }); }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { sio.observe(li); });
  }

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('mousedown', function (e) { down = true; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add('is-drag'); e.preventDefault(); });
    window.addEventListener('mouseup', function () { down = false; s.classList.remove('is-drag'); });
    window.addEventListener('mousemove', function (e) { if (down) s.scrollLeft = l0 - (e.pageX - x0); });
  });

  /* steps line */
  var list = d.querySelector('[data-line]'), fill = d.querySelector('.steps__line i'), tick = false;
  function frame() {
    tick = false;
    if (!list || !fill) return;
    var r = list.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
  }
  if (!reduce) { window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true }); frame(); }

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

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Due righe sulla casa, per favore.' };
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

  /* signature scene: layered wall */
  function scene() {
    var sec = d.querySelector('.wall');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('is-wall');
    var pin = sec.querySelector('.wall__pin'), head = sec.querySelector('.wall__head');
    var layers = [1, 2, 3, 4].map(function (i) { return sec.querySelector('.wl--' + i); });
    var cuts = [1, 2, 3, 4].map(function (i) { return sec.querySelector('.wall__cut .c' + i); });
    var trowel = sec.querySelector('.wall__trowel'), steps = sec.querySelectorAll('.wall__steps li');
    var now = sec.querySelector('.wall__now'), nowB = now.querySelector('b'), nowS = now.querySelector('span');
    var names = Array.prototype.map.call(steps, function (li) { return li.querySelector('span').firstChild.textContent.trim(); });
    var cur = -1;
    function setStep(k) {
      if (k === cur) return; cur = k;
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
      nowB.textContent = '0' + k; nowS.textContent = names[k];
    }
    gsap.set(layers, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(cuts, { scaleY: 0, transformOrigin: 'top' });
    gsap.set(trowel, { left: '0%', autoAlpha: 0 });
    gsap.fromTo([head, sec.querySelector('.wall__stage')], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 80%', end: 'top 15%', scrub: 0.5 } });
    setStep(0);
    var prog = { p: 0 };
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return window.innerWidth < 700 ? '+=130%' : '+=240%'; },
        pin: pin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
    var t0 = 0.16, seg = 0.19;
    layers.forEach(function (L, i) {
      var at = t0 + i * seg;
      tl.set(trowel, { left: '0%' }, at);
      tl.to(trowel, { autoAlpha: 1, duration: 0.02 }, at);
      tl.to(L, { clipPath: 'inset(0% 0% 0% 0%)', duration: seg * 0.8 }, at);
      tl.to(trowel, { left: '100%', duration: seg * 0.8 }, at);
      tl.to(trowel, { autoAlpha: 0, duration: 0.02 }, at + seg * 0.8);
      tl.to(cuts[i], { scaleY: 1, duration: seg * 0.6 }, at + seg * 0.1);
    });
    tl.to(prog, { p: 1, duration: 0.96, onUpdate: function () {
      var t = prog.p * 0.96;
      var k = t < t0 ? 0 : Math.min(4, 1 + Math.floor((t - t0) / seg));
      setStep(k);
    } }, 0);
    tl.to({}, { duration: 0.06 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
