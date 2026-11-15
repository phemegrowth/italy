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
  var rs = [].slice.call(document.querySelectorAll('.r, .net__map'));
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


  // Hero reel: slow drift left while the page scrolls (transform only)
  var track = document.querySelector('.reel__track');
  if (track && !reduce) {
    var ticking = false;
    function drift() {
      ticking = false;
      var h = hero.offsetHeight, sy = Math.min(window.scrollY || 0, h);
      track.style.transform = 'translate3d(' + (-sy * (desk.matches ? 0.35 : 0.5)).toFixed(1) + 'px,0,0)';
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
  }

  // Works: the list drives the photo (desktop); taps work too
  var wItems = [].slice.call(document.querySelectorAll('.works__list li'));
  var wImgs = [].slice.call(document.querySelectorAll('.works__photo img'));
  function setWork(i) {
    wItems.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    wImgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
  }
  wItems.forEach(function (li, i) {
    var b = li.querySelector('button');
    b.addEventListener('click', function () { setWork(i); });
    if (window.matchMedia('(hover: hover)').matches) li.addEventListener('mouseenter', function () { setWork(i); });
  });

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

  // Signature scene: the Ai Fiumi site plan, lot by lot
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var built = false;
  function build() {
    if (built) return; built = true;
    var sec = document.querySelector('.plan');
    if (!sec) return;
    sec.classList.add('plan--live');
    var water = [].slice.call(sec.querySelectorAll('.site__water .d'));
    var edge = [].slice.call(sec.querySelectorAll('.site__edge .d'));
    var road = [].slice.call(sec.querySelectorAll('.site__road .d'));
    var parkLine = [].slice.call(sec.querySelectorAll('.site__park .d'));
    var parkFill = sec.querySelectorAll('.site__park .fill, .site__park circle, .site__names text:last-child');
    var names = sec.querySelectorAll('.site__names text:not(:last-child)');
    water.concat(edge, road, parkLine).forEach(function (p) { p.setAttribute('pathLength', '1'); });
    var lots = [].slice.call(sec.querySelectorAll('.lot'));
    var order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var photo = sec.querySelector('.plan__photo');
    var legend = sec.querySelector('.plan__legend');
    var sts = [0, 1, 2, 3].map(function (i) { return sec.querySelector('.st[data-s="' + i + '"]'); });
    var num = sec.querySelector('.plan__num'), bar = sec.querySelector('.plan__bar i');
    var cnt = sec.querySelector('.cnt');
    var mm = gsap.matchMedia();
    mm.add({ d: '(min-width: 900px)', m: '(max-width: 899px)' }, function (ctx) {
      var isD = ctx.conditions.d;
      gsap.set(edge.concat(road, parkLine), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(water, { strokeDasharray: 1, strokeDashoffset: 0 });
      gsap.set(parkFill, { opacity: 0 });
      gsap.set(names, { opacity: 1 });
      gsap.set(lots, { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', transformBox: 'fill-box' });
      lots.forEach(function (l) { l.classList.remove('on'); });
      gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(legend, { autoAlpha: 0 });
      gsap.set(sts.slice(1), { autoAlpha: 0, y: 24 });
      gsap.set(sts[0], { autoAlpha: 1, y: 0 });
      gsap.set(bar, { scaleX: 0 });
      var c = { n: 0 }, on = { v: 0 };
      if (cnt) cnt.textContent = '0';
      var marks = [0, 1.4, 2.8, 4.4];
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: function () {
          var t = tl.time(), i = 0;
          for (var k = 0; k < marks.length; k++) if (t >= marks[k]) i = k;
          num.textContent = '0' + (i + 1);
        },
        scrollTrigger: { trigger: sec, start: 'top top', end: isD ? '+=280%' : '+=170%', scrub: 0.6, pin: true, anticipatePin: 1 }
      });
      // 1. the place: the rivers and the edge of the old stadium area
      tl.to(bar, { scaleX: 0.25, duration: 0.4 }, 0)
        .to(edge, { strokeDashoffset: 0, duration: 0.9 }, 0.1);
      // 2. roads and the park
      tl.to(sts[0], { autoAlpha: 0, y: -18, duration: 0.25 }, marks[1])
        .to(sts[1], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, marks[1] + 0.1)
        .to(bar, { scaleX: 0.5, duration: 0.4 }, marks[1])
        .to(road, { strokeDashoffset: 0, duration: 0.7, stagger: 0.12 }, marks[1])
        .to(parkFill, { opacity: 1, duration: 0.4, stagger: 0.05 }, marks[1] + 0.5)
        .to(parkLine, { strokeDashoffset: 0, duration: 0.4 }, marks[1] + 0.7);
      // 3. eleven lots
      tl.to(sts[1], { autoAlpha: 0, y: -18, duration: 0.25 }, marks[2])
        .to(sts[2], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, marks[2] + 0.1)
        .to(bar, { scaleX: 0.75, duration: 0.4 }, marks[2])
        .to(order.map(function (i) { return lots[i]; }), { opacity: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(1.6)' }, marks[2] + 0.1)
        .to(c, { n: 11, duration: 1.1, onUpdate: function () { if (cnt) cnt.textContent = Math.round(c.n); } }, marks[2] + 0.1);
      // 4. availability, then the finished house
      tl.to(sts[2], { autoAlpha: 0, y: -18, duration: 0.25 }, marks[3])
        .to(sts[3], { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, marks[3] + 0.1)
        .to(bar, { scaleX: 1, duration: 0.4 }, marks[3])
        .to(legend, { autoAlpha: 1, duration: 0.3 }, marks[3])
        .to(on, { v: 11, duration: 0.9, onUpdate: function () { lots.forEach(function (l, k) { l.classList.toggle('on', on.v > k + 0.5); }); } }, marks[3] + 0.1)
        .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power1.inOut' }, marks[3] + 1.4)
        .to({}, { duration: 0.5 });
      return function () { lots.forEach(function (l) { l.classList.add('on'); }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
    setTimeout(build, 1200);
  } else build();
})();
