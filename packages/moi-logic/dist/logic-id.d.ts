/**
 * LogicId
 *
 * Represents a LogicID, which is an identifier for a logic.
 */
export declare class LogicId {
    private logic;
    constructor(logicId: string);
    /**
     * hex
     *
     * Returns the LogicID as a hex encoded string.
     *
     * @returns {string} The LogicID as a hex encoded string.
     */
    hex(): string;
    /**
     * isValid
     *
     * Checks if the LogicID is valid.
     *
     * @returns {boolean} True if the LogicID is valid, false otherwise.
     */
    isValid(): boolean;
    /**
     * getVersion
     *
     * Returns the version of the LogicID.
     * Returns -1 if the LogicID is not valid.
     *
     * @returns {number} The version of the LogicID.
     */
    getVersion(): number;
    /**
     * isStateful
     *
     * Checks if the stateful flag is set for the LogicID.
     * Returns false if the LogicID is invalid.
     *
     * @returns {boolean} True if the stateful flag is set, false otherwise.
     */
    isStateful(): boolean;
    /**
     * isInteractive
     *
     * Checks if the interactive flag is set for the LogicID.
     * Returns false if the LogicID is invalid.
     *
     * @returns {boolean} True if the interactive flag is set, false otherwise.
     */
    isInteractive(): boolean;
    /**
     * getEdition
     *
     * Returns the edition number of the LogicID.
     * Returns 0 if the LogicID is invalid.
     *
     * @returns {number} The edition number of the LogicID.
     */
    getEdition(): number;
    /**
     * getAddress
     *
     * Returns the address associated with the LogicID.
     * Returns null if the LogicID is invalid or the version is not 0.
     *
     * @returns {string | null} The address associated with the LogicID, or
     null if not applicable.
     */
    getAddress(): string | null;
}
