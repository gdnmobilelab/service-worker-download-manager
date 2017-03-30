import { DownloadRequest } from '../../../src/client';
import assert from 'assert';

export default function () {
    describe("Complete", function () {
        it("should fire complete promise", function () {

            let testDownload = new DownloadRequest('test-cache', [
                './test-file?size=10',
            ]);

            return Promise.all(testDownload.requests.map((r) => r.complete))
        });

        it("should fire multiple complete promises", function () {

            let testDownload = new DownloadRequest('test-cache', [
                './test-file?size=10',
                './test-file?size=20'
            ]);

            return Promise.all(testDownload.requests.map((r) => r.complete))
        })


    })
}
