import { DownloadRequest } from '../../../src/client';
import { DownloadEvent } from '../../../src/download-event'
import assert from 'assert';

export default function () {
    describe("Fetch", function () {
        it("should return pending download in a fetch", function () {

            let testDownload = new DownloadRequest('test-cache', [
                './test-file?size=50',
            ]);

            // Tricky to test this one, but we keep track of the download of our 
            // client copy - it should match that of the SW (and not be 30 behind)

            let clientVersionLength = 0;
            let lengthMatched = false;

            testDownload.requests[0].addEventListener('progress', (e: DownloadEvent) => {
                if (e.downloaded === 30) {
                    fetch('./test-file?size=50')
                        .then((res) => {
                            let reader = res.body.getReader();

                            function read() {
                                reader.read()
                                    .then((r) => {
                                        if (r.value) {
                                            clientVersionLength += r.value.length;
                                            return read()
                                        }

                                    })
                            }
                            read()

                        })
                }
                if (e.downloaded === 40) {
                    // Gross, but *sometimes* this fires before the client, sometimes after.
                    lengthMatched = clientVersionLength === 40 || clientVersionLength === 30;
                }
            })

            return testDownload.requests[0].complete
                .then(() => {
                    assert.ok(lengthMatched)
                })
        });


    })
}
