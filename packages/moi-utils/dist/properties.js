"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineReadOnly = void 0;
const defineReadOnly = (object, name, value) => {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
};
exports.defineReadOnly = defineReadOnly;
