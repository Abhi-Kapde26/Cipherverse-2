export interface LevelDefinition {
  number: number;
  act: number;
  year: number;
  title: string;
  agency: 'MI6' | 'CIA' | 'KGB' | 'JOINT' | 'UNIT 404';
  cipherType: string;
  storyText: string;
  ciphertext: string;
  clue: string;
  hint: string;
  pamphletKey: string;
  isDilemma: boolean;
  timerSeconds?: number;
  keyFragment?: number;
  options?: {
    id: string;
    title: string;
    description: string;
    faction?: 'CIA' | 'KGB' | 'NEUTRAL';
    riskText: string;
  }[];
}

export interface VariantDefinition {
  levelNumber: number;
  branch: string; // 'A' | 'B' | 'A1' | 'A2' | 'B1' | 'B2'
  storyText: string;
  ciphertext: string;
  clue: string;
}

export const LEVELS: LevelDefinition[] = [
  // ACT I: 1943 - 1945
  {
    number: 1,
    act: 1,
    year: 1943,
    title: "Doctored Kursk Intercept",
    agency: "MI6",
    cipherType: "Caesar Shift (-3) + Null Extraction",
    storyText:
      "July 1943. Bletchley Park, Hut 99. A high-priority German Lorenz transmission from Army Group South has been intercepted before the Battle of Kursk. British Intelligence wants to feed Stalin only enough intelligence to bleed the Wehrmacht without handing the Red Army unconditional dominance over Central Europe. As Unit 404 analysts, your orders are to decipher the doctored intercept order.",
    ciphertext: "ZLWK KROG SDQC HUUR XWHV IURP VWDO LQ",
    clue: "Shift = letters in 'HUT' (3). Shift each letter backward through the Latin alphabet.",
    hint: "Each letter is shifted forward by 3 in transmission. Reverse the shift (A becomes X, D becomes A, etc.).",
    pamphletKey: "caesar",
    isDilemma: false,
    keyFragment: 7,
  },
  {
    number: 2,
    act: 1,
    year: 1944,
    title: "Project Venona",
    agency: "JOINT",
    cipherType: "Reused One-Time Pad (mod 26)",
    storyText:
      "Autumn 1944. Arlington Hall. A Soviet diplomatic cable from the New York consulate was mistakenly encrypted using a one-time pad page that Moscow had already deployed in 1942. Soviet trade commission cover names conceal Soviet espionage infiltrating the Manhattan Project. Decrypt the codename of the atomic espionage network.",
    ciphertext: "18 - 18 - 18 - 05 - 00 - 16 - 08",
    clue: "Reused One-Time Pad: Pad row 4 values are [14, 05, 04, 14, 14, 02, 09]. Subtract the pad from the ciphertext modulo 26: P = (C - Pad + 26) mod 26.",
    hint: "Use letter numbering A=0, B=1, ... Z=25. Subtract each pad number from the ciphertext number mod 26.",
    pamphletKey: "onetimepad",
    isDilemma: false,
  },
  {
    number: 3,
    act: 1,
    year: 1945,
    title: "Yalta / Operation Unthinkable",
    agency: "MI6",
    cipherType: "Columnar Transposition",
    storyText:
      "February 1945. Yalta. Behind the smiles of Roosevelt, Churchill, and Stalin, Winston Churchill secretly commissions the British Chiefs of Staff to draft 'Operation Unthinkable'—a contingency plan to attack Soviet forces in Germany with 47 British and American divisions on July 1st, 1945. Decrypt the operational order.",
    ciphertext: "NNLLR HAJFT TKEYS UIBUI",
    clue: "Columnar Transposition with Keyword 'WARP'. Grid dimensions: 4 columns. Alphabetical column read order: A(1), P(2), R(3), W(4).",
    hint: "Write the columns according to the alphabetical order of WARP (col 2, col 4, col 3, col 1) and read row by row.",
    pamphletKey: "columnar",
    isDilemma: false,
  },
  {
    number: 4,
    act: 1,
    year: 1945,
    title: "Operation Paperclip",
    agency: "CIA",
    cipherType: "Vigenère Cipher",
    storyText:
      "May 1945. Harz Mountains, Germany. As the Third Reich collapses, American Counter Intelligence Corps teams hunt for Wernher von Braun and V-2 ballistic rocket dossiers before Soviet SMERSH detachments locate them. A field courier encoded the location of the hidden underground stash.",
    ciphertext: "R Z R S R X I S F Y Y U K",
    clue: "Vigenère Cipher with Keyword 'ROCKET'. P = (C - K + 26) mod 26.",
    hint: "Align the keyword ROCKETROCKET beneath the ciphertext and reverse the shift.",
    pamphletKey: "vigenere",
    isDilemma: false,
  },
  {
    number: 5,
    act: 1,
    year: 1945,
    title: "Klaus Fuchs Leak [DILEMMA 1]",
    agency: "UNIT 404",
    cipherType: "Playfair Cipher",
    storyText:
      "August 1945. Los Alamos. British physicist Klaus Fuchs has smuggled blueprints of the Fat Man plutonium implosion lens. Unit 404 intercepts his courier contact note. But before you can transmit, you face your first fateful geopolitical crossroad: Which superpower will you serve?",
    ciphertext: "FA PO CH PL BE PV",
    clue: "Playfair Cipher with Matrix Keyword 'TRINITY'. Note: I and J share a cell. Decrypt the 2-letter pairs.",
    hint: "Form the 5x5 Playfair grid starting with TRINITY (T R I N Y, A B C D E, F G H K L, M O P Q S, U V W X Z). Reverse Playfair digraph rules.",
    pamphletKey: "playfair",
    isDilemma: true,
    timerSeconds: 180,
    keyFragment: 3,
    options: [
      {
        id: "A",
        title: "The Langley Pact (CIA Alignment)",
        description:
          "Hand the Fuchs courier intercept to American OSS/CIA liaison Allen Dulles in Munich. Secure Western funding, immunity, and advanced radar cryptographic stations.",
        faction: "CIA",
        riskText: "Angers Soviet intelligence; exposes your European network to SMERSH assassins.",
      },
      {
        id: "B",
        title: "The Lubyanka Gambit (KGB Alignment)",
        description:
          "Relay the decrypted bomb physics through diplomatic pouch to Moscow Centre. Earn deep Soviet cover in East Berlin and access to stolen Enigma/Lorenz archives.",
        faction: "KGB",
        riskText: "Western surveillance tightens; MI6 and FBI declare Unit 404 rogue targets.",
      },
    ],
  },

  // ACT II: 1948 - 1956
  {
    number: 6,
    act: 2,
    year: 1948,
    title: "Berlin Blockade",
    agency: "JOINT",
    cipherType: "ADFGVX Cipher",
    storyText:
      "June 1948. The Soviets have severed all rail, canal, and road connections into West Berlin. Two million civilians face starvation unless the Western Allies supply the city entirely by air. Your assigned decryption varies according to your allegiances.",
    ciphertext: "AA DF GD DD DF AF DG XV",
    clue: "ADFGVX German Field Cipher. Polybius 6x6 grid + columnar transposition.",
    hint: "Locate coordinates on the ADFGVX grid defined in the Hut 99 Field Pamphlet.",
    pamphletKey: "adfgvx",
    isDilemma: false,
  },
  {
    number: 7,
    act: 2,
    year: 1950,
    title: "Cambridge Five / Philby",
    agency: "JOINT",
    cipherType: "Affine Cipher",
    storyText:
      "October 1950. Washington D.C. & London. Kim Philby sits as MI6 first secretary in Washington while secretly serving the KGB as part of the Cambridge Spy Ring. A intercepted diplomatic telegram exposes a high-level mole's designation.",
    ciphertext: "U Z I V L C Y",
    clue: "Affine Cipher: Decryption formula is D(y) = 21 * (y - 8) mod 26.",
    hint: "For each letter: convert to 0-25, subtract 8, multiply by 21, take modulo 26, and convert back to letter.",
    pamphletKey: "affine",
    isDilemma: false,
  },
  {
    number: 8,
    act: 2,
    year: 1954,
    title: "Operation Gold: Berlin Tunnel [DILEMMA]",
    agency: "UNIT 404",
    cipherType: "Straddling Checkerboard",
    storyText:
      "May 1954. Berlin-Altglienicke. The CIA and MI6 have tunneled 1,476 feet underneath the Soviet sector border to tap Soviet military underground telephone cables. But George Blake, a Soviet mole in MI6, has already informed Moscow. Unit 404 discovers the leak. Do you warn the CIA or spoof the wire?",
    ciphertext: "80 88 2 87 0 89 3 88 0",
    clue: "Straddling Checkerboard with Keyword 'SNOWY'. Numbers translate to English characters according to the Field Pamphlet matrix.",
    hint: "Use the Straddling Checkerboard table in the Pamphlet tab with top row empty for 8 and 9 escapes.",
    pamphletKey: "checkerboard",
    isDilemma: true,
    timerSeconds: 180,
    options: [
      {
        id: "A",
        title: "Alert CIA Station Chief",
        description:
          "Transmit an encrypted warning to CIA Berlin base. The CIA extracts key wire equipment before the Soviet 'accidental' discovery.",
        faction: "CIA",
        riskText: "Cover intact for now, but George Blake suspects a leak in Hut 99.",
      },
      {
        id: "B",
        title: "Spoof Soviet Wire Traffic",
        description:
          "Fabricate false radar telemetry down the tapped cable, feeding disinformation to both Moscow and Washington simultaneously.",
        faction: "KGB",
        riskText: "High risk: if detected by either side, Burn level increases immediately (+1).",
      },
    ],
  },
  {
    number: 9,
    act: 2,
    year: 1955,
    title: "Vienna Triple-Cross",
    agency: "JOINT",
    cipherType: "5-Bit Baudot XOR Teleprinter",
    storyText:
      "May 1955. Vienna Four-Power Occupation Sector. Austrian State Treaty negotiations are underway. A teletype teleprinter tape found in a café on the Ringstraße contains an encrypted 5-bit teleprinter stream XORed against an unknown station mask. Identify the master operational codename.",
    ciphertext: "Tape: 01111 10010 10101 01001 00001\nMask: 10101 10001 10011 10101 10101",
    clue: "Bitwise XOR the 5-bit chunks: Result = Tape XOR Mask. Match 5-bit patterns to the International Telegraph Alphabet No. 2 (ITA2 / Baudot table).",
    hint: "0 XOR 0 = 0, 1 XOR 1 = 0, 0 XOR 1 = 1. Look up each 5-bit result in the ITA2 alphabet chart.",
    pamphletKey: "baudot",
    isDilemma: false,
  },
  {
    number: 10,
    act: 2,
    year: 1956,
    title: "Budapest and Suez Crisis [DILEMMA 2]",
    agency: "UNIT 404",
    cipherType: "Rail Fence (2 Rails) + Autokey Primer",
    storyText:
      "November 1956. Soviet tanks enter Budapest to crush the Hungarian uprising while British, French, and Israeli troops invade the Suez Canal zone. The world hovers on the brink of nuclear exchange. Unit 404 must intercept the deployment directive.",
    ciphertext: "N N V D H F",
    clue: "2-Rail Fence transposition combined with a Caesar primer key of 'K' (shift 10).",
    hint: "Reconstruct the 2 rails (N V H on rail 1, N D F on rail 2 -> N N V D H F rearranged), then reverse the autokey/shift.",
    pamphletKey: "railfence",
    isDilemma: true,
    timerSeconds: 180,
    keyFragment: 9,
    options: [
      {
        id: "A1",
        title: "Sub-Branch A1: Incirlik U-2 Reconnaissance Base",
        description:
          "Provide tactical aerial radar corridor telemetry for high-altitude U-2 spy flights departing from Incirlik Air Base, Turkey over Soviet southern missile test sites.",
        faction: "CIA",
        riskText: "Soviet PVO radar tracks your radio beacon; Watched level +1.",
      },
      {
        id: "A2",
        title: "Sub-Branch A2: Moscow Armored Train Coup",
        description:
          "Redirect intercepted signals to dissidents near the Trans-Siberian rail link transporting rocket warheads.",
        faction: "CIA",
        riskText: "KGB counter-espionage sweeps threaten total blackout.",
      },
    ],
  },

  // ACT III: 1960 - 1962
  {
    number: 11,
    act: 3,
    year: 1960,
    title: "U-2 Shootdown Over Sverdlovsk",
    agency: "JOINT",
    cipherType: "2x2 Hill Cipher",
    storyText:
      "May 1, 1960. Sverdlovsk, USSR. Francis Gary Powers' CIA U-2 spy plane is struck by an SA-2 Guideline surface-to-air missile at 70,500 feet. Moscow conceals that Powers survived, baiting President Eisenhower into claiming it was a lost weather plane. Decrypt the pilot's captured identity manifest.",
    ciphertext: "JW AM BU",
    clue: "2x2 Matrix Hill Cipher mod 26. Inverse decryption matrix is K^-1 = [[15, 17], [20, 9]]. [P1, P2] = [C1, C2] * K^-1 mod 26.",
    hint: "Multiply each pair of letter numbers by the inverse matrix mod 26.",
    pamphletKey: "hill",
    isDilemma: false,
  },
  {
    number: 12,
    act: 3,
    year: 1961,
    title: "Penkovsky Microdots",
    agency: "MI6",
    cipherType: "Baconian Steganography",
    storyText:
      "August 1961. The Berlin Wall rises overnight. GRU Colonel Oleg Penkovsky (codename HERO) passes miniature microdot canisters concealed in cigarette boxes to Greville Wynne in Moscow. The text contains an innocuous diplomatic greeting hiding a 5-letter Baconian cipher.",
    ciphertext: "tHe quick BrOWn FOX juMps OVER tHe LAZy dOg sLeEpInG sOFTly",
    clue: "Baconian 5-bit alphabet: Bold / Uppercase = B, Normal / Lowercase = A. Group every 5 characters into a letter.",
    hint: "Extract every 5-letter binary sequence (AAAAA = A, AAAAB = B, etc.) from the capital and lowercase characters.",
    pamphletKey: "baconian",
    isDilemma: false,
  },
  {
    number: 13,
    act: 3,
    year: 1962,
    title: "Operation Anadyr",
    agency: "KGB",
    cipherType: "2-Round Feistel Network Block Cipher",
    storyText:
      "September 1962. Soviet freighters slip through the Bosporus into the Caribbean carrying medium-range R-12 Dvina nuclear ballistic missiles bound for San Cristóbal, Cuba. A 8-bit digital command key protects the launch telemetry.",
    ciphertext: "Ciphertext Block [L2, R2] = 1101 0110 | Round Keys: K2 = 1010, K1 = 0101 | Round function F(R, K) = R XOR K.",
    clue: "Feistel Decryption reverses the rounds: L_i-1 = R_i XOR F(L_i, K_i) and R_i-1 = L_i. Find initial 8-bit block [L0, R0].",
    hint: "Run the Feistel network in reverse for round 2 then round 1.",
    pamphletKey: "feistel",
    isDilemma: false,
  },
  {
    number: 14,
    act: 3,
    year: 1962,
    title: "Black Saturday / Submarine B-59 [ULTIMATE DILEMMA]",
    agency: "UNIT 404",
    cipherType: "Toy Public-Key RSA",
    storyText:
      "October 27, 1962. Sargasso Sea. Soviet Foxtrot submarine B-59 is trapped underwater under depth charge bombardment by US Navy destroyers. Out of radio contact and suffocating in 115°F heat, Captain Savitsky and Political Officer Maslennikov decide to launch a 10-kiloton nuclear torpedo. Only Brigade Chief of Staff Vasili Arkhipov dissents. Decrypt the override abort signal.",
    ciphertext: "C = [01, 29, 27, 06, 26] with Public Key (n=33, e=7)",
    clue: "Private key d = 3. Compute M = C^3 mod 33 for each value, then map M (1=A, 2=B, ... 26=Z) to letters.",
    hint: "01^3 mod 33 = 1 (A), 29^3 mod 33 = (-4)^3 = -64 = 2 (B)... decode the remaining values.",
    pamphletKey: "rsa",
    isDilemma: true,
    timerSeconds: 180,
    keyFragment: 5,
    options: [
      {
        id: "X",
        title: "Option X: The Martyr's Broadcast",
        description:
          "Broadcast the declassified abort cipher on open emergency maritime frequencies. Both the US fleet and Soviet sub hear the transmission, averting nuclear annihilation.",
        riskText: "Guarantees Unit 404's bunker location is pinpointed; the team will be captured.",
      },
      {
        id: "Y",
        title: "Option Y: Protocol Phantom",
        description:
          "Transmit encrypted spoof commands diverting both fleets while scrubbing all Unit 404 digital and physical traces.",
        riskText: "Unit 404 escapes underground to South America with forged passports and gold bars.",
      },
      {
        id: "Z",
        title: "Option Z: Dead Man's Switch",
        description:
          "Trigger a distributed telegraph burst leaking 19 years of treasonous CIA, MI6, and KGB intercepts directly to international newspapers.",
        riskText: "Complete geopolitical chaos; intelligence empires crumble worldwide.",
      },
    ],
  },
  {
    number: 15,
    act: 3,
    year: 1962,
    title: "The Master Key",
    agency: "UNIT 404",
    cipherType: "Gronsfeld Running Key + Atbash Inversion",
    storyText:
      "October 28, 1962. Hut 99 Master Vault. To complete Operation Janus, unlock your final fate, and purge the mainframe, you must assemble all four Master Key Fragments gathered across your journey (R1=7, R5=3, R10=9, R14=5). Subtract the key sequence [7, 3, 9, 5] repeatedly from the ciphertext, then apply the ancient Hebrew Atbash cipher inversion (A<->Z, B<->Y).",
    ciphertext: "A V U M   N X R A   C Z U S",
    clue: "Key sequence: [7, 3, 9, 5]. Step 1: Subtract digits (A=0..Z=25) with wrap-around. Step 2: Invert with Atbash (Z-x).",
    hint: "Combine the 4 fragments: 7-3-9-5. After subtraction, apply Atbash to reveal the final two words.",
    pamphletKey: "masterkey",
    isDilemma: false,
    timerSeconds: 300,
  },
];

