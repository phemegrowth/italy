/* Immobiliare Maddalena Marino: hero entrance (name line by line, photo strip slides in from the right and drifts
   left on scroll), header, full-screen phone menu, anchors, reveals, count-up, tabs, magnetic buttons, phone bar,
   form validation, and the GSAP signature scene: a route drawn across a schematic Torino from the office in
   Corso Valdocco to the areas of her listings, pins dropping in one by one. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header shrink + phone bar after the hero */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up (review count only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count');
    if (reduce) { el.textContent = end; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* hero strip: slides in (CSS), then drifts left as you scroll */
  var strip = d.querySelector('[data-strip]');
  if (strip && !reduce) {
    var st = false, free = false;
    setTimeout(function () { free = true; strip.classList.add('is-free'); }, 1700);
    window.addEventListener('scroll', function () {
      if (st || !free) return; st = true;
      requestAnimationFrame(function () {
        st = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.6) strip.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* tabs with arrow keys */
  d.querySelectorAll('[data-tabs]').forEach(function (t) {
    var tabs = Array.prototype.slice.call(t.querySelectorAll('[role=tab]'));
    function sel(tab) {
      tabs.forEach(function (b) {
        var on = b === tab, p = d.getElementById(b.getAttribute('aria-controls'));
        b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
        p.hidden = !on; p.classList.toggle('is-on', on);
      });
    }
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { sel(b); });
      b.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!k) return; e.preventDefault();
        var n = tabs[(i + k + tabs.length) % tabs.length]; sel(n); n.focus();
      });
    });
  });

  /* magnetic buttons, desktop pointer only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivi nome e cognome.', phone: 'Serve un numero per richiamarti.', email: 'Scrivi un indirizzo email valido.', message: 'Scrivi due righe su cosa ti serve.' };
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
    mapScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mapScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelector(s); };
    var route = q('.mp-route'), pins = sec.querySelectorAll('[data-pin]'), rivers = sec.querySelectorAll('.mp-dora, .mp-po');
    var stops = sec.querySelectorAll('.stops li'), cnt = q('[data-cnt]'), now = q('[data-now]');
    var data = [];
    stops.forEach(function (li) { data.push([li.querySelector('b').textContent, li.querySelector('span').textContent]); });
    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 960px)', big: '(min-width: 961px)' }, function (ctx) {
      var small = ctx.conditions.small;
      gsap.set(route, { autoAlpha: 0, attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });
      gsap.set(rivers, { autoAlpha: 0, attr: { 'stroke-dasharray': 600, 'stroke-dashoffset': 600 } });
      pins.forEach(function (p) { gsap.set(p, { autoAlpha: 0, y: -18 }); });
      // route length share to each stop (approximate, matches the path segments)
      var at = [0, 0.2, 1.6, 3.0, 4.4];
      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.to(rivers, { autoAlpha: 1, duration: .15 }, 0)
        .to(rivers, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power1.inOut' }, 0)
        .to(pins[0], { autoAlpha: 1, y: 0, duration: .4, ease: 'back.out(2)' }, at[1])
        .to(route, { autoAlpha: 1, duration: .05 }, at[1] + .2)
        .to(route, { attr: { 'stroke-dashoffset': .62 }, duration: 1.2, ease: 'none' }, at[1] + .2)
        .to(pins[1], { autoAlpha: 1, y: 0, duration: .4, ease: 'back.out(2)' }, at[2])
        .to(route, { attr: { 'stroke-dashoffset': .3 }, duration: 1.2, ease: 'none' }, at[2] + .2)
        .to(pins[2], { autoAlpha: 1, y: 0, duration: .4, ease: 'back.out(2)' }, at[3])
        .to(route, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'none' }, at[3] + .2)
        .to(pins[3], { autoAlpha: 1, y: 0, duration: .4, ease: 'back.out(2)' }, at[4])
        .to({}, { duration: .8 }, at[4] + .4);
      var last = -1;
      function sync() {
        var t = tl.time(), s = 1;
        for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
        if (s === last) return;
        last = s;
        stops.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-stop') === s); });
        cnt.textContent = '0' + s;
        now.innerHTML = data[s - 1][0] + '<small>' + data[s - 1][1] + '</small>';
      }
      tl.eventCallback('onUpdate', sync);
      sync();
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%', pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
      return function () { tl.kill(); };
    });
  }
})();
