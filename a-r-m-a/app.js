/* Armando Restauri: hero fan, reveals, bathroom-wall scene, drag strip, process line, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header shrink + phone bar after the hero */
  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* reveals */
  var rs = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (e) {
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 5) * 0.08 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* count-up of the sourced Google rating */
  $$('.cnt').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null;
    var obs = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; obs.disconnect();
      function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1100, 1); var v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec).replace('.', ','); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }); obs.observe(el);
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* drag strip (mouse); touch scrolls natively */
  var strip = $('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    strip.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  /* form validation */
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete cosa volete rinnovare.');
      if (!ok) e.preventDefault();
    });
  }

  /* hero entrance: lines rise, the stack fans out, gold lines draw (done in about 1.3 s) */
  if (hasG && !reduce) {
    var g = window.gsap;
    var tl = g.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__title .ln > span', { yPercent: 108, duration: .7, stagger: .09 }, 0)
      .from('.hero .hl > span', { y: 18, opacity: 0, duration: .55, stagger: .07 }, .2)
      .from('.card', { x: function (i) { return [0, 120, -120, -60][i]; }, y: 40, rotation: function (i) { return [0, 6, -6, -3][i]; }, scale: .9, opacity: 0, duration: .85, stagger: .08 }, .12)
      .from('.hero__lines path', { strokeDashoffset: 900, duration: 1.2, stagger: .12, ease: 'power2.inOut' }, 0);
    g.to('.c1 img', { scale: 1.07, duration: 16, ease: 'none', repeat: -1, yoyo: true });
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  var steps = $$('.st'), q = $('[data-q]'), tag = $('[data-tag]');
  var names = steps.map(function (s) { return $('b', s).textContent; });
  function setStep(n) {
    steps.forEach(function (s, i) { s.classList.toggle('is-on', i === n); });
    if (q) q.textContent = '0' + (n + 1);
    if (tag) tag.textContent = names[n];
  }

  function scene() {
    if (reduce) { setStep(4); return; }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', desk: '(min-width: 700px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var pipes = $$('.w-pipes .pp');
      pipes.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      gsap.set('.cr-brick, .cr-tile', { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set('.cr-board', { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set('.pp-box', { opacity: 0 });
      gsap.set('.w-fit > *', { opacity: 0, y: 24 });
      var t = gsap.timeline({
        scrollTrigger: {
          trigger: '.scene', start: 'top top', end: phone ? '+=140%' : '+=240%', pin: true, scrub: .6,
          onUpdate: function (self) { setStep(Math.min(4, Math.floor(self.progress * 5))); }
        }
      });
      t.from('.scene__copy', { y: 30, opacity: 0, duration: .08 }, 0)
        .from('.wall', { y: 40, opacity: 0, duration: .08 }, 0)
        .to('.cr-brick', { scaleY: 1, duration: .16, ease: 'none' }, .04)
        .to(pipes, { strokeDashoffset: 0, duration: .14, stagger: .015, ease: 'none' }, .22)
        .to('.pp-box', { opacity: 1, duration: .03 }, .36)
        .to('.cr-board', { scaleX: 1, duration: .16, ease: 'none' }, .42)
        .to('.cr-tile', { scaleY: 1, duration: .16, ease: 'none' }, .62)
        .to('.w-fit > *', { opacity: 1, y: 0, duration: .1, stagger: .012 }, .82);
      return function () { pipes.forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); setStep(0); };
    });
  }

  function line() {
    var l = $('.how__line span'); if (!l) return;
    if (reduce) { l.style.setProperty('--p', 1); return; }
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 80%', end: 'bottom 55%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
