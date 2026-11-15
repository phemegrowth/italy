(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desk = window.matchMedia('(min-width: 900px)');

  // Year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Hero entrance on the first frame (no waiting for fonts or images)
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero && hero.classList.add('is-in'); });

  // Header shrink + phone contact bar after the hero
  var header = document.getElementById('header');
  var mbar = document.querySelector('.mbar');
  function onScroll() {
    var sy = window.scrollY || 0;
    header.classList.toggle('is-small', sy > 40);
    if (mbar && hero) mbar.classList.toggle('show', sy > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth anchor scroll with header offset
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 8);
    window.scrollTo({ top: id === '#top' ? 0 : top, behavior: reduce ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  // Menu
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  desk.addEventListener && desk.addEventListener('change', function () { setMenu(false); });

  // Reveals: things already on screen show at once, the rest on intersection
  var rs = [].slice.call(document.querySelectorAll('.r'));
  if (reduce || !('IntersectionObserver' in window)) {
    rs.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, sib = el.parentElement ? [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('r'); }) : [];
        var i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i * 80, 320) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rs.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else io.observe(el);
    });
  }

  // Listing strip progress bar + mouse drag on strips (desktop)
  var strip = document.querySelector('.strip'), sbar = document.querySelector('.strip__bar i');
  function stripBar() {
    if (!strip || !sbar) return;
    var max = strip.scrollWidth - strip.clientWidth; if (max <= 0) return;
    var track = sbar.parentElement.clientWidth - 2 * parseFloat(getComputedStyle(sbar).left || 0);
    sbar.style.setProperty('--sx', ((strip.scrollLeft / max) * (track - sbar.offsetWidth)).toFixed(1) + 'px');
  }
  strip && strip.addEventListener('scroll', stripBar, { passive: true });
  [].slice.call(document.querySelectorAll('[data-drag]')).forEach(function (el) {
    var down = false, x0 = 0, s0 = 0, moved = false;
    el.addEventListener('mousedown', function (e) { if (el.scrollWidth <= el.clientWidth) return; down = true; moved = false; x0 = e.pageX; s0 = el.scrollLeft; el.style.scrollSnapType = 'none'; el.style.cursor = 'grabbing'; e.preventDefault(); });
    window.addEventListener('mousemove', function (e) { if (!down) return; var dx = e.pageX - x0; if (Math.abs(dx) > 4) moved = true; el.scrollLeft = s0 - dx; });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; el.style.scrollSnapType = ''; el.style.cursor = ''; });
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  // Magnetic buttons (desktop pointer only)
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    [].slice.call(document.querySelectorAll('.magnet')).forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }


  // Count-up on the 45 years figure when it comes into view
  var an = document.querySelector('.about__n');
  if (an && !reduce && 'IntersectionObserver' in window) {
    var to = +an.getAttribute('data-count'); an.textContent = '0';
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = null;
      (function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3); an.textContent = Math.round(e * to); if (p < 1) requestAnimationFrame(step); })(performance.now());
    }, { threshold: 0.4 });
    o.observe(an);
  }

  // Form validation
  var form = document.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Scrivete il vostro nome.'; },
      phone: function (v) { return /^[+\d][\d\s./-]{5,}$/.test(v.trim()) ? '' : 'Serve un numero di telefono valido.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Controllate l\'indirizzo email.'; }
    };
    function check(input) {
      var f = rules[input.name]; if (!f) return true;
      var msg = f(input.value), box = input.closest('.field');
      box.classList.toggle('bad', !!msg);
      box.querySelector('.err').textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      ['name', 'phone', 'email'].forEach(function (n) { var i = form.elements[n]; if (!check(i)) { ok = false; first = first || i; } });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
    form.addEventListener('blur', function (e) { if (e.target.name && e.target.closest('.field.bad')) check(e.target); }, true);
    form.addEventListener('input', function (e) { if (e.target.closest('.field.bad')) check(e.target); });
  }

  onScroll();

  // Signature scene: Parma drawn as a map, listings light up zone by zone
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var built = false;
  function build() {
    if (built) return; built = true;
    var sec = document.querySelector('.map');
    if (!sec) return;
    sec.classList.add('map--live');
    var ring = sec.querySelector('.pm__ring'), river = sec.querySelector('.pm__river'), centre = sec.querySelector('.pm__centre');
    [ring, river, centre].forEach(function (p) { p.setAttribute('pathLength', '1'); });
    var lbl = sec.querySelectorAll('.pm__lbl text');
    var z = function (n) { return [].slice.call(sec.querySelectorAll('.pm__dots[data-z="' + n + '"] circle')); };
    var dc = z('centro'), dq = z('nord').concat(z('est'), z('sud'), z('ovest')), dout = z('fuori');
    var sts = [0, 1, 2, 3].map(function (i) { return sec.querySelector('.st[data-s="' + i + '"]'); });
    var num = sec.querySelector('.map__num'), bar = sec.querySelector('.map__bar i');
    var mm = gsap.matchMedia();
    mm.add({ d: '(min-width: 900px)', m: '(max-width: 899px)' }, function (ctx) {
      var isD = ctx.conditions.d;
      gsap.set([ring, river, centre], { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(centre, { fillOpacity: 0 });
      gsap.set(lbl, { opacity: 0 });
      gsap.set(dc.concat(dq, dout), { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
      gsap.set(sts.slice(1), { autoAlpha: 0, y: 24 });
      gsap.set(sts[0], { autoAlpha: 1, y: 0 });
      gsap.set(bar, { scaleX: 0.25 });
      var marks = [0, 1.3, 2.6, 3.9];
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: function () { var t = tl.time(), i = 0; for (var k = 0; k < 4; k++) if (t >= marks[k]) i = k; num.textContent = '0' + (i + 1); },
        scrollTrigger: { trigger: sec, start: 'top top', end: isD ? '+=270%' : '+=180%', scrub: 0.6, pin: true, anticipatePin: 1 }
      });
      tl.to(river, { strokeDashoffset: 0, duration: 0.9 }, 0.05)
        .to(ring, { strokeDashoffset: 0, duration: 1 }, 0.2)
        .to([lbl[0], lbl[1], lbl[2], lbl[3]], { opacity: 1, duration: 0.3, stagger: 0.08 }, 0.8);
      tl.to(sts[0], { autoAlpha: 0, y: -18, duration: 0.25 }, marks[1])
        .to(sts[1], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, marks[1] + 0.1)
        .to(bar, { scaleX: 0.5, duration: 0.4 }, marks[1])
        .to(centre, { strokeDashoffset: 0, duration: 0.6 }, marks[1])
        .to(centre, { fillOpacity: 1, duration: 0.3 }, marks[1] + 0.5)
        .to(lbl[5], { opacity: 1, duration: 0.2 }, marks[1] + 0.5)
        .to(dc, { scale: 1, duration: 0.25, stagger: 0.08, ease: 'back.out(2.4)' }, marks[1] + 0.6);
      tl.to(sts[1], { autoAlpha: 0, y: -18, duration: 0.25 }, marks[2])
        .to(sts[2], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, marks[2] + 0.1)
        .to(bar, { scaleX: 0.75, duration: 0.4 }, marks[2])
        .to(dq, { scale: 1, duration: 0.25, stagger: 0.06, ease: 'back.out(2.4)' }, marks[2] + 0.1);
      tl.to(sts[2], { autoAlpha: 0, y: -18, duration: 0.25 }, marks[3])
        .to(sts[3], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, marks[3] + 0.1)
        .to(bar, { scaleX: 1, duration: 0.4 }, marks[3])
        .to(lbl[4], { opacity: 1, duration: 0.2 }, marks[3])
        .to(dout, { scale: 1, duration: 0.3, stagger: 0.1, ease: 'back.out(2.4)' }, marks[3] + 0.1)
        .to({}, { duration: 0.6 });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
    setTimeout(build, 1200);
  } else build();
})();
