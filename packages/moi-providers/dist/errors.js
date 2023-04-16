"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidConnection = exports.ConnectionNotOpenError = void 0;
const connectionError = (msg, event) => {
    const error = new Error(msg);
    if (event) {
        error.code = event.code;
        error.reason = event.reason;
    }
    return error;
};
const ConnectionNotOpenError = (event) => {
    return connectionError('connection not open on send()', event);
};
exports.ConnectionNotOpenError = ConnectionNotOpenError;
const InvalidConnection = (host, event) => {
    return connectionError('CONNECTION ERROR: Couldn\'t connect to node ' + host + '.', event);
};
exports.InvalidConnection = InvalidConnection;
