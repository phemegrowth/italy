/* Euro Al-Bek: hero entrance (the 26 counts up, the photo opens in a house shape and the yellow roof line draws, headline lines rise),
   header, full-screen menu, anchors, reveals, service list with photo swap, method progress line, magnetic buttons,
   phone contact bar, form validation, and the GSAP signature scene: a before / after wipe of a bathroom driven by the scroll,
   with the three steps (Prima, Cantiere, Dopo) changing on the way. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    html.classList.toggle('menu-open', open);
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
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count up the years (sourced: founded in 2000) */
  var n = d.querySelector('.big__n');
  if (n && !reduce) {
    var to = +n.getAttribute('data-to'), t0 = null;
    n.textContent = '0';
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
      n.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* service list: hover (desktop) or scroll position swaps the photo */
  var lis = d.querySelectorAll('.list__it'), imgs = d.querySelectorAll('.peek img');
  function show(li) {
    lis.forEach(function (x) { x.classList.toggle('is-act', x === li); });
    var k = li.getAttribute('data-img');
    imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-k') === k); });
  }
  lis.forEach(function (li) { li.addEventListener('mouseenter', function () { show(li); }); });
  if ('IntersectionObserver' in window && window.matchMedia('(min-width: 761px)').matches) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) show(e.target); }); }, { rootMargin: '-45% 0px -50% 0px' });
    lis.forEach(function (li) { lio.observe(li); });
  }

  /* method progress line */
  var steps = d.querySelector('.steps');
  if (steps && !reduce) {
    var line = steps.querySelector('.steps__line span');
    var upd = function () {
      var r = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
      line.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('preventivo'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
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

  /* GSAP signature scene: before / after */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var sec = d.querySelector('.pd');
    var phone = window.matchMedia('(max-width: 760px)').matches;
    var before = sec.querySelector('.ba__before'), ln = sec.querySelector('.ba__line'), ba = sec.querySelector('.ba');
    var sts = sec.querySelectorAll('.pd__steps li'), labs = sec.querySelectorAll('.ba__lab');
    var st = { v: 0 };
    function paint() {
      var v = st.v;
      before.style.clipPath = 'inset(0 ' + v.toFixed(2) + '% 0 0)';
      ln.style.left = (100 - v).toFixed(2) + '%';
    }
    gsap.set(ba, { opacity: 0, scale: .94 });
    gsap.set(labs, { opacity: 0 });
    paint();
    var cur = -1;
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: phone ? '+=160%' : '+=220%', pin: sec.querySelector('.pd__pin'), scrub: 0.5,
        onToggle: function (s) { scenePinned = s.isActive; bar(); },
        onUpdate: function () {
          var i = st.v < 30 ? 0 : st.v < 72 ? 1 : 2;
          if (i !== cur) { cur = i; sts.forEach(function (li, k) { li.classList.toggle('is-act', k === i); }); }
        }
      }
    });
    tl.to(ba, { opacity: 1, scale: 1, duration: .5, ease: 'power2.out' }, 0)
      .to(labs, { opacity: 1, duration: .3 }, .35)
      .to(st, { v: 100, duration: 3, ease: 'power1.inOut', onUpdate: paint }, .7)
      .to({}, { duration: .5 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
