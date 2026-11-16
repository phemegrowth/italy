(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('rm');

  /* hero entrance: starts on the first frame, no font or image wait */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  /* header shrink + sticky bar after the hero */
  var hdr = document.querySelector('.hdr');
  var bar = document.querySelector('.bar');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 40);
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

  /* reveals */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('is-vis'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var sibs = [].slice.call(en.target.parentNode.children).filter(function (c) { return c.classList.contains('rv'); });
          en.target.style.transitionDelay = Math.max(0, sibs.indexOf(en.target)) * 80 + 'ms';
          en.target.classList.add('is-vis'); io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-vis'); else io.observe(el);
    });
  }

  /* services: active item swaps the photo (hover on desktop, scroll position everywhere) */
  var items = [].slice.call(document.querySelectorAll('.svc__list li'));
  var pics = [].slice.call(document.querySelectorAll('.svc__ph img'));
  function setSvc(k) {
    items.forEach(function (li) { li.classList.toggle('is-on', li.dataset.k === k); });
    pics.forEach(function (im) { im.classList.toggle('is-on', im.dataset.k === k); });
  }
  items.forEach(function (li) { li.addEventListener('mouseenter', function () { setSvc(li.dataset.k); }); });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setSvc(e.target.dataset.k); }); }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { sio.observe(li); });
  }

  /* drag strip */
  var drag = document.querySelector('.drag');
  if (drag) {
    var down = false, sx = 0, sl = 0, moved = false;
    drag.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; drag.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    drag.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { drag.scrollBy({ left: 320, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { drag.scrollBy({ left: -320, behavior: 'smooth' }); e.preventDefault(); }
    });
  }

  /* process line draws with scroll */
  var stepsWrap = document.querySelector('.steps__wrap');
  if (stepsWrap && !reduce) {
    var line = stepsWrap.querySelector('.steps__line');
    var tick = false;
    var upd = function () {
      tick = false;
      var r = stepsWrap.getBoundingClientRect();
      var p = (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.35);
      line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  } else if (stepsWrap) { stepsWrap.querySelector('.steps__line').style.setProperty('--p', 1); }

  /* form validation */
  var form = document.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero per richiamarvi.', email: 'Email non valida.', type: 'Scegliete il tipo di lavoro.', message: 'Due righe sul lavoro ci aiutano.' };
    var check = function (el) {
      var f = el.closest('.field'); if (!f) return true;
      var v = el.value.trim(), ok = true;
      if (el.required && !v) ok = false;
      if (ok && el.name === 'email' && v) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && el.name === 'phone') ok = v.replace(/\D/g, '').length >= 8;
      f.classList.toggle('bad', !ok);
      f.querySelector('.err').textContent = ok ? '' : msgs[el.name] || 'Controllate questo campo.';
      return ok;
    };
    form.addEventListener('submit', function (e) {
      var els = [].slice.call(form.querySelectorAll('input:not([type=hidden]):not([name=bot-field]),select,textarea'));
      var bad = els.filter(function (el) { return !check(el); });
      if (bad.length) { e.preventDefault(); bad[0].focus(); }
    });
    form.addEventListener('blur', function (e) { if (e.target.matches('input,select,textarea')) check(e.target); }, true);
  }

  /* footer year */
  var yr = document.querySelector('.yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* signature scene: swatch fan opens, the chosen strip becomes the wall */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var scene = document.querySelector('.scene');
    var strips = gsap.utils.toArray('.strip');
    var pick = document.querySelector('.strip--pick');
    var others = strips.filter(function (s) { return s !== pick; });
    var wall = document.querySelector('.wall');
    var steps = [].slice.call(document.querySelectorAll('.scene__steps li'));
    var count = document.querySelector('.scene__count');
    var barI = document.querySelector('.scene__bar i');
    var n = strips.length, mid = (n - 1) / 2;

    function setStep(i) {
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      count.textContent = '0' + (i + 1) + ' / 03';
    }

    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var spread = phone ? 9.5 : 16;
      gsap.set(strips, { rotation: 0, y: 40, opacity: 0 });
      gsap.set(wall, { clipPath: 'polygon(0% 0%, 0% 0%, -20% 100%, -20% 100%)' });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: phone ? '+=130%' : '+=230%', pin: '.scene__pin', scrub: 0.6, anticipatePin: 1,
          onUpdate: function (st) {
            var p = st.progress; barI.style.transform = 'scaleX(' + p.toFixed(3) + ')';
            setStep(p < 0.36 ? 0 : p < 0.64 ? 1 : 2);
          }
        }
      });
      tl.to(strips, { y: 0, opacity: 1, duration: 0.08, stagger: 0.008 })
        .to(strips, { rotation: function (i) { return (i - mid) * spread; }, duration: 0.26, ease: 'power1.out' }, '>-0.02')
        .to(others, { rotation: function (i) { var k = strips.indexOf(others[i]); return (k - mid) * spread * 1.25; }, opacity: 0, y: 30, duration: 0.14 }, '+=0.04')
        .to(pick, { rotation: 0, scale: phone ? 1.12 : 1.18, y: phone ? -6 : -10, duration: 0.14 }, '<')
        .to(pick, { xPercent: phone ? -135 : -150, duration: 0.1 }, '>')
        .to(wall, { clipPath: 'polygon(0% 0%, 120% 0%, 100% 100%, -20% 100%)', duration: 0.3, ease: 'power1.inOut' }, '<0.02')
        .to(pick, { opacity: 0, duration: 0.06 }, '>-0.08')
        .to({}, { duration: 0.06 });
      return function () { gsap.set([strips, wall], { clearProps: 'all' }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
