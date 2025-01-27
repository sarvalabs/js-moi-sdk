import { IdentifierKind } from "./identifier-kind";
export declare class IdentifierTag {
    private readonly tag;
    constructor(tag: number);
    /**
     * Get the `IdentifierKind` from the `IdentifierTag`.
     * @returns The kind of identifier.
     */
    getKind(): IdentifierKind;
    /**
     * Get the version of the `IdentifierTag`.
     *
     * @returns The version of the identifier.
     */
    getVersion(): number;
    getValue(): number;
    /**
     * Check if the `IdentifierTag` is valid and return an error if it is not.
     *
     * @param tag The `IdentifierTag` to validate.
     * @returns a error if the `IdentifierTag` is invalid, otherwise null.
     *
     * @throws if the version is not supported.
     * @throws if the kind is not supported.
     */
    static validate(tag: IdentifierTag): Error | null;
}
export declare const TagParticipantV0: IdentifierTag;
export declare const TagAssetV0: IdentifierTag;
export declare const TagLogicV0: IdentifierTag;
//# sourceMappingURL=identifier-tag.d.ts.map