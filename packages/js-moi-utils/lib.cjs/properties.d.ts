/**
 * Defines a read-only property on an object with the specified name and value.
 *
 * @param {object} object - The object on which to define the property.
 * @param {string | symbol} name - The name of the property.
 * @param {any} value - The value of the property.
 */
export declare const defineReadOnly: <T, K extends keyof T>(object: T, name: K, value: T[K]) => void;
//# sourceMappingURL=properties.d.ts.map