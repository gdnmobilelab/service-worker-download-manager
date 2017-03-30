import EventTarget from 'eventtarget';
import urlResolve from 'url-resolve-no-dependencies';
import { DownloadEvent } from '../download-event'

export class Download extends EventTarget {
    requestURL: string;
    absoluteURL: string;
    started = false;
    downloaded = 0;
    total?: number;

    length: Promise<number>;
    complete: Promise<Download>;

    constructor(requestURL: string) {
        super();
        this.requestURL = requestURL;
        this.absoluteURL = urlResolve(window.location.href, requestURL);

        this.length = new Promise((fulfill, reject) => {
            this.addEventListener('totalLengthFound', (e: DownloadEvent) => {
                if (!e.length) {
                    reject(new Error("No length was given"));
                }
                fulfill(e.length!);
            })
        });

        this.complete = new Promise((fulfill) => {
            this.addEventListener('complete', (e: DownloadEvent) => {
                fulfill(this);
            })
        })
    }
}