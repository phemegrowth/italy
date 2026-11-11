/* PZ Ristrutturazioni: hero entrance (lockup and headline line by line, strip of their bathrooms slides in and drifts
   left on scroll), header, full-screen menu, anchors, reveals, process line, magnetic buttons, phone dock, form
   validation, and the GSAP signature scene: a bathroom wall rebuilt with scroll: old tiles fall off, new pipes draw
   in, the waterproofing rises, large tiles are laid row by row from the floor, then glass, vanity, mirror and lights. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  var strip = d.querySelector('[data-strip]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (dock) dock.classList.toggle('is-on', y > hero.offsetHeight - 160);
    if (strip && !reduce && y < window.innerHeight * 1.5) strip.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
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
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height * 0.9)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Questo indirizzo email non sembra valido.', message: 'Descrivete il lavoro in due righe.' };
    var fields = form.querySelectorAll('[required], input[type="email"]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var v = f.value.trim();
      var ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1081px)', function () { return wallScene(false); });
    mm.add('(max-width: 1080px)', function () { return wallScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  var NS = 'http://www.w3.org/2000/svg';
  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var old = sec.querySelector('[data-l="old"]');
    /* old beige tiles with a mosaic band, only used for the "before" */
    old.innerHTML = '';
    var olds = [];
    for (var r = 0; r < 13; r++) {
      for (var c = 0; c < 13; c++) {
        var t = d.createElementNS(NS, 'rect');
        t.setAttribute('x', 40 + c * 40 + 1); t.setAttribute('y', 40 + r * 40 + 1);
        t.setAttribute('width', 38); t.setAttribute('height', 38);
        t.setAttribute('fill', r === 6 ? (c % 2 ? '#B58B5E' : '#C9A579') : '#E8DDC9');
        old.appendChild(t); olds.push(t);
      }
    }
    var cards = q('.card'), steps = q('.scene__steps li');
    var pipes = Array.prototype.slice.call(q('.pp')), memb = sec.querySelector('[data-l="memb"]');
    var grout = sec.querySelector('.grout'), fx = sec.querySelector('[data-l="fx"]'), beam = sec.querySelector('.beam');
    var rows = [q('.nt[data-row="0"]'), q('.nt[data-row="1"]'), q('.nt[data-row="2"]')];

    pipes.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(memb, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(grout, { autoAlpha: 0 });
    rows.forEach(function (rw) { gsap.set(rw, { autoAlpha: 0, y: -16, scale: 1.04, transformOrigin: '50% 50%' }); });
    gsap.set(fx, { autoAlpha: 0, y: 10 });
    gsap.set(beam, { autoAlpha: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, .3, 1.8, 3.2, 4.4, 6.8];
    tl.to(olds, { y: function () { return 60 + Math.random() * 120; }, rotation: function () { return (Math.random() - .5) * 50; }, autoAlpha: 0, duration: .6, ease: 'power2.in', stagger: { each: 1.1 / olds.length, from: 'random' }, transformOrigin: '50% 50%' }, .3)
      .to(pipes, { strokeDashoffset: 0, duration: .9, ease: 'none', stagger: .12 }, 1.8)
      .to(memb, { scaleY: 1, duration: 1, ease: 'power1.inOut' }, 3.2)
      .to(grout, { autoAlpha: 1, duration: .3 }, 4.4);
    rows.forEach(function (rw, k) { tl.to(rw, { autoAlpha: 1, y: 0, scale: 1, duration: .5, ease: 'power3.out', stagger: .12 }, 4.5 + k * .7); });
    tl.to(fx, { autoAlpha: 1, y: 0, duration: .6 }, 6.8)
      .to(beam, { autoAlpha: .55, duration: .5 }, 7.5)
      .to({}, { duration: .6 }, 8);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var k = 1; k < at.length; k++) if (t >= at[k] + .1) s = k;
      if (s === last) return;
      last = s;
      cards.forEach(function (c) {
        var n = +c.getAttribute('data-card'), on = n === s;
        gsap.to(c, { autoAlpha: on ? 1 : 0, y: on ? 0 : (n < s ? -14 : 14), duration: .3, overwrite: true });
      });
      steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); });
    }
    cards.forEach(function (c) { gsap.set(c, { autoAlpha: +c.getAttribute('data-card') === 0 ? 1 : 0 }); });
    tl.eventCallback('onUpdate', sync);

    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=180%' : '+=280%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
    return function () {
      st.kill(); tl.kill(); old.innerHTML = '';
      gsap.set(pipes.concat([memb, grout, fx, beam], Array.prototype.slice.call(q('.nt')), Array.prototype.slice.call(cards)), { clearProps: 'all' });
    };
  }
})();
