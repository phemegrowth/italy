/* Noto G. S.r.l.: hero entrance with the years count-up (since 1990), header, full-screen menu, anchors, reveals,
   services photo follows the active item, timeline + steps lines, drag strip, magnetic buttons, phone bar, form,
   and the GSAP signature scene: a map of the Como lake branch where their works drop in, place by place, with scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* years since founding, counted up */
  var num = d.querySelector('[data-count]');
  if (num) {
    var target = new Date().getFullYear() - (+num.getAttribute('data-from-year') || 1990);
    if (target < 1 || target > 99) target = +num.getAttribute('data-count');
    var fig = num.closest('.hero__fig');
    if (fig) fig.setAttribute('aria-label', target + ' anni di lavoro, dal 1990');
    if (reduce) num.textContent = target;
    else {
      num.textContent = '0';
      var t0 = null, dur = 1100;
      var tick = function (t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        num.textContent = Math.round(target * e);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  /* header */
  var header = d.getElementById('header');
  var bar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * .8);
  }
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#mappa' ? 0 : header.offsetHeight - 1);
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

  /* services: the item nearest the middle of the screen (or hovered) drives the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.srv__it');
  function showPic(item) {
    var k = item.getAttribute('data-for');
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt || window.innerWidth < 760) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * .5, best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * .35 && !best.classList.contains('is-act')) showPic(best);
    });
  }, { passive: true });

  /* lines that draw with scroll (timeline, steps) */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step, .tl');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * .82 - r.top) / (r.height + vh * .15)));
      l.style.setProperty('--p', p.toFixed(3));
      var line = l.querySelector('.timeline__line span'); if (line) line.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + .02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* reviews: drag to scroll on desktop (touch scrolls natively) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* magnetic buttons (desktop only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .22).toFixed(1) + 'px)';
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
      var v = f.value.trim(), ok = v !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
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
    mapScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mapScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var shore = sec.querySelector('.map__shore'), lake = sec.querySelector('.map__lake'), water = sec.querySelector('.map__water');
    var pins = q('[data-pin]'), routes = {}, places = q('[data-places] li');
    q('[data-route]').forEach(function (r) { routes[r.getAttribute('data-route')] = r; });
    var cnt = sec.querySelector('[data-count-place]'), name = sec.querySelector('[data-place-name]'), works = sec.querySelector('[data-place-works]');
    var barEl = sec.querySelector('[data-bar]'), rho = sec.querySelector('.scene__rho');
    var text = q('.scene__text > *');
    var N = pins.length;
    var data = places.map(function (li) {
      return { n: li.getAttribute('data-n'), w: Array.prototype.slice.call(li.querySelectorAll('span')).map(function (s) { return s.textContent; }) };
    });

    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 759px)', big: '(min-width: 760px)' }, function (ctx) {
      var small = ctx.conditions.small;
      var L = shore.getTotalLength();
      gsap.set(shore, { strokeDasharray: L, strokeDashoffset: L });
      gsap.set([lake, water], { autoAlpha: 0 });
      gsap.set(text, { autoAlpha: 0, y: 20 });
      pins.forEach(function (p) {
        gsap.set(p.querySelector('.pin__ring'), { scale: 0, transformOrigin: '50% 50%' });
        gsap.set(p.querySelector('.pin__dot'), { scale: 0, y: -24, transformOrigin: '50% 50%' });
        gsap.set(p.querySelector('.pin__lab'), { autoAlpha: 0 });
      });
      Object.keys(routes).forEach(function (k) { var r = routes[k], l = r.getTotalLength(); gsap.set(r, { strokeDasharray: l + ' ' + l, strokeDashoffset: l }); });
      gsap.set(barEl, { scaleX: 0 });
      gsap.set(rho, { autoAlpha: 0 });

      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.to(text, { autoAlpha: 1, y: 0, duration: .4, stagger: .08 }, 0)
        .to(shore, { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut' }, .2)
        .to(lake, { autoAlpha: .9, duration: .6 }, .9)
        .to(water, { autoAlpha: 1, duration: .4 }, 1.1);
      var at = [];
      var per = 0.62;
      pins.forEach(function (p, i) {
        var t = 1.2 + i * per;
        at[i] = t;
        var r = routes[String(i)];
        if (r) tl.to(r, { strokeDashoffset: 0, duration: per * .7, ease: 'none' }, t - per * .55);
        tl.to(p.querySelector('.pin__dot'), { scale: 1, y: 0, duration: per * .6, ease: 'back.out(2.4)' }, t)
          .to(p.querySelector('.pin__ring'), { scale: 1, duration: per * .7 }, t + .05);
        var lab = p.querySelector('.pin__lab');
        if (!small) tl.to(lab, { autoAlpha: 1, duration: .25 }, t + .1);
      });
      tl.to(rho, { autoAlpha: 1, duration: .3 }, at[N - 1] + .4)
        .to(barEl, { scaleX: 1, duration: at[N - 1] + .4, ease: 'none' }, 0)
        .to({}, { duration: .5 });

      var last = -1;
      function sync() {
        var t = tl.time(), c = 0;
        for (var k = 0; k < at.length; k++) if (t >= at[k]) c = k;
        if (c === last) return;
        last = c;
        pins.forEach(function (p, i) {
          p.classList.toggle('is-cur', i === c);
          if (small) gsap.to(p.querySelector('.pin__lab'), { autoAlpha: (i === c || i === 0) && t >= at[i] ? 1 : 0, duration: .2, overwrite: true });
        });
        cnt.textContent = (c + 1 < 10 ? '0' : '') + (c + 1);
        name.textContent = data[c] ? data[c].n : '';
        works.innerHTML = '';
        (data[c] ? data[c].w : []).forEach(function (w) { var li = d.createElement('li'); li.textContent = w; works.appendChild(li); });
      }
      tl.eventCallback('onUpdate', sync);

      var st = ScrollTrigger.create({
        trigger: sec.querySelector('.scene__in'), start: 'top top', end: small ? '+=150%' : '+=260%',
        pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
        onToggle: function (self) { html.classList.toggle('in-scene', self.isActive); }
      });
      sync();
      return function () { st.kill(); tl.kill(); };
    });
  }
})();
