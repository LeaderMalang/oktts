import { SyncQueueItem } from '../types';

const DB_NAME = 'PharmaERP-DB';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';

let db: IDBDatabase;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };

        request.onsuccess = (event) => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add({ ...item, timestamp: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function registerSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const swRegistration = await navigator.serviceWorker.ready;
            await (swRegistration as any).sync.register('sync-forms');
            console.log('Background sync registered');
            alert('Data saved locally. It will be synced with the server when you are online.');
        } catch (error) {
            console.error('Background sync registration failed:', error);
            alert('Failed to schedule data sync. Please try again when you are online.');
        }
    } else {
        alert('Your browser does not support offline capabilities. Data could not be saved.');
        console.warn('Background sync not supported.');
    }
}