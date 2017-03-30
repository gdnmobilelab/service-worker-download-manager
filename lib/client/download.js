var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import EventTarget from 'eventtarget';
import urlResolve from 'url-resolve-no-dependencies';
var Download = (function (_super) {
    __extends(Download, _super);
    function Download(requestURL) {
        var _this = _super.call(this) || this;
        _this.started = false;
        _this.downloaded = 0;
        _this.requestURL = requestURL;
        _this.absoluteURL = urlResolve(window.location.href, requestURL);
        _this.length = new Promise(function (fulfill, reject) {
            _this.addEventListener('totalLengthFound', function (e) {
                if (!e.length) {
                    reject(new Error("No length was given"));
                }
                fulfill(e.length);
            });
        });
        _this.complete = new Promise(function (fulfill) {
            _this.addEventListener('complete', function (e) {
                fulfill(_this);
            });
        });
        return _this;
    }
    return Download;
}(EventTarget));
export { Download };
