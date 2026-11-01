var PAGES={home:{t:'JC Ocampo',s:'Electronics Engineer · Manila, PH'},experience:{t:'Experience',s:'Roles, internships, and work history'},projects:{t:'Projects',s:'IEEE research, robots, and AI apps'},certs:{t:'Certifications',s:'PRC · Cisco · Google Cloud'}};
var NAV_URLS={home:'/',experience:'/experience',projects:'/projects',certs:'/licenses-and-certificates'};
function portfolioRouteUrl(route){
  if(route==='licenses'||route==='certs')return '/licenses-and-certificates';
  if(route==='mian')return '/projects/mian';
  if(route==='privacy')return '/privacy-policy';
  if(route==='terms')return '/terms-and-conditions';
  if(route==='home')return '/';
  if(route.indexOf('project:')===0){
    var slug=route.slice(8);
    return '/projects/'+({bushop:'busboy','banana-shelflife':'feedforward'}[slug]||slug);
  }
  return NAV_URLS[route]||'/404.html';
}
var curId=window.__navActive||'home';

/* Chromium can distort the live backdrop directly with an SVG displacement
   filter. Other engines keep the lightweight CSS edge treatment below. */
function setupNavGlassRefraction(){
  var ua=navigator.userAgent||'';
  var chromium=/Chrome|Chromium|Edg|OPR/.test(ua)&&!/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  if(!chromium||!window.CSS||!CSS.supports('backdrop-filter','url(#nav-glass-displacement)'))return;
  var canvas=document.createElement('canvas');canvas.width=148;canvas.height=108;
  var ctx=canvas.getContext('2d');if(!ctx)return;
  var image=ctx.createImageData(canvas.width,canvas.height),data=image.data;
  for(var p=0;p<data.length;p+=4){data[p]=128;data[p+1]=128;data[p+2]=128;data[p+3]=255;}
  var w=canvas.width,h=canvas.height,r=h/2,segmentStart=r,segmentEnd=w-r,edgeBand=13;
  for(var y=0;y<h;y++)for(var x=0;x<w;x++){
    var nx=Math.max(segmentStart,Math.min(segmentEnd,x)),qx=x-nx,qy=y-r;
    var distance=Math.sqrt(qx*qx+qy*qy),depth=r-distance;
    if(depth<0||depth>edgeBand||distance<0.001)continue;
    var fade=Math.pow(1-depth/edgeBand,1.6)*0.46;
    var i=(y*w+x)*4;
    data[i]=Math.max(0,Math.min(255,Math.round(128-qx/distance*fade*127)));
    data[i+1]=Math.max(0,Math.min(255,Math.round(128-qy/distance*fade*127)));
  }
  ctx.putImageData(image,0,0);
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
  svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  svg.innerHTML='<defs><filter id="nav-glass-displacement" x="-8%" y="-12%" width="116%" height="124%" color-interpolation-filters="sRGB"><feImage id="nav-glass-map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
  var map=svg.querySelector('#nav-glass-map'),mapUrl=canvas.toDataURL('image/png');
  map.setAttribute('href',mapUrl);map.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',mapUrl);
  document.body.appendChild(svg);
  document.documentElement.classList.add('supports-nav-glass-refraction');
}
setupNavGlassRefraction();

/* ── Nav physics ── */
var G={iL:0,iLv:0,tL:0,iW:74,iWv:0,tW:74,iTop:5,iH:54,sX:1,sXv:0,hS:1,hSv:0,tHS:1,holding:false,holdStart:0,holdStrength:0.33,dragging:false,dragVel:0,lastPx:0,startPx:0,raf:null,baseW:74};
var restPillRevealTimer=null,restPillRipple=null;
/* ── Mian state ── */
var M={open:false,tapSx:0,tapSy:0};
/* ── Mian indicator physics ── */
var MO={x:0,xV:0,tX:0,y:0,yV:0,tY:0,hS:1,hSv:0,tHS:1,dragStretch:0,dragStretchV:0,tDragStretch:0,dragPath:0,holding:false,holdStart:0,dragging:false,pointerId:null,lastPx:0,lastPy:0,startPx:0,startPy:0,lastFrameTs:0,raf:null};

var HK=0.13,HD=0.73,MIAN_DRAG_RADIUS=4;
function clampMianDrag(x,y,radius){
  var distance=Math.sqrt(x*x+y*y);
  if(distance<=radius||distance===0)return {x:x,y:y,excess:0};
  /* Keep position bounded while excess drag remains visible as glass stretch. */
  var ratio=radius/distance;
  return {x:x*ratio,y:y*ratio,excess:distance-radius};
}
function advanceMianSpring(value,velocity,target,dt,frequency,damping){
  var offset=value-target;
  var zeta=damping===undefined?1:damping;
  if(zeta>=1){
    var impulse=velocity+frequency*offset;
    var decay=Math.exp(-frequency*dt);
    return {value:target+(offset+impulse*dt)*decay,velocity:(velocity-frequency*impulse*dt)*decay};
  }
  var dampedFrequency=frequency*Math.sqrt(1-zeta*zeta);
  var sineTerm=(velocity+zeta*frequency*offset)/dampedFrequency;
  var angle=dampedFrequency*dt,cos=Math.cos(angle),sin=Math.sin(angle);
  var decay=Math.exp(-zeta*frequency*dt);
  var position=(offset*cos+sineTerm*sin)*decay;
  var speed=(( -offset*dampedFrequency*sin+sineTerm*dampedFrequency*cos)-zeta*frequency*(offset*cos+sineTerm*sin))*decay;
  return {value:target+position,velocity:speed};
}
/* ── Pill shadow presets ── */
var PSH={
  lRest:'0 0 0 .5px rgba(255,255,255,.8),0 0 0 1px rgba(0,0,0,.06),0 6px 30px rgba(0,0,0,.10),inset 0 1.5px 0 rgba(255,255,255,1),inset 0 -.5px 0 rgba(0,0,0,.04)',
  lUp:'0 0 0 .5px rgba(255,255,255,.9),0 0 0 1px rgba(0,0,0,.05),0 12px 44px rgba(0,0,0,.15),0 0 20px rgba(0,122,255,.12),inset 0 1.5px 0 rgba(255,255,255,1)',
};

/* ── Clip #wl to current oval bounds every frame ── */
function updateClip(sx,sy){
  var wl=document.getElementById('wl');var pill=document.getElementById('pill');if(!wl||!pill)return;
  var pw=pill.offsetWidth,ph=pill.offsetHeight;
  var cx=G.iL+G.iW/2,cy=G.iTop+G.iH/2;
  var hw=G.iW/2*sx,hh=G.iH/2*sy;
  var cl=Math.max(0,cx-hw),cr=Math.max(0,pw-(cx+hw)),ct=Math.max(0,cy-hh),cb=Math.max(0,ph-(cy+hh));
  wl.style.clipPath='inset('+ct.toFixed(2)+'px '+cr.toFixed(2)+'px '+cb.toFixed(2)+'px '+cl.toFixed(2)+'px round 9999px)';
  wl.style.transform='none';
}

function paintMianButton(){
  var background=document.getElementById('mian-bg');
  var foreground=document.getElementById('mian-foreground');
  if(!background||!foreground)return;
  var sx=Math.max(1,Math.min(1.18,MO.hS*(1+MO.dragStretch)));
  var sy=Math.max(0.94,Math.min(1.14,MO.hS*(1-MO.dragStretch*0.4)));
  var iconSx=Math.max(1,Math.min(1.22,MO.hS*(1+MO.dragStretch*2.2)));
  var iconSy=Math.max(0.91,Math.min(1.14,MO.hS*(1-MO.dragStretch*0.8)));
  var tx=MO.x.toFixed(2),ty=MO.y.toFixed(2);
  var angle=(Math.atan2(MO.y,MO.x)*180/Math.PI).toFixed(1);
  var noPos=Math.abs(MO.x)<0.1&&Math.abs(MO.y)<0.1;
  var surfaceTransform=Math.abs(sx-1)<0.003&&Math.abs(sy-1)<0.003&&noPos?'none':
    'translate3d('+tx+'px,'+ty+'px,0) rotate('+angle+'deg) scaleX('+sx.toFixed(3)+') scaleY('+sy.toFixed(3)+') rotate(-'+angle+'deg)';
  var iconTransform=Math.abs(iconSx-1)<0.003&&Math.abs(iconSy-1)<0.003&&noPos?'none':
    'translate3d('+tx+'px,'+ty+'px,0) rotate('+angle+'deg) scaleX('+iconSx.toFixed(3)+') scaleY('+iconSy.toFixed(3)+') rotate(-'+angle+'deg)';
  background.style.transform=surfaceTransform;
  foreground.style.transform=iconTransform;
}

/* ── Nav anim loop — ONLY runs during active drag/hold, not for settle ── */
function animLoop(ts){
  /* Travel uses a calm, one-way ease for mouse and touch. */
  var prevL=G.iL,prevW=G.iW;
  G.iL+=(G.tL-G.iL)*0.14;G.iW+=(G.tW-G.iW)*0.14;
  G.iLv=G.iL-prevL;G.iWv=G.iW-prevW;
  var liquidActive=G.holding;
  var tSX=liquidActive&&G.dragging?1+Math.min(Math.abs(G.dragVel)*0.055,0.55):1;
  if(liquidActive){
    var sf=(tSX-G.sX)*0.22;G.sXv=G.sXv*0.66+sf;G.sX+=G.sXv;
    var el=(ts-G.holdStart)/1000;G.tHS=1+G.holdStrength*(1-Math.exp(-el*2.4));
    var hf=(G.tHS-G.hS)*HK;G.hSv=G.hSv*HD+hf;G.hS+=G.hSv;
  } else {
    G.sX=1;G.sXv=0;G.hS=1;G.hSv=0;G.tHS=1;
  }
  var ind=document.getElementById('ind');
  ind.style.left=G.iL.toFixed(2)+'px';
  ind.style.width=G.iW.toFixed(2)+'px';
  var sx=Math.max(0.5,Math.min(2.0,G.sX*G.hS));
  /* Preserve the liquid glass's vertical expansion on mobile; the indicator
     scales around its center so the extra height grows evenly in both directions. */
  var sy=Math.max(0.5,Math.min(2.0,G.hS/Math.pow(Math.max(G.sX,0.65),0.5)));
  ind.style.transform=(Math.abs(sx-1)<0.004&&Math.abs(sy-1)<0.004)?'none':'scaleX('+sx.toFixed(3)+') scaleY('+sy.toFixed(3)+')';
  updateClip(sx,sy);
  var stable=Math.abs(G.iLv)<0.04&&Math.abs(G.iWv)<0.04&&Math.abs(G.sXv)<0.002&&Math.abs(G.hSv)<0.002&&!G.dragging&&!G.holding;
  if(!stable)G.raf=requestAnimationFrame(animLoop);
  else{G.raf=null;ind.style.left=G.tL+'px';ind.style.width=G.tW+'px';ind.style.transform='none';updateClip(1,1);}
}

/* ── Mian indicator loop: constrained spring + hold swell + drag stretch ── */
function mindLoop(ts){
  var dt=MO.lastFrameTs?Math.min((ts-MO.lastFrameTs)/1000,0.05):1/60;
  MO.lastFrameTs=ts;
  /* Track the active pointer directly; only the release uses the spring. */
  if(MO.dragging){
    MO.x=MO.tX;MO.y=MO.tY;MO.xV=0;MO.yV=0;
    MO.dragStretch=MO.tDragStretch;MO.dragStretchV=0;
  } else {
    var spring=advanceMianSpring(MO.x,MO.xV,MO.tX,dt,18,0.78);MO.x=spring.value;MO.xV=spring.velocity;
    spring=advanceMianSpring(MO.y,MO.yV,MO.tY,dt,18,0.78);MO.y=spring.value;MO.yV=spring.velocity;
    spring=advanceMianSpring(MO.dragStretch,MO.dragStretchV,MO.tDragStretch,dt,18,0.84);MO.dragStretch=spring.value;MO.dragStretchV=spring.velocity;
  }
  /* Keep the button's own press swell subtle and duration-driven. */
  if(MO.holding){var el=(ts-MO.holdStart)/1000;MO.tHS=1+0.12*(1-Math.exp(-el*2.4));}
  var swell=advanceMianSpring(MO.hS,MO.hSv,MO.tHS,dt,16);MO.hS=swell.value;MO.hSv=swell.velocity;
  paintMianButton();
  var stable=Math.abs(MO.x)<0.12&&Math.abs(MO.y)<0.12&&Math.abs(MO.xV)<0.5&&Math.abs(MO.yV)<0.5&&Math.abs(MO.dragStretch)<0.002&&Math.abs(MO.dragStretchV)<0.02&&Math.abs(MO.hS-1)<0.002&&Math.abs(MO.hSv)<0.02&&!MO.holding;
  if(!stable) MO.raf=requestAnimationFrame(mindLoop);
  else{
    MO.raf=null;document.getElementById('mian-bg').style.transform='none';document.getElementById('mian-foreground').style.transform='none';
  }
}

function kick(){if(!G.raf)G.raf=requestAnimationFrame(animLoop);}
function kickMO(){if(!MO.raf)MO.raf=requestAnimationFrame(mindLoop);}
function snapTo(id){var b=document.querySelector('[data-nav="'+id+'"]');if(!b)return;G.tL=b.offsetLeft;G.tW=b.offsetWidth;kick();}

function syncMianOpenState(){
  M.open=!!(window.__isMianOpen&&window.__isMianOpen());
  var mind=document.getElementById('mind');
  var mico=document.getElementById('mico');
  if(mind)mind.style.opacity=M.open?'1':'0';
  if(mico)mico.setAttribute('stroke',M.open?'#007aff':'rgba(0,0,0,.38)');
}

/* ── Rest pill: instant position snap (no position CSS transition to avoid mismatch) ── */
function setRpill(id){
  var b=document.querySelector('[data-nav="'+id+'"]');
  var rp=document.getElementById('rpill');
  if(!b||!rp)return;
  rp.style.left=b.offsetLeft+'px';rp.style.top=b.offsetTop+'px';
  rp.style.width=b.offsetWidth+'px';rp.style.height=b.offsetHeight+'px';
}

function rippleRestPill(rp){
  if(!rp||!rp.animate)return;
  if(restPillRipple){restPillRipple.cancel();restPillRipple=null;}
  rp.style.transformOrigin='center';
  restPillRipple=rp.animate([
    {transform:'scaleX(.94)',offset:0},
    {transform:'scaleX(1.18)',offset:.3},
    {transform:'scaleX(.96)',offset:.68},
    {transform:'scaleX(1)',offset:1}
  ],{duration:340,easing:'cubic-bezier(.2,.7,.25,1)'});
  restPillRipple.onfinish=function(){rp.style.transform='none';restPillRipple=null;};
}

/* ── Show/hide glass vs gray pill. On hide: also snaps clip to active item instantly. ── */
function setInteracting(on){
  var ind=document.getElementById('ind');
  var rp=document.getElementById('rpill');
  var pill=document.getElementById('pill');
  ind.style.opacity=on?'1':'0';
  rp.style.opacity=on?'0':'1';
  if(pill)pill.classList.toggle('is-glass-active',!!on);
  if(!on){
    /* Snap clip to active item so blue icon appears correctly over gray pill */
    var b=document.querySelector('[data-nav="'+curId+'"]');
    if(b){G.iL=b.offsetLeft;G.iW=b.offsetWidth;}
    updateClip(1,1);
  }
}

/* ── Pill lift: scales up + glow on press, eases back on release ── */
function setPillLift(on){
  var pill=document.getElementById('pill');
  if(!pill)return;
  var isMobile=window.matchMedia('(max-width: 767px)').matches;
  pill.style.transition=on?
    'transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s ease,background .45s':
    (isMobile?'transform .187s cubic-bezier(0.65,0,0.35,1),box-shadow .187s ease,background .45s':'transform .38s ease,box-shadow .38s ease,background .45s');
  /* Match the web press response on mobile while scaling around the pill's
     center, without translating it away from the dock. */
  if(isMobile)pill.style.transformOrigin='center center';
  pill.style.transform=on?(isMobile?'scale(1.032)':'scale(1.032) translateY(-2px)'):'none';
  pill.style.boxShadow=on?PSH.lUp:PSH.lRest;
}

/* ── Mian lift: same behaviour on Mian circle ── */
function setMianLift(on){
  var background=document.getElementById('mian-bg');
  if(!background)return;
  background.style.transition=on?'box-shadow .22s ease,background .45s':'box-shadow .38s ease,background .45s';
  background.style.boxShadow=on?PSH.lUp:PSH.lRest;
}

function getItemAt(rx){var best=null,bd=Infinity;document.querySelectorAll('.nb').forEach(function(b){var c=b.offsetLeft+b.offsetWidth/2,d=Math.abs(rx-c);if(d<bd){bd=d;best=b.dataset.nav;}});return best;}

