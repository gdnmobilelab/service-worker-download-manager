import EventTarget from 'eventtarget';
import urlResolve from 'url-resolve-no-dependencies';
export class Download extends EventTarget {
    constructor(requestURL) {
        super();
        this.started = false;
        this.downloaded = 0;
        this.requestURL = requestURL;
        this.absoluteURL = urlResolve(window.location.href, requestURL);
        this.length = new Promise((fulfill, reject) => {
            this.addEventListener('totalLengthFound', (e) => {
                if (!e.length) {
                    reject(new Error("No length was given"));
                }
                fulfill(e.length);
            });
        });
        this.complete = new Promise((fulfill) => {
            this.addEventListener('complete', (e) => {
                fulfill(this);
            });
        });
    }
}
