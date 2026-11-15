/* Mitrica Costruzioni: hero reveal, reveals, drywall scene, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > hero.offsetHeight - 80);
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  $$('.lang a[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  var rs = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (e) {
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(sib, 5) * 0.08 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.16 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.28 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete un nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete il tipo di locale.');
      if (!ok) e.preventDefault();
    });
  }

  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
  if (hasG && !reduce) {
    var tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: .75, stagger: .08 }, 0)
      .from(hls, { y: 16, opacity: 0, duration: .55, stagger: .06 }, .22)
      .from('.hero__media', { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.1, ease: 'power3.inOut' }, 0);
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  var lis = $$('.ll li'), pct = $('[data-pct]');
  function setL(k) { lis.forEach(function (l, i) { l.classList.toggle('is-on', i === k); l.classList.toggle('was', i < k); }); }
  function scene() {
    if (reduce) { setL(4); if (pct) pct.textContent = '100'; return; }
    setL(0);
    var frame = $$('.w-l'), wool = $$('.w-wool rect'), boards = $$('.w-b'), tape = $('.w-tape path'), paint = $('.w-paint'), sock = $('.w-socket');
    frame.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var tl0 = tape.getTotalLength(); tape.style.strokeDasharray = tl0; tape.style.strokeDashoffset = tl0;
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set(wool, { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(boards, { xPercent: -110, opacity: 0 });
      gsap.set(paint, { opacity: 0 }); gsap.set(sock, { opacity: 0, scale: .6, transformOrigin: '50% 50%' });
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=230%', pin: true, scrub: .6,
        onUpdate: function (s) { setL(Math.max(0, Math.min(4, Math.floor(s.progress * 5.4 - .1)))); if (pct) pct.textContent = Math.round(s.progress * 100); } } });
      tl.from('.scene__head', { y: 24, opacity: 0, duration: .3 }, 0)
        .to(frame, { strokeDashoffset: 0, duration: .9, stagger: .08, ease: 'none' }, .1)
        .to(wool, { scaleY: 1, duration: .6, stagger: .12, ease: 'power2.out' }, 1.3)
        .to(boards, { xPercent: 0, opacity: 1, duration: .7, stagger: .25, ease: 'power2.out' }, 2.3)
        .to(tape, { strokeDashoffset: 0, duration: .6, ease: 'none' }, 3.4)
        .to(paint, { opacity: 1, duration: .6 }, 4.2)
        .to(sock, { opacity: 1, scale: 1, duration: .3 }, 4.6)
        .to({}, { duration: .4 });
      return function () { gsap.set([wool, boards, paint, sock], { clearProps: 'all' }); };
    });
  }
  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
