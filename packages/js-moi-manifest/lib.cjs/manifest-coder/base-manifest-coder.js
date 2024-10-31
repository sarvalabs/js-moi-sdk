"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseManifestCoder = void 0;
class BaseManifestCoder {
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
exports.BaseManifestCoder = BaseManifestCoder;
//# sourceMappingURL=base-manifest-coder.js.map