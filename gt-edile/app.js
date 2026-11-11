/* GT Edile: hero entrance (photo wipe, line reveal, Ken Burns in CSS), header, full-screen menu, anchors, reveals,
   service photo follows the list, drag strip with progress, process line, magnetic buttons, phone contact bar, form,
   and the GSAP signature scene: their own bathroom, before and after, wiped by the scroll with three captions. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header');
  var mbar = d.querySelector('[data-mbar]');
  var hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar && hero) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('is-menu', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: the item nearest the middle of the screen (or hovered) drives the sticky photo (desktop) */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.slist__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  if (items.length) showPic(items[0].getAttribute('data-for'), items[0]);
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt || window.innerWidth < 900) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.35) showPic(best.getAttribute('data-for'), best);
    });
  }, { passive: true });

  /* drag strip + progress bar */
  var strip = d.querySelector('[data-drag]'), sbar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; moved = Math.abs(e.clientX - sx); strip.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var vis = strip.clientWidth / strip.scrollWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      if (sbar) sbar.style.transform = 'translateX(' + (p * (1 - vis) * 100 / vis).toFixed(2) + '%) scaleX(' + vis.toFixed(3) + ')';
    };
    if (sbar) { sbar.style.transformOrigin = 'left'; sbar.parentNode.style.overflow = 'hidden'; }
    strip.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.01 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene: before / after scrub */
  var started = false;
  function start() {
    if (started) return; started = true;
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    baScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
  setTimeout(start, 2500);

  function baScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var after = sec.querySelector('[data-after]'), line = sec.querySelector('[data-line]');
    var frame = sec.querySelector('.ba__frame'), copy = sec.querySelector('.ba__copy');
    var tagB = sec.querySelector('[data-tag-before]'), tagA = sec.querySelector('[data-tag-after]');
    var steps = sec.querySelectorAll('.ba__steps li'), bar = sec.querySelector('[data-bar]');
    var imgs = sec.querySelectorAll('.ba__img');
    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 899px)', big: '(min-width: 900px)' }, function (ctx) {
      var small = ctx.conditions.small;
      var st = { p: 0 };
      gsap.set(after, { clipPath: 'inset(0% 0% 0% 100%)' });
      gsap.set(line, { opacity: 0, xPercent: 0, left: '100%' });
      gsap.set(tagA, { autoAlpha: 0 });
      gsap.set(bar, { scaleX: 0 });
      gsap.fromTo(copy.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7, stagger: .08, ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 70%', toggleActions: 'play none none reverse' } });
      gsap.fromTo(frame, { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, duration: .9, ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 70%', toggleActions: 'play none none reverse' } });

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.to(imgs, { scale: 1.06, duration: 3, ease: 'none' }, .6)
        .to(line, { opacity: 1, duration: .15 }, .8)
        .to(st, { p: 1, duration: 2, ease: 'power1.inOut', onUpdate: function () {
          var v = st.p * 100;
          after.style.clipPath = 'inset(0% 0% 0% ' + (100 - v).toFixed(2) + '%)';
          line.style.left = (100 - v).toFixed(2) + '%';
        } }, .9)
        .to(tagB, { autoAlpha: 0, duration: .2 }, 2.4)
        .to(tagA, { autoAlpha: 1, duration: .2 }, 2.5)
        .to(line, { opacity: 0, duration: .2 }, 2.9)
        .to(bar, { scaleX: 1, duration: 3.2 }, 0)
        .to({}, { duration: .4 }, 3.2);

      var last = -1;
      tl.eventCallback('onUpdate', function () {
        var t = tl.time(), s = t < 1.3 ? 0 : (t < 2.4 ? 1 : 2);
        if (s !== last) { last = s; steps.forEach(function (li, i) { li.classList.toggle('is-on', i === s); }); }
      });

      ScrollTrigger.create({
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
        pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
      });
      return function () { gsap.set([after, line, tagA, tagB, bar, copy.children, frame, imgs], { clearProps: 'all' }); };
    });
  }
})();
