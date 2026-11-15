/* Canonico Costruzioni: number-led hero (disc reveal, line reveal, 34-year count-up), header, menu, phone bar,
   anchors, reveals, hover photo swap, drag strip, process line, magnetic buttons, form validation,
   and the GSAP signature scene: a foundation dug and poured in section (tracciamento, scavo, magrone e ferri, getto, si sale). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* hero count-up: 34 years (registered 23 Jul 1992) */
  var hc = d.querySelector('[data-hero-count]');
  if (hc && !reduce) {
    var to = +hc.getAttribute('data-hero-count'), t0 = null;
    hc.textContent = '0';
    var run = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); hc.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(run); };
    setTimeout(function () { requestAnimationFrame(run); }, 450);
  }

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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : 64);
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

  /* services: hover (desktop) or scroll position swaps the photo */
  var pics = d.querySelectorAll('.svc__pic img'), items = d.querySelectorAll('.svc__list li');
  function showPic(i) {
    pics.forEach(function (p) { p.classList.toggle('is-on', +p.getAttribute('data-pic') === i); });
    items.forEach(function (it) { it.classList.toggle('is-on', +it.getAttribute('data-i') === i); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(+it.getAttribute('data-i')); }); });
  if (window.matchMedia('(min-width: 900px)').matches) onFrameScroll(function () {
    var mid = window.innerHeight * 0.5, best = -1, bd = 1e9;
    items.forEach(function (it, i) { var r = it.getBoundingClientRect(); var c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = i; } });
    if (best > -1 && bd < window.innerHeight * 0.35) showPic(best);
  });

  /* drag strip */
  d.querySelectorAll('.strip').forEach(function (s) {
    var bar = s.parentNode.querySelector('.strip__bar');
    function upd() { var m = s.scrollWidth - s.clientWidth; var p = m > 0 ? s.scrollLeft / m : 1; if (bar) bar.style.setProperty('--p', (0.18 + p * 0.82).toFixed(3)); }
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
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.15)));
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

  /* hero disc drifts slower than the page */
  var disc = d.querySelector('.hero__disc');
  if (disc && !reduce) onFrameScroll(function () {
    var y = window.scrollY; if (y > window.innerHeight * 1.3) return;
    disc.style.transform = 'translate3d(0,' + (y * 0.08).toFixed(1) + 'px,0) rotate(' + (y * 0.012).toFixed(2) + 'deg)';
  });

  /* ---------- signature scene: the dig ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var steps = scene.querySelectorAll('.dig__steps li'), cur = scene.querySelector('.dig__cur'), meter = scene.querySelector('.dig__meter i em');
  function setStep(i) { steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); }); cur.textContent = '0' + (i + 1); }
  function build() {
    var phone = window.innerWidth < 900;
    var q = function (s) { return scene.querySelectorAll(s); };
    if (phone) scene.querySelector('.dig__stage svg').setAttribute('viewBox', '20 0 480 330');
    gsap.set(q('.k-trace'), { strokeDashoffset: 1, attr: { 'stroke-dasharray': '1' } });
    gsap.set(q('.k-hole'), { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(q('.k-magro'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(q('.k-rebar path'), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(q('.k-slab'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.k-wall'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.k-house'), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(q('.k-exc'), { x: -170 });
    gsap.set(q('.k-arm'), { rotation: -14, svgOrigin: '120 104' });
    gsap.set(q('.k-stick'), { rotation: -18, svgOrigin: '196 52' });
    gsap.set(q('.k-lbl text'), { opacity: 0, x: 10 });
    gsap.set(q('.dig__head, .dig__stage, .dig__steps'), { opacity: 0, y: 30 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=140%' : '+=240%', pin: scene.querySelector('.dig__pin'), scrub: .6, anticipatePin: 1,
        onUpdate: function (st) {
          var p = st.progress;
          setStep(Math.max(0, Math.min(4, Math.floor((p - 0.06) * 5.3))));
          meter.style.setProperty('--p', Math.max(0.02, p).toFixed(3));
        },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(q('.dig__head, .dig__stage, .dig__steps'), { opacity: 1, y: 0, duration: .5, stagger: .1, ease: 'power2.out' }, 0)
      .to(q('.k-lbl text'), { opacity: 1, x: 0, duration: .4, stagger: .1 }, .3)
      .to(q('.k-exc'), { x: 14, duration: .7, ease: 'power2.out' }, .4)
      .to(q('.k-trace'), { strokeDashoffset: 0, duration: .8 }, .6)
      /* three bites of the bucket while the hole deepens */
      .to(q('.k-arm'), { rotation: 14, duration: .35, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 1.5)
      .to(q('.k-stick'), { rotation: 26, duration: .35, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 1.5)
      .to(q('.k-hole'), { scaleY: 1, duration: 2.1, ease: 'power1.inOut' }, 1.5)
      .to(q('.k-exc'), { x: -300, opacity: 0, duration: .7, ease: 'power2.in' }, 3.7)
      .to(q('.k-magro'), { scaleX: 1, duration: .6 }, 3.9)
      .to(q('.k-rebar path'), { strokeDashoffset: 0, duration: .8, stagger: .15 }, 4.4)
      .to(q('.k-slab'), { scaleY: 1, duration: .8, ease: 'power2.out' }, 5.4)
      .to(q('.k-wall'), { scaleY: 1, duration: .8, stagger: .1, ease: 'power2.out' }, 6.1)
      .to(q('.k-trace'), { opacity: 0, duration: .3 }, 6.4)
      .to(q('.k-house'), { strokeDashoffset: 0, duration: 1.1 }, 7)
      .to({}, { duration: .5 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
