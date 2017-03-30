import { ServiceWorkerDownload } from './service-worker/download';
var DownloadManager = (function () {
    function DownloadManager() {
        this.pendingDownloads = new Set();
        console.info("Registering download manager message listener...");
        self.addEventListener('message', this.checkForDownloadRequest.bind(this));
    }
    DownloadManager.prototype.match = function (request) {
        var match = Array.from(this.pendingDownloads).find(function (d) { return d.url === request.url; });
        return Promise.resolve(match ? match.responseForMatchQuery.clone() : null);
    };
    DownloadManager.prototype.checkForDownloadRequest = function (e) {
        var _this = this;
        if (e.data.operation !== 'download-request') {
            return;
        }
        var files = e.data.files;
        var cacheName = e.data.cacheName;
        var communicationPort = e.ports[0];
        caches.open(cacheName)
            .then(function (targetCache) {
            var toDownloads = files.map(function (f) { return new ServiceWorkerDownload(f, communicationPort, targetCache); });
            // store our pending downloads so the fetch handler can get them
            toDownloads.forEach(function (d) { return _this.pendingDownloads.add(d); });
            var lengthChecks = toDownloads.map(function (d, idx) {
                // We want to get the length of each download instantly
                // so the client can show it in the UI. However, the first
                // download will start immediately, so no need to do an extra
                // HEAD request when the GET is about to fire anyway.
                if (idx > 0) {
                    return d.getLengthFromHEADRequest();
                }
                else {
                    return Promise.resolve();
                }
            });
            // We run all our length checks first, so we get that info
            // before we start the first full download.
            return Promise.all(lengthChecks)
                .then(function () {
                var gotoNextDownload = function (idx) {
                    if (!toDownloads[idx]) {
                        return true;
                    }
                    return toDownloads[idx].start()
                        .then(function () {
                        _this.pendingDownloads["delete"](toDownloads[idx]);
                        gotoNextDownload(idx + 1);
                    });
                };
                return gotoNextDownload(0);
            });
        });
    };
    return DownloadManager;
}());
export { DownloadManager };
