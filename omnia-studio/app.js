/* Omnia Studio: split hero (photo wipe up, line reveal, photo parallax slower than the page), header,
   full-screen menu, anchors, reveals, listing filter chips, accordion (one open at a time), drag strip,
   magnetic buttons, phone bar, form validation, and the GSAP signature scene: the house file, five
   documents land on the desk one by one with scroll and each gets its stamp (visura, planimetria,
   conformità, ipoteche), then the key card. Reduced motion and no-JS show all documents in a grid. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.getElementById('header'), bar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var par = d.querySelector('[data-parallax] img');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * .7);
    if (par && !reduce && y < window.innerHeight * 1.6) par.style.transform = 'translate3d(0,' + (-y * .14).toFixed(1) + 'px,0)';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#pratiche' ? 0 : header.offsetHeight - 1);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r, [data-reveal-img]'), function (el) { el.classList.add('is-in'); });

  /* listing filter */
  var chips = d.querySelectorAll('.chip'), cards = d.querySelectorAll('[data-grid] .pc');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      cards.forEach(function (card, i) {
        var t = card.getAttribute('data-t') || '';
        var show = f === 'all' || t === 'all' || t.split(' ').indexOf(f) > -1;
        card.classList.toggle('is-out', !show);
        if (show && !reduce && card.animate) card.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: i * 40, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'backwards' });
      });
    });
  });

  /* accordion: one open at a time */
  var acc = d.querySelectorAll('.acc__i');
  acc.forEach(function (it) {
    it.addEventListener('toggle', function () {
      if (it.open) acc.forEach(function (o) { if (o !== it) o.open = false; });
      var p = it.querySelector('p');
      if (it.open && p && !reduce && p.animate) p.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'ease-out' });
    });
  });

  /* drag strip (mouse) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe su cosa cercate.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var v = f.value.trim(), ok = v !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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

  /* GSAP scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    buildScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function buildScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var docs = Array.prototype.slice.call(sec.querySelectorAll('.doc'));
    var stamps = docs.map(function (x) { return x.querySelector('.stamp'); });
    var steps = sec.querySelectorAll('.step'), count = sec.querySelector('[data-count]'), barEl = sec.querySelector('[data-bar]');
    var rot = [-5, 4, -3, 5, 0];
    var cur = 0;
    function setStep(n) {
      if (n === cur) return; cur = n;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i === n - 1); });
      if (count) count.textContent = '0' + n;
    }
    setStep(1);

    var mm = gsap.matchMedia();
    mm.add({ wide: '(min-width: 900px)', narrow: '(max-width: 899px)' }, function (ctx) {
      var wide = ctx.conditions.wide;
      var off = wide ? 34 : 16;
      docs.forEach(function (doc, i) {
        gsap.set(doc, { y: wide ? 520 : 380, rotation: rot[i] * 2, opacity: 0 });
      });
      stamps.forEach(function (s) { if (s) gsap.set(s, { scale: 2.2, opacity: 0 }); });
      gsap.set(barEl, { scaleX: 0 });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec, pin: sec.querySelector('.scene__pin'), start: 'top top', end: wide ? '+=240%' : '+=130%', scrub: .6,
          onUpdate: function (self) { var p = self.progress; setStep(p < .2 ? 1 : p < .4 ? 2 : p < .6 ? 3 : p < .8 ? 4 : 5); }
        }
      });
      docs.forEach(function (doc, i) {
        var t = i * 1.2;
        /* earlier docs slide back into a stack as the next one lands */
        tl.to(doc, { opacity: 1, duration: .12 }, t);
        tl.to(doc, { y: 0, x: (i - 2) * (wide ? off : off * .4), rotation: rot[i], duration: .7, ease: 'power2.out' }, t);
        for (var k = 0; k < i; k++) tl.to(docs[k], { y: '-=' + (wide ? 14 : 8), scale: '-=0.03', duration: .5 }, t);
        if (stamps[i]) tl.to(stamps[i], { scale: 1, opacity: 1, duration: .25, ease: 'back.out(3)' }, t + .7);
        tl.to({}, { duration: .25 }, t + .95);
      });
      tl.to(barEl, { scaleX: 1, duration: tl.duration() }, 0);
      return function () { setStep(1); };
    });
  }
})();
