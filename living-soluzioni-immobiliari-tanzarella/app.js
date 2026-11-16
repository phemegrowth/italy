/* E-Living: header, menu, accordion, form, hero reel (E), plan-to-keys scene */
(function(){
  'use strict';
  var d=document, w=window;
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG=!!(w.gsap&&w.ScrollTrigger);

  d.querySelectorAll('.yr').forEach(function(e){e.textContent=new Date().getFullYear();});

  var hdr=d.querySelector('.hdr'), bar=d.querySelector('.bar'), hero=d.querySelector('.hero');
  function onScroll(){var y=w.scrollY;hdr.classList.toggle('is-small',y>30);if(bar)bar.classList.toggle('is-on',y>hero.offsetHeight*0.55);}
  w.addEventListener('scroll',onScroll,{passive:true});onScroll();

  var burger=d.querySelector('.burger'), menu=d.getElementById('menu');
  function setMenu(open){
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Chiudi il menu':'Apri il menu');
    if(open){menu.hidden=false;requestAnimationFrame(function(){menu.classList.add('is-open');});}
    else{menu.classList.remove('is-open');setTimeout(function(){if(!menu.classList.contains('is-open'))menu.hidden=true;},360);}
  }
  burger.addEventListener('click',function(){setMenu(burger.getAttribute('aria-expanded')!=='true');});
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&burger.getAttribute('aria-expanded')==='true'){setMenu(false);burger.focus();}});

  /* reveals */
  var rv=[].slice.call(d.querySelectorAll('.rv'));
  if(reduce||!('IntersectionObserver' in w)){rv.forEach(function(e){e.classList.add('in');});}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){
      var sib=[].slice.call(en.target.parentNode.children).filter(function(x){return x.classList.contains('rv');});
      en.target.style.transitionDelay=(Math.min(Math.max(0,sib.indexOf(en.target)),6)*80)+'ms';
      en.target.classList.add('in');io.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(e){if(e.getBoundingClientRect().top<w.innerHeight)e.classList.add('in');else io.observe(e);});
  }

  /* accordion with height animation */
  var items=[].slice.call(d.querySelectorAll('.acc__i'));
  function openItem(it,open){
    var b=it.querySelector('.acc__b'), p=it.querySelector('.acc__p');
    b.setAttribute('aria-expanded',open?'true':'false'); it.classList.toggle('is-open',open);
    if(reduce){p.hidden=!open;p.style.height='';return;}
    if(open){p.hidden=false;var h=p.scrollHeight;p.style.height='0px';requestAnimationFrame(function(){p.style.height=h+'px';});
      p.addEventListener('transitionend',function te(){p.style.height='';p.removeEventListener('transitionend',te);});}
    else{p.style.height=p.scrollHeight+'px';requestAnimationFrame(function(){p.style.height='0px';});
      p.addEventListener('transitionend',function te(){p.hidden=true;p.style.height='';p.removeEventListener('transitionend',te);});}
  }
  items.forEach(function(it){it.querySelector('.acc__b').addEventListener('click',function(){
    var open=it.classList.contains('is-open');
    items.forEach(function(o){if(o!==it&&o.classList.contains('is-open'))openItem(o,false);});
    openItem(it,!open);
    if(w.ScrollTrigger) setTimeout(function(){w.ScrollTrigger.refresh();},500);
  });});

  /* form */
  var form=d.querySelector('.form');
  d.querySelectorAll('[data-pick]').forEach(function(a){a.addEventListener('click',function(){
    var r=form.querySelector('input[name="richiesta"][value="'+a.getAttribute('data-pick')+'"]'); if(r) r.checked=true;});});
  var msgs={name:'Scrivete il vostro nome.',phone:'Serve un numero di telefono.',email:'Controllate l\'indirizzo email.',message:'Due righe su cosa cercate.'};
  function check(el){
    var ok=el.checkValidity(); if(el.name==='phone') ok=ok&&/[0-9]{6,}/.test(el.value.replace(/\D/g,''));
    var f=el.closest('.f'); f.classList.toggle('is-bad',!ok); f.querySelector('small').textContent=ok?'':msgs[el.name]; return ok;
  }
  var fields=[].slice.call(form.querySelectorAll('.f input,.f textarea'));
  fields.forEach(function(el){el.addEventListener('blur',function(){if(el.value)check(el);});el.addEventListener('input',function(){if(el.closest('.f').classList.contains('is-bad'))check(el);});});
  form.addEventListener('submit',function(e){
    var bad=fields.filter(function(el){return !check(el);});
    var chip=form.querySelector('input[name="richiesta"]:checked'), err=form.querySelector('.chips__err');
    err.textContent=chip?'':'Scegliete una delle quattro opzioni.';
    if(bad.length||!chip){e.preventDefault();(chip?bad[0]:form.querySelector('input[name="richiesta"]')).focus();}
  });

  if(!hasG||reduce) return;
  var gsap=w.gsap, ST=w.ScrollTrigger;
  gsap.registerPlugin(ST); ST.config({ignoreMobileResize:true});

  /* hero: lines rise, photos slide in from the right, then drift left with scroll */
  var tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('.hero__title .ln > span',{yPercent:110,duration:.8,stagger:.08},0)
    .from('.hero__eyebrow,.hero__lead,.hero__cta',{y:16,opacity:0,duration:.6,stagger:.08},.3)
    .from('.reel__i',{xPercent:60,opacity:0,duration:1.1,stagger:.1,ease:'expo.out'},.1)
    .from('.reel__i img',{scale:1.25,duration:1.6,ease:'power2.out',stagger:.1},.1);

  function build(){
    var track=d.querySelector('.reel__track'), reel=d.querySelector('.reel');
    gsap.to(track,{x:function(){return -Math.max(0,track.scrollWidth-reel.clientWidth*0.72);},ease:'none',
      scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.5,invalidateOnRefresh:true}});

    var steps=gsap.utils.toArray('.steps li');
    var mm=gsap.matchMedia();
    mm.add({desk:'(min-width: 761px)',phone:'(max-width: 760px)'},function(ctx){
      var phone=ctx.conditions.phone;
      var walls=gsap.utils.toArray('.plan .walls path');
      walls.forEach(function(p){var L=p.getTotalLength();gsap.set(p,{strokeDasharray:L,strokeDashoffset:L});});
      var walk=d.querySelector('.plan .walk'), WL=walk.getTotalLength();
      gsap.set(walk,{strokeDasharray:'2 9',opacity:0});
      gsap.set('.plan .labels text, .plan .doors .arc',{opacity:0});
      gsap.set('.plan .ph',{opacity:0});
      gsap.set('.plan .card',{opacity:0,y:30});
      gsap.set('.plan .key',{opacity:0,y:-40});
      gsap.set('.plan .doors .leaf',{rotation:90,svgOrigin:'70 410'});
      gsap.set('.scene__head',{opacity:0,y:30});
      var stl=gsap.timeline({scrollTrigger:{trigger:'.scene',start:'top top',end:phone?'+=160%':'+=260%',pin:'.scene__pin',scrub:.6,anticipatePin:1,
        onUpdate:function(s){var i=Math.min(5,Math.max(0,Math.floor((s.progress-0.04)/0.9*6)));
          steps.forEach(function(li,k){li.classList.toggle('is-on',k===i);li.classList.toggle('is-done',k<i);});}}});
      stl.to('.scene__head',{opacity:1,y:0,duration:.4})
         .to(walls,{strokeDashoffset:0,duration:1,stagger:.08,ease:'none'},'<')
         .to('.plan .doors .arc',{opacity:1,duration:.3})
         .to('.plan .room',{fillOpacity:.07,duration:.6,stagger:.08})
         .to('.plan .labels text',{opacity:1,duration:.5,stagger:.06},'<')
         .to('.plan .ph',{opacity:1,duration:.8})
         .from('.plan .ph',{scale:1.15,svgOrigin:'180 140',duration:.8},'<')
         .to('.plan .card',{opacity:1,y:0,duration:.7})
         .to(walk,{opacity:1,duration:.1})
         .fromTo(walk,{strokeDasharray:'2 9',strokeDashoffset:0,clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:1,ease:'none'})
         .to('.plan .key',{opacity:1,y:0,duration:.5,ease:'back.out(2)'})
         .to('.plan .doors .leaf',{rotation:0,duration:.6},'<')
         .to({},{duration:.4});
      return function(){gsap.set(walls.concat([walk]),{clearProps:'all'});};
    });

    gsap.fromTo('.city__img img',{yPercent:-8},{yPercent:4,ease:'none',scrollTrigger:{trigger:'.city',start:'top bottom',end:'bottom top',scrub:true}});
    ST.refresh();
  }
  (d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()).then(build);
  w.addEventListener('load',function(){ST.refresh();});
})();
