/* Ristrutturazioni Paiolo, Studio Luce: header, menu, anchors, reveals, hero photo parallax (slower than the page),
   accordion (one open at a time), the lamp that switches on when its band enters the screen, phone bar,
   form validation, and the GSAP signature scene: a before / after scrub where an amber light edge sweeps from
   right to left, turning a room to be gutted into the finished one while the three phases light up. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { html.classList.add('is-ready'); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var pick = a.getAttribute('data-pick'), sel = d.getElementById('f-type');
      if (pick && sel) sel.value = pick;
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla richiesta.' };
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
  /* hero parallax: the photo moves slower than the page */
  var hp = d.querySelector('.hero__media picture');
  if (hp && !reduce) {
    var tk = false;
    var par = function () { tk = false; var y = Math.min(window.scrollY, window.innerHeight * 1.2); hp.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)'; };
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(par); } }, { passive: true });
  }

  /* accordion: one open at a time */
  var accs = d.querySelectorAll('.acc__it');
  accs.forEach(function (a) { a.addEventListener('toggle', function () { if (a.open) accs.forEach(function (o) { if (o !== a) o.open = false; }); }); });

  /* the lamp switches on */
  var luce = d.querySelector('.luce');
  if (luce) {
    if (reduce || !('IntersectionObserver' in window)) luce.classList.add('is-lit');
    else { var lo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { luce.classList.add('is-lit'); lo.disconnect(); } }, { threshold: 0.45 }); lo.observe(luce); }
  }

  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    scene(window.innerWidth < 761);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var view = sec.querySelector('.ba__view'), caps = sec.querySelectorAll('.cap'), after = sec.querySelector('.ba__after');
    var st = { p: 100 };
    var paint = function () {
      view.style.setProperty('--p', st.p.toFixed(2) + '%');
      var k = st.p > 70 ? 0 : st.p > 30 ? 1 : 2;
      caps.forEach(function (c, i) { c.classList.toggle('is-on', i === k); });
    };
    paint();
    gsap.set(after, { scale: 1.08 });
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=130%' : '+=200%', pin: sec.querySelector('.ba__pin'), scrub: 0.6, anticipatePin: 1 } });
    tl.to({}, { duration: .15 })
      .to(st, { p: 0, duration: 1, ease: 'power1.inOut', onUpdate: paint })
      .to(after, { scale: 1, duration: 1 }, '<')
      .to({}, { duration: .2 });
  }
})();
