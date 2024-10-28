import { BaseManifestCoder } from "./base-manifest-coder";
export declare class YamlManifestCoder extends BaseManifestCoder {
    encode(yamlManifest: string): Uint8Array;
    decode(data: string | Uint8Array): string;
}
//# sourceMappingURL=yaml-manifest-coder.d.ts.map