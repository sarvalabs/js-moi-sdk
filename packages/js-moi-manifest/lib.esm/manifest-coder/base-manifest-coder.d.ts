import type { LogicManifest } from "../../types/manifest";
export interface ManifestCoder {
    /**
     * Serializes a manifest.
     *
     * @param manifest The manifest to serialize.
     * @returns The serialized manifest.
     */
    encode(manifest: LogicManifest.Manifest): Uint8Array;
    /**
     * Deserializes a manifest.
     *
     * @param data The data to deserialize.
     * @returns The deserialized manifest.
     */
    decode(data: string | Uint8Array): LogicManifest.Manifest;
}
export declare abstract class BaseManifestCoder implements ManifestCoder {
    abstract encode(manifest: LogicManifest.Manifest): Uint8Array;
    abstract decode(data: string | Uint8Array): LogicManifest.Manifest;
    protected validate(manifest: unknown): manifest is LogicManifest.Manifest;
}
//# sourceMappingURL=base-manifest-coder.d.ts.map