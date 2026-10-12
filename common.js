/* Atlas shared runtime: data helpers, shared state, skin switcher, drawer */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ini=n=>(n.match(/[A-Za-z0-9\u4e00-\u9fa5]+/g)||['·']).map(w=>w[0]).join('').slice(0,2);
const CATS=[...new Set(D.filter(x=>!x.p).map(x=>x.c))];const CN={};D.forEach(x=>CN[x.c]=x.cn);
const LSG=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const ST=Object.assign({tab:'tool',cat:null,tags:[],q:'',sort:'cat'},LSG('atlas-state',{}));
const FAV=new Set(LSG('atlas-fav',[]));
function saveST(){localStorage.setItem('atlas-state',JSON.stringify(ST))}
function togFav(u){FAV.has(u)?FAV.delete(u):FAV.add(u);localStorage.setItem('atlas-fav',JSON.stringify([...FAV]));document.dispatchEvent(new CustomEvent('fav'))}
const hit=(x,q)=>{q=(q||'').toLowerCase().trim();return !q||q.split(/\s+/).every(w=>(x.n+' '+x.d+' '+x.o+' '+x.zh+' '+x.dom+' '+x.cn+' '+x.c+' '+x.tags.join(' ')).toLowerCase().includes(w))};
const inTab=x=>ST.tab==='fav'?FAV.has(x.u):ST.tab==='person'?x.p:!x.p;
const sorter=(a,b)=>ST.sort==='az'?a.n.localeCompare(b.n):(b.sp-a.sp)||a.c.localeCompare(b.c)||(!!b.img-!!a.img)||a.n.localeCompare(b.n);
/* items for current tab+cat+tags+query; opts.noCat ignores category */
function results(o={}){return D.filter(x=>inTab(x)&&(o.noCat||!ST.cat||ST.tab!=='tool'||x.c===ST.cat)&&ST.tags.every(t=>x.tags.includes(t))&&hit(x,ST.q)).sort(sorter)}
function tagCounts(){const m={};D.filter(x=>inTab(x)&&(!ST.cat||ST.tab!=='tool'||x.c===ST.cat)).forEach(x=>x.tags.forEach(t=>m[t]=(m[t]||0)+1));ST.tags.forEach(t=>m[t]=m[t]||0);return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,20)}
function toggleTag(t){const i=ST.tags.indexOf(t);i<0?ST.tags.push(t):ST.tags.splice(i,1);saveST()}
function randomPick(){const r=results(),a=r.length?r:D;return a[Math.floor(Math.random()*a.length)]}
/* theme */
const SKINS=[['magazine','杂志'],['terminal','终端'],['canvas','地图'],['swiss','海报'],['bento','便当盒']];
const SKIN=document.documentElement.dataset.skin,THEMED=document.documentElement.dataset.themed==='1';
if(THEMED)document.documentElement.dataset.theme=localStorage.getItem('atlas-theme')||(SKIN==='bento'?'dark':'light');
localStorage.setItem('atlas-skin',SKIN);
function setTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem('atlas-theme',t);document.dispatchEvent(new CustomEvent('theme'))}
/* switcher strip */
const SWCSS=`#sw{position:fixed;top:0;left:0;right:0;height:40px;z-index:200;display:flex;align-items:center;gap:10px;padding:0 14px;background:rgba(18,18,18,.92);color:#eee;backdrop-filter:blur(12px);font:12.5px Inter,"PingFang SC","Noto Sans CJK SC",sans-serif;border-bottom:1px solid rgba(255,255,255,.08)}
#sw .b{font-weight:600;letter-spacing:-.01em}#sw .b i{color:#ff5a2e;font-style:normal}#sw .h{color:#999;font-size:11.5px;margin-left:8px}#sw .sp{flex:1}
#sw .sk{display:flex;background:rgba(255,255,255,.07);border-radius:999px;padding:3px}#sw .sk a{color:#bbb;text-decoration:none;padding:4px 13px;border-radius:999px;transition:all .25s}#sw .sk a:hover{color:#fff}#sw .sk a.on{background:#fff;color:#111;font-weight:600}
#sw .th{border:1px solid rgba(255,255,255,.18);background:none;color:#eee;border-radius:999px;padding:4px 12px;cursor:pointer;font:inherit}#sw .fx{color:#888;font-size:11.5px}
body{padding-top:40px}body.atlas-in{animation:atlasIn .5s cubic-bezier(.16,1,.3,1)}body.atlas-out{opacity:0;transform:scale(.985);filter:blur(4px);transition:all .3s ease-in}
@keyframes atlasIn{from{opacity:0;transform:scale(1.01);filter:blur(4px)}}`;
document.head.insertAdjacentHTML('beforeend',`<style>${SWCSS}</style>`);
function mountSwitcher(){document.body.classList.add('atlas-in');
 document.body.insertAdjacentHTML('afterbegin',`<div id="sw"><span class="b">Atlas<i>.</i></span><span class="h">状态在各风格间同步 · 按 / 搜索</span><span class="sp"></span><span>风格</span><nav class="sk">${SKINS.map(([k,l])=>`<a href="${k}.html" class="${k===SKIN?'on':''}" data-k="${k}">${l}</a>`).join('')}</nav>${THEMED?'<button class="th" id="swth">◐ 深 / 浅</button>':'<span class="fx">固定配色</span>'}</div>`);
 $$('#sw .sk a').forEach(a=>a.onclick=e=>{if(a.dataset.k===SKIN)return e.preventDefault();e.preventDefault();saveST();document.body.classList.add('atlas-out');setTimeout(()=>location.href=a.getAttribute('href'),280)});
 const th=$('#swth');if(th)th.onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
 addEventListener('keydown',e=>{const q=$('#q');if(e.key==='/'&&q&&document.activeElement!==q&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();q.focus()}});
 addEventListener('pageshow',e=>{if(e.persisted)document.body.classList.remove('atlas-out')})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mountSwitcher):mountSwitcher();
