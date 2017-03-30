import { DownloadRequest } from '../../../src/client';
import assert from 'assert';

export default function () {
    describe("Total length", function () {
        it("should fire for both first and second requests", function () {

            let testDownload = new DownloadRequest('test-cache', [
                './test-file?size=1',
                './test-file?size=10'
            ]);

            return Promise.all(testDownload.requests.map((r) => r.length))
                .then((lengths) => {
                    assert.equal(lengths[0], 1);
                    assert.equal(lengths[1], 10);
                })


        })
    })
}
