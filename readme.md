# Service Worker Download Manager

## What is it?

Service workers can cache content via the `cache.add` function. But it's a promise that resolves when the add is complete, and there's no way to measure the progress of he download. We're experimenting with selectively caching content via workers, and we want to show users the progress of those downloads. Enter the download manager.

It is a JS library with two parts - client and worker. The client side sends a message to the worker with a list of files to download, along with a `MessagePort`. The worker side downloads these files, sending regularly updates back through the port to the client. This all happens transparently, with event handlers on the client side for easier tracking of these events.

## How to use it

### Service Worker

First, you need to add a download manager to your worker. Like so:

    import { DownloadManager } from 'service-worker-download-manager';

    let dl = new DownloadManager();

That's it - it adds its own listener to the `message` event to listen for requests sent by the client library. You can also hook it into the `fetch` event to allow the client to access a response while it is being downloaded - if you don't add this then the client might send a request at the same time as the worker request is downloading. Use it like so:

    self.addEventListener('fetch', function(e) {
        e.respondWith(
            dl.match(e.request.url)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(e.request); // or caches.match etc
            })

        )
    })

### Client

On the client-side, send a download request like so:

    import { DownloadRequest } from 'service-worker-download-manager';

    let download = new DownloadRequest('cache-name', [
        '/file1.mp3',
        '/file2.mp3'
    ]);

This will download the files, sequentially, then add them to the `ServiceWorkerCache` indicated in the first argument.

`DownloadRequest` has a `requests` property with:

 - `length` promise: it resolves when the download length is known. We send a `HEAD` request before starting all dowloads so that we know the total size as early as possible
 - `complete` promise: that resolves when the download is complete and added to the cache. Note that you can't read the response with this library as it's intended for large files you won't load into memory. Use `cache.match()` in your worker to send the responses directly into an `<audio>` or `<video>` tag etc.
 - `progress` event: this can be listened to via `download.addEventListener`, and contains the following properties:
   - `length`: the total length of the file
   - `downloaded`: the amount downloaded so far

(there is also a `complete` event that mirrors the complete promise, should you wish to use that).

There are *also*  `complete` and `length` promises on `DownloadRequest` itself that will resolve when all downloads are complete.

## Testing

After running `npm install`, run:

`npm run build-test`

wait for that to run, and then go to `http://localhost:4000` in a service worker capable browser to run the (small) test suite.