"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._default = exports.wordlists = void 0;
/**
 * This code is based on the bitcoinjs/bip39 by Wei Lu and Danieal Cousens
 * Modifications have been made to adapt it to the needs of js-moi-bip39
 * including enhancements for browser compatibility and TypeScript conversion.
 *
 * Original module available at: https://github.com/bitcoinjs/bip39
 * Modified version available at: https://github.com/zenz-solutions/js-moi-sdk/tree/main/packages/js-moi-bip39
 *
 * Copyright (c) 2014, Wei Lu <luwei.here@gmail.com> and Daniel Cousens <email@dcousens.com>
 * Repository ISC license details can be found at https://github.com/bitcoinjs/bip39/blob/master/LICENSE
 *
 **/
const chinese_simplified_json_1 = __importDefault(require("../wordlists/chinese_simplified.json"));
const chinese_traditional_json_1 = __importDefault(require("../wordlists/chinese_traditional.json"));
const czech_json_1 = __importDefault(require("../wordlists/czech.json"));
const english_json_1 = __importDefault(require("../wordlists/english.json"));
const french_json_1 = __importDefault(require("../wordlists/french.json"));
const italian_json_1 = __importDefault(require("../wordlists/italian.json"));
const japanese_json_1 = __importDefault(require("../wordlists/japanese.json"));
const korean_json_1 = __importDefault(require("../wordlists/korean.json"));
const portuguese_json_1 = __importDefault(require("../wordlists/portuguese.json"));
const spanish_json_1 = __importDefault(require("../wordlists/spanish.json"));
exports.wordlists = {
    czech: czech_json_1.default,
    chinese_simplified: chinese_simplified_json_1.default,
    chinese_traditional: chinese_traditional_json_1.default,
    korean: korean_json_1.default,
    french: french_json_1.default,
    italian: italian_json_1.default,
    spanish: spanish_json_1.default,
    japanese: japanese_json_1.default,
    JA: japanese_json_1.default,
    portuguese: portuguese_json_1.default,
    english: english_json_1.default,
    EN: english_json_1.default,
};
exports._default = english_json_1.default;
//# sourceMappingURL=_wordlists.js.map