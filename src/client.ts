import { Download } from './client/download';
import { DownloadEvent } from './download-event';

export class DownloadRequest {

    private messagePort?: MessagePort;

    private targetCacheName: string;

    requests: Download[] = [];

    constructor(cacheName: string, files: string[]) {

        this.targetCacheName = cacheName;
        this.requests = files.map((f) => new Download(f));

        if (navigator.serviceWorker.controller) {
            this.sendDownloadRequest(navigator.serviceWorker.controller);
        } else {
            console.warn("Service worker not ready when download request initiated. Waiting for ready...");
            navigator.serviceWorker.ready.then((reg) => {
                this.sendDownloadRequest(reg.active!);
            })
        }

    }

    private sendDownloadRequest(controller: ServiceWorker) {

        let channel = new MessageChannel();

        this.messagePort = channel.port2;

        this.messagePort.onmessage = this.receiveEvent.bind(this);

        controller.postMessage({
            operation: 'download-request',
            files: this.requests.map((r) => r.absoluteURL),
        }, [channel.port1]);

    }

    private receiveEvent(e: MessageEvent) {
        let ev = e.data as DownloadEvent;

        let req = this.requests.find((r) => r.absoluteURL === ev.absoluteURL);
        req.dispatchEvent(ev);
    }

    get complete() {
        return Promise.all(this.requests.map((r) => r.complete));
    }

    get length() {
        return Promise.all(this.requests.map((r) => r.length));
    }

}