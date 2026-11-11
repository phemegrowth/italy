/* Maletti Case, Modena: page behaviour. Vanilla JS + GSAP ScrollTrigger for the door scene. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header shrink */
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
      e.style.transitionDelay = (Math.max(0, Math.min(sib, 4)) * 80) + 'ms';
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* listing filter chips */
  var chips = $$('.chip'), cards = $$('.pc');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (o) { var on = o === c; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var k = 0;
      cards.forEach(function (p) {
        var show = f === 'all' || p.getAttribute('data-t') === f;
        p.classList.toggle('is-out', !show);
        p.classList.remove('is-in');
        if (show && !reduce) { void p.offsetWidth; p.style.animationDelay = (k++ * 60) + 'ms'; p.classList.add('is-in'); }
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  /* accordion: one open at a time */
  var accs = $$('.acc__it');
  accs.forEach(function (it) {
    var b = $('button', it);
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      accs.forEach(function (o) { o.classList.remove('is-open'); $('button', o).setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* rating count-up */
  $$('[data-count]').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.getAttribute('data-count')), dec = +el.getAttribute('data-dec') || 0;
    el.textContent = (0).toFixed(dec).replace('.', ',');
    var cio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; cio.disconnect();
      var t0 = performance.now();
      (function tick(t) { var k = Math.min(1, (t - t0) / 1300); el.textContent = (to * (1 - Math.pow(1 - k, 3))).toFixed(dec).replace('.', ','); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .5 });
    cio.observe(el);
  });

  /* sticky phone bar */
  var bar = $('#bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }, { rootMargin: '-60px 0px 0px 0px' }).observe($('.hero__cta'));
  else bar.classList.add('is-on');

  /* form validation */
  var form = $('.form');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe.' };
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

  /* The door: two leaves swing open with scroll, the room behind settles, the steps change */
  function scenes() {
    var g = window.gsap, ST = window.ScrollTrigger;
    var caps = $$('.caps li'), L = $('.leaf--l'), R = $('.leaf--r'), room = $('.door__room'), num = $('.door__n'), barI = $('.door__bar i');
    if (!g || !ST || reduce) { caps.forEach(function (c) { c.classList.add('is-on'); }); num.textContent = '04'; return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    var cl = function (v) { return Math.max(0, Math.min(1, v)); };
    var ease = function (v) { return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
    var last = -1;
    var draw = function (p) {
      var o = ease(cl((p - .06) / .72));
      L.style.transform = 'rotateY(' + (-104 * o).toFixed(2) + 'deg)';
      R.style.transform = 'rotateY(' + (104 * o).toFixed(2) + 'deg)';
      L.style.opacity = R.style.opacity = o > .97 ? 0 : 1;
      room.style.transform = 'scale(' + (1.22 - .22 * ease(cl(p / .9))).toFixed(4) + ')';
      var k = Math.min(3, Math.floor(p * 4.2));
      if (k !== last) { last = k; caps.forEach(function (c, i) { c.classList.toggle('is-on', i === k); }); num.textContent = '0' + (k + 1); }
      barI.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    };
    draw(0);
    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      ST.create({ trigger: '.door', pin: true, start: 'top top', end: ctx.conditions.phone ? '+=140%' : '+=200%', scrub: .4, onUpdate: function (s) { draw(s.progress); }, onRefresh: function (s) { draw(s.progress); } });
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
