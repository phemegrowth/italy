/* Un mondo a colori: hero count 1 to 6 with the six-colour ring, header, full-screen phone menu, anchors, reveals,
   accordion of trades with photo swap, drag strip with progress, process line, magnetic buttons, phone dock, form,
   and the GSAP signature scene: one room built with scroll, one layer and one colour per trade. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');

  /* hero: count 1..6, each number lights its ring segment */
  var digit = d.querySelector('.hero__digit'), segs = d.querySelectorAll('.ring__seg'), vis = d.querySelector('.hero__vis');
  if (reduce) {
    html.classList.add('is-ready');
    segs.forEach(function (s) { s.classList.add('is-on'); });
  } else {
    digit.textContent = '1';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        html.classList.add('is-ready');
        segs.forEach(function (s, i) {
          setTimeout(function () { digit.textContent = String(i + 1); s.classList.add('is-on'); }, 240 + i * 130);
        });
        setTimeout(function () { vis.classList.add('spin'); }, 1400);
      });
    });
  }

  /* header */
  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 30); }
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
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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

  /* hero disc drifts slower than the page (desktop) */
  var disc = d.querySelector('.hero__disc');
  if (!reduce && window.matchMedia('(min-width: 960px)').matches) {
    var hr = false;
    window.addEventListener('scroll', function () {
      if (hr) return; hr = true;
      requestAnimationFrame(function () {
        hr = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) disc.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* trades: accordion + photo swap */
  var trades = d.querySelectorAll('.trade'), pics = d.querySelectorAll('[data-pic]');
  function showPic(t) {
    var k = t.getAttribute('data-for');
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    trades.forEach(function (x) { x.classList.toggle('is-act', x === t); });
  }
  trades.forEach(function (t, i) {
    var b = t.querySelector('.trade__btn');
    b.addEventListener('click', function () {
      var open = !t.classList.contains('is-open');
      trades.forEach(function (x) { x.classList.remove('is-open'); x.querySelector('.trade__btn').setAttribute('aria-expanded', 'false'); });
      t.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      showPic(t);
    });
    t.addEventListener('mouseenter', function () { showPic(t); });
    if (i === 0) { t.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); t.classList.add('is-act'); }
  });

  /* drag strip */
  var strip = d.querySelector('[data-strip]'), sbar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      sbar.style.transform = 'scaleX(' + (0.18 + 0.82 * p).toFixed(3) + ')';
    };
    strip.addEventListener('scroll', upd, { passive: true });
    strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    upd();
  }

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
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

  /* phone dock after the hero */
  var dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  if (dock && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { dock.classList.toggle('is-on', !en[0].isIntersecting); }, { threshold: 0.05 }).observe(hero);
  } else if (dock) dock.classList.add('is-on');

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Serve un indirizzo email valido.', message: 'Due righe sul lavoro da fare.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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

  /* GSAP scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    roomScene(window.innerWidth < 960);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function roomScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); }, q1 = function (s) { return sec.querySelector(s); };
    var names = ['Si parte dal grezzo', 'Struttura e isolamento', 'Pareti in cartongesso', 'Controsoffitto', 'Tinteggiatura', 'Carta da parati', 'Pavimento in resina'];
    var descs = [
      'Muri e soffitto come li troviamo al sopralluogo.',
      'Profili metallici a terra e a soffitto, isolante tra i montanti: meno freddo e meno rumore.',
      'Lastre avvitate sull\'orditura, giunti stuccati e rasati.',
      'Pendini, orditura e lastre: il soffitto si abbassa e arrivano i faretti.',
      'Fondo e due mani di colore, a rullo.',
      'Una parete diversa dalle altre, posata su fondo rasato.',
      'Una superficie continua, senza fughe, facile da pulire.'
    ];
    var cnt = q1('[data-cnt]'), now = q1('[data-now]'), desc = q1('[data-desc]'), bar = q1('[data-bar]'), lis = q('.room__list li');
    var roller = q1('.roller'), clip = q1('.paint-clip');

    gsap.set(q('.track'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(q('.studs rect'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.wool rect'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.board'), { autoAlpha: 0, x: -36 });
    gsap.set(q('.joints'), { autoAlpha: 0 });
    gsap.set(q('.hangers line'), { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(q('.ceil'), { autoAlpha: 0, y: -26 });
    gsap.set(q('.beam'), { autoAlpha: 0 });
    gsap.set(q('.spot'), { autoAlpha: 0 });
    gsap.set(clip, { attr: { width: 0 } });
    gsap.set(roller, { x: 40, y: 260, autoAlpha: 0 });
    gsap.set(q('.wp'), { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(q('.wp__edge'), { autoAlpha: 0 });
    gsap.set(q('.floor, .floor__refl'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(q('.floor__gloss'), { autoAlpha: 0, x: -640 });
    gsap.set(q('.tag'), { autoAlpha: 0 });
    gsap.set(q('.fin > *'), { autoAlpha: 0, y: 10 });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, .4, 1.6, 2.8, 4.0, 5.4, 6.6];
    /* 1 */
    tl.to(q('.track'), { scaleX: 1, duration: .4 }, at[1])
      .to(q('.studs rect'), { scaleY: 1, duration: .35, stagger: .06 }, at[1] + .2)
      .to(q('.wool rect'), { scaleY: 1, duration: .45, stagger: .08 }, at[1] + .55)
      .to(q1('.tag--1'), { autoAlpha: 1, duration: .25 }, at[1] + .7);
    /* 2 */
    tl.to(q1('.tag--1'), { autoAlpha: 0, duration: .2 }, at[2])
      .to(q('.board'), { autoAlpha: 1, x: 0, duration: .45, stagger: .18 }, at[2])
      .to(q('.joints'), { autoAlpha: 1, duration: .3 }, at[2] + .7)
      .to(q1('.tag--2'), { autoAlpha: 1, duration: .25 }, at[2] + .6);
    /* 3 */
    tl.to(q1('.tag--2'), { autoAlpha: 0, duration: .2 }, at[3])
      .to(q('.hangers line'), { scaleY: 1, duration: .3, stagger: .05 }, at[3])
      .to(q('.ceil'), { autoAlpha: 1, y: 0, duration: .45 }, at[3] + .3)
      .to(q('.spot'), { autoAlpha: 1, duration: .2, stagger: .08 }, at[3] + .7)
      .to(q('.beam'), { autoAlpha: 1, duration: .35, stagger: .08 }, at[3] + .8)
      .to(q1('.tag--3'), { autoAlpha: 1, duration: .25 }, at[3] + .6);
    /* 4: roller paints left to right */
    tl.to(q1('.tag--3'), { autoAlpha: 0, duration: .2 }, at[4])
      .to(roller, { autoAlpha: 1, duration: .15 }, at[4])
      .to(clip, { attr: { width: 560 }, duration: 1.1, ease: 'none' }, at[4] + .1)
      .to(roller, { x: 600, duration: 1.1, ease: 'none' }, at[4] + .1)
      .to(roller, { y: 200, duration: .28, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at[4] + .1)
      .to(roller, { autoAlpha: 0, duration: .15 }, at[4] + 1.2)
      .to(q('.fin > *'), { autoAlpha: 1, y: 0, duration: .3, stagger: .06 }, at[4] + 1.15)
      .to(q1('.tag--4'), { autoAlpha: 1, duration: .25 }, at[4] + .9);
    /* 5 */
    tl.to(q1('.tag--4'), { autoAlpha: 0, duration: .2 }, at[5])
      .to(q('.wp'), { scaleY: 1, duration: .8, ease: 'power1.inOut' }, at[5])
      .to(q('.wp__edge'), { autoAlpha: 1, duration: .2 }, at[5] + .6)
      .to(q1('.tag--5'), { autoAlpha: 1, duration: .25 }, at[5] + .6);
    /* 6 */
    tl.to(q1('.tag--5'), { autoAlpha: 0, duration: .2 }, at[6])
      .to(q('.floor, .floor__refl'), { scaleX: 1, duration: .8, ease: 'power2.inOut' }, at[6])
      .to(q('.floor__gloss'), { autoAlpha: 1, x: 0, duration: .8 }, at[6] + .4)
      .to(q1('.tag--6'), { autoAlpha: 1, duration: .25 }, at[6] + .6)
      .to(bar, { scaleX: 1, duration: at[6] + 1, ease: 'none' }, 0)
      .to({}, { duration: .5 }, at[6] + 1);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
      if (s === last) return;
      last = s;
      cnt.textContent = '0' + s;
      now.textContent = names[s];
      desc.textContent = descs[s];
      lis.forEach(function (li) { var k = +li.getAttribute('data-step'); li.classList.toggle('is-on', k === s); li.classList.toggle('is-done', k < s); });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
