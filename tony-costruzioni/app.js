/* Tony Costruzioni: hero curtain (yellow panel lifts, photo revealed, trowel turns once, headline lines rise), header, menu,
   anchors, reveals, count-up, timeline line, magnetic buttons, phone bar, form, and the GSAP signature scene:
   a reinforced-concrete building rises floor by floor with scroll (foundations, rebar, formwork, pour, slab, x3; infill walls,
   roof, plaster and windows), with the crane's trolley and hook following the work. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('is-menu', open);
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
      window.scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 59, behavior: reduce ? 'auto' : 'smooth' });
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
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce) { el.textContent = to; return; }
    var t0 = null; el.textContent = '0';
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1500); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  });

  /* timeline line */
  var tl = d.querySelector('[data-tl]');
  if (tl) {
    var drawT = function () { var r = tl.getBoundingClientRect(), vh = window.innerHeight; tl.style.setProperty('--p', reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / r.height)).toFixed(3)); };
    window.addEventListener('scroll', drawT, { passive: true }); window.addEventListener('resize', drawT); drawT();
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.1).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate un nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) { var first = null; req.forEach(function (f) { if (!check(f) && !first) first = f; }); if (first) { e.preventDefault(); first.focus(); } });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 1023px)', function () { return build(true); });
    mm.add('(min-width: 1024px)', function () { return build(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s, root) { return Array.prototype.slice.call((root || sec).querySelectorAll(s)); };
    var floors = q('.rc-floor'), found = q('.rc-found'), roof = q('.rc-roof'), trolley = sec.querySelector('.rc-trolley');
    var cable = q('.rc-cable'), hook = q('.rc-hook');
    var num = sec.querySelector('[data-floor]'), bar = sec.querySelector('[data-bar]'), lis = q('.phases li');
    var all = [];
    gsap.set(found, { autoAlpha: 0, y: 24 });
    gsap.set(roof, { autoAlpha: 0, y: -60 });
    gsap.set(trolley, { x: 470 });
    gsap.set(cable, { scaleY: .25, transformOrigin: '50% 0%' });
    gsap.set(hook, { y: -92 });
    gsap.set(bar, { scaleX: 0 });
    floors.forEach(function (fl) {
      var o = { bars: q('.rc-bar path', fl), form: q('.rc-form rect', fl), pour: q('.rc-pour rect', fl), props: q('.rc-props', fl), slab: q('.rc-slab', fl), wall: q('.rc-wall rect', fl), plast: q('.rc-plast rect', fl), win: q('.rc-win', fl) };
      gsap.set(o.bars, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(o.form, { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(o.pour, { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(o.props, { autoAlpha: 0 });
      gsap.set(o.slab, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(o.wall, { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(o.plast, { autoAlpha: 0 });
      gsap.set(o.win, { autoAlpha: 0, scale: .8, transformOrigin: '50% 50%' });
      all.push(o);
    });
    var T = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, 0, 1.0, 6.6, 8.0, 8.8];
    var slabAt = [];
    var hookTo = function (x, t) {
      T.to(trolley, { x: x, duration: .5, ease: 'power1.inOut' }, t)
       .to(cable, { scaleY: 1, duration: .35, ease: 'power1.in' }, t + .45)
       .to(hook, { y: 0, duration: .35, ease: 'power1.in' }, t + .45)
       .to(cable, { scaleY: .25, duration: .35 }, t + .9)
       .to(hook, { y: -92, duration: .35 }, t + .9);
    };
    T.to(found, { autoAlpha: 1, y: 0, duration: .6, stagger: .1 }, .1);
    hookTo(190, .1);
    all.forEach(function (o, f) {
      var t = 1.0 + f * 1.85;
      T.to(o.bars, { strokeDashoffset: 0, duration: .45, stagger: .006, ease: 'power1.inOut' }, t)
       .to(o.form, { scaleY: 1, duration: .3, stagger: .03 }, t + .4)
       .to(o.pour, { scaleY: 1, duration: .45, stagger: .08, ease: 'power1.inOut' }, t + .75)
       .to(o.props, { autoAlpha: 1, duration: .2 }, t + 1.1)
       .to(o.slab, { scaleX: 1, duration: .4, ease: 'power2.inOut' }, t + 1.2)
       .to(o.form, { autoAlpha: 0, duration: .25 }, t + 1.55)
       .to(o.bars, { autoAlpha: 0, duration: .25 }, t + 1.55);
      hookTo([150, 330, 230][f], t + .2);
      slabAt.push(t + 1.5);
    });
    all.forEach(function (o, f) {
      T.to(o.props, { autoAlpha: 0, duration: .3 }, 6.6 + f * .25)
       .to(o.wall, { scaleY: 1, duration: .45, stagger: .1, ease: 'power2.inOut' }, 6.6 + f * .35);
    });
    T.to(roof, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, 8.0);
    hookTo(260, 7.7);
    all.forEach(function (o, f) {
      T.to(o.plast, { autoAlpha: 1, duration: .4 }, 8.8 + f * .2)
       .to(o.win, { autoAlpha: 1, scale: 1, duration: .4 }, 9.1 + f * .2);
    });
    T.to(trolley, { x: 470, duration: .6, ease: 'power1.inOut' }, 9.2)
     .to(bar, { scaleX: 1, duration: 10, ease: 'none' }, 0)
     .to({}, { duration: .5 }, 10);

    var lastS = -1, lastF = -1;
    function sync() {
      var t = T.time(), s = 1, fl = 0;
      for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
      slabAt.forEach(function (x) { if (t >= x) fl++; });
      if (fl !== lastF) { lastF = fl; num.textContent = fl; }
      if (s !== lastS) { lastS = s; lis.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); }); }
    }
    T.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=270%', pin: true, scrub: .6, anticipatePin: 1, animation: T, invalidateOnRefresh: true });
    sync();
    return function () { st.kill(); T.progress(1).kill(); num.textContent = 3; };
  }
})();
