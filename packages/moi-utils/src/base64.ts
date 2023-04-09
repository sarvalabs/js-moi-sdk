
export const encodeBase64 = (uint8Array: Uint8Array): string => {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    
    return Buffer.from(binaryString, 'binary').toString('base64');
}

export const decodeBase64 = (base64String: string): Uint8Array => {
    const binaryString = Buffer.from(base64String, 'base64').toString('binary');
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    return uint8Array;
}
