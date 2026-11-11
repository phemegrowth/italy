/* Morina S.r.l.: hero entrance (photo wipes up, headline line by line) and slow parallax of the facade photo,
   header, full-screen phone menu, anchors, reveals, services list that drives a sticky photo, drag strip,
   process line, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   an insulated facade (cappotto) built layer by layer on an existing wall, then the scaffold comes down. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header, phone bar, hero parallax: one scroll handler */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var heroImg = d.querySelector('.hero__img'), frame = d.querySelector('.hero__frame');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 80);
    if (heroImg && !reduce) {
      var fh = frame.offsetHeight, room = heroImg.offsetHeight - fh;
      var lim = window.innerWidth < 900 ? fh + 200 : window.innerHeight;
      var p = Math.min(1, y / lim);
      heroImg.style.transform = 'translate3d(0,' + (-room * p).toFixed(1) + 'px,0)';
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
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
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 59);
      window.scrollTo({ top: id === '#top' ? 0 : top, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: the item crossing the reading line (or the hovered one) drives the sticky photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it'), cap = d.querySelector('[data-cap]');
  var cur = null;
  function showPic(item) {
    if (item === cur) return;
    cur = item;
    var k = item.getAttribute('data-for');
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
    if (cap) cap.textContent = '0' + (+k + 1);
  }
  if (fine) items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it); }); });
  var lt = false;
  function pickItem() {
    lt = false;
    var line = window.innerWidth < 900 ? window.innerHeight * 0.66 : window.innerHeight * 0.5, best = null, bd = 1e9;
    items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - line); if (c < bd) { bd = c; best = it; } });
    if (best && bd < window.innerHeight * 0.4) showPic(best);
  }
  window.addEventListener('scroll', function () { if (!lt) { lt = true; requestAnimationFrame(pickItem); } }, { passive: true });

  /* drag strip */
  var strip = d.querySelector('[data-strip]'), sbar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var vis = strip.clientWidth / strip.scrollWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      sbar.style.transform = 'translateX(' + (p * (1 - vis) * 100).toFixed(2) + '%) scaleX(' + vis.toFixed(3) + ')';
    };
    strip.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
    var step = function (dir) {
      var card = strip.querySelector('.card');
      strip.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: reduce ? 'auto' : 'smooth' });
    };
    d.querySelector('[data-strip-prev]').addEventListener('click', function () { step(-1); });
    d.querySelector('[data-strip-next]').addEventListener('click', function () { step(1); });
    strip.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } });
    if (fine) {
      var down = false, sx = 0, sl = 0, moved = 0;
      strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
        if (moved > 4) strip.classList.add('is-drag');
        strip.scrollLeft = sl - dx;
      });
      window.addEventListener('pointerup', function () {
        if (!down) return; down = false;
        if (strip.classList.contains('is-drag')) {
          strip.classList.remove('is-drag');
          var card = strip.querySelector('.card'), w = card.offsetWidth + 16;
          strip.scrollTo({ left: Math.round(strip.scrollLeft / w) * w, behavior: 'smooth' });
        }
      });
    }
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons, desktop only */
  if (!reduce && fine) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
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
    if (reduce || !window.gsap || !window.ScrollTrigger) { finalState(); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return wallScene(false); });
    mm.add('(max-width: 899px)', function () { return wallScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  function finalState() {
    d.querySelectorAll('.layers li').forEach(function (li) { li.classList.add('is-on'); });
    var c = d.querySelector('[data-count]'); if (c) c.textContent = '05';
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var stones = q('.w-l1 .st'), l1edge = q('.w-l1 > .w-out, .w-l1 > .w-top');
    var l2 = sec.querySelector('.w-l2'), l3 = sec.querySelector('.w-l3'), l4 = sec.querySelector('.w-l4');
    var mesh = q('.w-mesh path'), scaf = sec.querySelector('.w-scaf'), poles = q('.w-pole'), rails = q('.w-ledger, .w-board, .w-brace');
    var tags = q('.w-tag'), lis = q('.layers li'), cnt = sec.querySelector('[data-count]'), bar = sec.querySelector('[data-bar]');

    gsap.set(stones, { autoAlpha: 0 });
    gsap.set(l1edge, { autoAlpha: 0 });
    gsap.set(poles, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(rails, { autoAlpha: 0 });
    gsap.set(l2, { x: 260, autoAlpha: 0 });
    gsap.set(l3, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(mesh, { autoAlpha: 0 });
    gsap.set(l4, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(tags, { autoAlpha: 0, scale: .4, transformOrigin: '50% 50%' });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, .2, 2.2, 4.2, 6, 7.8];
    /* 1: the existing wall and the scaffold */
    tl.to(poles, { scaleY: 1, duration: .8, stagger: .1, ease: 'power2.inOut' }, .2)
      .to(rails, { autoAlpha: 1, duration: .3, stagger: .05 }, .7)
      .to(stones, { autoAlpha: 1, duration: .2, stagger: { each: 1.1 / stones.length, from: 'end' } }, .3)
      .to(l1edge, { autoAlpha: 1, duration: .3 }, 1.2)
      .to(tags[0], { autoAlpha: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, 1.4)
    /* 2: insulation boards slide in */
      .to(l2, { x: 0, autoAlpha: 1, duration: 1.2, ease: 'power3.out' }, 2.2)
      .to(tags[1], { autoAlpha: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, 3.2)
    /* 3: reinforced render rises, mesh appears */
      .to(l3, { scaleY: 1, duration: 1, ease: 'power2.inOut' }, 4.2)
      .to(mesh, { autoAlpha: .9, duration: .15, stagger: { each: .6 / mesh.length } }, 4.6)
      .to(tags[2], { autoAlpha: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, 5.3)
    /* 4: coloured finish runs down */
      .to(l4, { scaleY: 1, duration: 1.2, ease: 'power1.inOut' }, 6)
      .to(tags[3], { autoAlpha: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, 7)
    /* 5: scaffold comes down */
      .to(rails, { autoAlpha: 0, y: 40, duration: .5, stagger: { each: .04, from: 'start' } }, 7.8)
      .to(poles, { scaleY: 0, duration: .8, ease: 'power2.in' }, 8.1)
      .to(tags[4], { autoAlpha: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, 8.9)
      .to(bar, { scaleX: 1, duration: 9.2, ease: 'none' }, 0)
      .to({}, { duration: .6 }, 9.2);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
      if (s !== last) {
        last = s;
        lis.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === Math.max(1, s)); });
        tags.forEach(function (g) { g.classList.toggle('is-on', +g.getAttribute('data-t') === s); });
        cnt.textContent = '0' + Math.max(1, s);
      }
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=260%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
    return function () { st.kill(); tl.kill(); gsap.set([stones, l1edge, poles, rails, l2, l3, mesh, l4, tags, bar], { clearProps: 'all' }); };
  }
})();
