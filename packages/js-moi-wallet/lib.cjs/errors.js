"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrPrivateGet = ErrPrivateGet;
exports.ErrPrivateSet = ErrPrivateSet;
function ErrPrivateGet() {
    throw new TypeError("attempted to get private field on non-instance");
}
function ErrPrivateSet() {
    throw new TypeError("attempted to set private field on non-instance");
}
//# sourceMappingURL=errors.js.map