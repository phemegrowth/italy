/* S.O.S CASA: hero curtain and roof mark, header, full-screen menu, anchors, reveals, count-up, service tabs that swap the photo,
   review carousel with arrows and progress, process line, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene (the word CASA is cut out of the page; the scroll flies through the C into a home). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var hd = d.getElementById('hd');
  function onScroll() { hd.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
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

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#casa' ? 0 : hd.offsetHeight - 1);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up: number of reviews */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var n = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var s0 = null;
      requestAnimationFrame(function step(t) {
        if (!s0) s0 = t;
        var k = Math.min(1, (t - s0) / 1100);
        el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* services: tabs swap the photo and the text */
  var tabs = d.querySelectorAll('.tab'), img = d.querySelector('.serv__img');
  function setTab(tb) {
    tabs.forEach(function (t) {
      var on = t === tb;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      var p = d.getElementById(t.getAttribute('aria-controls'));
      p.hidden = !on; p.classList.toggle('is-on', on);
    });
    var src = tb.getAttribute('data-img');
    if (img.getAttribute('src') === src) return;
    img.classList.add('is-fade');
    setTimeout(function () { img.src = src; img.alt = tb.getAttribute('data-alt'); img.classList.remove('is-fade'); }, reduce ? 0 : 260);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setTab(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!k) return;
      e.preventDefault();
      var nx = tabs[(i + k + tabs.length) % tabs.length]; nx.focus(); setTab(nx);
    });
  });

  /* review carousel */
  var track = d.querySelector('[data-track]'), dot = d.querySelector('.rev__dots span');
  if (track) {
    var prog = function () { if (dot) dot.style.transform = 'scaleX(' + Math.min(1, (track.scrollLeft + track.clientWidth) / track.scrollWidth).toFixed(3) + ')'; };
    track.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    d.querySelectorAll('.rev__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = track.querySelector('.rc');
        track.scrollBy({ left: parseInt(b.getAttribute('data-dir'), 10) * (card.offsetWidth + 20), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }

  /* process line */
  var line = d.querySelector('.steps__line span'), list = d.querySelector('[data-line]');
  var tick = false;
  function frame() {
    tick = false;
    if (line && list) {
      var r = list.getBoundingClientRect(), vh = window.innerHeight, p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      line.style.transform = (window.innerWidth < 761 ? 'scaleY(' : 'scaleX(') + p.toFixed(3) + ')';
    }
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* phone contact bar */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(hero);
  else if (mbar) mbar.classList.add('is-on');

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
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

  /* signature scene: fly through the C of CASA */
  var sec = d.querySelector('.fly');
  function scene() {
    if (!sec) return;
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('is-static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var q = function (s) { return sec.querySelector(s); };
    var photo = q('.fly__photo img'), over = q('.fly__over'), under = q('.fly__under'), card = q('.fly__card');
    var mm = gsap.matchMedia();
    function build(svg) {
      // origin: a point inside the left stroke of the C, measured on a rendered copy of the word
      var word = svg.querySelector('.fly__word');
      var probe = word.cloneNode(true);
      probe.setAttribute('fill', 'none'); probe.removeAttribute('class'); probe.setAttribute('class', word.getAttribute('class'));
      svg.appendChild(probe);
      var ox = 0, oy = 0;
      try {
        var ext = probe.getExtentOfChar(0);
        var pt = svg.createSVGPoint();
        pt.x = ext.x + ext.width * 0.11; pt.y = ext.y + ext.height * 0.56;
        var sp = pt.matrixTransform(svg.getScreenCTM()), rb = svg.getBoundingClientRect();
        ox = sp.x - rb.left; oy = sp.y - rb.top;
      } catch (e) { var r0 = svg.getBoundingClientRect(); ox = r0.width * 0.3; oy = r0.height * 0.5; }
      svg.removeChild(probe);
      gsap.set(svg, { transformOrigin: ox + 'px ' + oy + 'px', scale: 1, autoAlpha: 1 });
      gsap.set(photo, { scale: 1.18 });
      gsap.set(card, { autoAlpha: 0, y: 30 });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: sec, start: 'top top', end: window.innerWidth < 761 ? '+=130%' : '+=200%', pin: q('.fly__pin'), scrub: 0.6, invalidateOnRefresh: true }
      });
      tl.to([over, under], { autoAlpha: 0, y: -20, duration: 0.25 }, 0.05)
        .to(svg, { scale: 26, duration: 1, ease: 'power2.in' }, 0.1)
        .to(photo, { scale: 1, duration: 1.1, ease: 'power1.out' }, 0.1)
        .to(svg, { autoAlpha: 0, duration: 0.12 }, 0.98)
        .to(card, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 1.15)
        .to({}, { duration: 0.35 });
      return function () { gsap.set([svg, photo, card, over, under], { clearProps: 'all' }); };
    }
    mm.add('(max-width: 760px)', function () { return build(q('.fly__mask--tall')); });
    mm.add('(min-width: 761px)', function () { return build(q('.fly__mask--wide')); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
