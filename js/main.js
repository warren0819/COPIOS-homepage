if (window.top !== window.self) {
  try { window.top.location = window.self.location; } catch {}
}

(function(){
  
  var cv=document.getElementById('cycle'),ctx=cv.getContext('2d');
  var tagA=document.getElementById('tagA'),tagB=document.getElementById('tagB');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W,H,DPR,cx,cy,A,P=[],N,mx=0,my=0,tx=0,ty=0;
  function size(){
    DPR=Math.min(window.devicePixelRatio||1,2);
    W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
    var mob=W<700,cr=cv.getBoundingClientRect(),h1=document.querySelector('.hero h1'),ia=h1&&h1.querySelector('.a');
    var dy=0;if(h1){var m=new DOMMatrix(getComputedStyle(h1).transform);dy=m.m42||0;}
    var ht=h1?h1.getBoundingClientRect().top-cr.top-dy:H*.6,xe=W*.55;
    if(ia){var rg=document.createRange();rg.selectNodeContents(ia);xe=rg.getBoundingClientRect().right-cr.left;}
    A=Math.max(120,Math.min(W*.46,(ht-90)/.79));cx=W-A*.88;cy=ht-A*.38;
    N=Math.max(1200,Math.min(5400,Math.round(A*8)));
    P=[];for(var i=0;i<N;i++){P.push({t:Math.random()*Math.PI*2,s:(.0016+Math.random()*.0026)*(Math.random()<.5?1:1),o:(Math.random()-.5)*(Math.random()<.85?.09:.32),z:Math.random(),r:Math.random()*1.3+.25});}
    var la=pt(0,0),lb=pt(Math.PI,0);
    tagA.style.left=Math.min(la.x-30,W-tagA.offsetWidth-24)+'px';tagA.style.top=(la.y-60)+'px';
    tagB.style.left=(lb.x-(mob?40:50))+'px';tagB.style.top=(lb.y-60)+'px';
    ctx.fillStyle='#06080c';ctx.fillRect(0,0,W,H);
    var hs=cv.parentNode.style;hs.setProperty('--vx',(cx/W*100).toFixed(1)+'%');hs.setProperty('--vy',(cy/H*100).toFixed(1)+'%');
  }
  function pt(t,o){
    var s=Math.sin(t),c=Math.cos(t),d=1+s*s;
    var x=A*c/d,y=A*s*c/d*1.15;
    var nx=-(A*s*(1+s*s)+A*c*2*s*c)/(d*d),ny=A*(c*c-s*s)/d; var l=Math.hypot(nx,ny)||1;
    return {x:cx+x+(-ny/l)*o*A,y:cy+y+(nx/l)*o*A};
  }
  function fl(m,c){ctx.globalCompositeOperation=m;ctx.fillStyle=c;ctx.fillRect(0,0,W,H);}
  function step(){
    tx+=(mx-tx)*.04;ty+=(my-ty)*.04;
    ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='rgba(6,8,12,.11)';ctx.fillRect(0,0,W,H);
    if(++fc%3===0){fl('lighten','#06080c');fl('difference','#06080c');fl('difference','#fff');fl('lighter','#010101');fl('difference','#fff');fl('lighter','#06080c');}
    ctx.globalCompositeOperation='lighter';
    for(var i=0;i<N;i++){var p=P[i];p.t+=p.s*.95/spd(p.t);var q=pt(p.t,p.o+Math.sin(p.t*3+p.z*6)*.012);
      var px=q.x+tx*(p.z-.5)*30,py=q.y+ty*(p.z-.5)*30;
      var a=.28+p.z*.62;ctx.fillStyle=p.z>.93?'rgba(255,241,205,'+a+')':'rgba(217,184,108,'+(a*.8)+')';
      ctx.fillRect(px,py,p.r,p.r);}
  }
  function spd(t){var s=Math.sin(t),c=Math.cos(t),d=1+s*s;return Math.hypot((s*(1+s*s)+c*2*s*c)/(d*d),(c*c-s*s)/d*1.15);}
  function frame(now){
    if(!run)return;
    if(!lt)lt=now;
    acc+=Math.min(now-lt,100);lt=now;
    var n=0;while(acc>=STEP&&n<4){step();acc-=STEP;n++;}
    requestAnimationFrame(frame);
  }
  var run=false,fc=0,lt=0,acc=0,STEP=1000/60;
  size();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(size);
  var go=function(){if(reduce){for(var k=0;k<120;k++)step();return}run=true;lt=0;acc=0;requestAnimationFrame(frame);if('IntersectionObserver' in window){new IntersectionObserver(function(en){var v=en[0].isIntersecting;if(v&&!run){run=true;lt=0;acc=0;requestAnimationFrame(frame)}else if(!v){run=false}}).observe(cv)}};
  if(document.readyState==='complete')setTimeout(go,300);else window.addEventListener('load',function(){setTimeout(go,300)});
  window.addEventListener('resize',size);
  window.addEventListener('pointermove',function(e){mx=e.clientX/W-.5;my=e.clientY/H-.5},{passive:true});

  
  var links={};document.querySelectorAll('.nav a.l').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
  if('IntersectionObserver' in window){
    var spy=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){for(var k in links)links[k].classList.toggle('on',k===x.target.id)}})},{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(links).forEach(function(k){var el=document.getElementById(k);if(el)spy.observe(el)});
    var heroSpy=new IntersectionObserver(function(en){if(en[0].isIntersecting)for(var k in links)links[k].classList.remove('on')},{threshold:.6});
    heroSpy.observe(document.querySelector('.hero'));
  }
  
  var navH=function(){var n=document.querySelector('.nav');return n?n.getBoundingClientRect().bottom+24:96};
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href').slice(1),sec=document.getElementById(id);
      if(!sec)return;
      e.preventDefault();
      var inner=sec.querySelector('.w')||sec;
      var rc=inner.getBoundingClientRect(),nh=navH(),avail=window.innerHeight-nh;
      var y=rc.top+window.scrollY-(rc.height<avail?Math.max(nh,(window.innerHeight-rc.height)/2):nh);
      if(id==='top')y=0;
      window.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});
      if(history.replaceState)history.replaceState(null,'','#'+id);
    });
  });

  
  document.querySelectorAll('.tile').forEach(function(t){t.addEventListener('pointermove',function(e){var r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')})});

  
  var els=document.querySelectorAll('.fx');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e)});
})();

