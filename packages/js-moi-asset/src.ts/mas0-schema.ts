export const TRANSFER_SCHEMA = {
  kind: "struct",
  fields: {
    beneficiary: { kind: "bytes" },
    amount: { kind: "integer" }
  }
};

export const TRANSFER_FROM_SCHEMA = {
  kind: "struct",
  fields: {
    benefactor: { kind: "bytes" },
    beneficiary: { kind: "bytes" },
    amount: { kind: "integer" }
  }
};

export const BURN_SCHEMA = {
  kind: "struct",
  fields: {
    amount: { kind: "integer" }
  }
};

export const MINT_SCHEMA = {
  kind: "struct",
  fields: {
    beneficiary: { kind: "bytes" },
    amount: { kind: "integer" }
  }
};

export const MINT_WITH_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    beneficiary: { kind: "bytes" },
    amount: { kind: "integer" },
    static_metadata: { 
      kind: "map",
      fields: {
        keys: {
          kind: "string"
        },
        values: {
          kind: "bytes"
        }
      }
    }
  }
};

export const APPROVE_SCHEMA = {
  kind: "struct",
  fields: {
    beneficiary: { kind: "bytes" },
    amount: { kind: "integer" },
    expires_at: { kind: "integer" }
  }
};

export const LOCKUP_SCHEMA = {
  kind: "struct",
  fields: {
    beneficiary: { kind: "bytes" },
    amount: { kind: "integer" }
  }
};

export const RELEASE_SCHEMA = {
  kind: "struct",
  fields: {
    benefactor: { kind: "bytes" },
    beneficiary: { kind: "bytes" },
    amount: { kind: "integer" }
  }
};

export const REVOKE_SCHEMA = {
  kind: "struct",
  fields: {
    beneficiary: { kind: "bytes" }
  }
}

export const BALANCEOF_SCHEMA = {
  kind: "struct",
  fields: {
    address: { kind: "bytes" }
  }
}

export const SET_STATIC_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    key: { kind: "string" },
    value: { kind: "string" },
  }
}

export const SET_DYNAMIC_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    key: { kind: "string" },
    value: { kind: "string" },
  }
}

export const GET_STATIC_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    key: { kind: "string" },
  }
}

export const GET_DYNAMIC_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    key: { kind: "string" },
  }
}

// Result schemas for the read-only (static) callsites, one field each,
// matching go-moi's mas0.yaml `returns` block for the same callsite name.
// Used to decode a `.call()` response's raw POLO `outputs` bytes.

export const SYMBOL_RESULT_SCHEMA = {
  kind: "struct",
  fields: {
    symbol: { kind: "string" },
  }
}

export const BALANCEOF_RESULT_SCHEMA = {
  kind: "struct",
  fields: {
    balance: { kind: "integer" },
  }
}

export const CREATOR_RESULT_SCHEMA = {
  kind: "struct",
  fields: {
    creator: { kind: "bytes" },
  }
}

export const MANAGER_RESULT_SCHEMA = {
  kind: "struct",
  fields: {
    manager: { kind: "bytes" },
  }
}

export const DECIMALS_RESULT_SCHEMA = {
  kind: "struct",
  fields: {
    decimals: { kind: "integer" },
  }
}

export const MAX_SUPPLY_RESULT_SCHEMA = {
  kind: "struct",
  fields: {
    max_supply: { kind: "integer" },
  }
}

export const CIRCULATING_SUPPLY_RESULT_SCHEMA = {
  kind: "struct",
  fields: {
    circulating_supply: { kind: "integer" },
  }
}

export const GET_STATIC_METADATA_RESULT_SCHEMA = {
  kind: "struct",
  fields: {
    value: { kind: "bytes" },
  }
}

export const GET_DYNAMIC_METADATA_RESULT_SCHEMA = {
  kind: "struct",
  fields: {
    value: { kind: "bytes" },
  }
}