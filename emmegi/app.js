/* Edile EMMEGI: type-first hero with a photo strip that slides in and drifts with scroll, header, menu, anchors,
   reveals, cursor-following photo on the service rows (desktop), how-line drawn by scroll, sticky phone bar, form
   validation, and the GSAP signature scene "Dalla pianta al bagno finito": a bathroom plan draws itself, then the
   finished bathroom photo rises through it while five steps light up and a percentage counts to 100. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var track = d.querySelector('.strip');
  var line = d.querySelector('.how__bar b'), steps = d.querySelector('.how__row');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
    if (!reduce && track && y < hero.offsetHeight * 1.5) {
      var k = window.innerWidth < 900 ? 0.5 : 0.35;
      track.style.transform = 'translate3d(' + (-y * k).toFixed(1) + 'px,0,0)';
    }
    if (line && steps && !reduce) {
      var r = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      line.style.setProperty('--p', p.toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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

  /* services: a photo follows the cursor over the rows (desktop with a mouse only) */
  var svc = d.querySelector('.svc'), fol = d.querySelector('.follow'), folImg = fol && fol.querySelector('img');
  if (svc && fol && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    var fx = 0, fy = 0, tx = 0, ty = 0, raf = 0;
    var loop = function () { fx += (tx - fx) * 0.18; fy += (ty - fy) * 0.18; fol.style.left = fx + 'px'; fol.style.top = fy + 'px'; raf = Math.abs(tx - fx) + Math.abs(ty - fy) > .5 ? requestAnimationFrame(loop) : 0; };
    d.querySelectorAll('.row').forEach(function (row) {
      row.addEventListener('mouseenter', function () { folImg.src = row.getAttribute('data-img'); fol.classList.add('is-on'); });
      row.addEventListener('mouseleave', function () { fol.classList.remove('is-on'); });
    });
    svc.addEventListener('mousemove', function (e) {
      var r = svc.getBoundingClientRect(); tx = e.clientX - r.left + 150; ty = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
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
    mm.add('(max-width: 900px)', function () { return scene(true); });
    mm.add('(min-width: 901px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var paths = sec.querySelectorAll('.dr'), texts = sec.querySelectorAll('.pl-dim text');
    var photo = sec.querySelector('.plan__photo'), pimg = photo.querySelector('img');
    var steps = sec.querySelectorAll('.plan__steps li'), pct = sec.querySelector('.plan__pct b');
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(texts, { autoAlpha: 0 });
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(pimg, { scale: 1.15 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(paths, { strokeDashoffset: 0, duration: 1.4, stagger: .06, ease: 'power1.inOut' }, 0)
      .to(texts, { autoAlpha: 1, duration: .3, stagger: .05 }, .9)
      .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.2, ease: 'power1.inOut' }, 1.9)
      .to(pimg, { scale: 1, duration: 2.2 }, 1.9)
      .to(sec.querySelector('.plan__svg'), { autoAlpha: .35, duration: 1 }, 3.2)
      .to({}, { duration: .5 });
    var at = [0, .9, 1.9, 2.8, 3.7], last = -2, total = tl.duration();
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), c = 0;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) c = k;
      pct.textContent = Math.round(Math.min(1, t / (total - .5)) * 100);
      if (c === last) return;
      last = c;
      steps.forEach(function (li, k) { li.classList.toggle('is-on', k <= c); li.classList.toggle('is-now', k === c); });
    });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=230%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () {
      st.kill(); tl.kill();
      gsap.set([].slice.call(paths).concat([].slice.call(texts), [photo, pimg, sec.querySelector('.plan__svg')]), { clearProps: 'all' });
      steps.forEach(function (li) { li.classList.remove('is-on', 'is-now'); });
      pct.textContent = '100';
    };
  }
})();
