/* NKD Restauri: hero fan, reveals, services swap, rope scene, drag strip, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* year */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header shrink + phone bar after hero */
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

  /* count-up (only the sourced Google rating) */
  $$('.cnt').forEach(function (el) {
    if (reduce) return;
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
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.18 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* drag strip */
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
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) { el.focus(); } ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete il tipo di intervento.');
      if (!ok) e.preventDefault();
    });
  }

  /* hero entrance: the stack fans out (starts on the first frame, done in about 1.3 s) */
  var cards = $$('.card'), lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
  if (hasG && !reduce) {
    var gs = window.gsap;
    var tl = gs.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 105, duration: .7, stagger: .09 }, 0)
      .from(hls, { y: 18, opacity: 0, duration: .6, stagger: .08 }, .25)
      .from(cards, { x: function (i) { return [60, -80, 40, -40][i] || 0; }, y: function (i) { return [30, 60, -40, -60][i] || 0; }, rotation: function (i) { return [-8, 9, -5, 7][i] || 0; }, scale: .86, opacity: 0, duration: .9, stagger: .07 }, .1)
      .from('.hero__rope', { scaleY: 0, duration: 1.1, ease: 'power2.inOut' }, .2);
    /* slow continuous drift on the first card */
    gs.to('.c1 img', { scale: 1.08, duration: 18, ease: 'none', repeat: -1, yoyo: true });
  }

  /* signature scene */
  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  var steps = $$('.st'), q = $('[data-q]');
  function setStep(n) { steps.forEach(function (s, i) { s.classList.toggle('is-on', i === n); }); if (q) q.textContent = '0' + (n + 1); }

  function build() {
    if (reduce) { setStep(3); return; }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', desk: '(min-width: 700px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set('.wall__col', { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set('.wall__rope', { scaleY: 0 });
      gsap.set('.wall__hook', { top: '0%' });
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=220%', pin: true, scrub: .6,
          onUpdate: function (self) { setStep(Math.min(3, Math.floor(self.progress * 4))); }
        }
      });
      tl.from('.scene__copy', { y: 30, opacity: 0, duration: .12 }, 0)
        .to('.wall__rope', { scaleY: 1, duration: .55, ease: 'none' }, .05)
        .to('.wall__hook', { top: '100%', duration: .7, ease: 'none' }, .2)
        .to('.wall__col', { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'none' }, .2)
        .to('.wall__hook', { scale: 0, duration: .08 }, .9);
      return function () { setStep(0); };
    });
  }
  /* why line */
  function why() {
    var l = $('.why__line span'); if (!l || reduce) { if (l) l.style.setProperty('--p', 1); return; }
    ST.create({ trigger: '.why__list', start: 'top 75%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }
  var go = function () { build(); why(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