/* generic drawer (skins style .dr) */
function ensureDrawer(){if($('#dr'))return;document.body.insertAdjacentHTML('beforeend','<div class="ov" id="ov"></div><aside class="dr" id="dr"></aside><div class="toast" id="toast"></div>');$('#ov').onclick=closeDrawer;addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()})}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),1400)}
function copyLink(u){const done=()=>toast('链接已复制');const fb=()=>{const t=document.createElement('textarea');t.value=u;document.body.append(t);t.select();document.execCommand('copy');t.remove();done()};navigator.clipboard?navigator.clipboard.writeText(u).then(done,fb):fb()}
function openDrawer(x){ensureDrawer();const d=$('#dr');d.innerHTML=`<button class="dx" id="dx" title="关闭">✕</button><div class="dimg">${x.img?`<img src="${x.img}" alt="">`:`<div class="dph">${esc(ini(x.n))}</div>`}</div>
<div class="dbody"><div class="dk">${esc(x.cn)} / ${esc(x.c)}</div><h2>${esc(x.n)}</h2><p class="dzh">${esc(x.zh)}</p><p class="dd">${esc(x.d)}</p>${x.o&&x.o!==x.d?`<p class="do">索引简介：${esc(x.o)}</p>`:''}
<p class="dm">${x.fav?`<img src="${x.fav}" alt="">`:''}${esc(x.dom)} ${x.oss?'<b>免费/开源</b>':''} ${x.sp?'<b>赞助</b>':''}</p><p class="dm">${x.tags.map(esc).join(' · ')}</p>
<div class="da"><a class="go" href="${esc(x.u)}" target="_blank" rel="noopener">打开网站 ↗</a><button id="dcp">复制链接</button><button id="dfv">${FAV.has(x.u)?'★ 已收藏':'☆ 收藏'}</button></div></div>`;
 d.classList.add('on');$('#ov').classList.add('on');$('#dx').onclick=closeDrawer;$('#dcp').onclick=()=>copyLink(x.u);$('#dfv').onclick=()=>{togFav(x.u);openDrawer(x)}}
function closeDrawer(){$('#dr')&&($('#dr').classList.remove('on'),$('#ov').classList.remove('on'))}
/* attribution */
(function(){const css=`#credit{font-size:12px;line-height:1.7}#credit a{text-decoration:underline;text-underline-offset:3px}
[data-skin=magazine] #credit{flex-basis:100%;color:var(--mute);margin-top:14px}[data-skin=magazine] #credit a{color:var(--acc)}[data-skin=magazine] footer{flex-wrap:wrap}
[data-skin=swiss] #credit{flex-basis:100%;margin-top:10px;text-transform:none;font-weight:600}[data-skin=swiss] #credit a{color:var(--r)}[data-skin=swiss] footer{flex-wrap:wrap}
[data-skin=terminal] #credit{margin-top:40px;border-top:1px dashed var(--dim);padding-top:12px;color:var(--g2)}[data-skin=terminal] #credit:before{content:"# "}[data-skin=terminal] #credit a{color:var(--amb)}
[data-skin=bento] #credit{margin-top:48px;padding:16px 20px;border:1px solid var(--bd);border-radius:18px;background:var(--gl);color:var(--m);backdrop-filter:blur(14px)}[data-skin=bento] #credit a{color:var(--b)}
[data-skin=canvas] #credit{position:fixed;z-index:10;left:50%;bottom:20px;transform:translateX(-50%);max-width:640px;white-space:nowrap;text-align:center;padding:8px 16px;border-radius:14px;background:rgba(255,255,255,.82);backdrop-filter:blur(14px);color:#6b7c86;font-size:11.5px;border:1px solid rgba(19,32,42,.08)}[data-skin=canvas] #credit a{color:#2546ff}`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const html='<div id="credit">初始数据整理自 <a href="https://designeer.xyz" target="_blank" rel="noopener">Designeer</a>，并在此基础上持续补充。预览图、图标与商标归各自网站及权利人所有。</div>';
const mount=()=>{const sk=SKIN,t=sk==='magazine'||sk==='swiss'?$('footer'):sk==='terminal'||sk==='bento'?$('.wrap'):document.body;t.insertAdjacentHTML('beforeend',html)};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mount):mount()})();
