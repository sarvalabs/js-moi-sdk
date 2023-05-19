import { LogicManifest } from "moi-utils";
import { Schema as PoloSchema } from "js-polo";
export declare class Schema {
    private elements;
    private classDefs;
    constructor(elements?: Map<number, LogicManifest.Element>, classDefs?: Map<string, number>);
    static PISA_ENGINE_SCHEMA: {
        kind: string;
        fields: {
            kind: {
                kind: string;
            };
            flags: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                    };
                };
            };
        };
    };
    static PISA_DEPS_SCHEMA: {
        kind: string;
        fields: {
            values: {
                kind: string;
            };
        };
    };
    static PISA_TYPE_FIELD_SCHEMA: {
        kind: string;
        fields: {
            values: {
                kind: string;
                fields: {
                    slot: {
                        kind: string;
                    };
                    label: {
                        kind: string;
                    };
                    type: {
                        kind: string;
                    };
                };
            };
        };
    };
    static PISA_INSTRUCTIONS_SCHEMA: {
        kind: string;
        fields: {
            bin: {
                kind: string;
            };
            hex: {
                kind: string;
            };
            asm: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                    };
                };
            };
        };
    };
    static PISA_STATE_SCHEMA: {
        kind: string;
        fields: {
            kind: {
                kind: string;
            };
            fields: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
        };
    };
    static PISA_CONSTANT_SCHEMA: {
        kind: string;
        fields: {
            type: {
                kind: string;
            };
            value: {
                kind: string;
            };
        };
    };
    static PISA_TYPEDEF_SCHEMA: {
        kind: string;
        fields: {};
    };
    static PISA_CLASS_SCHEMA: {
        kind: string;
        fields: {
            name: {
                kind: string;
            };
            fields: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
        };
    };
    static PISA_ROUTINE_SCHEMA: {
        kind: string;
        fields: {
            name: {
                kind: string;
            };
            kind: {
                kind: string;
            };
            accepts: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            returns: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            executes: {
                kind: string;
                fields: {
                    bin: {
                        kind: string;
                    };
                    hex: {
                        kind: string;
                    };
                    asm: {
                        kind: string;
                        fields: {
                            values: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            catches: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                    };
                };
            };
        };
    };
    static PISA_EXCEPTION_SCHEMA: {
        kind: string;
        fields: {
            class: {
                kind: string;
            };
            data: {
                kind: string;
            };
            trace: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                    };
                };
            };
        };
    };
    static PISA_RESULT_SCHEMA: {
        kind: string;
        fields: {
            outputs: {
                kind: string;
            };
            error: {
                kind: string;
            };
        };
    };
    private extractArrayDataType;
    private extractMapDataType;
    private convertPrimitiveDataType;
    private parseClassFields;
    private parseDataType;
    parseFields: (fields: LogicManifest.TypeField[]) => PoloSchema;
}
