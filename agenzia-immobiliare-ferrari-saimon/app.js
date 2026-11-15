/* Agenzia Immobiliare Ferrari: hero reel, tabs, CASA fly-through scene, gauge, form. */
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
  $$('.lang a[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* reveals */
  var rs = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    rs.forEach(function (e) {
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(sib, 5) * 0.08 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* count-up: Google rating and review count */
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

  /* tabs: vendo / cerco */
  var tabs = $$('.tab'), tabWrap = $('.tabs');
  function setTab(t) {
    tabs.forEach(function (x) {
      var on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
      var p = document.getElementById(x.getAttribute('aria-controls')); p.hidden = !on; p.classList.toggle('is-on', on);
    });
    tabWrap.classList.toggle('is-c', t.id === 't-c');
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setTab(t); });
    t.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = tabs[(i + 1) % 2]; setTab(n); n.focus(); } });
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.16 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.28 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      if (!ok) e.preventDefault();
    });
  }

  /* hero entrance */
  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span'), cards = $$('.reel__c');
  if (hasG && !reduce) {
    var tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: .75, stagger: .08 }, 0)
      .from(hls, { y: 16, opacity: 0, duration: .55, stagger: .06 }, .2)
      .from(cards, { x: 120, opacity: 0, duration: 1, stagger: .08 }, .15);
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  function reel() {
    if (reduce) return;
    var track = $('.reel__track');
    gsap.to(track, { x: function () { return -Math.max(0, track.scrollWidth - window.innerWidth * 0.7); }, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5, invalidateOnRefresh: true } });
  }

  /* CASA: scale the cut-out layer through the left stroke of the C until the photo fills the screen */
  function scene() {
    if (reduce) return;
    var svg = $('.scene__mask'), probe = $('.mprobe');
    function origin() {
      var r = svg.getBoundingClientRect(), ctm = probe.getScreenCTM(), ext;
      try { ext = probe.getExtentOfChar(0); } catch (e) { return '50% 50%'; }
      var pt = svg.createSVGPoint(); pt.x = ext.x + ext.width * 0.13; pt.y = ext.y + ext.height * 0.52;
      var s = pt.matrixTransform(ctm);
      return (s.x - r.left) + 'px ' + (s.y - r.top) + 'px';
    }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var W = phone ? 900 : 1600, H = phone ? 1600 : 900;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      $$('rect', svg).forEach(function (r) { r.setAttribute('width', W); r.setAttribute('height', H); });
      var mk = $('mask', svg); mk.setAttribute('width', W); mk.setAttribute('height', H);
      $$('.mtext', svg).forEach(function (t) { t.setAttribute('x', W / 2); t.setAttribute('y', phone ? 900 : 620); t.style.fontSize = phone ? '290px' : ''; t.style.letterSpacing = phone ? '-14px' : ''; });
      gsap.set(svg, { scale: 1, opacity: 1, transformOrigin: origin() });
      gsap.set('.scene__copy', { y: 60, opacity: 0 });
      gsap.set('.scene__img', { scale: 1.15 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=220%', pin: true, scrub: .6,
        onRefresh: function () { gsap.set(svg, { transformOrigin: origin() }); } } });
      tl.to(svg, { scale: phone ? 22 : 24, duration: 1, ease: 'power2.in' }, .15)
        .to('.scene__img', { scale: 1, duration: 1.2, ease: 'none' }, .15)
        .to(svg, { opacity: 0, duration: .15 }, 1.0)
        .to('.scene__copy', { y: 0, opacity: 1, duration: .35, ease: 'power2.out' }, 1.1)
        .to({}, { duration: .3 });
      return function () { gsap.set([svg, '.scene__copy', '.scene__img'], { clearProps: 'all' }); };
    });
  }
  var go = function () { reel(); scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
