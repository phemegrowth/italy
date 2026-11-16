(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  var hdr = document.querySelector('.hdr'), bar = document.querySelector('.bar');
  var heroImg = document.querySelector('.hero__ph img');
  var tick = false;
  function onScroll() {
    tick = false;
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 30);
    bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
    if (!reduce && y < hero.offsetHeight * 1.2) heroImg.style.transform = 'translateY(' + (y * 0.12).toFixed(1) + 'px)';
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  var burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  function setMenu(o) { burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Chiudi il menu' : 'Apri il menu'); menu.hidden = !o; document.body.style.overflow = o ? 'hidden' : ''; }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (el) { el.classList.add('is-vis'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sib = [].slice.call(e.target.parentNode.children).filter(function (c) { return c.classList.contains('rv'); });
        e.target.style.transitionDelay = sib.indexOf(e.target) * 80 + 'ms';
        e.target.classList.add('is-vis'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-vis'); else io.observe(el); });
  }

  /* accordion: one open at a time, animated height */
  var acs = [].slice.call(document.querySelectorAll('.ac'));
  acs.forEach(function (d) {
    var sum = d.querySelector('summary'), body = d.querySelector('.ac__body');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      var open = d.open;
      acs.forEach(function (o) { if (o !== d && o.open) close(o); });
      if (open) close(d); else openIt(d);
    });
    function openIt(el) {
      el.open = true; if (reduce) return;
      var b = el.querySelector('.ac__body'), h = b.scrollHeight;
      b.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.1,1)' });
    }
    function close(el) {
      if (reduce) { el.open = false; return; }
      var b = el.querySelector('.ac__body');
      var a = b.animate([{ height: b.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'ease-in' });
      a.onfinish = function () { el.open = false; };
    }
    body.style.overflow = 'hidden';
  });

  /* form */
  var form = document.querySelector('.form');
  var msg = { name: 'Scrivi il tuo nome.', phone: 'Serve un numero per richiamarti.', email: 'Email non valida.', lavoro: 'Scegli un tipo di lavoro.', message: 'Scrivi due righe sul lavoro.' };
  function check(el) {
    var f = el.closest('.f'); if (!f) return true;
    var ok;
    if (el.type === 'radio') ok = !!form.querySelector('input[name="' + el.name + '"]:checked');
    else {
      var v = el.value.trim(); ok = !(el.required && !v);
      if (ok && el.type === 'email' && v) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && el.name === 'phone') ok = v.replace(/\D/g, '').length >= 8;
    }
    f.classList.toggle('bad', !ok); f.querySelector('.err').textContent = ok ? '' : msg[el.name];
    return ok;
  }
  form.addEventListener('submit', function (e) {
    var els = [].slice.call(form.querySelectorAll('.f input:not([type=radio]),.f textarea')).concat([form.querySelector('input[name=lavoro]')]);
    var bad = els.filter(function (el) { return !check(el); });
    if (bad.length) { e.preventDefault(); bad[0].focus(); }
  });
  form.addEventListener('change', function (e) { if (e.target.type === 'radio') check(e.target); });
  form.addEventListener('blur', function (e) { if (e.target.closest('.f') && e.target.type !== 'radio') check(e.target); }, true);
  var yr = document.querySelector('.yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* signature scene: chases, wiring, pipes, then the plaster closes over */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  function build() {
    var scene = document.querySelector('.wallx');
    var steps = [].slice.call(document.querySelectorAll('.wsteps li'));
    var names = steps.map(function (s) { return s.textContent.replace(/^\d+/, '').trim(); });
    var nowS = document.querySelector('.wnow .mono'), nowB = document.querySelector('.wnow b'), barI = document.querySelector('.wbar i');
    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      nowS.textContent = '0' + (i + 1) + ' / 04'; nowB.textContent = names[i];
    }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (c) {
      var phone = c.conditions.phone;
      var lines = gsap.utils.toArray('.chases path, .elec path, .hot path, .cold path');
      gsap.set(lines, { strokeDashoffset: 1 });
      gsap.set('.boxes rect', { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
      gsap.set('.plaster', { scaleY: 0 });
      gsap.set('.plates, .tap', { opacity: 0 });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: phone ? '+=130%' : '+=230%', pin: '.wallx__pin', scrub: 0.6, anticipatePin: 1,
          onUpdate: function (st) { var p = st.progress; barI.style.transform = 'scaleX(' + p.toFixed(3) + ')'; setStep(p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.74 ? 2 : 3); }
        }
      });
      tl.to('.chases path', { strokeDashoffset: 0, duration: 0.2, stagger: 0.04 }, 0.02)
        .to('.elec path', { strokeDashoffset: 0, duration: 0.18 }, 0.27)
        .to('.boxes rect', { opacity: 1, scale: 1, duration: 0.05, stagger: 0.02 }, 0.4)
        .to('.hot path', { strokeDashoffset: 0, duration: 0.16 }, 0.51)
        .to('.cold path', { strokeDashoffset: 0, duration: 0.16 }, 0.55)
        .to('.plaster', { scaleY: 1, duration: 0.16, ease: 'power1.inOut' }, 0.76)
        .to('.plates, .tap', { opacity: 1, duration: 0.05, stagger: 0.02 }, 0.9)
        .to({}, { duration: 0.03 }, 0.97);
      return function () { gsap.set(lines.concat(gsap.utils.toArray('.boxes rect, .plaster, .plates, .tap')), { clearProps: 'all' }); };
    });
    setStep(0);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
