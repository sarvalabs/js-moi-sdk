import type { LogicManifest } from "../../types/manifest";
export interface ManifestSerializer {
    /**
     * Serializes a manifest.
     *
     * @param manifest The manifest to serialize.
     * @returns The serialized manifest.
     */
    serialize(manifest: LogicManifest.Manifest): Uint8Array;
    /**
     * Deserializes a manifest.
     *
     * @param data The data to deserialize.
     * @returns The deserialized manifest.
     */
    deserialize(data: string | Uint8Array): LogicManifest.Manifest;
}
export declare abstract class BaseManifestSerializer implements ManifestSerializer {
    abstract serialize(manifest: LogicManifest.Manifest): Uint8Array;
    abstract deserialize(data: string | Uint8Array): LogicManifest.Manifest;
    protected validate(manifest: unknown): manifest is LogicManifest.Manifest;
}
//# sourceMappingURL=base-manifest-serializer.d.ts.map