/* B.G. Ristrutturazioni Artigiane: fanned photo cards hero, header, menu, anchors, reveals, drag strip, sticky phone
   bar, form validation, and the GSAP signature scene "Prima la pianta. Poi la casa nuova.": a flat's plan draws itself
   with a % counter and four work stages, then the finished room rises from the floor up through the drawing. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var line = null, steps = null;
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
    if (line && steps && !reduce) {
      var r = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      line.style.setProperty('--p', p.toFixed(3));
    }
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

  /* services strip: mouse drag (touch scrolls natively) */
  var strip = d.querySelector('.svc__strip');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); strip.style.scrollSnapType = 'none'; });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); strip.style.scrollSnapType = ''; });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx); });
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
    var walls = sec.querySelectorAll('.w path'), doors = sec.querySelectorAll('.d path, .win path'), texts = sec.querySelectorAll('.t text');
    var photo = sec.querySelector('.plan__photo'), svg = sec.querySelector('.plan__svg'), cnt = sec.querySelector('.plan__count b'), steps = sec.querySelectorAll('.plan__steps li');
    var all = [].slice.call(walls).concat([].slice.call(doors));
    all.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(texts, { opacity: 0 });
    gsap.set(photo, { clipPath: 'inset(100% 0 0 0)' });
    var state = { p: 0 };
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(walls, { strokeDashoffset: 0, duration: 1.2, stagger: .15, ease: 'power1.inOut' }, 0)
      .to(doors, { strokeDashoffset: 0, duration: .5, stagger: .08 }, 1.0)
      .to(texts, { opacity: 1, duration: .3, stagger: .08 }, 1.3)
      .to(state, { p: 100, duration: 3.2 }, 0)
      .to(photo, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power2.inOut' }, 2.1)
      .to(svg, { opacity: .25, duration: .6 }, 2.6)
      .to({}, { duration: .5 });
    var at = [0, .9, 1.7, 2.4], last = -1;
    function upd() {
      cnt.textContent = Math.round(state.p);
      var t = tl.time(), c = 0;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) c = k;
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i <= c); });
    }
    tl.eventCallback('onUpdate', upd);
    upd();
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=230%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { st.kill(); tl.kill(); gsap.set(all.concat([].slice.call(texts), [photo, svg]), { clearProps: 'all' }); };
  }
})();
