const SUPPORTED_SIG_ALGOS = ["ecdsa", "schnorr"];
export function generateRandomSeed(count) {
    let seed = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
        seed[i] = Math.floor(Math.random() * 256);
    }
    return seed;
}
export function getBytesFromString(str) {
    var bytes = [];
    for (var i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}
;
export function getSigTypeAttributes(sigType) {
    const sigTypeArray = sigType?.split("_");
    if (sigTypeArray?.length !== 2) {
        throw new Error("invalid signature type");
    }
    if (SUPPORTED_SIG_ALGOS.filter(_sigAlgo => _sigAlgo === sigTypeArray[0]).length !== 0) {
        throw new Error("un-supported signature algorithm");
    }
    return sigTypeArray;
}
