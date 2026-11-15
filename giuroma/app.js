/* GiuRoMa: split hero (arched photo wipe, slow parallax), header, menu, anchors, reveals, list that swaps the
   photo, magnetic buttons, phone bar, form, method line and the GSAP signature scene: a wall section that builds
   up layer by layer with scroll (masonry, water, electrics, air conditioning, plaster, finishes). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * .75);
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 60), behavior: reduce ? 'auto' : 'smooth' });
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

  /* magnetic buttons (desktop only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
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

  /* hero photo parallax */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    var pf = function () {
      if (pt) return; pt = true;
      requestAnimationFrame(function () {
        pt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.3) par.style.transform = 'translate3d(0,' + (-y * 0.1).toFixed(1) + 'px,0)';
      });
    };
    window.addEventListener('scroll', pf, { passive: true });
    pf();
  }

  /* services list swaps the photo (desktop hover / focus, and while scrolling past) */
  var swap = d.querySelector('[data-swap]');
  if (swap) {
    var items = swap.querySelectorAll('li'), pics = d.querySelectorAll('.work__pics img');
    var setOn = function (k) {
      items.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
      pics.forEach(function (im, i) { im.classList.toggle('is-on', i === k); });
    };
    items.forEach(function (li, i) { li.addEventListener('mouseenter', function () { setOn(i); }); });
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) setOn([].indexOf.call(items, e.target)); }); }, { rootMargin: '-45% 0px -45% 0px' });
      items.forEach(function (li) { so.observe(li); });
    }
  }

  /* GSAP */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    wallScene(window.innerWidth < 701);
    lineScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var layers = sec.querySelectorAll('.wl-l'), labels = sec.querySelectorAll('.layers li'), now = sec.querySelector('[data-now]');
    var N = layers.length, last = -1;
    gsap.set(layers, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set([sec.querySelector('.wall'), sec.querySelector('.layers')], { opacity: 0, y: 30 });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: true, scrub: .6, anticipatePin: 1,
        onUpdate: function (self) {
          var i = Math.max(0, Math.min(N - 1, Math.floor((self.progress - .06) / .94 * N)));
          if (i !== last) {
            last = i;
            labels.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
            now.textContent = '0' + (i + 1);
          }
        }
      }
    });
    tl.to([sec.querySelector('.wall'), sec.querySelector('.layers')], { opacity: 1, y: 0, duration: .05, ease: 'power2.out' }, 0);
    layers.forEach(function (l, i) {
      tl.to(l, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9 / N * .8, ease: 'power1.inOut' }, .06 + i * (.9 / N));
    });
    tl.to({}, { duration: .06 });
  }

  function lineScene() {
    var w = d.querySelector('[data-steps]');
    if (!w) return;
    var i = w.querySelector('[data-line]');
    var vertical = window.matchMedia('(max-width: 980px)').matches;
    gsap.fromTo(i, vertical ? { scaleY: 0, scaleX: 1 } : { scaleX: 0 }, {
      scaleX: 1, scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: w, start: 'top 75%', end: vertical ? 'bottom 60%' : 'top 30%', scrub: .5 }
    });
  }
})();
