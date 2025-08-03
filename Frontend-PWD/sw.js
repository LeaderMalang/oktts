const CACHE_VERSION = 'v1';
const CACHE_NAME = `pharma-erp-cache-${CACHE_VERSION}`;
const CDN_CACHE = `pharma-erp-cdn-${CACHE_VERSION}`;
const ASSET_MANIFEST_URL = '/asset-manifest.json';
const CORE_ASSETS = ['/', '/index.html'];
const CDN_ORIGINS = [
  'https://cdn.tailwindcss.com',
  'https://esm.sh'
];

// --- Caching Strategy ---

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        const manifestResp = await fetch(ASSET_MANIFEST_URL, { cache: 'no-store' });
        const manifest = await manifestResp.json();
        const assets = Object.values(manifest).flatMap(entry => {
          const files = [`/${entry.file}`];
          if (entry.css) files.push(...entry.css.map(f => `/${f}`));
          if (entry.assets) files.push(...entry.assets.map(f => `/${f}`));
          return files;
        });
        await cache.addAll([...CORE_ASSETS, ...assets]);
      } catch (err) {
        console.error('Asset precache failed', err);
        await cache.addAll(CORE_ASSETS);
      }
    })
  );
});

self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }
    const url = new URL(event.request.url);
    if (CDN_ORIGINS.some(origin => url.href.startsWith(origin))) {
      event.respondWith(
        caches.open(CDN_CACHE).then(cache =>
          cache.match(event.request).then(resp => {
            const fetchPromise = fetch(event.request).then(networkResp => {
              if (networkResp && networkResp.status === 200) {
                cache.put(event.request, networkResp.clone());
              }
              return networkResp;
            });
            return resp || fetchPromise;
          })
        )
      );
      return;
    }
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response; // Serve from cache
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, CDN_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// --- Background Sync Logic ---

const DB_NAME_SW = 'PharmaERP-DB';
const DB_VERSION_SW = 1;
const STORE_NAME_SW = 'sync-queue';

function openDBSW() {
    return new Promise((resolve, reject) => {
        const request = self.indexedDB.open(DB_NAME_SW, DB_VERSION_SW);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME_SW)) {
                db.createObjectStore(STORE_NAME_SW, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

async function syncData() {
    console.log('Service Worker: Sync event triggered');
    const db = await openDBSW();
    const transaction = db.transaction(STORE_NAME_SW, 'readwrite');
    const store = transaction.objectStore(STORE_NAME_SW);
    const queuedItems = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

    if (!queuedItems || queuedItems.length === 0) {
        console.log('Service Worker: No items to sync.');
        return;
    }

    console.log('Service Worker: Syncing items:', queuedItems);

    for (const item of queuedItems) {
        try {
            const response = await fetch(item.endpoint, {
                method: item.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.payload),
            });

            if (response.ok) {
                console.log(`Service Worker: Successfully synced item ${item.id}`);
                const deleteTx = db.transaction(STORE_NAME_SW, 'readwrite');
                await new Promise((resolve, reject) => {
                    const req = deleteTx.objectStore(STORE_NAME_SW).delete(item.id);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                });
            } else {
                console.error(`Service Worker: Failed to sync item ${item.id}. Server responded with ${response.status}`);
            }
        } catch (error) {
            console.error(`Service Worker: Network error during sync for item ${item.id}. Will retry later.`, error);
            return; // Exit and retry on next sync event
        }
    }
    console.log('Service Worker: Sync completed.');
}

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncData());
    }
});
