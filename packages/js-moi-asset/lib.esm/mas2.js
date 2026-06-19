export var MAS2;
(function (MAS2) {
    let Endpoint;
    (function (Endpoint) {
        Endpoint["TRANSFER"] = "Transfer";
        Endpoint["TRANSFERFROM"] = "TransferFrom";
        Endpoint["MINT"] = "Mint";
        Endpoint["MINTWITHMETADATA"] = "MintWithMetadata";
        Endpoint["BURN"] = "Burn";
        Endpoint["LOCKUP"] = "Lockup";
        Endpoint["RELEASE"] = "Release";
        Endpoint["APPROVE"] = "Approve";
        Endpoint["REVOKE"] = "Revoke";
        Endpoint["SETSTATICMETADATA"] = "SetStaticMetadata";
        Endpoint["SETDYNAMICMETADATA"] = "SetDynamicMetadata";
        Endpoint["SETSTATICTOKENMETADATA"] = "SetStaticTokenMetadata";
        Endpoint["SETDYNAMICTOKENMETADATA"] = "SetDynamicTokenMetadata";
        // Non Mutable endpoints
        Endpoint["SYMBOL"] = "Symbol";
        Endpoint["BALANCEOF"] = "BalanceOf";
        Endpoint["CREATOR"] = "Creator";
        Endpoint["MANAGER"] = "Manager";
        Endpoint["GETSTATICMETADATA"] = "GetStaticMetadata";
        Endpoint["GETDYNAMICMETADATA"] = "GetDynamicMetadata";
        Endpoint["GETSTATICTOKENMETADATA"] = "GetStaticTokenMetadata";
        Endpoint["GETDYNAMICTOKENMETADATA"] = "GetDynamicTokenMetadata";
    })(Endpoint = MAS2.Endpoint || (MAS2.Endpoint = {}));
})(MAS2 || (MAS2 = {}));
//# sourceMappingURL=mas2.js.map