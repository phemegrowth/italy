/* Raso New Edil: number-led hero with a house-shaped photo, header, circle menu, phone bar, anchors, reveals,
   count-up (14 services), accordion, drag strip, magnetic buttons, form validation,
   and the GSAP signature scene: a wall section that builds up layer by layer with the scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
  window.addEventListener('resize', function () { if (window.innerWidth >= 1000 && menu.classList.contains('is-open')) setMenu(false); });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : 60);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

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
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

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


  /* accordion with height animation */
  d.querySelectorAll('.acc__item').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__body');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 320, easing: 'ease-out' }).onfinish = function () { det.open = false; };
      } else {
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px' }, { height: h2 + 'px' }], { duration: 360, easing: 'ease-out' });
      }
    });
  });

  /* drag strip with progress */
  var strip = d.querySelector('.strip'), sbar = d.querySelector('.strip__bar');
  if (strip) {
    var upd = function () { var m = strip.scrollWidth - strip.clientWidth; var p = m > 0 ? strip.scrollLeft / m : 1; sbar.style.setProperty('--p', Math.max(.12, p).toFixed(3)); };
    strip.addEventListener('scroll', upd, { passive: true }); upd();
    var down = false, sx = 0, sl0 = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl0 = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') strip.scrollBy({ left: 300, behavior: 'smooth' }); if (e.key === 'ArrowLeft') strip.scrollBy({ left: -300, behavior: 'smooth' }); });
  }

  /* ---------- signature scene: the wall builds up ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-scene'); return; }
  html.classList.add('js-scene');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var slabs = scene.querySelectorAll('.slab'), items = scene.querySelectorAll('.wall__list li'), cnt = scene.querySelector('.wall__count b');
  var cur = -1, n = slabs.length;
  function setI(i) {
    if (i === cur) return; cur = i;
    items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    cnt.textContent = '0' + (i + 1);
  }
  function build() {
    var phone = window.innerWidth < 700;
    gsap.set(slabs, { yPercent: -110 });
    gsap.set(scene.querySelectorAll('.pill'), { opacity: 0 });
    gsap.set(scene.querySelector('.wall__head'), { opacity: 0, y: 24 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=150%' : '+=240%', pin: scene.querySelector('.wall__pin'), scrub: .5, anticipatePin: 1,
        onUpdate: function (st) { setI(Math.max(0, Math.min(n - 1, Math.floor((st.progress - 0.04) / 0.84 * n)))); },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(scene.querySelector('.wall__head'), { opacity: 1, y: 0, duration: .3, ease: 'power2.out' }, 0);
    slabs.forEach(function (s, k) {
      tl.to(s, { yPercent: 0, duration: .7, ease: 'power2.out' }, .2 + k)
        .to(s.querySelector('.pill'), { opacity: 1, duration: .2 }, .7 + k);
    });
    tl.to({}, { duration: .6 });
    setI(0);
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
