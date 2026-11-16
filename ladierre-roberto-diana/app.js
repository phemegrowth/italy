/* LADiERRE: Ken Burns hero, cursor photo on the services list, rope descent scene, review count, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var rs = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (e) {
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 5) * 0.08 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  $$('.cnt').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null;
    var obs = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; obs.disconnect();
      function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1100, 1); var v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec).replace('.', ','); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }); obs.observe(el);
  });

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduce && fine) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    /* a photo follows the cursor over the services list */
    var cp = $('.cursor-pic'), tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    var loop = function () { cx += (tx - cx) * .18; cy += (ty - cy) * .18; cp.style.left = cx + 'px'; cp.style.top = cy + 'px'; raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .5 ? requestAnimationFrame(loop) : null; };
    $$('.it').forEach(function (it) {
      it.addEventListener('mouseenter', function (e) { cp.src = it.dataset.img; cp.classList.add('is-on'); cx = tx = e.clientX + 170; cy = ty = e.clientY; cp.style.left = cx + 'px'; cp.style.top = cy + 'px'; });
      it.addEventListener('mousemove', function (e) { tx = e.clientX + 170; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
      it.addEventListener('mouseleave', function () { cp.classList.remove('is-on'); });
    });
  }

  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete che lavoro è.');
      if (!ok) e.preventDefault();
    });
  }

  /* hero entrance (about 1.2 s); the Ken Burns drift runs in CSS */
  if (hasG && !reduce) {
    var g = window.gsap;
    g.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__panel', { y: 40, opacity: 0, duration: .7 }, 0)
      .from('.hero__title .ln > span', { yPercent: 108, duration: .7, stagger: .09 }, .1)
      .from('.hero .hl > span', { y: 16, opacity: 0, duration: .5, stagger: .07 }, .25)
      .from('.hero__pic', { opacity: 0, duration: .9 }, 0);
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  function scene() {
    var sc = $('.scene'), stops = $$('.stop'), bands = $$('.band'), m = $('[data-m]');
    function setK(k) { stops.forEach(function (s, i) { s.classList.toggle('is-on', i === k); }); bands.forEach(function (b, i) { b.classList.toggle('is-on', i === k); }); m.textContent = k + 1; }
    if (reduce) { setK(3); gsap.set('.pal .lit rect', { opacity: 1 }); return; }
    var rope = $('.pal .rope'), L = rope.getTotalLength();
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      sc.classList.add('is-live');
      rope.style.strokeDasharray = L; rope.style.strokeDashoffset = L;
      gsap.set('.pal .climber', { y: 0 }); gsap.set('.pal .lit rect', { opacity: 0 });
      setK(0);
      var t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sc, start: 'top top', end: ctx.conditions.phone ? '+=140%' : '+=240%', pin: true, scrub: .6,
        onUpdate: function (s) { var p = s.progress; setK(p < .22 ? 0 : p < .42 ? 1 : p < .76 ? 2 : 3); } } });
      t.to(rope, { strokeDashoffset: 0, duration: .9 }, 0)
        .to('.pal .climber', { y: 410, duration: .9 }, 0)
        .to('.pal .lit rect', { opacity: 1, duration: .08 }, .86)
        .to({}, { duration: .06 }, .94);
      return function () { sc.classList.remove('is-live'); rope.style.strokeDasharray = ''; rope.style.strokeDashoffset = ''; };
    });
  }

  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
