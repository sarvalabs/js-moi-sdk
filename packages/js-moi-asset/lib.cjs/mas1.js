"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAS1 = void 0;
var MAS1;
(function (MAS1) {
    let Endpoint;
    (function (Endpoint) {
        Endpoint["TRANSFER"] = "Transfer";
        Endpoint["TRANSFERFROM"] = "TransferFrom";
        Endpoint["MINT"] = "Mint";
        Endpoint["MINTWITHMETADATA"] = "MintWithMetadata";
        Endpoint["LOCKUP"] = "Lockup";
        Endpoint["BURN"] = "Burn";
        Endpoint["APPROVE"] = "Approve";
        Endpoint["RELEASE"] = "Release";
        Endpoint["REVOKE"] = "Revoke";
        Endpoint["SETSTATICMETADATA"] = "SetStaticMetadata";
        Endpoint["SETDYNAMICMETADATA"] = "SetDynamicMetadata";
        // Non Mutable endpoints
        Endpoint["SYMBOL"] = "Symbol";
        Endpoint["BALANCEOF"] = "BalanceOf";
        Endpoint["CREATOR"] = "Creator";
        Endpoint["MANAGER"] = "Manager";
        Endpoint["DECIMALS"] = "Decimals";
        Endpoint["MAXSUPPLY"] = "MaxSupply";
        Endpoint["CIRCULATINGSUPPLY"] = "CirculatingSupply";
        Endpoint["GETSTATICMETADATA"] = "GetStaticMetadata";
        Endpoint["GETDYNAMICMETADATA"] = "GetDynamicMetadata";
    })(Endpoint = MAS1.Endpoint || (MAS1.Endpoint = {}));
})(MAS1 || (exports.MAS1 = MAS1 = {}));
//# sourceMappingURL=mas1.js.map