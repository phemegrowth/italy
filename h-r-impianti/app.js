/* H.R. Impianti: hero B (split screen, their kitchen photo wipes in and parallaxes slower than the page),
   line reveal, header, menu, phone bar, anchors, reveals, accordion, drag strip, process line, magnetic
   buttons, form validation, and the GSAP signature scene: a bathroom wall built layer by layer
   (muratura, impianti, rasatura, lastre) with a section bar that fills beside it. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1080 && menu.classList.contains('is-open')) setMenu(false); });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : 60);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

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

  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; fn(); }); }, { passive: true });
    fn();
  }

  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul lavoro.' };
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


  /* hero parallax (desktop and phone, transform only) */
  var par = d.querySelector('.hero__par');
  if (par && !reduce) onFrameScroll(function () { var y = window.scrollY; if (y < window.innerHeight * 1.2) par.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)'; });

  /* accordion */
  d.querySelectorAll('.acc__item button').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.closest('.acc__item'), open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 550);
    });
  });

  /* drag strip */
  d.querySelectorAll('.strip').forEach(function (s) {
    var bar = s.parentNode.querySelector('.strip__bar');
    function upd() { var m = s.scrollWidth - s.clientWidth; var p = m > 0 ? s.scrollLeft / m : 1; if (bar) bar.style.setProperty('--p', (0.15 + p * 0.85).toFixed(3)); }
    s.addEventListener('scroll', upd, { passive: true }); upd();
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; s.scrollLeft = l0 - (e.clientX - x0); });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
  });

  /* ---------- signature scene: dentro la parete ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var steps = scene.querySelectorAll('.wall__steps li');
  var last = -1;
  function setI(i) { if (i === last) return; last = i; steps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); }); }
  function build() {
    var phone = window.innerWidth < 900;
    var brick = scene.querySelector('.w--brick'), imp = scene.querySelector('.w--imp'), pl = scene.querySelector('.w--plaster'), slab = scene.querySelector('.w--slab');
    var pipes = imp.querySelectorAll('path'), cuts = scene.querySelectorAll('.c');
    gsap.set(scene.querySelectorAll('.wall__art, .wall__steps'), { opacity: 0, y: 30 });
    gsap.set(brick, { clipPath: 'inset(100% 0% 0% 0%)' });
    pipes.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }); });
    gsap.set(imp.querySelectorAll('rect, circle'), { opacity: 0 });
    gsap.set(pl, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(slab, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(cuts, { scaleY: 0, transformOrigin: '50% 100%' });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { invalidateOnRefresh: true,
        trigger: scene, start: 'top top', end: phone ? '+=160%' : '+=260%', pin: scene.querySelector('.wall__pin'), scrub: .5, anticipatePin: 1,
        onUpdate: function (st) { var p = st.progress; setI(p < 0.3 ? 0 : p < 0.55 ? 1 : p < 0.78 ? 2 : 3); },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(scene.querySelectorAll('.wall__art, .wall__steps'), { opacity: 1, y: 0, duration: .4, stagger: .06, ease: 'power2.out' }, 0)
      .to(brick, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4 }, .3)
      .to(cuts[0], { scaleY: 1, duration: 1.2 }, .4)
      .to(pipes, { strokeDashoffset: 0, duration: 1.4, stagger: .2 }, 2)
      .to(imp.querySelectorAll('rect, circle'), { opacity: 1, duration: .3 }, 3)
      .to(cuts[1], { scaleY: 1, duration: 1.2 }, 2.1)
      .to(pl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4 }, 3.8)
      .to(cuts[2], { scaleY: 1, duration: 1.2 }, 3.9)
      .to(slab, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6 }, 5.4)
      .to(cuts[3], { scaleY: 1, duration: 1.4 }, 5.5)
      .to({}, { duration: .8 });
  }
  var started = false;
  function start() {
    if (started) return; started = true; build(); ScrollTrigger.refresh();
    if ('ResizeObserver' in window) { var rt, lh = d.body.offsetHeight; new ResizeObserver(function () { var h = d.body.offsetHeight; if (Math.abs(h - lh) < 2) return; lh = h; clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); lh = d.body.offsetHeight; }, 200); }).observe(d.body); }
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
