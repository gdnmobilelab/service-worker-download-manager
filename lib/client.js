import { Download } from './client/download';
var DownloadRequest = (function () {
    function DownloadRequest(cacheName, files) {
        var _this = this;
        this.requests = [];
        this.targetCacheName = cacheName;
        this.requests = files.map(function (f) { return new Download(f); });
        if (navigator.serviceWorker.controller) {
            this.sendDownloadRequest(navigator.serviceWorker.controller);
        }
        else {
            console.warn("Service worker not ready when download request initiated. Waiting for ready...");
            navigator.serviceWorker.ready.then(function (reg) {
                _this.sendDownloadRequest(reg.active);
            });
        }
    }
    DownloadRequest.prototype.sendDownloadRequest = function (controller) {
        var channel = new MessageChannel();
        this.messagePort = channel.port2;
        this.messagePort.onmessage = this.receiveEvent.bind(this);
        controller.postMessage({
            operation: 'download-request',
            files: this.requests.map(function (r) { return r.absoluteURL; })
        }, [channel.port1]);
    };
    DownloadRequest.prototype.receiveEvent = function (e) {
        var ev = e.data;
        var req = this.requests.find(function (r) { return r.absoluteURL === ev.absoluteURL; });
        req.dispatchEvent(ev);
    };
    Object.defineProperty(DownloadRequest.prototype, "complete", {
        get: function () {
            return Promise.all(this.requests.map(function (r) { return r.complete; }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DownloadRequest.prototype, "length", {
        get: function () {
            return Promise.all(this.requests.map(function (r) { return r.length; }));
        },
        enumerable: true,
        configurable: true
    });
    return DownloadRequest;
}());
export { DownloadRequest };
