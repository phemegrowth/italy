/* Metodocasa immobiliare: hero entrance, header, full-screen phone menu, anchors, reveals, service photo swap,
   count-up, review drag strip, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   the house from the logo draws itself one stroke per step (stima, annuncio, visite, proposta), the home fills in
   from the floor up, and the tick of the logo lands at the rogito. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header shrink + phone bar after the hero */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
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
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already in view shows at once */
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

  /* count-up (review count only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count');
    if (reduce) { el.textContent = end; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* services: hover or the item nearest the middle swaps the photo (desktop) */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.slist__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.35) showPic(best.getAttribute('data-for'), best);
    });
  }, { passive: true });

  /* review strip: mouse drag (touch scrolls natively) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, s0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = s0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* magnetic buttons, desktop pointer only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivi nome e cognome.', phone: 'Serve un numero per richiamarti.', email: 'Scrivi un indirizzo email valido.', message: 'Scrivi due righe su cosa ti serve.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
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
    houseScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function houseScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelector(s); };
    var segs = [q('.h-s1'), q('.h-s2'), q('.h-s3'), q('.h-s4')], tick = q('.h-tick');
    var fill = q('.h-fillrect'), img = q('.h-img');
    var steps = sec.querySelectorAll('.steps li'), cnt = q('[data-cnt]'), bar = q('[data-bar]'), now = q('[data-now]');
    var names = [
      ['', ''],
      ['Stima', 'Sopralluogo e prezzo realistico, spiegato.'],
      ['Annuncio', 'Foto, planimetria e annuncio sui portali.'],
      ['Visite', 'Le accompagniamo noi, con chi è davvero interessato.'],
      ['Proposta', 'Trattativa, proposta e compromesso, senza sorprese.'],
      ['Rogito', 'Documenti pronti e ti accompagniamo dal notaio.']
    ];

    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 960px)', big: '(min-width: 961px)' }, function (ctx) {
      var small = ctx.conditions.small;
      gsap.set(segs.concat([tick]), { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });
      gsap.set(fill, { attr: { y: 380 } });
      gsap.set(img, { scale: 1.18, transformOrigin: '50% 100%' });
      gsap.set(bar, { scaleX: 0 });

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      var stepAt = [0, 0.6, 1.8, 3.0, 4.2, 5.4];
      tl.to(segs[0], { attr: { 'stroke-dashoffset': 0 }, duration: 1 }, stepAt[1])
        .to(fill, { attr: { y: 300 }, duration: 1 }, stepAt[1])
        .to(segs[1], { attr: { 'stroke-dashoffset': 0 }, duration: 1 }, stepAt[2])
        .to(fill, { attr: { y: 200 }, duration: 1 }, stepAt[2])
        .to(segs[2], { attr: { 'stroke-dashoffset': 0 }, duration: 1 }, stepAt[3])
        .to(fill, { attr: { y: 110 }, duration: 1 }, stepAt[3])
        .to(segs[3], { attr: { 'stroke-dashoffset': 0 }, duration: 1 }, stepAt[4])
        .to(fill, { attr: { y: 0 }, duration: 1 }, stepAt[4])
        .to(img, { scale: 1, duration: 4.8 }, stepAt[1])
        .to(tick, { attr: { 'stroke-dashoffset': 0 }, duration: .9, ease: 'power2.out' }, stepAt[5])
        .to(bar, { scaleX: 1, duration: 6.3 }, 0)
        .to({}, { duration: .5 }, 6.3);

      var last = -1;
      function sync() {
        var t = tl.time(), s = 0;
        for (var j = 1; j < stepAt.length; j++) if (t >= stepAt[j]) s = j;
        if (s === last) return;
        last = s;
        var n = Math.max(1, s);
        cnt.textContent = '0' + n;
        steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); });
        if (now) now.innerHTML = names[n][0] + '<small>' + names[n][1] + '</small>';
      }
      tl.eventCallback('onUpdate', sync);
      sync();

      ScrollTrigger.create({
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
        pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
      });
      return function () { tl.kill(); };
    });
  }
})();
