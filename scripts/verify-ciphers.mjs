// Verification and generator script for Operation Janus ciphers
import crypto from 'node:crypto';

export function normalizeAnswer(ans) {
  return ans.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function hashAnswer(ans) {
  return crypto.createHash('sha256').update(normalizeAnswer(ans)).digest('hex');
}

// 1. Round 1: Caesar Cipher (Shift +3)
// Plaintext: WITHHOLD PANZER ROUTES FROM STALIN
// If shift is +3:
// W->Z, I->L, T->W, H->K, H->K, O->R, L->O, D->G
// P->S, A->D, N->Q, Z->C, E->H, R->U
// R->U, O->R, U->X, T->W, E->H, S->V
// F->I, R->U, O->R, M->P
// S->V, T->W, A->D, L->O, I->L, N->Q
export function caesarEncrypt(text, shift = 3) {
  return text.toUpperCase().replace(/[A-Z]/g, (c) => {
    return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
  });
}

export function caesarDecrypt(text, shift = 3) {
  return text.toUpperCase().replace(/[A-Z]/g, (c) => {
    return String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
  });
}

// 2. Round 2: Reused One-Time Pad (mod 26)
// ENORMOZ
// E=04, N=13, O=14, R=17, M=12, O=14, Z=25
// Pad row 4: 14-05-04-14-14-02-09
// (Plain + Pad) mod 26 = Cipher
// E(4) + 14 = 18
// N(13) + 05 = 18
// O(14) + 04 = 18
// R(17) + 14 = 31 mod 26 = 05
// M(12) + 14 = 26 mod 26 = 00
// O(14) + 02 = 16
// Z(25) + 09 = 34 mod 26 = 08
// Ciphertext: 18-18-18-05-00-16-08 (Matches blueprint exactly!)

// 3. Round 3: Columnar Transposition
// Plaintext: UNTHINKABLE JULY FIRST
// Keyword: WARP (Alphabetical order: A=1, P=2, R=3, W=4)
// Let's test transposition:
export function columnarEncrypt(plaintext, keyword) {
  const clean = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
  const keyChars = keyword.toUpperCase().split('');
  const cols = keyChars.length;
  const sortedKeyIndices = keyChars
    .map((ch, idx) => ({ ch, idx }))
    .sort((a, b) => a.ch.localeCompare(b.ch) || a.idx - b.idx)
    .map((item) => item.idx);

  const grid = [];
  for (let i = 0; i < clean.length; i += cols) {
    grid.push(clean.slice(i, i + cols));
  }

  let result = '';
  for (const colIdx of sortedKeyIndices) {
    for (let r = 0; r < grid.length; r++) {
      if (grid[r][colIdx]) {
        result += grid[r][colIdx];
      }
    }
    result += ' ';
  }
  return result.trim();
}

// 4. Round 4: Vigenere
// Plaintext: ALPINE REDOUBT
// Key: ROCKET
export function vigenereEncrypt(plaintext, key) {
  const clean = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  let result = '';
  for (let i = 0; i < clean.length; i++) {
    const p = clean.charCodeAt(i) - 65;
    const k = cleanKey.charCodeAt(i % cleanKey.length) - 65;
    result += String.fromCharCode(((p + k) % 26) + 65);
  }
  return result;
}

export function vigenereDecrypt(ciphertext, key) {
  const clean = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  let result = '';
  for (let i = 0; i < clean.length; i++) {
    const c = clean.charCodeAt(i) - 65;
    const k = cleanKey.charCodeAt(i % cleanKey.length) - 65;
    result += String.fromCharCode(((c - k + 26) % 26) + 65);
  }
  return result;
}

// Let's test all and print report
const r1_plain = "WITHHOLD PANZER ROUTES FROM STALIN";
const r1_cipher = caesarEncrypt(r1_plain, 3);
console.log("R1 Caesar encrypted:", r1_cipher);
console.log("R1 Caesar decrypted back:", caesarDecrypt(r1_cipher, 3));

const r3_plain = "UNTHINKABLE JULY FIRST";
const r3_cipher = columnarEncrypt(r3_plain, "WARP");
console.log("R3 Columnar cipher with WARP:", r3_cipher);

const r4_plain = "ALPINE REDOUBT";
const r4_cipher = vigenereEncrypt(r4_plain, "ROCKET");
console.log("R4 Vigenere with ROCKET:", r4_cipher);
console.log("R4 Decrypted back:", vigenereDecrypt(r4_cipher, "ROCKET"));
