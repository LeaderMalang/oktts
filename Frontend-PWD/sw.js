
import { defineConfig, loadEnv } from 'vite';
const CACHE_NAME = 'pharma-erp-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.svg',
    'https://cdn.tailwindcss.com'

];

// --- Caching Strategy ---

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            try {
                const env = loadEnv(mode, '.', '');
                const manifestResp = await fetch(env.ASSET_MANIFEST_URL, { cache: 'no-store' });
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
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }


    const requestURL = new URL(event.request.url);

    // Cache-first strategy for built assets
    if (requestURL.origin === self.location.origin && requestURL.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(fetchResponse => {
                    if (fetchResponse && fetchResponse.status === 200) {
                        const responseClone = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                    }
                    return fetchResponse;
                });
            })
        );
        return;
    }

    // Generic cache-first strategy
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request).then(fetchResponse => {
                if (fetchResponse && fetchResponse.status === 200 && (fetchResponse.type === 'basic' || fetchResponse.type === 'cors')) {
                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                }
                return fetchResponse;
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
