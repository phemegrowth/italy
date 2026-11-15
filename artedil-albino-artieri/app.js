/* ARTEDIL: hero reel, reveals, services swap, floor-layer scene, steps line, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header + phone bar */
  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu */
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

  /* language switch is a placeholder */
  $$('.lang a[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* reveals */
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

  /* count-up: Google rating and review count only */
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

  /* services: tap or hover swaps the photo */
  var items = $$('.si'), pics = $$('.sp');
  function pick(k) {
    items.forEach(function (i) { var on = i.dataset.k === k; i.classList.toggle('is-on', on); $('button', i).setAttribute('aria-pressed', on ? 'true' : 'false'); });
    pics.forEach(function (p) { p.classList.toggle('is-on', p.dataset.k === k); });
  }
  items.forEach(function (i) {
    $('button', i).addEventListener('click', function () { pick(i.dataset.k); });
    i.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) pick(i.dataset.k); });
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.16 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.28 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* drag strip (mouse) */
  var strip = $('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete il tipo di lavoro.');
      if (!ok) e.preventDefault();
    });
  }

  /* hero entrance: lines rise, reel cards slide in from the right (about 1.3 s) */
  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span'), cards = $$('.reel__c');
  if (hasG && !reduce) {
    var tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: .75, stagger: .08 }, 0)
      .from(hls, { y: 16, opacity: 0, duration: .55, stagger: .06 }, .22)
      .from(cards, { xPercent: 40, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out' }, .1);
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  var lis = $$('.ll li'), n = $('[data-n]'), lys = $$('.ly'), pipe = $('.ly--3 path');
  function setL(k) { lis.forEach(function (l, i) { l.classList.toggle('is-on', i === k); l.classList.toggle('was', i < k); }); if (n) n.textContent = k + 1; }

  function reel() {
    if (reduce) return;
    var track = $('.reel__track');
    gsap.to(track, { x: function () { return -Math.max(0, track.scrollWidth - track.parentElement.clientWidth * 0.55); }, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5, invalidateOnRefresh: true } });
  }
  function scene() {
    if (reduce) { setL(4); return; }
    setL(0);
    var len = 1400;
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set(lys, { opacity: 0, y: -90 });
      gsap.set(pipe, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set('.ll li', { x: 0 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=240%', pin: true, scrub: .6,
        onUpdate: function (self) { setL(Math.max(0, Math.min(4, Math.floor(self.progress * 5.6 - .25)))); } } });
      tl.from('.scene__head', { y: 24, opacity: 0, duration: .3 }, 0);
      if ($('.scene__pic') && !phone) tl.from('.scene__pic', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, .2);
      lys.forEach(function (l, i) {
        tl.to(l, { opacity: 1, y: 0, duration: .55, ease: 'power2.out' }, .2 + i * .8);
        if (i === 2) tl.to(pipe, { strokeDashoffset: 0, duration: .7, ease: 'none' }, .3 + i * .8);
      });
      tl.to({}, { duration: .5 });
      return function () { gsap.set(lys, { clearProps: 'all' }); gsap.set(pipe, { clearProps: 'all' }); };
    });
  }
  function proc() {
    var l = $('.pl__line span'); if (!l) return; if (reduce) { l.style.setProperty('--p', 1); return; }
    ST.create({ trigger: '.pl', start: 'top 80%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }
  var go = function () { reel(); scene(); proc(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
