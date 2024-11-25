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
import chinese_simplified from '../wordlists/chinese_simplified.json';
import chinese_traditional from '../wordlists/chinese_traditional.json';
import czech from '../wordlists/czech.json';
import english from '../wordlists/english.json';
import french from '../wordlists/french.json';
import italian from '../wordlists/italian.json';
import japanese from '../wordlists/japanese.json';
import korean from '../wordlists/korean.json';
import portuguese from '../wordlists/portuguese.json';
import spanish from '../wordlists/spanish.json';

export const wordlists: { [key: string]: string[] } = {
    czech: czech,
    chinese_simplified: chinese_simplified,
    chinese_traditional: chinese_traditional,
    korean: korean,
    french: french,
    italian: italian,
    spanish: spanish,
    japanese: japanese,
    JA: japanese,
    portuguese: portuguese,
    english: english,
    EN: english,
};

export const _default: string[] = english;
