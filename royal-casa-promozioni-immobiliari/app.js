/* Royal Casa di Walter Nicola: curtain hero (two panels part), header, full-screen menu, anchors, reveals, count-up proof
   (sourced numbers only), drag rail, timeline line, sticky phone bar, magnetic buttons, form validation, and the GSAP
   signature scene (text-mask fly-through: MILANO cut out of the page, the camera flies in through the stroke of the I). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'rm');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), bar = d.querySelector('.bar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 900 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = (id === '#milano' && html.classList.contains('is-mask')) ? 0 : header.offsetHeight - 1;
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off;
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

  /* accordion with height animation */
  d.querySelectorAll('.acc__item').forEach(function (it) {
    var b = it.querySelector('button'), p = it.querySelector('.acc__panel');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (reduce) { p.hidden = !open; return; }
      if (open) {
        p.hidden = false; var h = p.scrollHeight; p.style.height = '0px';
        requestAnimationFrame(function () { p.style.height = h + 'px'; });
        p.addEventListener('transitionend', function te() { p.style.height = ''; p.removeEventListener('transitionend', te); });
      } else {
        p.style.height = p.scrollHeight + 'px';
        requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.height = '0px'; }); });
        p.addEventListener('transitionend', function te() { p.hidden = true; p.style.height = ''; p.removeEventListener('transitionend', te); });
      }
      if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 520);
    });
  });

  /* steps line */
  var list = d.querySelector('[data-line]'), fill = d.querySelector('.tl__line i'), tick = false;
  function frame() {
    tick = false;
    if (!list || !fill) return;
    var r = list.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
  }
  if (!reduce) { window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true }); frame(); }

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Due righe sulla casa, per favore.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
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

  /* count-up (sourced numbers only: Google rating and review count) */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce) return;
    var t0 = null, dur = 1200;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), countUp);

  /* drag rail (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('mousedown', function (e) { down = true; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add('is-drag'); e.preventDefault(); });
    window.addEventListener('mouseup', function () { down = false; s.classList.remove('is-drag'); });
    window.addEventListener('mousemove', function (e) { if (down) s.scrollLeft = l0 - (e.pageX - x0); });
  });

  /* signature scene: text-mask fly-through */
  function scene() {
    var sec = d.querySelector('.mask');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('is-mask');
    var pin = sec.querySelector('.mask__pin'), svg = sec.querySelector('.mask__svg'), word = sec.querySelector('.mk-word');
    var photo = sec.querySelector('.mask__photo img'), over = sec.querySelector('.mask__over'), card = sec.querySelector('.mask__card');
    var origin = '50% 50%';
    function layout() {
      var W = pin.clientWidth, H = pin.clientHeight;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var fs = Math.min(W * 0.205, H * 0.3);
      word.setAttribute('font-size', fs.toFixed(1));
      word.setAttribute('x', (W / 2).toFixed(1));
      word.setAttribute('y', (H * 0.47 + fs * 0.36).toFixed(1));
      var b = word.getExtentOfChar(1);
      origin = (b.x + b.width / 2).toFixed(1) + 'px ' + (b.y + b.height * 0.58).toFixed(1) + 'px';
      gsap.set(svg, { transformOrigin: origin });
    }
    layout();
    ScrollTrigger.addEventListener('refreshInit', function () { gsap.set(svg, { scale: 1 }); layout(); });
    gsap.set(card, { autoAlpha: 0, y: 60 });
    gsap.set(photo, { scale: 1.3 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return window.innerWidth < 700 ? '+=150%' : '+=220%'; },
        pin: pin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
    tl.to(over, { autoAlpha: 0, y: -20, duration: 0.1 }, 0.08)
      .fromTo(svg, { scale: 1 }, { scale: 70, duration: 0.62, ease: 'power3.in', immediateRender: false }, 0.1)
      .to(photo, { scale: 1, duration: 0.7, ease: 'power1.out' }, 0.1)
      .to(svg, { autoAlpha: 0, duration: 0.06 }, 0.68)
      .to(card, { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.76)
      .to({}, { duration: 0.1 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
