(()=>{
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
let S=Object.assign({lang:'sys',scheme:'sys',accent:'sky',glass:1,haptic:1,bright:100},JSON.parse(localStorage.cd||'{}'));
const save=()=>localStorage.cd=JSON.stringify(S);
const lc=()=>S.lang!='sys'?S.lang:(navigator.language||'en').startsWith('ja')?'ja':'en';
const t=(k,n)=>(I18N[lc()][k]||k).replace('{n}',n||'');
const hap=()=>S.haptic&&navigator.vibrate&&navigator.vibrate(8);
let tt;const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),2000)};
const fmt=b=>b>1e9?(b/1e9).toFixed(1)+' GB':b>1e6?(b/1e6).toFixed(1)+' MB':Math.round(b/1e3)+' KB';
const P={mir:'<path d="M12 3v18"/><path d="M8 7 3 17h5z"/><path d="M16 7l5 10h-5z"/>',pip:'<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="11" width="7" height="5" rx="1"/>',fs:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',opt:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',sw:'<path d="M20 11a8 8 0 0 0-14-4M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 4M20 20v-4h-4"/>',play:'<path d="M8 5l11 7-11 7z" fill="currentColor"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',chev:'<path d="M9 5l7 7-7 7"/>',ext:'<path d="M8 16 17 7M9 7h8v8"/>',back:'<path d="M15 5l-7 7 7 7"/>'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24">${P[n]}</svg>`;
const FILL={sky:'#0ea5e9',coral:'#ff5f52',green:'#2fa36b',rose:'#ee4d8b',classic:'#0f4c81'};
/* prefs */
function apply(){
 const r=document.documentElement;let sc=S.scheme;if(sc=='sys')sc=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
 r.dataset.scheme=sc;r.dataset.accent=S.accent;r.lang=lc();
 document.body.classList.toggle('glass',!!S.glass);$('#dim').style.opacity=(100-S.bright)/100;
 $('meta[name=theme-color]').content=getComputedStyle(r).getPropertyValue('--a').trim();
 $$('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));
 $('#grid').dataset.e=t('none');$('#back').innerHTML=ic('back')+t('back');$('#ovb').textContent=t('start');
 $('#vShare').textContent=t('share');$('#vDl').textContent=t('dl');$('#vDel').textContent=t('del');$('#vX').textContent=t('close');
 $('#sheetX').textContent=t('close');$('#bMir').classList.toggle('on',isMir());
 $$('#resSeg button').forEach(b=>b.classList.toggle('on',b.dataset.r==res));
}
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',apply);
/* db */
const db=new Promise((ok,ng)=>{const q=indexedDB.open('camdesk',1);q.onupgradeneeded=()=>q.result.createObjectStore('items',{keyPath:'id',autoIncrement:true});q.onsuccess=()=>ok(q.result);q.onerror=ng});
const tx=async(m,f)=>{const d=await db;return new Promise((ok,ng)=>{const x=d.transaction('items',m),r=f(x.objectStore('items'));x.oncomplete=()=>ok(r.result);x.onerror=ng})};
const all=()=>tx('readonly',s=>s.getAll()),del=id=>tx('readwrite',s=>s.delete(id)),clr=()=>tx('readwrite',s=>s.clear());
const add=async i=>{await tx('readwrite',s=>s.add(i));thumb()};
/* camera */
const V=$('#v');let stream,facing='environment',devId='',mirO=null,res='auto',mode='photo',rec=null,wanted=false,tmr;
const RES={auto:{},720:{width:{ideal:1280},height:{ideal:720}},1080:{width:{ideal:1920},height:{ideal:1080}}};
let realFace=true;const isMir=()=>mirO===null?(facing=='user'||!realFace):mirO;
const ov=(m,b)=>{$('#ov').hidden=!m&&!b;$('#ovm').textContent=m||'';$('#ovb').hidden=!b};
function camStop(){if(rec)return;if(stream)stream.getTracks().forEach(x=>x.stop());stream=null;V.srcObject=null}
async function camStart(){
 camStop();
 if(!navigator.mediaDevices)return ov(t('blocked'),false);
 try{
  const vc=Object.assign({},RES[res],devId?{deviceId:{exact:devId}}:{facingMode:{ideal:facing}});
  stream=await navigator.mediaDevices.getUserMedia({video:vc,audio:false});
  V.srcObject=stream;V.play().catch(()=>{});
  const st=stream.getVideoTracks()[0].getSettings();realFace=!!st.facingMode;if(st.facingMode)facing=st.facingMode=='user'?'user':'environment';
  ov('',false);V.classList.toggle('m',isMir());apply();devs(st.deviceId);
 }catch(e){ov(t('blocked'),true)}
}
async function devs(cur){
 const l=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind=='videoinput'),s=$('#dev');
 s.innerHTML=l.map((d,i)=>`<option value="${d.deviceId}">${d.label||'Camera '+(i+1)}</option>`).join('');s.value=cur||'';
}
$('#dev').onchange=e=>{devId=e.target.value;mirO=null;camStart()};
$('#ovb').onclick=()=>{wanted=true;camStart()};
$('#sw').onclick=()=>{facing=facing=='user'?'environment':'user';devId='';mirO=null;wanted=true;camStart()};
$('#bMir').onclick=()=>{mirO=!isMir();V.classList.toggle('m',isMir());apply()};
const pip=$('#bPip');if(!document.pictureInPictureEnabled)pip.hidden=true;
pip.onclick=()=>document.pictureInPictureElement?document.exitPictureInPicture():V.requestPictureInPicture().catch(()=>{});
const st=$('#stage'),rf=st.requestFullscreen||st.webkitRequestFullscreen;
if(!rf&&!V.webkitEnterFullscreen)$('#bFs').hidden=true;
$('#bFs').onclick=()=>{if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else if(rf)rf.call(st);else V.webkitEnterFullscreen()};
$('#bOpt').onclick=()=>$('#sheet').hidden=false;$('#sheetX').onclick=()=>$('#sheet').hidden=true;$('#sheet').onclick=e=>{if(e.target.id=='sheet')e.target.hidden=true};
$$('#resSeg button').forEach(b=>b.onclick=()=>{res=b.dataset.r;apply();camStart()});
$$('#modes button').forEach(b=>b.onclick=()=>{if(rec)return;mode=b.dataset.m;$$('#modes button').forEach(x=>x.classList.toggle('on',x==b));$('#shut').classList.toggle('v',mode=='video')});
async function snap(){
 if(!stream||!V.videoWidth)return;const c=document.createElement('canvas');c.width=V.videoWidth;c.height=V.videoHeight;const x=c.getContext('2d');
 if(isMir()){x.translate(c.width,0);x.scale(-1,1)}x.drawImage(V,0,0);
 const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));await add({type:'photo',blob:b,ts:Date.now()});
 st.animate([{opacity:.2},{opacity:1}],160);
}
async function recToggle(){
 if(!stream)return;if(rec){rec.stop();return}
 let s=stream;try{const a=await navigator.mediaDevices.getUserMedia({audio:true});s=new MediaStream([...stream.getVideoTracks(),...a.getAudioTracks()])}catch(e){}
 const mt=['video/mp4;codecs=avc1','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||'';
 const ch=[];rec=new MediaRecorder(s,mt?{mimeType:mt}:{});
 rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
 rec.onstop=async()=>{clearInterval(tmr);s.getAudioTracks().forEach(x=>x.stop());rec=null;$('#rec').hidden=true;$('#shut').classList.remove('rec');
  await add({type:'video',blob:new Blob(ch,{type:(mt||'video/webm').split(';')[0]}),ts:Date.now()})};
 rec.start(1000);const t0=Date.now();$('#rec').hidden=false;$('#shut').classList.add('rec');
 tmr=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1e3);$('#tm').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},500);
}
$('#shut').onclick=()=>mode=='photo'?snap():recToggle();
/* gallery */
let urls=[],lastU,cv;
async function renderGrid(){
 urls.forEach(URL.revokeObjectURL);urls=[];const g=$('#grid');g.innerHTML='';
 (await all()).reverse().forEach(i=>{const b=document.createElement('button'),u=URL.createObjectURL(i.blob);urls.push(u);
  if(i.type=='photo')b.style.backgroundImage=`url(${u})`;else b.innerHTML=`<video src="${u}#t=0.1" preload="metadata" muted playsinline style="width:100%;height:100%;object-fit:cover"></video><span class="pl">${ic('play')}</span>`;
  b.onclick=()=>openV(i);g.append(b)});
}
async function thumb(){const a=await all(),l=a[a.length-1],e=$('#last');if(lastU)URL.revokeObjectURL(lastU);lastU=null;e.style.backgroundImage='';e.textContent='';
 if(l){if(l.type=='photo'){lastU=URL.createObjectURL(l.blob);e.style.backgroundImage=`url(${lastU})`}else e.innerHTML=ic('play')}e.onclick=()=>l&&openV(l)}
