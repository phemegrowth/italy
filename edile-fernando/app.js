/* Fernando Impresa Edile: header, menu, reveals, fanned hero cards, form, and the wall-building scene (GSAP). */
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
    /* fan: the four cards start stacked in the middle, then spread into the collage */
    var fan = $('.fan');
    $$('.fan__c').forEach(function (c, i) {
      var fr = fan.getBoundingClientRect(), r = c.getBoundingClientRect();
      var dx = (fr.left + fr.width / 2) - (r.left + r.width / 2), dy = (fr.top + fr.height / 2) - (r.top + r.height / 2);
      var end = getComputedStyle(c).transform; if (end === 'none') end = 'none';
      c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (i * 3 - 4) + 'deg) scale(.82)', opacity: 0 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (i * 3 - 4) + 'deg) scale(.82)', opacity: 1, offset: .3 }, { transform: end, opacity: 1 }], { duration: 1150, delay: 60 + (3 - i) * 60, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'backwards' });
    });
  }

  /* reveals */
  var rv = $$('.works__head, .idx li, .det__head, .det__f, .quote__in > *, .contact__info, .form, .proof li');
  rv.forEach(function (e) { e.classList.add('rv'); });
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { var e = en.target, sib = e.parentElement ? Array.prototype.indexOf.call(e.parentElement.children, e) : 0; e.style.transitionDelay = Math.min(sib, 5) * 80 + 'ms'; e.classList.add('in'); io.unobserve(e); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); else io.observe(e); });
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

  /* ---------- GSAP: the wall scene ---------- */
  /* bricks are drawn by JS (rows); without JS or with reduced motion the finished wall shows */
  var bricks = $('.wall__bricks');
  if (bricks) for (var i = 0; i < 10; i++) { var row = d.createElement('div'); row.className = 'wall__row'; bricks.appendChild(row); }
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var scene = $('.wallsc'), rows = $$('.wall__row'), steps = $$('.wallsc__steps li'), cur = $('.wallsc__cur'), bar = $('.wallsc__bar span');
    var trowel = $('.wall__trowel'), wall = $('.wall');
    var mm = gsap.matchMedia();
    function run(end) {
      var setAt = function (i) { steps.forEach(function (t, k) { t.classList.toggle('on', k === i); }); cur.textContent = '0' + (i + 1); };
      var tl = gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top top', end: end, pin: true, scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: function (s) { var p = s.progress; setAt(p < 0.36 ? 0 : p < 0.6 ? 1 : p < 0.8 ? 2 : 3); } } });
      tl.from('.wallsc__head', { y: 40, opacity: 0, duration: 0.3 }, 0)
        .from(rows, { yPercent: -260, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'power2.in' }, 0.1)
        .set(trowel, { opacity: 1 }, 1.7)
        .fromTo('.wall__plaster', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'none' }, 1.7)
        .fromTo(trowel, { x: -40 }, { x: function () { return wall.offsetWidth - 20; }, duration: 0.9, ease: 'none' }, 1.7)
        .to(trowel, { opacity: 0, duration: 0.1 }, 2.6)
        .fromTo('.wall__paint', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power1.inOut' }, 2.75)
        .fromTo('.wall__tiles', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power2.out' }, 3.65)
        .fromTo(bar, { scaleX: 0.06 }, { scaleX: 1, ease: 'none', duration: 4.45 }, 0);
      return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
    }
    mm.add('(min-width: 701px)', function () { return run('+=260%'); });
    mm.add('(max-width: 700px)', function () { return run('+=150%'); });
    ScrollTrigger.refresh();
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(build);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
