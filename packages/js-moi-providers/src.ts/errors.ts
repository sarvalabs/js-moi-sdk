import { defineReadOnly } from "@zenz-solutions/js-moi-utils";

const connectionError = (msg: string, event: any) => {
    try {
        const error: Error = new Error(msg);
        if (event) {
            defineReadOnly(<any>error, "code", event.code || null);
            defineReadOnly(<any>error, "response", event.reason);
        }
    
        return error;
    } catch(err) {
        throw err
    }
}

export const ConnectionNotOpenError = (event?: any): Error => {
    return connectionError('connection not open on send()', event);
}

export const InvalidConnection = (host: string, event: any): Error => {
    return connectionError('CONNECTION ERROR: Couldn\'t connect to node '+ host +'.', event);
}

export const MaxAttemptsReachedOnReconnectingError = (): Error => {
    return new Error('Maximum number of reconnect attempts reached!');
}

export const PendingRequestsOnReconnectingError = (): Error => {
    return new Error('CONNECTION ERROR: Provider started to reconnect before the response got received!');
}
