"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrPrivateSet = exports.ErrPrivateGet = void 0;
function ErrPrivateGet() {
    throw new TypeError("attempted to get private field on non-instance");
}
exports.ErrPrivateGet = ErrPrivateGet;
function ErrPrivateSet() {
    throw new TypeError("attempted to set private field on non-instance");
}
exports.ErrPrivateSet = ErrPrivateSet;
//# sourceMappingURL=errors.js.map