const fname=i=>`camdesk-${new Date(i.ts).toISOString().replace(/[:.]/g,'-')}.${i.type=='photo'?'jpg':i.blob.type.includes('mp4')?'mp4':'webm'}`;
function openV(i){cv=i;const u=URL.createObjectURL(i.blob);$('#vbox').innerHTML=i.type=='photo'?`<img src="${u}">`:`<video src="${u}" controls autoplay playsinline></video>`;$('#viewer').hidden=false}
const closeV=()=>{$('#vbox').innerHTML='';$('#viewer').hidden=true};
function dl(){const a=document.createElement('a');a.href=URL.createObjectURL(cv.blob);a.download=fname(cv);a.click();toast(t('dl'))}
$('#vX').onclick=closeV;$('#vDl').onclick=dl;
$('#vShare').onclick=()=>{const f=new File([cv.blob],fname(cv),{type:cv.blob.type});navigator.canShare&&navigator.canShare({files:[f]})?navigator.share({files:[f]}).catch(()=>{}):dl()};
$('#vDel').onclick=async()=>{await del(cv.id);closeV();renderGrid();thumb()};
$('#clearAll').onclick=async()=>{if(confirm(t('ask'))){await clr();renderGrid();thumb()}};
/* tabs */
let cur='home';
function show(v){cur=v;$$('.view').forEach(e=>e.classList.toggle('on',e.id==v));$$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));
 if(v=='home'){if(wanted)camStart();else ov('',true)}else if(!document.pictureInPictureElement)camStop();if(v=='storage')renderGrid()}
