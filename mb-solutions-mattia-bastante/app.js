/* MB Solutions: split hero with parallax, marquee, hover swap list, salon plan scene, process line, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header shrink, phone bar after the hero, process line */
  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero'), howW = $('.how__wrap'), howL = $('.how__line');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
    if (howW && !reduce) {
      var r = howW.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      howL.style.setProperty('--p', p.toFixed(3));
    }
  }
  if (howL && !reduce) howL.style.setProperty('--p', '0');
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

  /* reveals, with the above-the-fold guard */
  var rs = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (e) {
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 6) * 0.07 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* service list swaps the photo (desktop hover, keyboard focus) */
  var sws = $$('.sw');
  $$('.it').forEach(function (it) {
    function on() { var k = it.getAttribute('data-k'); sws.forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-k') === k); }); $$('.it').forEach(function (x) { x.classList.toggle('is-on', x === it); }); }
    it.addEventListener('mouseenter', on); it.addEventListener('focusin', on);
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete che spazio è.');
      if (!ok) e.preventDefault();
    });
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero entrance: lines rise, photo wipes up (about 1.2 s) */
  if (!reduce) {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__title .ln > span', { yPercent: 110, duration: .8, stagger: .09 }, 0)
      .from('.hero .hl > span', { yPercent: 100, opacity: 0, duration: .6, stagger: .08 }, .25)
      .from('.hero__pic', { clipPath: 'inset(100% 0 0 0)', duration: 1, ease: 'power3.inOut' }, 0)
      .from('.hero__img img', { scale: 1.15, duration: 1.6, ease: 'power2.out' }, 0)
      .from('.hero__tag', { x: -20, opacity: 0, duration: .5 }, .9);
  }

  /* draw helper */
  function prep(el) { var L = 1200; try { L = Math.ceil(el.getTotalLength()) + 2; } catch (e) {} el.style.strokeDasharray = L; el.style.strokeDashoffset = L; return el; }

  function build() {
    if (!reduce) {
      gsap.to('.hero__img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    var sc = $('.scene'); if (!sc || reduce) return;
    var steps = $$('.st'), pct = $('[data-pct]');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      sc.classList.add('is-live');
      var walls = $$('.ln-w path').map(prep), furn = $$('.ln-f path, .ln-f circle, .ln-f rect').map(prep), imp = $$('.ln-i path').map(prep);
      gsap.set('.ln-i circle, .lbl text', { opacity: 0 });
      var t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
        trigger: sc, start: 'top top', end: ctx.conditions.phone ? '+=130%' : '+=240%', pin: true, scrub: .6,
        onUpdate: function (s) {
          var p = s.progress, k = p < .33 ? 0 : p < .52 ? 1 : p < .86 ? 2 : 3;
          steps.forEach(function (x, i) { x.classList.toggle('is-on', i === k); });
          if (pct) pct.textContent = Math.round(p * 100);
        } } });
      t.to(walls, { strokeDashoffset: 0, duration: 1.2, stagger: .1 }, 0)
       .to(furn, { strokeDashoffset: 0, duration: 1, stagger: .03 }, .6)
       .to('.lbl text', { opacity: 1, duration: .3, stagger: .15 }, 1.6)
       .to(imp, { strokeDashoffset: 0, duration: .9 }, 2.4)
       .to('.ln-i circle', { opacity: 1, duration: .2 }, 3)
       .to('.plan__photo', { clipPath: 'inset(0% 0 0 0)', duration: 2.2, ease: 'power1.inOut' }, 3.4)
       .to('.plan__svg', { opacity: .18, duration: 1.4 }, 4.2)
       .to('.lbl text', { opacity: 0, duration: .5 }, 4.6)
       .to({}, { duration: .6 });
      return function () {
        sc.classList.remove('is-live');
        walls.concat(furn, imp).forEach(function (e) { e.style.strokeDasharray = ''; e.style.strokeDashoffset = ''; });
        gsap.set('.ln-i circle, .lbl text, .plan__svg, .plan__photo', { clearProps: 'all' });
      };
    });
  }

  var go = function () { build(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