function setActive(id,fromRelease){
  if(restPillRevealTimer){clearTimeout(restPillRevealTimer);restPillRevealTimer=null;}
  if(restPillRipple){restPillRipple.cancel();restPillRipple=null;}
  curId=id;
  window.__navActive=id;
  if(id==='__none__')return;
  /* Re-enable clip layer if it was hidden (privacy/terms pages) */
  var wl=document.getElementById('wl');
  if(wl&&wl.style.display==='none')wl.style.display='';
  /* Ensure indicator is visible */
  var indEl=document.getElementById('ind');if(indEl)indEl.style.opacity='1';
  /* Hide gray pill INSTANTLY (no fade) as the white glass leaves the origin.
     It will be re-positioned and faded back in once the slide completes. */
  var rpEl=document.getElementById('rpill');
  if(rpEl){
    rpEl.style.transition='none';
    rpEl.style.opacity='0';
  }
  /* Stop physics loop — CSS takes over for the settle glide */
  if(G.raf){cancelAnimationFrame(G.raf);G.raf=null;}
  G.hS=1;G.hSv=0;G.sX=1;G.sXv=0;G.tHS=1;
  var b=document.querySelector('[data-nav="'+id+'"]');
  var ind=document.getElementById('ind');
  var swipeAlreadySettled=false;
  if(window.__navSwipeSettledId===id&&b&&ind){
    window.__navSwipeSettledId=null;
    swipeAlreadySettled=true;
    fromRelease=true;
    if(G.raf){cancelAnimationFrame(G.raf);G.raf=null;}
    G.dragging=false;G.holding=false;G.iL=G.tL=b.offsetLeft;G.iW=G.tW=b.offsetWidth;
    ind.style.transition='none';ind.style.left=G.iL+'px';ind.style.width=G.iW+'px';ind.style.transform='none';
    if(wl)wl.style.transition='none';updateClip(1,1);setRpill(id);
    if(wl)wl.style.transition='';ind.style.transition='';
    var settledTitle=document.getElementById('pgt'),settledSub=document.getElementById('pgs');
    if(settledTitle)settledTitle.textContent=PAGES[id].t;if(settledSub)settledSub.textContent=PAGES[id].s;
  }
  if(b){
    var ease='0.187s cubic-bezier(0.65,0,0.35,1)';
    ind.style.transition='left '+ease+',width '+ease+',transform '+(fromRelease?'0.32s cubic-bezier(.34,1.56,.64,1)':'0s')+',opacity 0.18s ease';
    if(wl) wl.style.transition='clip-path '+ease;
    G.tL=b.offsetLeft;G.tW=b.offsetWidth;G.iL=b.offsetLeft;G.iW=b.offsetWidth;
    G.iLv=0;G.iWv=0;
    ind.style.left=b.offsetLeft+'px';
    ind.style.width=b.offsetWidth+'px';
    ind.style.transform='none';
    updateClip(1,1);
  }
  /* After glide finishes: move gray pill to target, restore fade, then show it */
  if(fromRelease&&rpEl){
    restPillRevealTimer=setTimeout(function(){
      restPillRevealTimer=null;
      setRpill(id);
      rpEl.style.transition='opacity 120ms ease-out';
      rpEl.style.opacity='.34';
      rippleRestPill(rpEl);
    },145);
  }
  setTimeout(function(){
    setRpill(id);             /* re-position gray pill at the new active button */
    if(rpEl&&fromRelease){
      rpEl.style.transition='opacity 120ms ease-out';
      setInteracting(false);
      setTimeout(function(){rpEl.style.transition='';},150);
    } else {
      if(rpEl)rpEl.style.transition='';
      setInteracting(false);
    }
    ind.style.transition='opacity 0.18s ease';
    if(wl) wl.style.transition='';
  },210);
  var pg=document.getElementById('pgt'),ps=document.getElementById('pgs');
  if(!swipeAlreadySettled){
    if(pg){pg.style.opacity='0';pg.style.transform='translateY(8px)';ps.style.opacity='0';}
    setTimeout(function(){if(pg){pg.textContent=PAGES[id].t;ps.textContent=PAGES[id].s;pg.style.opacity='1';pg.style.transform='translateY(0)';ps.style.opacity='1';}},165);
  }
}
window.__setPortfolioNavActive=function(id){if(id==='licenses')id='certs';if(PAGES[id]&&id!==curId)setActive(id);};
window.__setPortfolioNavSwipeProgress=function(fromId,toId,progress){
  if(fromId==='licenses')fromId='certs';if(toId==='licenses')toId='certs';
  var from=document.querySelector('[data-nav="'+fromId+'"]'),to=document.querySelector('[data-nav="'+toId+'"]');
  var ind=document.getElementById('ind'),wl=document.getElementById('wl');
  if(!from||!to||!ind)return;
  progress=Math.max(0,Math.min(1,progress));
  if(G.raf){cancelAnimationFrame(G.raf);G.raf=null;}
  setInteracting(true);
  var left=from.offsetLeft+(to.offsetLeft-from.offsetLeft)*progress;
  var width=from.offsetWidth+(to.offsetWidth-from.offsetWidth)*progress;
  G.iL=G.tL=left;G.iW=G.tW=width;
  ind.style.transition='none';ind.style.left=left+'px';ind.style.width=width+'px';
  ind.style.transform='scaleX('+(1+Math.sin(progress*Math.PI)*0.07).toFixed(3)+')';
  updateClip(1+Math.sin(progress*Math.PI)*0.07,1);
  if(wl)wl.style.transition='none';
};
window.__resetPortfolioNavSwipe=function(){
  var b=document.querySelector('[data-nav="'+curId+'"]'),ind=document.getElementById('ind'),wl=document.getElementById('wl');
  if(!b||!ind)return;
  G.dragging=false;G.holding=false;G.iL=G.tL=b.offsetLeft;G.iW=G.tW=b.offsetWidth;
  ind.style.transition='none';ind.style.left=G.iL+'px';ind.style.width=G.iW+'px';ind.style.transform='none';
  if(wl)wl.style.transition='none';updateClip(1,1);setInteracting(false);
  if(wl)wl.style.transition='';ind.style.transition='';
};

function updateMian(){
  var mind=document.getElementById('mind');var mico=document.getElementById('mico');
  if(!mind||!mico)return;
  mind.style.opacity=M.open?'1':'0';
  mind.style.pointerEvents='none';
  /* Icon: blue when open, visible gray (matching nav idle) when closed */
  mico.setAttribute('stroke',M.open?'#007aff':'rgba(0,0,0,.38)');
}

/* ── Nav pill events: NO hover follow, only hold+drag ── */
function setupPill(){
  var pill=document.getElementById('pill');
  var pressedId=null;
  pill.addEventListener('pointerdown',function(e){
    syncNavOverlayGeometry();
    /* Strip CSS transitions — JS physics runs during drag */
    var ind=document.getElementById('ind');var wl=document.getElementById('wl');
    /* Privacy/terms only: pre-position indicator at pressed button so it appears
       AT the button instead of sliding from the home fallback position. */
    if(curId==='__none__'){
      var pressedBtn=e.target.closest&&e.target.closest('[data-nav]');
      if(pressedBtn){
        if(wl&&wl.style.display==='none')wl.style.display='';
        ind.style.left=pressedBtn.offsetLeft+'px';
        ind.style.width=pressedBtn.offsetWidth+'px';
        G.iL=pressedBtn.offsetLeft;G.iW=pressedBtn.offsetWidth;
        G.tL=G.iL;G.tW=G.iW;G.iLv=0;G.iWv=0;
        updateClip(1,1);
      }
    }
    ind.style.transition='opacity 0.18s ease';wl.style.transition='';
    G.holding=true;G.holdStart=performance.now();
    var pressure=typeof e.pressure==='number'&&e.pressure>0?e.pressure:0.5;
    /* At normal pressure, restore the original 45% swell; firmer presses add
       a little more while lighter presses keep a gentler response. */
    G.holdStrength=0.35+Math.max(0,Math.min(1,pressure))*0.2;
    G.tHS=1;G.hS=1;G.hSv=0;G.sX=1;G.sXv=0;
    G.lastPx=e.clientX;G.startPx=e.clientX;G.dragVel=0;G.dragging=false;
    var pressed=e.target.closest&&e.target.closest('[data-nav]');
    pressedId=pressed?pressed.dataset.nav:getItemAt(e.clientX-pill.getBoundingClientRect().left);
    /* The swell starts immediately while the position eases to this tab. */
    var targetButton=document.querySelector('.nb[data-nav="'+pressedId+'"]');
    if(targetButton){
      G.tL=targetButton.offsetLeft;G.tW=targetButton.offsetWidth;
    }
    pill.setPointerCapture(e.pointerId);pill.style.cursor='grabbing';
    setInteracting(true);
    setPillLift(true);
    kick();e.preventDefault();
  });
  pill.addEventListener('pointermove',function(e){
    /* Only move oval while holding — no hover follow */
    if(!G.holding)return;
    var dx=e.clientX-G.lastPx;G.dragVel=G.dragVel*0.55+dx*0.45;G.lastPx=e.clientX;
    if(!G.dragging&&Math.abs(e.clientX-G.startPx)>7){
      G.dragging=true;
    }
    var pr=pill.getBoundingClientRect(),rx=e.clientX-pr.left,bw=G.baseW;
    var minLeft=5,maxLeft=pr.width-5-bw;
    G.tL=Math.max(minLeft,Math.min(maxLeft,rx-bw/2));G.tW=bw;kick();
  });
  pill.addEventListener('pointerup',function(e){
    G.holding=false;G.tHS=1;G.dragging=false;G.dragVel=0;pill.style.cursor='grab';
    var target=getItemAt(G.tL+G.tW/2)||pressedId||curId;
    pressedId=null;
    setPillLift(false); /* lower pill */
    setActive(target,true);  /* ease glass to target, then ripple into the gray pill */
    /* Let the React app handle page changes without leaving its route model. */
    if(NAV_URLS[target])setTimeout(function(){
      if(typeof window.__portfolioNavigate==='function')window.__portfolioNavigate(target);
      else window.location.href=NAV_URLS[target];
    },180);
    kick();
  });
  pill.addEventListener('lostpointercapture',function(){
    if(G.holding){
      G.holding=false;G.tHS=1;G.dragging=false;G.dragVel=0;pill.style.cursor='grab';
      setPillLift(false);setActive(curId);
    }
  });
}

/* ── Mian: temporary blue tint, subtle button swell, and short constrained drag. ── */
function setupMian(){
  var mian=document.getElementById('mian');
  if(!mian)return;
  mian.addEventListener('pointerdown',function(e){
    if(MO.holding)return;
    MO.pointerId=e.pointerId;M.tapSx=e.clientX;M.tapSy=e.clientY;
    /* Press feedback is temporary; only the chat panel controls M.open. */
    var mind=document.getElementById('mind');if(mind)mind.style.opacity='1';
    MO.holding=true;MO.holdStart=performance.now();MO.lastFrameTs=0;MO.tHS=1;MO.hS=1;MO.hSv=0;
    MO.tX=MO.x;MO.tY=MO.y;MO.tDragStretch=0;MO.dragPath=0;MO.dragging=false;
    MO.lastPx=e.clientX;MO.lastPy=e.clientY;MO.startPx=e.clientX;MO.startPy=e.clientY;
    try{mian.setPointerCapture(e.pointerId);}catch(error){}
    setMianLift(true);kickMO();e.preventDefault();
  },{passive:false});
  mian.addEventListener('pointermove',function(e){
    if(!MO.holding||e.pointerId!==MO.pointerId)return;
    var dx=e.clientX-MO.lastPx,dy=e.clientY-MO.lastPy;
    MO.lastPx=e.clientX;MO.lastPy=e.clientY;
    if(!MO.dragging&&(Math.abs(e.clientX-MO.startPx)>2||Math.abs(e.clientY-MO.startPy)>2))MO.dragging=true;
    if(MO.dragging){
      /* Move the button itself a little, with a circular travel limit. */
      var offset=clampMianDrag(MO.tX+dx,MO.tY+dy,MIAN_DRAG_RADIUS);
      MO.dragPath+=Math.sqrt(dx*dx+dy*dy);
      MO.tDragStretch=Math.min(MO.dragPath*0.0012,0.07);
      MO.tX=offset.x;MO.tY=offset.y;kickMO();
    }
  });
  mian.addEventListener('pointerup',function(e){
    if(!MO.holding||e.pointerId!==MO.pointerId)return;
    var wasDrag=MO.dragging;
    if(wasDrag){MO.x=MO.tX;MO.y=MO.tY;MO.xV=0;MO.yV=0;MO.dragStretch=MO.tDragStretch;MO.dragStretchV=0;}
    MO.holding=false;MO.pointerId=null;MO.tHS=1;MO.tDragStretch=0;MO.dragging=false;MO.tX=0;MO.tY=0;
    var mind=document.getElementById('mind');if(mind)mind.style.opacity='0';
    kickMO();setMianLift(false);
    if(!wasDrag){if(window.__isMianOpen?.())window.__closeMian?.();else window.__openMian?.();}
    else syncMianOpenState();
  });
  mian.addEventListener('pointercancel',function(e){
    if(e.pointerId!==MO.pointerId)return;
    if(MO.dragging){MO.x=MO.tX;MO.y=MO.tY;MO.xV=0;MO.yV=0;MO.dragStretch=MO.tDragStretch;MO.dragStretchV=0;}
    MO.holding=false;MO.pointerId=null;MO.tHS=1;MO.tDragStretch=0;MO.dragging=false;MO.tX=0;MO.tY=0;
    var mind=document.getElementById('mind');if(mind)mind.style.opacity='0';
    kickMO();setMianLift(false);syncMianOpenState();
  });
  mian.addEventListener('lostpointercapture',function(){
    if(!MO.holding)return;
    if(MO.dragging){MO.x=MO.tX;MO.y=MO.tY;MO.xV=0;MO.yV=0;MO.dragStretch=MO.tDragStretch;MO.dragStretchV=0;}
    MO.holding=false;MO.pointerId=null;MO.tHS=1;MO.tDragStretch=0;MO.dragging=false;MO.tX=0;MO.tY=0;
    var mind=document.getElementById('mind');if(mind)mind.style.opacity='0';
    kickMO();setMianLift(false);syncMianOpenState();
  });
}
/* Place every blue overlay item on the exact rendered box of its gray item.
   Independent flex layout can drift by fractional pixels across fonts/devices. */
function syncNavOverlayGeometry(){
  var overlay=document.getElementById('wl');
  if(!overlay)return;
  var pill=document.getElementById('pill');
  var indicator=document.getElementById('ind');
  var overlayRect=overlay.getBoundingClientRect();
  var buttons=document.querySelectorAll('.nb');
  var copies=overlay.querySelectorAll('.bw');
  /* Use fractional rendered geometry so compact mobile sizing cannot leave
     the glass a fraction of a pixel off the nav buttons. */
  var activeButton=document.querySelector('.nb[data-nav="'+curId+'"]')||buttons[0];
  if(pill&&indicator&&activeButton){
    var pillRect=pill.getBoundingClientRect();
    var activeRect=activeButton.getBoundingClientRect();
    G.iTop=activeRect.top-pillRect.top;
    G.iH=activeRect.height;
    indicator.style.top=G.iTop+'px';
    indicator.style.height=G.iH+'px';
    if(window.matchMedia('(max-width: 767px)').matches)indicator.style.transformOrigin='center center';
  }
  buttons.forEach(function(button,index){
    var copy=copies[index];
    if(!copy)return;
    var rect=button.getBoundingClientRect();
    var style=getComputedStyle(button);
    copy.style.position='absolute';
    copy.style.left=(rect.left-overlayRect.left)+'px';
    copy.style.top=(rect.top-overlayRect.top)+'px';
    copy.style.width=rect.width+'px';
    copy.style.height=rect.height+'px';
    copy.style.minWidth='0';
    copy.style.boxSizing='border-box';
    copy.style.padding=style.padding;
    copy.style.margin='0';
    var copyRect=copy.getBoundingClientRect();
    var sourceIcon=button.querySelector('svg');
    var copyIcon=copy.querySelector('svg');
    if(sourceIcon&&copyIcon){
      var exactIcon=sourceIcon.cloneNode(true);
      copyIcon.replaceWith(exactIcon);
      copyIcon=exactIcon;
      copyIcon.style.transform='none';
      var sourceIconRect=sourceIcon.getBoundingClientRect();
      copyIcon.style.position='absolute';
      copyIcon.style.left=(sourceIconRect.left-copyRect.left)+'px';
      copyIcon.style.top=(sourceIconRect.top-copyRect.top)+'px';
      copyIcon.style.width=sourceIconRect.width+'px';
      copyIcon.style.height=sourceIconRect.height+'px';
      copyIcon.style.margin='0';
    }
    var sourceLabel=button.querySelector('span');
    var copyLabel=copy.querySelector('span');
    if(sourceLabel&&copyLabel){
      var exactLabel=sourceLabel.cloneNode(true);
      copyLabel.replaceWith(exactLabel);
      var sourceLabelRect=sourceLabel.getBoundingClientRect();
      var sourceLabelStyle=getComputedStyle(sourceLabel);
      exactLabel.style.position='absolute';
      exactLabel.style.left=(sourceLabelRect.left-copyRect.left)+'px';
      exactLabel.style.top=(sourceLabelRect.top-copyRect.top)+'px';
      exactLabel.style.width=sourceLabelRect.width+'px';
      exactLabel.style.height=sourceLabelRect.height+'px';
      exactLabel.style.display='block';
      exactLabel.style.margin='0';
      exactLabel.style.padding='0';
      exactLabel.style.font=sourceLabelStyle.font;
      exactLabel.style.letterSpacing=sourceLabelStyle.letterSpacing;
      exactLabel.style.lineHeight=sourceLabelStyle.lineHeight;
      exactLabel.style.textAlign=sourceLabelStyle.textAlign;
      exactLabel.style.whiteSpace=sourceLabelStyle.whiteSpace;
    }
  });
}

function setNbCompact(on){
  var pill=document.getElementById('pill');
  if(pill)pill.classList.toggle('is-mobile-compact',on);
  document.querySelectorAll('.nb,.bw').forEach(function(button){
    button.style.minWidth=on?'0':'';
    button.style.flex=on?'1 1 0%':'';
    button.style.padding=on?'8px 2px':'';
  });
}

