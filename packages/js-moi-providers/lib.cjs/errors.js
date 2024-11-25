"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingRequestsOnReconnectingError = exports.MaxAttemptsReachedOnReconnectingError = exports.InvalidConnection = exports.ConnectionNotOpenError = void 0;
const js_moi_utils_1 = require("@zenz-solutions/js-moi-utils");
const connectionError = (msg, event) => {
    try {
        const error = new Error(msg);
        if (event) {
            (0, js_moi_utils_1.defineReadOnly)(error, "code", event.code || null);
            (0, js_moi_utils_1.defineReadOnly)(error, "response", event.reason);
        }
        return error;
    }
    catch (err) {
        throw err;
    }
};
const ConnectionNotOpenError = (event) => {
    return connectionError('connection not open on send()', event);
};
exports.ConnectionNotOpenError = ConnectionNotOpenError;
const InvalidConnection = (host, event) => {
    return connectionError('CONNECTION ERROR: Couldn\'t connect to node ' + host + '.', event);
};
exports.InvalidConnection = InvalidConnection;
const MaxAttemptsReachedOnReconnectingError = () => {
    return new Error('Maximum number of reconnect attempts reached!');
};
exports.MaxAttemptsReachedOnReconnectingError = MaxAttemptsReachedOnReconnectingError;
const PendingRequestsOnReconnectingError = () => {
    return new Error('CONNECTION ERROR: Provider started to reconnect before the response got received!');
};
exports.PendingRequestsOnReconnectingError = PendingRequestsOnReconnectingError;
//# sourceMappingURL=errors.js.map