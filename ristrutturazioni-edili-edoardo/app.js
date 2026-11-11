/* Ristrutturazioni Edili Edoardo: hero entrance (headline lines rise, four photo cards fan out from a stack
   into a collage, then drift at different speeds on scroll), header, menu, anchors, reveals, count-up,
   drag strip for reviews, process line, magnetic buttons, phone contact bar, form, and the GSAP signature
   scene: the red paint roller from their logo rolls across a 1970s bathroom and reveals the renovated one. */
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
  var hero = d.querySelector('.hero');
  var mbar = d.querySelector('.mbar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* count-up (sourced quantities only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1100);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* hero cards drift at different speeds as you scroll (photo inside the card moves, the card keeps its tilt) */
  var fanImgs = d.querySelectorAll('.fan__c img');
  if (fanImgs.length && !reduce) {
    var speeds = [0.05, -0.04, 0.08, -0.07], ft = false;
    fanImgs.forEach(function (im) { im.style.transform = 'scale(1.12)'; });
    window.addEventListener('scroll', function () {
      if (ft) return; ft = true;
      requestAnimationFrame(function () {
        ft = false;
        var y = window.scrollY;
        if (y > window.innerHeight * 1.2) return;
        fanImgs.forEach(function (im, i) { im.style.transform = 'translate3d(0,' + (y * speeds[i]).toFixed(1) + 'px,0) scale(1.12)'; });
      });
    }, { passive: true });
  }

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, sx = 0, sl = 0;
    s.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); s.scrollLeft = sl - (e.pageX - sx); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { s.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { s.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop pointer only) */
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
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', function () { return rollerScene(false); });
    mm.add('(max-width: 960px)', function () { return rollerScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function rollerScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var ba = sec.querySelector('[data-ba]'), after = ba.querySelector('.ba__after'), roller = ba.querySelector('.ba__roller');
    var labB = ba.querySelector('.ba__lab--b'), labA = ba.querySelector('.ba__lab--a');
    var steps = sec.querySelectorAll('.ba__steps li');
    var state = { p: 0 };
    function paint() {
      var p = state.p;
      if (small) {
        after.style.clipPath = 'inset(0 0 ' + ((1 - p) * 100).toFixed(2) + '% 0)';
        roller.style.transform = 'translate3d(0,' + (p * ba.clientHeight).toFixed(1) + 'px,0)';
      } else {
        after.style.clipPath = 'inset(0 ' + ((1 - p) * 100).toFixed(2) + '% 0 0)';
        roller.style.transform = 'translate3d(' + (p * ba.clientWidth).toFixed(1) + 'px,0,0)';
      }
    }
    if (small) { roller.style.top = '0'; roller.style.left = '0'; }
    else { roller.style.left = '0'; }
    gsap.set(labA, { autoAlpha: 0 });
    gsap.set(steps, { clearProps: 'all' });
    paint();

    var tl = gsap.timeline();
    tl.to(state, { p: 1, duration: 3, ease: 'none', onUpdate: paint }, 0.3)
      .to(labB, { autoAlpha: 0, duration: .2 }, 3.0)
      .to(labA, { autoAlpha: 1, duration: .3 }, 3.0)
      .to({}, { duration: .5 }, 3.3);
    var at = [0, 1.1, 2.2];
    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 0; j < at.length; j++) if (t >= at[j]) s = j + 1;
      if (s === last) return;
      last = s;
      steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-cap') === s); });
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
      pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onRefresh: paint,
      onToggle: function (self) { if (mbar) mbar.classList.toggle('is-hush', small && self.isActive); }
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      after.style.clipPath = ''; roller.style.transform = ''; roller.style.top = ''; roller.style.left = '';
      gsap.set([labA, labB], { clearProps: 'all' });
      steps.forEach(function (li) { li.classList.remove('is-on'); });
    };
  }
})();