function layoutMobileNav(forceVertical){
  var navc=document.getElementById('navc');
  var pill=document.getElementById('pill');
  var mian=document.getElementById('mian');
  var dock=document.querySelector('.floating-controls-dock');
  if(!navc||!pill||!mian||!dock)return;
  var isMobile=window.matchMedia('(max-width: 767px)').matches;
  var viewport=window.visualViewport;
  var vw=Math.min(window.innerWidth,viewport?viewport.width:window.innerWidth);
  var visualLeft=viewport?viewport.offsetLeft:0;
  if(!isMobile){
    navc.style.left='';navc.style.right='';navc.style.transform='';navc.style.bottom='';navc.style.top='';
    mian.style.left='';mian.style.right='';mian.style.bottom='';mian.style.top='';
    dock.style.left='';dock.style.right='';dock.style.transform='';dock.style.bottom='';dock.style.top='';dock.style.gap='';dock.style.width='';
    pill.style.width='';pill.style.maxWidth='';
    mian.style.width='';mian.style.height='';mian.style.flexBasis='';
    setNbCompact(false);
    syncNavOverlayGeometry();
    return;
  }

  /* Try the normal, spacious sizing first (unchanged behaviour). */
  setNbCompact(false);
  /* A previous narrow-width layout may have set a forced pill width; clear it
     before measuring again so rotation/resizing can expand back naturally. */
  pill.style.width='';pill.style.maxWidth='';
  mian.style.width='';mian.style.height='';mian.style.flexBasis='';
  var GAP=14,SIDE=12;
  var pw=pill.offsetWidth,mw=mian.offsetWidth||60;
  var fits=(pw+GAP+mw+SIDE*2)<=vw;

  if(!fits){
    /* Doesn't fit at normal size — compact the pill buttons + tighten
       gaps just enough to bring Mian fully back on-screen. */
    setNbCompact(true);
    GAP=6;SIDE=Math.max(18,Math.min(28,Math.round(vw*.055)));
    mw=mian.offsetWidth||60;
    /* On compact layouts give the tabs an explicit share of the available
       width. Intrinsic label widths otherwise keep the pill wide enough to
       push Mian off-screen on narrow phones. */
    var availablePillWidth=Math.max(0,vw-SIDE*2-GAP-mw);
    pill.style.width=availablePillWidth+'px';
    pill.style.maxWidth=availablePillWidth+'px';
    pw=pill.getBoundingClientRect().width;
  }

  var groupW=pw+GAP+mw;
  var groupLeft=visualLeft+(vw-groupW)/2;
  if(groupLeft<visualLeft+SIDE)groupLeft=visualLeft+SIDE;
  if(groupLeft+groupW>visualLeft+vw-SIDE)groupLeft=Math.max(visualLeft+SIDE,visualLeft+vw-SIDE-groupW);
  dock.style.width=groupW+'px';
  dock.style.left=groupLeft+'px';
  dock.style.transform='none';
  dock.style.top='';
  dock.style.bottom='';
  dock.style.gap=GAP+'px';
  navc.style.left='';navc.style.right='';navc.style.transform='';navc.style.bottom='';navc.style.top='';
  mian.style.left='';mian.style.right='';mian.style.transform='';mian.style.bottom='';mian.style.top='';
  syncNavOverlayGeometry();
}
function init(){
  var pill=document.getElementById('pill');
  if(pill){
    /* ── Nav pill exists: full pill init ── */
    var startId=window.__navActive||'home';
    var btn=null;
    if(startId&&startId!=='none'){
      btn=pill.querySelector('[data-nav="'+startId+'"]');
    }
    if(!btn){
      /* No active item — just position the indicator off-screen */
      btn=pill.querySelector('[data-nav="home"]');
      startId='__none__';
    }
    /* Hide nav on mobile until layoutMobileNav positions it (prevents jitter).
       Run layoutMobileNav() FIRST — it may compact the pill's own buttons
       on narrow phones, and everything below reads button geometry, so
       that geometry must already be final before we measure it. */
    var isMob=window.matchMedia('(max-width:767px)').matches;
    if(isMob){document.getElementById('mian').style.opacity='0';}
    try{layoutMobileNav();}catch(e){console.warn('layoutMobileNav:',e);}
    if(btn){
      G.baseW=btn.offsetWidth;G.iL=btn.offsetLeft;G.tL=G.iL;
      G.iW=btn.offsetWidth;G.tW=G.iW;G.iTop=btn.offsetTop;G.iH=btn.offsetHeight;
      var ind=document.getElementById('ind');
      ind.style.left=G.iL+'px';ind.style.top=G.iTop+'px';ind.style.width=G.iW+'px';ind.style.height=G.iH+'px';
      setRpill(startId);
      /* If no nav item should be active (privacy/terms), hide everything */
      if(startId==='__none__'){
        var indEl=document.getElementById('ind');if(indEl)indEl.style.opacity='0';
        var wlEl=document.getElementById('wl');if(wlEl){wlEl.style.clipPath='inset(0 100% 0 0)';wlEl.style.display='none';}
        var rpEl=document.getElementById('rpill');if(rpEl)rpEl.style.opacity='0';
        /* Set all buttons to idle color explicitly */
        document.querySelectorAll('.nb').forEach(function(b){b.classList.remove('active');});
      } else {
        updateClip(1,1);
      }
    }
    try{setupPill();}catch(e){console.warn('setupPill:',e);}
    if(window.ResizeObserver){
      var navGeometryObserver=new ResizeObserver(syncNavOverlayGeometry);
      navGeometryObserver.observe(pill);
    }
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){layoutMobileNav(true);});}
    /* Show the settled gray-pill state immediately (not the white glass indicator) */
    if(startId!=='__none__'){setInteracting(false);}
    window.addEventListener('resize',function(){try{layoutMobileNav();}catch(e){}setRpill(curId);if(!G.dragging)snapTo(curId);});
    window.addEventListener('orientationchange',function(){try{layoutMobileNav(true);}catch(e){}});
    window.addEventListener('load',function(){try{layoutMobileNav();}catch(e){}});
    try{window.matchMedia('(max-width: 767px)').addEventListener('change',function(){try{layoutMobileNav();}catch(e){}});}catch(e){}
  }
  /* ── Always set up Mian — works with or without nav pill ── */
  try{setupMian();}catch(e){console.warn('setupMian:',e);}
  try{updateMian();}catch(e){console.warn('updateMian:',e);}
  /* Reveal Mian (and nav pill if present) after positioning — smooth fade-in */
  requestAnimationFrame(function(){
    var navc=document.getElementById('navc');
    var mianEl=document.getElementById('mian');
    if(navc){navc.style.transition='opacity .2s ease';navc.style.opacity='1';}
    if(mianEl){mianEl.style.transition='opacity .2s ease';mianEl.style.opacity='1';}
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else setTimeout(init,0);



/* ============================================================
   Mian assistant — loaded by the React portfolio navigation
   ============================================================ */
(function () {
  'use strict';
/* ============================================================
   Mian — JC's personal AI assistant
   Loaded once by FloatingNavigation in src/App.jsx. Keep all
   provider credentials in the separately hosted server Worker;
   browser code and its API endpoint are public.
   ============================================================ */
(function () {
  'use strict';

  // -------------------- CONFIG --------------------
  const CONFIG = {
    apiEndpoint: 'https://mian-chatbot.jc-ocampo0907.workers.dev',

    botName: 'Mian',
    botSubtitle: "JC's AI Assistant",
    welcomeMessage: "Hi! I'm Mian, JC's personal AI assistant. Ask me anything about his background, projects, certifications, or experience!",

    // Profile picture. Recommended size: 512x512 PNG so it stays crisp
    // at every place we render it (28px small avatar, 48px header,
    // 140px ID-card portrait), including 2x/3x retina displays.
    avatarUrl: '/images/mian/mian.png',

    // ID-card popup text
    cardDedication: 'Created on April 2026. Dedicated to the love of my life.',

    maxChars: 500,
    maxHistory: 10,
  };

  // ==================== MIAN FAQ CACHE ====================
  // Common questions are answered instantly from this local cache
  // instead of hitting the LLM — no network round trip, no API cost.
  //
  // HOW IT WORKS
  //   1. The visitor's message is normalized (lowercase, punctuation
  //      stripped, "Jose Carlo / Ocampo / JC's" → "jc", leading
  //      "hi mian," removed).
  //   2. Every intent's patterns are tested against it.
  //   3. Exactly ONE intent must match. Zero matches, two or more matches
  //      (compound questions like "where did he study and what certs
  //      does he have?"), or a long message → falls through to the LLM.
  //   4. A random variant is picked, never the same one twice in a row.
  //
  // HOW TO ADD ONE
  //   Copy any block below, give it a unique id, a few regex patterns,
  //   and 2–3 reply variants. Plain text only (no markdown). If a reply
  //   contains an email address, the Copy/Send buttons attach on their own.
  //   Keep facts in sync with SYSTEM_PROMPT in worker.js.
  //
  // TESTING
  //   Open the browser console and run: __mianMatch("where did he study")
  // ========================================================
  const JC_EMAIL_ADDR = 'jcdcocampo@gmail.com';

  // Messages longer than this are treated as "real" questions → LLM.
  const FAQ_MAX_LEN = 110;

  const FAQ_INTENTS = [
    // ---------- Small talk ----------
    {
      id: 'greeting',
      whole: true, // must be the ENTIRE message, so "hi, what are his certs" isn't swallowed
      patterns: [/^(hi+|hello+|hey+|heya|yo|sup|hiya|howdy|good (morning|afternoon|evening|day)|kumusta|musta|hello there|hi there|hey there)( mian)?$/],
      replies: [
        "Hi there! I'm Mian. Ask me anything about JC's background, projects, certifications, or experience.",
        "Hello! What would you like to know about JC? I can tell you about his work, education, projects, or certifications.",
        "Hey! I'm Mian, JC's assistant. Where would you like to start: his experience, projects, or certifications?"
      ]
    },
    {
      id: 'thanks',
      whole: true,
      patterns: [/^(thanks?|thank you|thank u|ty|tysm|thx|salamat|maraming salamat|thanks a lot|thank you so much|appreciate it|great thanks|ok thanks|okay thanks|cool thanks|nice|cool|great|awesome|ok|okay|got it)( mian)?$/],
      replies: [
        "You're welcome! Let me know if there's anything else you'd like to know about JC.",
        "Happy to help! Feel free to ask more anytime.",
        "Anytime! If you'd like to reach JC directly, just ask for his email."
      ]
    },
    {
      id: 'bye',
      whole: true,
      patterns: [/^(bye+|goodbye|good bye|see (you|ya)|cya|later|paalam|take care)( mian)?$/],
      replies: [
        "Goodbye! Thanks for stopping by JC's portfolio.",
        "See you! Thanks for visiting.",
        "Take care, and thanks for dropping by!"
      ]
    },
    {
      id: 'about_mian',
      patterns: [
        /\bwho (are|r) (you|u)\b/,
        /\bwhat (are|r) (you|u)\b/,
        /\bwhat(s| is) mian\b/,
        /\bwho(s| is) mian\b/,
        /\b(who|what) (made|built|created|developed) (you|u|mian)\b/,
        /\bare (you|u) (a |an )?(bot|ai|robot|human|real)\b/,
        /\bwhat can (you|u) do\b/,
        /\bhow do(es)? (you|u|this|mian) work\b/
      ],
      replies: [
        "I'm Mian, JC's personal AI assistant. JC built me in April 2026 to answer questions about his background, projects, certifications, and experience. My answers can occasionally be off, so feel free to verify anything important with JC directly.",
        "I'm Mian, an AI assistant JC created in April 2026 for his portfolio. I can tell you about his work, education, projects, and certifications, or give you his email if you'd like to reach him.",
        "I'm Mian, JC's portfolio assistant. He built me in April 2026. Ask me about his experience, projects, certifications, or how to contact him."
      ]
    },

    // ---------- Quick-start chips ----------
    {
      id: 'about_jc',
      patterns: [
        /^(tell me )?(about|abt) jc$/,
        /\bwho(s| is) jc\b/,
        /\btell me (about|abt) (jc|him)( please| pls)?$/,
        /\b(introduce|describe) (jc|him)$/,
        /\bwhat do(es)? (jc|he) do\b/,
        /\b(summary|overview|background) (of|on) (jc|him)\b/,
        /^(jc|his) background$/
      ],
      replies: [
        "JC (Engr. Jose Carlo David Ocampo) is a licensed Electronics Engineer from the Philippines. He graduated from Mapua University in 2025 and passed his PRC board exams in March 2026. He now works as an Application & Cloud Support Associate at Accenture Philippines, with earlier experience interning at Converge ICT Solutions and serving as Electronics Engineer for Mapua's Cardinal One team. Ask me for more on his certifications, projects, or experience anytime.",
        "JC is a licensed Electronics Engineer based in Metro Manila. He earned his degree from Mapua University in 2025 and passed his board exams in March 2026. He's currently an Application & Cloud Support Associate at Accenture Philippines, having previously interned at Converge ICT Solutions and worked as Electronics Engineer for Mapua's Cardinal One team. Happy to go deeper on any part of his background.",
        "JC is a licensed Electronics Engineer from the Philippines who graduated from Mapua University in 2025 and passed his board exams in March 2026. He's currently at Accenture Philippines as an Application & Cloud Support Associate, with earlier stops at Converge ICT Solutions and Mapua's Cardinal One team. Just ask if you want the details on any of that."
      ]
    },
    {
      id: 'open_to_work',
      patterns: [
        /\bopen (to|for) (work|opportunit|offers?|roles?|jobs?)/,
        /\b(is|iss) (he|jc) (available|hiring|looking|job hunting)\b/,
        /\b(looking|searching) for (a )?(job|work|role|opportunit)/,
        /\b(available|availability) (for|to) (work|hire|freelance|projects?|a role)\b/,
        /\b(accepting|taking) (freelance|projects?|clients?|offers?)\b/,
        /\bcan i hire (him|jc)\b/,
        /\bfreelanc/
      ],
      replies: [
        "JC is currently employed as an Application & Cloud Support Associate at Accenture Philippines, so he's not actively looking for other opportunities right now.",
        "Right now, JC is full-time at Accenture Philippines as an Application & Cloud Support Associate, so he isn't actively job hunting at the moment.",
        "He's currently employed at Accenture Philippines and isn't actively seeking new roles at this time. If you'd still like to connect, he's reachable at " + JC_EMAIL_ADDR + "."
      ]
    },
    {
      id: 'experience',
      patterns: [
        /\b(jc|his|work|job|professional|employment) (experience|history)\b/,
        /^experience$/,
        /\bwhat(s| is) (his|jc) experience\b/,
        /\bwhere (has|did) (he|jc) work(ed)?\b/,
        /\b(previous|past|former) (jobs?|roles?|work|employers?)\b/,
        /\bwork(ed)? experience\b/
      ],
      replies: [
        "JC is currently an Application & Cloud Support Associate at Accenture Philippines, a role he started in August 2026. Before that, he interned on the IT Helpdesk at Converge ICT Solutions for three months in 2025, and earlier still, he was the Electronics Engineer for Mapua University's Cardinal One team from 2023 to 2025.",
        "He's currently at Accenture Philippines as an Application & Cloud Support Associate, starting August 2026. Prior to that, he did a three month IT Helpdesk internship at Converge ICT Solutions in 2025, and before that, he was Electronics Engineer for Mapua's Cardinal One team from 2023 to 2025.",
        "JC's work history: Application & Cloud Support Associate at Accenture Philippines since August 2026, an IT Helpdesk internship at Converge ICT Solutions in 2025, and Electronics Engineer for Mapua University's Cardinal One team from 2023 to 2025."
      ]
    },

    // ---------- Career ----------
    {
      id: 'current_job',
      patterns: [
        /\bwhere (does|do) (he|jc) work\b/,
        /\bwhere (is|s) (he|jc) (working|employed)\b/,
        /\b(current|present) (job|role|position|work|employer|company)\b/,
        /\bwhat(s| is) (his|jc) (job|role|position|title)\b/,
        /\bwhat do(es)? (he|jc) do (now|currently|for (a )?(work|living))\b/,
        /\baccenture\b/
      ],
      replies: [
        "JC works at Accenture Philippines as an Application & Cloud Support Associate. He joined in August 2026, supporting enterprise applications and cloud environments.",
        "He's currently an Application & Cloud Support Associate at Accenture Philippines, a role he started in August 2026.",
        "Since August 2026, JC has been with Accenture Philippines as an Application & Cloud Support Associate, working on enterprise application and cloud support."
      ]
    },
    {
      id: 'internship',
      patterns: [
        /\bintern(ship|ed)?\b/,
        /\bconverge\b/,
        /\bojt\b/,
        /\bhelp ?desk\b/
      ],
      replies: [
        "JC interned at Converge ICT Solutions as an IT Helpdesk Intern for three months in 2025. He gained hands-on experience in enterprise network support and Level 1 IT operations.",
        "His internship was at Converge ICT Solutions in 2025, where he spent three months as an IT Helpdesk Intern handling enterprise network support and Level 1 IT operations.",
        "In 2025, JC completed a three month IT Helpdesk internship at Converge ICT Solutions, working on enterprise network support and Level 1 IT operations."
      ]
    },

    // ---------- Education & licenses ----------
    {
      id: 'education',
      patterns: [
        /\bwhere did (he|jc) (study|go to (school|college|university)|graduate)\b/,
        /\b(school|college|university|alma mater|education|degree|course|major|educational background)\b/,
        /\bmapua\b/,
        /\bwhen did (he|jc) graduate\b/,
        /\bwhat did (he|jc) (study|take)\b/
      ],
      replies: [
        "JC graduated from Mapua University in 2025 with a BS in Electronics Engineering, specializing in Advanced Internet Protocol Networking.",
        "He studied at Mapua University, earning a BS in Electronics Engineering in 2025. His specialization was Advanced Internet Protocol Networking.",
        "JC holds a BS in Electronics Engineering from Mapua University (2025), where he specialized in Advanced Internet Protocol Networking."
      ]
    },
    {
      id: 'license',
      patterns: [
        /\b(licensed|license|licence)\b/,
        /\bboard (exam|passer|examination)s?\b/,
        /\bprc\b/,
        /\bis (he|jc) (an? )?(registered |licensed )?(engineer|ece|ect)\b/,
        /\b(ece|ect) (board|exam|license)\b/,
        /\bengr\b/
      ],
      replies: [
        "Yes! JC passed both the Electronics Engineer and Electronics Technician licensure exams given by the Philippine Professional Regulation Commission (PRC) in March 2026. He holds both licenses.",
        "JC is a PRC-licensed Electronics Engineer and Electronics Technician. He passed both board exams in March 2026.",
        "He's licensed by the PRC as both an Electronics Engineer and an Electronics Technician, having passed both licensure exams in March 2026."
      ]
    },
    {
      id: 'electronics_engineering_license',
      patterns: [/\belectronics engineering license\b/, /\belectronics engineer license\b/, /\b(ece|electronics engineer)\b.*\blicense\b/],
      replies: ["JC holds a Philippine PRC Electronics Engineering License." ]
    },
    {
      id: 'electronics_technician_license',
      patterns: [/\belectronics technician license\b/, /\b(ect|electronics technician)\b.*\blicense\b/],
      replies: ["JC also holds a Philippine PRC Electronics Technician License."]
    },
    {
      id: 'network_fundamentals_certificate',
      patterns: [/\bnetwork fundamentals\b/],
      replies: ["JC's Cisco credential is Network Fundamentals, issued by Cisco Learning and Certifications."]
    },
    {
      id: 'ccna_enterprise_certificate',
      patterns: [/\bccna\b.*\benterprise networking\b/, /\benterprise networking\b.*\bccna\b/],
      replies: ["JC holds CCNA: Enterprise Networking, Security, and Automation from Cisco Networking Academy."]
    },
    {
      id: 'ccna_switching_certificate',
      patterns: [/\bccna\b.*\b(switching|routing|wireless)\b/, /\b(switching|routing|wireless)\b.*\bccna\b/],
      replies: ["JC holds CCNA: Switching, Routing, and Wireless Essentials from Cisco Networking Academy."]
    },
    {
      id: 'cybersecurity_foundations_certificate',
      patterns: [/\bfoundations of cybersecurity\b/, /\bcybersecurity certificate\b/],
      replies: ["JC's cybersecurity certificate is Foundations of Cybersecurity from Google."]
    },
    {
      id: 'google_cloud_certificate',
      patterns: [/\bgoogle cloud\b/, /\bgcp\b/],
      replies: [
        "JC's Google Cloud credential is Google Cloud Fundamentals, issued by Google Cloud Training Online. Use the button below to jump straight to its card.",
        "The certificate you're looking for is Google Cloud Fundamentals from Google Cloud Training Online. The button below opens its exact card.",
      ]
    },
    {
      id: 'certifications',
      patterns: [
        /\bcert(s|ification|ifications|ificate|ificates|ified)?\b/,
        /\bcredentials?\b/,
        /\bccna\b/,
        /\bcisco\b/,
        /\bgoogle cloud\b/,
        /\bgcp\b/,
        /\bcredly\b/,
        /\bbadges?\b/
      ],
      replies: [
        "Besides his PRC Electronics Engineer and Electronics Technician licenses, JC holds Cisco Network Fundamentals plus two CCNA courses (Switching, Routing, and Wireless Essentials, and Enterprise Networking, Security, and Automation), Google Cloud Fundamentals, and Foundations of Cybersecurity. The full list is on the Certifications page.",
        "JC's credentials include his PRC Electronics Engineer and Electronics Technician licenses, Cisco Network Fundamentals, CCNA: Switching, Routing, and Wireless Essentials, CCNA: Enterprise Networking, Security, and Automation, Google Cloud Fundamentals, and Foundations of Cybersecurity. You can see all of them on the Certifications page.",
        "His certifications span networking, cloud, and security: Cisco Network Fundamentals, two CCNA courses, Google Cloud Fundamentals, and Foundations of Cybersecurity, on top of his two PRC licenses. Check the Certifications page for the complete list."
      ]
    },

    // ---------- Projects ----------
    {
      id: 'projects',
      patterns: [
        /^projects?$/,
        /\b(his|jc|any|what|recent|notable|past) projects?\b/,
        /\bprojects? (has|did) (he|jc)\b/,
        /\bwhat (has|did) (he|jc) (built|build|made|make|created|create|worked on)\b/,
        /\bportfolio (work|pieces?|projects?)\b/
      ],
      replies: [
        "JC's projects include BusHop (a bus tracker for the Zambales Line with its own AI assistant, BusBoy), Mian (that's me, his AI portfolio assistant), Aguila (an energy-efficient vehicle built with Mapua's Cardinal One team for the Shell Eco-marathon), an IEEE-recognized thesis using a neural network to predict Lakatan banana shelf life from transport sensor data, and EEG exoskeleton research on brain-computer interfaces. Ask about any of them for more.",
        "A few highlights: BusHop, a map-based bus tracking app for the Zambales Line; Aguila, an energy-efficient vehicle for the Shell Eco-marathon with Mapua Cardinal One; his IEEE-recognized banana shelf-life neural network research; EEG exoskeleton (brain-computer interface) research; and Mian, the assistant you're talking to now. The Projects page has the full details.",
        "JC has built BusHop (a Zambales Line bus tracker with the BusBoy chatbot), Mian (this AI assistant), and the Aguila energy-efficient vehicle for the Shell Eco-marathon. On the research side, there's his IEEE-recognized banana shelf-life neural network and EEG exoskeleton work. Want details on any one of them?"
      ]
    },
    {
      id: 'project_bushop',
      patterns: [
        /\bbus ?hop\b/,
        /\bbus ?boy\b/,
        /\bbus (tracker|tracking|app)\b/,
        /\bzambales\b/
      ],
      replies: [
        "BusHop is a personal project by JC: a web app that tracks buses along the Zambales Line on a live map. You can set an origin and destination, see buses moving along the route, and check local weather. It also has its own AI assistant, BusBoy, that answers commuter questions. The current version is a demo with simulated buses. Try it at jcdcocampo.github.io/bushop.",
        "BusHop is JC's bus tracking web app for the Zambales Line. It shows buses on an interactive map, lets you plan a trip from your origin to your destination, displays the current weather, and includes BusBoy, an AI chatbot for route and fare questions. It currently runs as a demo with simulated bus data. You can open it at jcdcocampo.github.io/bushop.",
        "JC built BusHop, a map-based bus tracker for the Zambales Line, plus BusBoy, its built-in AI assistant (a sibling of mine!). It's a demo for now, using simulated buses, and it's live at jcdcocampo.github.io/bushop."
      ]
    },
    {
      id: 'project_aguila',
      patterns: [/\baguila\b/, /\beco ?-?marathon\b/, /\bshell\b/, /\bcardinal one\b/, /\b(eco|energy efficient|electric) (car|vehicle)\b/],
      replies: [
        "Aguila is an energy-efficient vehicle designed and built by Mapua University's Cardinal One team for the Shell Eco-marathon. JC was part of the team from 2023 to 2025, serving as Electronics Engineer.",
        "Aguila was Mapua Cardinal One's energy-efficient vehicle for the Shell Eco-marathon. JC worked on it as the team's Electronics Engineer between 2023 and 2025. See the Aguila page for more.",
        "JC was Electronics Engineer for Mapua's Cardinal One team (2023 to 2025), which designed and built Aguila, an energy-efficient vehicle for the Shell Eco-marathon."
      ]
    },
    {
      id: 'project_thesis',
      patterns: [/\bbananas?\b/, /\blakatan\b/, /\bshelf ?-?life\b/, /\bthesis\b/, /\bneural network\b/, /\bieee (paper|research|publication)\b/, /\b(his|jc) research\b/],
      replies: [
        "JC's banana project is his IEEE-published thesis, \"Feedforward Neural Network for Real-time Prediction of Lakatan Banana Shelf Life using Sensor Data from Transport Conditions.\" It uses transport sensor data to predict how long Lakatan bananas will stay fresh. I've added a button below to open the project page.",
        "The banana project is JC's thesis on predicting Lakatan banana shelf life from transport-condition sensor data. Its full title is \"Feedforward Neural Network for Real-time Prediction of Lakatan Banana Shelf Life using Sensor Data from Transport Conditions,\" and it was published in IEEE Xplore. You can open its project page below.",
        "JC's research project about bananas is his feedforward neural network thesis. It predicts Lakatan banana shelf life using sensor data gathered during transport. The project page is available from the button below."
      ]
    },
    {
      id: 'project_eeg',
      patterns: [/\beeg\b/, /\bexoskeleton\b/, /\bbrain ?-?computer\b/, /\bbci\b/],
      replies: [
        "JC's EEG exoskeleton project is brain-computer interface research, exploring how EEG signals can be used to control an exoskeleton. You'll find the full write-up on the EEG Exoskeleton project page.",
        "The EEG exoskeleton is one of JC's research projects in brain-computer interfaces (BCI). Check its project page for the details.",
        "That's JC's brain-computer interface research: using EEG signals with an exoskeleton. The EEG Exoskeleton page has more."
      ]
    },
    {
      id: 'project_mian',
      patterns: [
        /\bhow (was|were) (you|u|mian) (made|built|created)\b/,
        /\b(tech|technology|stack) (behind|of|for) (you|u|mian)\b/,
        /\bmian project\b/,
        /\bwhat (model|llm|ai) (are|r) (you|u)\b/
      ],
      replies: [
        "JC built me in April 2026 as a personal project. I'm a JavaScript chat widget on his site that talks to an AI backend running on Cloudflare Workers. Common questions like this one are answered instantly from a built-in cache. The Mian project page has more on how I work.",
        "I'm a personal project JC created in April 2026: a front-end chat widget written in JavaScript, connected to an AI backend hosted on Cloudflare Workers. See the Mian project page for the full story.",
        "JC made me in April 2026. The chat interface is plain JavaScript on his site, and my answers come from an AI backend on Cloudflare Workers, with frequent questions served from a local cache for speed."
      ]
    },

    // ---------- Personal / profile ----------
    {
      id: 'location',
      patterns: [
        /\bwhere (is|s) (he|jc) (from|based|located|living)\b/,
        /\bwhere do(es)? (he|jc) live\b/,
        /\b(his|jc) (location|hometown|city)\b/,
        /\bwhat country\b/
      ],
      replies: [
        "JC is based in Metro Manila, Philippines.",
        "He's located in Metro Manila, Philippines.",
        "JC lives and works in Metro Manila, Philippines."
      ]
    },
    {
      id: 'full_name',
      patterns: [/\b(full|real|complete) name\b/, /\bwhat(s| is) (his|jc) name\b/, /\bwhat does jc stand for\b/],
      replies: [
        "JC's full name is Jose Carlo David Ocampo. Professionally, he goes by Engr. Jose Carlo David Ocampo.",
        "JC stands for Jose Carlo. His full name is Jose Carlo David Ocampo.",
        "His full name is Engr. Jose Carlo David Ocampo, but most people call him JC."
      ]
    },
    {
      id: 'skills',
      patterns: [
        /\b(his|jc|technical|tech|key|main|what) skills?\b/,
        /\bskill ?set\b/,
        /\b(what|which) (is|are) (he|jc) good at\b/,
        /\b(tech|technology) stack\b/,
        /\bexpertise\b/,
        /\bspeciali[sz](e|es|ation|ty)\b/
      ],
      replies: [
        "JC's strengths are in networking (he specialized in Advanced Internet Protocol Networking and completed Cisco CCNA coursework), cloud and application support (Google Cloud Fundamentals, plus his role at Accenture), IT support, cybersecurity fundamentals, electronics engineering, and applied neural networks from his IEEE-recognized thesis.",
        "His skill set spans networking and Cisco CCNA topics, cloud and enterprise application support, Level 1 IT operations, cybersecurity foundations, and electronics engineering. He also has hands-on experience with neural networks for sensor-data prediction.",
        "JC combines an electronics engineering background with networking (Advanced IP Networking specialization, CCNA coursework), cloud support (Google Cloud, Accenture), IT helpdesk operations, and machine learning research."
      ]
    },
    {
      id: 'interests',
      patterns: [
        /\b(his|jc) (interests?|hobbies|passions?)\b/,
        /\bwhat (is|s|are) (he|jc) (interested in|passionate about|into)\b/,
        /\bhobb(y|ies)\b/,
        /\bwhat does (he|jc) (like|enjoy)\b/
      ],
      replies: [
        "Beyond engineering, JC is passionate about cloud computing, artificial intelligence, and finance. He's especially interested in where technology and financial markets meet.",
        "JC's interests include cloud computing, AI, and finance, particularly the intersection of technology and financial markets.",
        "He's into cloud computing, artificial intelligence, and finance, and he likes exploring how tech and financial markets overlap."
      ]
    },
    {
      id: 'ieee_student_role',
      patterns: [/\bfinance committee head\b/, /\bieee.{0,40}(role|position|finance|committee)\b/, /\b(role|position|finance|committee).{0,40}\bieee\b/],
      replies: ["JC served as Finance Committee Head of the IEEE Mapúa University Student Branch."]
    },
    {
      id: 'iecep_student_role',
      patterns: [/\b(treasurer|board auditor)\b/, /\biecep.{0,40}(role|position|treasurer|auditor)\b/, /\b(role|position|treasurer|auditor).{0,40}\biecep\b/],
      replies: ["JC served as Treasurer and Board Auditor of the IECEP Mapúa University Student Chapter."]
    },
    {
      id: 'leadership',
      patterns: [
        /\bleadership\b/,
        /\b(org|orgs|organi[sz]ations?|clubs?|affiliations?|memberships?|extracurricular)\b/,
        /\biecep\b/,
        /\bieee\b/,
        /\bstudent (council|chapter|branch)\b/
      ],
      replies: [
        "In college, JC served as Treasurer and Board Auditor of IECEP Mapua University Student Chapter, Finance Committee Head of IEEE Mapua University Student Branch, and Electronics Engineer for Mapua Cardinal One. He's also a member of the Institute of Electronics Engineers of the Philippines (IECEP).",
        "JC's leadership roles include Treasurer/Board Auditor at IECEP – MUSC, Finance Committee Head at IEEE – MUSB, and Electronics Engineer for Mapua Cardinal One. Professionally, he's an IECEP member.",
        "He held finance and engineering roles in student organizations: Treasurer/Board Auditor for IECEP – MUSC, Finance Committee Head for IEEE – MUSB, and Electronics Engineer for Mapua Cardinal One. He's currently an IECEP member."
      ]
    },
    {
      id: 'socials',
      patterns: [
        /\blinked ?in\b/,
        /\bgit ?hub\b/,
        /\bsocials?( media| links)?\b/,
        /\b(resume|resumé|résumé|cv)\b/
      ],
      replies: [
        "You can find JC on LinkedIn (linkedin.com/in/jcdcocampo), GitHub (github.com/jcdcocampo), and Credly (credly.com/users/jcdcocampo). For his résumé, email him at " + JC_EMAIL_ADDR + ".",
        "JC's profiles: LinkedIn at linkedin.com/in/jcdcocampo, GitHub at github.com/jcdcocampo, and Credly at credly.com/users/jcdcocampo. If you need his résumé, reach him at " + JC_EMAIL_ADDR + ".",
        "He's on LinkedIn (jcdcocampo), GitHub (jcdcocampo), and Credly (jcdcocampo). The links are also in the Social Links section of the home page. For a résumé, just email " + JC_EMAIL_ADDR + "."
      ]
    }
  ];

  // Email/contact is checked FIRST and wins even if another intent also
  // matches ("how do I contact him about a job?" → just give the email).
  const EMAIL_INTENT = /(e-?mail|gmail|contact|get in touch|reach (?:out|him|jc|you)|how (?:can|do|to|would) i .*(?:contact|reach|email|message|connect)|connect with (?:him|jc)|his (?:email|contact)|your (?:email|contact)|mail address|hire (?:him|jc)|work with (?:him|jc))/i;

  const EMAIL_REPLIES = [
    "You can reach JC directly at " + JC_EMAIL_ADDR + ". Use the buttons below to copy the address or open your mail app.",
    "The best way to reach JC is by email at " + JC_EMAIL_ADDR + ". Tap below to copy it or start a message.",
    "JC's email is " + JC_EMAIL_ADDR + " — feel free to copy it or send a message straight away using the buttons below."
  ];

  // Phrases that mean "I want more than the canned answer" → always LLM.
  const FAQ_BYPASS = /\b(more detail|in detail|elaborate|explain (more|further)|go deeper|why|compare|versus|vs|difference between|opinion|think about|write|draft|summari[sz]e|translate|pros and cons|awards?|recognition|team members?|how it is built|how it was built|what it does)\b|\bwhat (does|can) .{1,40} do\b|\bhow (is|was) .{1,40} built\b|\bseason \d{4}\b|\b(experience|skills?|background|good) (with|in|using|at) \w|\bdoes (he|jc) (know|use|have experience)\b/;

  const FAQ_BY_ID = {};
  FAQ_INTENTS.forEach(function (it) { FAQ_BY_ID[it.id] = it; });

  function normalizeQuery(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/\b(engr\.?\s+)?jose\s+carlo(\s+david)?(\s+ocampo)?\b/g, 'jc')
      .replace(/\bocampo\b/g, 'jc')
      .replace(/\bj\.?\s?c\.?(?=\s|'|$)/g, 'jc')
      .replace(/\bjc's\b/g, 'jc')
      .replace(/'s\b/g, 's')              // "what's" → "whats", "he's" → "hes"
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Same as normalizeQuery, plus drops a leading greeting / filler so
  // "hi mian, where does he work" still matches the current_job intent.
  function stripLead(q) {
    return q
      .replace(/^(hi+|hello+|hey+|yo|good (morning|afternoon|evening))( there)?( mian)?\s+(?=\S)/, '')
      .replace(/^(mian|please|pls|can you tell me|could you tell me|do you know|i want to know|i wanna know)\s+/, '')
      .trim();
  }

  // Returns { id, replies } for exactly one matching intent, or null.
  function matchFaq(rawText) {
    const raw = String(rawText || '').trim();
    if (!raw || raw.length > FAQ_MAX_LEN) return null;
    if (EMAIL_INTENT.test(raw)) return { id: 'email', replies: EMAIL_REPLIES };

    const base = normalizeQuery(raw);
    if (!base || FAQ_BYPASS.test(base)) return null;

    // Whole-message intents (greetings, thanks, bye) are tested on the
    // untrimmed text, so "hello mian" is a greeting but "hi, where does
    // he work?" is not.
    for (const it of FAQ_INTENTS) {
      if (it.whole && it.patterns.some(function (re) { return re.test(base); })) {
        return { id: it.id, replies: it.replies };
      }
    }
    const q = stripLead(base);
    if (!q) return null;
    // Two or more real questions in one message → let the LLM combine them.
    if ((raw.match(/\?/g) || []).length > 1) return null;

    // Resolve named items before broad intents such as "projects" or
    // "certifications", so a focused question gets a focused answer.
    const specificDetailIntentIds = [
      'ieee_student_role', 'iecep_student_role',
      'electronics_engineering_license', 'electronics_technician_license',
      'network_fundamentals_certificate', 'ccna_enterprise_certificate',
      'ccna_switching_certificate', 'google_cloud_certificate', 'cybersecurity_foundations_certificate',
      'project_thesis', 'project_bushop', 'project_aguila', 'project_eeg', 'project_mian'
    ];
    const specificDetailMatches = [];
    for (const id of specificDetailIntentIds) {
      const intent = FAQ_BY_ID[id];
      if (intent && intent.patterns.some(function (re) { return re.test(q); })) {
        specificDetailMatches.push(intent);
      }
    }
    if (specificDetailMatches.length === 1) {
      const intent = specificDetailMatches[0];
      return { id: intent.id, replies: intent.replies };
    }
    if (specificDetailMatches.length > 1) return null;

    const hits = [];
    for (const it of FAQ_INTENTS) {
      if (it.whole) continue;
      if (it.patterns.some(function (re) { return re.test(q); })) hits.push(it);
    }
    if (hits.length !== 1) return null;
    const it = hits[0];
    return { id: it.id, replies: it.replies };
  }

  // Random variant, never the same as the last one used for that intent.
  const _lastVariant = {};
  function pickVariant(id, replies) {
    if (!replies || !replies.length) return '';
    let i = Math.floor(Math.random() * replies.length);
    if (replies.length > 1 && i === _lastVariant[id]) i = (i + 1) % replies.length;
    _lastVariant[id] = i;
    return replies[i];
  }

  // Quick-start chips map straight onto FAQ intents.
  const CHIP_INTENTS = {
    'Tell me about JC': 'about_jc',
    'Is he open to work?': 'open_to_work',
    "What's his experience?": 'experience'
  };

  // Console helper for testing patterns: __mianMatch("where did he study")
  window.__mianMatch = function (t) {
    const m = matchFaq(t);
    return m ? { intent: m.id, normalized: normalizeQuery(t) } : { intent: null, normalized: normalizeQuery(t), note: 'goes to LLM' };
  };
  // ================== END MIAN FAQ CACHE ==================
  if (window.__mianChatbotLoaded) return;
  window.__mianChatbotLoaded = true;

  // -------------------- STYLES --------------------
  const css = `
    /* ── Siri-style outer border glow ────────────────────────────
       Sibling div behind the panel (z-index 9998, panel is 9999).
       Colors match the full Siri logo palette:
         top-left     → orange / warm yellow
         left edge    → orange fading to yellow-white
         bottom-left  → cyan / sky blue
         top-right    → hot pink / red-pink
         right edge   → magenta / pink
         bottom-right → violet / lavender                        */

    @property --cb-angle {
      syntax: "<angle>";
      initial-value: -45deg;
      inherits: false;
    }
    /* Slow colour rotation */
    @keyframes cbGlowRotate {
      from { --cb-angle: -45deg; }
      to   { --cb-angle: 315deg; }
    }
    /* Breathing pulse — filter only, no opacity */
    @keyframes cbGlowPulse {
      0%   { filter: blur(18px) brightness(1);    }
      30%  { filter: blur(18px) brightness(1.18); }
      60%  { filter: blur(18px) brightness(0.84); }
      100% { filter: blur(18px) brightness(1);    }
    }
    /* Fade in — opacity only */
    @keyframes cbGlowFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    /* Fade out — opacity only, leaves filter/rotation untouched */
    @keyframes cbGlowFadeOut {
      from { opacity: 1; }
      to   { opacity: 0; }
    }

    .cb-siri-ring {
      position: fixed;
      bottom: calc(32px + 60px + 16px);
      right: 32px;
      left: auto;
      transform: none;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 140px);
      border-radius: 18px;
      z-index: 9998;
      pointer-events: none;
      background: conic-gradient(
        from var(--cb-angle, -45deg) at 50% 50%,
        #ff8c00  0%,
        #ff3c50  12.5%,
        #ff2d55  25%,
        #e8187a  37.5%,
        #9b59f5  50%,
        #4060ff  62.5%,
        #00c2e0  75%,
        #ffb700  87.5%,
        #ff8c00  100%
      );
      filter: blur(18px);
      opacity: 0;
    }
    /* Open: fade in over 1.5s, rotate + pulse forever.
       opacity:1 on the class so forwards-fill is not needed
       and the fade-out transition can still override it.    */
    .cb-siri-ring.cb-glow-open {
      opacity: 1;
      animation:
        cbGlowFadeIn   1.5s ease        0s 1 normal none,
        cbGlowRotate   20s  linear      0s infinite,
        cbGlowPulse    3.5s ease-in-out 0s infinite;
    }
    /* Idle fade-out: only animates opacity, rotation keeps running via cb-glow-open */
    .cb-siri-ring.cb-glow-fading {
      animation:
        cbGlowFadeOut  2.5s ease        forwards,
        cbGlowRotate   20s  linear      0s infinite,
        cbGlowPulse    3.5s ease-in-out 0s infinite;
    }
    /* Wake: fade back in, rotation was never stopped */
    .cb-siri-ring.cb-glow-returning {
      animation:
        cbGlowFadeIn   1.5s ease        forwards,
        cbGlowRotate   20s  linear      0s infinite,
        cbGlowPulse    3.5s ease-in-out 0s infinite;
    }

    @media (max-width: 480px) {
      .cb-siri-ring {
        bottom: calc(40px + 60px + 16px);
        left: 8px;
        right: 8px;
        width: auto;
        max-width: none;
        height: calc(100dvh - 140px);
        max-height: none;
        transform: translateX(0);
        border-radius: 16px;
      }
    }

    /* Floating action button */
    .cb-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--accent, #007aff);
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      /* iOS26 spring open: expands from bottom with subtle overshoot */
      transition:
        transform 0.52s cubic-bezier(0.34, 1.4, 0.64, 1),
        opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
        box-shadow 0.3s ease;
      font-family: var(--sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
      padding: 0;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
    }
    .cb-fab:hover  { transform: scale(1.06); box-shadow: 0 6px 22px rgba(0,0,0,0.28); }
    .cb-fab:active { transform: scale(0.94); }
    .cb-fab *      { pointer-events: none; }
    .cb-fab svg    { width: 32px; height: 32px; display: block; }
    .cb-fab.cb-hidden { opacity: 0; transform: scale(0.6); pointer-events: none; }

    /* Panel */
    .cb-panel {
      position: fixed;
      bottom: calc(32px + 60px + 16px);
      right: 32px;
      left: auto;
      transform-origin: 50% 50%;
      /* The panel grows from the Mian button, like a compact app presentation. */
      transform: scale(0.12, 0.1);
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 140px);
      background: var(--card, #ffffff);
      --corner-radius: 32px;
      border-radius: 32px;
      corner-shape: squircle;
      box-shadow: none;
      filter: drop-shadow(0 10px 24px rgba(0,0,0,.2));
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      font-family: var(--sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
      color: var(--text-primary, #1c1c1e);
      opacity: 0;
      pointer-events: none;
      transition:
        transform 0.46s cubic-bezier(0.2, 0.78, 0.24, 1),
        opacity 0.18s ease-out,
        filter 0.32s ease-out;
    }
    .cb-panel.cb-open {
      opacity: 1;
      transform: scale(1);
      filter: drop-shadow(0 16px 36px rgba(0,0,0,.22));
      pointer-events: auto;
    }
    .cb-panel { filter: drop-shadow(0 8px 20px rgba(0,0,0,.12)); }
    @media (prefers-reduced-motion: reduce) {
      .cb-panel { transition-duration: 0.01ms; }
    }

    /* Desktop/tablet: panel above Mian (bottom-right) */
    @media (min-width: 768px) {
      .cb-panel {
        left: auto;
        right: 32px;
        bottom: calc(32px + 60px + 16px);
        transform: scale(0.12, 0.1);
      }
      .cb-siri-ring {
        left: auto;
        right: 32px;
        bottom: calc(32px + 60px + 16px);
        transform: none;
      }
    }

    /* Header */
    .cb-close svg { display: none; }
    .cb-close::after {
      content: '×';
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      line-height: 1;
      pointer-events: none;
    }
    .cb-header {
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--separator, #e5e5ea);
      flex-shrink: 0;
    }
    .cb-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      border: none;
      transition: background 0.4s ease, transform 0.18s ease, box-shadow 0.18s ease;
    }
    .cb-avatar:hover  { transform: scale(1.05); box-shadow: 0 2px 10px rgba(0,0,0,0.18); }
    .cb-avatar:active { transform: scale(0.96); }
    .cb-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .cb-header-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .cb-header-name {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.2px;
      line-height: 1.2;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .cb-header-subtitle {
      font-size: 12px;
      color: var(--text-secondary, #636366);
      line-height: 1.2;
    }
    .cb-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34c759;
      display: inline-block;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(52, 199, 89, 0.18);
    }
    .cb-close {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ff5f57;
      color: #fff;
      flex-shrink: 0;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-right: 8px;
      top: 2px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      transition: background 0.15s ease, transform 0.15s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .cb-close:hover  { background: #ff3b30 !important; }
    .cb-close:active { transform: scale(0.88); }
    .cb-close svg { width: 16px; height: 16px; }

    /* Messages */
    .cb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
      overscroll-behavior: contain; /* stop scroll from chaining into the page behind the panel */
      -webkit-overflow-scrolling: touch;
    }
    .cb-messages::-webkit-scrollbar { width: 6px; }
    .cb-messages::-webkit-scrollbar-thumb {
      background: var(--text-tertiary, #aeaeb2);
      border-radius: 3px;
    }

    .cb-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.45;
      word-wrap: break-word;
      animation: cbFadeIn 0.25s ease;
    }
    .cb-msg strong, .cb-msg b { font-weight: 400; }
    @keyframes cbFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Bot row: small avatar + bubble */
    .cb-bot-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      align-self: flex-start;
      max-width: 90%;
      animation: cbFadeIn 0.25s ease;
    }
    .cb-bot-row .cb-msg { animation: none; max-width: 100%; }
    .cb-msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      overflow: hidden;
      transition: opacity 0.18s ease, background 0.4s ease;
    }
    .cb-msg-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .cb-msg-avatar.cb-avatar-hidden { visibility: hidden; }

    .cb-msg-bot {
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .cb-msg-bot a {
      color: var(--accent, #007aff);
      text-decoration: underline;
      text-underline-offset: 2px;
      word-break: break-word;
    }
    .cb-msg-bot a:hover { opacity: 0.8; }
    .cb-msg-user {
      background: var(--accent, #007aff);
      color: #fff;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }
    .cb-msg-error {
      background: #ffefef;
      color: #c0392b;
      border: 1px solid #f5c6c6;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }

    .cb-email-row {
      display: flex;
      gap: 8px;
      align-self: flex-start;
      margin-left: 36px; /* aligns under the bot bubble, past the avatar */
      animation: cbFadeIn 0.25s ease;
    }
    .cb-email-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid var(--separator, #e5e5ea);
      background: var(--sub-card, #f9f9fb);
      color: var(--text-secondary, #636366);
      font-size: 12.5px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    .cb-email-btn:hover {
      background: var(--sub-hover, #ececf2);
      color: var(--text-primary, #1c1c1e);
      border-color: var(--text-tertiary, #aeaeb2);
    }
    .cb-email-btn:active { transform: scale(0.97); }
    .cb-email-btn svg { flex-shrink: 0; }
    .cb-email-btn.cb-retry-btn:disabled { opacity: 0.5; cursor: default; }
    .cb-email-btn.cb-email-copied {
      background: var(--accent, #007aff);
      color: #fff;
      border-color: var(--accent, #007aff);
    }

    .cb-typing { display: inline-flex; gap: 4px; align-items: center; padding: 4px 0; }
    .cb-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--text-tertiary, #aeaeb2);
      animation: cbBounce 1.2s infinite ease-in-out;
    }
    .cb-typing span:nth-child(2) { animation-delay: 0.15s; }
    .cb-typing span:nth-child(3) { animation-delay: 0.30s; }
    @keyframes cbBounce {
      0%, 60%, 100% { transform: translateY(0);    opacity: 0.5; }
      30%           { transform: translateY(-5px); opacity: 1;   }
    }

    /* Anticipation text under typing bubble */
    .cb-anticipation {
      font-size: 11px;
      color: var(--text-tertiary, #aeaeb2);
      margin-top: 4px;
      font-style: italic;
      min-height: 16px;
      transition: opacity 0.4s ease;
    }

    /* Quick-start chips */
    .cb-chips {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 7px;
      padding: 4px 16px 8px;
    }
    .cb-chip {
      display: inline-flex;
      align-items: center;
      background: var(--sub-card, #f0f0f5);
      color: var(--accent, #007aff);
      border: 1.5px solid var(--accent, #007aff);
      border-radius: 980px;
      padding: 5px 13px;
      font-size: 12.5px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      opacity: 0;
      transform: translateX(20px);
      transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .cb-chip.cb-chip-in {
      animation: cbChipSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .cb-chip:hover  { background: var(--accent, #007aff); color: #fff; box-shadow: 0 2px 8px rgba(0,122,255,0.22); }
    .cb-chip:active { transform: scale(0.95); }
    .cb-chip.cb-chip-gone { display: none; }
    .cb-navigation-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      align-self: flex-start;
      margin: 0 16px 2px 36px;
      animation: cbFadeIn 0.25s ease;
    }
    .cb-navigation-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--separator, #e5e5ea);
      border-radius: 999px;
      padding: 6px 12px;
      background: var(--sub-card, #f9f9fb);
      color: var(--text-secondary, #636366);
      font-family: inherit;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      opacity: 1;
      transform: none;
      animation: none;
      transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .cb-navigation-action:hover {
      background: var(--sub-hover, #ececf2);
      border-color: var(--text-tertiary, #aeaeb2);
      color: var(--text-primary, #1c1c1e);
    }
    .cb-navigation-action:focus-visible { outline: 2px solid var(--accent, #007aff); outline-offset: 2px; }
    @keyframes cbChipSlideIn {
      to { opacity: 1; transform: translateX(0); }
    }

    /* Input */
    .cb-input-area {
      border-top: 1px solid var(--separator, #e5e5ea);
      padding: 10px 12px 8px;
      flex-shrink: 0;
      background: var(--card, #ffffff);
    }
    .cb-input-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: var(--sub-card, #f0f0f5);
      border-radius: 20px;
      padding: 6px 6px 6px 14px;
    }
    .cb-textarea {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      resize: none;
      font-family: inherit;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.4;
      color: var(--text-primary, #1c1c1e);
      max-height: 100px;
      min-height: 22px;
      padding: 4px 0;
    }
    .cb-textarea::placeholder { color: var(--text-tertiary, #aeaeb2); font-weight: 400; }
    /* iOS Safari zooms the page when focusing any field under 16px.
       Use 16px on phones / touch screens so opening Mian never zooms. */
    @media (max-width: 767px), (pointer: coarse) {
      .cb-textarea { font-size: 16px; line-height: 1.35; }
    }
    .cb-send {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent, #007aff);
      color: #fff;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.18s ease, transform 0.18s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .cb-send:hover:not(:disabled)  { transform: scale(1.05); }
    .cb-send:active:not(:disabled) { transform: scale(0.92); }
    .cb-send:disabled { opacity: 0.4; cursor: not-allowed; }
    .cb-send svg { width: 16px; height: 16px; }

    .cb-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 4px 0;
      font-size: 11px;
      color: var(--text-tertiary, #aeaeb2);
      gap: 12px;
    }
    .cb-disclaimer-inline { flex: 1; min-width: 0; }
    .cb-counter.cb-near-limit { color: #ff9500; }
    .cb-counter.cb-at-limit   { color: var(--red, #ff3b30); }

    /* ----- ID Card popup (shown when header avatar is clicked) ----- */
    .cb-card-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      align-items: safe center;
      justify-content: safe center;
      padding: 20px;
      overflow-y: auto;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s ease;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .cb-card-overlay.cb-open {
      opacity: 1;
      pointer-events: auto;
    }
    .cb-card {
      background: var(--card, #ffffff);
      color: var(--text-primary, #1c1c1e);
      --corner-radius: 32px;
      border-radius: 32px;
      corner-shape: squircle;
      box-shadow: none;
      filter: drop-shadow(0 20px 34px rgba(0,0,0,.3));
      padding: 36px 28px 28px;
      width: 100%;
      max-width: 420px;
      text-align: center;
      position: relative;
      flex: 0 0 auto;
      transform: scale(0.92);
      transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: var(--sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
    }
    .cb-card-overlay.cb-open .cb-card { transform: scale(1); }

    .cb-card-close {
      background: #ff3b30 !important; color: #fff !important;
      position: absolute;
      top: 18px;
      right: 18px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.18s ease, transform 0.18s ease;
    }
    .cb-card-close:hover  { background: #e6342b !important; }
    .cb-card-close:active { transform: scale(0.92); }
    .cb-card-close svg { width: 11px; height: 11px; }

    .cb-card-avatar {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      margin: 0 auto 22px;
      overflow: hidden;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 72px;
      font-weight: 700;
      box-shadow: 0 4px 18px rgba(0,0,0,0.18);
    }
    .cb-card-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .cb-card-name {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.4px;
      margin-bottom: 4px;
    }
    .cb-card-role {
      font-size: 15px;
      color: var(--text-secondary, #636366);
    }
    .cb-card-dedication {
      font-size: 12px;
      color: var(--text-tertiary, #aeaeb2);
      line-height: 1.5;
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid var(--separator, #e5e5ea);
      font-style: italic;
    }

    /* Mobile */
    @media (max-width: 480px) {
      .cb-panel {
        width: calc(100vw - 16px);
        height: calc(100dvh - 140px);
        bottom: calc(40px + 60px + 16px);
        left: 8px;
        right: 8px;
        max-width: none;
        transform: scale(0.12, 0.1);
      }
      .cb-fab { bottom: 16px; right: 16px; width: 56px; height: 56px; }
      .cb-fab svg { width: 30px; height: 30px; }

      .cb-avatar { width: 44px; height: 44px; font-size: 16px; }

      .cb-card { max-width: 360px; padding: 42px 24px 30px; }
      .cb-card-avatar { width: min(240px, 72vw); height: min(240px, 72vw); font-size: 56px; margin-bottom: 20px; }
      .cb-card-name { font-size: 22px; }
      .cb-card-role { font-size: 14px; }
      .cb-card-dedication { font-size: 11.5px; }
    }
  `;

  // -------------------- HELPERS --------------------
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'cb-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Strip basic markdown that some models leak into responses.
  function stripMarkdown(s) {
    if (!s) return s;
    return String(s)
      .replace(/\*{3}([^*]+?)\*{3}/g, '$1')
      .replace(/_{3}([^_]+?)_{3}/g, '$1')
      .replace(/\*{2}([^*]+?)\*{2}/g, '$1')
      .replace(/_{2}([^_]+?)_{2}/g, '$1')
      .replace(/(^|[\s(])\*([^\s*][^*]*?[^\s*]|\S)\*(?=[\s).,!?;:]|$)/g, '$1$2')
      .replace(/(^|[\s(])_([^\s_][^_]*?[^\s_]|\S)_(?=[\s).,!?;:]|$)/g, '$1$2')
      .replace(/`([^`]+?)`/g, '$1')
      .replace(/~~([^~]+?)~~/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/  +/g, ' ');
  }

  // -------------------- SIRI GLOW MANAGER --------------------
  const IDLE_MS = 10000;

  const glowManager = (function () {
    let ring = null;
    let idleTimer = null;
    let paused = false;
    let idleStarted = false;

    // Called once after createUI — hands the pre-mounted ring element over
    function init(ringEl) {
      ring = ringEl;
    }

    // Called on panel open — keyframe always starts at opacity:0, no flicker possible
    function show() {
      if (!ring) return;
      // Strip all state classes and force animation reset
      ring.classList.remove('cb-glow-open', 'cb-glow-fading', 'cb-glow-returning');
      void ring.offsetWidth; // reflow to reset animation
      ring.classList.add('cb-glow-open');
    }

    // Called on panel close — revert to hidden, reset all state
    function hide() {
      if (!ring) return;
      clearTimeout(idleTimer);
      idleStarted = false;
      paused = false;
      ring.classList.remove('cb-glow-open', 'cb-glow-returning', 'cb-glow-fading');
    }

    // Called when user sends — arms idle clock, wakes glow if it faded
    function activate() {
      if (!ring) return;
      idleStarted = true;
      clearTimeout(idleTimer);

      if (ring.classList.contains('cb-glow-fading')) {
        ring.classList.remove('cb-glow-fading');
        ring.classList.add('cb-glow-returning');
        setTimeout(() => {
          if (ring && ring.classList.contains('cb-glow-returning')) {
            ring.classList.remove('cb-glow-returning');
            ring.classList.add('cb-glow-open');
          }
        }, 2550);
      }

      if (!paused) _scheduleIdle();
    }

    function _scheduleIdle() {
      clearTimeout(idleTimer);
      if (!idleStarted) return;
      idleTimer = setTimeout(_fadeOut, IDLE_MS);
    }

    function pauseIdle() {
      paused = true;
      clearTimeout(idleTimer);
    }

    function resumeIdle() {
      paused = false;
      _scheduleIdle();
    }

    function _fadeOut() {
      if (!ring) return;
      ring.classList.remove('cb-glow-open', 'cb-glow-returning');
      ring.classList.add('cb-glow-fading');
    }

    return { init, show, hide, activate, pauseIdle, resumeIdle };
  })();

  const IMESSAGE_ICON = `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#ffffff" d="M16 5.2c-7 0-12.5 4.6-12.5 10.6 0 3.4 1.8 6.5 4.7 8.5.2.2.3.4.3.7 0 .8-.7 2.3-1.4 3.3-.2.3 0 .7.4.6 2.4-.4 4.5-1.4 5.7-2.1.2-.1.5-.2.8-.1 1.3.3 2.7.5 4 .5 7 0 12.5-4.6 12.5-10.6S23 5.2 16 5.2z"/>
    </svg>
  `;

  const CLOSE_ICON = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;

  // Build an <img> element for an avatar container programmatically.
  // This avoids inline onerror attributes, which can be blocked by strict CSPs.
  function buildAvatarImg(alt) {
    if (!CONFIG.avatarUrl) return null;
    const img = document.createElement('img');
    img.src = CONFIG.avatarUrl;
    img.alt = alt || CONFIG.botName;
    img.onerror = function () {
      // Replace broken image with text fallback without touching innerHTML.
      const fallback = document.createTextNode('M');
      if (img.parentNode) img.parentNode.replaceChild(fallback, img);
    };
    return img;
  }

  // Populate an avatar container element with either an img or a text fallback.
  function populateAvatar(container, alt) {
    container.textContent = '';
    const img = buildAvatarImg(alt);
    if (img) {
      container.appendChild(img);
    } else {
      container.textContent = 'M';
    }
  }

  // -------------------- DOM --------------------
  function createUI() {
    // ── FAB ──────────────────────────────────────────────────────
    const fab = document.createElement('button');
    fab.className = 'cb-fab';
    fab.setAttribute('aria-label', 'Open chat with Mian');
    fab.style.display = 'none'; // nav Mian is the trigger
    fab.innerHTML = IMESSAGE_ICON;

    // ── Panel ────────────────────────────────────────────────────
    // Built entirely with DOM APIs — no innerHTML with user-derived
    // values, so no risk of HTML injection from config fields.
    const panel = document.createElement('div');
    panel.className = 'cb-panel squircle-card';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', CONFIG.botName);
    panel.setAttribute('data-page-swipe-ignore', '');

    // Header
    const header = document.createElement('div');
    header.className = 'cb-header';

    const avatarBtn = document.createElement('button');
    avatarBtn.className = 'cb-avatar';
    avatarBtn.type = 'button';
    avatarBtn.setAttribute('aria-label', 'View ' + CONFIG.botName + "'s profile card");
    populateAvatar(avatarBtn, CONFIG.botName);

    const headerInfo = document.createElement('div');
    headerInfo.className = 'cb-header-info';

    const headerName = document.createElement('div');
    headerName.className = 'cb-header-name';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = CONFIG.botName;
    const statusDot = document.createElement('span');
    statusDot.className = 'cb-status-dot';
    statusDot.setAttribute('aria-label', 'Online');
    headerName.appendChild(nameSpan);
    headerName.appendChild(statusDot);

    const headerSubtitle = document.createElement('div');
    headerSubtitle.className = 'cb-header-subtitle';
    headerSubtitle.textContent = CONFIG.botSubtitle;

    headerInfo.appendChild(headerName);
    headerInfo.appendChild(headerSubtitle);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cb-close';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.innerHTML = CLOSE_ICON; // SVG only — no user data

    header.appendChild(avatarBtn);
    header.appendChild(headerInfo);
    header.appendChild(closeBtn);

    // Messages area
    const messagesEl = document.createElement('div');
    messagesEl.className = 'cb-messages';
    messagesEl.setAttribute('role', 'log');
    messagesEl.setAttribute('aria-live', 'polite');

    // Chips
    const chipsRow = document.createElement('div');
    chipsRow.className = 'cb-chips';
    chipsRow.id = 'cb-chips-row';
    const CHIPS = ['Tell me about JC', 'Is he open to work?', "What's his experience?"];
    CHIPS.forEach(label => {
      const chip = document.createElement('button');
      chip.className = 'cb-chip';
      chip.type = 'button';
      chip.textContent = label; // textContent — safe
      chipsRow.appendChild(chip);
    });

    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'cb-input-area';

    const inputRow = document.createElement('div');
    inputRow.className = 'cb-input-row';

    const textarea = document.createElement('textarea');
    textarea.className = 'cb-textarea';
    textarea.rows = 1;
    textarea.placeholder = 'Ask about JC…';
    textarea.maxLength = CONFIG.maxChars;

    const sendBtn = document.createElement('button');
    sendBtn.className = 'cb-send';
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.disabled = true;
    sendBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/>
        <polyline points="5 12 12 5 19 12"/>
      </svg>
    `;

    inputRow.appendChild(textarea);
    inputRow.appendChild(sendBtn);

    const metaRow = document.createElement('div');
    metaRow.className = 'cb-meta-row';

    const disclaimer = document.createElement('span');
    disclaimer.className = 'cb-disclaimer-inline';
    disclaimer.textContent = "Mian's responses may be inaccurate. Please verify.";

    const counterEl = document.createElement('span');
    counterEl.className = 'cb-counter';
    counterEl.textContent = '0 / ' + CONFIG.maxChars;

    metaRow.appendChild(disclaimer);
    metaRow.appendChild(counterEl);

    inputArea.appendChild(inputRow);
    inputArea.appendChild(metaRow);

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(messagesEl);
    panel.appendChild(chipsRow);
    panel.appendChild(inputArea);

    // ── ID Card overlay ──────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.className = 'cb-card-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', CONFIG.botName + ' profile card');

    const card = document.createElement('div');
    card.className = 'cb-card squircle-card';

    const cardCloseBtn = document.createElement('button');
    cardCloseBtn.className = 'cb-card-close';
    cardCloseBtn.setAttribute('aria-label', 'Close profile card');
    cardCloseBtn.innerHTML = CLOSE_ICON;

    const cardAvatarEl = document.createElement('div');
    cardAvatarEl.className = 'cb-card-avatar';
    populateAvatar(cardAvatarEl, CONFIG.botName);

    const cardName = document.createElement('div');
    cardName.className = 'cb-card-name';
    cardName.textContent = CONFIG.botName;

    const cardRole = document.createElement('div');
    cardRole.className = 'cb-card-role';
    cardRole.textContent = CONFIG.botSubtitle;

    const cardDedication = document.createElement('div');
    cardDedication.className = 'cb-card-dedication';
    cardDedication.textContent = CONFIG.cardDedication;

    card.appendChild(cardCloseBtn);
    card.appendChild(cardAvatarEl);
    card.appendChild(cardName);
    card.appendChild(cardRole);
    card.appendChild(cardDedication);
    overlay.appendChild(card);

    // Mount everything
    const ring = document.createElement('div');
    ring.className = 'cb-siri-ring';
    document.body.appendChild(fab);
    document.body.appendChild(ring);
    document.body.appendChild(panel);
    document.body.appendChild(overlay);

    return { fab, panel, ring, overlay, avatarBtn, closeBtn, messagesEl,
             textarea, sendBtn, counterEl, chipsRow, cardCloseBtn };
  }

  // -------------------- STATE --------------------
  let history = [];
  let isSending = false;
  let welcomeShown = false;

  function init() {
    injectStyles();
    const {
      fab, panel, ring, overlay, avatarBtn, closeBtn,
      messagesEl, textarea, sendBtn, counterEl,
      chipsRow, cardCloseBtn,
    } = createUI();

    glowManager.init(ring);

    // Chip click: answer instantly from the FAQ cache — no LLM call.
    // Falls back to the normal send() path if a chip label somehow
    // isn't in the cache, so nothing silently breaks.
    chipsRow.querySelectorAll('.cb-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (!panelReady || isSending) return;
        const label = chip.textContent.trim();
        chipsRow.querySelectorAll('.cb-chip').forEach(c => c.classList.add('cb-chip-gone'));
        if (CHIP_INTENTS[label] && FAQ_BY_ID[CHIP_INTENTS[label]]) {
          sendCachedChip(label);
        } else {
          textarea.value = label;
          updateUI();
          send();
        }
      });
    });

    // ---- Panel open/close ----
    let panelReady = false;

    // On mobile the panel doesn't cover the full screen, and without this
    // the page underneath stays scrollable — so a scroll gesture that
    // starts on (or chains past the edge of) the messages list ends up
    // moving the page behind it instead. Lock the page in place while
    // the panel is open, restore the exact scroll position on close.
    var __cbLockY = 0;
    function cbLockScroll() {
      if (!window.matchMedia('(max-width: 767px)').matches) return;
      __cbLockY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + __cbLockY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    }
    function cbUnlockScroll() {
      if (document.body.style.position !== 'fixed') return;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, __cbLockY);
    }

    function setPanelOriginToFab() {
      const fabRect = fab.getBoundingClientRect();
      const fabX = fabRect.left + fabRect.width / 2;
      const fabY = fabRect.top + fabRect.height / 2;
      // Measure the panel at its natural size so the transition expands from
      // the actual button position on both desktop and mobile layouts.
      const previousTransition = panel.style.transition;
      panel.style.transition = 'none';
      panel.style.transform = 'none';
      const panelRect = panel.getBoundingClientRect();
      panel.style.transformOrigin = (fabX - panelRect.left) + 'px ' + (fabY - panelRect.top) + 'px';
      panel.style.transform = '';
      panel.style.transition = previousTransition;
    }

    function openPanel() {
      if (isPanelOpen()) return;
      setPanelOriginToFab();
      panel.classList.add('cb-open');
      fab.classList.add('cb-hidden');
      glowManager.show();
      cbLockScroll();
      // Sync Mian indicator — show glass
      if (typeof M !== 'undefined' && !M.open) { M.open = true; if (typeof updateMian === 'function') updateMian(); }
      // Block panel interactions for 450ms to prevent FAB-tap bleed-through
      panelReady = false;
      setTimeout(() => { panelReady = true; }, 450);
      setTimeout(() => textarea.focus(), 250);
      if (!welcomeShown) {
        welcomeShown = true;
        addMessage('bot', CONFIG.welcomeMessage);
        const chips = chipsRow.querySelectorAll('.cb-chip');
        chips.forEach((chip, i) => {
          setTimeout(() => chip.classList.add('cb-chip-in'), i * 120);
        });
      }
    }

    function closePanel() {
      if (!isPanelOpen()) return;
      panel.classList.remove('cb-open');
      fab.classList.remove('cb-hidden');
      glowManager.hide();
      cbUnlockScroll();
      // Sync Mian indicator — dismiss glass
      if (typeof M !== 'undefined' && M.open) { M.open = false; if (typeof updateMian === 'function') updateMian(); if (typeof setMianLift === 'function') setMianLift(false); }
    }

    function isPanelOpen() { return panel.classList.contains('cb-open'); }

    // Expose to the command palette (⌘K) so its "Ask Mian" action can
    // open the chat without duplicating the open/close logic.
    window.__openMian  = openPanel;
    window.__closeMian = closePanel;
    window.__isMianOpen = isPanelOpen;

    fab.addEventListener('click', openPanel);
    fab.addEventListener('touchend', (e) => {
      e.preventDefault();
      openPanel();
    });
    closeBtn.addEventListener('click', closePanel);

    // ── Wire nav Mian button to toggle panel ──────────────────
    // The nav's setupMian() calls this after its own pointerup tap logic.
    // We listen on the #mian element: tap (no drag) toggles the chat panel.
    // ---- ID card popup ----
    function openCard()  { overlay.classList.add('cb-open'); }
    function closeCard() { overlay.classList.remove('cb-open'); }
    function isCardOpen() { return overlay.classList.contains('cb-open'); }

    avatarBtn.addEventListener('click', openCard);
    cardCloseBtn.addEventListener('click', closeCard);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCard();
    });

    // Escape key: close card first if open, otherwise close panel
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (isCardOpen())  { closeCard();  return; }
      if (isPanelOpen()) { closePanel(); }
    });

    // ---- Message rendering ----
    function buildSmallAvatar() {
      const av = document.createElement('div');
      av.className = 'cb-msg-avatar';
      populateAvatar(av, CONFIG.botName);
      return av;
    }

    function hideOlderBotAvatars() {
      messagesEl.querySelectorAll('.cb-msg-avatar').forEach(a => {
        a.classList.add('cb-avatar-hidden');
      });
    }

    const NAVIGATION_ACTIONS = {
      'experience': { label: 'View Experience', route: 'experience', section: 'Experience' },
      'section:introduction': { label: 'Jump to Introduction', route: 'home', section: 'Introduction' },
      'section:contact': { label: 'Jump to Contact and Social Links', route: 'home', section: 'Contact and Social Links' },
      'section:affiliation': { label: 'Jump to Affiliation', route: 'home', section: 'Affiliation' },
      'section:home-projects': { label: 'Jump to Home Projects', route: 'home', section: 'Projects' },
      'section:home-certifications': { label: 'Jump to Home Licenses and Certifications', route: 'home', section: 'Licenses and Certifications' },
      'role:accenture': { label: 'View Accenture Role', route: 'experience', section: 'Application & Cloud Support Associate' },
      'role:converge': { label: 'View Converge Internship', route: 'experience', section: 'Information Technology Helpdesk Intern' },
      'role:cardinal-one': { label: 'View Cardinal One Role', route: 'home', section: 'Electronics Engineer & Media Manager' },
      'education:cardinal-one': { label: 'View Cardinal One', route: 'home', section: 'Electronics Engineer & Media Manager' },
      'education:iecep': { label: 'View IECEP-MUSC Role', route: 'home', section: 'Board Auditor, Treasurer' },
      'education:ieee': { label: 'View IEEE-MUSB Role', route: 'home', section: 'Finance Committee Head' },
      'education:degree': { label: 'View Electronics Engineering Degree', route: 'home', section: 'BS Electronics Engineering' },
      'education': { label: 'View Education', route: 'home', section: 'Education' },
      'projects': { label: 'View Projects', route: 'projects', section: 'Personal Project' },
      'projects:personal': { label: 'Jump to Personal Project', route: 'projects', section: 'Personal Project' },
      'projects:institutional': { label: 'Jump to Institutional Research and Projects', route: 'projects', section: 'Institutional Research and Projects' },
      'licenses': { label: 'View Licenses and Certifications', route: 'licenses', section: 'Licenses' },
      'licenses:prc': { label: 'Jump to PRC Licenses', route: 'licenses', section: 'Philippine Professional Regulation Commission' },
      'licenses:cisco': { label: 'Jump to Cisco Certificates', route: 'licenses', section: 'Cisco' },
      'licenses:google': { label: 'Jump to Google Certificates', route: 'licenses', section: 'Google' },
      'licenses:certificates': { label: 'Jump to Certificates', route: 'licenses', section: 'Certificates' },
      'licenses:profiles': { label: 'Jump to Learning Profiles', route: 'licenses', section: 'Credentials and Learning Profiles' },
      'credential:google-cloud-fundamentals': { label: 'View Google Cloud Fundamentals', route: 'licenses', section: 'Google Cloud Fundamentals' },
      'credential:electronics-engineering-license': { label: 'View Electronics Engineering License', route: 'licenses', section: 'Electronics Engineering License' },
      'credential:electronics-technician-license': { label: 'View Electronics Technician License', route: 'licenses', section: 'Electronics Technician License' },
      'credential:network-fundamentals': { label: 'View Network Fundamentals', route: 'licenses', section: 'Network Fundamentals' },
      'credential:ccna-enterprise': { label: 'View CCNA Enterprise Networking', route: 'licenses', section: 'CCNA: Enterprise Networking, Security, and Automation' },
      'credential:ccna-switching': { label: 'View CCNA Switching, Routing, and Wireless', route: 'licenses', section: 'CCNA: Switching, Routing, and Wireless Essentials' },
      'credential:cybersecurity-foundations': { label: 'View Foundations of Cybersecurity', route: 'licenses', section: 'Foundations of Cybersecurity' },
      'mian': { label: 'Read About Mian', route: 'mian', section: 'About Mian' },
      'mian:what-she-does': { label: 'Jump to What Mian Does', route: 'mian', section: 'What Mian Does' },
      'privacy:chat': { label: 'Jump to Chat Privacy', route: 'privacy', section: 'What Happens to Your Chat Messages' },
      'privacy:overview': { label: 'Jump to Privacy Overview', route: 'privacy', section: 'Overview' },
      'privacy:data': { label: 'Jump to Site Data Collection', route: 'privacy', section: 'Data Collection by the Site Owner' },
      'privacy:assistant': { label: 'Jump to Mian Privacy Details', route: 'privacy', section: 'The AI Chatbot (“Mian”)' },
      'privacy:sensitive': { label: 'Jump to Sensitive Information Guidance', route: 'privacy', section: 'Please Do Not Share Sensitive Information' },
      'privacy:external': { label: 'Jump to External Links Privacy', route: 'privacy', section: 'External Links' },
      'privacy:changes': { label: 'Jump to Privacy Policy Changes', route: 'privacy', section: 'Changes to This Policy' },
      'privacy:contact': { label: 'Jump to Privacy Contact', route: 'privacy', section: 'Contact' },
      'terms:chat': { label: 'Jump to Chatbot Terms', route: 'terms', section: 'Use of the Chatbot' },
      'terms:acceptance': { label: 'Jump to Terms Acceptance', route: 'terms', section: 'Acceptance of Terms' },
      'terms:purpose': { label: 'Jump to Site Purpose', route: 'terms', section: 'Purpose of the Site' },
      'terms:assistant': { label: 'Jump to Mian Terms', route: 'terms', section: 'About the AI Assistant' },
      'terms:advice': { label: 'Jump to Professional Advice Disclaimer', route: 'terms', section: 'No Professional Advice' },
      'terms:ip': { label: 'Jump to Intellectual Property Terms', route: 'terms', section: 'Intellectual Property' },
      'terms:disclaimer': { label: 'Jump to Liability Disclaimer', route: 'terms', section: 'Disclaimer and Limitation of Liability' },
      'terms:external': { label: 'Jump to Terms External Links', route: 'terms', section: 'External Links' },
      'terms:changes': { label: 'Jump to Terms Changes', route: 'terms', section: 'Changes to These Terms' },
      'terms:contact': { label: 'Jump to Terms Contact', route: 'terms', section: 'Contact' },
      'project:bushop': { label: 'View BusHop Project', route: 'project:bushop', section: 'Overview' },
      'project:bushop:what-it-does': { label: 'Jump to What BusHop Does', route: 'project:bushop', section: 'What It Does' },
      'project:bushop:how-built': { label: 'Jump to How BusHop Is Built', route: 'project:bushop', section: 'How It Is Built' },
      'project:bushop:team': { label: 'Jump to the BusHop Team', route: 'project:bushop', section: 'The Team' },
      'project:banana-shelflife': { label: 'View Banana Research', route: 'project:banana-shelflife', section: 'Overview' },
      'project:banana-shelflife:awards': { label: 'Jump to Banana Research Recognition', route: 'project:banana-shelflife', section: 'Awards and Recognition' },
      'project:aguila': { label: 'View Aguila Project', route: 'project:aguila', section: 'Overview' },
      'project:aguila:season-2024': { label: 'Jump to Aguila Season 2024', route: 'project:aguila', section: 'Season 2024: Back on the Track' },
      'project:aguila:season-2025': { label: 'Jump to Aguila Season 2025', route: 'project:aguila', section: 'Season 2025: Development Continues' },
      'project:aguila:season-2026': { label: 'Jump to Aguila Season 2026', route: 'project:aguila', section: 'Season 2026: A New Frontier' },
      'project:eeg-exoskeleton': { label: 'View EEG Exoskeleton Project', route: 'project:eeg-exoskeleton', section: 'Overview' },
      'project:eeg-exoskeleton:awards': { label: 'Jump to EEG Research Recognition', route: 'project:eeg-exoskeleton', section: 'Awards and Recognition' },
      'role:cardinal-one-apprentice': { label: 'Jump to Cardinal One Apprenticeship', route: 'project:aguila', section: 'Overview' },
    };

    const FAQ_NAVIGATION_ACTIONS = {
      experience: 'experience', current_job: 'role:accenture', internship: 'role:converge',
      education: 'education:degree', license: 'licenses', certifications: 'licenses',
      electronics_engineering_license: 'credential:electronics-engineering-license',
      electronics_technician_license: 'credential:electronics-technician-license',
      network_fundamentals_certificate: 'credential:network-fundamentals',
      ccna_enterprise_certificate: 'credential:ccna-enterprise',
      ccna_switching_certificate: 'credential:ccna-switching',
      cybersecurity_foundations_certificate: 'credential:cybersecurity-foundations',
      project_aguila: 'project:aguila', leadership: 'education',
      ieee_student_role: 'education:ieee', iecep_student_role: 'education:iecep',
      google_cloud_certificate: 'credential:google-cloud-fundamentals',
      projects: 'projects', project_bushop: 'project:bushop',
      project_thesis: 'project:banana-shelflife', project_eeg: 'project:eeg-exoskeleton', project_mian: 'mian', about_mian: 'mian',
    };

    const LOCATION_QUESTION = /\bwhere\s+(?:(?:can|could|do|would)\s+i\s+)?(?:find|see|locate)\b|\bwhere\s+(?:is|are)\b|\b(?:show|take|bring)\s+me\s+to\b|\b(?:help me )?find\b/i;
    function describeNavigationLocation(key) {
      const action = NAVIGATION_ACTIONS[key];
      if (!action) return '';
      if (key.startsWith('credential:')) return `the ${action.section} card on Licenses and Certificates`;
      if (key === 'licenses:prc') return 'the PRC issuer row on Licenses and Certificates';
      if (key === 'licenses:cisco') return 'the Cisco issuer row on Licenses and Certificates';
      if (key === 'licenses:google') return 'the Google issuer row on Licenses and Certificates';
      if (key === 'licenses:profiles') return 'Credentials and Learning Profiles on Licenses and Certificates';
      if (key.startsWith('licenses:')) return `the ${action.section} section on Licenses and Certificates`;
      if (key.startsWith('project:')) {
        const projectNames = {
          bushop: 'BusHop',
          'banana-shelflife': 'banana shelf-life research',
          aguila: 'Aguila',
          'eeg-exoskeleton': 'EEG exoskeleton',
        };
        const project = action.route.slice('project:'.length);
        const section = action.section === 'Overview' ? 'overview' : `the ${action.section} section`;
        return `${section} of the ${projectNames[project] || 'project'} article`;
      }
      if (key.startsWith('role:')) {
        return action.route === 'experience'
          ? `the ${action.section} card on Experience`
          : `the ${action.section} entry in Education on Home`;
      }
      if (key.startsWith('education:') || key === 'education') return `the ${action.section} entry in Education on Home`;
      if (key.startsWith('section:')) return `the ${action.section} section on Home`;
      if (key === 'projects' || key.startsWith('projects:')) return `the ${action.section} section on the Projects page`;
      if (key.startsWith('mian:')) return `the ${action.section} section in the Mian article`;
      if (key === 'mian') return 'the Mian article';
      if (key === 'experience') return 'the Experience page';
      if (key === 'licenses') return 'the Licenses and Certificates page';
      return `the ${action.section} section`;
    }

    function parseNavigationReply(text) {
      let target = null;
      const cleanText = String(text || '').replace(/\[\[NAV:([a-z:-]+)\]\]/g, (marker, key) => {
        if (!target && NAVIGATION_ACTIONS[key]) target = key;
        return '';
      }).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      return { text: cleanText, target };
    }

    function navigateToSiteAction(key) {
      const action = NAVIGATION_ACTIONS[key];
      if (!action) return;
      if (typeof window.__portfolioNavigate === 'function') {
        window.__portfolioNavigate(action.route);
      } else {
        window.location.href = portfolioRouteUrl(action.route);
      }
      if (action.section) {
        // Match Command-K's Jump to behavior: resolve the exact visible
        // data-command-section label after navigation, then smooth-scroll it.
        const jump = () => {
          const section = Array.prototype.find.call(
            document.querySelectorAll('[data-command-section]'),
            (element) => element.getAttribute('data-command-section') === action.section && !element.closest('[inert]')
          );
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        window.requestAnimationFrame(() => window.requestAnimationFrame(jump));
      }
    }

    function addNavigationAction(key) {
      const action = NAVIGATION_ACTIONS[key];
      if (!action) return;
      const row = document.createElement('div');
      row.className = 'cb-navigation-actions';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cb-navigation-action';
      button.textContent = action.label;
      button.setAttribute('aria-label', action.label);
      button.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 767px)').matches && isPanelOpen()) closePanel();
        navigateToSiteAction(key);
      });
      row.appendChild(button);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(role, text) {
      if (role === 'user') {
        const div = document.createElement('div');
        div.className = 'cb-msg cb-msg-user';
        div.textContent = text; // textContent — safe
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
      }

      hideOlderBotAvatars();

      const row = document.createElement('div');
      row.className = 'cb-bot-row';

      const avatar = buildSmallAvatar();
      const bubble = document.createElement('div');
      bubble.className = 'cb-msg cb-msg-bot';
      cbLinkify(bubble, text); // text nodes plus real links — safe

      row.appendChild(avatar);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return { row, bubble };
    }

    function addBotBubbleForTyping(opts) {
      opts = opts || {};
      hideOlderBotAvatars();

      const row = document.createElement('div');
      row.className = 'cb-bot-row';

      const avatar = buildSmallAvatar();
      const bubble = document.createElement('div');
      bubble.className = 'cb-msg ' + (opts.error ? 'cb-msg-error' : 'cb-msg-bot');
      bubble.textContent = '';

      row.appendChild(avatar);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return { row, bubble };
    }

    /* Turns URLs in a finished bot reply into real links.
       Text is still inserted as text nodes, never as innerHTML, so nothing in a
       reply can inject markup. Emails are left alone. */
    const CB_URL_RE = /((?:https?:\/\/|www\.)[^\s<>]+|(?:[a-z0-9-]+\.)+(?:com|org|net|io|ph|dev|app|ai|me|co|edu|gov)(?:\.[a-z]{2})?(?:\/[^\s<>]*)?)/gi;

    function cbLinkify(el, text) {
      el.textContent = '';
      let last = 0;
      let m;
      CB_URL_RE.lastIndex = 0;
      while ((m = CB_URL_RE.exec(text)) !== null) {
        let raw = m[0];
        const start = m.index;
        if (start > 0 && /[@\w]/.test(text.charAt(start - 1))) continue; // part of an email or word
        const trimmed = raw.replace(/[.,;:!?)\]'"]+$/, '');              // keep sentence punctuation outside the link
        if (!/[a-z]{2}/i.test(trimmed)) continue;
        if (start > last) el.appendChild(document.createTextNode(text.slice(last, start)));
        const a = document.createElement('a');
        a.href = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = trimmed;
        el.appendChild(a);
        last = start + trimmed.length;
      }
      if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
    }

    function typeIntoBubble(bubble, text) {
      return new Promise((resolve) => {
        const total = text.length;
        const baseDelay = total > 220 ? 10 : total > 120 ? 14 : total > 60 ? 18 : 22;

        let i = 0;
        function step() {
          if (i >= total) { cbLinkify(bubble, text); resolve(); return; } // swap plain text for real links
          const ch = text.charAt(i);
          bubble.textContent += ch;
          messagesEl.scrollTop = messagesEl.scrollHeight;
          i++;

          let extra = 0;
          if (ch === '.' || ch === '!' || ch === '?') extra = 140;
          else if (ch === ',' || ch === ';' || ch === ':') extra = 60;

          setTimeout(step, baseDelay + extra);
        }
        step();
      });
    }

    function addTyping() {
      hideOlderBotAvatars();

      const row = document.createElement('div');
      row.className = 'cb-bot-row';

      const avatar = buildSmallAvatar();

      const bubbleWrap = document.createElement('div');
      bubbleWrap.style.display = 'flex';
      bubbleWrap.style.flexDirection = 'column';

      const bubble = document.createElement('div');
      bubble.className = 'cb-msg cb-msg-bot';

      const typing = document.createElement('span');
      typing.className = 'cb-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      bubble.appendChild(typing);

      const anticipation = document.createElement('div');
      anticipation.className = 'cb-anticipation';

      const ANTICIPATION_STEPS = [
        { text: 'Thinking…',            delay: 0     },
        { text: 'Recalling…',           delay: 5000  },
        { text: 'Putting it together…', delay: 15000 },
        { text: 'Almost there…',        delay: 25000 },
        { text: 'Confirming',           delay: 35000, countUp: true },
      ];

      let countUpInterval = null;
      const timers = [];

      ANTICIPATION_STEPS.forEach(({ text, delay, countUp }) => {
        timers.push(setTimeout(() => {
          anticipation.style.opacity = '0';
          // Clear any previous count-up
          if (countUpInterval) { clearInterval(countUpInterval); countUpInterval = null; }
          setTimeout(() => {
            anticipation.textContent = '';
            if (countUp) {
              // Build: "Confirming (Xs)..."
              let secs = 0;
              const update = () => {
                secs++;
                anticipation.textContent = `${text} (${secs}s)...`;
              };
              anticipation.textContent = `${text} (0s)...`;
              countUpInterval = setInterval(update, 1000);
              row._countUpInterval = countUpInterval;
            } else {
              anticipation.textContent = text;
            }
            anticipation.style.opacity = '1';
          }, 200);
        }, delay));
      });

      // Store timers on the row so we can clear them on remove
      row._anticipationTimers = timers;

      // Wrap row + anticipation in a column container so anticipation
      // sits below the row but is indented to align with the bubble
      // (avatar is 28px wide + 8px gap = 36px offset)
      const outer = document.createElement('div');
      outer.style.display = 'flex';
      outer.style.flexDirection = 'column';
      outer.style.alignItems = 'flex-start';

      anticipation.style.marginLeft = '36px';

      bubbleWrap.appendChild(bubble);
      row.appendChild(avatar);
      row.appendChild(bubbleWrap);
      outer.appendChild(row);
      outer.appendChild(anticipation);

      // Proxy remove() so callers removing `row` also remove outer
      row._outer = outer;
      const _origRemove = row.remove.bind(row);
      row.remove = () => outer.remove();

      messagesEl.appendChild(outer);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return row;
    }

    function updateUI() {
      const len = textarea.value.length;
      counterEl.textContent = `${len} / ${CONFIG.maxChars}`;
      counterEl.classList.toggle('cb-near-limit', len > CONFIG.maxChars * 0.8 && len < CONFIG.maxChars);
      counterEl.classList.toggle('cb-at-limit', len >= CONFIG.maxChars);
      sendBtn.disabled = len === 0 || isSending;

      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    textarea.addEventListener('input', updateUI);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
    sendBtn.addEventListener('click', () => { if (panelReady) send(); });

    // Detects an email address anywhere in a Mian reply — catches both the
    // hardcoded connection-error fallback and any LLM-generated reply that
    // follows the system prompt's instruction to suggest emailing JC.
    const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

    function addEmailActions(email, existingRow) {
      const wrap = existingRow || document.createElement('div');
      if (!existingRow) wrap.className = 'cb-email-row';

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'cb-email-btn';
      copyBtn.innerHTML =
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
        '<span>Copy email</span>';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(email);
        } catch (e) {
          // Fallback for browsers/contexts without Clipboard API access
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e2) {}
          document.body.removeChild(ta);
        }
        copyBtn.classList.add('cb-email-copied');
        copyBtn.querySelector('span').textContent = 'Copied';
        setTimeout(() => {
          copyBtn.classList.remove('cb-email-copied');
          copyBtn.querySelector('span').textContent = 'Copy email';
        }, 1500);
      });

      const sendBtn = document.createElement('a');
      sendBtn.className = 'cb-email-btn';
      sendBtn.href = 'mailto:' + email;
      sendBtn.innerHTML =
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>' +
        '<span>Send email</span>';

      wrap.appendChild(copyBtn);
      wrap.appendChild(sendBtn);
      if (!existingRow) {
        messagesEl.appendChild(wrap);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
      return wrap;
    }

    // Call after any bot reply finishes rendering — attaches Copy/Send
    // buttons only if the reply actually contains an email address.
    function maybeAddEmailActions(text) {
      const match = text.match(EMAIL_PATTERN);
      if (match) addEmailActions(match[0]);
    }

    function addRetryButton(errorRow, fallbackText) {
      const wrap = document.createElement('div');
      wrap.className = 'cb-email-row';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cb-email-btn cb-retry-btn';
      btn.setAttribute('aria-label', 'Retry response');
      btn.title = 'Retry';
      btn.innerHTML =
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';

      btn.addEventListener('click', async () => {
        if (isSending) return;
        isSending = true;
        updateUI();
        btn.disabled = true;
        wrap.remove();
        errorRow.remove();
        await attemptReply();
      });

      wrap.appendChild(btn);
      const emailMatch = fallbackText && fallbackText.match(EMAIL_PATTERN);
      if (emailMatch) addEmailActions(emailMatch[0], wrap);
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return wrap;
    }

    // Sends `history` to the backend and renders the result. On failure,
    // shows an error bubble with a Retry button that re-runs this same
    // function — no need to re-type the message, since it's already in
    // `history` from when the user first sent it.
    async function attemptReply() {
      const typingEl = addTyping();
      glowManager.pauseIdle();

      try {
        const rawReply = await sendToAI(history);
        const parsedReply = parseNavigationReply(stripMarkdown(rawReply));
        const reply = parsedReply.text;
        if (typingEl._anticipationTimers) typingEl._anticipationTimers.forEach(clearTimeout);
        if (typingEl._countUpInterval) clearInterval(typingEl._countUpInterval);
        typingEl.remove();

        const { bubble } = addBotBubbleForTyping();
        await typeIntoBubble(bubble, reply);
        if (parsedReply.target) addNavigationAction(parsedReply.target);
        maybeAddEmailActions(reply);

        history.push({ role: 'assistant', content: reply });
      } catch (err) {
        console.error('[Mian]', err);
        if (typingEl._anticipationTimers) typingEl._anticipationTimers.forEach(clearTimeout);
        if (typingEl._countUpInterval) clearInterval(typingEl._countUpInterval);
        typingEl.remove();

        const { row, bubble } = addBotBubbleForTyping({ error: true });
        const fallbackText = "Sorry, I'm having trouble connecting right now. Please try again in a moment, or reach JC directly at jcdcocampo@gmail.com.";
        await typeIntoBubble(bubble, fallbackText);
        addRetryButton(row, fallbackText);
      } finally {
        isSending = false;
        updateUI();
        textarea.focus();
        glowManager.resumeIdle();
      }
    }

    // Types a locally-provided reply into a bubble with the same feel as a
    // real answer (typing indicator + natural pause), but no network call.
    // Used for the email-intent instant reply.
    async function replyInstant(reply, navigationTarget) {
      const typingEl = addTyping();
      glowManager.pauseIdle();

      await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 300));

      if (typingEl._anticipationTimers) typingEl._anticipationTimers.forEach(clearTimeout);
      if (typingEl._countUpInterval) clearInterval(typingEl._countUpInterval);
      typingEl.remove();

      const { bubble } = addBotBubbleForTyping();
      await typeIntoBubble(bubble, reply);
      if (navigationTarget) addNavigationAction(navigationTarget);
      maybeAddEmailActions(reply);

      history.push({ role: 'assistant', content: reply });

      isSending = false;
      updateUI();
      textarea.focus();
      glowManager.resumeIdle();
    }

    async function send() {
      const text = textarea.value.trim();
      if (!text || isSending) return;

      isSending = true;
      updateUI();
      addMessage('user', text);
      // User sent → wake / keep the glow alive and start idle clock
      glowManager.activate();
      chipsRow.querySelectorAll('.cb-chip').forEach(c => c.classList.add('cb-chip-gone'));
      history.push({ role: 'user', content: text });
      if (history.length > CONFIG.maxHistory) {
        history = history.slice(-CONFIG.maxHistory);
      }

      textarea.value = '';
      updateUI();

      // Contact/email questions get an instant cached answer (with the
      // Copy/Send email buttons) instead of hitting the LLM.
      // Common questions (and contact/email requests) get an instant
      // answer from the FAQ cache instead of hitting the LLM.
      const faq = matchFaq(text);
      if (faq) {
        const target = FAQ_NAVIGATION_ACTIONS[faq.id];
        if (LOCATION_QUESTION.test(text) && target && NAVIGATION_ACTIONS[target]) {
          const location = describeNavigationLocation(target);
          await replyInstant(`It’s in ${location}. Use the button below to go straight there.`, target);
        } else {
          await replyInstant(pickVariant(faq.id, faq.replies), target);
        }
      } else {
        await attemptReply();
      }
    }

    // Instant reply for the quick-question chips — pulls a random
    // pre-written variant from the FAQ cache instead of calling the
    // API, so the first answer feels immediate. Still logs into
    // `history` so a follow-up question has real context for the LLM.
    async function sendCachedChip(label) {
      if (isSending) return;
      const intent = FAQ_BY_ID[CHIP_INTENTS[label]];
      if (!intent || !intent.replies.length) return;

      isSending = true;
      updateUI();
      addMessage('user', label);
      glowManager.activate();
      history.push({ role: 'user', content: label });
      if (history.length > CONFIG.maxHistory) {
        history = history.slice(-CONFIG.maxHistory);
      }

      const typingEl = addTyping();
      glowManager.pauseIdle();

      const reply = pickVariant(intent.id, intent.replies);

      // Small natural-feeling pause before the reply appears — this is
      // the only "wait," and it's local, not a network round trip.
      await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 300));

      if (typingEl._anticipationTimers) typingEl._anticipationTimers.forEach(clearTimeout);
      if (typingEl._countUpInterval) clearInterval(typingEl._countUpInterval);
      typingEl.remove();

      const { bubble } = addBotBubbleForTyping();
      await typeIntoBubble(bubble, reply);
      if (FAQ_NAVIGATION_ACTIONS[intent.id]) addNavigationAction(FAQ_NAVIGATION_ACTIONS[intent.id]);
      maybeAddEmailActions(reply);

      history.push({ role: 'assistant', content: reply });

      isSending = false;
      updateUI();
      textarea.focus();
      glowManager.resumeIdle();
    }
  }

  // -------------------- BACKEND CALL --------------------
  async function sendToAI(messages) {
    const res = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data || typeof data.reply !== 'string') {
      throw new Error('Invalid response from server');
    }
    return data.reply;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // -------------------- BFCACHE FIX --------------------
  // When the browser restores a page from the back-forward cache,
  // CSS animations that already finished won't replay. This resets
  // all .fade-up elements so their animations play again.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      document.querySelectorAll('.fade-up').forEach(function (el) {
        el.style.animation = 'none';
        void el.offsetHeight; // force reflow
        el.style.animation = '';
      });
    }
  });

})();
})();

