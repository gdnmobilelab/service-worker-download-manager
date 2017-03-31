import { ServiceWorkerDownload } from './service-worker/download';
export declare class DownloadManager {
    pendingDownloads: Set<ServiceWorkerDownload>;
    constructor();
    match(request: Request): Promise<Response | null>;
    checkForDownloadRequest(e: MessageEvent): void;
}
