/* Ristrutturazioni Lupu: split hero with a clip-path photo wipe and parallax, header, full-screen menu, anchors, reveals,
   count-up (years, from their own bio), drag strip, steps line, sticky phone bar, magnetic buttons, form validation,
   and the GSAP signature scene (sticky list drives the photo: each service is painted in with a roller-stroke wipe). */
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
      var off = (id === '#lavori' && html.classList.contains('is-works')) ? 0 : header.offsetHeight - 1;
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
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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

  /* count-up (sourced numbers only: Google rating and review count) */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce) return;
    var t0 = null, dur = 1200;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), countUp);

  /* hero photo parallax (slower than the page), desktop and phone */
  var par = d.querySelector('[data-parallax] img'), ptick = false;
  function para() {
    ptick = false;
    var r = par.parentElement.getBoundingClientRect();
    if (r.bottom < 0) return;
    par.style.transform = 'translate3d(0,' + (-r.top * 0.18 - par.parentElement.offsetHeight * 0.08).toFixed(1) + 'px,0)';
  }
  if (par && !reduce) { window.addEventListener('scroll', function () { if (!ptick) { ptick = true; requestAnimationFrame(para); } }, { passive: true }); para(); }

  /* signature scene: sticky list drives the photo */
  function scene() {
    var sec = d.querySelector('.works');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('is-works');
    var pin = sec.querySelector('.works__pin'), items = sec.querySelectorAll('.works__list li');
    var phs = sec.querySelectorAll('.ph'), roller = sec.querySelector('.roller'), cnt = sec.querySelector('.works__count b');
    var n = phs.length, cur = -1;
    function setOn(k) {
      if (k === cur) return; cur = k;
      items.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
      cnt.textContent = '0' + (k + 1);
    }
    gsap.set(Array.prototype.slice.call(phs, 1), { clipPath: 'inset(0% 0% 0% 100%)' });
    gsap.set(sec.querySelectorAll('.ph img'), { scale: 1.12 });
    gsap.set(phs[0].querySelector('img'), { scale: 1.12 });
    gsap.fromTo([sec.querySelector('.works__head'), sec.querySelector('.works__stage')], { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 80%', end: 'top 20%', scrub: 0.5 } });
    setOn(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return window.innerWidth < 700 ? '+=260%' : '+=320%'; },
        pin: pin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (s) { setOn(Math.min(n - 1, Math.floor(s.progress * n * 0.999 + 0.12))); }
      }
    });
    var seg = 1 / n;
    tl.to(phs[0].querySelector('img'), { scale: 1, duration: seg }, 0);
    for (var i = 1; i < n; i++) {
      var at = i * seg - seg * 0.45;
      tl.set(roller, { left: '100%' }, at);
      tl.to(roller, { autoAlpha: 1, duration: 0.01 }, at);
      tl.to(phs[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: seg * 0.45, ease: 'power1.inOut' }, at);
      tl.to(roller, { left: '0%', duration: seg * 0.45, ease: 'power1.inOut' }, at);
      tl.to(roller, { autoAlpha: 0, duration: 0.01 }, at + seg * 0.45);
      tl.to(phs[i].querySelector('img'), { scale: 1, duration: seg }, at);
    }
    tl.to({}, { duration: seg * 0.4 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
