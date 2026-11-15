/* ACG Costruzioni: hero split (photo wipe + slower parallax, line reveal), header, menu, phone bar, anchors, reveals,
   count-up of the sourced 30 years, process line, magnetic buttons, form validation,
   and the GSAP signature scene: a pool built in section (scavo, vasca, guaina, rivestimento, acqua). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 80);
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
  window.addEventListener('resize', function () { if (window.innerWidth >= 1080 && menu.classList.contains('is-open')) setMenu(false); });

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

  /* drag strip */
  d.querySelectorAll('.strip').forEach(function (s) {
    var bar = s.parentNode.querySelector('.strip__bar');
    function upd() { var m = s.scrollWidth - s.clientWidth; var p = m > 0 ? s.scrollLeft / m : 1; if (bar) bar.style.setProperty('--p', (0.2 + p * 0.8).toFixed(3)); }
    s.addEventListener('scroll', upd, { passive: true }); upd();
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; s.scrollLeft = l0 - (e.clientX - x0); });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
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

  /* hero photo parallax (slower than the page) */
  var heroImg = d.querySelector('.hero__frame img');
  if (heroImg && !reduce) onFrameScroll(function () {
    var y = window.scrollY; if (y > window.innerHeight * 1.2) return;
    heroImg.style.transform = 'translate3d(0,' + (-y * 0.12 - 0).toFixed(1) + 'px,0)';
  });

  /* count-up (sourced: "da 30 anni" on their site) */
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
    }, { threshold: .4 });
    io.observe(el);
  });

  /* ---------- signature scene: the pool ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var steps = scene.querySelectorAll('.pool__steps li'), cur = scene.querySelector('.pool__cur'), meter = scene.querySelector('.pool__meter i em');
  function setStep(i) { steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); }); cur.textContent = '0' + (i + 1); }
  function build() {
    var phone = window.innerWidth <= 700;
    var q = function (s) { return scene.querySelectorAll(s); };
    if (phone) scene.querySelector('.pool__stage svg').setAttribute('viewBox', '52 60 536 286');
    gsap.set(q('.q-dig'), { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(q('.q-shell'), { opacity: 0, y: 20 });
    gsap.set(q('.q-memb'), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(q('.q-tile'), { opacity: 0 });
    gsap.set(q('.q-water'), { y: 200 });
    gsap.set(q('.q-edge rect'), { scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set(q('.q-ladder'), { opacity: 0, y: -20 });
    gsap.set(q('.pool__head, .pool__stage, .pool__steps'), { opacity: 0, y: 30 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=150%' : '+=240%', pin: scene.querySelector('.pool__pin'), scrub: .6, anticipatePin: 1,
        onUpdate: function (st) {
          var p = st.progress;
          setStep(Math.max(0, Math.min(4, Math.floor((p - 0.08) * 5.4))));
          meter.style.setProperty('--p', Math.max(0.02, p).toFixed(3));
        },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(q('.pool__head, .pool__stage, .pool__steps'), { opacity: 1, y: 0, duration: .5, stagger: .1, ease: 'power2.out' }, 0)
      .to(q('.q-dig'), { scaleY: 1, duration: .9, ease: 'power1.inOut' }, .6)
      .to(q('.q-shell'), { opacity: 1, y: 0, duration: .8, ease: 'power2.out' }, 1.7)
      .to(q('.q-memb'), { strokeDashoffset: 0, duration: 1.1 }, 2.8)
      .to(q('.q-tile'), { opacity: 1, duration: .7 }, 4)
      .to(q('.q-edge rect'), { scaleX: 1, duration: .5, ease: 'power2.out' }, 4.3)
      .to(q('.q-ladder'), { opacity: 1, y: 0, duration: .5 }, 4.6)
      .to(q('.q-water'), { y: 0, duration: 1.4, ease: 'power1.out' }, 5.2)
      .to({}, { duration: .5 });
    gsap.to(q('.q-water'), { x: -20, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
