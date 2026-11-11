/* MA.CO Immobiliare, Parma: page behaviour. Vanilla JS + GSAP ScrollTrigger for the listings scene. */
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
      e.style.transitionDelay = (Math.max(0, sib) * 80) + 'ms';
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* tabs with sliding ink and photo swap */
  var tabs = $$('[role=tab]'), ink = $('.tabs__ink'), phs = $$('.serv__ph img');
  function moveInk(t) { ink.style.width = t.offsetWidth + 'px'; ink.style.transform = 'translateX(' + t.offsetLeft + 'px)'; }
  function select(t, focus) {
    tabs.forEach(function (o, i) {
      var on = o === t;
      o.setAttribute('aria-selected', on ? 'true' : 'false'); o.tabIndex = on ? 0 : -1;
      $('#' + o.getAttribute('aria-controls')).hidden = !on;
      if (phs[i]) phs[i].classList.toggle('is-on', on);
    });
    moveInk(t); if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true); }
    });
  });
  var inkInit = function () { moveInk($('[role=tab][aria-selected=true]')); };
  inkInit(); window.addEventListener('resize', inkInit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(inkInit);

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

  /* Listings scene. Desktop: pinned horizontal strip, each card unmasks as it enters. Phone: a deck, each card slides up over the last. */
  function scenes() {
    var g = window.gsap, ST = window.ScrollTrigger;
    var cards = $$('.card'), cnt = $('.lst__i'), barI = $('.lst__bar i'), track = $('.lst__track'), n = cards.length;
    if (!g || !ST || reduce) { cards.forEach(function (c) { c.classList.add('is-in'); }); return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    var setCount = function (k) { cnt.textContent = '0' + (k + 1); barI.style.transform = 'scaleX(' + ((k + 1) / n) + ')'; };

    var mm = g.matchMedia();
    mm.add('(min-width: 1024px)', function () {
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var vw = function () { return window.innerWidth; };
      var upd = function (p) {
        var x = -dist() * p;
        track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
        var k = 0;
        cards.forEach(function (c, i) {
          var left = c.offsetLeft + x;
          if (left < vw() * .92) c.classList.add('is-in');
          if (left + c.offsetWidth / 2 < vw() * .62) k = i;
        });
        if (p > .97) k = n - 1;
        setCount(k);
      };
      var st = ST.create({ trigger: '.lst', pin: true, start: 'top top', end: function () { return '+=' + Math.round(dist() * 1.15 + window.innerHeight * .3); }, scrub: .5, invalidateOnRefresh: true, onUpdate: function (s) { upd(s.progress); }, onRefresh: function (s) { upd(s.progress); } });
      upd(0);
      return function () { track.style.transform = ''; st.kill(); };
    });
    mm.add('(max-width: 1023px)', function () {
      var upd = function (p) {
        var k = p * (n - 1) * 1.08;
        cards.forEach(function (c, i) {
          if (i === 0) { var cov = Math.min(1, Math.max(0, k)); c.style.transform = 'scale(' + (1 - .05 * cov).toFixed(3) + ')'; c.style.opacity = (1 - .25 * Math.min(1, Math.max(0, k - 1))).toFixed(2); return; }
          var t = Math.min(1, Math.max(0, k - (i - 1)));
          var e = 1 - Math.pow(1 - t, 3);
          var covered = Math.min(1, Math.max(0, k - i));
          c.style.transform = 'translateY(' + ((1 - e) * 112).toFixed(2) + '%) scale(' + (1 - .05 * covered).toFixed(3) + ')';
        });
        setCount(Math.min(n - 1, Math.max(0, Math.floor(k + .4))));
      };
      var st = ST.create({ trigger: '.lst', pin: true, start: 'top top', end: '+=210%', scrub: .4, onUpdate: function (s) { upd(s.progress); }, onRefresh: function (s) { upd(s.progress); } });
      upd(0);
      return function () { cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; }); st.kill(); };
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
