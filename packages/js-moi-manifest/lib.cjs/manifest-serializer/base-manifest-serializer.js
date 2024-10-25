"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseManifestSerializer = void 0;
class BaseManifestSerializer {
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
exports.BaseManifestSerializer = BaseManifestSerializer;
//# sourceMappingURL=base-manifest-serializer.js.map