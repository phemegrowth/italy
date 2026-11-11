/* Skyline Immobiliare: hero entrance (headline lines rise, the giant name rises letter by letter, the photo reel
   slides in from the right and drifts left on scroll), header, full-screen phone menu, anchors, reveals,
   accordion (one open at a time), process line, magnetic buttons, phone contact bar, form validation, and the
   GSAP signature scene: pinned listings. Desktop: vertical scroll drives the strip of listing cards sideways,
   each card unmasks as it enters, counter and bar follow. Phone: the same cards as a deck, each slides up
   over the previous one. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var reel = d.querySelector('[data-reel]'), ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.6);
    if (reel && !reduce && y < hero.offsetHeight * 1.3 && html.classList.contains('is-ready')) {
      reel.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
    }
  }
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 58;
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

  /* accordion: one open at a time */
  var acc = d.querySelectorAll('.acc__it');
  acc.forEach(function (it) {
    it.addEventListener('toggle', function () {
      if (it.open) acc.forEach(function (o) { if (o !== it) o.open = false; });
    });
  });

  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
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

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla vostra richiesta.' };
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
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return strip(); });
    mm.add('(max-width: 699px)', function () { return deck(); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  var sec = d.querySelector('[data-scene]');
  var cards = sec ? sec.querySelectorAll('.lc') : [];
  var cnt = sec && sec.querySelector('[data-count]'), bar = sec && sec.querySelector('[data-bar]');
  function setCount(i) {
    var n = Math.max(1, Math.min(cards.length, i));
    var s = (n < 10 ? '0' : '') + n;
    if (cnt.textContent !== s) cnt.textContent = s;
  }

  function strip() {
    var track = sec.querySelector('[data-track]'), wrap = sec.querySelector('.track-wrap');
    wrap.style.overflow = 'visible';
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 40); };
    gsap.set(cards, { clipPath: 'inset(0% 0% 0% 100% round 14px)' });
    gsap.set(Array.prototype.slice.call(cards, 0, 3), { clipPath: 'inset(0% 0% 0% 0% round 14px)' });
    var tl = gsap.timeline();
    tl.to(track, { x: function () { return -dist(); }, ease: 'none', duration: 1 }, 0)
      .fromTo(bar, { scaleX: 1 / cards.length }, { scaleX: 1, ease: 'none', duration: 1 }, 0);
    Array.prototype.forEach.call(cards, function (c, i) {
      if (i < 3) return;
      tl.to(c, { clipPath: 'inset(0% 0% 0% 0% round 14px)', ease: 'power2.out', duration: .16 }, Math.max(0, (i - 3) / (cards.length - 2)) * .92);
    });
    var stt = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * 1.15 + window.innerHeight * .3); },
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onUpdate: function (self) { setCount(1 + Math.round(self.progress * (cards.length - 1))); }
    });
    return function () { stt.kill(); tl.kill(); wrap.style.overflow = ''; gsap.set([track, cards, bar], { clearProps: 'all' }); };
  }

  function deck() {
    var rest = Array.prototype.slice.call(cards, 1);
    gsap.set(rest, { yPercent: 115, rotate: function (i) { return i % 2 ? -2 : 2; } });
    var tl = gsap.timeline();
    rest.forEach(function (c, i) {
      tl.to(c, { yPercent: 0, rotate: 0, ease: 'power2.out', duration: 1 }, i)
        .to(cards[i], { scale: .94, opacity: .55, ease: 'none', duration: 1 }, i);
    });
    tl.fromTo(bar, { scaleX: 1 / cards.length }, { scaleX: 1, ease: 'none', duration: rest.length }, 0);
    var stt = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: '+=' + (rest.length * 24) + '%',
      pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onUpdate: function (self) { setCount(1 + Math.round(self.progress * rest.length)); }
    });
    return function () { stt.kill(); tl.kill(); gsap.set([cards, bar], { clearProps: 'all' }); };
  }
})();
