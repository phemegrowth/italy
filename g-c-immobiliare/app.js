/* G&C Immobiliare: curtain hero, header, menu, anchors, reveals, count-up, service list that swaps the photo,
   method line drawn by scroll, review drag strip, sticky phone bar, form validation, and the GSAP signature scene:
   "MILANO" cut out of a green layer, the scroll flies through the stroke of the I into a Milanese facade. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var line = d.querySelector('.how__line b'), steps = d.querySelector('.how__steps');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
    if (line && steps && !reduce) {
      var r = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
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

  /* services: active item swaps the photo (scroll on phones, hover/focus on desktop) */
  var items = d.querySelectorAll('.svc__list li'), pics = d.querySelectorAll('.svc__pics img');
  function setSvc(i) {
    items.forEach(function (x) { x.classList.toggle('is-on', +x.getAttribute('data-i') === i); });
    pics.forEach(function (p) { p.classList.toggle('is-on', +p.getAttribute('data-pic') === i); });
  }
  items.forEach(function (li) {
    var i = +li.getAttribute('data-i');
    li.addEventListener('mouseenter', function () { setSvc(i); });
    li.addEventListener('focus', function () { setSvc(i); });
  });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) setSvc(+e.target.getAttribute('data-i')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { sio.observe(li); });
  }

  /* review strip: mouse drag (touch scrolls natively) */
  var strip = d.querySelector('.rev__strip');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); strip.style.scrollSnapType = 'none'; });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); strip.style.scrollSnapType = ''; });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx); });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla casa.' };
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
    var stage = sec.querySelector('.fly__stage'), svg = sec.querySelector('.fly__mask'), word = sec.querySelector('.fly__measure');
    var photo = sec.querySelector('.fly__photo img'), tag = sec.querySelector('.fly__tag'), copy = sec.querySelector('.fly__copy');
    var origin = '50% 50%';
    function fit() {
      gsap.set(svg, { scale: 1, opacity: 1 });
      var W = stage.clientWidth, H = stage.clientHeight, bb;
      try { bb = word.getBBox(); } catch (e) { bb = null; }
      if (!bb || !bb.width) return;
      var vbW = bb.width / (small ? 0.9 : 0.78), vbH = vbW * H / W;
      var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      svg.setAttribute('viewBox', (cx - vbW / 2) + ' ' + (cy - vbH / 2) + ' ' + vbW + ' ' + vbH);
      /* centre of the I stroke (second letter) in screen pixels */
      var ex;
      try { ex = word.getExtentOfChar(1); } catch (e) { ex = null; }
      var k = W / vbW, ox = W / 2, oy = H / 2;
      if (ex && ex.width) { ox = (ex.x + ex.width / 2 - (cx - vbW / 2)) * k; oy = (ex.y + ex.height * 0.55 - (cy - vbH / 2)) * k; }
      origin = ox.toFixed(1) + 'px ' + oy.toFixed(1) + 'px';
      gsap.set(svg, { transformOrigin: origin });
    }
    fit();
    gsap.set(photo, { scale: 1.18 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.fromTo(svg, { scale: 1.06 }, { scale: 1, duration: .6, ease: 'power1.out' }, 0)
      .to(tag, { autoAlpha: 0, y: -10, duration: .3 }, .55)
      .to(svg, { scale: 24, duration: 1.9, ease: 'power3.in' }, .7)
      .to(photo, { scale: 1, duration: 2.6, ease: 'power1.out' }, .2)
      .to(svg, { opacity: 0, duration: .25 }, 2.4)
      .to(copy, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, 2.55)
      .to({}, { duration: .5 });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onRefreshInit: fit
    });
    return function () { st.kill(); tl.kill(); gsap.set([svg, photo, tag, copy], { clearProps: 'all' }); svg.setAttribute('viewBox', '0 0 1000 600'); };
  }
})();
