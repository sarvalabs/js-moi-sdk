
const connectionError = (msg, event) => {
    const error: any = new Error(msg);
    if (event) {
        error.code = event.code;
        error.reason = event.reason;
    }

    return error;
}

export const ConnectionNotOpenError = (event?: any): Error => {
    return connectionError('connection not open on send()', event);
}

export const InvalidConnection = (host, event): Error => {
    return connectionError('CONNECTION ERROR: Couldn\'t connect to node '+ host +'.', event);
}