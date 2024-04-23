/**
 * Creates a deep copy of an object.
 * 
 * @param obj The object to be deep copied.
 * @returns A deep copy of the input object.
 */
export const deepCopy = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item)) as unknown as T;
    }

    const newObj = {} as T;
    for (const key in obj) {
        newObj[key] = deepCopy(obj[key])
    }
    return newObj;
};
