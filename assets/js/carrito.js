/* Carrito compartido entre tienda y detalle de producto */
const CK='rm_carrito';
function carLeer(tid){return (JSON.parse(localStorage.getItem(CK)||'{}'))[tid]||{}}
function carGuardar(tid,c){const a=JSON.parse(localStorage.getItem(CK)||'{}');a[tid]=c;localStorage.setItem(CK,JSON.stringify(a))}
/* Checkout: guarda el pedido en el servidor (código RM-0001) y luego abre WhatsApp */
function htmlCheckout(){return `<div id="dr" class="fixed inset-0 z-40 bg-black/50 hidden" onclick="if(event.target==this)cerrar()"><div class="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white p-6 overflow-y-auto">
<div class="flex justify-between items-center mb-4"><h3>Tu carrito</h3><button onclick="cerrar()" class="text-xl" aria-label="Cerrar"><i class="ti ti-x"></i></button></div>
<div id="it"></div><div class="flex justify-between text-md font-semibold text-gray-800 py-4 border-t border-gray-300"><span>Total</span><span id="tot"></span></div>
<div id="frmC"><label class="${LBL}">Tu nombre</label><input id="cnom" maxlength="80" class="${INP}"><label class="${LBL}">Tu celular (opcional)</label><input id="ctel" inputmode="tel" maxlength="15" class="${INP}">
<label class="${LBL}">Entrega</label><select id="cent" class="${INP}"><option>Delivery</option><option>Recojo en tienda</option></select>
<div id="cdw"><label class="${LBL}">Distrito</label><div id="cdis"></div><label class="${LBL}">Dirección / referencia</label><input id="cdir" maxlength="200" class="${INP}"></div>
<label class="${LBL}">Nota</label><textarea id="cnot" rows="2" maxlength="300" class="${INP}"></textarea><div id="err" class="text-red-600 text-sm mb-2"></div>
<button id="benv" onclick="enviar()" class="${WAC} w-full"><i class="ti ti-brand-whatsapp text-lg"></i> Enviar pedido por WhatsApp</button><button onclick="cerrar()" class="${BTNO} w-full mt-2">Seguir comprando</button></div>
<div id="okC" class="hidden text-center py-6"></div></div></div>`}
function initCheckout(T,P){document.body.insertAdjacentHTML('beforeend',htmlCheckout());
cdis.innerHTML=T.zona_tipo=='distritos'?`<select id="cdisv" class="${INP}">${(T.zona_distritos||[]).map(d=>`<option>${esc(d)}</option>`).join('')}</select>`:`<input id="cdisv" maxlength="60" class="${INP}" placeholder="${T.zona_tipo=='peru'?'Distrito y ciudad':'Distrito en '+esc(T.ciudad)}">`;
cent.onchange=()=>cdw.classList.toggle('hidden',cent.value!='Delivery');
window.cerrar=()=>dr.classList.add('hidden');
window.abrir=()=>{ri();frmC.classList.remove('hidden');okC.classList.add('hidden');dr.classList.remove('hidden')};
window.ri=()=>{const car=carLeer(T.id);it.innerHTML=Object.entries(car).map(([i,n])=>{const p=P(i);return p?`<div class="flex items-center gap-3 py-3 border-b border-gray-200"><img src="${esc(src(p.fotos[0]))}" class="w-16 h-16 rounded-lg object-cover"><div class="flex-1"><div class="font-medium text-gray-800">${esc(p.nombre)}</div><div class="text-sm">${soles(p.precio)}</div></div><div class="flex items-center border border-gray-300 rounded-lg"><button class="px-2 py-1" onclick="add('${i}',-1)">−</button><span class="px-2">${n}</span><button class="px-2 py-1" onclick="add('${i}',1)">+</button></div></div>`:''}).join('')||'<p class="py-6 text-center">Tu carrito está vacío.</p>';tot.textContent=soles(total())};
window.total=()=>Object.entries(carLeer(T.id)).reduce((s,[i,n])=>s+(P(i)?P(i).precio*n:0),0);
window.add=(i,n)=>{const p=P(i),car=carLeer(T.id);if(!p)return;if(n>0&&(car[i]||0)+n>p.stock){aviso(p.stock<=0?'Producto agotado.':`Solo quedan ${p.stock} unidades de ${p.nombre}.`);return}car[i]=(car[i]||0)+n;if(car[i]<=0)delete car[i];carGuardar(T.id,car);window.rc&&rc();ri();if(n>0)aviso('Agregado al carrito ✓',1200)};
window.enviar=async()=>{err.textContent='';const car=carLeer(T.id),items=Object.entries(car).filter(([i])=>P(i)).map(([id,cant])=>({id,cant}));
if(!items.length)return err.textContent='Agrega al menos un producto.';if(cnom.value.trim().length<2)return err.textContent='Escribe tu nombre.';
const del=cent.value=='Delivery';if(del&&!cdir.value.trim())return err.textContent='Escribe la dirección de entrega.';if(del&&!cdisv.value.trim())return err.textContent='Indica tu distrito.';
benv.disabled=true;benv.innerHTML='Guardando pedido…';
const {data,error}=await sb.rpc('crear_pedido',{p_tienda:T.id,p_items:items,p_cliente:cnom.value.trim(),p_telefono:ctel.value.trim(),p_entrega:cent.value,p_direccion:del?cdir.value.trim():'',p_distrito:del?cdisv.value.trim():'',p_nota:cnot.value.trim()});
benv.disabled=false;benv.innerHTML='<i class="ti ti-brand-whatsapp text-lg"></i> Enviar pedido por WhatsApp';
if(error)return err.textContent=errTxt(error);
let m=`Hola ${T.nombre}, quiero hacer un pedido.\nPedido #${data.codigo}\n`;data.items.forEach(x=>m+=`• ${x.cant} x ${x.nombre} = ${soles(x.precio*x.cant)}\n`);
m+=`Total: ${soles(data.total)}\nNombre: ${cnom.value.trim()}\nEntrega: ${cent.value}`+(del?`\nDistrito: ${cdisv.value.trim()}\nDirección: ${cdir.value.trim()}`:'')+(cnot.value.trim()?`\nNota: ${cnot.value.trim()}`:'');
const url='https://wa.me/'+String(T.wa).replace(/\D/g,'')+'?text='+encodeURIComponent(m);carGuardar(T.id,{});window.rc&&rc();
localStorage.setItem('rm_ultimo_pedido',data.codigo);
frmC.classList.add('hidden');okC.classList.remove('hidden');okC.innerHTML=`<div class="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-700 grid place-items-center mb-3"><i class="ti ti-check text-3xl"></i></div><h3>Pedido #${data.codigo} guardado</h3><p class="my-2">Total ${soles(data.total)}. Toca el botón para enviarlo por WhatsApp a ${esc(T.nombre)}.</p><a href="${url}" target="_blank" class="${WAC} w-full my-3"><i class="ti ti-brand-whatsapp text-lg"></i> Abrir WhatsApp</a><p class="text-sm">Guarda tu código <b>#${data.codigo}</b>: con él podrás dejar una reseña.</p>`;it.innerHTML='';tot.textContent=soles(0);
try{window.open(url,'_blank')}catch(e){}}}
