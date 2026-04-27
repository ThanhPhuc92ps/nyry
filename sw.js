const cacheName = 'gia-hang-v3';
const assets = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// Xoá cache cũ khi có version mới
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== cacheName).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
  self.skipWaiting(); // Kích hoạt SW mới ngay lập tức
});

// Network-first: luôn thử lấy bản mới, chỉ dùng cache khi mất mạng
self.addEventListener('fetch', e => {
  // Không cache các API call lên JSONBin
  if (e.request.url.includes('jsonbin.io')) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(cacheName).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
