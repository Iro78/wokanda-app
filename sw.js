const C='wokanda-v2.1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','fonts/fonts.css','fonts/Fraunces.woff','fonts/Manrope.woff','fonts/JetBrainsMono.woff']).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET' || new URL(e.request.url).origin!==self.location.origin) return;   // only the app's own files; never the data server e.respondWith(fetch(e.request).then(r=>{ try{ const cp=r.clone(); caches.open(C).then(c=>c.put(e.request,cp)); }catch(x){} return r; }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./')))); });
