import EventTarget from 'eventtarget';
export declare class Download extends EventTarget {
    requestURL: string;
    absoluteURL: string;
    complete: boolean;
    started: boolean;
    downloaded: number;
    total?: number;
    constructor(requestURL: string);
}
