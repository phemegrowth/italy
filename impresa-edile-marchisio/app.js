/* Impresa Edile Marchisio: split hero, reveals, exploded-building scene, accordion with photo swap, process line, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) doc.classList.add('reduced');
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var year = new Date().getFullYear();

  $$('[data-year]').forEach(function (e) { e.textContent = year; });
  $$('[data-since]').forEach(function (e) { e.textContent = year - parseInt(e.dataset.since, 10); });

  /* header + phone bar */
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
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

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

  /* count-up: years since 1979 */
  $$('.cnt').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.textContent), t0 = null;
    el.textContent = '0';
    var obs = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; obs.disconnect();
      function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }); obs.observe(el);
  });

  /* magnetic button, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* accordion + photo swap */
  var items = $$('.acc__item'), pics = $$('.pic');
  function openItem(n) {
    items.forEach(function (it, i) {
      var on = i === n; it.classList.toggle('is-open', on);
      $('.acc__btn', it).setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    pics.forEach(function (p, i) { p.classList.toggle('is-on', i === n); });
  }
  items.forEach(function (it, i) {
    $('.acc__btn', it).addEventListener('click', function () { openItem(it.classList.contains('is-open') ? -1 : i); if (!items.some(function (x) { return x.classList.contains('is-open'); })) pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); }); });
    it.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); }); });
  });

  /* form validation */
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete cosa vi interessa.');
      if (!ok) e.preventDefault();
    });
  }

  /* scene label helper */
  var lbs = $$('.lb');
  var order = [3, 2, 1, 0]; /* bottom up: fondazioni first */
  function setLayer(step) {
    var idx = order[Math.max(0, Math.min(3, step))];
    lbs.forEach(function (l, i) { l.classList.toggle('is-on', i === idx); });
  }

  if (!hasG || reduce) return;

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__title .ln > span', { yPercent: 110, duration: .75, stagger: .09 }, 0)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .5, stagger: .07 }, .2)
    .from('.hero__img', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.inOut' }, 0)
    .from('.hero__img img', { scale: 1.2, duration: 1.6 }, 0)
    .from('.hero__cap', { opacity: 0, y: 10, duration: .5 }, .8);

  gsap.matchMedia().add('(min-width: 761px)', function () {
    gsap.to('.hero__img img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set('.ex', { '--k': 0 });
      if (!phone) gsap.set('.lb', { opacity: 0 });
      gsap.set('.sl__tag', { opacity: 0 });
      setLayer(0);
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=240%', pin: true, scrub: .5,
          onUpdate: function (s) { setLayer(Math.floor(Math.max(0, s.progress - .2) / .8 * 4)); }
        }
      });
      t.from('.ex__frame', { y: 40, opacity: 0, duration: .4, ease: 'power2.out' }, 0)
        .to('.ex', { '--k': 1, duration: 1.4, ease: 'power1.inOut' }, .4)
        .to('.sl__tag', { opacity: 1, duration: .3, stagger: .1 }, 1.2);
      if (!phone) [3, 2, 1, 0].forEach(function (i, k) { t.to('.lb--' + i, { opacity: 1, duration: .4 }, 1.3 + k * .5); });
      t.to({}, { duration: .6 });
      return function () { gsap.set('.ex', { '--k': 1 }); gsap.set('.lb', { clearProps: 'opacity' }); };
    });
  }

  function line() {
    var l = $('.how__line span'); if (!l) return;
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 75%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
