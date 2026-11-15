/* Immobiliare Diemmeci: header, full-screen menu, anchors, reveals, step line, listings drag strip,
   phone contact bar, form validation and the GSAP signature scene:
   the word SESTRI cut out of a white layer; the scroll flies through the stem of the last letter
   until the photo of the quarter fills the screen, then the card rises. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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
  reveal(d.querySelectorAll('.steps'), function (el) { el.classList.add('is-drawn'); });

  /* listings strip: progress bar + mouse drag (touch scrolls natively) */
  var strip = d.querySelector('.strip'), bar = d.querySelector('.strip__bar i');
  if (strip && bar) {
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var vis = strip.clientWidth / strip.scrollWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      bar.style.transform = 'translateX(' + (p * (1 - vis) * 100 / vis).toFixed(2) + '%) scaleX(' + vis.toFixed(3) + ')';
    };
    bar.style.transformOrigin = '0 50%';
    strip.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = strip.scrollLeft; });
    window.addEventListener('mouseup', function () { if (down) { down = false; strip.classList.remove('is-drag'); } });
    strip.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.pageX - sx;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = sl - dx;
    });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe su cosa cercate.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
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
    mm.add('(min-width: 761px)', function () { return maskScene(false); });
    mm.add('(max-width: 760px)', function () { return maskScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function maskScene(small) {
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage');
    var svg = sec.querySelector('.scene__mask'), word = d.getElementById('word');
    var photo = sec.querySelector('.scene__photo'), kick = sec.querySelector('.scene__kicker span'), card = sec.querySelector('.scene__card');
    /* origin: centre of the stem of the last letter (I), a solid stroke */
    function origin() {
      var n = word.getNumberOfChars(), ext;
      try { ext = word.getExtentOfChar(n - 1); } catch (e) { ext = null; }
      var ctm = svg.getScreenCTM(), r = svg.getBoundingClientRect();
      if (!ext || !ctm || !ext.width) return '50% 50%';
      var x = ext.x + ext.width / 2, y = ext.y + ext.height * 0.55;
      var px = ctm.a * x + ctm.e - r.left, py = ctm.d * y + ctm.f - r.top;
      return px.toFixed(1) + 'px ' + py.toFixed(1) + 'px';
    }
    svg.setAttribute('viewBox', small ? '90 40 820 320' : '0 0 1000 400');
    gsap.set(svg, { scale: 1, opacity: 1, transformOrigin: origin() });
    gsap.set(kick, { opacity: 0, y: 20 });
    gsap.set(card, { opacity: 0, y: 40 });
    gsap.set(photo, { scale: 1.18 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: stage, scrub: 0.6,
        invalidateOnRefresh: true,
        onRefreshInit: function () { gsap.set(svg, { scale: 1 }); },
        onRefresh: function () { gsap.set(svg, { transformOrigin: origin() }); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(kick, { opacity: 1, y: 0, duration: 0.08 })
      .to(kick, { opacity: 0, y: -20, duration: 0.08 }, 0.18)
      .to(svg, { scale: small ? 30 : 26, duration: 0.5, ease: 'power2.in' }, 0.16)
      .to(photo, { scale: 1, duration: 0.6 }, 0.16)
      .to(svg, { opacity: 0, duration: 0.08 }, 0.6)
      .to(card, { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' }, 0.72)
      .to({}, { duration: 0.12 });
    return function () { svg.setAttribute('viewBox', '0 0 1000 400'); tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set([svg, kick, card, photo], { clearProps: 'all' }); };
  }
})();
