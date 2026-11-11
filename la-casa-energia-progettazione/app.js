(function(){
  'use strict';
  var doc=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) doc.classList.add('reduced');

  /* hero entrance: start on the first frame, never wait for fonts or images */
  var hero=document.querySelector('.hero');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ hero && hero.classList.add('is-in'); }); });

  /* header shrink */
  var header=document.querySelector('[data-header]');
  var onScroll=function(){ header.classList.toggle('is-small', window.scrollY>24); };
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  /* full-screen menu */
  var burger=document.querySelector('.burger'), menu=document.getElementById('menu');
  function setMenu(open){
    burger.setAttribute('aria-expanded', open?'true':'false');
    burger.setAttribute('aria-label', open?'Chiudi il menu':'Apri il menu');
    menu.hidden=!open; document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function(){ setMenu(menu.hidden); });
  menu.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !menu.hidden){ setMenu(false); burger.focus(); } });

  /* smooth anchors with header offset */
  document.addEventListener('click', function(e){
    var a=e.target.closest('a[href^="#"]'); if(!a) return;
    var id=a.getAttribute('href'); if(id.length<2) return;
    var t=document.querySelector(id); if(!t) return;
    e.preventDefault();
    var y=t.getBoundingClientRect().top+window.scrollY-(id==='#top'?0:(header.offsetHeight-4));
    window.scrollTo({top:y, behavior:reduce?'auto':'smooth'});
    if(history.replaceState) history.replaceState(null,'',id);
  });

  /* reveals: in view at load shows at once */
  var rs=[].slice.call(document.querySelectorAll('.r, .about__mark'));
  if(reduce || !('IntersectionObserver' in window)){ rs.forEach(function(el){ el.classList.add('is-v'); }); }
  else{
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ var el=en.target; var sib=[].slice.call(el.parentNode.children).filter(function(c){return c.classList.contains('r');}); var i=Math.max(0,sib.indexOf(el)); el.style.transitionDelay=Math.min(i,5)*70+'ms'; el.classList.add('is-v'); io.unobserve(el); } }); }, {rootMargin:'0px 0px -8% 0px'});
    rs.forEach(function(el){ if(el.getBoundingClientRect().top<window.innerHeight*0.92) el.classList.add('is-v'); else io.observe(el); });
  }

  /* phone bar after the hero */
  var mbar=document.querySelector('[data-mbar]');
  if(mbar && hero && 'IntersectionObserver' in window){
    new IntersectionObserver(function(es){ mbar.classList.toggle('is-on', !es[0].isIntersecting); }, {threshold:0, rootMargin:'-40% 0px 0px 0px'}).observe(hero);
  }

  /* services: photo follows hover, focus or tap */
  var pics=[].slice.call(document.querySelectorAll('.svc__pic img')), cap=document.querySelector('[data-cap]');
  var items=[].slice.call(document.querySelectorAll('.list__it'));
  function showPic(it){
    var n=it.getAttribute('data-for');
    items.forEach(function(x){ x.classList.toggle('is-on', x===it); });
    pics.forEach(function(p){ p.classList.toggle('is-on', p.getAttribute('data-pic')===n); });
    if(cap) cap.textContent=it.querySelector('h3').textContent;
  }
  items.forEach(function(it){ ['mouseenter','focus','click'].forEach(function(ev){ it.addEventListener(ev, function(){ showPic(it); }); }); });
  if(items[0]) items[0].classList.add('is-on');

  /* projects: four stages, chips, gentle auto-advance while in view */
  [].slice.call(document.querySelectorAll('[data-proj]')).forEach(function(card){
    var imgs=[].slice.call(card.querySelectorAll('.proj__pics img')), btns=[].slice.call(card.querySelectorAll('.proj__chips button'));
    var stage=card.querySelector('[data-stage]'), bar=card.querySelector('.proj__bar span'), cur=0, timer=null, user=false;
    function go(i){
      cur=i;
      imgs.forEach(function(im,k){ im.classList.toggle('is-on', k===i); });
      btns.forEach(function(b,k){ b.setAttribute('aria-pressed', k===i?'true':'false'); });
      stage.textContent=btns[i].textContent;
      bar.style.transform='translateX('+(i*100)+'%)';
    }
    btns.forEach(function(b,k){ b.addEventListener('click', function(){ user=true; stop(); go(k); }); });
    function start(){ if(reduce||user||timer) return; timer=setInterval(function(){ go((cur+1)%imgs.length); }, 2600); }
    function stop(){ clearInterval(timer); timer=null; }
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es[0].isIntersecting?start():stop(); }, {threshold:.55}).observe(card); }
  });

  /* form validation */
  var form=document.querySelector('.form');
  if(form){
    var msgs={name:'Scrivi il tuo nome.', phone:'Serve un numero di telefono valido.', email:'Controlla l\'indirizzo email.', message:'Scrivi due righe sul lavoro.'};
    function check(el){
      var f=el.closest('.field'), err=f&&f.querySelector('.err'), v=el.value.trim(), ok=true;
      if(el.name==='name') ok=v.length>1;
      if(el.name==='phone') ok=/^[+\d][\d\s./-]{5,}$/.test(v);
      if(el.name==='email') ok=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if(el.name==='message') ok=v.length>3;
      if(f){ f.classList.toggle('bad', !ok); }
      if(err) err.textContent=ok?'':msgs[el.name];
      return ok;
    }
    var req=[].slice.call(form.querySelectorAll('[required]'));
    req.forEach(function(el){ el.addEventListener('blur', function(){ if(el.value) check(el); }); el.addEventListener('input', function(){ if(el.closest('.field').classList.contains('bad')) check(el); }); });
    form.addEventListener('submit', function(e){
      var bad=req.filter(function(el){ return !check(el); });
      if(bad.length){ e.preventDefault(); bad[0].focus(); }
    });
  }

  /* footer year */
  var y=document.querySelector('[data-year]'); if(y) y.textContent=new Date().getFullYear();

  /* ---------- GSAP: the wall, layer by layer, and the method line ---------- */
  var CAPS=[
    ['Intonaco esterno','Circa 0,5 cm. La pelle della casa, quella che vedi da fuori.'],
    ['Cappotto isolante esterno','Da 12 a 16 cm. Tiene il caldo dentro d\'inverno e fuori d\'estate.'],
    ['Pannello di legno OSB','2 cm. Chiude il telaio verso l\'esterno e lo irrigidisce.'],
    ['Isolamento in lana di roccia','14 cm, tra un pilastro e l\'altro del telaio.'],
    ['Pilastro del telaio in legno','8 × 14 cm, in legno massiccio, di norma ogni 60 cm.'],
    ['Pannello di legno OSB','2 cm. Chiude il telaio sul lato interno.'],
    ['Freno vapore','Una membrana che controlla l\'umidità che arriva da dentro casa.'],
    ['Intercapedine con isolamento','6 cm di isolante in più, verso l\'interno.'],
    ['Impianti nell\'intercapedine','Tubi e cavi corrono qui, dentro lo spessore della parete.'],
    ['Doppia lastra in cartongesso','2,5 cm. La parete che vedi da dentro, pronta da pitturare.']
  ];
  var nEl=document.querySelector('[data-cap-n]'), tEl=document.querySelector('[data-cap-t]'), dEl=document.querySelector('[data-cap-d]'), barEl=document.querySelector('[data-cap-bar]');
  var last=-2;
  function setCap(i){
    if(i===last) return; last=i;
    if(i<0){ nEl.textContent='00'; tEl.textContent='Una parete in dieci strati'; dEl.textContent='Scorri: la costruiamo dall\'esterno verso l\'interno.'; barEl.style.transform='scaleX(0.02)'; return; }
    nEl.textContent=(i<9?'0':'')+(i+1); tEl.textContent=CAPS[i][0]; dEl.textContent=CAPS[i][1]; barEl.style.transform='scaleX('+((i+1)/10)+')';
  }
  var order=[1,2,3,4,5,6,7,8,9,10].map(function(n){ return document.querySelector('[data-wall] [data-l="'+n+'"]'); });

  if(reduce || !window.gsap || !window.ScrollTrigger){ setCap(9); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});

  function build(){
    var mm=gsap.matchMedia();
    mm.add({desk:'(min-width: 980px)', phone:'(max-width: 979px)'}, function(ctx){
      var desk=ctx.conditions.desk;
      var tl=gsap.timeline({defaults:{ease:'power2.out', duration:1}, scrollTrigger:{
        trigger:'[data-scene]', start:'top top', end: desk?'+=230%':'+=140%', pin:true, scrub:0.6, anticipatePin:1,
        onUpdate:function(st){ var p=st.progress; setCap(p<0.04?-1:Math.min(9, Math.floor((p-0.04)/0.092))); }
      }});
      tl.to({}, {duration:0.4});
      order.forEach(function(el,k){
        var n=k+1;
        if(n===5||n===9){ tl.fromTo(el,{scale:0, opacity:0},{scale:1, opacity:1, ease:'back.out(1.6)'}); }
        else if(desk){ tl.fromTo(el,{yPercent:-104, opacity:1},{yPercent:0}); }
        else { tl.fromTo(el,{xPercent:104, opacity:1},{xPercent:0}); }
      });
      tl.to({}, {duration:0.6});

      gsap.fromTo('[data-line]',{scaleY:0},{scaleY:1, ease:'none', scrollTrigger:{trigger:'[data-steps]', start:'top 70%', end:'bottom 60%', scrub:0.4}});
      return function(){ setCap(-1); };
    });
  }
  setCap(-1);
  var started=false;
  function go(){ if(started) return; started=true; build(); }
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(go); setTimeout(go, 1200); } else go();
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();
