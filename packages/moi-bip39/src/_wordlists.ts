import czech from './wordlists/czech.json';
import chinese_simplified from './wordlists/chinese_simplified.json';
import chinese_traditional from './wordlists/chinese_traditional.json';
import korean from './wordlists/korean.json';
import french from './wordlists/french.json';
import italian from './wordlists/italian.json';
import spanish from './wordlists/spanish.json';
import japanese from './wordlists/japanese.json';
import portuguese from './wordlists/portuguese.json';
import english from './wordlists/english.json';

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
