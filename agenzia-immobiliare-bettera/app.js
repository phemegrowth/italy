/* Agenzia Immobiliare Bettera: page behaviour. Vanilla JS + GSAP ScrollTrigger for the listings strip. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  var hdr = $('#hdr');
  var onScroll = function () { hdr.classList.toggle('is-small', window.scrollY > 24); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* phone menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024 && !menu.hidden) setMenu(false); });

  /* reveals */
  var reveals = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (e) {
      var sib = $$(':scope > .r', e.parentElement).indexOf(e);
      e.style.transitionDelay = (Math.max(0, sib) * 80) + 'ms';
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* count-up of the years (30 = since 1996) */
  $$('[data-count]').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.getAttribute('data-count'));
    var cio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; cio.disconnect();
      var t0 = performance.now();
      (function tick(t) { var k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .6 });
    cio.observe(el);
  });

  /* sticky bar on phones after the hero buttons */
  var bar = $('#bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }, { rootMargin: '-80px 0px 0px 0px' }).observe($('.hero__cta'));
  else bar.classList.add('is-on');

  /* form validation */
  var form = $('.form');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe: zona, tipo di casa.' };
    var check = function (inp) {
      var f = inp.closest('.f'), e = $('.err', f), v = inp.value.trim(), ok;
      if (inp.name === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      else if (inp.name === 'phone') ok = v.replace(/\D/g, '').length >= 6;
      else ok = v.length > 1;
      f.classList.toggle('bad', !ok); e.textContent = ok ? '' : msgs[inp.name]; return ok;
    };
    var req = $$('[required]', form);
    req.forEach(function (i) { i.addEventListener('blur', function () { check(i); }); i.addEventListener('input', function () { if (i.closest('.f').classList.contains('bad')) check(i); }); });
    form.addEventListener('submit', function (e) { var bad = req.filter(function (i) { return !check(i); }); if (bad.length) { e.preventDefault(); bad[0].focus(); } });
  }

  /* GSAP: pinned horizontal listings, sell-steps line, studio parallax */
  function scenes() {
    var g = window.gsap, ST = window.ScrollTrigger;
    var track = $('.lst__track'), cards = $$('.card', track), cnt = $('.lst__i'), barI = $('.lst__bar i');
    var steps = $('.sell__steps');
    if (!g || !ST || reduce) { if (steps) steps.style.setProperty('--p', 1); return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    var n = 6;
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };

    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      var tween = g.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: '.lst', pin: true, start: 'top top', end: function () { return '+=' + Math.round(dist() * (ctx.conditions.phone ? 1.15 : 1.1)); }, scrub: .5, invalidateOnRefresh: true,
          onUpdate: function (s) {
            var k = Math.min(n, Math.floor(s.progress * n) + 1);
            cnt.textContent = ('0' + k).slice(-2);
            barI.style.transform = 'scaleX(' + (0.14 + 0.86 * s.progress).toFixed(3) + ')';
          }
        }
      });
      /* each card unmasks as it enters from the right */
      cards.forEach(function (c) {
        g.fromTo(c, { clipPath: 'inset(0% 30% 0% 0% round 22px)', opacity: .4 }, {
          clipPath: 'inset(0% 0% 0% 0% round 22px)', opacity: 1, ease: 'none',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 100%', end: 'left 62%', scrub: true }
        });
      });
      /* the sell steps line draws as the list scrolls through */
      ST.create({ trigger: steps, start: 'top 70%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { steps.style.setProperty('--p', s.progress.toFixed(3)); } });
      if (ctx.conditions.desk) {
        g.to('.sp--b', { yPercent: -16, ease: 'none', scrollTrigger: { trigger: '.studio', start: 'top bottom', end: 'bottom top', scrub: true } });
      }
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
