export class BaseManifestSerializer {
    validate(manifest) {
        if (typeof manifest !== "object" || manifest === null) {
            return false;
        }
        if (!("elements" in manifest) || !Array.isArray(manifest.elements)) {
            return false;
        }
        return true;
    }
}
//# sourceMappingURL=base-manifest-serializer.js.map