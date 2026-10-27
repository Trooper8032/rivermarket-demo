/* RiverMarket · Ayudas con IA (beta)
   1) Dictar producto (Whisper vía transformers.js, Apache-2.0; modelo Whisper MIT)
   2) Foto de mi lista de precios (tesseract.js, Apache-2.0)
   3) Revisar captura de Yape / Plin (tesseract.js) — solo sugiere, nunca marca pagado
   4) Mejorar foto: quitar fondo (U-2-Netp, Apache-2.0, con onnxruntime-web, MIT)
   Todo corre en el celular del vendedor. Cada modelo se descarga solo cuando se toca su botón. */
(function(){
const CFG=window.IA_CFG=Object.assign({
  tf:'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js',
  whisper:'onnx-community/whisper-base', whisperDtype:'q8',
  tess:'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js',
  ort:'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/',
  u2:'https://huggingface.co/BritishWerewolf/U-2-Netp/resolve/main/onnx/model.onnx'
},window.IA_CFG||{});
const IA=window.IA={med:{}};
const $i=id=>document.getElementById(id),E=s=>typeof esc=='function'?esc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MB=b=>(b/1048576).toFixed(b>1e7?0:1)+' MB';
const sinTilde=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
/* T, PS, EF y FT son 'let' del panel: no están en window, se leen así */
const gT=()=>typeof T!='undefined'?T:null,gPS=()=>typeof PS!='undefined'?PS:[];
const esServ=()=>{const t=gT();return !!t&&(t.plantilla=='servicios'||t.tipo_negocio=='servicios')};

/* ---------- estilos propios (el CSS del sitio está precompilado) ---------- */
const st=document.createElement('style');st.textContent=`
.ia-box{border:2px dashed #16a34a;background:#f0fdf4;border-radius:14px;padding:12px;margin-bottom:14px}
.ia-mic{display:inline-flex;align-items:center;gap:8px;background:#16a34a;color:#fff;font-weight:700;border-radius:999px;padding:10px 18px;font-size:16px}
.ia-mic.rec{background:#dc2626;animation:iaP 1.2s infinite}@keyframes iaP{50%{box-shadow:0 0 0 10px rgba(220,38,38,.15)}}
.ia-hint{font-size:14px;color:#166534;margin-top:6px}.ia-sub{font-size:13px;color:#4b5563}
.ia-bar{height:8px;background:#e5e7eb;border-radius:9px;overflow:hidden;margin:6px 0}.ia-bar>div{height:8px;background:#16a34a;width:0;transition:width .2s}
.ia-res{background:#fff;border:1px solid #bbf7d0;border-radius:10px;padding:10px;margin-top:10px;font-size:14px}
.ia-res b{color:#111827}.ia-tag{display:inline-block;font-size:12px;font-weight:700;border-radius:6px;padding:2px 8px}
.ia-ok{background:#dcfce7;color:#166534}.ia-rev{background:#fef9c3;color:#854d0e}.ia-bad{background:#fee2e2;color:#991b1b}
.ia-tab{width:100%;border-collapse:collapse;font-size:14px}.ia-tab td{padding:3px 2px;border-bottom:1px solid #eee}.ia-tab input{width:100%;border:1px solid #d1d5db;border-radius:6px;padding:6px}
.ia-sw{width:34px;height:34px;border-radius:999px;border:2px solid #d1d5db;cursor:pointer}.ia-sw.on{outline:3px solid #16a34a;outline-offset:2px}
.ia-ba{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ia-ba img{width:100%;aspect-ratio:1;object-fit:contain;border-radius:10px;border:1px solid #e5e7eb;background:#f3f4f6}
.ia-cap{font-size:12px;text-align:center;color:#4b5563;margin-top:2px}
.ia-beta{font-size:11px;font-weight:700;background:#fef3c7;color:#92400e;border-radius:6px;padding:1px 6px;margin-left:4px}`;
document.head.appendChild(st);

/* ---------- modal propio ---------- */
function modal(titulo,html){let m=$i('iaMd');if(!m){m=document.createElement('div');m.id='iaMd';m.className='fixed inset-0 z-50 bg-black/50 overflow-y-auto';document.body.appendChild(m)}
m.innerHTML=`<div class="bg-white rounded-2xl max-w-xl mx-auto my-6 p-5 relative" style="margin-left:auto;margin-right:auto;max-width:36rem"><button class="absolute right-4 top-4 text-xl" onclick="IA.cerrar()" aria-label="Cerrar"><i class="ti ti-x"></i></button><h3 class="text-lg mb-3" style="padding-right:30px">${titulo}</h3><div id="iaBody">${html}</div></div>`;m.classList.remove('hidden');return $i('iaBody')}
IA.cerrar=()=>{const m=$i('iaMd');if(m){m.classList.add('hidden');m.innerHTML=''}};
function progreso(el,txt,pct){if(!el)return;el.innerHTML=`<div class="ia-sub">${txt}</div>${pct==null?'':`<div class="ia-bar"><div style="width:${Math.max(3,Math.min(100,pct))}%"></div></div>`}`}
function cargarScript(u){return new Promise((ok,mal)=>{if(document.querySelector(`script[src="${u}"]`))return ok();const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>mal(new Error('No se pudo descargar la herramienta. Revisa tu internet.'));document.head.appendChild(s)})}

/* =====================================================================
   Números en español → cifras ("cuarenta y cinco" → 45)
   ===================================================================== */
const NUM={cero:0,un:1,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,dieciseis:16,diecisiete:17,dieciocho:18,diecinueve:19,veinte:20,veintiun:21,veintiuno:21,veintiuna:21,veintidos:22,veintitres:23,veinticuatro:24,veinticinco:25,veintiseis:26,veintisiete:27,veintiocho:28,veintinueve:29,treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90,cien:100,ciento:100,doscientos:200,doscientas:200,trescientos:300,trescientas:300,cuatrocientos:400,cuatrocientas:400,quinientos:500,quinientas:500,seiscientos:600,seiscientas:600,setecientos:700,setecientas:700,ochocientos:800,ochocientas:800,novecientos:900,novecientas:900,mil:1000};
function numerosATexto(t){
  // "litro y medio" / "kilo y medio" / "hora y media"
  t=t.replace(/\b(un|una|1)?\s*(kilo|kg|litro|hora)s?\s+y\s+medi[oa]\b/gi,(m,a,u)=>'1.5 '+u+'s')
     .replace(/\bmedi[oa]\s+(kilo|litro|hora)\b/gi,(m,u)=>'0.5 '+u)
     .replace(/\b(\d+)\s*y\s*medi[oa]\b/gi,(m,n)=>(+n+.5)+'');
  const tk=t.split(/(\s+|[,.;:!?¿¡])/);const out=[];let i=0;
  while(i<tk.length){const k=sinTilde(tk[i]);
    if(k in NUM){
      let total=0,cur=0,j=i,ult=i;
      while(j<tk.length){const w=sinTilde(tk[j]);
        if(/^\s+$/.test(tk[j])||tk[j]===''){j++;continue}
        if(w in NUM){const v=NUM[w];if(v==1000){cur=(cur||1)*1000;total+=cur;cur=0}else if(v==100&&cur>0&&cur<10){cur*=100}else cur+=v;ult=j;j++;continue}
        if(w=='y'&&cur>=20&&cur%10==0){let n=j+1;while(n<tk.length&&/^\s*$/.test(tk[n]))n++;if(n<tk.length&&sinTilde(tk[n]) in NUM&&NUM[sinTilde(tk[n])]<10){j=n;continue}}
        break}
      out.push(String(total+cur));i=ult+1;continue}
    out.push(tk[i]);i++}
  return out.join('')}
IA.numerosATexto=numerosATexto;

/* =====================================================================
   Entender lo dictado → producto o servicio
   ===================================================================== */
const GRUPOS=[
 [/\b(torta|pastel|keke|queque|pie|cheesecake|alfajor|postre|cupcake|brownie|budin|gelatina|flan|mazamorra|arroz con leche)/,'Postres y tortas','Ideal para cumpleaños y reuniones.'],
 [/\b(galleta)/,'Galletas','Recién horneadas.'],
 [/\b(pan|panes|empanada|cachito|croissant|bizcocho)\b/,'Panadería','Recién salido del horno.'],
 [/\b(gaseosa|jugo|bebida|agua|cerveza|refresco|chicha|limonada|inca kola|coca|cafe|te)\b/,'Bebidas','Para compartir en familia.'],
 [/\b(arroz|azucar|aceite|leche|huevo|fideo|menestra|atun|harina|sal)\b/,'Abarrotes','Producto de primera necesidad.'],
 [/\b(polo|camisa|pantalon|vestido|zapatilla|casaca|short|blusa|falda|jean)/,'Ropa','Cómodo y de buena calidad.'],
 [/\b(celular|cargador|audifono|cable|mouse|parlante|teclado)/,'Tecnología','Con garantía de la tienda.'],
 [/\b(martillo|clavo|tornillo|pintura|tubo|cemento|llave|taladro)/,'Ferretería','Resistente y de buena calidad.'],
 [/\b(manicur|unas|uñas|gel|acrilic|esmalt)/,'Manos','Con productos de calidad.'],
 [/\b(pedicur|pies)/,'Pies','Con productos de calidad.'],
 [/\b(corte|cabello|tinte|peinado|barba|keratina)/,'Cabello','Con productos de calidad.'],
 [/\b(aceite de motor|cambio de aceite|freno|afinamiento|llanta|bateria)/,'Mecánica','Con garantía del taller.']];
const canon=w=>{w=sinTilde(w).replace(/[^a-zñ0-9]/g,'');w=w.replace(/^manicure$/,'manicura').replace(/^pedicure$/,'pedicura').replace(/^queque$/,'keke');return w.length>3&&w.endsWith('s')?w.slice(0,-1):w};
const STOP=new Set(['de','del','la','el','los','las','con','y','en','para','por','un','una','x']);
function adivinarCategoria(nombre,texto){const n=sinTilde(nombre+' '+texto),ps=gPS()||[];
  // 1) parecido con productos que ya existen en la tienda
  const ws=new Set(n.split(/\s+/).map(canon).filter(w=>w&&!STOP.has(w)&&!/^\d/.test(w)));let best=null,bs=0;
  const cats=[...new Set(ps.map(p=>p.categoria).filter(Boolean))];
  for(const c of cats){let s=0;if(ws.has(canon(c)))s+=3;for(const p of ps.filter(p=>p.categoria==c))for(const w of sinTilde(p.nombre).split(/\s+/).map(canon))if(w&&!STOP.has(w)&&ws.has(w))s+=1;if(s>bs){bs=s;best=c}}
  const g=GRUPOS.find(x=>x[0].test(n));
  if(best&&bs>=1)return{cat:best,frase:g?g[2]:''};
  // 2) palabra clave → si la tienda ya tiene esa categoría, úsala
  if(g){const ex=cats.find(c=>sinTilde(c)==sinTilde(g[1]));return{cat:ex||g[1],frase:g[2]}}
  return{cat:cats[0]||'General',frase:''}}
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
function entender(original,serv){
  let t=' '+String(original||'').replace(/\s+/g,' ').trim()+' ';
  t=t.replace(/S\/\.?\s*/gi,' S/ ').replace(/\$\s*/g,' S/ ');
  t=numerosATexto(t);
  t=t.replace(/(\d+),(\d{1,2})(?!\d)/g,'$1.$2');           // 8,50 → 8.50
  const res={texto:original.trim()},quita=[];
  const marca=(re,fn)=>{const m=t.match(re);if(m){fn(m);quita.push(m[0])}return m};
  // precio
  marca(/(\d+(?:\.\d{1,2})?)\s*(?:soles|sol|lucas|luca)\b(?:\s*(?:con|y)\s*(\d{1,2})(?:\s*(?:centimos|céntimos))?\b)?/i,m=>res.precio=+m[1]+(m[2]?(+m[2])/(m[2].length==1?10:100):0))
  ||marca(/S\/\s*(\d+(?:\.\d{1,2})?)/i,m=>res.precio=+m[1])
  ||marca(/(\d+)\s*con\s*(\d{1,2})\b/i,m=>res.precio=+m[1]+(+m[2])/(m[2].length==1?10:100))
  ||marca(/\b(?:a|cuesta|precio|vale)\s+(\d+(?:\.\d{1,2})?)\b/i,m=>res.precio=+m[1]);
  if(serv){
    marca(/(\d+(?:\.\d+)?)\s*(horas?|hrs?|minutos?|mins?)\b/i,m=>{const v=+m[1],h=/^h/i.test(m[2]);const min=Math.round(h?v*60:v);res.duracion=min>=60?(min%60?`${Math.floor(min/60)} h ${min%60} min`:`${min/60} hora${min>60?'s':''}`):`${min} min`;res.minutos=min});
  }else{
    marca(/\b(?:hay|hai|ay|ahi|ahí|i|tengo|quedan|stock(?:\s+de)?|son|cantidad)[\s-]*(\d+)\b(?:\s*(?:unidades|piezas|en stock))?/i,m=>res.stock=+m[1])
    ||marca(/\b(\d+)\s*(?:unidades|piezas|en stock)\b/i,m=>res.stock=+m[1]);
  }
  // tamaño (va en la descripción)
  const tm=t.match(/(?:de\s+)?(\d+(?:\.\d+)?)\s*(kilos?|kg|gramos?|gr|g|litros?|lt?|ml|porciones|metros?)\b/i);
  if(tm){const u=sinTilde(tm[2]),n=+tm[1],U=/^kil|^kg/.test(u)?'kg':/^gr|^g$/.test(u)?'g':/^lit|^l/.test(u)?(n==1?'litro':'litros'):u=='ml'?'ml':u;res.tamano=(n+'').replace('.',',')+' '+U;quita.push(tm[0])}
  // nombre: lo que queda
  let r=t;for(const q of quita)r=r.replace(q,' ');
  if(!serv&&res.stock==null&&res.precio!=null){const m=r.match(/(?:^|[\s,])(?:a\s+)?(\d{1,4})\s*[.,]?\s*$/);if(m){res.stock=+m[1];r=r.replace(m[0],' ')}}
  r=r.replace(/\b(precio|cuesta|vale|a)\s*[,.]?\s*$/i,'');
  const seg=r.split(/[,.;]+/).map(s=>s.replace(/\s+/g,' ').trim()).filter(s=>/[a-záéíóúñ]/i.test(s));
  let nom=(seg[0]||'').replace(/^(agrega|agregar|crear|nuevo|nueva|producto|servicio|vendo)\s+/i,'').replace(/^1\s+(?=[a-záéíóúñ])/i,'').replace(/\s+(de|a|con|y|por|en)$/i,'').trim();
  // si no hubo comas, el nombre termina donde empieza el primer número (se respeta "x6" / "por 6")
  nom=nom.replace(/\b(x|por)\s*(\d+)/gi,'$1§$2');const cn=nom.match(/^(.*?[a-záéíóúñ]{3,}.*?)\s+(?:a\s+)?\d/i);if(cn)nom=cn[1];nom=nom.replace(/\(\s*\)/g,' ').replace(/§/g,' ').replace(/\s+(de|a|con|y|por|en)$/i,'').trim();
  res.nombre=cap(nom).slice(0,120);
  const g=adivinarCategoria(res.nombre,t);res.categoria=g.cat;
  const tienda=(gT()&&gT().nombre)||'nuestra tienda';
  res.descripcion=serv?`${res.nombre}${res.duracion?' ('+res.duracion+')':''}. ${g.frase||'Atención con cariño y puntualidad.'} Reserva tu cita en ${tienda}.`.replace(/\s+/g,' ')
    :`${res.nombre}${res.tamano?' de '+res.tamano:''}. ${g.frase||'Producto de calidad.'} Pídelo en ${tienda}.`.replace(/\s+/g,' ');
  res.caracteristicas=res.tamano?['Tamaño: '+res.tamano]:[];
  return res}
IA.entender=entender;

/* =====================================================================
   1) DICTAR PRODUCTO
   ===================================================================== */
let WW=null,WN=0;const WP={};
function whisperWorker(){if(WW)return WW;
  const code=`let P;onmessage=async e=>{const {id,audio,model,dtype,tf}=e.data;try{
   if(!P){const T=await import(tf);T.env.allowLocalModels=false;const t0=performance.now();
    P=await T.pipeline('automatic-speech-recognition',model,{dtype,device:'wasm',progress_callback:p=>postMessage({prog:p})});postMessage({cargado:performance.now()-t0})}
   const t1=performance.now();const r=await P(audio,{language:'spanish',task:'transcribe'});postMessage({id,text:r.text,ms:performance.now()-t1})}
   catch(err){postMessage({id,err:String(err&&err.message||err)})}}`;
  WW=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})),{type:'module'});
  const arch={};WW.onmessage=e=>{const d=e.data;
    if(d.prog){const p=d.prog;if(p.status=='progress'&&p.total){arch[p.file]=[p.loaded,p.total];const L=Object.values(arch).reduce((s,x)=>s+x[0],0),Tt=Object.values(arch).reduce((s,x)=>s+x[1],0);IA.med.whisperBytes=Tt;IA.onProg&&IA.onProg(`Descargando el asistente de voz (solo la 1.ª vez): ${MB(L)} de ${MB(Tt)}`,L/Tt*100)}return}
    if(d.cargado){IA.med.whisperCarga=d.cargado;IA.onProg&&IA.onProg('Escuchando tu audio…',null);return}
    const r=WP[d.id];delete WP[d.id];if(r)d.err?r[1](new Error(d.err)):r[0](d)};
  WW.onerror=e=>{Object.values(WP).forEach(r=>r[1](new Error(e.message||'worker')));WW=null};return WW}
