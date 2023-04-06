export function ErrPrivateGet() {
    throw new TypeError("attempted to get private field on non-instance");
}
export function ErrPrivateSet() {
    throw new TypeError("attempted to set private field on non-instance");
}
