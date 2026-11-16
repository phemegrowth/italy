/* LG costruzioni homepage. Signature scene (catalogue 4, before / after scrub): the stage pins, the frame
   opens, and scroll moves the wipe from the room under works to the finished room while three captions
   (demolizioni, muri e pavimenti, tinteggiatura) light up in turn. Also: drag strip with mouse drag.
   Shared block (menu, reveals, form) below. */
(function () {
  var drag = document.querySelector('.drag');
  if (!drag) return;
  var down = false, x0 = 0, s0 = 0;
  drag.addEventListener('mousedown', function (e) { down = true; x0 = e.pageX; s0 = drag.scrollLeft; drag.classList.add('is-down'); });
  window.addEventListener('mouseup', function () { down = false; drag.classList.remove('is-down'); });
  drag.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); drag.scrollLeft = s0 - (e.pageX - x0) * 1.2; });
})();
window.__scene = function (c) {
  var d = c.d, sec = d.querySelector('.ba');
  if (!sec) return;
  if (c.reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('no-scene'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var q = function (s) { return sec.querySelector(s); };
  var frame = q('.ba__frame'), caps = sec.querySelectorAll('.ba__caps li');
  var small = window.innerWidth < 700;
  var st = { cut: 100 };
  function apply() { frame.style.setProperty('--cut', st.cut.toFixed(2) + '%'); }
  function setOn(k) { caps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-i') === k); }); }
  apply();
  gsap.set([q('.ba__head .label'), q('.ba__head .h2')], { autoAlpha: 0, y: 24 });
  gsap.set(frame, { clipPath: 'inset(12% 18% 12% 18%)' });
  gsap.set([q('.ba__caps'), q('.ba__note')], { autoAlpha: 0 });
  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: q('.ba__pin'), scrub: 0.6,
      onUpdate: function (s) { var t = s.progress; setOn(t < 0.25 ? -1 : t < 0.5 ? 0 : t < 0.75 ? 1 : 2); }
    }
  });
  tl.to([q('.ba__head .label'), q('.ba__head .h2')], { autoAlpha: 1, y: 0, duration: 0.08, stagger: 0.02, ease: 'power2.out' }, 0)
    .to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.18, ease: 'power2.inOut' }, 0.04)
    .to([q('.ba__caps'), q('.ba__note')], { autoAlpha: 1, duration: 0.06 }, 0.16)
    .to(st, { cut: 0, duration: 0.7, onUpdate: apply, ease: 'power1.inOut' }, 0.24)
    .to({}, { duration: 0.06 });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
};
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-pinned') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already on screen shows at once) */
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

  /* progress line on the steps */
  var steps = d.querySelector('[data-line]'), tick = false;
  function frame() {
    tick = false;
    var vh = window.innerHeight;
    if (steps) {
      var s = steps.getBoundingClientRect();
      steps.style.setProperty('--p', Math.min(1, Math.max(0, (vh * 0.8 - s.top) / (s.height * 0.9))).toFixed(4));
    }
    if (window.__onFrame) window.__onFrame(vh);
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  } else if (steps) steps.style.setProperty('--p', 1);

  /* years counted up (a quantity: years since a sourced year) */
  d.querySelectorAll('[data-years]').forEach(function (el) {
    var to = new Date().getFullYear() - parseInt(el.getAttribute('data-years'), 10);
    el.textContent = to;
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null, dur = 1400;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* magnetic buttons, desktop only */
  if (!reduce && fine) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate un nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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
  d.querySelectorAll('[data-year]').forEach(function (yy) { yy.textContent = new Date().getFullYear(); });

  /* page-specific scene, built after fonts are ready */
  window.__ctx = { d: d, reduce: reduce, fine: fine };
  function go() { if (window.__scene) window.__scene(window.__ctx); }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(go); else go();
})();
