import _hexToUint8 from "./hexToUint8";
export const bytesToHex = (data) => {
    return Buffer.from(data).toString('hex');
};
export const hexToBytes = (str) => {
    const hex = str.trim();
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
};
export function uint8ToHex(arr) {
    let hexString = "";
    for (let byte of arr) {
        let _byte = byte.toString(16).padStart(2, "0");
        hexString += _byte;
    }
    return hexString;
}
export function bytesToUint8(target) {
    return new Uint8Array(target);
}
export function hexToUint8(hexString) {
    return _hexToUint8(hexString);
}
