var ServiceWorkerDownload = (function () {
    function ServiceWorkerDownload(absoluteURL, communicationPort, targetCache) {
        this.url = absoluteURL;
        this.communicationPort = communicationPort;
        this.targetCache = targetCache;
    }
    ServiceWorkerDownload.prototype.start = function () {
        var _this = this;
        return this.checkForCachedCopy()["catch"](function (res) { return fetch(_this.url); })
            .then(function (res) {
            // Seems wasteful to make another clone, but it seems we need to,
            // in order to serve any fetch requests we receive while we are
            // downloading
            _this.responseForMatchQuery = res.clone();
            if (!_this.length) {
                _this.setLengthfromResponse(res);
            }
            _this.reportProgressFromResponse(res);
            return _this.targetCache.put(_this.url, res);
        })
            .then(function () {
            _this.emitEvent({
                absoluteURL: _this.url,
                type: "complete",
                length: _this.length,
                downloaded: _this.length
            });
        });
    };
    ServiceWorkerDownload.prototype.reportProgressFromResponse = function (resp) {
        var _this = this;
        // we make a clone so we don't lock the body
        var rdr = resp.clone().body.getReader();
        var currentLength = 0;
        var report = function () {
            return rdr.read()
                .then(function (result) {
                if (result.done) {
                    // complete event fires once added to the cache
                    return;
                }
                currentLength += result.value.length;
                _this.emitEvent({
                    absoluteURL: _this.url,
                    length: _this.length,
                    type: "progress",
                    downloaded: currentLength
                });
                return report();
            });
        };
        report();
    };
    ServiceWorkerDownload.prototype.getLengthFromHEADRequest = function () {
        var _this = this;
        return this.checkForCachedCopy()["catch"](function () {
            return fetch(_this.url, {
                method: 'HEAD'
            });
        })
            .then(function (res) {
            _this.setLengthfromResponse(res);
        });
    };
    ServiceWorkerDownload.prototype.checkForCachedCopy = function () {
        return this.targetCache.match(this.url)
            .then(function (match) {
            if (!match) {
                throw new Error("no cached copy");
            }
            return match;
        });
    };
    ServiceWorkerDownload.prototype.emitEvent = function (ev) {
        this.communicationPort.postMessage(ev);
    };
    ServiceWorkerDownload.prototype.setLengthfromResponse = function (response) {
        var lengthHeader = response.headers.get('content-length');
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
        // t: DownloadEvent = {
        //     URL: this.url,
        //     wnloadEventType.totalLengthFound
        // ommunicationPort.postMessage(
    };
    return ServiceWorkerDownload;
}());
export { ServiceWorkerDownload };