export const LEVEL_VARIANTS: VariantDefinition[] = [
  {
    levelNumber: 6,
    branch: "A",
    storyText:
      "June 1948. Berlin Blockade (CIA Liaison Route). General Lucius D. Clay orders Operation Vittles: C-47 and C-54 Skytrains landing every 90 seconds at Tempelhof Airport. Decrypt the Allied operational supply callsign.",
    ciphertext: "AA DF GD DD DF AF DG XV",
    clue: "ADFGVX German Field Cipher with Allied keyword. Decrypt coordinates.",
  },
  {
    levelNumber: 6,
    branch: "B",
    storyText:
      "June 1948. Berlin Blockade (Soviet Sector Route). Marshal Sokolovsky orders electrical power to the Western sectors cut and rail junctions bolted. Decrypt the Soviet military garrison lockdown decree.",
    ciphertext: "AD FG AA DV XA AA DD AA",
    clue: "ADFGVX German Field Cipher with Soviet military grid coordinates.",
  },
  {
    levelNumber: 7,
    branch: "A",
    storyText:
      "October 1950. Cambridge Five / Philby (CIA Intercept). FBI Director J. Edgar Hoover suspects a high-ranking British diplomat in Washington. Decrypt the codename of Donald Maclean.",
    ciphertext: "U Z I V L C Y",
    clue: "Affine Cipher with D(y) = 21 * (y - 8) mod 26.",
  },
  {
    levelNumber: 7,
    branch: "B",
    storyText:
      "October 1950. Cambridge Five / Philby (KGB Moscow Liaison). Moscow Centre receives courier microfilms from Guy Burgess and Anthony Blunt. Decrypt the syndicate's academic origin.",
    ciphertext: "S I Q N P W X M C",
    clue: "Affine Cipher with D(y) = 21 * (y - 8) mod 26.",
  },
  {
    levelNumber: 10,
    branch: "B",
    storyText:
      "November 1956. Budapest and Suez (KGB Directorate Branch). Soviet 8th Mechanized Army mobilizes under General Zhukov along the Hungarian river crossings.",
    ciphertext: "N N V D H F",
    clue: "2-Rail Fence transposition with primer shift 'K'.",
  },
];

