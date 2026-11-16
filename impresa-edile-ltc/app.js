/* LTC Srl: type-first hero with drifting strip, reveals, spec sheet peek, plan scene, method bar, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
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
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

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
    var to = parseFloat(el.dataset.to), t0 = null;
    var obs = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; obs.disconnect();
      function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1000, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }); obs.observe(el);
  });

  if (!reduce && fine) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    /* spec sheet: a photo follows the cursor over each row (desktop extra) */
    var peek = $('.peek'), pimg = $('img', peek), px = 0, py = 0, tx = 0, ty = 0, raf = null;
    function loop() { px += (tx - px) * .18; py += (ty - py) * .18; peek.style.transform = 'translate(' + (px - 110) + 'px,' + (py - 146) + 'px) scale(' + (peek.classList.contains('is-on') ? 1 : .85) + ')'; raf = requestAnimationFrame(loop); }
    $$('.row').forEach(function (row) {
      row.addEventListener('mouseenter', function () { pimg.src = row.dataset.img; peek.classList.add('is-on'); if (!raf) raf = requestAnimationFrame(loop); });
      row.addEventListener('mousemove', function (e) { tx = e.clientX + 140; ty = e.clientY; });
      row.addEventListener('mouseleave', function () { peek.classList.remove('is-on'); });
    });
  }

  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete un nome o l’azienda.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete una lavorazione.');
      if (!ok) e.preventDefault();
    });
  }

  var sts = $$('.st'), pct = $('[data-pct]');
  function setStep(n, p) { sts.forEach(function (s, i) { s.classList.toggle('is-on', i === n); s.classList.toggle('is-done', i < n); }); if (pct) pct.textContent = Math.round(p * 100); }

  if (!hasG || reduce) { setStep(3, 1); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__title .ln > span', { yPercent: 105, duration: .7, stagger: .08 }, 0)
    .from('.hero .hl > span', { y: 16, opacity: 0, duration: .5, stagger: .07 }, .2)
    .from('.pan', { x: 160, opacity: 0, duration: .9, stagger: .06, ease: 'power4.out' }, .15)
    .from('.pan img', { scale: 1.25, duration: 1.3, ease: 'power2.out' }, .15);

  function strip() {
    var track = $('.strip__track');
    gsap.to(track, { x: function () { return -Math.max(0, track.scrollWidth - window.innerWidth) * .9; }, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6, invalidateOnRefresh: true } });
  }

  function dash(sel) { $$(sel).forEach(function (p) { var L = Math.ceil(p.getTotalLength()); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; }); }

  function plan() {
    dash('.pl__wall'); dash('.pl__part'); dash('.pl__open path');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var t = gsap.timeline({
        scrollTrigger: { trigger: '.plan', start: 'top top', end: phone ? '+=140%' : '+=240%', pin: true, scrub: .5,
          onUpdate: function (s) { var p = s.progress; setStep(Math.min(3, Math.floor(p * 4.3)), Math.min(1, p * 1.08)); } }
      });
      t.from('.plan__text .kicker, .plan__text .h2', { y: 28, opacity: 0, duration: .4, stagger: .08 }, 0)
        .from('.board', { y: 40, opacity: 0, duration: .5 }, 0)
        .to('.pl__wall', { strokeDashoffset: 0, duration: 1, ease: 'none' }, .3)
        .to('.pl__part', { strokeDashoffset: 0, duration: 1, ease: 'none' }, 1.3)
        .from('.pl__glass', { opacity: 0, duration: .4 }, 2)
        .to('.pl__open path', { strokeDashoffset: 0, duration: .8, stagger: .05, ease: 'none' }, 2.3)
        .from('.pl__lbl text', { opacity: 0, y: 10, duration: .4, stagger: .1 }, 2.6)
        .fromTo('.pl__grid', { opacity: 0 }, { opacity: 1, duration: .7 }, 3.3)
        .to('.board__photo', { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'none' }, 4.1)
        .from('.board__photo img', { scale: 1.12, duration: 1.3, ease: 'none' }, 4.1)
        .to({}, { duration: .3 });
    });
  }

  function hbar() {
    var l = $('.how__bar span'); if (!l) return;
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 80%', end: 'bottom 50%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { strip(); plan(); hbar(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
