const C="zonqr-v11";
const SHELL=["./","./index.html","./promo.html","./offline.html","./css/styles.css","./js/config.js","./js/data1.js","./js/data2.js","./js/storage.js","./js/app.js","./manifest.webmanifest","./assets/icons/icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
    if(r&&r.ok&&new URL(e.request.url).origin===self.location.origin){const copy=r.clone();caches.open(C).then(cache=>cache.put(e.request,copy));}
    return r;
  }).catch(()=>caches.match("./index.html"))));
});
