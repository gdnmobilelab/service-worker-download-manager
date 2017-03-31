export class ServiceWorkerDownload {
    constructor(absoluteURL, communicationPort, targetCache) {
        this.url = absoluteURL;
        this.communicationPort = communicationPort;
        this.targetCache = targetCache;
    }
    start() {
        return this.checkForCachedCopy()
            .catch((res) => fetch(this.url))
            .then((res) => {
            // Seems wasteful to make another clone, but it seems we need to,
            // in order to serve any fetch requests we receive while we are
            // downloading
            this.responseForMatchQuery = res.clone();
            if (!this.length) {
                this.setLengthfromResponse(res);
            }
            this.reportProgressFromResponse(res);
            return this.targetCache.put(this.url, res);
        })
            .then(() => {
            this.emitEvent({
                absoluteURL: this.url,
                type: "complete",
                length: this.length,
                downloaded: this.length
            });
        });
    }
    reportProgressFromResponse(resp) {
        // we make a clone so we don't lock the body
        let rdr = resp.clone().body.getReader();
        let currentLength = 0;
        let report = () => {
            return rdr.read()
                .then((result) => {
                if (result.done) {
                    // complete event fires once added to the cache
                    return;
                }
                currentLength += result.value.length;
                this.emitEvent({
                    absoluteURL: this.url,
                    length: this.length,
                    type: "progress",
                    downloaded: currentLength
                });
                return report();
            });
        };
        report();
    }
    getLengthFromHEADRequest() {
        return this.checkForCachedCopy()
            .catch(() => {
            return fetch(this.url, {
                method: 'HEAD'
            });
        })
            .then((res) => {
            this.setLengthfromResponse(res);
        });
    }
    checkForCachedCopy() {
        return this.targetCache.match(this.url)
            .then((match) => {
            if (!match) {
                throw new Error("no cached copy");
            }
            return match;
        });
    }
    emitEvent(ev) {
        this.communicationPort.postMessage(ev);
    }
    setLengthfromResponse(response) {
        let lengthHeader = response.headers.get('content-length');
        if (!lengthHeader) {
            console.warn("Response did not return a content-length header");
        }
        this.length = parseInt(lengthHeader);
        this.emitEvent({
            absoluteURL: this.url,
            type: "totalLengthFound",
            length: this.length,
            downloaded: 0
        });
    }
}
