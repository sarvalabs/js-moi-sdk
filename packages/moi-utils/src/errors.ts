import { VERSION } from  "./constants";
import { UnKnown } from  "./errorCodes";

function throwError(message: string, code?: string, params?: any): void {
    if (!code) {
        code = UnKnown.name;
    }
    if (!params) {
        params = {};
    }
    let messageDetails = [];
    Object.keys(params).map(key => {
        try {
            messageDetails.push(key + '=' + JSON.stringify(params[key]));
        } catch (error) {
            messageDetails.push(key + '=' + JSON.stringify(params[key].toString()));
        }
    });
    messageDetails.push("version=" + VERSION);

    let errorMessageStack = ""
    if (messageDetails.length) {
        errorMessageStack += ' (' + messageDetails.join(', ') + ')';
    }

    let error = new Error();
    error.name = code;
    error.message = message;
    error.stack = errorMessageStack;
    throw error;
}

export default throwError 