$$('#tabs button').forEach(b=>b.onclick=()=>show(b.dataset.v));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(!document.pictureInPictureElement)camStop()}else if(cur=='home'&&wanted)camStart()});
document.addEventListener('click',e=>{if(e.target.closest('button,label,a'))hap()});
/* settings */
let pg=null;const TT={refs:'refs',lang:'lang',look:'appearance',free:'free',terms:'terms'};
const row=(a,l,v)=>`<button data-a="${a}">${l}<span class="sp"></span>${v?`<span class="v">${v}</span>`:''}<span class="c">${ic('chev')}</span></button>`;
const link=(u,l)=>`<a href="${u}" target="_blank" rel="noopener">${l}<span class="sp"></span><span class="c">${ic('ext')}</span></a>`;
function renderRoot(){
 const ln=S.lang=='sys'?t('sys'):S.lang=='ja'?'日本語':'English';
 $('#sroot').innerHTML=`<div class="list">${row('refs',t('refs'))}${row('lang',t('lang'),ln)}${row('look',t('appearance'))}${row('free',t('free'))}${row('terms',t('terms'))}</div>
 <div class="sec">${t('community')}</div><div class="list">${link(CFG.discord,t('discord'))}${link(CFG.sns,t('follow',CFG.name))}${CFG.sites.map(s=>link(s.u,s.t)).join('')}</div>`;
 $$('#sroot [data-a]').forEach(b=>b.onclick=()=>openP(b.dataset.a));
}
function openP(k){pg=k;renderP();$('#spage').classList.add('on')}
$('#back').onclick=()=>{$('#spage').classList.remove('on');pg=null};
function refresh(){apply();renderRoot();if(pg)renderP();renderGrid()}
async function renderP(){
 const b=$('#sbody');$('#sttl').textContent=t(TT[pg]);
 if(pg=='refs')b.innerHTML=CFG.refs.map(r=>`<a class="ref" href="${r.url}" target="_blank" rel="noopener"><b>${r.title}</b><small>${r.author}</small><small>${r.id}</small></a>`).join('');
 if(pg=='terms')b.innerHTML=`<div class="terms">${t('termsBody')}</div>`;
 if(pg=='lang'){
  const it=(c,l)=>`<button data-l="${c}">${l}<span class="ck">${S.lang==c?ic('check'):''}</span></button>`;
  b.innerHTML=`<div class="list">${it('sys',t('sys'))}</div><div class="sec">en</div><div class="list">${it('en','English')}</div><div class="sec">jp</div><div class="list">${it('ja','日本語')}</div>`;
  $$('[data-l]',b).forEach(x=>x.onclick=()=>{S.lang=x.dataset.l;save();refresh()});
 }
 if(pg=='look'){
  const rd=(g,v,l,pre='')=>`<button data-g="${g}" data-v="${v}">${pre}${l}<span class="ck">${S[g]==v?ic('check'):''}</span></button>`;
  b.innerHTML=`<div class="sec">${t('mode')}</div><div class="list">${rd('scheme','sys',t('sysm'))}${rd('scheme','light',t('light'))}${rd('scheme','dark',t('dark'))}</div>
  <div class="sec">${t('theme')}</div><div class="list">${Object.keys(FILL).map(k=>rd('accent',k,t(k),`<span class="dot" style="background:${FILL[k]}"></span>`)).join('')}</div>
  <div class="list" style="margin-top:20px"><label>${t('glass')}<input type="checkbox" class="sw" id="oG" ${S.glass?'checked':''}></label><label>${t('haptic')}<input type="checkbox" class="sw" id="oH" ${S.haptic?'checked':''}></label>
  <div style="display:block">${t('bright')}<input type="range" id="oB" min="40" max="100" value="${S.bright}"></div></div>`;
  $$('[data-g]',b).forEach(x=>x.onclick=()=>{S[x.dataset.g]=x.dataset.v;save();apply();renderP()});
  $('#oG').onchange=e=>{S.glass=+e.target.checked;save();apply()};$('#oH').onchange=e=>{S.haptic=+e.target.checked;save();if(S.haptic)hap()};
  $('#oB').oninput=e=>{S.bright=+e.target.value;save();apply()};
 }
 if(pg=='free'){
  let cap=0,ch=0;(await all()).forEach(i=>cap+=i.blob.size);
  try{for(const k of await caches.keys()){const c=await caches.open(k);for(const r of await c.keys())ch+=(await(await c.match(r)).blob()).size}}catch(e){}
  const e=navigator.storage&&navigator.storage.estimate?await navigator.storage.estimate():{},tot=cap+ch,p=tot?cap/tot*100:0;
  if(pg!='free')return;
  b.innerHTML=`<div class="donut"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--line)" stroke-width="4"/>
   ${tot?`<circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--a)" stroke-width="4" stroke-dasharray="${p} ${100-p}"/><circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f5a623" stroke-width="4" stroke-dasharray="${100-p} ${p}" stroke-dashoffset="${-p}"/>`:''}</svg>
   <div>${fmt(tot)}<small>${t('usage')}</small></div></div>${e.quota?`<p class="sec" style="text-align:center">${t('avail')}: ${fmt(e.quota-e.usage)}</p>`:''}
   <div class="list"><label><span class="dot"></span>${t('caps')}<span class="sp"></span><span class="v">${fmt(cap)}</span><input type="checkbox" data-k="cap"></label>
   <label><span class="dot" style="background:#f5a623"></span>${t('cache')}<span class="sp"></span><span class="v">${fmt(ch)}</span><input type="checkbox" data-k="ch"></label></div>
   <button class="btn full" id="dsel" disabled>${t('delsel')}</button>`;
  const ks=$$('[data-k]',b),bt=$('#dsel');ks.forEach(k=>k.onchange=()=>bt.disabled=!ks.some(x=>x.checked));
  bt.onclick=async()=>{const sel=ks.filter(x=>x.checked).map(x=>x.dataset.k);if(!confirm(t('ask')+(sel.includes('ch')?t('askc'):'')))return;
   if(sel.includes('cap'))await clr();if(sel.includes('ch'))for(const k of await caches.keys())await caches.delete(k);
   toast(t('done'));thumb();renderP()};
 }
}
/* init */
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
$$('[data-ic]').forEach(e=>e.innerHTML=ic(e.dataset.ic));apply();renderRoot();thumb();
if(navigator.permissions)navigator.permissions.query({name:'camera'}).then(p=>{if(p.state=='granted'){wanted=true;if(cur=='home')camStart()}else ov('',true)}).catch(()=>ov('',true));else ov('',true);
})();