/* ══════════════════════════════════════════════════════════════════
   COMMAND PALETTE  (⌘K / Ctrl+K) — Spotlight-style
   Site-wide quick launcher, lives in nav.js so every page gets it.
   Two kinds of results:
     • Live commands (Actions, Jump to, Go to page) — built fresh each
       time the palette opens, since they depend on the current page.
     • A static content index (Projects / Certifications / Experience /
       Education) — real titles pulled straight from the site's own
       pages, so searching "AWS" or "Cisco" finds the actual item and
       deep-links to it, the way Spotlight surfaces files, not just menus.
   Intercepts ⌘K so the browser's native search shortcut no longer fires.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  if (window.__cmdkLoaded) return;
  window.__cmdkLoaded = true;

  /* ── Icon helpers (match the nav pill's stroke style) ── */
  function svg(inner) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
           'stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  var ICON = {
    mian:    svg('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'),    section: svg('<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>'),
    page:    svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'),
    contact: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2.2"/><path d="M5.5 17c.7-2.1 2.2-3.2 3.5-3.2s2.8 1.1 3.5 3.2"/><line x1="14" y1="9" x2="18" y2="9"/><line x1="14" y1="12.5" x2="18" y2="12.5"/>'),
    mail:    svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
    proj:    svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    cert:    svg('<circle cx="12" cy="8" r="5"/><path d="M9.09 14L7 21l5-2 5 2-2.09-7"/>'),
    exp:     svg('<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'),
    edu:     svg('<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>')
  };
  var PAGE_ICON = {
    home:       svg('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
    experience: ICON.exp,
    projects:   ICON.proj,
    certs:      ICON.cert
  };

  /* ── Static content index — real titles from the site's own pages, so
     a search actually finds things, not just menu commands. Kept as data
     here (rather than scraped from the current page's DOM) so results
     are the same no matter which page the palette is opened from. ── */
  var CONTENT = [
    { group: 'Projects', label: 'Mian: An Intelligent Portfolio Assistant', hint: 'Personal Project', icon: ICON.proj, route: 'mian', section: 'About Mian', keywords: 'mian chatbot ai assistant portfolio javascript' },
    { group: 'Projects', label: 'BusHop: Live Bus Tracking and Trip Planning', hint: 'Accenture Digital Core Bootcamp', icon: ICON.proj, route: 'project:bushop', section: 'Overview', keywords: 'bushop busboy bus hop tracker tracking zambales line map transit commute chatbot app' },
    { group: 'Projects', label: 'Aguila — Energy-Efficient Vehicle', hint: 'Mapua Cardinal One · Shell Eco-marathon', icon: ICON.proj, route: 'project:aguila', section: 'Overview', keywords: 'aguila shell eco-marathon vehicle energy efficient cardinal one' },
    { group: 'Projects', label: 'Banana Shelf Life Neural Network', hint: 'IEEE research', icon: ICON.proj, route: 'project:banana-shelflife', section: 'Overview', keywords: 'banana shelf life neural network lakatan ieee sensor prediction' },
    { group: 'Projects', label: 'EEG Exoskeleton (BCI)', hint: 'Brain-computer interface research', icon: ICON.proj, route: 'project:eeg-exoskeleton', section: 'Overview', keywords: 'eeg exoskeleton brain computer interface bci rehabilitation' },

    { group: 'Certifications', label: 'Electronics Engineer License', hint: 'PRC', icon: ICON.cert, route: 'licenses', section: 'Electronics Engineering License', keywords: 'prc electronics engineer license' },
    { group: 'Certifications', label: 'Electronics Technician License', hint: 'PRC', icon: ICON.cert, route: 'licenses', section: 'Electronics Technician License', keywords: 'prc electronics technician license' },
    { group: 'Certifications', label: 'Network Fundamentals', hint: 'Cisco', icon: ICON.cert, route: 'licenses', section: 'Network Fundamentals', keywords: 'cisco network fundamentals networking' },
    { group: 'Certifications', label: 'CCNA: Enterprise Networking, Security, and Automation', hint: 'Cisco', icon: ICON.cert, route: 'licenses', section: 'CCNA: Enterprise Networking, Security, and Automation', keywords: 'ccna cisco enterprise networking security automation' },
    { group: 'Certifications', label: 'CCNA: Switching, Routing, and Wireless Essentials', hint: 'Cisco', icon: ICON.cert, route: 'licenses', section: 'CCNA: Switching, Routing, and Wireless Essentials', keywords: 'ccna cisco switching routing wireless essentials' },
    { group: 'Certifications', label: 'Google Cloud Fundamentals', hint: 'Google Cloud', icon: ICON.cert, route: 'licenses', section: 'Google Cloud Fundamentals', keywords: 'google cloud fundamentals gcp cloud computing' },
    { group: 'Certifications', label: 'Foundations of Cybersecurity', hint: 'Google / Coursera', icon: ICON.cert, route: 'licenses', section: 'Foundations of Cybersecurity', keywords: 'cybersecurity foundations security' },

    { group: 'Experience', label: 'Application & Cloud Support Associate', hint: 'Accenture, Inc. · 2026', icon: ICON.exp, route: 'experience', section: 'Application & Cloud Support Associate', keywords: 'accenture cloud support associate engineer application current job' },
    { group: 'Experience', label: 'IT Helpdesk Intern', hint: 'Converge ICT Solutions Inc. · 2025', icon: ICON.exp, route: 'experience', section: 'Information Technology Helpdesk Intern', keywords: 'converge ict helpdesk intern' },
    { group: 'Experience', label: 'Electronics Engineer & Media Manager', hint: 'Mapua University Cardinal One', icon: ICON.exp, route: 'home', section: 'Electronics Engineer & Media Manager', keywords: 'cardinal one electronics engineer media manager' },
    { group: 'Experience', label: 'Apprentice', hint: 'Mapua University Cardinal One', icon: ICON.exp, route: 'project:aguila', section: 'Overview', keywords: 'cardinal one apprentice' },

    { group: 'Education', label: 'BS Electronics Engineering', hint: 'Mapua University · 2025', icon: ICON.edu, route: 'home', section: 'BS Electronics Engineering', keywords: 'mapua university bs electronics engineering degree' }
  ];

  /* ── Styles — Spotlight-flavored: quieter icons, group label sits
     directly above its own items, result count bottom-right. ── */
  function injectCss() {
    if (document.getElementById('cmdk-style')) return;
    var css =
    '.cmdk-overlay{position:fixed;inset:0;z-index:100000;display:flex;align-items:flex-start;justify-content:center;' +
      'padding:15vh 20px 20px;opacity:0;pointer-events:none;background:rgba(0,0,0,.18);' +
      'backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);transition:opacity .18s ease;}' +
    '.cmdk-overlay.cmdk-show{opacity:1;pointer-events:auto;}' +
    '.cmdk-panel{width:100%;max-width:560px;border-radius:30px;corner-shape:squircle;overflow:hidden;' +
      "font-family:var(--sf,-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif);" +
      'background:rgba(255,255,255,.92);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);' +
      'box-shadow:0 0 0 .5px rgba(0,0,0,.08),0 24px 60px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.7);' +
      'transform:translateY(-8px) scale(.98);opacity:0;transition:transform .2s cubic-bezier(.22,1,.36,1),opacity .2s ease;}' +
    '.cmdk-show .cmdk-panel{transform:none;opacity:1;}' +
    '.cmdk-inputwrap{display:flex;align-items:center;gap:10px;padding:16px 22px;}' +
    '.cmdk-inputwrap svg{width:19px;height:19px;color:#8e8e93;flex-shrink:0;}' +
    '.cmdk-input{flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:18px;font-weight:400;color:#1c1c1e;padding:0;}' +
    '.cmdk-input::placeholder{color:#c7c7cc;}' +
    '.cmdk-divider{height:.5px;background:rgba(0,0,0,.09);margin:0 14px;}' +
    '.cmdk-list{max-height:min(52vh,400px);overflow-y:auto;padding:10px 12px 0;}' +
    '.cmdk-group{font-size:11.5px;font-weight:600;color:#8e8e93;padding:10px 10px 3px;}' +
    '.cmdk-row{display:flex;align-items:center;gap:10px;padding:7px 10px;margin:0 2px;border-radius:7px;cursor:pointer;}' +
    '.cmdk-row.cmdk-sel{background:rgba(0,122,255,.13);}' +
    '.cmdk-ic{width:22px;height:22px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#98989d;}' +
    '.cmdk-ic svg{width:16px;height:16px;}' +
    '.cmdk-row.cmdk-sel .cmdk-ic{color:#007aff;}' +
    '.cmdk-txt{display:flex;flex-direction:column;gap:0;min-width:0;flex:1;}' +
    '.cmdk-label{font-size:14.5px;font-weight:450;color:#1c1c1e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.cmdk-hint{font-size:12px;color:#98989d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.cmdk-empty{padding:30px 16px;text-align:center;color:#8e8e93;font-size:14px;}' +
    '.cmdk-foot{display:flex;align-items:center;justify-content:flex-end;gap:14px;padding:10px 20px;font-size:11.5px;color:#98989d;}' +
    '.cmdk-foot .cmdk-hints{display:flex;gap:14px;margin-right:auto;}' +
    '.cmdk-foot span{display:inline-flex;align-items:center;gap:4px;}' +
    '.cmdk-foot kbd{font-family:inherit;background:rgba(0,0,0,.06);border-radius:4px;padding:1px 5px;font-size:10.5px;line-height:1.5;}' +
    '.cmdk-count{font-variant-numeric:tabular-nums;}' +
    '@media (max-width:600px){.cmdk-overlay{padding:10vh 14px 14px;}.cmdk-panel{border-radius:24px;}.cmdk-inputwrap{padding:15px 18px;}.cmdk-list{padding-inline:10px;}.cmdk-foot{padding-inline:16px;}.cmdk-foot .cmdk-hints{display:none;}}';
    var st = document.createElement('style');
    st.id = 'cmdk-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ── Small utilities ── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
  function titleCase(s) {
    return s.replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }

  /* ── Build DOM ── */
  var overlay, panel, input, listEl, countEl;
  function buildUI() {
    overlay = document.createElement('div');
    overlay.className = 'cmdk-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Search');

    panel = document.createElement('div');
    panel.className = 'cmdk-panel squircle-card';
    panel.style.setProperty('--corner-radius', '32px');

    var iw = document.createElement('div');
    iw.className = 'cmdk-inputwrap';
    iw.innerHTML = svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>');

    input = document.createElement('input');
    input.className = 'cmdk-input';
    input.type = 'text';
    input.placeholder = 'Search';
    input.setAttribute('aria-label', 'Search');
    input.autocapitalize = 'off';
    input.autocomplete = 'off';
    input.spellcheck = false;
    iw.appendChild(input);

    var divider = document.createElement('div');
    divider.className = 'cmdk-divider';

    listEl = document.createElement('div');
    listEl.className = 'cmdk-list';

    var foot = document.createElement('div');
    foot.className = 'cmdk-foot';
    var hints = document.createElement('div');
    hints.className = 'cmdk-hints';
    hints.innerHTML =
      '<span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate</span>' +
      '<span><kbd>&crarr;</kbd> open</span>' +
      '<span><kbd>esc</kbd> close</span>';
    countEl = document.createElement('span');
    countEl.className = 'cmdk-count';
    foot.appendChild(hints);
    foot.appendChild(countEl);

    panel.appendChild(iw);
    panel.appendChild(divider);
    panel.appendChild(listEl);
    panel.appendChild(foot);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    input.addEventListener('input', function () { filter(input.value); });
  }

  /* ── Copy-to-clipboard helper, with a safe fallback ── */
  function copyText(text) {
    return (navigator.clipboard && navigator.clipboard.writeText)
      ? navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); })
      : Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  var JC_EMAIL = 'jcdcocampo@gmail.com';

  /* ── Command list (rebuilt each open so current page stays fresh) ── */
  function buildCommands() {
    var out = [];
    var active = window.__navActive || 'home';

    // Actions
    out.push({
      group: 'Actions', label: 'Ask Mian', hint: "Open JC's AI assistant",
      icon: ICON.mian, keywords: 'chat assistant ai help ask question mian',
      run: function () {
        if (typeof window.__openMian === 'function') window.__openMian();
        else { var m = document.getElementById('mian'); if (m) m.click(); }
      }
    });
    out.push({
      group: 'Actions', label: 'Contact JC', hint: 'Jump to social & contact links',
      icon: ICON.contact, keywords: 'contact social links reach connect',
      run: function () {
        if (active === 'home') {
          var el = Array.prototype.find.call(document.querySelectorAll('#section-social'), function(node){return !node.closest('[inert]');});
          if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
        }
        if (typeof window.__portfolioNavigate === 'function') window.__portfolioNavigate('home');
        else window.location.href = '/#section-social';
        setTimeout(function(){ var el=Array.prototype.find.call(document.querySelectorAll('#section-social'), function(node){return !node.closest('[inert]');}); if(el)el.scrollIntoView({behavior:'smooth',block:'start'}); }, 80);
      }
    });
    out.push({
      group: 'Actions', label: 'Copy Email', hint: JC_EMAIL,
      icon: ICON.mail, keywords: 'copy email address contact gmail',
      noAutoClose: true,
      run: function (row) {
        copyText(JC_EMAIL).then(function () {
          if (!row) return;
          var lbl = row.querySelector('.cmdk-label');
          if (lbl) lbl.textContent = 'Copied!';
          setTimeout(close, 700);
        });
      }
    });
    out.push({
      group: 'Actions', label: 'Send Email', hint: JC_EMAIL,
      icon: ICON.mail, keywords: 'send email mail compose message gmail',
      run: function () { window.location.href = 'mailto:' + JC_EMAIL; }
    });

    // Sections on the CURRENT page (scroll)
    var secs = Array.prototype.filter.call(document.querySelectorAll('[data-command-section]'), function(el){ return !el.closest('[inert]'); });
    Array.prototype.forEach.call(secs, function (el) {
      var lbl = el.getAttribute('data-command-section') || titleCase(el.id.replace('section-', '').replace(/-/g, ' '));
      out.push({
        group: 'Jump to', label: lbl, hint: 'On this page', icon: ICON.section,
        keywords: 'section jump scroll ' + lbl,
        run: function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });

    // Pages (navigate)
    if (typeof NAV_URLS === 'object' && NAV_URLS) {
      ['home', 'experience', 'projects', 'certs'].forEach(function (id) {
        if (!NAV_URLS[id]) return;
        var meta = (typeof PAGES === 'object' && PAGES && PAGES[id]) ? PAGES[id] : { t: titleCase(id), s: '' };
        var isCur = id === active;
        out.push({
          group: 'Go to page',
          label: meta.t + (isCur ? '  ·  current' : ''),
          hint: meta.s || '', icon: PAGE_ICON[id] || ICON.page,
          keywords: 'page go to open navigate ' + id + ' ' + meta.t,
          run: function () {
            if (isCur) { window.scrollTo({ top: 0, behavior: 'smooth' }); }
            else if (typeof window.__portfolioNavigate === 'function') { window.__portfolioNavigate(id); }
            else { window.location.href = NAV_URLS[id]; }
          }
        });
      });
    }

    // Real content — projects, certifications, experience, education
    CONTENT.forEach(function (c) {
      out.push({
        group: c.group, label: c.label, hint: c.hint, icon: c.icon,
        keywords: c.keywords, run: function () {
          if (c.route) {
            if (typeof window.__portfolioNavigate === 'function') window.__portfolioNavigate(c.route);
            else window.location.href = portfolioRouteUrl(c.route);
            if (c.section) {
              var jumpToContent = function () {
                var target = Array.prototype.find.call(document.querySelectorAll('[data-command-section]'), function (el) {
                  return el.getAttribute('data-command-section') === c.section && !el.closest('[inert]');
                });
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              };
              window.requestAnimationFrame(function () { window.requestAnimationFrame(jumpToContent); });
            }
            return;
          }
          if (c.section) {
            var jump = function(){ var el=document.getElementById(c.section); if(el)el.scrollIntoView({behavior:'smooth',block:'start'}); };
            if (window.location.search || window.location.pathname !== '/') {
              if (typeof window.__portfolioNavigate === 'function') window.__portfolioNavigate('home');
              else { window.location.href = '/#' + c.section; return; }
              setTimeout(jump, 80);
            } else jump();
            return;
          }
          if (c.url) window.location.href = c.url;
        }
      });
    });

    return out;
  }

  /* ── Filter / render / selection ──
     Empty query: Actions + Jump to + Go to page only (Spotlight-style
     "suggestions"). Typing: everything, filtered, including content. ── */
  var all = [], shown = [], sel = 0;

  function filter(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) {
      shown = all.filter(function (c) { return c.group === 'Actions' || c.group === 'Jump to' || c.group === 'Go to page'; });
    } else {
      shown = all.filter(function (c) {
        return (c.label + ' ' + (c.hint || '') + ' ' + (c.keywords || '')).toLowerCase().indexOf(q) >= 0;
      });
    }
    sel = 0;
    render(q);
  }

  function render(q) {
    listEl.innerHTML = '';
    if (!shown.length) {
      var e = document.createElement('div');
      e.className = 'cmdk-empty';
      e.textContent = 'No results';
      listEl.appendChild(e);
      countEl.textContent = '';
      return;
    }
    var lastGroup = null;
    shown.forEach(function (c, i) {
      if (c.group && c.group !== lastGroup) {
        lastGroup = c.group;
        var g = document.createElement('div');
        g.className = 'cmdk-group';
        g.textContent = c.group;
        listEl.appendChild(g);
      }
      var row = document.createElement('div');
      row.className = 'cmdk-row' + (i === sel ? ' cmdk-sel' : '');
      row.dataset.i = i;
      row.innerHTML =
        '<span class="cmdk-ic">' + c.icon + '</span>' +
        '<span class="cmdk-txt"><span class="cmdk-label">' + esc(c.label) + '</span>' +
        (c.hint ? '<span class="cmdk-hint">' + esc(c.hint) + '</span>' : '') + '</span>';
      row.addEventListener('mousemove', function () { if (sel !== i) { sel = i; paintSel(); } });
      row.addEventListener('click', function () { sel = i; execSel(); });
      listEl.appendChild(row);
    });
    // Only count as "results" once the person is actually searching —
    // matches the Spotlight example: N results shown while typing.
    countEl.textContent = q ? (shown.length + (shown.length === 1 ? ' result' : ' results')) : '';
  }

  function paintSel() {
    var rows = listEl.querySelectorAll('.cmdk-row');
    Array.prototype.forEach.call(rows, function (r) {
      r.classList.toggle('cmdk-sel', Number(r.dataset.i) === sel);
    });
    var cur = listEl.querySelector('.cmdk-row.cmdk-sel');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  function move(d) {
    if (!shown.length) return;
    sel = (sel + d + shown.length) % shown.length;
    paintSel();
  }

  function execSel() {
    var c = shown[sel];
    if (!c) return;
    if (c.noAutoClose) {
      var row = listEl.querySelector('.cmdk-row[data-i="' + sel + '"]');
      try { c.run(row); } catch (e) {}
      return;
    }
    close();
    setTimeout(function () { try { c.run(); } catch (e) {} }, 60);
  }

  /* ── Open / close ── */
  function isOpen() { return overlay.classList.contains('cmdk-show'); }
  function open() {
    all = buildCommands();
    input.value = '';
    filter('');
    overlay.classList.add('cmdk-show');
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() { overlay.classList.remove('cmdk-show'); }
  function toggle() { isOpen() ? close() : open(); }

  /* ── Keyboard: capture phase so we win ⌘K over the browser and Esc over
     the chat's own Escape handler. ── */
  document.addEventListener('keydown', function (e) {
    var isK = (e.key === 'k' || e.key === 'K');
    if ((e.metaKey || e.ctrlKey) && isK) {
      e.preventDefault();
      toggle();
      return;
    }
    if (!isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); execSel(); }
  }, true);

  /* ── Init ── */
  function start() { injectCss(); buildUI(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
