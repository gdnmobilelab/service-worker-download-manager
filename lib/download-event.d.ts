export declare type DownloadEventType = 'totalLengthFound' | 'progress' | 'complete';
export interface DownloadEvent {
    absoluteURL: string;
    type: DownloadEventType;
    length?: number;
    downloaded: number;
}
