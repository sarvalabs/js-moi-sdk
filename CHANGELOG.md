# Json Rpc Endpoint

## Change Log

### JS-MOI-UTILS

#### Features

- `ensureHexPrefix` function added to ensure a hex string has a `0x` prefix.

- `isAddress` function added to check if a string is a valid 32 byte address.

- `isHex`
  - Now able to preform a length check using the signature `isHex(value: string, length: number)`, where `length` is the expected length of the hex string.

    ```typescript
    import { isHex } from 'js-moi-utils';
    // 2 is expected length of bytes for equivalent hex string
    isHex('0x1234', 2); // true

    ```

#### Changes

1. Type of `Hex` from `string` to `0x${string}`.
1. `numToHex`
    - [**Breaking Change**] now returns a `Hex` value instead of a `string`.
    - used to return in upper case, now returns in lower case.
1. `toQuantity`
    - **Deprecated** - use `numToHex` instead.
    - [**Breaking Change**] now returns a `Hex` value instead of a `string`.
    - used to return in upper case, now returns in lower case.
1. `encodeToString`
    - **Deprecated** - use `bytesToHex` instead.
    - [**Breaking Change**] Return type changed from `string` to `Hex`.
1. `isHex`
    - assert that the input is a `Hex` value.
