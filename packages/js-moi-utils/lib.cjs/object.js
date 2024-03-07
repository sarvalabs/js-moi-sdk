"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopy = void 0;
/**
 * Creates a deep copy of an object.
 *
 * @param obj The object to be deep copied.
 * @returns A deep copy of the input object.
 */
const deepCopy = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => (0, exports.deepCopy)(item));
    }
    const newObj = {};
    for (const key in obj) {
        newObj[key] = (0, exports.deepCopy)(obj[key]);
    }
    return newObj;
};
exports.deepCopy = deepCopy;
//# sourceMappingURL=object.js.map