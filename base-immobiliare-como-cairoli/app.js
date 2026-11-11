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
    reel();
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

  // Tabs: sell / buy
  var tabs = [].slice.call(document.querySelectorAll('[role="tab"]'));
  var tabWrap = document.querySelector('.tabs');
  function selectTab(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    tabWrap.classList.toggle('is-c', t.id === 't-c');
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; selectTab(n); n.focus(); }
    });
  });

  // Hero reel drifts left with the scroll (transform only)
  var track = document.querySelector('.reel__track');
  function reel() {
    if (!track || reduce) return;
    var sy = Math.min(window.scrollY || 0, window.innerHeight * 1.2);
    track.style.transform = 'translate3d(' + (-sy * (desk.matches ? 0.35 : 0.45)).toFixed(1) + 'px,0,0)';
  }

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

  // Signature scene: the camera pulls back, from one house to the whole lakeside town
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var built = false;
  function build() {
    if (built) return; built = true;
    var sec = document.querySelector('.cam');
    if (!sec) return;
    sec.classList.add('cam--live');
    var img = sec.querySelector('.cam__photo img');
    var label = sec.querySelector('.cam__label'), rec = sec.querySelector('.cam__rec');
    var hud = sec.querySelector('.cam__hud'), panel = sec.querySelector('.cam__panel');
    var cs = [0, 1, 2, 3].map(function (i) { return sec.querySelector('.cs[data-s="' + i + '"]'); });
    var modes = ['FOTO', 'VIDEO', 'DRONE', 'RENDERING'];
    var mm = gsap.matchMedia();
    mm.add({ d: '(min-width: 900px)', m: '(max-width: 899px)' }, function (ctx) {
      var isD = ctx.conditions.d;
      gsap.set(img, { scale: isD ? 2.6 : 2.2 });
      gsap.set(cs, { autoAlpha: 0, y: 18 });
      gsap.set(panel, { autoAlpha: 0, y: 40 });
      gsap.set(hud, { autoAlpha: 0 });
      gsap.set(rec, { opacity: 0 });
      label.textContent = modes[0];
      var marks = [0.3, 1.3, 2.3, 3.4];
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: function () {
          var t = tl.time(), i = 0;
          for (var k = 0; k < marks.length; k++) if (t >= marks[k]) i = k;
          if (label.textContent !== modes[i]) label.textContent = modes[i];
        },
        scrollTrigger: { trigger: sec, start: 'top top', end: isD ? '+=240%' : '+=130%', scrub: 0.6, pin: true, anticipatePin: 1 }
      });
      tl.to(hud, { autoAlpha: 1, duration: 0.2 }, 0)
        .to(panel, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.05)
        .to(cs[0], { autoAlpha: 1, y: 0, duration: 0.25 }, marks[0])
        .to(img, { scale: isD ? 1.9 : 1.7, duration: 1, ease: 'power1.inOut' }, marks[0])
        .to(cs[0], { autoAlpha: 0, y: -14, duration: 0.2 }, marks[1])
        .to(cs[1], { autoAlpha: 1, y: 0, duration: 0.25 }, marks[1] + 0.22)
        .to(rec, { opacity: 1, duration: 0.05 }, marks[1])
        .to(img, { scale: 1.3, duration: 1, ease: 'power1.inOut' }, marks[1])
        .to(cs[1], { autoAlpha: 0, y: -14, duration: 0.2 }, marks[2])
        .to(cs[2], { autoAlpha: 1, y: 0, duration: 0.25 }, marks[2] + 0.22)
        .to(rec, { opacity: 0, duration: 0.05 }, marks[2])
        .to(img, { scale: 1, duration: 1.1, ease: 'power1.inOut' }, marks[2])
        .to(cs[2], { autoAlpha: 0, y: -14, duration: 0.2 }, marks[3])
        .to(cs[3], { autoAlpha: 1, y: 0, duration: 0.25 }, marks[3] + 0.22)
        .to({}, { duration: 0.5 });
      return function () { label.textContent = 'FOTO'; };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
    setTimeout(build, 1200);
  } else build();
})();