export const PAMPHLET_DOCS: Record<
  string,
  {
    title: string;
    subtitle: string;
    sections: { heading: string; content: string; visual?: string }[];
  }
> = {
  caesar: {
    title: "SECTION 01: CAESAR & ROTATION WHEELS",
    subtitle: "Bletchley Park Training Manual BP-43",
    sections: [
      {
        heading: "Operating Principles",
        content:
          "The Caesar shift advances or reverses each alphabetical character by a fixed numerical displacement 'k' along the 26-character Latin alphabet. In Operation Janus, null characters or spaces may be inserted to create 4-letter or 5-letter telegraph groups.",
        visual:
          "Plain:   A B C D E F G H I J K L M N O P Q R S T U V W X Y Z\nShift+3: D E F G H I J K L M N O P Q R S T U V W X Y Z A B C",
      },
      {
        heading: "Decryption Formula",
        content: "P_i = (C_i - k + 26) mod 26. When k = 3, 'Z' -> 'W', 'L' -> 'I', 'W' -> 'T'.",
      },
    ],
  },
  onetimepad: {
    title: "SECTION 02: ONE-TIME PADS & PROJECT VENONA",
    subtitle: "Arlington Hall Cryptanalysis Standard",
    sections: [
      {
        heading: "Mathematical Secrecy & Re-use Vulnerability",
        content:
          "A true One-Time Pad (Vernam cipher) is theoretically unbreakable if used once. If a sheet is reused, ciphertext subtraction between two intercepts eliminates the pad and reveals plaintext differences. Here: P_i = (C_i - Pad_i + 26) mod 26.",
        visual:
          "Letter Mapping (A=0 .. Z=25):\nA=00  B=01  C=02  D=03  E=04  F=05  G=06  H=07  I=08  J=09\nK=10  L=11  M=12  N=13  O=14  P=15  Q=16  R=17  S=18  T=19\nU=20  V=21  W=22  X=23  Y=24  Z=25",
      },
    ],
  },
  columnar: {
    title: "SECTION 03: COLUMNAR TRANSPOSITION",
    subtitle: "SOE Field Manual No. 12",
    sections: [
      {
        heading: "Geometric Reordering",
        content:
          "Plaintext characters are written horizontally into rows under a keyword. Columns are then extracted vertically according to the alphabetical order of the letters in the keyword.",
        visual:
          "Keyword: W A R P\nOrder:   4 1 3 2\nRow 1:   U N T H\nRow 2:   I N K A\nRow 3:   B L E J\nRow 4:   U L Y F\nRow 5:   I R S T\nRead col 1 (A): N N L L R\nRead col 2 (P): H A J F T\nRead col 3 (R): T K E Y S\nRead col 4 (W): U I B U I",
      },
    ],
  },
  vigenere: {
    title: "SECTION 04: THE VIGENÈRE CIPHER",
    subtitle: "Polyalphabetic Substitution Table",
    sections: [
      {
        heading: "Tabula Recta Operations",
        content:
          "Vigenère encryption shifts each plaintext character by the alphabetical index of the repeated keyword letter: C_i = (P_i + K_i) mod 26. To decipher: P_i = (C_i - K_i + 26) mod 26.",
        visual:
          "Plain:   A L P I N E R E D O U B T\nKey:     R O C K E T R O C K E T R\nCipher:  R Z R S R X I S F Y Y U K",
      },
    ],
  },
  playfair: {
    title: "SECTION 05: PLAYFAIR DIGRAPHIC SYSTEM",
    subtitle: "Hut 99 Polybius Field Matrix",
    sections: [
      {
        heading: "5x5 Grid Generation (TRINITY)",
        content:
          "Remove duplicates from keyword. Combine I/J into one cell. Fill remaining cells with untouched alphabet.",
        visual:
          "T  R  I  N  Y\nA  B  C  D  E\nF  G  H  K  L\nM  O  P  Q  S\nU  V  W  X  Z",
      },
      {
        heading: "Decryption Rules",
        content:
          "1. Same Row: Shift left cyclically.\n2. Same Column: Shift up cyclically.\n3. Rectangle: Swap columns while keeping original rows.\nExample: FA -> AT, PO -> OM, CH -> IC, PL -> SH, BE -> AD, PV -> OW => ATOMIC SHADOW.",
      },
    ],
  },
  adfgvx: {
    title: "SECTION 06: ADFGVX CIPHER",
    subtitle: "WWI/WWII German Army Radio Cryptosystem",
    sections: [
      {
        heading: "Grid Coordinates",
        content:
          "Uses coordinates A, D, F, G, V, X chosen specifically because Morse code transmissions of these six letters are acoustically distinct and difficult to garble over radio static.",
        visual:
          "      A   D   F   G   V   X\nA |   A   I   R   L   F   T\nD |   1   B   C   D   E   G\nF |   H   K   M   N   O   P\nG |   Q   S   U   V   W   X\nV |   Y   Z   0   2   3   4\nX |   5   6   7   8   9   J",
      },
    ],
  },
  affine: {
    title: "SECTION 07: AFFINE ARITHMETIC CIPHER",
    subtitle: "Modular Linear Transformation",
    sections: [
      {
        heading: "Decryption Congruence",
        content:
          "Ciphertext character y is mapped to plaintext x using: x = a^-1 * (y - b) mod 26.\nFor Unit 404 Intercept: D(y) = 21 * (y - 8) mod 26.",
        visual:
          "Letter 'U' (20): 21 * (20 - 8) = 21 * 12 = 252 = 9 * 26 + 18 -> S (18)\nLetter 'Z' (25): 21 * (25 - 8) = 21 * 17 = 357 = 13 * 26 + 19 -> T (19)\nLetter 'I' (8):  21 * (8 - 8) = 0 -> A (0)",
      },
    ],
  },
  checkerboard: {
    title: "SECTION 08: STRADDLING CHECKERBOARD",
    subtitle: "Soviet NKVD/KGB Illegals Grid",
    sections: [
      {
        heading: "Keyword SNOWY Matrix",
        content:
          "High-frequency letters occupy single digits. Escapes (digits 8 and 9) branch into 2-digit pairs.",
        visual:
          "      0  1  2  3  4  5  6  7  8  9\n      S  N     O        W  Y  -  -\n8 |   A  B  C  D  E  F  G  H  I  J\n9 |   K  L  M  P  Q  R  T  U  V  Z",
      },
      {
        heading: "Deconstruction Example",
        content:
          "80 -> B, 88 -> L, 2 -> A, 87 -> K, 0 -> E, 89 -> M, 3 -> O, 88 -> L, 0 -> E => BLAKE MOLE.",
      },
    ],
  },
  baudot: {
    title: "SECTION 09: 5-BIT BAUDOT / ITA2 XOR",
    subtitle: "Teletype Tape Cryptanalysis",
    sections: [
      {
        heading: "XOR Truth Table & ITA2 Code",
        content:
          "Compare bits: 0^0=0, 1^1=0, 0^1=1, 1^0=1. Then look up letter in ITA2 code table.",
        visual:
          "Tape: 01111  10010  10101  01001  00001\nMask: 10101  10001  10011  10101  10101\nXOR:  11010  00011  00110  11100  10100\nITA2: J (11010), A (00011), N (00110), U (11100), S (10100) => JANUS",
      },
    ],
  },
  railfence: {
    title: "SECTION 10: RAIL FENCE + AUTOKEY",
    subtitle: "Zig-Zag Spatial Transposition",
    sections: [
      {
        heading: "2-Rail Structure",
        content:
          "Write letters in alternating zig-zag across 2 rails, read off rail 1 then rail 2. Combined with Caesar autokey primer K.",
        visual:
          "Rail 1: D . N . B .\nRail 2: . A . U . E\nInterleave: D A N U B E",
      },
    ],
  },
  hill: {
    title: "SECTION 11: 2X2 HILL CIPHER",
    subtitle: "Lester Hill Linear Algebra System",
    sections: [
      {
        heading: "Matrix Multiplication mod 26",
        content:
          "Plaintext vector P = C * K^-1 mod 26.\nInverse Matrix K^-1 = [[15, 17], [20, 9]].",
        visual:
          "[J, W] = [9, 22]\n[9, 22] * [[15, 17], [20, 9]] = [135+440, 153+198] = [575, 351] mod 26 = [15, 13] = [P, O] -> PO\n[A, M] = [0, 12] -> WE\n[B, U] = [1, 20] -> RS\nPlaintext: POWERS",
      },
    ],
  },
  baconian: {
    title: "SECTION 12: BACONIAN STEGANOGRAPHY",
    subtitle: "Francis Bacon 5-Bit Biliteral Cipher",
    sections: [
      {
        heading: "Font Weight Encoding",
        content:
          "Lowercase = A, Uppercase = B. Every 5 characters map to one letter.",
        visual:
          "A = AAAAA  B = AAAAB  C = AAABA  D = AAABB  E = AABAA\nF = AABAB  G = AABBA  H = AABBB  I/J = ABAAA  K = ABAAB\nL = ABABA  M = ABABB  N = ABBAA  O = ABBAB  P = ABBBA\nQ = ABBBB  R = BAAAA  S = BAAAB  T = BAABA  U/V = BAABB\nW = BABAA  X = BABAB  Y = BABBA  Z = BABBB\nSequence: ABBAB (O), ABABB (M), AABAA (E), AABBA (G), AAAAA (A) => OMEGA",
      },
    ],
  },
  feistel: {
    title: "SECTION 13: 2-ROUND FEISTEL CIPHER",
    subtitle: "Horst Feistel Modern Block Architecture",
    sections: [
      {
        heading: "Feistel Network Decryption",
        content:
          "Given [L2, R2] = [1101, 0110], K2 = 1010, K1 = 0101, F(R, K) = R XOR K.\nRound 1 Reverse: L1 = R2 = 0110; R1 = L2 XOR F(L1, K2) = 1101 XOR (0110 XOR 1010) = 1101 XOR 1100 = 0001.\nRound 0 Reverse: L0 = R1 = 0001; R0 = L1 XOR F(L0, K1) = 0110 XOR (0001 XOR 0101) = 0110 XOR 0100 = 0010.\nResult: 01101000",
      },
    ],
  },
  rsa: {
    title: "SECTION 14: TOY RSA PUBLIC KEY",
    subtitle: "Rivest-Shamir-Adleman Asymmetric Cryptosystem",
    sections: [
      {
        heading: "Parameters & Trapdoor Exponentiation",
        content:
          "Modulus n = 33, p = 3, q = 11, phi(n) = 20. Public key e = 7. Private exponent d = 3 (since 7*3 = 21 = 1 mod 20).\nDecryption: M = C^d mod n = C^3 mod 33.",
        visual:
          "C=01: 1^3 mod 33 = 1 -> A\nC=29: 29 = -4 mod 33. (-4)^3 = -64 = 2 mod 33 -> B\nC=27: 27 = -6 mod 33. (-6)^3 = -216 = 15 mod 33 -> O\nC=06: 6^3 = 216 = 18 mod 33 -> R\nC=26: 26 = -7 mod 33. (-7)^3 = -343 = 20 mod 33 -> T\nResult: ABORT",
      },
    ],
  },
  masterkey: {
    title: "SECTION 15: MASTER KEY ASSEMBLY",
    subtitle: "Gronsfeld De-indexing & Atbash Inversion",
    sections: [
      {
        heading: "Execution Protocol",
        content:
          "1. Key Ring Sequence: [7, 3, 9, 5] repeated.\n2. Gronsfeld Shift: Subtract key digits mod 26 from Ciphertext [A V U M N X R A C Z U S].\n3. Atbash Mirror: Replace each resulting letter with its alphabet opposite (A<->Z, B<->Y, etc.).",
        visual:
          "Cipher: A  V  U  M    N  X  R  A    C  Z  U  S\nSub:    7  3  9  5    7  3  9  5    7  3  9  5\nAtbash: T  S  L  H    G  U  I  V    V  W  L  N\nMirror: G  H  O  S    T  F  R  E    E  D  O  M\nResult: GHOST FREEDOM",
      },
    ],
  },
};
