/* Tirabora Cantieri: hero entrance and bora wind, reel drifting left on scroll, header, full-screen menu, anchors,
   reveals, buyer/investor tabs, count-up, process line, magnetic buttons, phone dock, form validation,
   and the GSAP signature scene: a pinned horizontal timeline of nine projects from "in consegna" to June 2028,
   each card unmasking as it enters, with a 01 / 09 counter and a progress axis. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  var reel = d.querySelector('[data-reel]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (dock) dock.classList.toggle('is-on', y > hero.offsetHeight - 120);
    if (reel && !reduce && y < window.innerHeight * 1.5) reel.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
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

  /* anchors */
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

  /* reveals */
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

  /* tabs (phones) */
  var tabs = d.querySelectorAll('[role="tab"]');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) {
        var on = x === t;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        var p = d.getElementById(x.getAttribute('aria-controls'));
        p.classList.toggle('is-on', on);
        if (on) p.classList.add('is-in');
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* count-up */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count'));
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* process line */
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

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
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
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
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
    mm.add('(min-width: 761px)', function () { return timeline(false); });
    mm.add('(max-width: 760px)', function () { return timeline(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function timeline(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var track = sec.querySelector('[data-track]'), cards = sec.querySelectorAll('.pc'), bar = sec.querySelector('[data-bar]'), num = sec.querySelector('[data-n]');
    var imgs = sec.querySelectorAll('.pc__img img');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    gsap.set(bar, { scaleX: 0 });
    var tw = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 0.9 : 1)); },
        pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          gsap.set(bar, { scaleX: self.progress });
          var i = Math.min(cards.length, Math.round(self.progress * (cards.length - 1)) + 1);
          var s = (i < 10 ? '0' : '') + i;
          if (num.textContent !== s) num.textContent = s;
        }
      }
    });
    /* each card unmasks as it enters from the right (the first ones are already in view) */
    var subs = [];
    cards.forEach(function (c, k) {
      var box = c.querySelector('.pc__img'), img = imgs[k];
      if (c.getBoundingClientRect().left < window.innerWidth * 0.9) return;
      gsap.set(box, { clipPath: 'inset(0 0 0 100%)' });
      gsap.set(img, { scale: 1.25 });
      subs.push(gsap.to(box, { clipPath: 'inset(0 0 0 0%)', ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 98%', end: 'left 55%', scrub: true } }));
      subs.push(gsap.to(img, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 98%', end: 'left 30%', scrub: true } }));
    });
    return function () {
      subs.forEach(function (s) { if (s.scrollTrigger) s.scrollTrigger.kill(); s.kill(); });
      if (tw.scrollTrigger) tw.scrollTrigger.kill();
      tw.kill();
      gsap.set([track, bar].concat(Array.prototype.slice.call(sec.querySelectorAll('.pc__img, .pc__img img'))), { clearProps: 'all' });
    };
  }
})();
