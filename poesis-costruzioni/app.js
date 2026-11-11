/* POESIS Costruzioni: hero blueprint entrance, header, phone menu, anchors, reveals, count-up,
   service photo swap, drag strip, process line, magnetic buttons, phone dock, form validation,
   and the GSAP signature scene: a room wiped from "prima" to "dopo" as you scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('rm'); html.classList.add('is-ready'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + dock */
  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (dock && hero) dock.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* phone menu */
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
  window.addEventListener('resize', function () { if (window.innerWidth >= 900 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
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

  /* reveals: anything already in view shows at once */
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up: Google score and the "20 anni" from their own description */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    function fmt(v) { return v.toFixed(dec).replace('.', ','); }
    if (reduce) { el.textContent = fmt(end); return; }
    var t0 = null, dur = 1300;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end);
    }
    requestAnimationFrame(step);
  });

  /* services: hover, or the item nearest the middle of the screen, swaps the sticky photo (desktop) */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { if (window.innerWidth >= 900) showPic(it.getAttribute('data-for'), it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt || window.innerWidth < 900) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.35) showPic(best.getAttribute('data-for'), best);
    });
  }, { passive: true });

  /* strip: mouse drag on desktop, keys; touch scrolls natively */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) { if (down) strip.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (down) { down = false; strip.classList.remove('is-drag'); } });
    strip.addEventListener('dragstart', function (e) { e.preventDefault(); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.72 - r.top) / Math.max(1, r.height * 0.9)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + 0.15) / st.length || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (fine pointer only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Scrivete il vostro nome.'; },
      phone: function (v) { return v.replace(/\D/g, '').length >= 8 ? '' : 'Serve un numero di telefono valido.'; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Controllate l\'indirizzo email.'; },
      'tipo-lavoro': function (v) { return v ? '' : 'Scegliete il tipo di lavoro.'; }
    };
    function check(el) {
      var fn = rules[el.name]; if (!fn) return true;
      var msg = fn(el.value), f = el.closest('.field');
      f.classList.toggle('is-bad', !!msg);
      f.querySelector('.err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.querySelectorAll('input, select').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field') && el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      form.querySelectorAll('input[name], select[name]').forEach(function (el) {
        if (!rules[el.name]) return;
        if (!check(el)) { ok = false; if (!first) first = el; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  /* footer year */
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* signature scene: before / after wipe, pinned and scrubbed */
  var scene = d.querySelector('.scene'), ba = d.querySelector('.ba'), pct = d.querySelector('[data-pct]');
  var caps = d.querySelectorAll('.cap'), meter = d.querySelector('.ba__meter');
  function setP(p) {
    ba.style.setProperty('--p', p.toFixed(2) + '%');
    meter.style.setProperty('--k', (p / 100).toFixed(3));
    pct.textContent = Math.round(p);
    var idx = p < 30 ? 0 : (p < 72 ? 1 : 2);
    caps.forEach(function (c, i) { c.classList.toggle('is-on', i === idx); });
  }
  if (!scene || !ba) return;
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    setP(reduce ? 55 : 55);
    caps.forEach(function (c) { c.classList.add('is-on'); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  setP(0);
  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var st = { p: 0 };
      /* elements come in as the section arrives, before the pin */
      gsap.from('.scene__copy .label, .scene__copy .h2, .scene__vis, .steps-cap, .scene__quote', {
        opacity: 0, y: 28, duration: .7, stagger: .08, ease: 'power3.out',
        scrollTrigger: { trigger: scene, start: 'top 75%', toggleActions: 'play none none none' }
      });
      var tl = gsap.timeline({
        scrollTrigger: { trigger: '.scene__pin', start: 'top top', end: phone ? '+=120%' : '+=180%', pin: true, scrub: 0.6, anticipatePin: 1 }
      });
      tl.to(st, { p: 4, duration: .12, ease: 'none', onUpdate: function () { setP(st.p); } })
        .to(st, { p: 100, duration: 1, ease: 'none', onUpdate: function () { setP(st.p); } })
        .to({}, { duration: .15 });
      tl.fromTo('.ba__line i', { scale: .6 }, { scale: 1, duration: .12, ease: 'none' }, 0);
      return function () { setP(0); };
    });
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () {
    build();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
