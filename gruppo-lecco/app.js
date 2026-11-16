(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = document.querySelector('.hdr');
  var bar = document.querySelector('.bar');

  /* year */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* header shrink */
  function onScroll() { hdr.classList.toggle('is-scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

  /* language no-op */
  document.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });


  /* smooth anchors (CSS smooth scroll fights the pinned scene) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2 || a.getAttribute('aria-disabled')) return;
      var el = document.querySelector(id); if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - (hdr.offsetHeight + 8);
      window.scrollTo({ top: id === '#top' ? 0 : y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var sibs = Array.prototype.indexOf.call(en.target.parentNode.children, en.target);
          en.target.style.transitionDelay = Math.min(sibs, 5) * 80 + 'ms';
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* sticky contact bar on phones, after the hero */
  var hero = document.querySelector('.hero');
  if ('IntersectionObserver' in window && bar) {
    new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting); }, { threshold: 0 }).observe(hero);
  }

  /* services: accordion + photo swap */
  var items = document.querySelectorAll('.svc__item');
  var imgs = document.querySelectorAll('.svc__img');
  var cur = 0;
  function showImg(src) {
    var on = imgs[cur], off = imgs[1 - cur];
    if (on.getAttribute('src') === src) return;
    off.setAttribute('src', src);
    off.classList.add('is-on'); on.classList.remove('is-on');
    cur = 1 - cur;
  }
  items.forEach(function (it) {
    var btn = it.querySelector('.svc__btn');
    btn.addEventListener('click', function () {
      var open = it.classList.contains('is-open');
      items.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.svc__btn').setAttribute('aria-expanded', 'false'); });
      if (!open) { it.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); showImg(it.dataset.img); }
    });
    it.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) showImg(it.dataset.img); });
  });

  /* drag strip (mouse only; touch scrolls natively) */
  var strip = document.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
  }

  /* form validation */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var wrap = f.closest('.f');
        var valid = f.type === 'checkbox' ? f.checked : f.checkValidity() && f.value.trim() !== '';
        if (wrap) wrap.classList.toggle('is-bad', !valid);
        if (f.type === 'checkbox') form.querySelector('.err--chk').classList.toggle('is-bad', !valid);
        if (!valid && ok) { ok = false; f.focus(); }
      });
      if (!ok) e.preventDefault();
    });
    form.querySelectorAll('input,select,textarea').forEach(function (f) {
      f.addEventListener('input', function () { var w = f.closest('.f'); if (w) w.classList.remove('is-bad'); if (f.type === 'checkbox') form.querySelector('.err--chk').classList.remove('is-bad'); });
    });
  }

  /* ---------- signature scene: LECCO text-mask fly-through ---------- */
  var scene = document.querySelector('.scene');
  var svg = scene.querySelector('.scene__svg');
  var word = svg.querySelector('#word');
  var rect = svg.querySelector('rect[mask]');
  var mrect = svg.querySelector('mask rect');
  var probe = null;
  var origin = { x: 0, y: 0 };

  function layoutWord() {
    var w = scene.clientWidth, h = window.innerHeight;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    [rect, mrect].forEach(function (r) { r.setAttribute('width', w); r.setAttribute('height', h); });
    var mask = svg.querySelector('mask'); mask.setAttribute('width', w); mask.setAttribute('height', h);
    var fs = Math.min(w * (w < 700 ? 0.235 : 0.25), h * 0.42);
    var y = h * 0.5 + fs * 0.36;
    [word, probe].forEach(function (t) {
      if (!t) return;
      t.setAttribute('x', w / 2); t.setAttribute('y', y);
      t.setAttribute('font-size', fs); t.setAttribute('letter-spacing', -fs * 0.02);
    });
    if (!probe) {
      probe = word.cloneNode(true); probe.removeAttribute('id'); probe.setAttribute('opacity', '0'); probe.setAttribute('aria-hidden', 'true');
      svg.appendChild(probe);
    }
    var ext;
    try { ext = probe.getExtentOfChar(0); } catch (e) { ext = null; }
    var lx = ext ? ext.x + ext.width * 0.2 : w / 2 - fs * 1.3;
    origin = { x: lx, y: y - fs * 0.38 };
    scene.querySelector('.scene__mask').style.transformOrigin = origin.x + 'px ' + origin.y + 'px';
  }

  function staticScene() { scene.classList.add('is-static'); }

  if (reduce || !window.gsap || !window.ScrollTrigger) {
    staticScene();
  } else {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var build = function () {
      layoutWord();
      var mm = gsap.matchMedia();
      mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (ctx) {
        var phone = ctx.conditions.phone;
        var maskEl = scene.querySelector('.scene__mask');
        var tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: scene, start: 'top top', end: phone ? '+=130%' : '+=220%', pin: scene.querySelector('.scene__stage'), scrub: 0.6, invalidateOnRefresh: true, onRefreshInit: layoutWord }
        });
        tl.fromTo('.scene__photo img', { scale: 1.25 }, { scale: 1, duration: 1 }, 0)
          .to('.scene__top', { autoAlpha: 0, y: -30, duration: 0.12 }, 0.06)
          .fromTo(maskEl, { scale: 1 }, { scale: phone ? 22 : 26, ease: 'power3.in', duration: 0.56 }, 0.08)
          .to(maskEl, { autoAlpha: 0, duration: 0.08 }, 0.58)
          .to('.scene__card', { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.22 }, 0.7)
          .to({}, { duration: 0.08 });
        return function () { gsap.set([maskEl, '.scene__top', '.scene__card', '.scene__photo img'], { clearProps: 'all' }); };
      });

      /* steps line */
      var line = document.querySelector('.steps__line span');
      var lineWrap = document.querySelector('.steps__line');
      var dots = document.querySelector('.steps__list');
      if (line && getComputedStyle(lineWrap).display !== 'none') {
        lineWrap.style.top = (dots.offsetTop - 1) + 'px';
      }
      gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 75%', scrub: 0.5 } });

      if (document.readyState !== 'complete') window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else window.addEventListener('load', build);
  }
})();
