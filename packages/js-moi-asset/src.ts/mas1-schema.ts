export const TRANSFER_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    beneficiary: { kind: "bytes" },
  }
};

export const TRANSFER_FROM_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    benefactor: { kind: "bytes" },
    beneficiary: { kind: "bytes" }
  }
};

export const MINT_SCHEMA = {
  kind: "struct",
  fields: {
    beneficiary: { kind: "bytes" },
  }
};

export const MINT_WITH_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    beneficiary: { kind: "bytes" },
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

export const BURN_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" }
  }
};

export const LOCKUP_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    beneficiary: { kind: "bytes" },
  }
};

export const RELEASE_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    benefactor: { kind: "bytes" },
    beneficiary: { kind: "bytes" }
  }
};

export const APPROVE_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    beneficiary: { kind: "bytes" },
    expires_at: { kind: "integer" }
  }
};

export const REVOKE_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    beneficiary: { kind: "bytes" }
  }
}

export const IS_OWNER_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    address: { kind: "bytes" }
  }
}

export const SET_STATIC_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    key: { kind: "string" },
    value: { kind: "bytes" },
  }
}

export const GET_STATIC_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    key: { kind: "string" },
  }
}

export const SET_DYNAMIC_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    key: { kind: "string" },
    value: { kind: "bytes" },
  }
}

export const GET_DYNAMIC_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    key: { kind: "string" },
  }
}

export const SET_STATIC_TOKEN_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    key: { kind: "string" },
    value: { kind: "bytes" },
  }
}

export const GET_STATIC_TOKEN_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    key: { kind: "string" },
  }
}

export const SET_DYNAMIC_TOKEN_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    key: { kind: "string" },
    value: { kind: "bytes" },
  }
}

export const GET_DYNAMIC_TOKEN_METADATA_SCHEMA = {
  kind: "struct",
  fields: {
    token_id: { kind: "integer" },
    key: { kind: "string" },
  }
}
