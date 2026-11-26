/* Wokanda — service worker strony (odmiana serwerowa na GitHub Pages).
   Obsługuje wyłącznie własne pliki strony (ten sam adres): powłokę aplikacji, czcionki, ikony.
   Nigdy nie dotyka zapytań do serwera danych (inny adres) ani niczego poza GET. */
const C = 'wokanda-v2.5';
const SHELL = ['./', 'fonts/fonts.css', 'fonts/Fraunces.woff', 'fonts/Manrope.woff', 'fonts/JetBrainsMono.woff', 'manifest.webmanifest', 'icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // serwer danych i wszystko obce: bez udziału service workera
  const isPage = req.mode === 'navigate';
  // najpierw sieć (strona zawsze sprawdzana na serwerze, żeby nowa wersja nie zalegała); bez sieci — zapisana kopia
  e.respondWith(
    fetch(isPage ? new Request(req.url, { cache: 'no-cache' }) : req)
      .then(r => {
        if (r && r.ok && r.type === 'basic') { const cp = r.clone(); caches.open(C).then(c => c.put(isPage ? './' : req, cp)).catch(() => {}); }
        return r;
      })
      .catch(() => caches.match(isPage ? './' : req).then(m => m || (isPage ? caches.match('./') : Response.error())))
  );
});

// powiadomienie o przypomnieniu (2.5): kliknięcie otwiera albo przywraca kartę Wokandy
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => new URL(x.url).origin === self.location.origin);
    return c ? c.focus() : self.clients.openWindow('./');
  }));
});
