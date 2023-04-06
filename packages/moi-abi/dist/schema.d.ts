import Manifest from "../types/manifest";
import { Schema as PoloSchema } from "js-polo";
export default class Schema {
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
            catches: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
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
        };
    };
    private static extractArrayDataType;
    private static extractMapDataType;
    private static convertPrimitiveDataType;
    private static parseDataType;
    static parseFields: (fields: Record<string, Manifest.TypeField>) => PoloSchema;
}
