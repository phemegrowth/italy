/* Novacase Italia: hero card fan (CSS, started on the first frame), cards drift on scroll, header, menu, anchors,
   reveals, service photo swap, timeline line, drag strip, magnetic buttons, mobile bar, form, and the GSAP
   signature scene "Un piano in più": a Torino palazzo gets a new timber storey, step by step, as you scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * .7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* hero cards: once settled, each drifts at its own speed while the hero scrolls away */
  var cards = d.querySelectorAll('[data-drift]');
  if (cards.length && !reduce) {
    setTimeout(function () {
      cards.forEach(function (c) { c.classList.add('is-settled'); });
      var tk = false;
      var drift = function () {
        if (tk) return; tk = true;
        requestAnimationFrame(function () {
          tk = false;
          var y = window.scrollY;
          if (y > window.innerHeight * 1.4) return;
          cards.forEach(function (c) { c.style.transform = 'translate3d(0,' + (-y * parseFloat(c.getAttribute('data-drift'))).toFixed(1) + 'px,0)'; });
        });
      };
      window.addEventListener('scroll', drift, { passive: true });
      drift();
    }, 1500);
  }

  /* services: hover (or the item nearest the middle of the screen) swaps the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  if (!reduce) {
    var lt = false;
    window.addEventListener('scroll', function () {
      if (lt) return; lt = true;
      requestAnimationFrame(function () {
        lt = false;
        var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
        items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
        if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
      });
    }, { passive: true });
  }

  /* timeline line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (down) s.scrollLeft = l0 - (e.clientX - x0); });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
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
    storeyScene(window.innerWidth < 701);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function storeyScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var one = function (s) { return sec.querySelector(s); };
    var steps = q('.steps2 li'), now = one('[data-now]'), bar = one('[data-bar]');
    var names = ['', "Rilievo dell'edificio", 'Cordolo e appoggi', 'Telaio portante in legno', 'Pannelli e isolamento', 'Tetto ventilato', 'Serramenti e intonaco'];

    gsap.set(q('.s-survey line, .s-survey text'), { autoAlpha: 0 });
    gsap.set(one('.s-cord'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(q('.plate'), { scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set(q('.studs rect'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.panel'), { autoAlpha: 0, y: 30 });
    gsap.set(one('.s-roof'), { autoAlpha: 0, y: -120 });
    gsap.set(one('.s-render'), { autoAlpha: 0 });
    gsap.set(q('.s-win rect'), { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, .2, 1.4, 2.4, 4.0, 5.4, 6.6];
    tl.to(q('.s-survey line'), { autoAlpha: 1, duration: .4, stagger: .12 }, at[1])
      .to(q('.s-survey text'), { autoAlpha: 1, duration: .3 }, at[1] + .5)
      .to(one('.s-cord'), { scaleX: 1, duration: .8, ease: 'power1.inOut' }, at[2])
      .to(q('.plate'), { scaleX: 1, duration: .5 }, at[3])
      .to(q('.studs rect'), { scaleY: 1, duration: .5, stagger: .08 }, at[3] + .3)
      .to(q('.s-survey line, .s-survey text'), { autoAlpha: .25, duration: .4 }, at[4])
      .to(q('.panel'), { autoAlpha: 1, y: 0, duration: .5, stagger: .22, ease: 'power3.out' }, at[4])
      .to(one('.s-roof'), { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out' }, at[5])
      .to(one('.s-render'), { autoAlpha: 1, duration: .6 }, at[6])
      .to(q('.s-win rect'), { autoAlpha: 1, scaleY: 1, duration: .4, stagger: .1 }, at[6] + .2)
      .to(q('.s-survey line, .s-survey text'), { autoAlpha: 0, duration: .3 }, at[6] + .4)
      .to(bar, { scaleX: 1, duration: 7.6, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 7.6);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
      if (s === last) return;
      last = s;
      steps.forEach(function (li) { var n = +li.getAttribute('data-step'); li.classList.toggle('is-on', n === s); li.classList.toggle('is-done', n < s); });
      if (now) now.innerHTML = s ? '<b>0' + s + '</b>' + names[s] : '';
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=240%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
