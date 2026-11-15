/* Edilservice: blueprint-frame hero entrance, header, full-screen menu, phone bar, anchors, reveals,
   accordion with photo swap, magnetic buttons, form validation,
   and the GSAP signature scene: a wall built layer by layer (muro, rasatura, fondo, pittura, cornici). */
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

  /* services accordion + photo swap */
  var items = d.querySelectorAll('.svc li'), swaps = d.querySelectorAll('.swap');
  function openItem(li) {
    items.forEach(function (o) { var on = o === li; o.classList.toggle('is-open', on); o.querySelector('button').setAttribute('aria-expanded', on ? 'true' : 'false'); });
    var k = li.getAttribute('data-key');
    swaps.forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-key') === k); });
  }
  items.forEach(function (li) {
    li.querySelector('button').addEventListener('click', function () { openItem(li); });
    li.addEventListener('mouseenter', function () { if (window.matchMedia('(pointer: fine)').matches) openItem(li); });
  });
  if (items.length) openItem(items[0]);

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

  /* ---------- signature scene: the wall ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-scene'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var steps = scene.querySelectorAll('.wall__steps li'), cnt = scene.querySelector('.wall__count b');
  function setStep(i) { steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); }); cnt.textContent = '0' + (i + 1); }
  function build() {
    var phone = window.innerWidth <= 700;
    var q = function (s) { return scene.querySelectorAll(s); };
    var roller = scene.querySelector('.wall__roller');
    gsap.set(q('.layer--brick'), { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(q('.layer--rasa, .layer--fondo, .layer--paint'), { clipPath: 'inset(0% 0% 100% 0%)' });
    gsap.set(q('.layer--frames rect'), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(q('.wall__text'), { opacity: 0, y: 30 });
    gsap.set(roller, { opacity: 0, yPercent: 0, top: 0 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=140%' : '+=240%', pin: scene.querySelector('.wall__pin'), scrub: .6, anticipatePin: 1,
        onUpdate: function (st) { setStep(Math.max(0, Math.min(4, Math.floor(st.progress * 5.2)))); },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    var H = function () { return scene.querySelector('.wall__stage').offsetHeight; };
    tl.to(q('.wall__text'), { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, 0)
      .to(q('.layer--brick'), { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'power1.out' }, .1);
    [['.layer--rasa', 1.1], ['.layer--fondo', 2.1], ['.layer--paint', 3.1]].forEach(function (a) {
      tl.set(roller, { opacity: 1, y: 0 }, a[1])
        .to(q(a[0]), { clipPath: 'inset(0% 0% 0% 0%)', duration: .85 }, a[1])
        .to(roller, { y: function () { return H() - 14; }, duration: .85 }, a[1])
        .set(roller, { opacity: 0 }, a[1] + .86);
    });
    tl.to(q('.layer--frames rect:not(.in)'), { strokeDashoffset: 0, duration: .6, stagger: .12 }, 4.1)
      .to(q('.layer--frames rect.in'), { strokeDashoffset: 0, duration: .5, stagger: .1 }, 4.5)
      .to({}, { duration: .3 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
