/* RiverMarket · generador de publicaciones (layout medido, sin superposiciones) */
(function(){
const ESTILOS={clasico:'Clásico',oscuro:'Oscuro',minimal:'Minimal',llamativo:'Llamativo'};
const cache={};
function img(u){if(!u)return Promise.resolve(null);if(cache[u])return cache[u];return cache[u]=new Promise(r=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>r(i);i.onerror=()=>r(null);i.src=u})}
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function hex2rgb(h){h=(h||'#0aad0a').replace('#','');if(h.length==3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255]}
function mix(h,t,a){const c=hex2rgb(h),d=hex2rgb(t);return'rgb('+c.map((v,i)=>Math.round(v*(1-a)+d[i]*a)).join(',')+')'}
function lum(h){const[r,g,b]=hex2rgb(h);return(.299*r+.587*g+.114*b)/255}
const F=(w,s)=>`${w} ${Math.round(s)}px Inter, "Segoe UI", Roboto, Arial, sans-serif`;
function lineas(g,t,mw,max){const ws=String(t||'').trim().split(/\s+/);const out=[];let l='';for(let i=0;i<ws.length;i++){const p=l?l+' '+ws[i]:ws[i];if(g.measureText(p).width<=mw||!l){l=p}else{out.push(l);l=ws[i];if(out.length==max){l=null;break}}}
 if(l!==null&&l)out.push(l);const corto=out.length>max||ws.join(' ')!==out.join(' ');let o=out.slice(0,max);
 if(corto){let u=o[o.length-1];while(u&&g.measureText(u+'…').width>mw)u=u.slice(0,-1);o[o.length-1]=u.replace(/\s+$/,'')+'…'}
 o=o.map(s=>{if(g.measureText(s).width<=mw)return s;while(s&&g.measureText(s+'…').width>mw)s=s.slice(0,-1);return s+'…'});return o}
function ajustar(g,t,mw,max,peso,s0,smin){for(let s=s0;s>=smin;s-=2){g.font=F(peso,s);const ls=lineas(g,t,mw,max);if(ls.length<=max&&!ls.some(x=>x.endsWith('…')))return{s,ls}}g.font=F(peso,smin);return{s:smin,ls:lineas(g,t,mw,max)}}
function corta(g,t,mw){if(g.measureText(t).width<=mw)return t;while(t&&g.measureText(t+'…').width>mw)t=t.slice(0,-1);return t+'…'}
function telefono(w){let d=String(w||'').replace(/\D/g,'');if(!d)return'';if(d.length==9)d='51'+d;if(d.startsWith('51')&&d.length==11)return'+51 '+d.slice(2,5)+' '+d.slice(5,8)+' '+d.slice(8);return'+'+d}
function soles(n){return'S/ '+(+n).toFixed(2)}
function waIcon(g,x,y,s,fg,bg){g.save();g.fillStyle=bg;g.beginPath();g.arc(x+s/2,y+s/2,s/2,0,7);g.fill();g.strokeStyle=fg;g.lineWidth=s*.075;g.beginPath();g.arc(x+s/2,y+s/2,s*.3,0,7);g.stroke();g.fillStyle=fg;g.beginPath();g.moveTo(x+s*.22,y+s*.86);g.lineTo(x+s*.27,y+s*.66);g.lineTo(x+s*.38,y+s*.76);g.closePath();g.fill();
 g.lineWidth=s*.07;g.lineCap='round';g.beginPath();g.arc(x+s/2,y+s/2,s*.15,Math.PI*.6,Math.PI*1.4,false);g.stroke();g.restore()}
function qrCanvas(texto,tam){const d=document.createElement('div');new QRCode(d,{text:texto,width:tam,height:tam,correctLevel:QRCode.CorrectLevel.M});return d.querySelector('canvas')}
function paleta(est,col){const claro=lum(col)>.6;const acc=claro?mix(col,'#000000',.45):col;
 if(est=='oscuro')return{bg:'#111827',bg2:'#1f2937',tx:'#ffffff',sub:'#cbd5e1',acc:lum(col)<.25?mix(col,'#ffffff',.5):col,acTx:'#fff',foot:'#0b1220',footTx:'#fff',badge:'#ef4444',marco:'#1f2937'};
 if(est=='minimal')return{bg:'#ffffff',bg2:'#f3f4f6',tx:'#111827',sub:'#6b7280',acc,acTx:'#fff',foot:'#f3f4f6',footTx:'#111827',badge:'#dc2626',marco:'#f3f4f6'};
 if(est=='llamativo')return{bg:acc,bg2:mix(acc,'#000000',.25),tx:'#ffffff',sub:'rgba(255,255,255,.85)',acc:'#facc15',acTx:'#111827',foot:'#111827',footTx:'#fff',badge:'#facc15',badgeTx:'#111827',marco:mix(acc,'#ffffff',.2)};
 return{bg:mix(col,'#ffffff',.9),bg2:mix(col,'#ffffff',.75),tx:'#111827',sub:'#4b5563',acc,acTx:'#fff',foot:acc,footTx:'#fff',badge:'#dc2626',marco:mix(col,'#ffffff',.8)}}

async function dibujar(c,o){
 const t=o.tienda,p=o.producto,[W,H]=o.formato.split('x').map(Number),vert=H>W,est=o.estilo||'clasico',P=paleta(est,t.color||'#0aad0a');
 try{await Promise.all(['600','700','800'].map(w=>document.fonts.load(F(w,40))));await document.fonts.ready}catch(e){}
 const [foto,logo,rm]=await Promise.all([img(o.foto),img(t.logo),img(o.logoRM)]);
 c.width=W;c.height=H;const g=c.getContext('2d');g.textBaseline='alphabetic';
 const M=Math.round(W*.06),CW=W-2*M;
 // fondo
 g.fillStyle=P.bg;g.fillRect(0,0,W,H);
 if(est=='llamativo'){g.fillStyle='rgba(255,255,255,.09)';g.beginPath();g.arc(W*.95,H*.05,W*.45,0,7);g.fill();g.beginPath();g.arc(0,H*.7,W*.3,0,7);g.fill()}
 // --- cabecera
 let y=M;const hh=Math.round(W*(vert?.11:.085));
 let x=M;if(logo){g.save();g.beginPath();g.arc(x+hh/2,y+hh/2,hh/2,0,7);g.closePath();g.fillStyle='#fff';g.fill();g.clip();const k=Math.max(hh/logo.width,hh/logo.height);g.drawImage(logo,x+(hh-logo.width*k)/2,y+(hh-logo.height*k)/2,logo.width*k,logo.height*k);g.restore();g.strokeStyle=P.marco;g.lineWidth=4;g.beginPath();g.arc(x+hh/2,y+hh/2,hh/2,0,7);g.stroke();x+=hh+W*.025}
 else{g.fillStyle=P.acc;g.beginPath();g.arc(x+hh/2,y+hh/2,hh/2,0,7);g.fill();g.fillStyle=P.acTx;g.font=F('bold',hh*.45);g.textAlign='center';g.fillText((t.nombre||'?').trim()[0].toUpperCase(),x+hh/2,y+hh*.66);g.textAlign='left';x+=hh+W*.025}
 const tieneDesc=p.precio_antes&&+p.precio_antes>+p.precio,pct=tieneDesc?Math.round((1-p.precio/p.precio_antes)*100):0;
 // badge en cabecera (derecha) solo si hay precio antes
 let bw=0;if(tieneDesc){const bt='-'+pct+'%',lab=(o.texto||'').trim();g.font=F('800',hh*.42);const w1=g.measureText(bt).width;g.font=F('bold',hh*.2);const w2=lab?g.measureText(lab.toUpperCase()).width:0;bw=Math.max(w1,w2)+hh*.5;const bh=hh;g.fillStyle=P.badge;rr(g,W-M-bw,y,bw,bh,bh*.25);g.fill();g.fillStyle=P.badgeTx||'#fff';g.textAlign='center';
  if(lab){g.font=F('bold',hh*.2);g.fillText(corta(g,lab.toUpperCase(),bw-hh*.3),W-M-bw/2,y+hh*.32);g.font=F('800',hh*.42);g.fillText(bt,W-M-bw/2,y+hh*.8)}else{g.font=F('800',hh*.42);g.fillText(bt,W-M-bw/2,y+hh*.65)}g.textAlign='left'}
 const nmw=W-M-x-(bw?bw+W*.03:0);g.fillStyle=P.tx;let ns=hh*.42;g.font=F('800',ns);while(g.measureText(t.nombre).width>nmw&&ns>hh*.26){ns-=2;g.font=F('800',ns)}g.fillText(corta(g,t.nombre||'',nmw),x,y+hh*.5+ns*.15);
 g.fillStyle=P.sub;g.font=F('600',hh*.22);g.fillText(corta(g,'Tienda en RiverMarket',nmw),x,y+hh*.5+ns*.15+hh*.3);
 y+=hh+W*.04;
 // --- pie (de abajo hacia arriba)
 const qrOn=o.qr!==false,fh=Math.round(W*(vert?.24:.2)),fy=H-M-fh;
 g.fillStyle=P.foot;rr(g,M,fy,CW,fh,W*.035);g.fill();
 const pad=fh*.12;let qx=M+CW;
 if(qrOn){const qs=fh-2*pad;qx=M+CW-pad-qs;g.fillStyle='#fff';rr(g,qx,fy+pad,qs,qs,qs*.08);g.fill();const ip=qs*.07,q=qrCanvas(o.url,512);g.imageSmoothingEnabled=false;g.drawImage(q,qx+ip,fy+pad+ip,qs-2*ip,qs-2*ip);g.imageSmoothingEnabled=true}
 const fx=M+pad*1.4,fw=qx-fx-pad*1.4,is=fh*.3;
 g.fillStyle=P.footTx;g.font=F('600',fh*.13);g.fillText(corta(g,qrOn?'Pide por WhatsApp o escanea':'Pide por WhatsApp',fw),fx,fy+pad+fh*.13);
 const tel=telefono(t.wa);waIcon(g,fx,fy+fh*.32,is,'#fff','#25D366');g.fillStyle=P.footTx;let ts=fh*.2;g.font=F('800',ts);while(g.measureText(tel).width>fw-is-fh*.08&&ts>fh*.1){ts-=2;g.font=F('800',ts)}g.fillText(tel,fx+is+fh*.08,fy+fh*.32+is/2+ts*.36);
 const ms=fh*.15;let mx=fx;if(rm){const k=ms/rm.height;g.save();g.fillStyle='#fff';rr(g,mx-ms*.15,fy+fh-pad-ms*1.15,rm.width*k+ms*.3,ms*1.3,ms*.3);g.fill();g.drawImage(rm,mx,fy+fh-pad-ms,rm.width*k,ms);g.restore();mx+=rm.width*k+ms*.5}
 g.globalAlpha=.8;g.fillStyle=P.footTx;g.font=F('600',fh*.085);g.fillText(corta(g,'market.rivergreensolutions.com',fx+fw-mx),mx,fy+fh-pad-ms*.3);g.globalAlpha=1;
 // --- precio y nombre (encima del pie)
 let by=fy-W*.035;
 const ps=W*(vert?.13:.1);g.font=F('800',ps);const precio=soles(p.precio);let pss=ps;while(g.measureText(precio).width>CW*.62&&pss>40){pss-=2;g.font=F('800',pss)}
 g.fillStyle=est=='minimal'||est=='clasico'?P.acc:(est=='llamativo'?'#facc15':P.tx);g.fillText(precio,M,by-pss*.05);const pw=g.measureText(precio).width;
 if(tieneDesc){const as=pss*.38;g.font=F('600',as);const at=soles(p.precio_antes),aw=g.measureText(at).width;const axx=M+pw+W*.03,ay=by-pss*.12;if(axx+aw<=W-M){g.fillStyle=P.sub;g.fillText(at,axx,ay);g.fillRect(axx-2,ay-as*.33,aw+4,Math.max(3,as*.08));g.font=F('700',as*.7);g.fillText('Antes',axx,ay-as*1.05)}}
 by-=pss*1.05;
 const nm=ajustar(g,p.nombre,CW,2,'800',W*(vert?.075:.06),W*.035);g.font=F('800',nm.s);g.fillStyle=P.tx;const lh=nm.s*1.15;
 for(let i=nm.ls.length-1;i>=0;i--){g.fillText(nm.ls[i],M,by);by-=lh}
 const fotoBot=by-nm.s*.15-W*.02;
 // --- foto en el espacio restante
 const ax=M,ay=y,aw=CW,ah=Math.max(W*.2,fotoBot-y),R=W*.04;
 g.save();rr(g,ax,ay,aw,ah,R);g.clip();g.fillStyle=P.bg2;g.fillRect(ax,ay,aw,ah);
 if(foto){const r=foto.width/foto.height,ra=aw/ah;
  if(Math.abs(Math.log(r/ra))<.18){const k=Math.max(aw/foto.width,ah/foto.height);g.drawImage(foto,ax+(aw-foto.width*k)/2,ay+(ah-foto.height*k)/2,foto.width*k,foto.height*k)}
  else{const k=Math.max(aw/foto.width,ah/foto.height);g.filter='blur(40px) saturate(1.2)';g.globalAlpha=.55;g.drawImage(foto,ax+(aw-foto.width*k*1.2)/2,ay+(ah-foto.height*k*1.2)/2,foto.width*k*1.2,foto.height*k*1.2);g.filter='none';g.globalAlpha=1;
   const k2=Math.min((aw*.94)/foto.width,(ah*.94)/foto.height),dw=foto.width*k2,dh=foto.height*k2;g.shadowColor='rgba(0,0,0,.25)';g.shadowBlur=W*.03;g.drawImage(foto,ax+(aw-dw)/2,ay+(ah-dh)/2,dw,dh);g.shadowBlur=0}}
 else{g.fillStyle=P.sub;g.font=F('600',W*.04);g.textAlign='center';g.fillText('Sin foto',ax+aw/2,ay+ah/2);g.textAlign='left'}
 g.restore();
 return c}
window.RMPub={dibujar,ESTILOS,telefono};
})();