function transcribir(audio){const w=whisperWorker();return new Promise((ok,mal)=>{const id=++WN;WP[id]=[ok,mal];w.postMessage({id,audio,model:CFG.whisper,dtype:CFG.whisperDtype,tf:CFG.tf},[audio.buffer])})}
async function audioA16k(blob){const buf=await blob.arrayBuffer();const AC=window.AudioContext||window.webkitAudioContext;let ctx;try{ctx=new AC({sampleRate:16000})}catch(e){ctx=new AC()}
  const ab=await new Promise((ok,mal)=>{const p=ctx.decodeAudioData(buf,ok,mal);if(p&&p.then)p.then(ok,mal)});ctx.close&&ctx.close();
  let d=ab.getChannelData(0);if(ab.numberOfChannels>1){const d2=ab.getChannelData(1),m=new Float32Array(d.length);for(let i=0;i<d.length;i++)m[i]=(d[i]+d2[i])/2;d=m}
  if(ab.sampleRate!=16000){const off=new OfflineAudioContext(1,Math.ceil(ab.duration*16000),16000),s=off.createBufferSource();s.buffer=ab;s.connect(off.destination);s.start();d=(await off.startRendering()).getChannelData(0)}
  return new Float32Array(d)}
IA.audioA16k=audioA16k;IA.transcribir=transcribir;
let REC=null,RECt=null;
function cajaDictar(){const sv=esServ();
  return `<div class="ia-box" id="iaDict"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><button type="button" class="ia-mic" id="iaMic" onclick="IA.mic()"><i class="ti ti-microphone"></i> <span>Dictar ${sv?'servicio':'producto'}</span></button><label class="ia-sub" style="text-decoration:underline;cursor:pointer">o sube un audio<input type="file" accept="audio/*" id="iaAud" class="hidden"></label><span class="ia-beta">NUEVO</span></div>
  <div class="ia-hint"><i class="ti ti-bulb"></i> ${sv?'Di: servicio, duración y precio. Ej.: “Manicure con gel, una hora, treinta y cinco soles”':'Di: nombre, precio y cantidad. Ej.: “Torta de chocolate, un kilo, cuarenta y cinco soles, hay diez”'}</div><div id="iaDst"></div><div id="iaDres"></div></div>`}
