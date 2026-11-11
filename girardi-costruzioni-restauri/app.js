/* Girardi Costruzioni e Restauri: hero frame + photo reveal, header, full-screen menu, anchors, reveals, accordion,
   drag strip of their site photos, steps line, sticky phone bar, magnetic buttons, form validation, and the GSAP
   signature scene (blueprint to building: the elevation draws itself, then the house rises floor by floor). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('is-ready', 'rm'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + sticky bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), bar = d.querySelector('.bar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
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

  /* anchors with header offset (the pinned scene starts at its own top) */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = (id === '#progetto' && html.classList.contains('is-bp')) ? 0 : header.offsetHeight - 1;
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
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

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('mousedown', function (e) { down = true; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add('is-drag'); e.preventDefault(); });
    window.addEventListener('mouseup', function () { down = false; s.classList.remove('is-drag'); });
    window.addEventListener('mousemove', function (e) { if (down) s.scrollLeft = l0 - (e.pageX - x0); });
  });

  /* steps line draws with scroll */
  var list = d.querySelector('[data-line]'), fill = d.querySelector('.steps__line i'), tick = false;
  function frame() {
    tick = false;
    if (!list || !fill) return;
    var r = list.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
  }
  if (!reduce) { window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true }); frame(); }

  /* magnetic buttons (desktop pointer only) */
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
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla casa.' };
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

  /* signature scene: blueprint to building */
  function scene() {
    var sec = d.querySelector('.bp');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('is-bp');
    sec.classList.add('is-bp');
    var pin = sec.querySelector('.bp__pin'), stage = sec.querySelector('.bp__stage'), photo = sec.querySelector('.bp__photo');
    var img = photo.querySelector('img'), svg = sec.querySelector('.bp__svg'), paths = sec.querySelectorAll('.bp__svg .d');
    var labels = sec.querySelectorAll('.bp__labels li'), pct = sec.querySelector('.bp__pct b'), head = sec.querySelector('.bp__head');
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var st = { b: 0 };
    function setStage() {
      var b = st.b, k = b <= 0 ? 0 : Math.min(4, 1 + Math.floor(b * 4 - 0.0001));
      if (b >= 1) k = 4;
      labels.forEach(function (li, i) { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
      pct.textContent = Math.round(b * 100);
    }
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(img, { scale: 1.08 });
    gsap.set(labels, { autoAlpha: 0, x: -14 });
    gsap.fromTo(head, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 20%', scrub: 0.5 } });
    setStage();
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return window.innerWidth < 700 ? '+=140%' : '+=220%'; },
        pin: pin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
    tl.to(labels, { autoAlpha: 1, x: 0, duration: 0.06, stagger: 0.015 }, 0);
    tl.to(paths, { strokeDashoffset: 0, duration: 0.3, stagger: 0.025, ease: 'power1.inOut' }, 0.02);
    tl.to(st, { b: 1, duration: 0.5, onUpdate: setStage }, 0.4);
    tl.to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'none' }, 0.4);
    tl.to(img, { scale: 1, duration: 0.6 }, 0.4);
    tl.to(svg, { autoAlpha: 0.18, duration: 0.2 }, 0.72);
    tl.to({}, { duration: 0.08 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
