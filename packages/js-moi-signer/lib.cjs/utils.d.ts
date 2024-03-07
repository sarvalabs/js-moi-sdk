export type SigDigest = {
    _r: Uint8Array;
    _s: Uint8Array;
};
export declare function toDER(x: Uint8Array): Uint8Array;
export declare function fromDER(x: Uint8Array): Uint8Array;
export declare function bip66Encode(rAndS: SigDigest): Uint8Array;
export declare function bip66Decode(buffer: Uint8Array): SigDigest;
export declare function JoinSignature(digest: SigDigest): Uint8Array;
//# sourceMappingURL=utils.d.ts.map