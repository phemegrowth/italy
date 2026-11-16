/* DIBA: horizontal reel hero, tabs, 3D ring of the six steps, bento listings with chips, form. */
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
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
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
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 5) * 0.08 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* tabs with sliding bar and arrow keys */
  var tabs = $$('.tab'), panels = $$('.panel'), tbar = $('.tabs__bar');
  function moveBar(t) { tbar.style.width = t.offsetWidth + 'px'; tbar.style.transform = 'translateX(' + t.offsetLeft + 'px)'; }
  function selTab(i, focus) {
    tabs.forEach(function (t, k) { var on = k === i; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
    panels.forEach(function (p, k) { p.hidden = k !== i; p.classList.toggle('is-on', k === i); p.classList.remove('is-anim'); if (k === i && !reduce) { void p.offsetWidth; p.classList.add('is-anim'); } });
    moveBar(tabs[i]); if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selTab(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') selTab((i + 1) % tabs.length, true);
      if (e.key === 'ArrowLeft') selTab((i - 1 + tabs.length) % tabs.length, true);
    });
  });
  moveBar(tabs[0]); window.addEventListener('resize', function () { moveBar($('.tab.is-on')); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveBar($('.tab.is-on')); });

  /* chips */
  var chips = $$('.chip'), cards = $$('.card');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.f;
      chips.forEach(function (o) { var on = o === c; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var n = 0;
      cards.forEach(function (k) {
        var show = f === 'all' || k.dataset.k === f;
        k.classList.toggle('is-out', !show);
        if (show && !reduce && k.animate) k.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 460, delay: (n++) * 50, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      });
    });
  });

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.14 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.26 + 'px)'; });
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete una voce.');
      if (!ok) e.preventDefault();
    });
  }

  /* ring helpers */
  var ring = $('.ring'), rcs = $$('.rc'), stepEl = $('[data-step]'), front = -1;
  function setFront(k) {
    if (k === front) return; front = k;
    rcs.forEach(function (c, i) { c.classList.toggle('is-front', i === k); });
    if (stepEl) stepEl.textContent = ('0' + (k + 1)).slice(-2);
  }
  setFront(0);

  if (!hasG || reduce) { ring.classList.add('is-static'); rcs.forEach(function (c) { c.classList.add('is-front'); }); if (!hasG) return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  if (!reduce) {
    var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: .7, stagger: .08 }, 0)
      .from(hls, { y: 18, opacity: 0, duration: .5, stagger: .06 }, .12)
      .from('.reel__f', { xPercent: 40, opacity: 0, duration: 1, stagger: .09, ease: 'power4.out' }, .1)
      .from('.reel__f img', { scale: 1.25, duration: 1.6, stagger: .09 }, .1)
      .from('.proof__in li', { y: 16, opacity: 0, duration: .5, stagger: .06 }, .5);
  }

  function scenes() {
    if (reduce) return;
    /* reel drifts left while the page scrolls past the hero */
    gsap.to('.reel__track', { x: function () { var t = $('.reel__track'); return -Math.max(0, t.scrollWidth - $('.reel').clientWidth * 0.55); }, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5, invalidateOnRefresh: true } });
    gsap.to('.reel__f img', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ring: pinned, scroll turns the wheel; the card in front turns blue */
    var n = rcs.length, step = 360 / n;
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set('.ring__wheel', { rotationY: 0 });
      var t = gsap.timeline({ scrollTrigger: { trigger: '.ring', start: 'top top', end: phone ? '+=170%' : '+=260%', pin: true, scrub: .7, anticipatePin: 1,
        onUpdate: function (s) { setFront(Math.round(s.progress * (n - 1))); } } });
      t.fromTo('.ring__wheel', { rotationY: 0 }, { rotationY: -step * (n - 1), ease: 'none', duration: 1 }, 0)
        .fromTo('.ring__bar span', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0);
      gsap.from('.ring__wheel', { scale: .7, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.ring', start: 'top 70%', toggleActions: 'play none none reverse' } });
    });
  }
  var go = function () { scenes(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
