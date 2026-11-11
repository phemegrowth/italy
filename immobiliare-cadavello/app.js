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
  var rs = [].slice.call(document.querySelectorAll('.r, .about__photo'));
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

  // Signature scene: from the plan to the rogito
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var built = false;
  function build() {
    if (built) return; built = true;
    var sec = document.querySelector('.plan');
    if (!sec) return;
    sec.classList.add('plan--live');
    var walls = [].slice.call(sec.querySelectorAll('.walls path'));
    var doors = [].slice.call(sec.querySelectorAll('.doors path'));
    var dims = [].slice.call(sec.querySelectorAll('.dims path'));
    walls.concat(doors, dims).forEach(function (p) { p.setAttribute('pathLength', '1'); });
    var rooms = sec.querySelectorAll('.rooms text');
    var checks = [].slice.call(sec.querySelectorAll('.checks circle, .checks path'));
    var photo = sec.querySelector('.plan__photo');
    var sts = [0, 1, 2, 3].map(function (i) { return sec.querySelector('.st[data-s="' + i + '"]'); });
    var num = sec.querySelector('.plan__num'), bar = sec.querySelector('.plan__bar i');
    var mm = gsap.matchMedia();
    mm.add({ d: '(min-width: 900px)', m: '(max-width: 899px)' }, function (ctx) {
      var isD = ctx.conditions.d;
      gsap.set(walls.concat(doors, dims), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(rooms, { opacity: 0, y: 6 });
      gsap.set(checks, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
      gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(sts, { autoAlpha: 0, y: 24 });
      gsap.set(bar, { scaleX: 0 });
      num.textContent = '01';
      var marks = [0, 1.6, 2.9, 4.2];
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: function () {
          var t = tl.time(), i = 0;
          for (var k = 0; k < marks.length; k++) if (t >= marks[k]) i = k;
          num.textContent = '0' + (i + 1);
        },
        scrollTrigger: { trigger: sec, start: 'top top', end: isD ? '+=260%' : '+=140%', scrub: 0.6, pin: true, anticipatePin: 1 }
      });
      // 1. survey: walls draw, rooms named
      tl.to(sts[0], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0)
        .to(bar, { scaleX: 0.25, duration: 0.4 }, 0)
        .to(walls, { strokeDashoffset: 0, duration: 0.8, stagger: 0.08 }, 0.05)
        .to(doors, { strokeDashoffset: 0, duration: 0.4, stagger: 0.05 }, 0.7)
        .to(rooms, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }, 0.9);
      // 2. documents: dimension lines + checks
      tl.to(sts[0], { autoAlpha: 0, y: -18, duration: 0.25 }, marks[1])
        .to(sts[1], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, marks[1] + 0.1)
        .to(bar, { scaleX: 0.5, duration: 0.4 }, marks[1])
        .to(dims, { strokeDashoffset: 0, duration: 0.6, stagger: 0.1 }, marks[1])
        .to(checks.slice(0, 4), { opacity: 1, scale: 1, duration: 0.25, stagger: 0.12, ease: 'back.out(2)' }, marks[1] + 0.4);
      // 3. mortgage and contracts: the other checks
      tl.to(sts[1], { autoAlpha: 0, y: -18, duration: 0.25 }, marks[2])
        .to(sts[2], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, marks[2] + 0.1)
        .to(bar, { scaleX: 0.75, duration: 0.4 }, marks[2])
        .to(checks.slice(4), { opacity: 1, scale: 1, duration: 0.25, stagger: 0.12, ease: 'back.out(2)' }, marks[2] + 0.2);
      // 4. rogito: the house fills the plan
      tl.to(sts[2], { autoAlpha: 0, y: -18, duration: 0.25 }, marks[3])
        .to(sts[3], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, marks[3] + 0.1)
        .to(bar, { scaleX: 1, duration: 0.4 }, marks[3])
        .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power1.inOut' }, marks[3])
        .to({}, { duration: 0.6 });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
    setTimeout(build, 1200);
  } else build();
})();
