/* RiverMarket demo · construido sobre la plantilla Freshcart (MIT, Codescandy). Datos de EJEMPLO en localStorage. */
const CLAVE='rg_mkt_v3',IMG='assets/images/demo/';
const BTN='btn inline-flex items-center justify-center gap-x-2 bg-green-600 text-white border-green-600 hover:text-white hover:bg-green-700 hover:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-300';
const BTN2='btn inline-flex items-center justify-center gap-x-2 bg-gray-800 text-white border-gray-800 hover:text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300';
const BTNO='btn inline-flex items-center justify-center gap-x-2 bg-white text-gray-800 border-gray-300 hover:bg-gray-100';
const WAC='btn inline-flex items-center justify-center gap-x-2 bg-[#25d366] text-white border-[#25d366] hover:bg-[#1ebe5b] hover:text-white';
const INP='border border-gray-300 text-gray-900 rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2 px-3 mb-3';
const BASE=[
{id:'dulce-hogar',nombre:'Dulce Hogar Pastelería',icono:'ti-cake',color:'#db2777',banner:'ban-postres.jpg',rubro:'Postres y tortas',wa:'51971941531',desc:'Tortas, cupcakes y postres por encargo.',
 p:[['Torta de chocolate (8 porciones)','Tortas',65,'torta.jpg'],['Cupcakes decorados x6','Cupcakes',30,'cupcakes.jpg'],['Pie de limón','Tortas',45,'pie.jpg'],['Galletas con chips x12','Galletas',24,'galletas-chips.jpg'],['Galletas de avena x10','Galletas',15,'galletas-avena.jpg'],['Cheesecake de arándanos','Tortas',55,'cheesecake.jpg']]},
{id:'tecno-punto',nombre:'TecnoPunto',icono:'ti-device-mobile',color:'#2563eb',banner:'ban-tecno.jpg',rubro:'Tecnología',wa:'51971941531',desc:'Accesorios para celular y computadora.',
 p:[['Audífonos inalámbricos','Audio',89,'audifonos.jpg'],['Cargador para laptop','Cargadores',119,'cargador.jpg'],['Mouse inalámbrico','Cómputo',35,'mouse.jpg'],['Teclado compacto','Cómputo',79,'teclado.jpg'],['Parlante de escritorio','Audio',99,'parlante.jpg'],['Celular gama media','Celulares',899,'celular.jpg']]},
{id:'verde-vivo',nombre:'Verde Vivo',icono:'ti-plant',color:'#16a34a',banner:'ban-plantas.jpg',rubro:'Plantas y jardín',wa:'51971941531',desc:'Plantas de interior, macetas y jardinería.',
 p:[['Cactus en maceta','Plantas',18,'cactus.jpg'],['Monstera mediana','Plantas',60,'monstera.jpg'],['Suculenta en maceta celeste','Plantas',25,'maceta.jpg'],['Pala de jardín','Herramientas',20,'pala.jpg'],['Girasol individual','Flores',8,'girasol.jpg'],['Ramo de girasoles','Flores',45,'girasoles.jpg']]},
{id:'moda-urbana',nombre:'Moda Urbana',icono:'ti-shirt',color:'#7c3aed',banner:'ban-moda.jpg',rubro:'Ropa y calzado',wa:'51971941531',desc:'Ropa casual y zapatillas.',
 p:[['Polo básico de algodón','Polos',35,'polo.jpg'],['Jean clásico','Pantalones',89,'jean.jpg'],['Zapatillas urbanas','Calzado',149,'zapatillas.jpg'],['Gorra blanca','Accesorios',29,'gorra.jpg'],['Casaca de cuero sintético','Casacas',189,'casaca.jpg'],['Mochila urbana','Accesorios',79,'mochila.jpg']]}];
function semilla(){return{tiendas:BASE.map(t=>{const{p,...r}=t;return{...r,productos:p.map((x,i)=>({id:'p'+i,nombre:x[0],cat:x[1],precio:x[2],img:IMG+x[3],activo:true}))}}),solicitudes:[]}}
function cargar(){const s=localStorage.getItem(CLAVE);if(s)return JSON.parse(s);const d=semilla();guardar(d);return d}
function guardar(d){localStorage.setItem(CLAVE,JSON.stringify(d))}
function reiniciar(){[CLAVE,'rg_carrito2','rg_sesion2'].forEach(k=>localStorage.removeItem(k))}
const soles=n=>'S/ '+Number(n).toFixed(2);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* precio válido: número > 0 con máximo 2 decimales */
function precioValido(v){const s=String(v).trim().replace(',','.');if(!/^\d+(\.\d{1,2})?$/.test(s))return null;const n=parseFloat(s);return n>0?n:null}
function nCarrito(){const a=JSON.parse(localStorage.getItem('rg_carrito2')||'{}');return Object.values(a).reduce((s,t)=>s+Object.values(t).reduce((x,y)=>x+y,0),0)}
function cabecera(activo){const l=(h,t,k)=>`<a href="${h}" class="px-3 py-2 rounded-lg font-medium ${activo==k?'text-green-600':'text-gray-800 hover:text-green-600'}">${t}</a>`;
return `<div class="bg-gray-100 text-sm py-1 text-center text-gray-600">🎁 Prueba gratis 1 mes con soporte del sistema</div>
<header class="border-b border-gray-200 bg-white sticky top-0 z-30"><div class="container flex items-center justify-between h-16 gap-3">
<a href="index.html" class="flex items-center gap-2 text-lg font-bold text-gray-800"><span class="w-9 h-9 rounded-lg bg-green-600 text-white grid place-items-center"><i class="ti ti-building-store text-xl"></i></span>River<span class="text-green-600">Market</span></a>
<nav class="flex items-center text-base">${l('directorio.html','Tiendas','dir')}${l('panel.html','<i class="ti ti-user md:hidden text-lg"></i><span class="hidden md:inline">Panel vendedor</span>','panel')}
<a href="index.html#registro" class="hidden md:inline-flex ${BTN} btn-sm ml-2">Vende con nosotros</a></nav></div></header>`}
function pie(){return `<footer class="bg-gray-100 mt-10 py-8 text-gray-600"><div class="container grid md:grid-cols-3 gap-6">
<div><div class="font-bold text-gray-800 text-md mb-2">River<span class="text-green-600">Market</span></div><p>Tiendas virtuales para emprendedores y negocios.</p></div>
<div><div class="font-semibold text-gray-800 mb-2">Contacto</div><p>RIVERGREEN SOLUTIONS E.I.R.L.<br>RUC 20613802984<br><a class="text-green-600" href="https://wa.me/51971941531" target="_blank">WhatsApp +51 971 941 531</a></p></div>
<div><div class="font-semibold text-gray-800 mb-2">Créditos</div><p class="text-sm">Demo: tiendas, productos y precios son datos de ejemplo. Fotos de <a class="underline" href="https://unsplash.com/license" target="_blank">Unsplash</a> (Licencia Unsplash). Diseño basado en la plantilla <a class="underline" href="https://github.com/codescandy/freshcart-tailwind-ecommerce-HTML-template" target="_blank">Freshcart</a> de Codescandy (MIT). Íconos Tabler (MIT).</p></div>
</div><div class="container text-sm mt-6 border-t border-gray-300 pt-4">© 2026 RIVERGREEN SOLUTIONS E.I.R.L.</div></footer>`}
function montar(activo){document.getElementById('cab').innerHTML=cabecera(activo);document.getElementById('pie').innerHTML=pie()}
