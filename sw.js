// Service worker do catálogo USE ELLBA: abre o site e mostra fotos já vistas sem esperar a rede.
const V = 'cat-v1', FOTOS = 'cat-fotos-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== FOTOS).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname === 'res.cloudinary.com') { // fotos: usa a guardada, atualiza só se não tiver
    e.respondWith(caches.open(FOTOS).then(c => c.match(r).then(h => h || fetch(r).then(n => { if (n && (n.ok || n.type === 'opaque')) { c.put(r, n.clone()); } return n; }))));
    return;
  }
  if (u.origin === location.origin) { // página e arquivos do site: mostra o guardado e atualiza ao fundo
    e.respondWith(caches.open(V).then(c => c.match(r, { ignoreSearch: true }).then(h => {
      const rede = fetch(r).then(n => { if (n && n.ok) c.put(r, n.clone()); return n; }).catch(() => h);
      return h || rede;
    })));
  }
});
