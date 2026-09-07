"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UINT256_MAX = exports.MAX_DECIMALS = exports.KMOI_SCALE = exports.KMOI_DECIMALS = void 0;
exports.KMOI_DECIMALS = 9;
exports.KMOI_SCALE = 10n ** BigInt(exports.KMOI_DECIMALS);
exports.MAX_DECIMALS = 18;
/** Maximum value representable as a 256-bit unsigned integer on MOI. */
exports.UINT256_MAX = (1n << 256n) - 1n;
//# sourceMappingURL=kmoi.js.map