/* R.E.S. Impresa Edile: header, menu, reveals, count-up, drag strip, form, and the drone scan scene (GSAP). */
(function () {
  var d = document, root = d.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* year */
  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header shrink + mobile bar */
  var hdr = $('.hdr'), mbar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('show', y > (hero ? hero.offsetHeight * 0.8 : 600));
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('open', open); menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* smooth anchors with header offset */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2 || a.getAttribute('aria-disabled')) { if (a.getAttribute('aria-disabled')) e.preventDefault(); return; }
      var t = $(id); if (!t) return; e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 64, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* hero entrance: starts on first frame, done well under 1.6 s */
  var lines = $$('.hero__title .ln > span');
  if (!reduce) {
    lines.forEach(function (s, i) {
      s.animate([{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 700, delay: 80 + i * 90, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    });
    var ph = $('.hero__ph');
    if (ph) ph.animate([{ clipPath: 'polygon(50% 100%,100% 100%,100% 100%,0 100%,0 100%)' }, { clipPath: 'polygon(50% 0,100% 30%,100% 100%,0 100%,0 30%)' }], { duration: 1100, delay: 200, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'backwards' });
  }

  /* count-up (sourced number only: oltre 25 anni) */
  $$('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count'); if (reduce) return;
    var t0 = null; el.textContent = '0';
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    setTimeout(function () { requestAnimationFrame(step); }, 250);
  });

  /* reveals */
  var rv = $$('.sec-head, .svc__list li, .cond__card, .card, .about__copy, .about__stamp, .steps__list li, .contact__info, .form, .proof li');
  rv.forEach(function (e) { e.classList.add('rv'); });
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { var e = en.target, sib = e.parentElement ? Array.prototype.indexOf.call(e.parentElement.children, e) : 0; e.style.transitionDelay = Math.min(sib, 5) * 80 + 'ms'; e.classList.add('in'); io.unobserve(e); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); else io.observe(e); });
  }

  /* services: hover swaps the photo (desktop) */
  var media = $$('.svc__media img');
  $$('.svc__list li').forEach(function (li) {
    li.addEventListener('mouseenter', function () { var k = +li.getAttribute('data-img'); media.forEach(function (m, i) { m.classList.toggle('on', i === k); }); });
  });

  /* drag strip */
  var strip = $('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('drag'); });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('drag'); });
    strip.addEventListener('pointermove', function (e) { if (down) { strip.scrollLeft = sl - (e.clientX - sx); } });
  }

  /* form validation */
  var form = $('.form');
  if (form) form.addEventListener('submit', function (e) {
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var v = f.value.trim(), good = v.length > 1;
      if (f.type === 'email') good = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (f.type === 'tel') good = v.replace(/\D/g, '').length >= 6;
      f.parentElement.classList.toggle('bad', !good); if (!good) ok = false;
    });
    if (!ok) { e.preventDefault(); var b = $('.f.bad', form); if (b) b.querySelector('input,textarea').focus(); }
  });

  /* ---------- GSAP: drone scan scene + steps line ---------- */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var scene = $('.scan'), frame = $('.scan__frame'), photo = $('.scan__photo');
    var tags = $$('.scan__tags li'), cur = $('.scan__cur'), bar = $('.scan__bar span');
    var mm = gsap.matchMedia();
    /* points: frame top-left as % of the photo box, frame size in % */
    function run(points, end) {
      var setAt = function (i) { tags.forEach(function (t, k) { t.classList.toggle('on', k === i); }); cur.textContent = '0' + (i + 1); };
      var W = function () { return photo.clientWidth; }, H = function () { return photo.clientHeight; };
      gsap.set(frame, { width: points[0].w + '%', height: points[0].h + '%', x: function () { return W() * points[0].x / 100; }, y: function () { return H() * points[0].y / 100; } });
      var tl = gsap.timeline({
        scrollTrigger: { trigger: scene, start: 'top top', end: end, pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (s) { setAt(Math.min(points.length - 1, Math.floor(s.progress * points.length * 0.999))); } }
      });
      tl.from('.scan__head', { y: 40, opacity: 0, duration: 0.4 }, 0)
        .from(frame, { opacity: 0, scale: 1.3, duration: 0.4 }, 0.1);
      points.slice(1).forEach(function (p, i) {
        tl.to(frame, { x: function () { return W() * p.x / 100; }, y: function () { return H() * p.y / 100; }, width: p.w + '%', height: p.h + '%', duration: 1, ease: 'power2.inOut' }, 0.6 + i * 1.2);
      });
      tl.fromTo(bar, { scaleX: 0.08 }, { scaleX: 1, ease: 'none', duration: tl.duration() }, 0);
      return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
    }
    mm.add('(min-width: 701px)', function () {
      return run([{ x: 34, y: 2, w: 30, h: 26 }, { x: 4, y: 30, w: 30, h: 26 }, { x: 46, y: 36, w: 26, h: 32 }, { x: 1.5, y: 2, w: 97, h: 96 }], '+=240%');
    });
    mm.add('(max-width: 700px)', function () {
      return run([{ x: 18, y: 3, w: 60, h: 24 }, { x: 4, y: 30, w: 60, h: 24 }, { x: 30, y: 46, w: 64, h: 26 }, { x: 3, y: 2, w: 94, h: 96 }], '+=140%');
    });

    /* steps progress line */
    var line = $('.steps__line span');
    if (line) {
      mm.add('(min-width: 761px)', function () { gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps__list', start: 'top 75%', end: 'bottom 55%', scrub: true } }); });
      mm.add('(max-width: 760px)', function () { gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps__list', start: 'top 70%', end: 'bottom 60%', scrub: true } }); });
    }
    /* align the desktop line with the step circles */
    var sl = $('.steps__line'), list = $('.steps__list');
    if (sl && list) sl.style.setProperty('--sh', (list.offsetTop) + 'px');
    ScrollTrigger.refresh();
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(build);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
