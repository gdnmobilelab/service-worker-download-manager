export declare class ServiceWorkerDownload {
    url: string;
    length?: number;
    private communicationPort;
    private targetCache;
    responseForMatchQuery?: Response;
    constructor(absoluteURL: string, communicationPort: MessagePort, targetCache: Cache);
    start(): Promise<void>;
    private reportProgressFromResponse(resp);
    getLengthFromHEADRequest(): Promise<void>;
    private checkForCachedCopy();
    private emitEvent(ev);
    private setLengthfromResponse(response);
}
