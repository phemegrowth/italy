/* Edil Solari: type-first hero with sliding strip, accordion, layered wall scene, form. */
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
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 6) * 0.07 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* accordion: one open at a time, height animated */
  $$('.ac').forEach(function (d) {
    var s = $('summary', d), b = $('.ac__body', d);
    s.addEventListener('click', function (e) {
      e.preventDefault();
      var open = d.hasAttribute('open');
      if (!open) $$('.ac[open]').forEach(function (o) { if (o !== d) close(o); });
      if (open) close(d); else openIt(d);
    });
    function openIt(el) { el.setAttribute('open', ''); var bb = $('.ac__body', el); if (reduce || !bb.animate) return; var h = bb.scrollHeight; bb.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 320, easing: 'ease-out' }); }
    function close(el) { var bb = $('.ac__body', el); if (reduce || !bb.animate) { el.removeAttribute('open'); return; } var h = bb.scrollHeight; var a = bb.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'ease-in' }); a.onfinish = function () { el.removeAttribute('open'); }; }
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete che lavoro è.');
      if (!ok) e.preventDefault();
    });
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  if (!reduce) {
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from('.hero__title .ln > span', { yPercent: 105, duration: .9, stagger: .1 }, 0)
      .from('.sun--big', { scale: 0, rotate: -90, duration: .8, ease: 'back.out(2)' }, .5)
      .from('.hero .hl > span', { yPercent: 100, opacity: 0, duration: .6, stagger: .07 }, .3)
      .from('.strip__it', { xPercent: 120, opacity: 0, duration: 1, stagger: .09, ease: 'power3.out' }, .25);
  }

  function build() {
    var sc = $('.scene'); if (!sc || reduce) return;
    var lys = $$('.ly'), n = $('[data-n]');
    function setL(k) { lys.forEach(function (l, i) { l.classList.toggle('is-on', i === k); }); if (n) n.textContent = '0' + (k + 1); }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      sc.classList.add('is-live'); setL(0);
      var pp = $$('.pp').map(function (p) { var L = Math.ceil(p.getTotalLength()) + 2; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return p; });
      var wall = $('.wall');
      gsap.set(['.wl--brick', '.wl--plaster', '.wl--paint', '.wl--tiles'], { clipPath: 'inset(0 0 100% 0)' });
      gsap.set('.box', { opacity: 0 });
      var t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
        trigger: sc, start: 'top top', end: ctx.conditions.phone ? '+=140%' : '+=260%', pin: true, scrub: .6,
        onUpdate: function (s) { setL(Math.min(4, Math.floor(s.progress * 5 * 0.999))); } } });
      t.to('.wl--brick', { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power1.out' }, 0)
       .to('.wl--brick', { backgroundPosition: 'center 40%', duration: 1 }, 0)
       .to(pp, { strokeDashoffset: 0, duration: 1, stagger: .12 }, 1)
       .to('.box', { opacity: 1, duration: .2 }, 1.6)
       .to('.wl--plaster', { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power1.inOut' }, 2)
       .to('.wl--paint', { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'none' }, 3)
       .fromTo('.roller', { opacity: 1, y: 0 }, { y: function () { return wall.offsetHeight; }, duration: 1, ease: 'none' }, 3)
       .to('.roller', { opacity: 0, duration: .1 }, 3.95)
       .to('.wl--tiles', { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'steps(8)' }, 4)
       .to({}, { duration: .4 });
      return function () {
        sc.classList.remove('is-live'); lys.forEach(function (l) { l.classList.remove('is-on'); }); lys[0].classList.add('is-on');
        pp.forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
        gsap.set(['.wl--brick', '.wl--plaster', '.wl--paint', '.wl--tiles', '.box', '.roller'], { clearProps: 'all' });
      };
    });
  }

  var go = function () { build(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
