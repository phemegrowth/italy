/* Italcostruzioni S.r.l.: fanned photo-card hero, header, menu, anchors, reveals, count-up, accordion, method line
   drawn by scroll, sticky phone bar, form validation, and the GSAP signature scene: the six projects from their own
   site on a pinned horizontal strip, each card unmasked as it enters, with a counter and progress bar. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'rm');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var line = d.querySelector('.how__bar b'), steps = d.querySelector('.how__row');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
    if (line && steps && !reduce) {
      var r = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      line.style.setProperty('--p', p.toFixed(3));
    }
    ticking = false;
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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

  /* count-up (years, sourced: "da oltre trentacinque anni") */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count');
    if (reduce) { el.textContent = end; return; }
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  });

  /* accordion: smooth height, one open at a time */
  d.querySelectorAll('.acc__i').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease-in-out' }).onfinish = function () { det.open = false; };
      } else {
        d.querySelectorAll('.acc__i[open]').forEach(function (o) { if (o !== det) o.open = false; });
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'ease-out' });
      }
    });
  });

  /* property band: preselect the form option */
  var sel = d.getElementById('f-type');
  d.querySelectorAll('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () { if (sel) sel.value = a.getAttribute('data-pick'); });
  });

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 900px)', function () { return scene(true); });
    mm.add('(min-width: 901px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var track = sec.querySelector('.proj__track'), cards = sec.querySelectorAll('.pc');
    var bar = sec.querySelector('.proj__bar b'), count = sec.querySelector('.proj__count b');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + (small ? 16 : 64)); };
    gsap.set(bar, { scaleX: 0 });
    var first = small ? 1 : Math.max(1, Math.floor((window.innerWidth - track.getBoundingClientRect().left) / (cards[0].offsetWidth + 24)));
    cards.forEach(function (c, i) { if (i >= first) { gsap.set(c.querySelector('figure'), { clipPath: 'inset(0% 0% 0% 100%)' }); gsap.set(c.querySelector('.pc__t'), { autoAlpha: 0, y: 16 }); } });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(track, { x: function () { return -dist(); }, duration: 1 }, 0)
      .to(bar, { scaleX: 1, duration: 1 }, 0);
    var n = cards.length;
    cards.forEach(function (c, i) {
      if (i < first) return;
      var t = Math.max(0, (i - first + .2) / n);
      tl.to(c.querySelector('figure'), { clipPath: 'inset(0% 0% 0% 0%)', duration: .16, ease: 'power2.out' }, t)
        .to(c.querySelector('.pc__t'), { autoAlpha: 1, y: 0, duration: .1 }, t + .06);
    });
    var last = -1;
    tl.eventCallback('onUpdate', function () {
      var k = Math.min(n - 1, Math.floor(tl.progress() * n * 0.999));
      if (k !== last) { last = k; count.textContent = '0' + (k + 1); }
    });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 1.1 : 1.25)); },
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () {
      st.kill(); tl.kill();
      gsap.set([track, bar], { clearProps: 'all' });
      cards.forEach(function (c) { gsap.set([c.querySelector('figure'), c.querySelector('.pc__t')], { clearProps: 'all' }); });
      count.textContent = '01';
    };
  }
})();