(function () {
  var b = document.body;
  var upd = function () { b.classList.toggle('nav-wide', window.scrollY > 8); };
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  upd();
})();

(function () {
  var FOUNDED = 2026;
  var now = new Date().getFullYear();
  document.getElementById('year').textContent =
    now > FOUNDED ? FOUNDED + '-' + now : String(FOUNDED);
})();

const T1 = 5;
const T2 = 4000;

const brand = document.querySelector('.brand');
const libModal = document.getElementById('libModal');
const libList = document.getElementById('libList');
const libCancel = document.getElementById('libCancel');
const pwModal = document.getElementById('pwModal');
const pwForm = document.getElementById('pwForm');
const pwInput = document.getElementById('pwInput');
const pwError = document.getElementById('pwError');
const pwCaps = document.getElementById('pwCaps');
const capsCheck = (e) => {
  if (e.getModifierState) pwCaps.hidden = !e.getModifierState('CapsLock');
};
['keydown', 'keyup', 'click'].forEach((t) => pwInput.addEventListener(t, capsCheck));
pwInput.addEventListener('blur', () => { pwCaps.hidden = true; });
const pwCancel = document.getElementById('pwCancel');
const deck = document.getElementById('deck');
const deckFrame = document.getElementById('deckFrame');

let c1 = 0;
let t1 = null;

brand.addEventListener('click', (e) => {
  c1 += 1;
  clearTimeout(t1);
  t1 = setTimeout(() => { c1 = 0; }, T2);
  if (c1 >= T1) {
    c1 = 0;
    e.preventDefault();
    if (keyCache) openLibrary(); else openPwModal();
  }
});

function renderLibrary(docs) {
  libList.textContent = '';
  docs.forEach((doc, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lib-item';
    btn.innerHTML =
      '<span class="lib-no"></span>' +
      '<span class="lib-text"><span class="lib-name"></span>' +
      '<span class="lib-desc"></span></span>';
    btn.querySelector('.lib-no').textContent = doc.no;
    btn.querySelector('.lib-name').textContent = doc.name;
    btn.querySelector('.lib-desc').textContent = doc.desc;
    btn.addEventListener('click', () => {
      if (doc.f) fsEnter();
      selectDoc(i);
    });
    li.appendChild(btn);
    libList.appendChild(li);
  });
}

function fsEnter() {
  const el = document.documentElement;
  if (document.fullscreenElement || !el.requestFullscreen) return;
  el.requestFullscreen().catch(() => {});
}

function fsLeave() {
  if (!document.fullscreenElement || !document.exitFullscreen) return;
  document.exitFullscreen().catch(() => {});
}

let ovState = false;
let ovPopping = false;

const ovOpen = () => !deck.hidden || !libModal.hidden || !pwModal.hidden;

function ovEnter() {
  if (ovState) return;
  ovState = true;
  history.pushState({ v: 1 }, '');
}

function ovLeave() {
  if (!ovState) return;
  ovState = false;
  ovPopping = true;
  history.back();
}

window.addEventListener('popstate', () => {
  if (ovPopping) { ovPopping = false; return; }
  ovState = false;
  if (!ovOpen()) return;
  deck.hidden = true;
  libModal.hidden = true;
  pwModal.hidden = true;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  frameReset();
  fsLeave();
});

function openLibrary() {
  libModal.hidden = false;
  libList.querySelector('.lib-item')?.focus();
  ovEnter();
}

function closeLibrary() {
  libModal.hidden = true;
}

function exitLibrary() {
  closeLibrary();
  ovLeave();
}

libCancel.addEventListener('click', exitLibrary);

function openPwModal() {
  pwError.hidden = true;
  pwCaps.hidden = true;
  pwInput.value = '';
  pwModal.hidden = false;
  pwInput.focus();
  ovEnter();
}

