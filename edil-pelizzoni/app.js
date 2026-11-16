/* Edil Pelizzoni: curtain hero entrance, header, phone menu, anchors, reveals, count-up, review drag strip,
   process line, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a drawn house whose old marsigliese tiles come off row by row and insulated coppo-effect panels go on. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset; the no-op language link does nothing */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 4);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
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
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseFloat(el.dataset.count);
    if (reduce) return;
    el.textContent = '0';
    reveal([el], function () {
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  });

  /* reviews: drag to scroll on desktop, native swipe on touch */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') s.scrollBy({ left: 320, behavior: 'smooth' }); if (e.key === 'ArrowLeft') s.scrollBy({ left: -320, behavior: 'smooth' }); });
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + 0.3) / st.length || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Due righe sulla vostra richiesta.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
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

  /* GSAP signature scene: the roof is redone, four steps */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return roofScene(false); });
    mm.add('(max-width: 699px)', function () { return roofScene(true); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function roofScene(small) {
    var pin = sec.querySelector('.scene__pin');
    var survey = sec.querySelector('.survey'), oldRows = sec.querySelectorAll('.row-o'), newRows = sec.querySelectorAll('.row-n');
    var gutters = sec.querySelectorAll('.gutter'), section = sec.querySelector('.section'), done = sec.querySelector('.done');
    var caps = sec.querySelectorAll('.cap'), cur = sec.querySelector('.scene__cur'), bar = sec.querySelector('.scene__bar i');
    var last = -1;
    function setCap(i) { if (i === last) return; last = i; caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); }); cur.textContent = '0' + (i + 1); }
    function dash(el) { var L = el.getTotalLength(); el.style.strokeDasharray = L + ' ' + L; return L; }
    var sL = survey.getTotalLength();
    gsap.set(survey, { strokeDasharray: '8 7', strokeDashoffset: 0, opacity: 0 });
    gutters.forEach(function (g) { gsap.set(g, { strokeDashoffset: dash(g) }); });
    gsap.set(newRows, { y: -70, opacity: 0 });
    gsap.set(oldRows, { y: 0, opacity: 1 });
    gsap.set(section, { opacity: 0, y: -10 });
    gsap.set(done, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
    gsap.set(bar, { scaleX: 0 });
    setCap(0);
    var oldTop = Array.prototype.slice.call(oldRows);
    var newBottomUp = Array.prototype.slice.call(newRows).reverse();
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, pin: pin, scrub: 0.6, start: 'top top', end: small ? '+=150%' : '+=240%', anticipatePin: 1,
        onUpdate: function (self) { var p = self.progress; setCap(p < 0.18 ? 0 : p < 0.45 ? 1 : p < 0.8 ? 2 : 3); }
      }
    });
    tl.to(survey, { opacity: 1, duration: 0.04 }, 0.02)
      .fromTo(survey, { strokeDashoffset: sL }, { strokeDashoffset: 0, duration: 0.14 }, 0.02)
      .to(survey, { opacity: 0, duration: 0.04 }, 0.2)
      .to(oldTop, { y: -40, x: 30, opacity: 0, duration: 0.08, stagger: 0.025, ease: 'power1.in' }, 0.2)
      .to(newBottomUp, { y: 0, opacity: 1, duration: 0.07, stagger: 0.03, ease: 'power2.out' }, 0.47)
      .to(section, { opacity: 1, y: 0, duration: 0.06 }, 0.52)
      .to(gutters, { strokeDashoffset: 0, duration: 0.1, stagger: 0.04 }, 0.8)
      .to(done, { opacity: 1, scale: 1, duration: 0.06, ease: 'back.out(2)' }, 0.92)
      .to(bar, { scaleX: 1, duration: 1 }, 0);
    return function () { gutters.forEach(function (g) { g.style.strokeDasharray = ''; g.style.strokeDashoffset = ''; }); };
  }
})();
