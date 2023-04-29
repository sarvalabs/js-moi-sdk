"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unmarshal = exports.marshal = void 0;
const marshal = (data) => {
    const jsonString = JSON.stringify(data);
    return new TextEncoder().encode(jsonString);
};
exports.marshal = marshal;
const unmarshal = (bytes) => {
    try {
        const jsonString = new TextDecoder().decode(bytes);
        return JSON.parse(jsonString);
    }
    catch (error) {
        throw new Error('Error deserializing data:', error);
    }
};
exports.unmarshal = unmarshal;
