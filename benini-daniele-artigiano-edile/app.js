/* Benini Daniele: curtain hero, reveals, 3D ring of trades, drag strip, process line, form. */
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
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.6);
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

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete che lavoro è.');
      if (!ok) e.preventDefault();
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

  /* hero: the brick-red curtain slides off to the right, the title rises, the stamp turns in (about 1.3 s) */
  var curtain = $('.curtain');
  if (hasG && !reduce) {
    var g = window.gsap;
    g.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__title .ln > span', { yPercent: 108, duration: .7, stagger: .08 }, 0)
      .from('.hero .hl > span', { y: 16, opacity: 0, duration: .55, stagger: .07 }, .2)
      .fromTo(curtain, { scaleX: 1 }, { scaleX: 0, duration: .9, ease: 'power4.inOut' }, .1)
      .from('.hero__pic img', { scale: 1.15, duration: 1.6, ease: 'power2.out' }, .1)
      .from('.hero__stamp', { scale: 0, rotation: -120, opacity: 0, duration: .8, ease: 'back.out(1.6)' }, .75);
  } else if (curtain) { curtain.style.transform = 'scaleX(0)'; }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  var wrap = $('.ring-wrap'), ring = $('.ring'), cards = $$('.rc'), q = $('[data-q]'), n = cards.length;
  function scene() {
    if (reduce || !wrap) return;
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', mid: '(min-width: 700px) and (max-width: 999px)', desk: '(min-width: 1000px)' }, function (ctx) {
      var c = ctx.conditions, R = c.phone ? 190 : c.mid ? 270 : 400;
      wrap.classList.add('is-3d');
      var step = 360 / n, state = { a: 0 };
      cards.forEach(function (el, i) { el.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
      function paint() {
        ring.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-state.a) + 'deg)';
        var k = Math.round(state.a / step) % n;
        cards.forEach(function (el, i) {
          var d = Math.abs(((i * step - state.a) % 360 + 540) % 360 - 180);
          el.style.opacity = Math.max(.12, 1 - d / 150).toFixed(2);
          el.classList.toggle('is-front', i === k);
        });
        if (q) q.textContent = '0' + (k + 1);
      }
      paint();
      var t = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: c.phone ? '+=170%' : '+=260%', pin: true, scrub: .6 } });
      t.from('.scene__copy', { y: 30, opacity: 0, duration: .06 }, 0)
        .from(wrap, { scale: .8, opacity: 0, duration: .08 }, 0)
        .to(state, { a: step * (n - 1), duration: 1, ease: 'none', onUpdate: paint }, .04);
      return function () { wrap.classList.remove('is-3d'); ring.style.transform = ''; cards.forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; el.classList.remove('is-front'); }); };
    });
  }

  function line() {
    var l = $('.how__line span'); if (!l) return;
    if (reduce) { l.style.setProperty('--p', 1); return; }
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 78%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
