/* Rho Ponteggi: header, full-screen menu, anchors, reveals, drag gallery, step line, phone contact bar,
   form validation, split hero with bar wipe and the GSAP signature scene (scaffold assembly, after catalogue 1). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
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

  /* gallery: drag to scroll with the mouse (touch scrolls natively) */
  var strip = d.querySelector('.gal__strip');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx); });
  }

  /* step line draws with scroll */
  var steps = d.querySelector('.steps');
  function stepLine() {
    if (!steps) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
    steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
  }
  window.addEventListener('scroll', stepLine, { passive: true });
  stepLine();

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul ponteggio che serve.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene: a scaffold goes up in front of a facade, in the order a crew mounts it:
     base plates and standards, ledgers, diagonal braces, platforms, guardrails and toe boards. */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return build(false); });
    mm.add('(max-width: 760px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage');
    var q = function (s) { return sec.querySelectorAll(s); };
    var std = q('.sc--std line'), led = q('.sc--led line'), dia = q('.sc--dia line'), rail = q('.sc--rail line');
    var base = q('.sc--base rect'), boards = q('.sc--board rect'), toes = q('.sc--toe rect');
    var head = sec.querySelector('.scene__head'), art = sec.querySelector('.scene__art'), phases = q('.phases li');
    var count = sec.querySelector('.scene__count b'), list = sec.querySelector('.phases');
    var lines = [].concat([].slice.call(std), [].slice.call(led), [].slice.call(dia), [].slice.call(rail));
    lines.forEach(function (l) { l.style.strokeDasharray = '100'; l.style.strokeDashoffset = '100'; });
    /* standards grow from the ground: reverse their dash direction */
    std.forEach(function (l) { l.style.strokeDashoffset = '-100'; });
    gsap.set([base, boards, toes], { transformOrigin: '0% 50%', transformBox: 'fill-box' });
    gsap.set(base, { opacity: 0, y: 8 });
    gsap.set(boards, { scaleX: 0 });
    gsap.set(toes, { scaleX: 0 });
    gsap.set(head, { opacity: 0, y: 30 });
    gsap.set(list, { opacity: 0 });
    gsap.set(art, { opacity: 0.3, scale: 0.94 });
    function setPhase(k) {
      phases.forEach(function (li, j) { li.classList.toggle('is-on', j === k); li.classList.toggle('is-done', j < k); });
      count.textContent = '0' + (k + 1);
    }
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setPhase(p < 0.28 ? 0 : p < 0.45 ? 1 : p < 0.6 ? 2 : p < 0.78 ? 3 : 4); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(head, { opacity: 1, y: 0, duration: 0.06 }, 0)
      .to(list, { opacity: 1, duration: 0.05 }, 0.02)
      .to(art, { opacity: 1, scale: 1, duration: 0.08 }, 0)
      .to(base, { opacity: 1, y: 0, duration: 0.05, stagger: 0.01 }, 0.08)
      .to(std, { strokeDashoffset: 0, duration: 0.14, stagger: 0.015 }, 0.12)
      .to(led, { strokeDashoffset: 0, duration: 0.1, stagger: -0.02 }, 0.3)
      .to(dia, { strokeDashoffset: 0, duration: 0.05, stagger: 0.012 }, 0.47)
      .to(boards, { scaleX: 1, duration: 0.05, stagger: -0.03 }, 0.62)
      .to(rail, { strokeDashoffset: 0, duration: 0.05, stagger: -0.01 }, 0.8)
      .to(toes, { scaleX: 1, duration: 0.05, stagger: -0.012 }, 0.84)
      .to({}, { duration: 0.06 });
    setPhase(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([head, list, art, base, boards, toes], { clearProps: 'all' });
      lines.forEach(function (l) { l.style.strokeDasharray = ''; l.style.strokeDashoffset = ''; });
      phases.forEach(function (li) { li.classList.remove('is-on', 'is-done'); });
    };
  }
})();
