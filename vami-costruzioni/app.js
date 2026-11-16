/* Vami Costruzioni: blueprint-frame hero, reveals, concrete pour scene, drag gallery, process line, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) doc.classList.add('reduced');
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header + phone bar */
  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
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

  /* count-up: the Google rating only */
  $$('.cnt').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null;
    el.textContent = (0).toFixed(dec).replace('.', ',');
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

    /* drag-to-scroll gallery (mouse only; touch scrolls natively) */
  var drag = $('.drag');
  if (drag) {
    var down = false, sx = 0, sl = 0;
    drag.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); drag.scrollLeft = sl - (e.pageX - sx) * 1.2; });
    drag.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') drag.scrollBy({ left: 300, behavior: 'smooth' }); if (e.key === 'ArrowLeft') drag.scrollBy({ left: -300, behavior: 'smooth' }); });
  }

  /* scene levels */
  var lvs = $$('.lv');
  function setLevel(n) { lvs.forEach(function (l, i) { l.classList.toggle('is-on', i <= n); }); }

  if (!hasG || reduce) { setLevel(3); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero entrance: frame lines draw, photo fades in inside the frame, headline rises (about 1.3 s) */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.gl', { opacity: 0, duration: .8, stagger: .08 }, 0)
    .from('.fr--t, .fr--b', { scaleX: 0, duration: .7, ease: 'power2.inOut' }, 0)
    .from('.fr--l, .fr--r', { scaleY: 0, duration: .7, ease: 'power2.inOut' }, .1)
    .from('.hero__img', { opacity: 0, scale: .96, duration: .9 }, .45)
    .from('.hero__title .ln > span', { yPercent: 110, duration: .7, stagger: .08 }, .1)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .5, stagger: .07 }, .3)
    .from('.hero__dim', { opacity: 0, duration: .5 }, .9);

  gsap.matchMedia().add('(min-width: 761px)', function () {
    gsap.to('.hero__img img', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var fill = $('.pour__fill'), wave = $('.pour__fill span');
      gsap.set(fill, { '--fy': '100%' });
      setLevel(-1);
      var stops = [8, 30, 56, 84]; /* % of the column height where each level sits, from the bottom */
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.pour', start: 'top top', end: phone ? '+=130%' : '+=240%', pin: true, scrub: .6,
          onUpdate: function (s) {
            var filled = Math.max(0, (s.progress - .18) / .72) * 100;
            var n = -1; stops.forEach(function (v, i) { if (filled >= v) n = i; });
            setLevel(n);
            wave.style.setProperty('--wx', (s.progress * -600) + 'px');
          }
        }
      });
      t.from('.pour__rebar path', { opacity: 0, scaleY: 0, transformOrigin: '50% 100%', duration: .6, stagger: .05 }, 0)
        .to(fill, { '--fy': '8%', duration: 3, ease: 'power1.inOut' }, .7)
        .to({}, { duration: .5 });
      return function () { gsap.set(fill, { clearProps: '--fy' }); setLevel(3); };
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
