/* Marseglia Costruzioni: hero entrance, header, full-screen phone menu, anchors, reveals, service photo swap,
   gallery drag + counter, count-up, process line, magnetic buttons, phone dock, form validation,
   and the GSAP signature scene: a bathroom wall rebuilt from Monday to Saturday as you scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + dock */
  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (dock && hero) dock.classList.toggle('is-on', y > hero.offsetHeight - 80);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already in view shows at once */
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

  /* count-up (only the Google score and review count) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    if (reduce) return;
    var t0 = null, dur = 1200;
    function fmt(v) { return v.toFixed(dec).replace('.', ','); }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end);
    }
    requestAnimationFrame(step);
  });

  /* services: hover, or the item nearest the middle of the screen, swaps the photo (desktop) */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  if (!reduce) {
    var lt = false;
    window.addEventListener('scroll', function () {
      if (lt || window.innerWidth < 961) return; lt = true;
      requestAnimationFrame(function () {
        lt = false;
        var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
        items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
        if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
      });
    }, { passive: true });
  }

  /* gallery: mouse drag on desktop, counter everywhere (touch scrolls natively) */
  var gal = d.querySelector('[data-gal]'), galN = d.querySelector('[data-gal-n]');
  if (gal) {
    var its = gal.querySelectorAll('.gal__it'), down = false, sx = 0, sl = 0, moved = 0;
    gal.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = gal.scrollLeft; gal.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      moved = Math.abs(e.clientX - sx);
      gal.scrollLeft = sl - (e.clientX - sx);
    });
    window.addEventListener('pointerup', function () { if (down) { down = false; gal.classList.remove('is-drag'); } });
    var gt = false;
    gal.addEventListener('scroll', function () {
      if (gt) return; gt = true;
      requestAnimationFrame(function () {
        gt = false;
        var c = gal.getBoundingClientRect(), mid = c.left + c.width / 2, best = 0, bd = 1e9;
        its.forEach(function (it, i) { var r = it.getBoundingClientRect(), dd = Math.abs(r.left + r.width / 2 - mid); if (dd < bd) { bd = dd; best = i; } });
        if (galN) galN.textContent = ('0' + (best + 1)).slice(-2);
      });
    }, { passive: true });
    gal.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { gal.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { gal.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + 0.2) / st.length || p === 1); });
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
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
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

  /* GSAP signature scene: the week */
  function weekScene() {
    var sec = d.querySelector('.week'), svg = sec.querySelector('.bath');
    var days = sec.querySelectorAll('.day'), bar = sec.querySelector('.week__bar i'), capDay = sec.querySelector('.week__day'), capWhat = sec.querySelector('.week__what');
    var names = ['Lun · Demolizione', 'Mar · Impianti', 'Mer · Massetto', 'Gio · Piastrelle', 'Ven · Sanitari', 'Sab · Consegna'];
    var olds = svg.querySelectorAll('.old__t'), pipes = svg.querySelectorAll('.pipe, .wire'), boxes = svg.querySelectorAll('.box');
    var slabs = svg.querySelectorAll('.slab'), fx = svg.querySelectorAll('.fx');
    pipes.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = p.classList.contains('wire') ? '8 6' : L; p.dataset.len = L; });

    function setDay(i) {
      days.forEach(function (dd, k) { dd.classList.toggle('is-on', k === i); dd.classList.toggle('is-done', k < i); });
      if (capDay) capDay.textContent = names[i];
      if (capWhat) capWhat.textContent = days[i].querySelector('em').textContent;
    }

    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 960px)', desk: '(min-width: 961px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set(pipes, { strokeDashoffset: function (i, el) { return el.classList.contains('wire') ? 0 : el.dataset.len; }, opacity: function (i, el) { return el.classList.contains('wire') ? 0 : 1; } });
      gsap.set(boxes, { opacity: 0 });
      gsap.set('.screed', { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set('.membrane', { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(slabs, { y: -60, opacity: 0 });
      gsap.set('.floor', { opacity: 0 });
      gsap.set(fx, { y: -30, opacity: 0 });
      gsap.set('.mirror__glow', { opacity: 0 });
      gsap.set('.done__light', { opacity: 0 });
      gsap.set('.stamp', { opacity: 0, scale: 0.85, transformOrigin: '50% 50%' });
      gsap.set(olds, { y: 0, rotation: 0, opacity: 1, transformOrigin: '50% 50%' });
      setDay(0); bar.style.transform = 'scaleX(0)';

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec, start: 'top top', end: phone ? '+=150%' : '+=240%', pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: function (s) {
            var i = Math.min(5, Math.floor(s.progress * 6 + 0.0001));
            setDay(i);
            bar.style.transform = 'scaleX(' + s.progress.toFixed(3) + ')';
          }
        }
      });
      // Mon: old tiles come off
      tl.to(olds, { y: function () { return 160 + Math.random() * 120; }, rotation: function () { return (Math.random() - 0.5) * 50; }, opacity: 0, duration: 0.8, stagger: { each: 0.02, from: 'random' } }, 0.1);
      // Tue: pipes and power
      tl.to(pipes, { strokeDashoffset: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, 1.05);
      tl.to(boxes, { opacity: 1, duration: 0.2 }, 1.7);
      // Wed: screed and waterproofing
      tl.to('.screed', { scaleY: 1, duration: 0.45 }, 2.1);
      tl.to('.membrane', { scaleY: 1, duration: 0.5 }, 2.4);
      // Thu: slabs land
      tl.to(slabs, { y: 0, opacity: 1, duration: 0.35, stagger: 0.07, ease: 'power2.out' }, 3.05);
      tl.to('.floor', { opacity: 1, duration: 0.3 }, 3.6);
      // Fri: fixtures
      tl.to(fx, { y: 0, opacity: 1, duration: 0.35, stagger: 0.14, ease: 'power2.out' }, 4.1);
      // Sat: lights on, stamp
      tl.to('.mirror__glow', { opacity: 1, duration: 0.3 }, 5.05);
      tl.to('.done__light', { opacity: 0.35, duration: 0.3 }, 5.1);
      tl.to('.stamp', { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 5.25);
      tl.to({}, { duration: 0.35 }, 5.6);
      return function () { setDay(5); bar.style.transform = ''; };
    });
  }

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    weekScene();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) {
    var started = false, go = function () { if (!started) { started = true; start(); } };
    d.fonts.ready.then(go);
    setTimeout(go, 1500);
  } else start();
})();
