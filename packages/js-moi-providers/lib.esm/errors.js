import { defineReadOnly } from "@zenz-solutions/js-moi-utils";
const connectionError = (msg, event) => {
    try {
        const error = new Error(msg);
        if (event) {
            defineReadOnly(error, "code", event.code || null);
            defineReadOnly(error, "response", event.reason);
        }
        return error;
    }
    catch (err) {
        throw err;
    }
};
export const ConnectionNotOpenError = (event) => {
    return connectionError('connection not open on send()', event);
};
export const InvalidConnection = (host, event) => {
    return connectionError('CONNECTION ERROR: Couldn\'t connect to node ' + host + '.', event);
};
export const MaxAttemptsReachedOnReconnectingError = () => {
    return new Error('Maximum number of reconnect attempts reached!');
};
export const PendingRequestsOnReconnectingError = () => {
    return new Error('CONNECTION ERROR: Provider started to reconnect before the response got received!');
};
//# sourceMappingURL=errors.js.map