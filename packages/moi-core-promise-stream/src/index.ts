import EventEmitter from "eventemitter3";

export default class PromiseStream {
    public resolve: any;
    public reject: any;
    public eventStream: any;
    constructor(withStream: boolean) {
        let resolve: Function, reject: Function;
        const promise: any = new Promise((...args: Function[]) => {
            resolve = args[0];
            reject = args[1];
        });

        if (!withStream) {
            this.resolve = resolve;
            this.reject = reject;
            this.eventStream = promise;
        } else {
            const emitter = new EventEmitter();
            Object.assign(promise, emitter)
            promise.eventNames = emitter.eventNames;
            promise.emit = emitter.emit.bind(emitter);
            promise.on = emitter.on.bind(emitter);
            promise.once = emitter.once;
            promise.off = emitter.off;
            promise.listeners = emitter.listeners;
            promise.addListener = emitter.addListener;
            promise.removeListener = emitter.removeListener;
            promise.removeAllListeners = emitter.removeAllListeners;

            this.resolve = resolve;
            this.reject = reject;
            this.eventStream = promise;
        }
    }

    public static resolve(value: any) {
        const promise = new PromiseStream(true);
        promise.resolve(value);
        return promise.eventStream;
    }
}