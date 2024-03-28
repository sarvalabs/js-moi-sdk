/**
 * Defines a read-only property on an object with the specified name and value.
 *
 * @param {object} object - The object on which to define the property.
 * @param {string | symbol} name - The name of the property.
 * @param {any} value - The value of the property.
 */
export const defineReadOnly = (object, name, value) => {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
};
//# sourceMappingURL=properties.js.map