/* RiverMarket · Agenda de citas (tiendas de servicios). Solo guarda la cita: servicio, fecha/hora, nombre y WhatsApp. */
const AG_TZ='-05:00',AG_DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],AG_DIAS_L=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'],
AG_MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre'],
AG_EST={confirmada:['Confirmada','#2563eb','#eff6ff'],atendida:['Atendida','#16a34a','#f0fdf4'],cancelada:['Cancelada','#6b7280','#f3f4f6'],no_asistio:['No asistió','#dc2626','#fef2f2']};
const AG_DEF={activa:false,intervalo:30,anticipacion_dias:14,horario:{1:[['10:00','19:00']],2:[['10:00','19:00']],3:[['10:00','19:00']],4:[['10:00','19:00']],5:[['10:00','19:00']],6:[['10:00','19:00']],7:[]},dias_libres:[],bloqueos:[]};
const agCfg=T=>Object.assign({},AG_DEF,((T.info||{}).agenda)||{});
const agDur=p=>Math.max(15,Math.min(480,+((p.extra||{}).duracion_min)||parseInt((p.extra||{}).duracion)||60));
const agMin=h=>{const [a,b]=h.split(':');return +a*60+ +b},agHH=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
/* fecha local del negocio (UTC-5, sin horario de verano) */
const agHoyN=()=>{const d=new Date(Date.now()-5*36e5);return d.toISOString().slice(0,10)};
const agAddD=(f,n)=>{const d=new Date(f+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const agDow=f=>{const x=new Date(f+'T12:00:00Z').getUTCDay();return x==0?7:x};
const agISO=(f,h)=>new Date(f+'T'+h+':00'+AG_TZ);
const agLocal=d=>{const x=new Date(new Date(d).getTime()-5*36e5);return{f:x.toISOString().slice(0,10),h:x.toISOString().slice(11,16)}};
const agFechaTxt=f=>{const d=new Date(f+'T12:00:00Z');return AG_DIAS_L[agDow(f)-1]+' '+d.getUTCDate()+' de '+AG_MES[d.getUTCMonth()]};
const agHora12=h=>{let [a,b]=h.split(':').map(Number);const s=a>=12?'p. m.':'a. m.';a=a%12||12;return a+':'+String(b).padStart(2,'0')+' '+s};

/* ---- Datos: Supabase o demo local (localStorage) ---- */
const AG_LS='rm_demo_citas_';
function agDemo(T){return !!(T&&(T.demo_local||window.RM_DEMO_LOCAL))}
function agDemoLeer(T){try{return JSON.parse(localStorage.getItem(AG_LS+T.slug)||'null')}catch(e){return null}}
function agDemoGuardar(T,l){localStorage.setItem(AG_LS+T.slug,JSON.stringify(l))}
function agDemoLista(T){let l=agDemoLeer(T);if(!l){l=(window.RM_DEMO_CITAS&&RM_DEMO_CITAS(T))||[];agDemoGuardar(T,l)}return l}
async function agOcupadas(T,desde,hasta){if(agDemo(T))return agDemoLista(T).filter(c=>c.estado!='cancelada').map(c=>({inicio:c.inicio,fin:c.fin}));
const {data,error}=await sb.rpc('citas_ocupadas',{p_tienda:T.id,p_desde:desde.toISOString(),p_hasta:hasta.toISOString()});if(error)throw error;return data||[]}
async function agCrear(T,p,inicio,cliente,tel){if(agDemo(T)){const l=agDemoLista(T),fin=new Date(inicio.getTime()+agDur(p)*6e4);
if(l.some(c=>c.estado!='cancelada'&&new Date(c.inicio)<fin&&new Date(c.fin)>inicio))throw new Error('Ese horario acaba de ser tomado. Elige otro.');
const n=Math.max(0,...l.map(c=>c.numero||0))+1,c={id:'d'+n,numero:n,codigo:'CT-'+String(n).padStart(4,'0'),tienda_id:T.id,producto_id:p.id,servicio:p.nombre,inicio:inicio.toISOString(),fin:fin.toISOString(),cliente,telefono:tel,estado:'confirmada',creado:new Date().toISOString()};l.push(c);agDemoGuardar(T,l);return c}
const {data,error}=await sb.rpc('crear_cita',{p_tienda:T.id,p_producto:p.id,p_inicio:inicio.toISOString(),p_cliente:cliente,p_telefono:tel});if(error)throw error;return data}

/* Horarios libres de un día para un servicio */
function agSlots(T,p,f,ocup){const A=agCfg(T),dur=agDur(p),paso=+A.intervalo||30,out=[];if((A.dias_libres||[]).includes(f))return out;
const ahora=Date.now()+30*6e4;(A.horario[agDow(f)]||A.horario[String(agDow(f))]||[]).forEach(([a,b])=>{for(let m=agMin(a);m+dur<=agMin(b);m+=paso){const h=agHH(m),ini=agISO(f,h),fin=new Date(ini.getTime()+dur*6e4);
if(ini.getTime()<ahora)continue;if((A.bloqueos||[]).some(x=>x.fecha==f&&m<agMin(x.hasta)&&m+dur>agMin(x.desde)))continue;
if(ocup.some(o=>new Date(o.inicio)<fin&&new Date(o.fin)>ini))continue;out.push(h)}});return out}

/* ---- Vista pública: modal "Reservar cita" ---- */
function agCSS(){if(document.getElementById('agcss'))return;document.head.insertAdjacentHTML('beforeend',`<style id="agcss">
.ag-bg{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}
.ag-m{background:#fff;width:100%;max-width:520px;max-height:94vh;overflow:auto;border-radius:20px 20px 0 0;padding:18px 16px 22px;font-family:inherit;color:#1f2937}
@media(min-width:640px){.ag-bg{align-items:center}.ag-m{border-radius:20px}}
.ag-x{float:right;font-size:24px;background:none;border:0;line-height:1;color:#6b7280}
.ag-h{font-size:19px;font-weight:800;margin:0 0 2px}.ag-s{font-size:14px;color:#6b7280;margin:0 0 12px}
.ag-dias{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px}
.ag-d{flex:none;width:62px;border:1.5px solid #e5e7eb;border-radius:14px;padding:8px 0;text-align:center;background:#fff;color:#374151}
.ag-d b{display:block;font-size:20px}.ag-d small{font-size:12px}.ag-d[disabled]{opacity:.35}
.ag-d.on{background:var(--agc);border-color:var(--agc);color:#fff}
.ag-hs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 14px}
.ag-hr{border:1.5px solid #e5e7eb;border-radius:12px;padding:10px 0;font-weight:700;background:#fff;color:#374151;font-size:15px}
.ag-hr.on{background:var(--agc);border-color:var(--agc);color:#fff}
.ag-lbl{font-weight:700;font-size:14px;margin:10px 0 4px;display:block}
.ag-in{width:100%;border:1.5px solid #d1d5db;border-radius:12px;padding:11px 12px;font-size:16px;margin-bottom:6px}
.ag-b{width:100%;border:0;border-radius:14px;padding:13px;font-weight:800;font-size:16px;color:#fff;background:var(--agc);margin-top:8px}
.ag-b[disabled]{opacity:.45}.ag-wa{background:#25d366}
.ag-res{background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:12px;margin:10px 0;font-size:15px;line-height:1.55}
.ag-ok{text-align:center}.ag-ok .ti{font-size:54px;color:#16a34a}.ag-cod{font-size:26px;font-weight:900;letter-spacing:1px;margin:4px 0}
.ag-err{color:#dc2626;font-size:14px;min-height:18px}.ag-vacio{grid-column:1/-1;text-align:center;color:#6b7280;padding:14px 0;font-size:14px}
</style>`)}
let AGR={};
async function agReservar(id){const p=(typeof P=="function"?P(id):null)||PS.find(x=>x.id==id);if(!T||!p)return;agCSS();
const A=agCfg(T),hoy=agHoyN(),dias=Array.from({length:Math.min(+A.anticipacion_dias||14,21)},(_,i)=>agAddD(hoy,i));
AGR={T,p,dias,f:null,h:null,ocup:[]};const col=T.color||'#16a34a';
const bg=document.createElement('div');bg.className='ag-bg';bg.id='agbg';bg.style.setProperty('--agc',col);bg.onclick=e=>{if(e.target==bg)bg.remove()};
bg.innerHTML=`<div class="ag-m"><button class="ag-x" onclick="agbg.remove()" aria-label="Cerrar">×</button><div class="ag-h">Reservar cita</div><p class="ag-s">${esc(p.nombre)} · ${agDur(p)} min · ${(p.extra||{}).precio_modo=='desde'?'desde ':''}${soles(p.precio)}</p><div id="agcuerpo">Cargando horarios…</div></div>`;
document.body.appendChild(bg);
try{AGR.ocup=await agOcupadas(T,agISO(hoy,'00:00'),agISO(agAddD(hoy,dias.length),'00:00'))}catch(e){agcuerpo.innerHTML='<p class="ag-err">No se pudo cargar la agenda. Intenta de nuevo.</p>';return}
AGR.f=dias.find(f=>agSlots(T,p,f,AGR.ocup).length)||dias[0];agPaso1()}
function agPaso1(){const {T,p,dias,ocup}=AGR,sl=agSlots(T,p,AGR.f,ocup);
agcuerpo.innerHTML=`<div class="ag-lbl">Elige el día</div><div class="ag-dias">${dias.map(f=>{const d=new Date(f+'T12:00:00Z'),n=agSlots(T,p,f,ocup).length;return `<button class="ag-d ${f==AGR.f?'on':''}" ${n?'':'disabled'} onclick="AGR.f='${f}';AGR.h=null;agPaso1()"><small>${AG_DIAS[agDow(f)-1]}</small><b>${d.getUTCDate()}</b><small>${AG_MES[d.getUTCMonth()].slice(0,3)}</small></button>`}).join('')}</div>
<div class="ag-lbl">Horarios libres · ${agFechaTxt(AGR.f)}</div><div class="ag-hs">${sl.map(h=>`<button class="ag-hr ${h==AGR.h?'on':''}" onclick="AGR.h='${h}';agPaso1()">${agHora12(h)}</button>`).join('')||'<div class="ag-vacio">No hay horarios libres este día.</div>'}</div>
<label class="ag-lbl" for="agn">Tu nombre</label><input id="agn" class="ag-in" maxlength="80" autocomplete="name" placeholder="Ej.: María Quispe" value="${esc(AGR.n||'')}" oninput="AGR.n=this.value">
<label class="ag-lbl" for="agt">Tu WhatsApp</label><input id="agt" class="ag-in" inputmode="tel" maxlength="15" autocomplete="tel" placeholder="Ej.: 987 654 321" value="${esc(AGR.t||'')}" oninput="AGR.t=this.value">
<div class="ag-err" id="age"></div><button class="ag-b" id="agb" ${AGR.h?'':'disabled'} onclick="agConfirmar()">${AGR.h?'Reservar '+AG_DIAS_L[agDow(AGR.f)-1]+' '+agHora12(AGR.h):'Elige un horario'}</button>
<p class="ag-s" style="margin-top:10px;text-align:center"><i class="ti ti-lock"></i> Solo guardamos tu nombre, WhatsApp y la hora de tu cita.</p>`}
async function agConfirmar(){const {T,p}=AGR,n=(AGR.n||'').trim(),t=(AGR.t||'').replace(/[^0-9]/g,'');
if(n.length<2){age.textContent='Escribe tu nombre.';return}if(!/^9\d{8}$/.test(t)&&!/^51?9\d{8}$/.test(t)){age.textContent='Escribe un celular válido de 9 dígitos.';return}
agb.disabled=true;agb.textContent='Reservando…';const tel=t.length==9?'51'+t:t;
try{const c=await agCrear(T,p,agISO(AGR.f,AGR.h),n,tel);AGR.ocup.push({inicio:c.inicio,fin:c.fin});agOk(c)}
catch(e){const m=(e&&e.message)||'';agb.disabled=false;agb.textContent='Reservar';age.textContent=/tomado|exclusion|cruce/i.test(m)?'Ese horario acaba de ser tomado. Elige otro.':(m||'No se pudo reservar.');
try{AGR.ocup=await agOcupadas(T,agISO(agHoyN(),'00:00'),agISO(agAddD(agHoyN(),AGR.dias.length),'00:00'));AGR.h=null;setTimeout(agPaso1,1600)}catch(_){}}}
function agOk(c){const {T,p}=AGR,L=agLocal(c.inicio),msg=`Hola ${T.nombre}, reservé una cita en RiverMarket.\nCódigo: #${c.codigo}\nServicio: ${p.nombre}\nDía: ${agFechaTxt(L.f)}\nHora: ${agHora12(L.h)}\nNombre: ${AGR.n.trim()}`;
agcuerpo.innerHTML=`<div class="ag-ok"><i class="ti ti-circle-check"></i><div class="ag-h">¡Cita reservada!</div><div class="ag-cod">#${esc(c.codigo)}</div></div>
<div class="ag-res"><b>${esc(p.nombre)}</b><br><i class="ti ti-calendar"></i> ${agFechaTxt(L.f)}<br><i class="ti ti-clock"></i> ${agHora12(L.h)} · ${agDur(p)} min<br><i class="ti ti-map-pin"></i> ${esc(T.nombre)}${T.distrito?' · '+esc(T.distrito):''}</div>
<p class="ag-s">Guarda tu código. Si no puedes asistir, avísale al negocio por WhatsApp.</p>
<a class="ag-b ag-wa" style="display:block;text-align:center;text-decoration:none" target="_blank" href="https://wa.me/${esc(T.wa)}?text=${encodeURIComponent(msg)}"><i class="ti ti-brand-whatsapp"></i> Enviar confirmación por WhatsApp</a>
<button class="ag-b" style="background:#fff;color:#374151;border:1.5px solid #d1d5db" onclick="agbg.remove()">Listo</button>`}

/* ---- Panel del negocio ---- */
let AGC=[],AGF='hoy';
async function agCargarCitas(T){if(agDemo(T)){AGC=agDemoLista(T).slice();return}
const {data,error}=await sb.from('citas').select('*').eq('tienda_id',T.id).gte('inicio',agISO(agAddD(agHoyN(),-7),'00:00').toISOString()).order('inicio').limit(500);if(error)throw error;AGC=data||[]}
async function agEstado(id,e){if(agDemo(T)){const l=agDemoLista(T),c=l.find(x=>x.id==id);if(c)c.estado=e;agDemoGuardar(T,l)}
else{const {error}=await sb.from('citas').update({estado:e}).eq('id',id);if(error){aviso('No se pudo cambiar el estado.');return}}
const c=AGC.find(x=>x.id==id);if(c)c.estado=e;agLista();aviso('Cita marcada como '+AG_EST[e][0].toLowerCase()+'.')}
function agWa(c){const L=agLocal(c.inicio);return 'https://wa.me/'+c.telefono.replace(/[^0-9]/g,'')+'?text='+encodeURIComponent(`Hola ${c.cliente.split(' ')[0]}, te recordamos tu cita en ${T.nombre}:\n${c.servicio}\n${agFechaTxt(L.f)} a las ${agHora12(L.h)}\nCódigo #${c.codigo}\n¿Nos confirmas tu asistencia? 😊`)}
function agLista(){const hoy=agHoyN(),fin=agAddD(hoy,7);const l=AGC.filter(c=>{const f=agLocal(c.inicio).f;return AGF=='hoy'?f==hoy:AGF=='semana'?f>=hoy&&f<fin:f<hoy}).sort((a,b)=>AGF=='pasadas'?new Date(b.inicio)-new Date(a.inicio):new Date(a.inicio)-new Date(b.inicio));
const act=AGC.filter(c=>c.estado=='confirmada'),kh=act.filter(c=>agLocal(c.inicio).f==hoy).length,ks=act.filter(c=>{const f=agLocal(c.inicio).f;return f>=hoy&&f<fin}).length;
agk.innerHTML=[['Citas hoy',kh],['Esta semana',ks]].map(([t,n])=>`<div class="rounded-lg bg-gray-100 p-4"><div class="text-2xl font-bold text-gray-800">${n}</div><div class="text-sm">${t}</div></div>`).join('');
agft.innerHTML=[['hoy','Hoy'],['semana','Próximos 7 días'],['pasadas','Pasadas']].map(([k,t])=>`<button onclick="AGF='${k}';agLista()" class="px-4 py-2 rounded-full border font-medium whitespace-nowrap ${AGF==k?'bg-green-600 text-white border-green-600':'bg-white border-gray-300 text-gray-800'}">${t}</button>`).join('');
let dAnt='';agl.innerHTML=l.map(c=>{const L=agLocal(c.inicio),F=agLocal(c.fin),[et,ec,eb]=AG_EST[c.estado];const cab=L.f!=dAnt?`<div class="font-semibold text-gray-800 mt-3 mb-1 capitalize">${L.f==hoy?'Hoy, ':''}${agFechaTxt(L.f)}</div>`:'';dAnt=L.f;
return cab+`<div class="border border-gray-300 rounded-lg p-3 mb-2 bg-white"><div class="flex justify-between gap-2 items-start"><div><div class="text-lg font-bold text-gray-800">${agHora12(L.h)} <span class="text-sm font-normal text-gray-500">– ${agHora12(F.h)}</span></div><div class="font-semibold">${esc(c.servicio)}</div><div class="text-sm">${esc(c.cliente)} · +${esc(c.telefono)} · <span class="text-gray-500">#${esc(c.codigo)}</span></div></div>
<span class="text-sm font-semibold rounded-full px-2 py-0.5 whitespace-nowrap" style="color:${ec};background:${eb}">${et}</span></div>
<div class="flex flex-wrap gap-2 mt-2 items-center"><a target="_blank" href="${agWa(c)}" class="${WAC} btn-sm"><i class="ti ti-brand-whatsapp"></i> Recordar</a><select onchange="agEstado('${c.id}',this.value)" class="border border-gray-300 rounded-lg p-1.5 text-sm">${Object.entries(AG_EST).map(([k,[t]])=>`<option value="${k}" ${k==c.estado?'selected':''}>${t}</option>`).join('')}</select></div></div>`}).join('')||`<p class="text-center py-8 text-gray-500">${AGF=='hoy'?'No tienes citas para hoy.':AGF=='semana'?'No tienes citas en los próximos 7 días.':'No hay citas pasadas.'}</p>`}
let AGT=null;
const agSelH=(v,on,id)=>`<select ${id?`id="${id}"`:''} ${on?`onchange="${on}"`:''} class="border border-gray-300 rounded-lg p-1" style="min-width:0;flex:1;font-size:15px">${id?'<option value="">Hora</option>':''}${Array.from({length:35},(_,i)=>agHH(360+i*30)).map(h=>`<option value="${h}" ${h==v?'selected':''}>${agHora12(h)}</option>`).join('')}</select>`;
async function agPanel(){AGT=JSON.parse(JSON.stringify(agCfg(T)));agConfig();try{await agCargarCitas(T)}catch(e){agl.innerHTML='<p class="text-red-600">No se pudieron cargar las citas. ¿Ya está activada la agenda en el sistema?</p>';return}agLista()}
function agConfig(){const A=AGT,svc=PS.filter(p=>p.tipo=='servicio'||(p.extra||{}).precio_modo);const fila=d=>{const r=(A.horario[d]||[])[0];return `<div class="flex items-center gap-2 mb-2"><label class="flex items-center gap-2" style="width:64px;flex:none"><input type="checkbox" ${r?'checked':''} onchange="AGT.horario[${d}]=this.checked?[['10:00','19:00']]:[];agConfig()"> <b>${AG_DIAS[d-1]}</b></label>${r?`${agSelH(r[0],`AGT.horario[${d}][0][0]=this.value`)}<span>a</span>${agSelH(r[1],`AGT.horario[${d}][0][1]=this.value`)}`:'<span class="text-sm text-gray-500">Cerrado</span>'}</div>`};
agcfg.innerHTML=`<label class="flex items-center justify-between gap-3 p-3 rounded-lg ${A.activa?'bg-green-50 border border-green-300':'bg-gray-100'} mb-4 cursor-pointer"><span><b class="text-gray-800">Recibir citas en línea</b><br><span class="text-sm">Tus clientes eligen día y hora en tu página.</span></span><input type="checkbox" class="w-6 h-6" ${A.activa?'checked':''} onchange="AGT.activa=this.checked;agConfig()"></label>
<h4 class="font-semibold text-gray-800 mb-2">Horario de atención</h4>${[1,2,3,4,5,6,7].map(fila).join('')}
<div class="grid grid-cols-2 gap-3 mt-3"><div><label class="${LBL}">Citas cada</label><select onchange="AGT.intervalo=+this.value" class="${INP}">${[15,30,45,60].map(m=>`<option value="${m}" ${A.intervalo==m?'selected':''}>${m} min</option>`).join('')}</select></div><div><label class="${LBL}">Mostrar hasta</label><select onchange="AGT.anticipacion_dias=+this.value" class="${INP}">${[7,14,21].map(m=>`<option value="${m}" ${A.anticipacion_dias==m?'selected':''}>${m} días</option>`).join('')}</select></div></div>
<h4 class="font-semibold text-gray-800 mb-2 mt-2">Duración de cada servicio</h4>${svc.map(p=>`<div class="flex items-center justify-between gap-2 mb-2"><span class="truncate">${esc(p.nombre)}</span><select data-p="${p.id}" class="agdur border border-gray-300 rounded-lg p-1.5">${[15,30,45,60,75,90,120,150,180].map(m=>`<option value="${m}" ${agDur(p)==m?'selected':''}>${m} min</option>`).join('')}</select></div>`).join('')||'<p class="text-sm">Agrega servicios en la pestaña Productos.</p>'}
<h4 class="font-semibold text-gray-800 mb-2 mt-4">Días libres y horas bloqueadas</h4>
<div class="flex flex-wrap gap-2 mb-2">${(A.dias_libres||[]).map((f,i)=>`<span class="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm">${agFechaTxt(f)} <button onclick="AGT.dias_libres.splice(${i},1);agConfig()">×</button></span>`).join('')}${(A.bloqueos||[]).map((b,i)=>`<span class="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-300 rounded-full px-3 py-1 text-sm">${agFechaTxt(b.fecha)}, ${agHora12(b.desde)}–${agHora12(b.hasta)} <button onclick="AGT.bloqueos.splice(${i},1);agConfig()">×</button></span>`).join('')}</div>
<div class="flex flex-wrap items-end gap-2 mb-4"><input type="date" id="agbf" min="${agHoyN()}" class="border border-gray-300 rounded-lg p-1.5">${agSelH('','','agbd')}${agSelH('','','agbh')}<button class="${BTNO} btn-sm" onclick="agBloq()"><i class="ti ti-ban"></i> Bloquear</button></div>
<p class="text-sm mb-3">Sin horas = día libre completo. Con horas = solo ese rango (ej.: almuerzo).</p>
<button class="${BTN} w-full" onclick="agGuardar()">Guardar agenda</button>`}
function agBloq(){const f=agbf.value,d=agbd.value,h=agbh.value;if(!f){aviso('Elige una fecha.');return}if(d&&h){if(d>=h){aviso('La hora final debe ser mayor.');return}AGT.bloqueos.push({fecha:f,desde:d,hasta:h})}else if(!AGT.dias_libres.includes(f))AGT.dias_libres.push(f);agConfig()}
async function agGuardar(){for(const d in AGT.horario){const r=AGT.horario[d][0];if(r&&r[0]>=r[1]){aviso('Revisa el horario del '+AG_DIAS_L[d-1]+'.');return}}
const hoy=agHoyN();AGT.dias_libres=AGT.dias_libres.filter(f=>f>=hoy);AGT.bloqueos=AGT.bloqueos.filter(b=>b.fecha>=hoy);
const durs=[...document.querySelectorAll('.agdur')].map(s=>({id:s.dataset.p,m:+s.value}));const info=Object.assign({},T.info||{},{agenda:AGT});
if(!agDemo(T)){const {error}=await sb.from('tiendas').update({info}).eq('id',T.id);if(error){aviso('No se pudo guardar: '+errTxt(error));return}
for(const x of durs){const p=PS.find(y=>y.id==x.id);if(p&&agDur(p)!=x.m){const extra=Object.assign({},p.extra||{},{duracion_min:x.m,duracion:x.m+' min'});await sb.from('productos').update({extra}).eq('id',p.id);p.extra=extra}}}
else durs.forEach(x=>{const p=PS.find(y=>y.id==x.id);if(p)p.extra=Object.assign({},p.extra||{},{duracion_min:x.m,duracion:x.m+' min'})});
T.info=info;aviso('✅ Agenda guardada.')}
