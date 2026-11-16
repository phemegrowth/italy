/* AP Building Solutions: card-deck hero that fans into a collage, header, drop-down menu, phone bar, anchors,
   reveals, magnetic buttons, form validation, and the GSAP signature scene:
   a pinned list of five details of one renovated flat that drives the photo. */
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

  /* ---------- signature scene: five details ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-scene'); return; }
  html.classList.add('js-scene');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var items = scene.querySelectorAll('.dlist li'), photos = scene.querySelectorAll('.dph'), cnt = scene.querySelector('.det__count b'), bar = scene.querySelector('.det__bar'), now = scene.querySelector('.det__now b');
  var cur = -1, n = items.length;
  function setI(i) {
    if (i === cur) return; cur = i;
    items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    photos.forEach(function (ph, k) {
      if (k === i) gsap.fromTo(ph, { opacity: 0, clipPath: 'inset(0 0 0 100%)' }, { opacity: 1, clipPath: 'inset(0 0 0 0%)', duration: .6, ease: 'power2.out', overwrite: 'auto' });
      else gsap.to(ph, { opacity: 0, duration: .5, delay: .15, overwrite: 'auto' });
    });
    cnt.textContent = '0' + (i + 1);
    now.textContent = items[i].querySelector('h3').textContent;
  }
  function build() {
    var phone = window.innerWidth < 700;
    photos.forEach(function (ph) { ph.classList.remove('is-on'); });
    gsap.set(photos, { opacity: 0 }); gsap.set(photos[0], { opacity: 1 });
    gsap.set(scene.querySelector('.det__side'), { opacity: 0, y: 30 });
    gsap.set(scene.querySelector('.det__stage'), { clipPath: 'inset(10% 8% 10% 8%)' });
    gsap.set(scene.querySelectorAll('.dph img'), { scale: 1.16 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=160%' : '+=270%', pin: scene.querySelector('.det__pin'), scrub: .5, anticipatePin: 1,
        onUpdate: function (st) {
          var p = st.progress;
          setI(Math.max(0, Math.min(n - 1, Math.floor((p - 0.06) / 0.9 * n))));
          bar.style.setProperty('--p', Math.max(0.02, p).toFixed(3));
        },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(scene.querySelector('.det__side'), { opacity: 1, y: 0, duration: .3, ease: 'power2.out' }, 0)
      .to(scene.querySelector('.det__stage'), { clipPath: 'inset(0% 0% 0% 0%)', duration: .4, ease: 'power2.out' }, 0);
    scene.querySelectorAll('.dph img').forEach(function (im, k) { tl.to(im, { scale: 1, duration: 1.1 }, .2 + k); });
    tl.to({}, { duration: .3 });
    cur = -1; setI(0);
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
