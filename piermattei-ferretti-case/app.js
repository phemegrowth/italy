/* Piermattei e Ferretti Case: Ken Burns hero with line reveal, header, full-screen menu, anchors, reveals, accordion,
   count-up proof, steps line, sticky phone bar, magnetic buttons, form validation, and the GSAP signature scene
   (route on a map: the province draws itself, the Via Emilia crosses it, pins drop on their areas). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'rm');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), bar = d.querySelector('.bar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 900 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = (id === '#zone' && html.classList.contains('is-zone')) ? 0 : header.offsetHeight - 1;
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off;
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

  /* accordion with height animation */
  d.querySelectorAll('.acc__item').forEach(function (it) {
    var b = it.querySelector('button'), p = it.querySelector('.acc__panel');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (reduce) { p.hidden = !open; return; }
      if (open) {
        p.hidden = false; var h = p.scrollHeight; p.style.height = '0px';
        requestAnimationFrame(function () { p.style.height = h + 'px'; });
        p.addEventListener('transitionend', function te() { p.style.height = ''; p.removeEventListener('transitionend', te); });
      } else {
        p.style.height = p.scrollHeight + 'px';
        requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.height = '0px'; }); });
        p.addEventListener('transitionend', function te() { p.hidden = true; p.style.height = ''; p.removeEventListener('transitionend', te); });
      }
      if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 520);
    });
  });

  /* steps line */
  var list = d.querySelector('[data-line]'), fill = d.querySelector('.steps__line i'), tick = false;
  function frame() {
    tick = false;
    if (!list || !fill) return;
    var r = list.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
  }
  if (!reduce) { window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true }); frame(); }

  /* magnetic buttons, desktop only */
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
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Due righe su cosa cercate, per favore.' };
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

  /* count-up (sourced numbers only: Google rating and review count) */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce) return;
    var t0 = null, dur = 1200;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), countUp);

  /* signature scene: route on a map */
  function scene() {
    var sec = d.querySelector('.zone');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('is-zone');
    var pin = sec.querySelector('.zone__pin');
    var prov = sec.querySelector('.z-prov'), po = sec.querySelector('.z-po'), emilia = sec.querySelector('.z-emilia'), route = sec.querySelector('.z-route');
    var lbls = sec.querySelectorAll('.z-lbl'), items = sec.querySelectorAll('.zone__list li');
    var pins = [0, 1, 2].map(function (k) { return sec.querySelector('.z-pin[data-z="' + k + '"]'); });
    var head = [sec.querySelector('.eyebrow'), sec.querySelector('.h2')];
    [prov, po, route].forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.set(prov, { fillOpacity: 0 });
    gsap.set([emilia, sec.querySelector('.z-hex')], { autoAlpha: 0 });
    gsap.set(lbls, { autoAlpha: 0 });
    pins.forEach(function (p) { gsap.set(p.querySelectorAll('circle, text'), { autoAlpha: 0, y: -18 }); });
    gsap.fromTo(head, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 80%', end: 'top 20%', scrub: 0.5 } });
    function setOn(k) { items.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-z') === k); }); }
    setOn(-1);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return window.innerWidth < 700 ? '+=120%' : '+=200%'; },
        pin: pin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (s) { var p = s.progress; setOn(p < 0.34 ? -1 : p < 0.55 ? 0 : p < 0.74 ? 1 : 2); }
      }
    });
    tl.to(prov, { strokeDashoffset: 0, duration: 0.24, ease: 'power1.inOut' }, 0)
      .to(prov, { fillOpacity: 1, duration: 0.08 }, 0.2)
      .to(po, { strokeDashoffset: 0, duration: 0.14 }, 0.08)
      .to(lbls, { autoAlpha: 1, duration: 0.05 }, 0.2)
      .to(emilia, { autoAlpha: 1, duration: 0.08 }, 0.22);
    tl.to(sec.querySelector('.z-hex'), { autoAlpha: 1, duration: 0.06 }, 0.32);
    var at = [0.34, 0.55, 0.74];
    pins.forEach(function (p, k) {
      tl.to(p.querySelectorAll('circle'), { autoAlpha: 1, y: 0, duration: 0.06, ease: 'back.out(2)' }, at[k]);
      tl.to(p.querySelectorAll('text'), { autoAlpha: 1, y: 0, duration: 0.06 }, at[k] + 0.03);
    });
    tl.to(sec.querySelector('.z-world'), { scale: 1.9, svgOrigin: '278 214', duration: 0.12, ease: 'power2.inOut' }, 0.24);
    tl.to(route, { strokeDashoffset: 0, duration: 0.42 }, 0.36);
    tl.to({}, { duration: 0.08 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
