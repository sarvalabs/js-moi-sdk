import { ErrorUtils } from "js-moi-utils";
import { IdentifierKind } from "./identifier-kind";

const maxIdentifierKind = IdentifierKind.Logic;
const identifierV0 = 0;

/**
 * kindSupport is a map of IdentifierKind to the maximum supported version.
 */
const kindSupport: Map<IdentifierKind, number> = new Map([
    [IdentifierKind.Participant, 0],
    [IdentifierKind.Asset, 0],
    [IdentifierKind.Logic, 0],
]);

export const TagParticipantV0 = (IdentifierKind.Participant << 4) | identifierV0;

export const TagAssetV0 = (IdentifierKind.Asset << 4) | identifierV0;

export const TagLogicIdV0 = (IdentifierKind.Logic << 4) | identifierV0;

export class IdentifierTag {
    private readonly tag: number;

    constructor(tag: number) {
        this.tag = tag;

        const error = IdentifierTag.validate(this);

        if (error) {
            ErrorUtils.throwArgumentError(error.message, "tag", tag);
        }
    }

    /**
     * Get the `IdentifierKind` from the `IdentifierTag`.
     * @returns The kind of identifier.
     */
    public getKind(): IdentifierKind {
        return this.tag >> 4;
    }

    /**
     * Get the version of the `IdentifierTag`.
     *
     * @returns The version of the identifier.
     */
    public getVersion(): number {
        return this.tag & 0x0f;
    }

    /**
     * Check if the `IdentifierTag` is valid and return an error if it is not.
     *
     * @param tag The `IdentifierTag` to validate.
     * @returns a error if the `IdentifierTag` is invalid, otherwise null.
     *
     * @throws if the version is not supported.
     * @throws if the kind is not supported.
     */
    public static validate(tag: IdentifierTag): Error | null {
        if (tag.getKind() > maxIdentifierKind) {
            return new Error("Unsupported identifier kind.");
        }

        if (tag.getVersion() > (kindSupport.get(tag.getKind()) ?? 0)) {
            return new Error("Unsupported identifier version.");
        }

        return null;
    }
}
