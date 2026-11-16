/* Edilpaba: hero G (number-led: a Genova palazzo split across the 3x3 tile grid of their logo, tiles land in a
   diagonal stagger, the navy corner tile carries "'60"), header, phone menu, anchors, reveals, services list that
   drives a photo, drag strip, process line, sticky phone bar (Call + Email, landline only), form validation, and the
   GSAP signature scene "Una facciata, strato per strato" (catalogue 5, layered wall section): pinned; stone and brick,
   then malta, intonaco, cornici and tinta wipe in one after the other into a stepped cutaway, the active layer
   lights up in the list and in the label pill. */
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

  /* services: the active line drives the photo (desktop), hover too */
  var items = [].slice.call(d.querySelectorAll('.svc__it')), pics = [].slice.call(d.querySelectorAll('.svc__pics img'));
  function setSvc(i) { items.forEach(function (x, j) { x.classList.toggle('is-on', j === i); }); pics.forEach(function (x, j) { x.classList.toggle('is-on', j === i); }); }
  items.forEach(function (it, i) { it.addEventListener('mouseenter', function () { setSvc(i); }); });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) setSvc(items.indexOf(e.target)); }); }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { sio.observe(it); });
  }

  /* work strip: drag with the mouse (touch scrolls natively) */
  var strip = d.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
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
    var lys = [].slice.call(sec.querySelectorAll('.ly')).slice(1), steps = sec.querySelectorAll('.wall__steps li');
    var tag = sec.querySelector('[data-tag]'), box = sec.querySelector('.wall__box'), copy = sec.querySelector('.wall__copy');
    var nowN = sec.querySelector('[data-now-n]'), nowT = sec.querySelector('[data-now-t]'), nowS = sec.querySelector('[data-now-s]');
    var names = ['Pietre e mattoni', 'Malta di aggrappo', 'Intonaco', 'Cornici e modanature', 'Tinta traspirante'];
    var ends = small ? ['inset(0 0 0 0%)', 'inset(0 0 0 0%)', 'inset(0 0 0 0%)', 'inset(0 0 0 0%)'] : ['inset(0 0 0 16%)', 'inset(0 0 0 32%)', 'inset(0 0 0 48%)', 'inset(0 0 0 64%)'];
    if (small) ends = ['inset(0 0 0 12%)', 'inset(0 0 0 30%)', 'inset(0 0 0 48%)', 'inset(0 0 0 66%)'];
    gsap.set(lys, { clipPath: 'inset(0 0 0 100%)' });
    gsap.set(box, { autoAlpha: 0, y: 40 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(box, { autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out' }, 0);
    lys.forEach(function (l, i) { tl.to(l, { clipPath: ends[i], duration: .8, ease: 'power1.inOut' }, .7 + i * 1); });
    tl.to({}, { duration: .5 });
    var last = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), c = 0;
      for (var i = 0; i < 4; i++) if (t > .7 + i * 1 + .4) c = i + 1;
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i === c); });
      tag.textContent = (c + 1 < 10 ? '0' : '') + (c + 1) + ' · ' + names[c];
      if (nowN) { nowN.textContent = '0' + (c + 1); nowT.textContent = steps[c].querySelector('span').firstChild.textContent; nowS.textContent = steps[c].querySelector('small').textContent; }
    });
    tag.textContent = '01 · ' + names[0];
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=160%' : '+=260%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { st.kill(); gsap.set(lys.concat([box]), { clearProps: 'all' }); };
  }
})();
