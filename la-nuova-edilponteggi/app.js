/* La Nuova Edilponteggi: hero B (split screen: huge type left, a tall scaffold photo wipes in and parallaxes slower
   on the right), marquee of the five trades, header, phone menu, anchors, reveals, accordion with height animation,
   gallery with caption slide, process line, sticky phone bar (Call + form, landline only), form validation, and the
   GSAP signature scene "Su il ponteggio, giù il ponteggio": pinned; an SVG building gets its scaffold lift by lift
   (stroke drawing), the facade is redone top to bottom, then the roof, then the scaffold comes down. */
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

  /* accordion */
  d.querySelectorAll('.acc__it button').forEach(function (bt) {
    bt.addEventListener('click', function () {
      var it = bt.closest('.acc__it'), open = !it.classList.contains('is-open');
      d.querySelectorAll('.acc__it').forEach(function (x) { x.classList.remove('is-open'); x.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); bt.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* hero photo parallax: slower than the page */
  var hp = d.querySelector('.hero__pic img');
  if (hp && !reduce) {
    var tk = false;
    var par = function () { tk = false; var y = Math.min(window.scrollY, window.innerHeight * 1.2); hp.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)'; };
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(par); } }, { passive: true });
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
    var lvs = [].slice.call(sec.querySelectorAll('.lv')), paths = [].slice.call(sec.querySelectorAll('.lv .p'));
    var cf = sec.querySelector('.cf'), cr = sec.querySelector('.cr'), svg = sec.querySelector('.bld');
    var steps = sec.querySelectorAll('.scene__steps li');
    var nowN = sec.querySelector('[data-now-n]'), nowT = sec.querySelector('[data-now-t]'), nowS = sec.querySelector('[data-now-s]');
    paths.forEach(function (p) { var l = Math.ceil(p.getTotalLength()) + 2; gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    gsap.set(cf, { attr: { height: 0 } });
    gsap.set(cr, { attr: { width: 0 } });
    gsap.set(svg, { autoAlpha: 0, y: 30 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(svg, { autoAlpha: 1, y: 0, duration: .4, ease: 'power2.out' }, 0);
    lvs.forEach(function (g, i) { tl.to(g.querySelectorAll('.p'), { strokeDashoffset: 0, duration: .45, stagger: .08 }, .4 + i * .5); });
    tl.to(cf, { attr: { height: 362 }, duration: 1.3, ease: 'power1.inOut' }, 2.7)
      .to(cr, { attr: { width: 320 }, duration: 1, ease: 'power1.inOut' }, 4.2);
    lvs.slice().reverse().forEach(function (g, i) { tl.to(g, { autoAlpha: 0, y: 14, duration: .3 }, 5.5 + i * .25); });
    tl.to({}, { duration: .5 });
    var marks = [0, 2.7, 4.2, 5.5], last = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), c = 0;
      for (var i = 1; i < 4; i++) if (t >= marks[i]) c = i;
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i === c); });
      nowN.textContent = '0' + (c + 1);
      nowT.textContent = steps[c].querySelector('span').firstChild.textContent;
      nowS.textContent = steps[c].querySelector('small').textContent;
    });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=170%' : '+=280%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { st.kill(); gsap.set(paths.concat(lvs, [svg]), { clearProps: 'all' }); gsap.set(cf, { attr: { height: 362 } }); gsap.set(cr, { attr: { width: 320 } }); };
  }
})();
