import EventTarget from 'eventtarget';
export declare class Download extends EventTarget {
    requestURL: string;
    absoluteURL: string;
    started: boolean;
    downloaded: number;
    total?: number;
    length: Promise<number>;
    complete: Promise<Download>;
    constructor(requestURL: string);
}
