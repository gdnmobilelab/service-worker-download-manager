///<reference types="service_worker_api"/>

import { DownloadManager } from '../../src/service-worker';

let dl = new DownloadManager();

self.addEventListener('fetch', (e: FetchEvent) => {
    e.respondWith(
        dl.match(e.request)
            .then((res) => {
                if (res) {
                    return res;
                }
                return fetch(e.request);
            })

    )
})

self.addEventListener('install', function () {
    self.skipWaiting();
});

self.addEventListener('activate', function () {
    self.clients.claim();
})

self.addEventListener('message', (e) => {
    if (e.data.operation !== 'clear-caches') {
        return;
    }

    caches.keys()
        .then((keys) => {
            return Promise.all(keys.map((k) => caches.delete(k)))
        })
        .then(() => {
            e.ports[0].postMessage("done")
        })
})