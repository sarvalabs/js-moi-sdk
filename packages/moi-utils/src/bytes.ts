export type Bytes = ArrayLike<number>;

export const isInteger = (value: number) => {
    return (typeof(value) === "number" && value == value && (value % 1) === 0);
}

export const isBytes = (value: any): value is Bytes => {
    if (value == null) { return false; }

    if (value.constructor === Uint8Array) { return true; }
    if (typeof(value) === "string") { return false; }
    if (!isInteger(value.length) || value.length < 0) { return false; }

    for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (!isInteger(v) || v < 0 || v >= 256) { return false; }
    }
    return true;
}

export const hexDataLength = (data: string) => {
    if (!isHexString(data) || (data.length % 2)) {
        return null;
    }

    return (data.length - 2) / 2;
}


export const isHexString = (value: any, length?: number): boolean => {
    if (typeof(value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false
    }
    if (length && value.length !== 2 + 2 * length) { return false; }
    return true;
}

export const bytesToUint8 = (target: Buffer): Uint8Array => {
    return new Uint8Array(target)
}