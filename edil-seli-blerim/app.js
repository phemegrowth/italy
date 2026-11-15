/* Edil Seli Blerim: hero reel, reveals, accordion, phase scene, form. */
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete il tipo di lavoro.');
      if (!ok) e.preventDefault();
    });
  }

  /* accordion */
  $$('.ai').forEach(function (it, i) {
    var b = $('button', it);
    if (i === 0) it.classList.add('is-open');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* hero entrance: lines rise, the reel slides in from the right (about 1.2 s) */
  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
  if (hasG && !reduce) {
    var tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 108, duration: .75, stagger: .1 }, 0)
      .from(hls, { y: 16, opacity: 0, duration: .6, stagger: .07 }, .25)
      .from('.reel', { x: 120, opacity: 0, duration: 1.1 }, .1);
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  var pis = $$('.pi'), pzs = $$('.pz'), num = $('[data-k-n]'), pbar = $('.ph__bar span'), cur = -1;
  function setK(k) {
    if (k === cur) return; cur = k;
    pis.forEach(function (p, i) { p.classList.toggle('is-on', i === k); });
    pzs.forEach(function (p, i) { p.classList.toggle('is-on', i === k); });
    if (num) num.textContent = '0' + (k + 1);
  }

  function build() {
    if (reduce) { $('.phases').classList.add('static'); setK(6); return; }
    setK(0); if (pbar) pbar.style.setProperty('--p', 0);
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', desk: '(min-width: 700px)' }, function (ctx) {
      ST.create({
        trigger: '.scene', start: 'top top', end: ctx.conditions.phone ? '+=170%' : '+=260%', pin: true, scrub: true,
        onUpdate: function (s) { setK(Math.min(6, Math.floor(s.progress * 7))); if (pbar) pbar.style.setProperty('--p', s.progress.toFixed(3)); }
      });
      gsap.from('.scene__head', { y: 24, opacity: 0, duration: .6, scrollTrigger: { trigger: '.scene', start: 'top 70%' } });
      return function () { setK(0); };
    });
  }
  var go = function () { build(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
