/* DA.MA Costruzioni: hero B mirrored (Genova photo left wipes up and parallaxes slower; an orange roof line
   from their logo draws over the headline), header, phone menu, anchors, reveals, service list that swaps
   the photo, process line, sticky phone bar, form validation, and the GSAP signature scene "Un palazzo di
   Genova, rifatto" (catalogue 4, before / after scrub) with their own prima / dopo facade photos: pinned,
   scroll moves an orange divider from right to left while three captions change (prima, il lavoro, dopo). */
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

  /* hero parallax: the photo moves slower than the page */
  var himg = d.querySelector('.hero__img');
  if (himg && !reduce) {
    var tk = false;
    var px = function () {
      tk = false;
      var y = Math.min(window.scrollY, window.innerHeight * 1.2);
      himg.style.transform = 'translate3d(0,' + (-y * 0.12).toFixed(1) + 'px,0)';
    };
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(px); } }, { passive: true });
  }

  /* services: photo swaps with the line under the pointer (desktop) or the one in view */
  var fig = d.querySelectorAll('.svc__fig img'), lis = d.querySelectorAll('.svc__list li');
  function showSvc(i) { fig.forEach(function (im, k) { im.classList.toggle('is-on', k === i); }); lis.forEach(function (l, k) { l.classList.toggle('is-on', k === i); }); }
  lis.forEach(function (li) {
    li.addEventListener('mouseenter', function () { showSvc(+li.getAttribute('data-i')); });
  });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) showSvc(+e.target.getAttribute('data-i')); }); }, { rootMargin: '-45% 0px -45% 0px' });
    lis.forEach(function (l) { so.observe(l); });
  }

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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 899px)', function () { return scene(true); });
    mm.add('(min-width: 900px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var before = sec.querySelector('.pd__before'), line = sec.querySelector('.pd__line'), box = sec.querySelector('.pd__box');
    var caps = sec.querySelectorAll('.pd__caps li'), tagA = sec.querySelector('.pd__tag--a'), tagB = sec.querySelector('.pd__tag--b');
    var p = { v: 0 };
    function draw() {
      var v = p.v;
      before.style.clipPath = 'inset(0 ' + (v * 100).toFixed(2) + '% 0 0)';
      line.style.transform = 'translate3d(' + ((1 - v) * box.clientWidth).toFixed(1) + 'px,0,0)';
      tagA.style.opacity = v > .9 ? 0 : 1;
      tagB.style.opacity = v < .1 ? 0 : 1;
      var c = v < .2 ? 0 : v < .8 ? 1 : 2;
      caps.forEach(function (li, k) { li.classList.toggle('is-on', k === c); });
    }
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.fromTo(box, { scale: .92, opacity: .4 }, { scale: 1, opacity: 1, duration: .25 }, 0)
      .to({}, { duration: .15 })
      .to(p, { v: 1, duration: 1, ease: 'power1.inOut', onUpdate: draw }, .3)
      .to({}, { duration: .2 });
    draw();
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
      pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { st.kill(); before.style.clipPath = ''; line.style.transform = ''; gsap.set(box, { clearProps: 'all' }); };
  }
})();
