/* Barberis Manutenzioni: curtain hero, reveals, sticky-list scene, process line, form. */
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete il tipo di lavoro.');
      if (!ok) e.preventDefault();
    });
  }

  /* hero: the green curtain lifts, headline rises, the house lines draw (about 1.4 s) */
  var curtain = $('.curtain');
  if (hasG && !reduce) {
    var g = window.gsap;
    g.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__title .ln > span', { yPercent: 105, duration: .7, stagger: .08 }, 0)
      .from('.hero .hl > span', { y: 16, opacity: 0, duration: .55, stagger: .07 }, .2)
      .fromTo(curtain, { scaleY: 1 }, { scaleY: 0, duration: .95, ease: 'power4.inOut' }, .15)
      .from('.hero__pic img', { scale: 1.18, duration: 1.6, ease: 'power2.out' }, .15)
      .to('.hero__house path', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, .7)
      .from('.hero__pic figcaption', { y: 20, opacity: 0, duration: .5 }, 1);
  } else if (curtain) { curtain.style.transform = 'scaleY(0)'; }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  var items = $$('.ti'), pics = $$('.sp'), q = $('[data-q]'), pb = $('.scene__bar span'), cur = -1;
  function setStep(n) {
    if (n === cur) return; cur = n;
    items.forEach(function (s, i) { s.classList.toggle('is-on', i === n); });
    pics.forEach(function (s, i) { s.classList.toggle('is-on', i === n); });
    if (q) q.textContent = '0' + (n + 1);
  }

  function scene() {
    if (reduce) { setStep(0); if (pb) pb.style.setProperty('--p', 1); return; }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 999px)', desk: '(min-width: 1000px)' }, function (ctx) {
      var phone = ctx.conditions.phone, n = items.length;
      var t = gsap.timeline({
        scrollTrigger: {
          trigger: '.scene', start: 'top top', end: phone ? '+=160%' : '+=260%', pin: true, scrub: .5,
          onUpdate: function (self) { setStep(Math.min(n - 1, Math.floor(self.progress * n))); if (pb) pb.style.setProperty('--p', self.progress); }
        }
      });
      t.from('.scene__head', { y: 24, opacity: 0, duration: .06 }, 0)
        .from('.scene__pics', { clipPath: 'inset(12% 8% 12% 8% round 14px)', duration: .12, ease: 'power2.out' }, 0)
        .fromTo('.sp', { scale: 1.12 }, { scale: 1, duration: 1, ease: 'none' }, 0);
      return function () { cur = -1; setStep(0); };
    });
  }

  function line() {
    var l = $('.how__line span'); if (!l) return;
    if (reduce) { l.style.setProperty('--p', 1); return; }
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 75%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
