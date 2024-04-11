/**
 * Creates a deep copy of an object.
 *
 * @param obj The object to be deep copied.
 * @returns A deep copy of the input object.
 */
export const deepCopy = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item));
    }
    const newObj = {};
    for (const key in obj) {
        newObj[key] = deepCopy(obj[key]);
    }
    return newObj;
};
//# sourceMappingURL=object.js.map