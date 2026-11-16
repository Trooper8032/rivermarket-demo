/* RiverMarket · Módulo de delivery por distrito (v22). Reutilizable por todas las plantillas.
   Mismas reglas que Supabase (migración 32: normalizar_distrito, delivery_errores, tarifa_delivery).
   La fuente de verdad es SIEMPRE la respuesta de crear_pedido: esto solo sirve para la vista previa y el panel.
   tiendas.info.delivery = {version:1, toda_ciudad, promo_gratis, recojo, distritos:[{distrito, cobertura, tarifa, disponible, obs}]}
   tarifa: null = por confirmar · >0 = tarifa · 0 solo con promo_gratis. 0 nunca significa "no sé". Tope S/500. */
const RMDEL_MAX=500;
const RMDEL_A='ÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑÇáàäâéèëêíìïîóòöôúùüûñç',RMDEL_B='AAAAEEEEIIIIOOOOUUUUNCaaaaeeeeiiiioooouuuunc';
function rmDelNorm(s){s=String(s==null?'':s).split('').map(c=>{const i=RMDEL_A.indexOf(c);return i<0?c:RMDEL_B[i]}).join('').toLowerCase().replace(/\./g,' ').replace(/\s+/g,' ').trim();return s||null}
function rmDelS(n){n=Math.round(Number(n||0)*100)/100;return 'S/'+(n%1?n.toFixed(2):String(n))}
function rmDelCfg(T){const d=((T||{}).info||{}).delivery;return d&&typeof d=='object'&&!Array.isArray(d)?d:null}
function rmDelActivo(T){return !!rmDelCfg(T)}
function rmDelDistritos(T){const d=rmDelCfg(T);return ((d&&d.distritos)||[]).filter(x=>x&&x.distrito&&x.cobertura!==false&&x.disponible!==false)}
function rmDelRecojo(T){const d=rmDelCfg(T),e=((T||{}).info||{}).entrega||{};return !d||d.recojo===true||e.recojo===true}
/* Mismo resultado que tarifa_delivery(): calculado · gratis · por_confirmar · fuera_cobertura · falta_distrito */
function rmDelTarifa(T,dis){const d=rmDelCfg(T),n=rmDelNorm(dis);if(!d)return{estado:'por_confirmar',costo:null};
if(rmDelErrores(d))return{estado:'por_confirmar',costo:null};const toda=d.toda_ciudad===true,promo=d.promo_gratis===true;
if(!n)return{estado:toda?'por_confirmar':'falta_distrito',costo:null};const x=(d.distritos||[]).find(e=>rmDelNorm(e&&e.distrito)==n);
if(!x)return{estado:toda?'por_confirmar':'fuera_cobertura',costo:null};if(x.cobertura===false||x.disponible===false)return{estado:'fuera_cobertura',costo:null,distrito:x.distrito};
const t=x.tarifa;if(typeof t=='number'&&t>0)return{estado:'calculado',costo:t,distrito:x.distrito};if(t===0&&promo)return{estado:'gratis',costo:0,distrito:x.distrito};return{estado:'por_confirmar',costo:null,distrito:x.distrito}}
function rmDelTexto(estado,costo){return estado=='calculado'?rmDelS(costo):estado=='gratis'?'Gratis (promoción)':estado=='no_aplica'?'No aplica (recojo)':estado=='cotizado'?'Cotizado, pendiente de tu aceptación':estado=='fuera_cobertura'?'Sin cobertura en ese distrito':estado=='falta_distrito'?'Elige tu distrito':'Por confirmar según distrito'}
/* Importes desde la respuesta del servidor (v32). Si la 32 aún no está aplicada, no hay subtotal: total provisional. */
function rmDelImportes(data){const est=data&&data.delivery_estado||'por_confirmar',sub=data&&data.subtotal!=null?Number(data.subtotal):Number(data&&data.total||0);
const costo=data&&data.delivery_costo!=null?Number(data.delivery_costo):null,total=Number(data&&data.total!=null?data.total:sub),def=!!(data&&data.total_definitivo);
return{estado:est,subtotal:sub,costo:costo,total:total,definitivo:def,texto:rmDelTexto(est,costo)}}
function rmDelLineas(data){const m=rmDelImportes(data);return ['Subtotal: '+rmDelS(m.subtotal),'Delivery: '+m.texto,'Total: '+rmDelS(m.total)+(m.definitivo?'':' (provisional: falta confirmar el delivery)')]}
/* Aviso si el servidor calculó algo distinto de la vista previa (cambio de tarifa durante la compra). */
function rmDelAviso(prev,data){const m=rmDelImportes(data);if(!data||data.delivery_estado==null)return '';const pc=prev&&prev.costo!=null?Number(prev.costo):null;
if((prev&&prev.estado)==m.estado&&pc===m.costo)return '';return 'El delivery cambió: '+m.texto+'. Total '+rmDelS(m.total)+(m.definitivo?'':' (provisional)')+'. Revisa y pulsa "Abrir WhatsApp" para enviarlo.'}
/* Mismas reglas que delivery_errores() (trigger del servidor). Devuelve texto de error o '' */
function rmDelErrores(d){if(d==null)return '';if(typeof d!='object'||Array.isArray(d))return 'la configuración de delivery no es válida';
for(const k of['toda_ciudad','promo_gratis','recojo'])if(d[k]!=null&&typeof d[k]!='boolean')return '"'+k+'" debe ser sí o no';
if(d.distritos==null)return '';if(!Array.isArray(d.distritos))return 'la lista de distritos no es válida';if(d.distritos.length>60)return 'máximo 60 distritos';
const vis=new Set();for(let i=0;i<d.distritos.length;i++){const e=d.distritos[i];if(!e||typeof e!='object')return 'fila '+(i+1)+' no válida';if(typeof e.distrito!='string')return 'fila '+(i+1)+': falta el distrito';
const nm=e.distrito.trim(),n=rmDelNorm(nm);if(nm.length<2||nm.length>60||!n||n.length<2)return 'fila '+(i+1)+': el distrito debe tener de 2 a 60 caracteres';if(vis.has(n))return 'distrito repetido: '+nm;vis.add(n);
if(e.obs!=null&&typeof e.obs!='string')return nm+': observación no válida';if((e.obs||'').length>120)return nm+': observación de máximo 120 caracteres';
const t=e.tarifa;if(t==null)continue;if(typeof t!='number'||!isFinite(t))return nm+': la tarifa debe ser un número (vacío = por confirmar)';if(t<0)return nm+': la tarifa no puede ser negativa';
if(Math.round(t*100)/100!==t)return nm+': la tarifa admite máximo 2 decimales';if(t>RMDEL_MAX)return nm+': la tarifa máxima es S/'+RMDEL_MAX;if(t===0&&d.promo_gratis!==true)return nm+': tarifa 0 solo con promoción de delivery gratis; si aún no sabes la tarifa, déjala vacía'}return ''}
/* ===== Editor del panel (todas las plantillas) ===== */
function rmDelEditor(d){d=d||{};const fil=(d.distritos||[]).map(x=>[x.distrito,x.cobertura===false?'no':'sí',x.tarifa==null?'':x.tarifa,x.disponible===false?'no':'sí',x.obs||''].join(' | ')).join('\n'),C='block text-sm font-semibold text-gray-800 mb-1 mt-3';
return `<div class="rounded-lg border border-gray-300 p-3 my-3" id="rmdel"><b class="text-gray-800">Delivery por distrito</b>
<label class="flex items-center gap-2 mt-2"><input type="checkbox" id="rmdelon" ${rmDelCfgOk(d)?'checked':''} onchange="document.getElementById('rmdelc').classList.toggle('hidden',!this.checked)"> Calcular el delivery por distrito en mis pedidos</label>
<div id="rmdelc" class="${rmDelCfgOk(d)?'':'hidden'}"><label class="${C}">Distritos y tarifas (uno por línea)</label><textarea id="rmdeldis" rows="5" class="border border-gray-300 rounded-lg w-full p-2 font-mono text-sm" placeholder="Distrito | Cobertura (sí/no) | Tarifa S/ (vacío = por confirmar) | Disponible (sí/no) | Observaciones">${esc(fil)}</textarea>
<p class="text-sm text-gray-500">Tarifa vacía = "Delivery: por confirmar". Máximo S/${RMDEL_MAX}. Los distritos sin cobertura o no disponibles se rechazan al pedir.</p>
<label class="flex items-center gap-2 mt-2"><input type="checkbox" id="rmdeltoda" ${d.toda_ciudad?'checked':''}> Delivery a toda la ciudad (otros distritos quedan "por confirmar")</label>
<label class="flex items-center gap-2 mt-2"><input type="checkbox" id="rmdelpro" ${d.promo_gratis?'checked':''}> Promoción de delivery gratis (solo distritos con tarifa 0)</label>
<label class="flex items-center gap-2 mt-2"><input type="checkbox" id="rmdelrec" ${d.recojo?'checked':''}> Ofrecer recojo en tienda</label><div id="rmdelerr" class="text-red-700 text-sm mt-2"></div></div></div>`}
function rmDelCfgOk(d){return !!(d&&typeof d=='object'&&(d.version||d.distritos||d.toda_ciudad!=null))}
/* Lee el editor. Devuelve {delivery} (null = módulo apagado) o {error} */
function rmDelEditorLeer(){const g=id=>document.getElementById(id);if(!g('rmdel'))return{sin:true};if(!g('rmdelon').checked)return{delivery:null};
const si=v=>!/^\s*no\s*$/i.test(v||''),filas=g('rmdeldis').value.split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(c=>c[0]);let err='';
const ds=filas.map((c,i)=>{const t=String(c[2]||'').replace(',','.').replace(/^S\/\s*/i,'');let tf=null;if(t!==''){if(!/^-?\d+(\.\d+)?$/.test(t))err=err||(c[0]+': la tarifa debe ser un número (vacío = por confirmar)');else tf=+t}
return{distrito:c[0],cobertura:si(c[1]),tarifa:tf,disponible:si(c[3]),obs:(c[4]||'')}});
const d={version:1,toda_ciudad:g('rmdeltoda').checked,promo_gratis:g('rmdelpro').checked,recojo:g('rmdelrec').checked,distritos:ds};
err=err||rmDelErrores(d);if(!err&&!d.toda_ciudad&&!rmDelDistritos({info:{delivery:d}}).length)err='marca "toda la ciudad" o agrega al menos un distrito con cobertura';
g('rmdelerr').textContent=err?'Delivery: '+err+'.':'';return err?{error:'Delivery: '+err+'.'}:{delivery:d}}
