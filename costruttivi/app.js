/* Costruttivi Srls: hero reel (four tall photos slide in, then drift left as you scroll; headline fixed on the left),
   line reveal, header, phone menu, anchors, reveals, marquee (CSS), drag strip, process line, magnetic buttons,
   phone bar, form validation, and the GSAP signature scene "Una trave, dal cassero al disarmo": formwork goes up,
   rebar draws in, concrete rises with a wavy edge from the pump hose, it is levelled, then the formwork comes off. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  var bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var reel = d.querySelector('[data-reel]');
  var ticking = false;
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
    if (reel && !reduce && !ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = Math.min(window.scrollY, hero.offsetHeight * 1.2);
        reel.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)';
      });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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

  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.pstep');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.03 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('mousedown', function (e) { down = true; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); s.scrollLeft = l0 - (e.pageX - x0); });
    s.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') s.scrollBy({ left: 320, behavior: 'smooth' }); if (e.key === 'ArrowLeft') s.scrollBy({ left: -320, behavior: 'smooth' }); });
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul progetto.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
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

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    pourScene(window.innerWidth < 861);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function pourScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var $ = function (s) { return sec.querySelector(s); }, $$ = function (s) { return sec.querySelectorAll(s); };
    var fl = $('.fw--l'), fr = $('.fw--r'), fb = $('.fw--b'), props = $('.props');
    var rb = $$('.rb'), bars = $$('.bars circle'), rebar = $('.rebar');
    var lvl = $('.conc__lvl'), wave = $('.conc__wave'), flat = $('.conc__flat'), hose = $('.hose'), screed = $('.screed'), done = $('.done');
    var steps = $$('.pour__steps li'), phase = $('[data-phase]'), now = $('[data-now]');
    if (small) sec.querySelector('.cast').setAttribute('viewBox', '120 40 360 390');
    var names = ['Cassero', 'Armatura', 'Getto', 'Livellatura', 'Disarmo'];

    gsap.set(fl, { x: -110, autoAlpha: 0 });
    gsap.set(fr, { x: 110, autoAlpha: 0 });
    gsap.set(fb, { y: 50, autoAlpha: 0 });
    gsap.set(props, { autoAlpha: 0 });
    rb.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: p.getAttribute('stroke-dasharray') ? null : L, strokeDashoffset: p.getAttribute('stroke-dasharray') ? 0 : L, autoAlpha: p.getAttribute('stroke-dasharray') ? 0 : 1 }); });
    gsap.set(bars, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(lvl, { y: 400 });
    gsap.set(wave, { x: 0 });
    gsap.set([flat, done], { autoAlpha: 0 });
    gsap.set(hose, { y: -140, autoAlpha: 0 });
    gsap.set(screed, { scaleX: 0, transformOrigin: '0% 50%', autoAlpha: 0 });

    var at = [0, 1.2, 2.4, 3.8, 4.8];
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(fb, { y: 0, autoAlpha: 1, duration: .6 }, 0)
      .to([fl, fr], { x: 0, autoAlpha: 1, duration: .7, stagger: .1 }, .2)
      .to(props, { autoAlpha: 1, duration: .3 }, .6)
      .to(rb, { strokeDashoffset: 0, autoAlpha: 1, duration: .7, stagger: .12, ease: 'power1.inOut' }, at[1])
      .to(bars, { scale: 1, duration: .35, stagger: .06, ease: 'back.out(2)' }, at[1] + .5)
      .to(hose, { y: 0, autoAlpha: 1, duration: .5 }, at[2])
      .to(lvl, { y: 100, duration: 1.3, ease: 'none' }, at[2] + .3)
      .to(wave, { x: -80, duration: 1.3, ease: 'none' }, at[2] + .3)
      .to(rebar, { opacity: .45, duration: .6 }, at[2] + .9)
      .to(hose, { y: -140, autoAlpha: 0, duration: .5, ease: 'power2.in' }, at[3])
      .to(screed, { scaleX: 1, autoAlpha: 1, duration: .6, ease: 'power1.inOut' }, at[3] + .2)
      .to(flat, { autoAlpha: 1, duration: .4 }, at[3] + .5)
      .to(screed, { autoAlpha: 0, duration: .3 }, at[3] + .85)
      .to(fl, { x: -130, autoAlpha: 0, duration: .7, ease: 'power2.in' }, at[4])
      .to(fr, { x: 130, autoAlpha: 0, duration: .7, ease: 'power2.in' }, at[4])
      .to(fb, { y: 60, autoAlpha: 0, duration: .7, ease: 'power2.in' }, at[4] + .1)
      .to(done, { autoAlpha: 1, duration: .4 }, at[4] + .6)
      .to({}, { duration: .6 });

    var last = -2;
    function sync() {
      var t = tl.time(), c = 0;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) c = k;
      if (c === last) return;
      last = c;
      if (phase) phase.textContent = '0' + (c + 1) + ' / 05';
      if (now) now.textContent = names[c];
      steps.forEach(function (li, i) { li.classList.toggle('is-act', i === c); li.classList.toggle('is-done', i < c); });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
