// Service worker simple: red primero, caché como respaldo sin conexión.
const C='rivermarket-v9';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))});
// Notificaciones push del administrador (tienda nueva).
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(_){d={title:'RiverMarket',body:e.data?e.data.text():''}}
e.waitUntil(self.registration.showNotification(d.title||'RiverMarket',{body:d.body||'',icon:'/img/apple-touch-icon.png',badge:'/img/favicon-32.png',tag:d.tag,renotify:true,data:{url:d.url||'/admin.html?estado=revision'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL(e.notification.data&&e.notification.data.url||'/admin.html',self.location.origin).href;
e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if(w.url.includes('/admin.html')&&'navigate' in w)return w.navigate(u).then(x=>(x||w).focus())}return clients.openWindow(u)}))});
