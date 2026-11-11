/* Emilia S.r.l.s.: red curtain hero, header, full-screen phone menu, anchors, reveals, service rows unmasking,
   sticky stacked cards, method line, magnetic buttons, phone dock, form, and the GSAP signature scene:
   blueprint to building, a Modena palazzina drawn in lines and then built floor by floor with a % counter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 30); }
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
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r, .row'), function (el) { el.classList.add('is-in'); });

  /* hero photo drifts slower than the page */
  var himg = d.querySelector('.hero__vis picture');
  if (!reduce) {
    var hr = false;
    window.addEventListener('scroll', function () {
      if (hr) return; hr = true;
      requestAnimationFrame(function () {
        hr = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.3) himg.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* method line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
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

  var dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  if (dock && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { dock.classList.toggle('is-on', !en[0].isIntersecting); }, { threshold: 0.02 }).observe(hero);
  } else if (dock) dock.classList.add('is-on');

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Serve un indirizzo email valido.', message: 'Due righe sul lavoro da fare.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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
    buildScene(window.innerWidth < 960);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function buildScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); }, q1 = function (s) { return sec.querySelector(s); };
    var names = ['Si parte dal foglio', '01 · Progetto e tracciamento', '02 · Fondazioni', '03 · Struttura', '04 · Murature', '05 · Intonaco e facciata', '06 · Tetto'];
    var descs = [
      'Ogni cantiere comincia da un disegno.',
      'Il progetto si porta in cantiere: quote, fili, picchetti.',
      'Scavo, ferri d\'armatura e getto della platea.',
      'Pilastri e solai in cemento armato, piano dopo piano.',
      'Tamponamenti in laterizio tra i pilastri.',
      'Intonaco, colore, persiane e il portico al piano terra.',
      'Orditura, isolante e coppi: la casa è chiusa.'
    ];
    var pct = q1('[data-pct]'), now = q1('[data-now]'), desc = q1('[data-desc]'), lis = q('.build__list li');
    var paths = q('.bp path');
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });

    gsap.set(q('.dims'), { autoAlpha: 0 });
    gsap.set(q('.B1'), { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(q('.B2 .cc'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.B3 rect'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.plaster'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.win rect, .shut rect, .arch path, .cornice'), { autoAlpha: 0 });
    gsap.set(q('.B5'), { autoAlpha: 0, y: -40 });

    var at = [0, .2, 1.5, 2.6, 3.9, 5.1, 6.4];
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(paths, { strokeDashoffset: 0, duration: .9, stagger: .05, ease: 'power1.inOut' }, at[1])
      .to(q('.dims'), { autoAlpha: 1, duration: .3 }, at[1] + .7)
      .to(q('.B1'), { scaleY: 1, duration: .7 }, at[2])
      .to(q('.dims'), { autoAlpha: 0, duration: .3 }, at[2])
      .to(q('.B2 .cc'), { scaleY: 1, duration: .45, stagger: .08 }, at[3])
      .to(q('.B3 rect'), { scaleY: 1, duration: .4, stagger: .1 }, at[4])
      .to(q('.plaster'), { scaleY: 1, duration: .6, stagger: .15 }, at[5])
      .to(q('.cornice, .arch path'), { autoAlpha: 1, duration: .3, stagger: .05 }, at[5] + .4)
      .to(q('.win rect'), { autoAlpha: 1, duration: .2, stagger: .04 }, at[5] + .6)
      .to(q('.shut rect'), { autoAlpha: 1, duration: .2, stagger: .03 }, at[5] + .8)
      .to(paths, { autoAlpha: .18, duration: .6 }, at[5])
      .to(q('.B5'), { autoAlpha: 1, y: 0, duration: .7, ease: 'back.out(1.4)' }, at[6])
      .to({}, { duration: .6 }, at[6] + .7);

    var last = -1, total = tl.duration();
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
      var p = Math.round(Math.max(0, Math.min(1, (t - at[2]) / (at[6] + .7 - at[2]))) * 100);
      pct.textContent = p;
      if (s === last) return;
      last = s;
      now.textContent = names[s];
      desc.textContent = descs[s];
      lis.forEach(function (li) { var k = +li.getAttribute('data-step'); li.classList.toggle('is-on', k === s); li.classList.toggle('is-done', k < s); });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
    void total;
  }
})();
