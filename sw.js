const CACHE='copa-carnaval-v1';
const SHELL=['/','/index.html','/styles.css','/app.js','/vendor/supabase.js','/fonts/fonts.css','/logo.png','/icon-192.png','/icon-512.png','/manifest.webmanifest',
 '/fonts/font1.woff2','/fonts/font2.woff2','/fonts/font3.woff2','/fonts/font4.woff2','/fonts/font5.woff2','/fonts/font6.woff2','/fonts/font7.woff2','/fonts/font8.woff2','/fonts/font9.woff2'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
  const copiaLocal=()=>caches.match(e.request).then(r=>r||caches.match('/index.html'));
  e.respondWith(fetch(e.request).then(r=>{
    if(!r.ok)return copiaLocal().then(c=>c||r);
    caches.open(CACHE).then(c=>c.put(e.request,r.clone()));
    return r}).catch(copiaLocal))});
