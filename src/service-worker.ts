import { ServiceWorkerDownload } from './service-worker/download';
import { DownloadEvent } from './download-event';

export class DownloadManager {

    pendingDownloads: Set<ServiceWorkerDownload>;

    constructor() {
        this.pendingDownloads = new Set<ServiceWorkerDownload>();
        console.info("Registering download manager message listener...")
        self.addEventListener('message', this.checkForDownloadRequest.bind(this));
    }

    match(request: Request) {
        let match = Array.from(this.pendingDownloads).find((d) => d.url === request.url);
        return Promise.resolve(match ? match.responseForMatchQuery.clone() : null);
    }

    checkForDownloadRequest(e: MessageEvent) {
        if (e.data.operation !== 'download-request') {
            return;
        }

        let files: string[] = e.data.files;
        let cacheName: string = e.data.cacheName;
        let communicationPort = e.ports[0];

        caches.open(cacheName)
            .then((targetCache) => {

                let toDownloads = files.map((f) => new ServiceWorkerDownload(f, communicationPort, targetCache))

                // store our pending downloads so the fetch handler can get them
                toDownloads.forEach((d) => this.pendingDownloads.add(d));

                let lengthChecks = toDownloads.map((d, idx) => {

                    // We want to get the length of each download instantly
                    // so the client can show it in the UI. However, the first
                    // download will start immediately, so no need to do an extra
                    // HEAD request when the GET is about to fire anyway.

                    if (idx > 0) {
                        return d.getLengthFromHEADRequest();
                    } else {
                        return Promise.resolve();
                    }
                })

                // We run all our length checks first, so we get that info
                // before we start the first full download.
                return Promise.all(lengthChecks)
                    .then(() => {
                        let gotoNextDownload = (idx) => {
                            if (!toDownloads[idx]) {
                                return true;
                            }
                            return toDownloads[idx].start()
                                .then(() => {
                                    this.pendingDownloads.delete(toDownloads[idx]);
                                    gotoNextDownload(idx + 1)
                                })

                        }

                        return gotoNextDownload(0);
                    })



            })



    }
}
