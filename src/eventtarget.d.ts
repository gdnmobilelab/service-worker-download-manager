declare module "eventtarget" {

    class EventTarget {
        addEventListener(name: string, func: Function);
        removeEventListener(name: string, func: Function);
        dispatchEvent(data: any);
    }

    export default EventTarget;
}