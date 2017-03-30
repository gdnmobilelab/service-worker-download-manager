import { Download } from './client/download';
export declare class DownloadRequest {
    private messagePort?;
    private targetCacheName;
    requests: Download[];
    constructor(cacheName: string, files: string[]);
    private sendDownloadRequest(controller);
    private receiveEvent(e);
    readonly complete: any;
    readonly length: any;
}