IA.mic=async()=>{const b=$i('iaMic');
  if(REC){REC.stop();return}
  if(!navigator.mediaDevices||!window.MediaRecorder){aviso('Tu celular no permite grabar aquí. Usa “o sube un audio”.');return}
  let s;try{s=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){aviso('Necesitamos permiso para usar el micrófono.');return}
  const ch=[];REC=new MediaRecorder(s);REC.ondataavailable=e=>e.data.size&&ch.push(e.data);
  REC.onstop=()=>{s.getTracks().forEach(t=>t.stop());clearInterval(RECt);REC=null;b.classList.remove('rec');b.querySelector('span').textContent='Dictar '+(esServ()?'servicio':'producto');procesarAudio(new Blob(ch,{type:ch[0]&&ch[0].type||'audio/webm'}))};
  REC.start();b.classList.add('rec');let n=0;b.querySelector('span').textContent='Detener (0 s)';RECt=setInterval(()=>{n++;b.querySelector('span').textContent=`Detener (${n} s)`;if(n>=20&&REC)REC.stop()},1000)};
async function procesarAudio(blob){const st=$i('iaDst'),rs=$i('iaDres');rs.innerHTML='';IA.onProg=(t,p)=>progreso(st,t,p);progreso(st,'Preparando…',null);
  try{const t0=performance.now();const a=await audioA16k(blob);IA.med.audioSeg=a.length/16000;
    if(!WW||!IA.med.whisperCarga)progreso(st,'Descargando el asistente de voz (solo la 1.ª vez)…',2);else progreso(st,'Escuchando tu audio…',null);
    const r=await transcribir(a);IA.med.transcribirMs=r.ms;IA.med.totalMs=performance.now()-t0;IA.med.texto=r.text;
    const p=entender(r.text,esServ());IA.ultimo=p;st.innerHTML='';llenarForm(p);mostrarEntendido(p)}
  catch(e){console.error(e);progreso(st,'<span style="color:#b91c1c">No pudimos escuchar el audio. Intenta de nuevo o escribe los datos.</span>',null)}}
