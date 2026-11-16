/* Più Immobiliare: hero G (number-led: their Google rating counts up 0,0 to 5,0 and five stars pop in, beside a photo
   masked as an arched window that wipes up), header, phone menu, anchors, reveals, process line, sticky phone bar
   (Call + form, landline only), form validation, and the GSAP signature scene "Quattro motivi per passare in
   agenzia" (catalogue 7, sticky list drives the photo): pinned; scroll moves through sell / buy / rent / advice,
   the active line lights up, the photo crossfades and settles from a slow zoom, a progress bar fills. */
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

  /* process line */
  var wrapS = d.querySelector('.steps__wrap'), line = d.querySelector('.steps__line i');
  if (wrapS && line && !reduce) {
    var lp = function () {
      var r = wrapS.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    };
    window.addEventListener('scroll', lp, { passive: true });
    lp();
  }

  /* form validation */
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
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* hero figure: the Google rating counts up once, with the stars */
  var cn = d.querySelector('[data-count]');
  if (cn && !reduce) {
    var to = parseFloat(cn.getAttribute('data-count')), t0 = null;
    cn.textContent = '0,0';
    var tick = function (ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
      cn.textContent = (to * e).toFixed(1).replace('.', ',');
      if (k < 1) requestAnimationFrame(tick);
    };
    setTimeout(function () { requestAnimationFrame(tick); }, 350);
  }

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 980px)', function () { return scene(true); });
    mm.add('(min-width: 981px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var items = [].slice.call(sec.querySelectorAll('.list__items li')), pics = [].slice.call(sec.querySelectorAll('.list__pics img'));
    var bar = sec.querySelector('.list__bar i'), stage = sec.querySelector('.list__stage');
    var nowN = sec.querySelector('[data-now-n]'), nowT = sec.querySelector('[data-now-t]'), nowS = sec.querySelector('[data-now-s]');
    var n = items.length, last = -1;
    var set = function (c) {
      if (c === last) return;
      last = c;
      items.forEach(function (x, i) { x.classList.toggle('is-on', i === c); });
      pics.forEach(function (x, i) { x.classList.toggle('is-on', i === c); });
      nowN.textContent = '0' + (c + 1);
      nowT.textContent = items[c].querySelector('h3').textContent;
      nowS.textContent = items[c].querySelector('p').textContent;
    };
    set(0);
    gsap.set(stage, { autoAlpha: 0, y: 40 });
    gsap.set(bar, { scaleX: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(stage, { autoAlpha: 1, y: 0, duration: .12, ease: 'power2.out' }, 0)
      .to(bar, { scaleX: 1, duration: 1 }, 0);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=180%' : '+=260%',
      pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onUpdate: function (self) { set(Math.min(n - 1, Math.floor(self.progress * n * .999))); }
    });
    return function () { st.kill(); gsap.set([stage, bar], { clearProps: 'all' }); };
  }
})();
