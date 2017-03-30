import { DownloadRequest } from '../../../src/client';
import assert from 'assert';

export default function () {
    describe("Progress Events", function () {
        it("should fire progress events", function () {

            let testDownload = new DownloadRequest('test-cache', [
                './test-file?size=30',
            ]);

            let downloadedLengths = [];

            testDownload.requests[0].addEventListener('progress', (e) => {
                downloadedLengths.push(e.downloaded);
            })

            return testDownload.requests[0].complete.then(() => {
                assert.equal(downloadedLengths[0], 10);
                assert.equal(downloadedLengths[1], 20);
                assert.equal(downloadedLengths[2], 30);
            })
        });

        it("should fire multiple progress events", function () {

            let testDownload = new DownloadRequest('test-cache', [
                './test-file?size=10',
                './test-file?size=20'
            ]);

            let downloadedLengths = [];

            testDownload.requests.forEach((req) => {
                req.addEventListener('progress', (e) => {
                    downloadedLengths.push(e.downloaded);
                })
            })

            return Promise.all(testDownload.requests.map((r) => r.complete))
                .then(() => {
                    assert.equal(downloadedLengths[0], 10);
                    assert.equal(downloadedLengths[1], 10);
                    assert.equal(downloadedLengths[2], 20);
                })
        })

        it("should return immediately when item is already cached", function () {
            return new DownloadRequest('test-cache', [
                './test-file?size=20'
            ])
                .complete.then(() => {

                    // Progress event should NOT fire because it returns immediately

                    let secondRequest = new DownloadRequest('test-cache', [
                        './test-file?size=20'
                    ]);

                    let progressFired = 0;

                    secondRequest.requests[0].addEventListener('progress', () => {
                        progressFired++;
                    })

                    return secondRequest.complete
                        .then(() => {
                            assert.equal(progressFired, 1);
                        })
                })
        })
    })
}