IA.procesarAudio=procesarAudio;
function llenarForm(p){if(p.nombre)pnom.value=p.nombre;if(p.categoria)pcat.value=p.categoria;if(p.precio)ppre.value=(+p.precio).toFixed(2);
  if(esServ()){if(window.xdur&&p.duracion)xdur.value=p.duracion;if(window.xpm&&p.precio)xpm.value='fijo'}else if(p.stock!=null)psto.value=p.stock;
  if(p.descripcion&&!pdes.value.trim())pdes.value=p.descripcion;if(p.caracteristicas&&p.caracteristicas.length&&!pcar.value.trim())pcar.value=p.caracteristicas.join('\n')}
function mostrarEntendido(p){const sv=esServ(),f=(k,v)=>`<div><span class="ia-sub">${k}:</span> <b>${v?E(v):'<span style="color:#b45309">no lo escuché, complétalo</span>'}</b></div>`;
  $i('iaDres').innerHTML=`<div class="ia-res"><div class="ia-sub" style="margin-bottom:4px">Escuché: “${E(p.texto)}”</div>${f(sv?'Servicio':'Nombre',p.nombre)}${f('Precio',p.precio?soles(p.precio):'')}${sv?f('Duración',p.duracion):f('Cantidad',p.stock!=null?p.stock+' en stock':'')}${f('Categoría',p.categoria)}${sv?'':f('Tamaño',p.tamano||'—')}<div class="ia-sub" style="margin-top:6px"><i class="ti ti-check"></i> Ya llenamos el formulario. Revisa los datos${FT.length?'':', agrega una foto'} y toca <b>Publicar</b>.</div></div>`}
IA.audioArchivo=f=>procesarAudio(f);

/* =====================================================================
   OCR con tesseract.js (se descarga solo al usarlo)
   ===================================================================== */
let TW=null;
async function ocrWorker(onP){if(TW)return TW;await cargarScript(CFG.tess);const t0=performance.now();
  TW=await Tesseract.createWorker('spa',1,{logger:m=>{if(m.status&&onP)onP(m)}});IA.med.ocrCarga=performance.now()-t0;return TW}
async function prepImagen(file,max=1600,invertir=false){const bm=await createImageBitmap(file);const k=Math.min(1,max/Math.max(bm.width,bm.height)),c=document.createElement('canvas');c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);const g=c.getContext('2d');g.drawImage(bm,0,0,c.width,c.height);bm.close&&bm.close();
  const id=g.getImageData(0,0,c.width,c.height),d=id.data;for(let i=0;i<d.length;i+=4){let y=.299*d[i]+.587*d[i+1]+.114*d[i+2];if(invertir)y=255-y;d[i]=d[i+1]=d[i+2]=y}g.putImageData(id,0,0);return c}
