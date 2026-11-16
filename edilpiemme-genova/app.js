/* Edilpiemme: split hero with a tall photo that moves slower than the page, marquee proof, accordion,
   reveals, steps line drawn by scroll, sticky phone bar, form validation, and the GSAP signature scene
   "Un muro che consuma meno": a wall section builds up layer by layer (muratura, isolante, rete, intonaco, finitura). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var line = d.querySelector('.steps__line b'), steps = d.querySelector('.steps__row');
  var heroPic = d.querySelector('.hero__pic'), wide = window.matchMedia('(min-width: 961px)');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
    if (line && steps && !reduce) {
      var r = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      line.style.setProperty('--p', p.toFixed(3));
    }
    if (heroPic && !reduce && wide.matches && window.scrollY < window.innerHeight * 1.2) heroPic.style.transform = 'translate3d(0,' + (window.scrollY * 0.14).toFixed(1) + 'px,0)';
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

  /* count-up (years of work, sourced) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = end + suf; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1200), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = v + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* accordion with height animation (CSS grid rows) */
  d.querySelectorAll('.acc__it button').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.closest('.acc__it'), open = !it.classList.contains('is-open');
      d.querySelectorAll('.acc__it').forEach(function (x) { x.classList.remove('is-open'); x.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
      if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 600);
    });
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
    mm.add('(max-width: 760px)', function () { return scene(true); });
    mm.add('(min-width: 761px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var ly = sec.querySelectorAll('.ly'), tags = sec.querySelectorAll('.wall__tags em'), now = sec.querySelector('.wall__now'), nb = now.querySelector('b'), ns = now.querySelector('span');
    var names = Array.prototype.map.call(tags, function (t) { return t.textContent; });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    ly.forEach(function (l, i) {
      if (i === 0) tl.fromTo(l, { yPercent: 100 }, { yPercent: 0, duration: .8, ease: 'power2.inOut' }, 0);
      else tl.fromTo(l, { xPercent: 110 }, { xPercent: 0, duration: .8, ease: 'power2.inOut' }, i * .9);
      tl.fromTo(tags[i], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .3 }, i * .9 + .55);
    });
    tl.to({}, { duration: .6 });
    var last = -1;
    function upd() {
      var c = Math.max(0, Math.min(ly.length - 1, Math.floor((tl.time() + .25) / .9)));
      if (c === last) return;
      last = c;
      nb.textContent = '0' + (c + 1);
      ns.textContent = names[c];
    }
    tl.eventCallback('onUpdate', upd);
    upd();
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { st.kill(); tl.kill(); gsap.set(ly, { clearProps: 'all' }); gsap.set(tags, { clearProps: 'all' }); };
  }
})();
