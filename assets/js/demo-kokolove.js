/* Vista previa LOCAL de Koko Love (no se publica). Datos del catálogo oficial del propietario.
   Logo, portada y fotos de combos: originales del propietario. Fotos de adicionales: referenciales generadas. */
window.RM_DEMO=window.RM_DEMO||{};
(function(){const IMG='assets/images/kokolove/',FB='https://www.facebook.com/share/1J8abUQVba/?mibextid=wwXIfr';
const t={id:'demo-koko-love',slug:'koko-love',nombre:'Koko Love',rubro:'Desayunos y regalos',tipo_negocio:'productos',plantilla:'desayunos',
descripcion:'Desayunos sorpresa y regalos personalizados en Arequipa. Porque los detalles hacen la diferencia.',
ciudad:'Arequipa',distrito:'',zona_tipo:'ciudad',zona_distritos:[],color:'#780B20',icono:'ti-heart',logo:IMG+'logo-192.webp',portada:IMG+'portada.webp',
wa:'51987867527',estado:'activa',verificada:false,destacada:false,demo:false,demo_local:true,plan:'prueba',
info:{eslogan:'Porque los detalles hacen la diferencia.',especialidad:'Desayunos sorpresa y regalos personalizados',subcategoria:'Desayunos sorpresa',pais:'Perú',moneda:'PEN',
hero_titulo:'Sorprende con amor desde el primer momento del día.',
hero_sub:'Descubre nuestros desayunos sorpresa, regalos personalizados y detalles especiales en Arequipa. Porque los detalles hacen la diferencia.',
portada_movil:IMG+'portada-movil.webp',portada_con_texto:true,fotos_referenciales:false,redes:{facebook:FB,instagram:'',tiktok:''},horario:[],mismo_dia:true,
pago:{metodos:['Yape']},yape:{numero:'',titular:'',qr:''},
delivery:{distritos:[],promo_gratis:false},
faq:[['¿Realizan entregas en Arequipa?','Sí, atendemos solicitudes de entrega en Arequipa. La cobertura y el costo se confirman según el distrito.'],
['¿Puedo pedir un desayuno para hoy?','Sí, aceptamos solicitudes para el mismo día, sujetas a disponibilidad.'],
['¿Cómo puedo pagar?','Aceptamos Yape. Los datos de pago se proporcionan durante la confirmación del pedido.'],
['¿El delivery está incluido?','El costo de delivery se calcula según el distrito y se confirma antes de finalizar el pedido.'],
['¿Puedo agregar una dedicatoria?','Sí, nuestros cuatro combos incluyen una tarjeta personalizada.'],
['¿Puedo añadir regalos?','Sí, puedes seleccionar peluches, globos, tazas, flores y chocolates con costo adicional.']]}};
const NF={'KL-001':'Las flores son decorativas y no forman parte del combo.','KL-002':'Las flores son decorativas y no forman parte del combo.','KL-003':'El globo y las flores de la foto son decorativos; el globo personalizado se puede pedir como adicional.','KL-004':'El globo y el ramo de la foto son decorativos; puedes pedirlos como adicionales.'};
const C=(id,cod,n,pr,f,d,inc,op,incl)=>({id,nombre:n,categoria:'Desayunos',precio:pr,fotos:[IMG+f],descripcion:d,tipo:'producto',extra:Object.assign({codigo:cod,incluye:inc,nota_foto:NF[cod]},op?{opcion:op}:{},incl?{incluidos:incl}:{})});
const A=(id,cod,n,pr,f)=>({id,nombre:n,categoria:'Adicionales',precio:pr,fotos:[IMG+f],descripcion:'Complemento para cualquier desayuno.',tipo:'producto',extra:{codigo:cod,adicional:true,foto_referencial:true}});
const p=[
C('kl-001','KL-001','Combo Dulce Mañana',45,'kl-001-dulce-manana.webp','Una sorpresa sencilla, dulce y especial para comenzar el día con alegría. Ideal para cumpleaños, agradecimientos o para demostrar cariño en cualquier ocasión.',
 ['Sándwich de jamón y queso','Jugo de naranja','Ensalada de frutas','Una porción de keke de chocolate o vainilla','Caja decorada','Tarjeta personalizada'],{etiqueta:'Sabor del keke',valores:['Chocolate','Vainilla'],nota:'sujeto a disponibilidad'}),
C('kl-002','KL-002','Combo Buenos Días',65,'kl-002-buenos-dias.webp','Un desayuno especial para convertir cualquier mañana en un momento inolvidable. Una combinación de sabores cuidadosamente presentada para sorprender a alguien importante.',
 ['Sándwich de pollo','Jugo de naranja','Ensalada de frutas','Yogurt con granola','Dos alfajores','Caja decorada','Tarjeta personalizada']),
C('kl-003','KL-003','Combo Amor Especial',85,'kl-003-amor-especial.webp','Porque los detalles enamoran. Una presentación elegante que combina un delicioso desayuno, dulces y una dedicatoria personalizada para celebrar momentos especiales.',
 ['Sándwich de pollo','Jugo de naranja','Café o infusión en vaso térmico con tapa','Ensalada de frutas','Yogurt con granola','Una porción de torta de chocolate','Dos alfajores','Caja decorada','Tarjeta personalizada'],{etiqueta:'Bebida caliente',valores:['Café','Infusión']}),
C('kl-004','KL-004','Combo Desayuno VIP',150,'kl-004-desayuno-vip.webp','La experiencia más completa de Koko Love. Un desayuno premium acompañado de dulces, una taza temática y un peluche tierno para convertir una fecha especial en un recuerdo inolvidable.',
 ['Sándwich de pollo','Jugo de naranja','Café o infusión','Ensalada de frutas','Yogurt con granola','Una taza temática Koko Love','Una porción de torta de chocolate','Dos chocolates Ferrero Rocher','Dos alfajores','Peluche tierno','Caja decorada','Tarjeta personalizada'],{etiqueta:'Bebida caliente',valores:['Café','Infusión']},{'AD-001':'un peluche','AD-006':'dos Ferrero Rocher','AD-003':'una taza temática'}),
A('ad-001','AD-001','Peluche',20,'ad-001-peluche.webp'),A('ad-002','AD-002','Globo personalizado',18,'ad-002-globo.webp'),A('ad-003','AD-003','Taza personalizada',20,'ad-003-taza.webp'),
A('ad-004','AD-004','Rosa natural',10,'ad-004-rosa.webp'),A('ad-005','AD-005','Mini ramo de flores',25,'ad-005-mini-ramo.webp'),A('ad-006','AD-006','Chocolates Ferrero Rocher',20,'ad-006-ferrero.webp')];
window.RM_DEMO['koko-love']={t,p,r:{n:0,s:0},o:[]};})();