async function leer(file,st,txt,opc={}){const w=await ocrWorker(m=>{if(m.status=='loading language traineddata'||/load/.test(m.status))progreso(st,'Descargando el lector de fotos (solo la 1.ª vez)…',m.progress*100);else if(m.status=='recognizing text')progreso(st,txt,m.progress*100)});
  const t0=performance.now();const c=await prepImagen(file,1600,opc.invertir);const r=await w.recognize(c);IA.med.ocrMs=(IA.med.ocrMs||0)+(performance.now()-t0);return r.data.text||''}
IA.leer=leer;

/* =====================================================================
   2) FOTO DE MI LISTA DE PRECIOS
   ===================================================================== */
function parsearLista(texto){const filas=[];
  for(let l of texto.split(/\n/)){l=l.replace(/[|_—–]+/g,' ').replace(/\s+/g,' ').trim();if(l.length<3)continue;
    l=l.replace(/S\s*\$\s*\/|\$\s*\/|S\s*\/\s*\.?|s\s*\/|5\s*\/(?=\s*[\dSsOolI])/g,' S/ ').replace(/S\/\s*([\dSsOolI|][\dSsOolI|.,]*)\s*$/,(m,v)=>'S/ '+v.replace(/[Ss]/g,'5').replace(/[Oo]/g,'0').replace(/[lI|]/g,'1')).replace(/\s+/g,' ').trim();
    const m=l.match(/^(.*?[a-záéíóúñ].*?)[\s.:\-=…]*(?:S\s*\/\s*\.?|5\s*\/|\$|s\/)?\s*(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:soles)?$/i);if(!m)continue;
    let nom=m[1].replace(/\s*(S\s*\/|5\s*\/|\$)\s*$/i,'').replace(/[\s.:\-=…]+$/,'').trim();if(!/[a-záéíóúñ]{3}/i.test(nom))continue;
    const precio=parseFloat(m[2].replace(',','.'));if(!(precio>0))continue;
    filas.push({nombre:cap(nom),precio,categoria:adivinarCategoria(nom,nom).cat,stock:esServ()?0:10,ok:true})}
  return filas}
IA.parsearLista=parsearLista;
IA.lista=()=>{const b=modal('<i class="ti ti-list-details"></i> Foto de mi lista de precios <span class="ia-beta">NUEVO</span>',`<p class="text-sm mb-3">Toma una foto de tu lista de precios (en cuaderno, pizarra o papel). Leemos los ${esServ()?'servicios':'productos'} y precios para que los crees todos de una vez.</p>
  <label class="${BTN} cursor-pointer w-full"><i class="ti ti-camera"></i> Tomar o elegir foto<input type="file" accept="image/*" id="iaLf" class="hidden"></label><div class="ia-sub mt-2"><i class="ti ti-bulb"></i> Consejo: buena luz, foto de frente y letra clara. Se procesa en tu celular.</div><div id="iaLst" class="mt-3"></div><div id="iaLres"></div>`);
  $i('iaLf').onchange=e=>{const f=e.target.files[0];if(f)IA.listaArchivo(f)}};
IA.listaArchivo=async f=>{const st=$i('iaLst'),rs=$i('iaLres');IA.listaImg=URL.createObjectURL(f);rs.innerHTML=`<img src="${IA.listaImg}" style="max-height:160px;border-radius:10px;margin:8px auto;display:block">`;IA.med.ocrMs=0;
  try{const t0=performance.now();const tx=await leer(f,st,'Leyendo tu lista…');IA.med.listaTotalMs=performance.now()-t0;IA.med.listaTexto=tx;const fl=parsearLista(tx);IA.filas=fl;st.innerHTML='';pintarLista()}
  catch(e){console.error(e);progreso(st,'<span style="color:#b91c1c">No pudimos leer la foto. Intenta con más luz.</span>',null)}};
function pintarLista(){const fl=IA.filas||[],rs=$i('iaLres'),sv=esServ();
  if(!fl.length){rs.innerHTML+=`<p class="mt-2">No encontramos precios en la foto. Prueba con otra foto más clara, con un ${sv?'servicio':'producto'} y su precio por renglón.</p>`;return}
  rs.innerHTML=`${IA.listaImg?`<img src="${IA.listaImg}" style="max-height:110px;border-radius:8px;margin:4px auto;display:block">`:''}<p class="text-sm mt-2 mb-2"><b>Encontramos ${fl.length}.</b> Revisa y corrige lo que haga falta:</p><div style="overflow-x:auto"><table class="ia-tab"><tr class="ia-sub"><td></td><td>${sv?'Servicio':'Producto'}</td><td style="width:78px">Precio S/</td>${sv?'':'<td style="width:56px">Stock</td>'}</tr>${fl.map((r,i)=>`<tr><td style="width:24px"><input type="checkbox" ${r.ok?'checked':''} onchange="IA.filas[${i}].ok=this.checked" style="width:auto"></td><td><input value="${E(r.nombre)}" oninput="IA.filas[${i}].nombre=this.value"></td><td><input inputmode="decimal" value="${(+r.precio).toFixed(2)}" oninput="IA.filas[${i}].precio=this.value"></td>${sv?'':`<td><input inputmode="numeric" value="${r.stock}" oninput="IA.filas[${i}].stock=this.value"></td>`}</tr>`).join('')}</table></div>
  <p class="ia-sub mt-2"><i class="ti ti-info-circle"></i> Se crean <b>ocultos</b> hasta que les pongas foto. Puedes editarlos después.</p><div id="iaLme" class="text-sm text-red-600 my-1"></div><button class="${BTN} w-full mt-2" onclick="IA.crearTodos()"><i class="ti ti-checks"></i> Crear todos</button>`}
IA.crearTodos=async()=>{const sel=(IA.filas||[]).filter(r=>r.ok),er=[];if(!sel.length)return $i('iaLme').textContent='Marca al menos uno.';
  const rows=sel.map(r=>{const p=precioValido(r.precio);if(p===null||String(r.nombre).trim().length<2)er.push(r.nombre||'(sin nombre)');const sv=esServ();
    return{tienda_id:T.id,nombre:String(r.nombre).trim().slice(0,120),categoria:r.categoria||'General',precio:p,precio_antes:null,stock:sv?0:(parseInt(r.stock,10)||0),descripcion:'',caracteristicas:[],fotos:[],activo:false,...(sv?{tipo:'servicio',extra:{precio_modo:'fijo',duracion:''}}:{})}});
  if(er.length)return $i('iaLme').textContent='Revisa el nombre o precio de: '+er.join(', ');
  if(T.demo_local){rows.forEach((r,i)=>PS.unshift({...r,id:'demo-'+Date.now()+'-'+i}));IA.cerrar();cab();rt();aviso(`✓ ${rows.length} creados (demo, no se guardó nada)`);return}
  const {error}=await sb.from('productos').insert(rows);if(error)return $i('iaLme').textContent=errTxt(error);IA.cerrar();aviso(`✓ ${rows.length} creados. Ponles foto para que se vean en tu tienda.`);await recargar()};

