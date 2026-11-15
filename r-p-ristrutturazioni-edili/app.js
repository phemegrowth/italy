/* R.E.P Ristrutturazioni Edili Pagano: split hero with slow parallax photo, header, full-screen menu, anchors, reveals, process rail,
   phone contact bar, drag strip, service photo swap, form validation, and the GSAP signature scene (a heated floor builds layer by layer). */
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (t.classList.contains('layers') ? 0 : hd.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up (only sourced quantities) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      el.textContent = '0';
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1100);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* process rail */
  var rail = d.querySelector('.steps__rail span'), list = d.querySelector('[data-line]'), tick = false;
  function frame() {
    tick = false;
    if (!rail || !list) return;
    var r = list.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    rail.style.transform = 'scaleY(' + p.toFixed(3) + ')';
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* phone contact bar, after the hero */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(hero);
  else if (mbar) mbar.classList.add('is-on');

  /* form */
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

  /* hero photo moves slower than the page (desktop and phone, transform only) */
  var himg = d.querySelector('.hero__img'), hsec = d.querySelector('.hero');
  if (himg && !reduce) {
    var hp = false;
    var par = function () { hp = false; var y = Math.min(window.scrollY, hsec.offsetHeight); himg.style.transform = 'translate3d(0,' + (-(y * 0.12) - 0).toFixed(1) + 'px,0)'; };
    window.addEventListener('scroll', function () { if (!hp) { hp = true; requestAnimationFrame(par); } }, { passive: true });
  }

  /* services: hovering or focusing a line swaps the photo (desktop extra) */
  var swap = d.querySelector('[data-swap]');
  if (swap) d.querySelectorAll('.serv__list li').forEach(function (li) {
    var go = function () {
      var src = li.getAttribute('data-img');
      if (swap.getAttribute('src') === src) return;
      swap.style.opacity = '0';
      setTimeout(function () { swap.src = src; swap.alt = li.getAttribute('data-alt') || ''; swap.style.opacity = '1'; }, reduce ? 0 : 220);
    };
    li.addEventListener('mouseenter', go);
    li.addEventListener('click', go);
  });

  /* drag strip */
  var strip = d.querySelector('[data-drag]'), sbar = d.querySelector('.strip__bar span');
  if (strip) {
    var prog = function () { if (sbar) sbar.style.transform = 'scaleX(' + Math.min(1, (strip.scrollLeft + strip.clientWidth) / strip.scrollWidth).toFixed(3) + ')'; };
    strip.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = strip.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) strip.classList.add('is-drag'); strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* signature scene: pinned; each layer drops into place from above, then the heat rises through the floor */
  var sec = d.querySelector('.layers');
  function scene() {
    if (!sec) return;
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('is-static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var lys = sec.querySelectorAll('.ly'), items = sec.querySelectorAll('.layers__list li');
    var num = sec.querySelector('.layers__num'), name = sec.querySelector('.layers__name'), photo = sec.querySelector('.layers__photo');
    var names = ['Solaio', 'Isolante', 'Pannello e tubi radianti', 'Massetto', 'Pavimento', 'Il calore sale'];
    var cur = -2;
    function setK(k) {
      if (k === cur) return; cur = k;
      items.forEach(function (li, i) { li.classList.toggle('is-on', i <= k && k < 5 ? i === k : k >= 5); });
      if (num) num.textContent = k >= 5 ? '' : '0' + (k + 1);
      if (name) name.textContent = names[Math.max(0, k)];
    }
    setK(0);
    var small = window.matchMedia('(max-width: 760px)').matches;
    gsap.set(lys, { autoAlpha: 0, y: -90 });
    gsap.set(photo, { autoAlpha: 0, y: 30 });
    var tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: sec.querySelector('.layers__pin'), scrub: 0.6,
        onUpdate: function (s) { var t = s.progress * tl.duration(); setK(Math.min(5, Math.floor(t / 1))); }
      }
    });
    lys.forEach(function (l, i) { tl.to(l, { autoAlpha: 1, y: 0, duration: 0.8 }, i); });
    tl.to(photo, { autoAlpha: 1, y: 0, duration: 0.6 }, 2.2)
      .fromTo(sec.querySelector('.heat'), { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 100%' }, { autoAlpha: 1, scaleY: 1, duration: 0.9 }, 5)
      .fromTo(sec.querySelector('.heat-w'), { autoAlpha: 0, y: 30 }, { autoAlpha: 0.75, y: 0, duration: 0.9 }, 5.1)
      .to({}, { duration: 0.6 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
