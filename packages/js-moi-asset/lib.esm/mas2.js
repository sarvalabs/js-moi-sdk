export var MAS2;
(function (MAS2) {
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
    })(Endpoint = MAS2.Endpoint || (MAS2.Endpoint = {}));
})(MAS2 || (MAS2 = {}));
//# sourceMappingURL=mas2.js.map