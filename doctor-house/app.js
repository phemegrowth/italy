/* Doctor House: header, menu, reveals, services photo swap, form, hero (B split), check-up scan scene */
(function(){
  'use strict';
  var d=document, w=window;
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG=!!(w.gsap&&w.ScrollTrigger);

  d.querySelectorAll('.yr').forEach(function(e){e.textContent=new Date().getFullYear();});

  var hdr=d.querySelector('.hdr'), bar=d.querySelector('.bar'), hero=d.querySelector('.hero');
  function onScroll(){var y=w.scrollY;hdr.classList.toggle('is-small',y>30);if(bar)bar.classList.toggle('is-on',y>hero.offsetHeight*0.6);}
  w.addEventListener('scroll',onScroll,{passive:true});onScroll();

  var burger=d.querySelector('.burger'), menu=d.getElementById('menu');
  function setMenu(open){
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Chiudi il menu':'Apri il menu');
    d.body.classList.toggle('menu-open',open);
    if(open){menu.hidden=false;requestAnimationFrame(function(){menu.classList.add('is-open');});}
    else{menu.classList.remove('is-open');setTimeout(function(){if(!menu.classList.contains('is-open'))menu.hidden=true;},560);}
  }
  burger.addEventListener('click',function(){setMenu(burger.getAttribute('aria-expanded')!=='true');});
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&burger.getAttribute('aria-expanded')==='true'){setMenu(false);burger.focus();}});

  var rv=[].slice.call(d.querySelectorAll('.rv'));
  if(reduce||!('IntersectionObserver' in w)){rv.forEach(function(e){e.classList.add('in');});}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){
      var sib=[].slice.call(en.target.parentNode.children).filter(function(x){return x.classList.contains('rv');});
      en.target.style.transitionDelay=(Math.min(Math.max(0,sib.indexOf(en.target)),6)*80)+'ms';
      en.target.classList.add('in');io.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(e){if(e.getBoundingClientRect().top<w.innerHeight)e.classList.add('in');else io.observe(e);});
  }

  /* services: hover (desktop) or scroll position sets the active item and swaps the photo */
  var sv=[].slice.call(d.querySelectorAll('.svc__i')), imgs=[].slice.call(d.querySelectorAll('.svc__media img'));
  function setSvc(i){sv.forEach(function(x,k){x.classList.toggle('is-on',k===i);});imgs.forEach(function(x,k){x.classList.toggle('is-on',k===i);});}
  sv.forEach(function(x,k){x.addEventListener('mouseenter',function(){setSvc(k);});});
  if('IntersectionObserver' in w){
    var sio=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting)setSvc(sv.indexOf(en.target));});},{rootMargin:'-45% 0px -45% 0px'});
    sv.forEach(function(x){sio.observe(x);});
  }

  /* form */
  var form=d.querySelector('.form');
  var msgs={name:'Scrivete il vostro nome.',phone:'Serve un numero di telefono.',email:'Controllate l\'indirizzo email.',richiesta:'Scegliete una voce.',message:'Due righe sulla casa.'};
  function check(el){
    var ok=el.checkValidity(); if(el.name==='phone') ok=ok&&/[0-9]{6,}/.test(el.value.replace(/\D/g,''));
    var f=el.closest('.f'); f.classList.toggle('is-bad',!ok); f.querySelector('small').textContent=ok?'':msgs[el.name]; return ok;
  }
  var fields=[].slice.call(form.querySelectorAll('.f input,.f select,.f textarea'));
  fields.forEach(function(el){el.addEventListener('blur',function(){if(el.value)check(el);});el.addEventListener('input',function(){if(el.closest('.f').classList.contains('is-bad'))check(el);});});
  form.addEventListener('submit',function(e){var bad=fields.filter(function(el){return !check(el);});if(bad.length){e.preventDefault();bad[0].focus();}});

  var ticks=[].slice.call(d.querySelectorAll('.chart__list li')), pct=d.querySelector('.chart__pct');
  function finalChart(){ticks.forEach(function(t){t.classList.add('on');});if(pct)pct.textContent='100%';}
  if(!hasG||reduce){finalChart();return;}

  var gsap=w.gsap, ST=w.ScrollTrigger;
  gsap.registerPlugin(ST); ST.config({ignoreMobileResize:true});

  var tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('.hero__title .ln > span',{yPercent:110,duration:.8,stagger:.08},0)
    .from('.hero__eyebrow,.hero__lead,.hero__cta',{y:16,opacity:0,duration:.6,stagger:.08},.3)
    .from('.hero__photo',{clipPath:'inset(0 0 0 100%)',duration:1,ease:'expo.inOut'},0)
    .from('.hero__photo img',{scale:1.2,duration:1.5,ease:'power2.out'},0)
    .from('.hero__badge',{y:20,opacity:0,duration:.5},.9)
    .from('.brand__dh svg path',{strokeDasharray:'0 80',duration:.8},.2);

  function build(){
    gsap.to('.hero__photo img',{yPercent:10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

    var mm=gsap.matchMedia();
    mm.add({desk:'(min-width: 761px)',phone:'(max-width: 760px)'},function(ctx){
      var phone=ctx.conditions.phone;
      gsap.set('.scan__dot',{scale:0,opacity:0});
      gsap.set('.scene__head',{opacity:0,y:30});
      gsap.set('.chart',{opacity:0,y:40});
      gsap.set('.chart__out',{opacity:0});
      gsap.set('.scan__img--col',{clipPath:'inset(0% 0% 100% 0%)'});
      var state={p:0};
      var stl=gsap.timeline({scrollTrigger:{trigger:'.scene',start:'top top',end:phone?'+=150%':'+=240%',pin:'.scene__pin',scrub:.6,anticipatePin:1}});
      stl.to('.scene__head',{opacity:1,y:0,duration:.4})
         .to('.chart',{opacity:1,y:0,duration:.4},'<.1')
         .set('.scan__line',{opacity:1})
         .fromTo('.scan__line',{top:'0%'},{top:'99%',duration:3,ease:'none'})
         .to('.scan__img--col',{clipPath:'inset(0% 0% 0% 0%)',duration:3,ease:'none'},'<')
         .to(state,{p:100,duration:3,ease:'none',onUpdate:function(){
            var p=Math.round(state.p); if(pct) pct.textContent=p+'%';
            ticks.forEach(function(t,k){t.classList.toggle('on',p>=(k+1)*24);});
          }},'<')
         .to('.d2',{scale:1,opacity:1,duration:.25,ease:'back.out(3)'},'<.6')
         .to('.d1',{scale:1,opacity:1,duration:.25,ease:'back.out(3)'},'<.6')
         .to('.d3',{scale:1,opacity:1,duration:.25,ease:'back.out(3)'},'<.6')
         .to('.d4',{scale:1,opacity:1,duration:.25,ease:'back.out(3)'},'<.7')
         .to('.scan__line',{opacity:0,duration:.2},'>.3')
         .to('.chart__out',{opacity:1,duration:.4})
         .to({},{duration:.4});
      return function(){gsap.set('.scan__img--col',{clearProps:'clipPath'});};
    });

    gsap.fromTo('.area__img img',{yPercent:-8},{yPercent:4,ease:'none',scrollTrigger:{trigger:'.area',start:'top bottom',end:'bottom top',scrub:true}});
    ST.refresh();
  }
  (d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()).then(build);
  w.addEventListener('load',function(){ST.refresh();});
})();
