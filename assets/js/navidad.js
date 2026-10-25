/* RiverMarket · Tema navideño (lo activa el administrador en Portada y banners) */
(function(){const C=window.RM_NAV||{};const msg=C.mensaje||'🎄 Navidad en RiverMarket: regala lo hecho por emprendedores';
document.documentElement.classList.add('nav-on');
document.head.insertAdjacentHTML('beforeend',`<style>
.nav-on #bannerTop{background:linear-gradient(90deg,#7f1d1d,#991b1b 35%,#14532d 65%,#166534);color:#fff;font-weight:600;letter-spacing:.01em;padding:7px 10px}
.nav-on #bannerTop a{color:#fff}
.nav-luces{height:14px;position:relative;overflow:hidden;background:#fff;border-bottom:1px solid #eef2f7}
.nav-luces:before{content:'';position:absolute;left:0;right:0;top:-6px;height:12px;border-bottom:1.5px solid #334155;border-radius:0 0 50% 50%/0 0 100% 100%;opacity:.35}
.nav-luces i{position:absolute;top:3px;width:7px;height:10px;border-radius:50% 50% 45% 45%;animation:navTw 2.4s ease-in-out infinite}
@keyframes navTw{0%,100%{opacity:1;filter:brightness(1.15)}50%{opacity:.45;filter:none}}
.nav-gorro{position:absolute;pointer-events:none;width:26px;height:22px;transform:rotate(-18deg)}
.nav-bdg{position:absolute;bottom:10px;right:10px;z-index:3;background:#fff;color:#991b1b;font-weight:700;font-size:11px;padding:4px 8px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.12);border:1px solid #fecaca}
#navNieve{position:fixed;inset:0;pointer-events:none;z-index:60}
.nav-off-btn{position:fixed;left:12px;bottom:88px;z-index:61;width:34px;height:34px;border-radius:50%;border:1px solid #e2e8f0;background:#fff;color:#334155;font-size:16px;box-shadow:0 4px 12px rgba(0,0,0,.12);cursor:pointer}
.nav-sec-h{display:flex;align-items:center;gap:10px}.nav-sec-h span{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#991b1b}
.nav-car{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px}.nav-car>a{flex:0 0 44%;scroll-snap-align:start;background:#fff;border:1px solid #eef2f7;border-radius:16px;overflow:hidden;text-decoration:none;position:relative}@media(min-width:768px){.nav-car>a{flex-basis:calc(20% - 12px)}}
.nav-car img{width:100%;aspect-ratio:1;object-fit:cover}.nav-car .b{padding:10px}.nav-car .n{font-weight:600;color:#0f172a;font-size:14px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.nav-car .t{font-size:12px;color:#64748b}.nav-car .p{font-weight:800;color:#0f172a}.nav-car s{font-size:12px;color:#94a3b8;margin-left:4px}
.nav-wrap{background:linear-gradient(180deg,#fff7f7,#fff);border:1px solid #fde2e2;border-radius:24px;padding:22px}
@media (prefers-reduced-motion:reduce){.nav-luces i{animation:none}}
</style>`);
function luces(){const h=document.querySelector('#cab header');if(!h||document.querySelector('.nav-luces'))return;const d=document.createElement('div');d.className='nav-luces';const cols=['#dc2626','#f59e0b','#16a34a','#2563eb','#e11d48'];let s='';const n=Math.ceil(innerWidth/38);for(let i=0;i<n;i++)s+=`<i style="left:${i*38+12}px;background:${cols[i%5]};box-shadow:0 0 8px ${cols[i%5]};animation-delay:${(i%5)*.45}s"></i>`;d.innerHTML=s;h.after(d)}
function gorro(){const a=document.querySelector('#cab header a[href="index.html"]');if(!a||a.querySelector('.nav-gorro'))return;a.style.position='relative';a.insertAdjacentHTML('beforeend',`<svg class="nav-gorro" style="left:-6px;top:-9px" viewBox="0 0 52 44" aria-hidden="true"><path d="M6 34 C10 14 24 4 40 8 C44 9 47 13 46 17 C40 14 34 16 32 22 L30 34 Z" fill="#dc2626"/><path d="M8 30 C12 16 24 8 38 10" stroke="#b91c1c" stroke-width="2" fill="none" opacity=".5"/><rect x="2" y="31" width="34" height="9" rx="4.5" fill="#fff" stroke="#e5e7eb"/><circle cx="46" cy="18" r="5" fill="#fff" stroke="#e5e7eb"/></svg>`)}
function franja(){const b=document.getElementById('bannerTop');if(b)b.textContent=msg}
function nieve(){if(C.nieve===false||localStorage.getItem('rm_nieve')=='0'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const c=document.createElement('canvas');c.id='navNieve';document.body.appendChild(c);const g=c.getContext('2d');let W,H,F=[];const N=innerWidth<640?22:45;
 const rs=()=>{const d=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;c.width=W*d;c.height=H*d;g.setTransform(d,0,0,d,0,0)};rs();addEventListener('resize',rs);
 for(let i=0;i<N;i++)F.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.2,v:.3+Math.random()*.7,w:Math.random()*6});
 let on=true,last=0;document.addEventListener('visibilitychange',()=>on=!document.hidden);
 const t=ts=>{requestAnimationFrame(t);if(!on||ts-last<33)return;last=ts;g.clearRect(0,0,W,H);g.fillStyle='rgba(203,213,225,.85)';for(const f of F){f.y+=f.v;f.w+=.02;f.x+=Math.sin(f.w)*.3;if(f.y>H){f.y=-4;f.x=Math.random()*W}g.beginPath();g.arc(f.x,f.y,f.r,0,7);g.fill()}};requestAnimationFrame(t);
 const b=document.createElement('button');b.className='nav-off-btn';b.title='Quitar nieve';b.setAttribute('aria-label','Quitar nieve');b.textContent='❄';b.onclick=()=>{localStorage.setItem('rm_nieve','0');c.remove();b.remove()};document.body.appendChild(b)}
async function regalos(){const s=document.getElementById('navRegalos');if(!s)return;
 const {data}=await sb.from('productos').select('id,nombre,precio,precio_antes,fotos,extra,stock,tiendas!inner(nombre,estado)').eq('activo',true).eq('tiendas.estado','activa').or('extra->>navidad.eq.true,precio_antes.not.is.null').gt('stock',0).limit(24);
 const l=(data||[]).sort((a,b)=>((b.extra||{}).navidad?1:0)-((a.extra||{}).navidad?1:0)).slice(0,12);if(!l.length)return;
 s.innerHTML=`<div class="nav-wrap"><div class="nav-sec-h"><span>Temporada navideña</span></div><div style="display:flex;justify-content:space-between;align-items:flex-end;margin:4px 0 14px"><h2 class="text-lg" style="font-size:24px;font-weight:800;color:#0f172a">🎁 Regalos de Navidad</h2><a href="directorio.html" class="font-semibold" style="color:#991b1b">Ver tiendas →</a></div><div class="nav-car">${l.map(p=>{const d=descuento(p);return `<a href="producto.html?id=${p.id}"><div style="position:relative">${(p.extra||{}).navidad?'<span class="nav-bdg">🎄 Navidad</span>':''}${d?`<span style="position:absolute;top:10px;left:10px;z-index:3;background:#dc2626;color:#fff;font-weight:800;font-size:12px;padding:3px 7px;border-radius:8px">-${d}%</span>`:''}<img src="${esc(src(p.fotos[0]))}" alt="" loading="lazy"></div><div class="b"><div class="t">${esc(p.tiendas.nombre)}</div><div class="n">${esc(p.nombre)}</div><span class="p">${soles(p.precio)}</span>${d?`<s>${soles(p.precio_antes)}</s>`:''}</div></a>`}).join('')}</div></div>`;s.hidden=false}
window.navAplicar=()=>{franja();luces();gorro()};navAplicar();nieve();regalos();
})();
