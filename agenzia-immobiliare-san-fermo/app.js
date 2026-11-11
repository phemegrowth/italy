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
    steps();
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

  // Accordion (one open at a time)
  var items = [].slice.call(document.querySelectorAll('.acc__item'));
  items.forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      items.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  // Process line draws with scroll
  var stepList = document.querySelector('.steps__list');
  function steps() {
    if (!stepList || reduce) return;
    var r = stepList.getBoundingClientRect(), vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
    stepList.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
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

  // Signature scene: the palazzo, from the portico to the attic
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var built = false;
  function build() {
    if (built) return; built = true;
    var pal = document.querySelector('.pal');
    if (!pal) return;
    pal.classList.add('pal--live');
    var draw = [].slice.call(pal.querySelectorAll('.ink path'));
    var roof = pal.querySelector('.roof');
    draw.concat(roof).forEach(function (p) { p.setAttribute('pathLength', '1'); });
    var bands = [0, 1, 2, 3].map(function (i) { return pal.querySelector('.band[data-f="' + i + '"]'); });
    var glass = [0, 1, 2, 3].map(function (i) { return pal.querySelector('.glass[data-f="' + i + '"]'); });
    var fls = [0, 1, 2, 3].map(function (i) { return pal.querySelector('.fl[data-f="' + i + '"]'); });
    var num = pal.querySelector('.pal__num'), bar = pal.querySelector('.pal__bar i');
    var labels = ['01 / 04', '02 / 04', '03 / 04', '04 / 04'];
    var mm = gsap.matchMedia();
    mm.add({ d: '(min-width: 900px)', m: '(max-width: 899px)' }, function (ctx) {
      var isD = ctx.conditions.d;
      gsap.set(draw.concat(roof), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(bands, { opacity: 0 });
      gsap.set(glass, { opacity: 0 });
      gsap.set(fls, { autoAlpha: 0, y: 24 });
      gsap.set(bar, { scaleX: 0 });
      gsap.set(pal.querySelectorAll('.ticks text'), { opacity: 0 });
      num.textContent = '';
      var T0 = 1.5, STEP = 1.2;
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: function () {
          var t = tl.time();
          var i = t < T0 ? -1 : Math.min(3, Math.floor((t - T0) / STEP));
          num.textContent = i < 0 ? '' : labels[i];
        },
        scrollTrigger: {
          trigger: pal, start: 'top top', end: isD ? '+=260%' : '+=140%', scrub: 0.6, pin: true, anticipatePin: 1
        }
      });
      tl.to(draw, { strokeDashoffset: 0, duration: 0.9, stagger: 0.05 }, 0)
        .to(roof, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.out' }, 0.7)
        .to(pal.querySelectorAll('.ticks text'), { opacity: 1, duration: 0.3, stagger: 0.05 }, 1.1);
      for (var i = 0; i < 4; i++) {
        var at = T0 + i * STEP;
        tl.to(bands[i], { opacity: 1, duration: 0.35 }, at)
          .to(glass[i], { opacity: 1, duration: 0.45 }, at + 0.1)
          .to(fls[i], { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, at + 0.15)
          .to(bar, { scaleX: (i + 1) / 4, duration: 0.5 }, at);
        if (i > 0) {
          tl.to(bands[i - 1], { opacity: 0.25, duration: 0.3 }, at)
            .to(fls[i - 1], { autoAlpha: 0, y: -18, duration: 0.25 }, at);
        }
      }
      tl.to(bands.slice(0, 3), { opacity: 0.6, duration: 0.3 }, T0 + 3 * STEP + 0.6)
        .to({}, { duration: 0.6 });
      return function () { num.textContent = ''; };
    });
    var imgs = [].slice.call(document.images).filter(function (im) { return !im.complete; });
    imgs.forEach(function (im) { im.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true }); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
    setTimeout(build, 1200);
  } else build();
})();
