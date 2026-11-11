/* N&G Ristrutturazioni edili: hero entrance and reel drift, header, full-screen menu, anchors, reveals, count-up,
   gallery strip progress, process line, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene (before / after scrub in three stages, re-composed for portrait on phones). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var hd = d.getElementById('hd');
  function onScroll() { hd.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
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
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#cantiere' ? 0 : hd.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already on screen shows at once) */
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up (a quantity: number of reviews) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* scroll-linked: hero reel drift, process line */
  var reel = d.querySelector('[data-reel]'), hero = d.querySelector('.hero');
  var line = d.querySelector('[data-line]'), lineFill = d.querySelector('.steps__line span');
  var tick = false;
  function frame() {
    tick = false;
    var vh = window.innerHeight;
    if (reel) {
      var y = window.scrollY;
      if (y < hero.offsetHeight + 200) reel.style.transform = 'translate3d(' + (-y * (window.innerWidth < 761 ? 0.45 : 0.3)).toFixed(1) + 'px,0,0)';
    }
    if (line && lineFill && lineFill.offsetParent) {
      var r = line.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.6)));
      lineFill.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    }
  }
  if (!reduce) {
    if (lineFill) lineFill.style.transform = 'scaleX(0)';
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* phone contact bar: hidden until the hero is scrolled past */
  var mbar = d.querySelector('.mbar');
  if (mbar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }, { threshold: 0 }).observe(hero);
  } else if (mbar) mbar.classList.add('is-on');

  /* gallery strip: drag with the mouse, progress bar on phones */
  var strip = d.querySelector('[data-drag]'), sbar = d.querySelector('.work__bar span');
  if (strip) {
    var prog = function () { if (sbar && strip.scrollWidth > strip.clientWidth) sbar.style.transform = 'scaleX(' + Math.min(1, (strip.scrollLeft + strip.clientWidth) / strip.scrollWidth).toFixed(3) + ')'; };
    strip.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' }); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' }); }
    });
  }

  /* magnetic buttons, desktop pointer only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
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

  /* signature scene: from the open site to the finished home, scrubbed by the scroll */
  var sec = d.querySelector('.scene');
  function staticScene() { sec.classList.add('is-static'); }
  function scene() {
    if (!sec) return;
    if (reduce || !window.gsap || !window.ScrollTrigger) { staticScene(); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var q = function (s) { return sec.querySelector(s); };
    var frameEl = q('.scene__frame'), s1 = q('.s1 img'), s2 = q('.s2'), s3 = q('.s3'), e2 = q('.e2'), e3 = q('.e3');
    var steps = sec.querySelectorAll('.scene__steps li'), num = q('.scene__num'), bar = q('.scene__bar span');
    var txt = q('.scene__txt'), tag = q('.scene__tag');
    var mm = gsap.matchMedia();

    function build(portrait) {
      // portrait: the new layer comes down from the top (a horizontal edge); landscape: it slides in from the left (a vertical edge)
      var hidden = portrait ? 'inset(0% 0% 100% 0%)' : 'inset(0% 100% 0% 0%)';
      var shown = 'inset(0% 0% 0% 0%)';
      [e2, e3].forEach(function (e) {
        e.style.display = 'block';
        if (portrait) { e.style.width = '100%'; e.style.height = '3px'; e.style.top = '0'; e.style.bottom = 'auto'; }
        else { e.style.width = '3px'; e.style.height = ''; e.style.top = '0'; e.style.bottom = '0'; }
      });
      gsap.set([s2, s3], { clipPath: hidden });
      gsap.set([e2, e3], { autoAlpha: 0, x: 0, y: 0 });
      gsap.set(frameEl, { clipPath: 'inset(10% 10% 10% 10%)' });
      gsap.set(s1, { scale: 1.15 });
      gsap.set(txt, { autoAlpha: 0, y: 30 });
      gsap.set(tag, { autoAlpha: 0 });
      gsap.set(bar, { scaleX: 0 });
      var W = function () { return frameEl.offsetWidth; }, H = function () { return frameEl.offsetHeight; };
      var move = portrait ? function (e) { return { y: H }; } : function (e) { return { x: W }; };
      var stage = -1;
      function setStage(k) {
        if (k === stage) return; stage = k;
        num.textContent = '0' + (k + 1);
        steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
      }
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec, start: 'top top', end: portrait ? '+=130%' : '+=220%', pin: q('.scene__pin'), scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (s) { var t = s.progress * tl.duration(); setStage(t < 2.4 ? 0 : t < 4.6 ? 1 : 2); }
        }
      });
      tl.to(frameEl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.out' }, 0)
        .to(s1, { scale: 1, duration: 1.4, ease: 'power2.out' }, 0)
        .to(txt, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.2)
        .to(tag, { autoAlpha: 1, duration: 0.3 }, 0.8)
        .to(bar, { scaleX: 1, duration: 6.4 }, 0.6)
        // stage 2: walls and floors arrive
        .to(e2, { autoAlpha: 1, duration: 0.1 }, 1.6)
        .to(s2, { clipPath: shown, duration: 1.6, ease: 'power1.inOut' }, 1.7)
        .to(e2, Object.assign({ duration: 1.6, ease: 'power1.inOut' }, portrait ? { y: function () { return H(); } } : { x: function () { return W(); } }), 1.7)
        .to(e2, { autoAlpha: 0, duration: 0.2 }, 3.3)
        // stage 3: the finished, lived-in room
        .to(e3, { autoAlpha: 1, duration: 0.1 }, 3.9)
        .to(s3, { clipPath: shown, duration: 1.6, ease: 'power1.inOut' }, 4.0)
        .to(e3, Object.assign({ duration: 1.6, ease: 'power1.inOut' }, portrait ? { y: function () { return H(); } } : { x: function () { return W(); } }), 4.0)
        .to(e3, { autoAlpha: 0, duration: 0.2 }, 5.6)
        .to({}, { duration: 1.2 });
      setStage(0);
      return function () { gsap.set([s2, s3, frameEl, s1, txt, tag, bar, e2, e3], { clearProps: 'all' }); };
    }
    mm.add('(max-width: 760px)', function () { return build(true); });
    mm.add('(min-width: 761px)', function () { return build(false); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
