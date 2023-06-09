export declare class LogicId {
    private logic;
    constructor(logicId: string);
    hex(): string;
    isValid(): boolean;
    getVersion(): number;
    isStateful(): boolean;
    isInteractive(): boolean;
    getEdition(): number;
    getAddress(): string | null;
}
