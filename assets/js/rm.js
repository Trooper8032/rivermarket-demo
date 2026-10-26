/* RiverMarket · utilidades comunes. Diseño basado en Freshcart (MIT, Codescandy). */
const SB_URL='https://yqweqmevdngfbvcjsnrs.supabase.co',SB_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxd2VxbWV2ZG5nZmJ2Y2pzbnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MzIyMDIsImV4cCI6MjEwODAwODIwMn0.f1fzIp52sE0pi-nlEgSi4iRASy_s--7hYF_Nj6UDu4o'; // clave pública (anon), protegida por RLS
const sb=supabase.createClient(SB_URL,SB_ANON,{auth:{persistSession:true,detectSessionInUrl:true,flowType:'implicit'}});
const BASE_URL='https://market.rivergreensolutions.com/';
const BTN='btn inline-flex items-center justify-center gap-x-2 bg-green-600 text-white border-green-600 hover:text-white hover:bg-green-700 hover:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50';
const BTNO='btn inline-flex items-center justify-center gap-x-2 bg-white text-gray-800 border-gray-300 hover:bg-gray-100 disabled:opacity-50';
const BTNR='btn inline-flex items-center justify-center gap-x-2 bg-white text-red-600 border-red-300 hover:bg-red-50';
const WAC='btn inline-flex items-center justify-center gap-x-2 bg-[#25d366] text-white border-[#25d366] hover:bg-[#1ebe5b] hover:text-white';
const INP='border border-gray-300 text-gray-900 rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2 px-3 mb-3';
const LBL='font-medium text-gray-800';
const PALETA=['#0aad0a','#16a34a','#0f766e','#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#ca8a04','#21313c'];
const RUBROS_PROD=['Postres y tortas','Comida','Restaurantes','Ropa y calzado','Tecnología','Plantas y jardín','Hogar','Mascotas','Ferretería','Abarrotes','Artesanía'];
const RUBROS_SERV=['Turismo','Talleres y mecánica','Belleza','Hogar y reparaciones','Salud','Clases','Eventos','Restaurantes'];
const RUBROS=[...new Set([...RUBROS_PROD,...RUBROS_SERV,'Otro'])];
const PLANT_SUG={'Turismo':'turismo','Restaurantes':'restaurante','Comida':'restaurante','Talleres y mecánica':'servicios','Belleza':'servicios','Hogar y reparaciones':'servicios','Salud':'servicios','Clases':'servicios','Eventos':'servicios'};
const CIUDADES=['Arequipa','Trujillo','Chiclayo','Piura','Cusco','Iquitos','Huancayo','Tacna','Ica','Puno','Juliaca','Cajamarca','Pucallpa','Chimbote','Ayacucho','Huánuco','Tarapoto','Huaraz','Moquegua','Tumbes','Puerto Maldonado','Chachapoyas','Abancay','Huancavelica','Cerro de Pasco','Callao','Chincha','Sullana','Huacho','Chancay','Talara','Jaén'];
const PLANES={prueba:'Prueba gratis',estandar:'Estándar · S/ 7 al mes'};/* premium: próximamente */
const SECC_DEF={portada:true,bienvenida:true,buscador:true,categorias:true,info:true};
const soles=n=>'S/ '+Number(n||0).toFixed(2);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
function src(v){return !v?'assets/images/demo/sin-foto.svg':v}
function cfg(t){return{estilo:t.estilo||'clasica',vista:t.vista||'grid',bienvenida:t.bienvenida||'',secc:Object.assign({},SECC_DEF,t.secc||{})}}
const DEMO_LOGOS=['unas-bella','taller-mecanico-rapido','andes-viajes','sazon-criollo','dulce-hogar','tecno-punto','verde-vivo','moda-urbana'];
function logoHTML(t,cls,icls){if(!t.logo&&DEMO_LOGOS.includes(t.slug))t={...t,logo:'assets/images/demo/logos/'+t.slug+'.webp'};return t.logo?`<img src="${esc(t.logo)}" alt="" class="${cls} object-cover bg-white">`:`<div class="${cls} grid place-items-center text-white" style="background:${esc(t.color||'#0aad0a')}"><i class="ti ${esc(t.icono||'ti-building-store')} ${icls}"></i></div>`}
function descuento(p){return p.precio_antes&&+p.precio_antes>+p.precio?Math.round((1-p.precio/p.precio_antes)*100):0}
function precioValido(v){const s=String(v??'').trim().replace(',','.');if(!/^\d+(\.\d{1,2})?$/.test(s))return null;const n=parseFloat(s);return n>0?n:null}
function rucValido(r){r=String(r).trim();if(!/^(10|15|17|20)\d{9}$/.test(r))return false;const w=[5,4,3,2,7,6,5,4,3,2];let s=0;for(let i=0;i<10;i++)s+=+r[i]*w[i];let dv=11-s%11;if(dv==10)dv=0;if(dv==11)dv=1;return dv==+r[10]}
function estrellas(n,cls='text-yellow-500'){n=Math.round(n||0);return `<span class="${cls} whitespace-nowrap">${'★'.repeat(n)}<span class="text-gray-300">${'★'.repeat(5-n)}</span></span>`}
function envioTexto(t){return t.zona_tipo=='peru'?'Envíos a todo el Perú':t.zona_tipo=='distritos'?'Envíos en '+(t.zona_distritos||[]).join(', '):'Envíos en '+t.ciudad}
function enviaA(t,ciudad){if(!ciudad)return true;const c=ciudad.toLowerCase();return t.zona_tipo=='peru'||(t.ciudad||'').toLowerCase()==c}
const BADGE_VERIF='<span class="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5"><i class="ti ti-rosette-discount-check"></i> Tienda verificada</span>';
const BADGE_PERU='<span class="inline-flex items-center gap-1 text-sm font-semibold text-green-800 bg-green-50 border border-green-200 rounded-full px-2 py-0.5"><i class="ti ti-truck"></i> Envíos a todo el Perú</span>';
function aviso(t,ms=2800){let e=$('toast');if(!e){e=document.createElement('div');e.id='toast';e.className='fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-gray-800 text-white rounded-lg px-4 py-2 shadow-lg max-w-[90vw] text-center';document.body.appendChild(e)}e.textContent=t;e.style.display='block';clearTimeout(e._t);e._t=setTimeout(()=>e.style.display='none',ms)}
function errTxt(e){const m=(e&&(e.message||e.error_description))||String(e);if(/Invalid login/i.test(m))return'Correo o contraseña incorrectos.';if(/Email not confirmed/i.test(m))return'Aún no confirmas tu correo. Revisa tu bandeja de entrada o spam.';if(/rate limit/i.test(m))return'Se enviaron demasiados correos. Intenta de nuevo en una hora.';if(/already registered/i.test(m))return'Ese correo ya está registrado. Ingresa o recupera tu contraseña.';return m}
/* Imagen: reduce y comprime (canvas) → Blob JPEG */
function cargarImagen(file){return new Promise((ok,mal)=>{if(!file||!/^image\//.test(file.type))return mal(new Error('El archivo no es una imagen.'));const u=URL.createObjectURL(file),im=new Image();im.onload=()=>ok(im);im.onerror=()=>mal(new Error('Formato de imagen no compatible.'));im.src=u})}
function aCanvas(im,max){let w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);return c}
function canvasBlob(c,tipo='image/jpeg',q=0.78){return new Promise(ok=>c.toBlob(ok,tipo,q))}
async function comprimir(file,max=900,q=0.78){if(!file||!/^image\//.test(file.type||'image/'))throw new Error('El archivo no es una imagen.');let src,w,h,fin=()=>{};
try{const b=await createImageBitmap(file);w=b.width;h=b.height;const k=Math.min(1,max/Math.max(w,h));if(k<1){b.close();src=await createImageBitmap(file,{resizeWidth:Math.round(w*k),resizeHeight:Math.round(h*k),resizeQuality:'medium'})}else src=b;fin=()=>src.close&&src.close()}
catch(e){const u=URL.createObjectURL(file);try{src=await new Promise((ok,mal)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>mal(new Error('Formato de imagen no compatible.'));im.src=u})}finally{fin=()=>{URL.revokeObjectURL(u);if(src)src.src=''}}w=src.naturalWidth;h=src.naturalHeight}
const k=Math.min(1,max/Math.max(w,h)),x=document.createElement('canvas');x.width=Math.round(w*k);x.height=Math.round(h*k);const g=x.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,x.width,x.height);g.drawImage(src,0,0,x.width,x.height);fin();
const out=await canvasBlob(x,'image/jpeg',q);x.width=x.height=0;if(!out)throw new Error('No se pudo procesar la foto.');return out}
async function subirPublico(blob,carpeta='img',ext='jpg'){const {data:{user}}=await sb.auth.getUser();const ruta=`${user.id}/${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`;const {error}=await sb.storage.from('publico').upload(ruta,blob,{contentType:blob.type||'image/jpeg',upsert:false});if(error)throw error;return sb.storage.from('publico').getPublicUrl(ruta).data.publicUrl}
async function sesion(){const {data:{session}}=await sb.auth.getSession();return session}
async function perfil(){const s=await sesion();if(!s)return null;const {data}=await sb.from('perfiles').select('*').eq('id',s.user.id).maybeSingle();return data}
function cabecera(activo,s){const l=(h,t,k)=>`<a href="${h}" class="px-2 md:px-3 py-2 rounded-lg font-medium whitespace-nowrap ${activo==k?'text-green-600':'text-gray-800 hover:text-green-600'}">${t}</a>`;
return `<div id="bannerTop" class="bg-gray-100 text-sm py-1 text-center text-gray-600">🎁 Vende con nosotros: 15 días gratis con soporte del sistema</div>
<header class="border-b border-gray-200 bg-white sticky top-0 z-30"><div class="container flex items-center justify-between h-16 gap-2">
<a href="index.html" class="flex items-center gap-2 text-lg font-bold text-gray-800"><img src="img/logo-rivermarket.png" alt="RiverMarket" class="h-10 w-auto"><span class="hidden sm:inline"><span style="color:#1E4FA8">River</span><span style="color:#6DBE45">Market</span></span></a>
<nav class="flex items-center text-base">${l('directorio.html','Tiendas','dir')}${s?l('panel.html','<i class="ti ti-layout-dashboard"></i> <span class="hidden md:inline">Mi panel</span>','panel'):l('ingresar.html','Ingresar','ing')}
${s?'':`<a href="registro.html" class="${BTN} btn-sm ml-1">Vender</a>`}</nav></div></header>`}
function pie(){return `<footer class="bg-gray-100 mt-12 py-8 text-gray-600"><div class="container grid md:grid-cols-3 gap-6">
<div><div class="flex items-center gap-2 font-bold text-md mb-2"><img src="img/logo-rivermarket.png" alt="" class="h-8 w-auto"><span><span style="color:#1E4FA8">River</span><span style="color:#6DBE45">Market</span></span></div><p>Tiendas de emprendedores verificados con pedidos por WhatsApp.</p></div>
<div><div class="font-semibold text-gray-800 mb-2">Contacto</div><p>RIVERGREEN SOLUTIONS E.I.R.L. · RUC 20613802984<br><a class="text-green-600" href="mailto:ventas@rivergreensolutions.com">Escríbenos a ventas@rivergreensolutions.com</a><br><a class="text-green-600" href="https://wa.me/51971941531" target="_blank">WhatsApp +51 971 941 531</a></p></div>
<div><div class="font-semibold text-gray-800 mb-2">Enlaces</div><p><a href="registro.html">Vende con nosotros</a> · <a href="privacidad.html">Política de privacidad</a> · <a href="ingresar.html">Ingresar</a></p></div></div>
<div class="container text-[11px] leading-snug mt-6 border-t border-gray-300 pt-3 text-gray-500">© 2026 RIVERGREEN SOLUTIONS E.I.R.L. · Diseño basado en <a class="underline" href="https://github.com/codescandy/freshcart-tailwind-ecommerce-HTML-template">Freshcart</a> (MIT) · Íconos Tabler (MIT) · Fotos de ejemplo: <a class="underline" href="https://unsplash.com/license">Unsplash</a></div></footer>`}
async function montar(activo){const s=await sesion();if($('cab'))$('cab').innerHTML=cabecera(activo,s);if($('pie'))$('pie').innerHTML=pie();
sb.from('mercado').select('clave,valor').in('clave',['banners','tema']).then(({data})=>{const M={};(data||[]).forEach(r=>M[r.clave]=r.valor);const b=M.banners&&M.banners[0];if(b&&$('bannerTop'))$('bannerTop').innerHTML=b.enlace?`<a href="${esc(b.enlace)}">${esc(b.texto)}</a>`:esc(b.texto);
const U=new URLSearchParams(location.search);if(U.has('navidad'))localStorage.setItem('rm_nav_preview',U.get('navidad'));const pv=localStorage.getItem('rm_nav_preview');/* vista previa local: ?navidad=1 (o 0 para quitar) */
const T=Object.assign({},M.tema||{});if(pv=='1')T.navidad=true;if(pv=='0')delete localStorage.rm_nav_preview;window.RM_NAV=T.navidad?T:null;if(T.navidad){if(window.navAplicar)navAplicar();else{const sc=document.createElement('script');sc.src='assets/js/navidad.js';document.head.appendChild(sc)}}window.dispatchEvent(new Event('rm-tema'))});return s}
function navBadge(p){return window.RM_NAV&&p&&(p.extra||{}).navidad?'<span class="nav-bdg">🎄 Navidad</span>':''}
function fixClases(){document.querySelectorAll('[class*="${"]').forEach(e=>e.className=e.className.replace(/\$\{(\w+)\}/g,(m,k)=>eval(k)))}

/* Compartir tienda: Web Share API en celulares + opciones WhatsApp, Facebook, copiar enlace y QR */
function linkTienda(slug){return BASE_URL+encodeURIComponent(slug)+'/'}
function linkCorto(slug){return 'market.rivergreensolutions.com/'+slug}
async function compartirTienda(nombre,slug,directo=true){const url=linkTienda(slug),txt=`¡Visita mi tienda ${nombre} en RiverMarket!`;
if(directo&&navigator.share&&/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent)){try{await navigator.share({title:nombre,text:txt+' '+url});return}catch(e){if(e.name=='AbortError')return}}
document.getElementById('mCompartir')?.remove();const m=document.createElement('div');m.id='mCompartir';m.className='fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4';m.onclick=e=>{if(e.target==m)m.remove()};
const op=(ic,t,cls,act)=>`<button class="w-full flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 text-left" onclick="${act}"><span class="w-10 h-10 rounded-full grid place-items-center ${cls}"><i class="ti ${ic} text-[22px]"></i></span><span class="font-semibold text-gray-800">${t}</span></button>`;
m.innerHTML=`<div class="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5"><div class="flex justify-between items-center mb-1"><h3 class="text-lg font-bold">Compartir tienda</h3><button onclick="this.closest('#mCompartir').remove()" class="text-gray-500"><i class="ti ti-x text-[22px]"></i></button></div><p class="text-sm text-gray-500 mb-4">${esc(nombre)}</p><div class="space-y-2">
${op('ti-brand-whatsapp','Enviar por WhatsApp','bg-green-100 text-green-700',`window.open('https://wa.me/?text='+encodeURIComponent(${esc(JSON.stringify(txt+' '+url))}),'_blank')`)}
${op('ti-brand-facebook','Compartir en Facebook','bg-blue-100 text-blue-700',`window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent('${url}'),'_blank')`)}
${op('ti-brand-instagram','Compartir en Instagram','bg-pink-100 text-pink-700',`copiarIG(${esc(JSON.stringify(txt+' '+url))},this)`)}
${op('ti-link','Copiar enlace','bg-gray-100 text-gray-700',`copiarLink('${url}',this)`)}
${op('ti-qrcode','Mostrar código QR','bg-yellow-100 text-yellow-700',`verQRCompartir('${url}')`)}
${navigator.share?op('ti-share','Más opciones…','bg-gray-100 text-gray-700',`navigator.share({title:document.title,url:'${url}'}).catch(()=>{})`):''}
</div><div id="qrComp" class="hidden mt-4 text-center"><div id="qrCompC" class="inline-block p-3 bg-white border rounded-xl"></div><p class="text-sm text-gray-500 mt-1">Escanéalo con la cámara del celular</p></div><input readonly value="${url}" class="mt-4 w-full text-sm border border-gray-200 rounded-lg p-2 text-gray-600" onclick="this.select()"></div>`;document.body.appendChild(m)}
async function copiarLink(u,b){try{await navigator.clipboard.writeText(u)}catch(e){const i=document.createElement('input');i.value=u;document.body.appendChild(i);i.select();document.execCommand('copy');i.remove()}b.querySelector('.font-semibold').textContent='¡Enlace copiado!'}
async function verQRCompartir(u){if(typeof QRCode=='undefined')await new Promise((r,j)=>{const s=document.createElement('script');s.src='assets/js/qrcode.min.js';s.onload=r;s.onerror=j;document.head.appendChild(s)});const c=document.getElementById('qrCompC');c.innerHTML='';new QRCode(c,{text:u,width:200,height:200});document.getElementById('qrComp').classList.remove('hidden')}

async function copiarIG(t,b){try{await navigator.clipboard.writeText(t)}catch(e){const i=document.createElement('textarea');i.value=t;document.body.appendChild(i);i.select();document.execCommand('copy');i.remove()}b.querySelector('.font-semibold').textContent='¡Copiado! Pégalo en tu historia, mensaje directo o biografía de Instagram';setTimeout(()=>{if(/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent))location.href='instagram://app'},1200)}
