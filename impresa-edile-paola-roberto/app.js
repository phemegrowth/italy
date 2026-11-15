/* Impresa edile Di Paola Roberto: hero entrance (split, photo unmask, line reveal) and photo parallax, header, menu,
   anchors, reveals, service image swap, process line, sticky phone bar, form validation, and the GSAP signature scene
   "Il tetto, strato dopo strato": a roof section builds itself layer by layer (travi, tavolato, freno al vapore,
   isolamento, guaina e listelli, coppi) as you scroll, with a 01 / 06 counter and the matching step lit. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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

  /* services: hover or focus swaps the photo (desktop), nothing depends on it */
  var pics = d.querySelectorAll('.svc__pic img');
  d.querySelectorAll('.svc__list li').forEach(function (li) {
    function on() {
      var k = li.getAttribute('data-k');
      pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-k') === k); });
      d.querySelectorAll('.svc__list li').forEach(function (x) { x.classList.toggle('is-hot', x === li); });
    }
    li.addEventListener('mouseenter', on);
    li.addEventListener('focusin', on);
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

  /* GSAP: hero parallax, process line, signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');

    var img = d.querySelector('.hero__frame img');
    if (img) gsap.fromTo(img, { yPercent: -8 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    var mm = gsap.matchMedia();
    mm.add('(max-width: 899px)', function () { scene(true); line(true); });
    mm.add('(min-width: 900px)', function () { scene(false); line(false); });

    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function line(small) {
    var i = d.querySelector('.steps__line i');
    if (!i) return;
    gsap.fromTo(i, small ? { scaleY: 0 } : { scaleX: 0 }, Object.assign(small ? { scaleY: 1 } : { scaleX: 1 }, {
      ease: 'none', scrollTrigger: { trigger: '.steps__box', start: 'top 80%', end: small ? 'bottom 60%' : 'top 35%', scrub: .4 }
    }));
  }

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var layers = sec.querySelectorAll('.ly');
    var steps = sec.querySelectorAll('.roof__steps li');
    var num = sec.querySelector('.roof__num');
    var now = sec.querySelector('.roof__now');
    var names = ['Travi in legno', 'Tavolato', 'Freno al vapore', 'Isolamento', 'Guaina e listelli', 'Coppi'];

    gsap.set(layers[0], { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(Array.prototype.slice.call(layers, 1), { y: -90, autoAlpha: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(layers[0], { scaleY: 1, duration: 1 }, 0);
    for (var k = 1; k < layers.length; k++) tl.to(layers[k], { y: 0, autoAlpha: 1, duration: .8 }, k * 1);
    tl.to({}, { duration: .6 });

    var last = -1;
    function upd() {
      var t = tl.time(), c = Math.min(layers.length - 1, Math.max(0, Math.floor(t + 0.15)));
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i <= c); });
      num.textContent = '0' + (c + 1);
      if (now) now.innerHTML = '<b>0' + (c + 1) + '</b> <span>' + names[c] + '</span>';
    }
    tl.eventCallback('onUpdate', upd);
    upd();

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { gsap.set(layers, { clearProps: 'all' }); };
  }
})();
