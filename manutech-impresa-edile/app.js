/* ManuTech Impresa Edile: hero A (rooftop photo with slow Ken Burns, ground panel rises, headline line by line),
   header, menu, anchors, reveals, sticky phone bar, form validation, and the GSAP signature scene
   "Un terrazzo che non fa entrare l'acqua": pinned, an isometric terrace is built by scroll, layer by layer
   (solaio, massetto delle pendenze, guaina, pavimento) falling into place with numbered badges, then the
   layers close together and the rain lands on a sealed terrace. Static fallback: the exploded section. */
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
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
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
    mm.add('(max-width: 899px)', function () { scene(true); });
    mm.add('(min-width: 900px)', function () { scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var lys = [].slice.call(sec.querySelectorAll('.ly')), badges = sec.querySelectorAll('.ly__b');
    var drops = sec.querySelectorAll('.iso__drops path'), steps = sec.querySelectorAll('.iso__steps li');
    var exploded = [330, 250, 175, 100], packed = [330, 312, 305, 293];
    var st = lys.map(function () { return { y: -260, o: 0 }; });
    function paint() { lys.forEach(function (g, i) { g.setAttribute('transform', 'translate(0 ' + st[i].y.toFixed(1) + ')'); g.style.opacity = st[i].o; }); }
    paint();
    gsap.set(drops, { opacity: 0, y: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onUpdate: paint });
    lys.forEach(function (g, i) {
      tl.to(st[i], { y: exploded[i], o: 1, duration: .8 }, i);
    });
    tl.to(drops, { opacity: 1, duration: .3 }, 2.6)
      .to(st, { y: function (i) { return packed[i]; }, duration: .9, ease: 'power2.inOut' }, 4)
      .to(badges, { opacity: 0, duration: .3 }, 4)
      .to(drops, { y: 260, opacity: 0, duration: .9, ease: 'power1.in' }, 4.1)
      .to({}, { duration: .4 });
    var last = -1;
    function upd() {
      var t = tl.time(), c = Math.min(4, Math.floor(t + .1));
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i <= c); s.classList.toggle('is-now', i === c); });
    }
    tl.eventCallback('onUpdate', function () { paint(); upd(); });
    upd();
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () {
      lys.forEach(function (g, i) { g.setAttribute('transform', 'translate(0 ' + exploded[i] + ')'); g.style.opacity = ''; });
      gsap.set([badges, drops], { clearProps: 'all' });
    };
  }
})();
