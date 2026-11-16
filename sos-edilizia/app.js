/* SOS Edilizia: header, menu, reveals, count-up, form, hero strip, and the 3D service ring (GSAP). */
(function () {
  var d = document, root = d.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* year */
  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header shrink + mobile bar */
  var hdr = $('.hdr'), mbar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('show', y > (hero ? hero.offsetHeight * 0.8 : 600));
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('open', open); menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* smooth anchors with header offset */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2 || a.getAttribute('aria-disabled')) { if (a.getAttribute('aria-disabled')) e.preventDefault(); return; }
      var t = $(id); if (!t) return; e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 64, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* hero entrance: starts on first frame, done well under 1.6 s */
  var lines = $$('.hero__title .ln > span');
  if (!reduce) {
    lines.forEach(function (s, i) {
      s.animate([{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 700, delay: 80 + i * 90, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    });
    $$('.giant__w > *').forEach(function (s, i) {
      s.animate([{ transform: 'translateY(60%) scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 650, delay: i * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    });
    $$('.hstrip figure').forEach(function (f, i) {
      f.animate([{ transform: 'translateX(40vw)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, delay: 250 + i * 110, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    });
  }

  /* count-up (sourced number only: oltre 25 anni) */
  $$('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count'); if (reduce || !('IntersectionObserver' in window)) return;
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('it-IT'); if (p < 1) requestAnimationFrame(step); }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); el.textContent = '0'; requestAnimationFrame(step); } }, { threshold: .6 }); o.observe(el);
  });

  /* reveals */
  var rv = $$('.urg__head, .urg__copy, .urg__list li, .ba__head, .ba__f, .steps__side, .steps__list li, .social__in > *, .contact__info, .form');
  rv.forEach(function (e) { e.classList.add('rv'); });
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { var e = en.target, sib = e.parentElement ? Array.prototype.indexOf.call(e.parentElement.children, e) : 0; e.style.transitionDelay = Math.min(sib, 5) * 80 + 'ms'; e.classList.add('in'); io.unobserve(e); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); else io.observe(e); });
  }

  /* form validation */
  var form = $('.form');
  if (form) form.addEventListener('submit', function (e) {
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var v = f.value.trim(), good = v.length > 1;
      if (f.type === 'email') good = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (f.type === 'tel') good = v.replace(/\D/g, '').length >= 6;
      f.parentElement.classList.toggle('bad', !good); if (!good) ok = false;
    });
    if (!ok) { e.preventDefault(); var b = $('.f.bad', form); if (b) b.querySelector('input,textarea').focus(); }
  });

  /* ---------- GSAP: 3D service ring + steps line ---------- */
  var line = $('.steps__list');
  if (reduce || !window.gsap || !window.ScrollTrigger) { if (line) line.style.setProperty('--p', 1); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var scene = $('.ring'), wheel = $('.ring__wheel'), cards = $$('.rc'), cur = $('.ring__cur'), bar = $('.ring__bar span');
    var n = cards.length, step = 360 / n;
    scene.classList.add('is-3d');
    var mm = gsap.matchMedia();
    function run(end, zf) {
      var R = function () { return wheel.offsetWidth * zf; };
      var place = function () { cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R() + 'px)'; }); };
      place(); ScrollTrigger.addEventListener('refreshInit', place);
      gsap.set(wheel, { z: function () { return -R(); }, rotationY: 0 });
      var setAt = function (i) { cards.forEach(function (c, k) { c.classList.toggle('on', k === i); }); cur.textContent = '0' + (i + 1); };
      setAt(0);
      var tl = gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top top', end: end, pin: true, scrub: 0.7, invalidateOnRefresh: true,
        snap: { snapTo: 1 / (n - 1), inertia: false, delay: 0.15, duration: { min: 0.2, max: 0.5 }, ease: 'power1.inOut' },
        onUpdate: function (s) { setAt(Math.round(s.progress * (n - 1))); } } });
      tl.to(wheel, { rotationY: -step * (n - 1), ease: 'none', duration: 1 }, 0)
        .fromTo(bar, { scaleX: 0.2 }, { scaleX: 1, ease: 'none', duration: 1 }, 0);
      return function () { ScrollTrigger.removeEventListener('refreshInit', place); tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
    }
    mm.add('(min-width: 761px)', function () { return run('+=260%', 1.05); });
    mm.add('(max-width: 760px)', function () { return run('+=170%', 0.95); });
    /* bring the ring in once the section arrives */
    gsap.from(['.ring__head', '.ring__stage'], { y: 50, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: scene, start: 'top 70%' } });

    if (line) gsap.fromTo(line, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: line, start: 'top 70%', end: 'bottom 60%', scrub: true } });
    ScrollTrigger.refresh();
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(build);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