function closePwModal() {
  pwModal.hidden = true;
}

function exitPwModal() {
  closePwModal();
  ovLeave();
}

pwCancel.addEventListener('click', exitPwModal);

const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

let payloadCache = null;
let keyCache = null;
let docsCache = null;
let pwCache = null;

async function loadPayload() {
  if (payloadCache) return payloadCache;
  const src = window.DECK_ENC ? Promise.resolve(window.DECK_ENC) : fetch('assets/data.bin')
    .then((res) => { if (!res.ok) throw new Error('e'); return res.json(); });
  payloadCache = await src;
  return payloadCache;
}

function itemAt(payload, index) {
  if (Array.isArray(payload.items)) return payload.items[index];
  return index === 0 ? { iv: payload.iv, data: payload.data } : undefined;
}

async function readIndex(payload, key) {
  if (payload.index) {
    return JSON.parse(await decryptItem(payload.index, key));
  }
  const count = Array.isArray(payload.items) ? payload.items.length : 1;
  return Array.from({ length: count }, (_, i) => ({
    no: String(i + 1).padStart(2, '0'), name: '자료 ' + (i + 1), desc: '',
  }));
}

async function deriveKey(payload, password) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(payload.salt), iterations: payload.iter, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
}

async function decryptItem(item, key) {
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(item.iv) }, key, b64ToBytes(item.data)
  );
  return new TextDecoder().decode(plain);
}

async function unlock(payload, password) {
  if (Array.isArray(payload.keys)) {
    const km = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
    );
    const rs = await Promise.all(payload.keys.map(async (b) => {
      try {
        const k = await crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: b64ToBytes(b.salt), iterations: payload.iter, hash: 'SHA-256' },
          km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
        );
        return JSON.parse(await decryptItem(b, k));
      } catch { return null; }
    }));
    const hit = rs.filter(Boolean)[0];
    if (!hit) throw new Error('e');
    keyCache = 1;
    return Array.isArray(hit) ? { a: 1, d: hit } : hit;
  }
  const key = await deriveKey(payload, password);
  const docs = await readIndex(payload, key);
  keyCache = key;
  return { a: 1, d: docs };
}

async function selectDoc(index) {
  const doc = docsCache ? docsCache[index] : null;
  const item = itemAt(payloadCache, doc && doc.i != null ? doc.i : index);
  if (!item) return;
  let key = keyCache;
  if (doc && doc.k) {
    key = await crypto.subtle.importKey('raw', b64ToBytes(doc.k), 'AES-GCM', false, ['decrypt']);
  }
  closeLibrary();
  openDeck(await decryptItem(item, key), pwCache);
}

pwForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = pwForm.querySelector('button[type=submit]');
  submitBtn.disabled = true;
  let payload;
  try {
    payload = await loadPayload();
  } catch {
    pwError.textContent = '지금은 열 수 없습니다. 잠시 후 다시 시도해 주세요.';
    pwError.hidden = false;
    submitBtn.disabled = false;
    return;
  }
  try {
    const bundle = await unlock(payload, pwInput.value);
    docsCache = bundle.d;
    pwCache = bundle.a ? null : pwInput.value;
    renderLibrary(docsCache);
    closePwModal();
    openLibrary();
  } catch {
    pwError.textContent = '비밀번호가 일치하지 않습니다.';
    pwError.hidden = false;
    pwInput.select();
  } finally {
    submitBtn.disabled = false;
  }
});

let deckUrl = null;

function frameGo(url) {
  const w = deckFrame.contentWindow;
  if (w) w.location.replace(url);
  else deckFrame.src = url;
}

function frameReset() {
  frameGo('about:blank');
  if (deckUrl) { URL.revokeObjectURL(deckUrl); deckUrl = null; }
}

function openDeck(html, pw) {
  let src = html;
  if (pw) {
    const tag = '<script>window.__CK=' +
      JSON.stringify(pw).replace(/</g, '\\u003c') + ';<\/script>';
    const m = /<head[^>]*>|<html[^>]*>|<!doctype[^>]*>/i.exec(html);
    const at = m ? m.index + m[0].length : 0;
    src = html.slice(0, at) + tag + html.slice(at);
  }
  const blob = new Blob([src], { type: 'text/html' });
  if (deckUrl) URL.revokeObjectURL(deckUrl);
  deckUrl = URL.createObjectURL(blob);
  frameGo(deckUrl);
  deck.hidden = false;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  deckFrame.addEventListener('load', () => deckFrame.contentWindow?.focus(), { once: true });
  ovEnter();
}

function closeDeck() {
  fsLeave();
  deck.hidden = true;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  frameReset();
  if (keyCache) openLibrary();
  else ovLeave();
}

window.addEventListener('message', (e) => {
  if (e.source !== deckFrame.contentWindow) return;
  if (e.data === 'copios:home') closeDeck();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!pwModal.hidden) { exitPwModal(); return; }
  if (!deck.hidden) { closeDeck(); return; }
  if (!libModal.hidden) exitLibrary();
});
