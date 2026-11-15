/* OK Casa: hero fan of photo cards (CSS entrance on the first frame), header, menu, anchors, reveals, magnetic
   buttons, phone bar, form, process line and the GSAP signature scene: a pinned horizontal strip of their
   current listings, each card unmasking as it enters, with a counter and a progress bar. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * .75);
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 60), behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* magnetic buttons (desktop only) */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
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

  /* GSAP */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var small = window.innerWidth < 701;
    stripScene(small);
    lineScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function stripScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var track = sec.querySelector('[data-track]'), cards = track.querySelectorAll('.lc');
    var now = sec.querySelector('[data-now]'), bar = sec.querySelector('[data-bar]');
    var N = cards.length, last = -1;
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var D0 = dist() || 1, W = window.innerWidth;
    var enter = [].map.call(cards, function (c) { return (c.offsetLeft - W * .82) / D0; });
    gsap.set(bar, { scaleX: 1 / N });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 1.05 : 1.15)); },
        pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var i = Math.min(N - 1, Math.round(self.progress * (N - 1)));
          if (i !== last) { last = i; now.textContent = (i + 1 < 10 ? '0' : '') + (i + 1); }
        }
      }
    });
    tl.to(track, { x: function () { return -dist(); }, ease: 'none', duration: 1 }, 0)
      .to(bar, { scaleX: 1, ease: 'none', duration: 1 }, 0);
    cards.forEach(function (c, i) {
      if (enter[i] <= 0) return;
      var at = Math.min(.9, enter[i]);
      gsap.set(c, { clipPath: 'inset(0 0 0 100%)' });
      tl.to(c, { clipPath: 'inset(0 0 0 0%)', ease: 'power2.out', duration: .16 }, at);
      tl.fromTo(c.querySelector('img'), { scale: 1.18 }, { scale: 1, ease: 'power2.out', duration: .3 }, at);
    });
  }

  function lineScene() {
    var w = d.querySelector('[data-steps]');
    if (!w) return;
    var i = w.querySelector('[data-line]');
    var vertical = window.matchMedia('(max-width: 980px)').matches;
    gsap.fromTo(i, vertical ? { scaleY: 0, scaleX: 1 } : { scaleX: 0 }, {
      scaleX: 1, scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: w, start: 'top 75%', end: vertical ? 'bottom 60%' : 'top 30%', scrub: .5 }
    });
  }
})();