/* =====================================================================
   3) REVISAR CAPTURA DE YAPE / PLIN  (solo sugerencia)
   ===================================================================== */
const MES={ene:1,feb:2,mar:3,abr:4,may:5,jun:6,jul:7,ago:8,set:9,sep:9,oct:10,nov:11,dic:12};
function parsearPago(tx){const t=tx.replace(/[Oo](?=\d)|(?<=\d)[Oo]/g,'0').replace(/\s+/g,' ');const r={};
  let m=t.match(/S\s*\/\s*\.?\s*(\d{1,5}(?:[.,]\d{3})*[.,]\d{2})\b/i)||t.match(/(?:monto|total|importe)\D{0,8}(\d{1,5}[.,]\d{2})\b/i)||t.match(/\b(\d{1,5}[.,]\d{2})\b/);
  if(m)r.monto=parseFloat(m[1].replace(/[.,](?=\d{3}\b)/g,'').replace(',','.'));
  m=t.match(/\b(\d{1,2})\s*(?:de\s*)?(ene|feb|mar|abr|may|jun|jul|ago|set|sep|oct|nov|dic)[a-z]*\.?\s*(?:de\s*)?(\d{4})\b/i);
  if(m)r.fecha=`${m[3]}-${String(MES[m[2].toLowerCase()]).padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  else{m=t.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);if(m)r.fecha=`${m[3].length==2?'20'+m[3]:m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`}
  m=t.match(/\b(\d{1,2}:\d{2})\s*([ap])\.?\s*m\.?/i)||t.match(/\b(\d{1,2}:\d{2})\b/);if(m)r.hora=m[1]+(m[2]?(' '+m[2].toLowerCase()+'. m.'):'');
  m=t.match(/operaci[oó0]n\D{0,12}(\d{6,12})\b/i)||t.match(/c[oó]d(?:igo)?\.?\s*(?:de\s*)?(?:seguridad|operaci[oó]n)?\D{0,8}(\d{6,12})\b/i);
  if(m)r.operacion=m[1];else{const all=(t.match(/\b\d{6,12}\b/g)||[]).filter(x=>!/^20\d{2}/.test(x));if(all.length)r.operacion=all[0]}
  r.app=/plin/i.test(t)?'Plin':/yape/i.test(t)?'Yape':'';return r}
IA.parsearPago=parsearPago;
function comparar(r,o){const motivos=[],tot=+o.total;let ok=true;
  if(r.monto==null){ok=false;motivos.push('No pudimos leer el monto.')}else if(Math.abs(r.monto-tot)>0.009){ok=false;motivos.push(`El monto (${soles(r.monto)}) no es igual al total del pedido (${soles(tot)}).`)}
  if(!r.operacion){ok=false;motivos.push('No encontramos el número de operación.')}
  else{const usados=JSON.parse(localStorage.getItem('rm_ia_ops')||'{}');if(usados[r.operacion]&&usados[r.operacion]!=o.id){ok=false;motivos.push('Este número de operación ya se usó en otro pedido.')}}
  if(!r.fecha){ok=false;motivos.push('No pudimos leer la fecha.')}else{const dp=new Date(String(o.creado).slice(0,10)+'T12:00'),df=new Date(r.fecha+'T12:00'),dd=(df-dp)/864e5;if(dd<0||dd>2){ok=false;motivos.push('La fecha del pago no coincide con la fecha del pedido.')}}
  return{ok,motivos}}
IA.comparar=comparar;
IA.pago=id=>{const o=PE.find(x=>x.id==id);if(!o)return;IA.pedido=o;
  const b=modal('<i class="ti ti-receipt"></i> Revisar captura de pago <span class="ia-beta">NUEVO</span>',`<div class="text-sm mb-3">Pedido <b>#${E(o.codigo)}</b> · ${E(o.cliente)} · Total <b>${soles(o.total)}</b></div>
  <label class="${BTN} cursor-pointer w-full"><i class="ti ti-photo"></i> Elegir captura de Yape o Plin<input type="file" accept="image/*" id="iaPf" class="hidden"></label><div class="ia-sub mt-2"><i class="ti ti-shield-check"></i> Es solo una ayuda: leemos monto, fecha y número de operación. Siempre confirma en tu app de Yape o Plin antes de marcar el pedido como pagado.</div><div id="iaPst" class="mt-3"></div><div id="iaPres"></div>`);
  $i('iaPf').onchange=e=>{const f=e.target.files[0];if(f)IA.pagoArchivo(f)}};
IA.pagoArchivo=async f=>{const o=IA.pedido,st=$i('iaPst'),rs=$i('iaPres');rs.innerHTML='';IA.med.ocrMs=0;
  try{const t0=performance.now();let tx=await leer(f,st,'Leyendo la captura…');let r=parsearPago(tx);
    if(r.monto==null||!r.operacion){const tx2=await leer(f,st,'Leyendo otra vez…',{invertir:true});tx+='\n'+tx2;r=parsearPago(tx)}
    IA.med.pagoTotalMs=performance.now()-t0;IA.med.pagoTexto=tx;IA.ultPago=r;st.innerHTML='';const c=comparar(r,o);IA.ultComp=c;
    if(r.operacion){const u=JSON.parse(localStorage.getItem('rm_ia_ops')||'{}');if(!u[r.operacion])u[r.operacion]=o.id;localStorage.setItem('rm_ia_ops',JSON.stringify(u))}
    const fila=(k,v,b)=>`<tr><td class="ia-sub">${k}</td><td><b>${v?E(v):'—'}</b></td><td>${b==null?'':b?'<span class="ia-tag ia-ok">✓</span>':'<span class="ia-tag ia-rev">!</span>'}</td></tr>`;
    rs.innerHTML=`<div style="display:flex;gap:12px;align-items:flex-start"><img src="${URL.createObjectURL(f)}" style="width:96px;border-radius:8px;border:1px solid #e5e7eb"><div style="flex:1"><div style="font-size:20px;margin-bottom:6px">${c.ok?'<span class="ia-tag ia-ok" style="font-size:16px"><i class="ti ti-circle-check"></i> Coincide</span>':'<span class="ia-tag ia-rev" style="font-size:16px"><i class="ti ti-alert-triangle"></i> Revisar</span>'}</div>
    <table class="ia-tab">${fila('Monto',r.monto!=null?soles(r.monto):'',r.monto!=null&&Math.abs(r.monto-o.total)<.01)}${fila('Total del pedido',soles(o.total))}${fila('Fecha',r.fecha?new Date(r.fecha+'T12:00').toLocaleDateString('es-PE'):'',r.fecha?!c.motivos.some(x=>/fecha/.test(x)):false)}${fila('Hora',r.hora||'')}${fila('N.º de operación',r.operacion||'',!!r.operacion&&!c.motivos.some(x=>/operaci/.test(x)))}${fila('App',r.app||'')}</table></div></div>
    ${c.motivos.length?`<div class="ia-res" style="border-color:#fde68a;background:#fffbeb">${c.motivos.map(x=>'• '+E(x)).join('<br>')}</div>`:''}
    <p class="ia-sub mt-3"><i class="ti ti-info-circle"></i> ${c.ok?'Todo cuadra con el pedido. Aun así, confirma que el pago llegó en tu app antes de marcarlo como pagado.':'Revisa en tu app de Yape o Plin si el pago llegó completo.'} Una captura se puede falsificar: lo seguro es ver el pago en tu app.</p>`}
  catch(e){console.error(e);progreso(st,'<span style="color:#b91c1c">No pudimos leer la captura. Intenta con otra imagen.</span>',null)}};

/* =====================================================================
   4) MEJORAR FOTO (quitar fondo y poner fondo de color)
   U-2-Netp (Apache-2.0, 4.6 MB) con onnxruntime-web (MIT). Reemplaza a @imgly (AGPL).
   ===================================================================== */
let BW=null,BN=0;const BP={};
function fondoW(){if(BW)return BW;
  const code=`importScripts('${CFG.ort}ort.min.js');ort.env.wasm.wasmPaths='${CFG.ort}';ort.env.wasm.numThreads=1;let S;
  async function modelo(u){let c=null;try{c=await caches.open('rm-ia-modelos');const h=await c.match(u);if(h)return new Uint8Array(await h.arrayBuffer())}catch(e){}
   const r=await fetch(u);const tot=+r.headers.get('content-length')||4.6e6,rd=r.body.getReader(),parts=[];let n=0;for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);n+=value.length;postMessage({prog:[n,tot]})}
   const b=new Uint8Array(n);let o=0;for(const p of parts){b.set(p,o);o+=p.length}try{c&&await c.put(u,new Response(b))}catch(e){}return b}
  onmessage=async e=>{const {id,bmp,u}=e.data;try{const t0=performance.now();if(!S){S=await ort.InferenceSession.create(await modelo(u),{executionProviders:['wasm']});postMessage({cargado:performance.now()-t0})}
   const t1=performance.now(),N=320,W=bmp.width,H=bmp.height,c=new OffscreenCanvas(N,N),g=c.getContext('2d');g.drawImage(bmp,0,0,N,N);const px=g.getImageData(0,0,N,N).data;
   let mx=0;for(let i=0;i<px.length;i+=4)mx=Math.max(mx,px[i],px[i+1],px[i+2]);mx=mx||255;const M=[.485,.456,.406],SD=[.229,.224,.225],x=new Float32Array(3*N*N);
   for(let i=0;i<N*N;i++)for(let k=0;k<3;k++)x[k*N*N+i]=(px[i*4+k]/mx-M[k])/SD[k];
   const out=await S.run({[S.inputNames[0]]:new ort.Tensor('float32',x,[1,3,N,N])});const m=out[S.outputNames[0]].data;let lo=1e9,hi=-1e9;for(const v of m){if(v<lo)lo=v;if(v>hi)hi=v}
   const A=new Float32Array(N*N);for(let i=0;i<N*N;i++){const a=(m[i]-lo)/(hi-lo||1);A[i]=Math.min(1,Math.max(0,(a-.15)/.7))}
   /* quedarse solo con el objeto principal: la mancha más grande (descarta llaves, bolsas, etc. sueltas) */
   const L=new Int32Array(N*N),Q=new Int32Array(N*N);let nl=0,mejor=0,mejorA=0;for(let i=0;i<N*N;i++){if(A[i]<.5||L[i])continue;nl++;let h=0,t=0,ar=0;Q[t++]=i;L[i]=nl;while(h<t){const k=Q[h++];ar++;const x=k%N,y=(k/N)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=N||yy>=N)continue;const kk=yy*N+xx;if(!L[kk]&&A[kk]>=.5){L[kk]=nl;Q[t++]=kk}}}if(ar>mejorA){mejorA=ar;mejor=nl}}
   const K=new Uint8Array(N*N);for(let i=0;i<N*N;i++)if(L[i]==mejor)K[i]=1;for(let r=0;r<3;r++){const K2=K.slice();for(let i=0;i<N*N;i++)if(!K[i]){const x=i%N;if((x>0&&K[i-1])||(x<N-1&&K[i+1])||(i>=N&&K[i-N])||(i<N*N-N&&K[i+N]))K2[i]=1}K.set(K2)}
   const mc=new OffscreenCanvas(N,N),mg=mc.getContext('2d'),mi=mg.createImageData(N,N);for(let i=0;i<N*N;i++)mi.data[i*4+3]=K[i]?Math.round(A[i]*255):0;mg.putImageData(mi,0,0);
   const oc=new OffscreenCanvas(W,H),og=oc.getContext('2d');og.drawImage(mc,0,0,W,H);og.globalCompositeOperation='source-in';og.drawImage(bmp,0,0);
   const al=og.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=0,y1=0;for(let y=0;y<H;y+=2)for(let xx=0;xx<W;xx+=2)if(al[(y*W+xx)*4+3]>40){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y}
   const png=await oc.convertToBlob({type:'image/png'});postMessage({id,png,caja:x1>x0?[x0,y0,x1,y1]:[0,0,W,H],ms:performance.now()-t1})}catch(err){postMessage({id,err:String(err&&err.message||err)})}}`;
  BW=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
  BW.onmessage=e=>{const d=e.data;if(d.prog){IA.med.fondoBytes=d.prog[1];IA.onFProg&&IA.onFProg(`Descargando la herramienta (solo la 1.ª vez): ${MB(d.prog[0])} de ${MB(d.prog[1])}`,d.prog[0]/d.prog[1]*100);return}
    if(d.cargado){IA.med.fondoCarga=d.cargado;IA.onFProg&&IA.onFProg('Quitando el fondo…',null);return}const r=BP[d.id];delete BP[d.id];if(r)d.err?r[1](new Error(d.err)):r[0](d)};
  BW.onerror=e=>{Object.values(BP).forEach(r=>r[1](new Error(e.message||'worker')));for(const k in BP)delete BP[k];BW=null};return BW}
IA.quitarFondo=async blob=>{const bmp=await createImageBitmap(blob),w=fondoW();return new Promise((ok,mal)=>{const id=++BN;BP[id]=[ok,mal];w.postMessage({id,bmp,u:CFG.u2},[bmp])})};
async function componer(png,caja,color,lado=1000){const im=await createImageBitmap(png),c=document.createElement('canvas');c.width=c.height=lado;const g=c.getContext('2d');
  if(color){g.fillStyle=color;g.fillRect(0,0,lado,lado)}const [x0,y0,x1,y1]=caja,bw=x1-x0+1,bh=y1-y0+1,k=Math.min(lado*.84/bw,lado*.84/bh);const dw=bw*k,dh=bh*k;
  if(color){g.save();g.shadowColor='rgba(0,0,0,.18)';g.shadowBlur=24;g.shadowOffsetY=10;g.drawImage(im,x0,y0,bw,bh,(lado-dw)/2,(lado-dh)/2,dw,dh);g.restore()}else g.drawImage(im,x0,y0,bw,bh,(lado-dw)/2,(lado-dh)/2,dw,dh);
  im.close&&im.close();return canvasBlob(c,color?'image/jpeg':'image/png',.88)}
const COLORES=[['#ffffff','Blanco'],['#f3f4f6','Gris claro'],['#fdf6ec','Crema'],['#fce7f3','Rosado'],['#e0f2fe','Celeste']];
IA.mejorarFoto=async i=>{const f=FT[i];if(!f||!f.blob)return;IA.fi=i;const tc=(gT()&&gT().color)||'#16a34a';const cols=[...COLORES,[tc,'Color de mi tienda']];IA.fcolor='#ffffff';
  modal('<i class="ti ti-wand"></i> Mejorar foto <span class="ia-beta">NUEVO</span>',`<div class="ia-ba"><div><img src="${f.urlO}"><div class="ia-cap">Antes</div></div><div><img id="iaFd" src="${f.urlO}" style="opacity:.35"><div class="ia-cap">Después</div></div></div>
  <div id="iaFst" class="mt-3"></div><div class="mt-3"><div class="ia-sub mb-1">Color de fondo</div><div style="display:flex;gap:10px;flex-wrap:wrap" id="iaFsw">${cols.map(([c,n])=>`<button type="button" title="${n}" aria-label="${n}" class="ia-sw ${c=='#ffffff'?'on':''}" style="background:${c}" onclick="IA.colorFoto('${c}',this)"></button>`).join('')}</div></div>
  <div class="ia-sub mt-2"><i class="ti ti-device-mobile"></i> Se procesa en tu celular. Tu foto no se sube a ningún lado.</div><div class="flex gap-2 mt-4"><button class="${BTNO} flex-1" onclick="IA.cerrar()">Cancelar</button><button class="${BTN} flex-1" id="iaFok" disabled onclick="IA.usarFoto()"><i class="ti ti-check"></i> Usar esta foto</button></div>`);
  const st=$i('iaFst');IA.onFProg=(t,p)=>progreso(st,t,p);progreso(st,BW&&IA.med.fondoCarga?'Quitando el fondo…':'Preparando… (la 1.ª vez descarga 4,6 MB)',BW?null:2);
  try{const t0=performance.now();const r=await IA.quitarFondo(f.blob);IA.med.fondoMs=r.ms;IA.med.fondoTotalMs=performance.now()-t0;IA.fres=r;st.innerHTML='';await IA.colorFoto(IA.fcolor);$i('iaFok').disabled=false}
  catch(e){console.error(e);progreso(st,'<span style="color:#b91c1c">No se pudo mejorar la foto en este equipo.</span>',null)}};
IA.colorFoto=async(c,btn)=>{IA.fcolor=c;document.querySelectorAll('#iaFsw .ia-sw').forEach(b=>b.classList.toggle('on',btn?b==btn:b.style.background&&b.getAttribute('title')=='Blanco'&&c=='#ffffff'));if(!IA.fres)return;
  const b=await componer(IA.fres.png,IA.fres.caja,c);IA.fblob=b;const d=$i('iaFd');if(d){d.src=URL.createObjectURL(b);d.style.opacity=1}};
IA.usarFoto=()=>{const f=FT[IA.fi];if(!f||!IA.fblob)return;f.blobSF=IA.fblob;f.urlSF=URL.createObjectURL(IA.fblob);f.sinFondo=true;f.usarOriginal=false;IA.cerrar();pintaFotos();aviso('Foto mejorada ✓')};

/* =====================================================================
   Conexión con el panel
   ===================================================================== */
IA.enModal=()=>{const old=$i('iaDict');if(old)old.remove();if(typeof EF!='undefined'&&EF)return;const s1=$i('s1');if(!s1)return;s1.insertAdjacentHTML('beforebegin',cajaDictar());$i('iaAud').onchange=e=>{const f=e.target.files[0];if(f)procesarAudio(f)}};
IA.botonLista=()=>{const h=document.querySelector('#t0 .flex.justify-between');if(!h||$i('iaBL'))return;h.style.flexWrap='wrap';h.style.gap='10px';const g=document.createElement('div');g.className='flex flex-wrap gap-2';g.style.width='100%';h.appendChild(g);const add=h.querySelector('button');g.appendChild(add);
  g.insertAdjacentHTML('afterbegin',`<button id="iaBL" class="${BTNO}" onclick="IA.lista()"><i class="ti ti-camera"></i> Foto de mi lista de precios</button>`)};
})();
