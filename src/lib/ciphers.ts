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
    clue: "[Target: Caesar Cipher, Shift = 3 ('HUT')] Et tu, Brute? The Emperor falls, yet his legions still march backward by the exact number of letters in the humble shelter where we are currently locked.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: Reused One-Time Pad, Row 4 Subtraction Mod 26] A spy's diary is meant to be burned after a single page, yet a lazy clerk in New York committed the cardinal sin of using the fourth line twice. Strip away that fourth shadow from the message, and let the 26 soldiers of the alphabet loop back where they began.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: Columnar Transposition, Keyword 'WARP'] The weavers of Yalta did not change a single letter—they merely twisted and bent the fabric of space into four vertical pillars. Stand the pillars up in the WARP of their alphabetical rank to read what was written across.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: Vigenère Cipher, Keyword 'ROCKET'] The French diplomat Blaise called his polyalphabetic table 'indecipherable,' yet the key to unlocking it is roaring straight into the stratosphere above Peenemünde on a column of fire and liquid oxygen.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: Playfair Cipher, Keyword 'TRINITY'] Lord Lyon’s Victorian parlor game demands you play fair and hunt in pairs across a five-by-five chessboard where I and J share a single bunk. Your cornerstone is the Three-in-One desert test that birthed the atomic age. ACT II: SHADOWS OF IRON (1948–1956)",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: ADFGVX 6x6 Grid Cipher] Six letters from the Kaiser’s old Western Front trenches—chosen only because their Morse dots and dashes never blur—now mark the latitude and longitude of a six-by-six radar screen over divided Berlin.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: Affine Cipher, $D(y) = 21(y - 8) \pmod{26}$] A straight line in algebra has both a slope and an intercept. First, take eight steps back from the precipice, then multiply your stride by twenty-one before the twenty-six-hour clock resets.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: Straddling Checkerboard, Keyword 'SNOWY'] To hide inside the Berlin tunnel, the Moscow Victor straddles uneven ground—some agents travel as lone digits, while others walk in two-digit pairs beneath a white, frostbitten winter sky.",
    hint: "Check with Physival Pamphlet",
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
    ciphertext: "Tape: 01110 10100 11011 11001 10110 \nMask: 10101 10101 10101 10101 10101",
    clue: "[Target: 5-Bit Baudot / ITA2 XOR]Émile’s teleprinter speaks only in punched holes of five. Hold the intercepted paper tape up against the mask: where both match, darkness falls (0); where they differ, light shines through (1). Once the five characters emerge, shift the last four from letters to figures along the top row of your keyboard to find the exact Room, Column, Row, and Chair where the courier taped the microdot.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: 2-Rail Fence + Autokey/Primer 'K'] Split the regiment into two alternating zig-zag tracks along the iron railway; once the train is reassembled, the eleventh letter of the alphabet holds the self-generating key where each unmasked word unlocks the next. ACT III: THIRTEEN DAYS TO MIDNIGHT (1960–1962)",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: 2x2 Hill Matrix Cipher]Lester’s two-by-two grid of linear algebra climbs a steep Hill. You cannot divide a matrix to descend—you must multiply the twin vectors by its inverted shadow locked inside your avionics manual.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: 5-Bit Baconian Steganography] Sir Francis hid treason in plain sight—not in what the words say, but in how the ink is dressed. Separate the humble from the bold in handfuls of five to read the secret between the lines.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: 2-Round Feistel Network] Horst’s split-brain machine swaps left and right at every turn of the lock. To disarm the warhead, walk backward through the two rounds, folding the right half through the key-gate to unmask the left.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: RSA Public-Key Prototype, $d=3, n=33$] Three mathematicians built a one-way trapdoor out of twin prime numbers (3 and 11). Raise each intercepted signal to the power of the third trident, and keep only what remains after thirty-three fathoms.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: Gronsfeld (4-Key Subtraction) + Atbash Mirror] First, step backward through the four echoes of your own history that you gathered along the way; then gaze into the ancient Hebrew mirror where the first becomes the last and Alpha trades places with Omega.",
    hint: "Check with Physival Pamphlet",
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
    clue: "[Target: ADFGVX 6x6 Grid Cipher] Six letters from the Kaiser’s old Western Front trenches—chosen only because their Morse dots and dashes never blur—now mark the latitude and longitude of a six-by-six radar screen over divided Berlin.",
  },
  {
    levelNumber: 6,
    branch: "B",
    storyText:
      "June 1948. Berlin Blockade (Soviet Sector Route). Marshal Sokolovsky orders electrical power to the Western sectors cut and rail junctions bolted. Decrypt the Soviet military garrison lockdown decree.",
    ciphertext: "AD FG AA DV XA AA DD AA",
    clue: "[Target: ADFGVX 6x6 Grid Cipher] Six letters from the Kaiser’s old Western Front trenches—chosen only because their Morse dots and dashes never blur—now mark the latitude and longitude of a six-by-six radar screen over divided Berlin.",
  },
  {
    levelNumber: 7,
    branch: "A",
    storyText:
      "October 1950. Cambridge Five / Philby (CIA Intercept). FBI Director J. Edgar Hoover suspects a high-ranking British diplomat in Washington. Decrypt the codename of Donald Maclean.",
    ciphertext: "U Z I V L C Y",
    clue: "[Target: Affine Cipher, $D(y) = 21(y - 8) \pmod{26}$] A straight line in algebra has both a slope and an intercept. First, take eight steps back from the precipice, then multiply your stride by twenty-one before the twenty-six-hour clock resets.",
  },
  {
    levelNumber: 7,
    branch: "B",
    storyText:
      "October 1950. Cambridge Five / Philby (KGB Moscow Liaison). Moscow Centre receives courier microfilms from Guy Burgess and Anthony Blunt. Decrypt the syndicate's academic origin.",
    ciphertext: "S I Q N P W X M C",
    clue: "[Target: Affine Cipher, $D(y) = 21(y - 8) \pmod{26}$] A straight line in algebra has both a slope and an intercept. First, take eight steps back from the precipice, then multiply your stride by twenty-one before the twenty-six-hour clock resets.",
  },
  {
    levelNumber: 10,
    branch: "B",
    storyText:
      "November 1956. Budapest and Suez (KGB Directorate Branch). Soviet 8th Mechanized Army mobilizes under General Zhukov along the Hungarian river crossings.",
    ciphertext: "N N V D H F",
    clue: "[Target: 2-Rail Fence + Autokey/Primer 'K'] Split the regiment into two alternating zig-zag tracks along the iron railway; once the train is reassembled, the eleventh letter of the alphabet holds the self-generating key where each unmasked word unlocks the next. ACT III: THIRTEEN DAYS TO MIDNIGHT(1960–1962)",
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
        heading: "ROUND 1 BRIEFING — THE DOCTORED KURSK INTERCEPT (JULY 1943)",
        content:
          "Your first night in Hut 99 begins as German Lorenz teleprinter traffic pours in from the Eastern Front. Nazi Panzer divisions are massing at Kursk to crush the Soviet Red Army. Your team breaks the outer layer of the German dispatch in minutes—but as the British relay clerk prepares the wire for Moscow, you notice a secondary encrypted appendix attached by MI6 headquarters in London. Before this intelligence leaves the room, you need to know what your British captors are hiding from their Soviet allies.",
        visual:
          "",
      },
    ],
  },
  onetimepad: {
    title: "SECTION 02: ONE-TIME PADS & PROJECT VENONA",
    subtitle: "Arlington Hall Cryptanalysis Standard",
    sections: [
      {
        heading: "ROUND 2 BRIEFING — PROJECT VENONA'S FIRST GHOST (FEBRUARY 1944)",
        content:
          "Word of your team's speed has leaked beyond British intelligence. At 03:00 hours, while Commander Vance is asleep, an American OSS liaison bribes the corridor guard and slips a damp manila envelope under your door. Inside is a top-secret cable intercepted from the Soviet Consulate in New York. London doesn't know we have this, the American whispers through the iron grate. Stalin has a mole inside a classified US weapons facility in the New Mexico desert. Crack this cable for Washington, and when the time comes, America will remember who its friends are.",
        visual:
          "",
      },
    ],
  },
  columnar: {
    title: "SECTION 03: COLUMNAR TRANSPOSITION",
    subtitle: "SOE Field Manual No. 12",
    sections: [
      {
        heading: "ROUND 3 BRIEFING — YALTA & OPERATION UNTHINKABLE (MARCH 1945)",
        content:
          "The newspapers show Roosevelt, Churchill, and Stalin smiling side-by-side at Yalta, toasting the imminent defeat of Nazi Germany. Down in Hut 99, the atmosphere is freezing. Commander Vance locks the door from the inside and orders your team to process a Eyes Only cabinet file direct from 10 Downing Street. Ten minutes later, a janitor brushes past your desk and drops a folded matchbook into your lap. Scrawled inside in Russian ink is a chilling warning from the Soviet NKVD: We have your real names and your prison dossiers. Tell us what Churchill is planning for July, or we hand your files to the hangman.",
        visual:
          "",
      },
    ],
  },
  vigenere: {
    title: "SECTION 04: THE VIGENÈRE CIPHER",
    subtitle: "Polyalphabetic Substitution Table",
    sections: [
      {
        heading: "ROUND 4 BRIEFING — THE BLOODHOUND RACE: OPERATION PAPERCLIP (MAY 1945)",
        content:
          "Berlin has fallen, and the Allied alliance is disintegrating in the rubble. Across ruined Bavaria, American OSS strike teams and Soviet NKVD squads are hunting down Nazi rocket engineers and cryptographers—and shooting at each other in dark alleys to capture them first. Both your American night-visitor and your Soviet contact are hammering your terminal simultaneously. A high-ranking German cipher unit has barricaded itself inside an Alpine fortress with next-generation encryption prototypes. Whichever superpower decodes their location first takes the prize.",
        visual:
          "",
      },
    ],
  },
  playfair: {
    title: "SECTION 05: PLAYFAIR DIGRAPHIC SYSTEM",
    subtitle: "Hut 99 Polybius Field Matrix",
    sections: [
      {
        heading: "ROUND 5 BRIEFING [DILEMMA 1] — THE KLAUS FUCHS ATOMIC LEAK (AUGUST 1945)",
        content:
          "[!] SIREN ALERT: PERIMETER BREACH IN 180 SECONDS The atomic age has begun, and your double game has just collapsed. While tracing Manhattan Project leaks, your terminal unmasks British physicist Klaus Fuchs, who is actively transmitting the plutonium implosion blueprints for the Nagasaki bomb to Moscow. At that exact moment, red alarm bulbs begin spinning across Hut 99. Commander Vance has discovered that your team has been passing secrets to both American and Soviet agents. British Military Police are marching down the stairwell with orders to liquidate Unit 404 and burn the room.You have 180 seconds to decrypt the emergency extraction passcode and choose who saves you—and how history unfolds: Consequences of Option A (The Langley Pact — Expose Fuchs to the CIA): You transmit Klaus Fuchs's identity to the Americans. An OSS extraction team blows open the ventilation shaft and flies you to Washington, D.C., granting you American cover identities. However, the Soviet Union loses its atomic spy, and the KGB places your entire team on its #1 global assassination list.Consequences of Option B (The Lubyanka Gambit — Protect the Soviet Leak): You corrupt the British trace logs so Fuchs's nuclear blueprints safely reach Moscow, ensuring no single superpower holds an atomic monopoly. A Soviet submarine extracts your team off the Scottish coast. However, the newly formed CIA brands you traitors to the Western world and launches a relentless global manhunt to capture you.",
visual:
          "",
      },
    ],
  },
  adfgvx: {
    title: "SECTION 06: ADFGVX CIPHER",
    subtitle: "WWI/WWII German Army Radio Cryptosystem",
    sections: [
      {
        heading: "ROUND 6 BRIEFING — THE BERLIN BLOCKADE (JUNE 1948)",
        content:
          "If on Branch A (CIA Handler — West Berlin): Three years have passed. Your team now operates out of a covert CIA listening post at Tempelhof Airport in West Berlin. Stalin has blockaded the city, and Western cargo planes are the only lifeline keeping two million people alive. Suddenly, your radar cipher scrambles—you realize a Soviet mole inside your own West Berlin station is leaking your fake American aliases back to Moscow.If on Branch B (KGB Handler — East Berlin): Three years have passed. Your team operates out of a heavily guarded KGB signals compound in East Berlin, tasked with jamming Western airlift radar corridors. Mid-shift, you intercept a classified CIA counter-intelligence packet from London—American agents have excavated the ashes of Hut 99 and recovered your original 1943 handwriting samples.",
        visual:
          "",
      },
    ],
  },
  affine: {
    title: "SECTION 07: AFFINE ARITHMETIC CIPHER",
    subtitle: "Modular Linear Transformation",
    sections: [
      {
        heading: "ROUND 7 BRIEFING — THE CAMBRIDGE FIVE & KIM PHILBY (NOVEMBER 1950)",
        content:
          "If on Branch A (CIA Handler): Senior British intelligence liaison Harold Kim Philby arrives in Washington to inspect your cryptanalysis unit. While cross-referencing Korean War troop leaks, your blood runs cold: Philby is the Soviet master spy at the heart of Western intelligence. Worse, Philby recognizes your faces from Bletchley Park. He leans over your desk with a polite smile: Erase my codename from that decrypted log before the FBI sees it, or Ill tell the CIA Director what you really did for the Russians in 1944.If on Branch B (KGB Handler): Your Kremlin supervisor orders an urgent extraction of a dead-drop cipher left by Moscows prized mole in Washington, Kim Philby. As you begin decoding the drop, you spot a mathematical anomaly planted inside the keystream—CIA Counterintelligence Chief James Angleton has rigged Philbys message with a cryptographic trace designed to pinpoint your teams exact room in Moscow.",
        visual:
          "",
      },
    ],
  },
  checkerboard: {
    title: "SECTION 08: STRADDLING CHECKERBOARD",
    subtitle: "Soviet NKVD/KGB Illegals Grid",
    sections: [
      {
        heading: "ROUND 8 BRIEFING [MID-ACT DILEMMA] — OPERATION GOLD: THE BERLIN TUNNEL (APRIL 1954).",
        content:
          "[!] WIRE COMPROMISED: 120-SECOND DECISION WINDOW Twenty feet beneath the border of East and West Berlin, CIA and MI6 engineers have dug a secret tunnel to tap directly into Soviet military landlines. What the West doesn't know is that British double agent George Blake betrayed the tunnel to the KGB before a single wire was spliced. As your team monitors the live underground audio stream, a high-priority canary trap packet crosses the wire—and embedded inside the metadata are your team's real birth names.\nOnce you crack the cipher, you have 120 seconds to react before the recording tape reaches headquarters:\n Consequences of Option A (Blow the Whistle / Alert Command): You expose the tunnel betrayal immediately, saving dozens of field agents on the ground from capture. However, your superiors become deeply suspicious of how you recognized the trap so fast—raising your Burn Meter to WATCHED and placing internal security guards outside your door.\nConsequences of Option B (Spoof the Wire / Self-Preservation): You silently overwrite the packet on the live tape, erasing your names and keeping your cover pristine. However, dozens of field operatives walk blind into an ambush that night, and the surviving agents swear vengeance on whoever doctored the tape./n",
        visual:
          "",
      },
    ],
  },
  baudot: {
    title: "SECTION 09: 5-BIT BAUDOT / ITA2 XOR",
    subtitle: "Teletype Tape Cryptanalysis",
    sections: [
      {
        heading: "ROUND 9 BRIEFING — THE VIENNA TRIPLE-CROSS (MAY 1955)",
        content:
          "Neutral Vienna is a city of shadows, and your luck has finally run out. While meeting an informant at Café Central, agents from the rival superpower you betrayed in 1945 slide into the booth on either side of you. Under the tablecloth, silenced pistols are pressed against your ribs. On the table, they lay photographs of your families and your original Bletchley Park prison files. They don't want to kill you today—they want to turn you. To walk out of the café alive, you must become triple agents, engineering a dual-layered Baudot tape transmission that satisfies both Washington and Moscow simultaneously.",
        visual:
          "",
      },
    ],
  },
  railfence: {
    title: "Section 10: RAIL FENCE CIPHER",
    subtitle: "Zig-Zag Spatial Transposition",
    sections: [
      {
        heading: "ROUND 10 BRIEFING [DILEMMA 2] — BLOOD IN BUDAPEST & THE SUEZ SIEGE (NOVEMBER 1956)",
        content:
          "\nThe world is on fire. Soviet tanks are rolling through the streets of Budapest while British and French paratroopers drop over the Suez Canal. Amid the global chaos, CIA and KGB forensic cryptanalysts compare intercepted cables from Vienna and make a fatal discovery: the exact same mathematical fingerprint appears on top-secret traffic on both sides of the Iron Curtain. \nBoth superpowers now know Unit 404 has been playing them against each other. Spotlights flood your Vienna safe house windows, and armored cars block both ends of the street. You have 180 seconds to decode the underground sewer route to the Danube river and lock in your Act III survival strategy: \nConsequences of Option A (Deep Black / Western Defection — Branches A1 & B1): You frame your local station chief for the Vienna leaks, detonate thermite charges over your cipher machines, and flee west to an ultra-classified American U-2 reconnaissance base. You enter the final act inside the Western Command Bunker, armed with NATOs highest clearance—but hunted by KGB wetwork squads who know your every move. \nConsequences of Option B (Kremlin Purge / Eastern Defection — Branches A2 & B2): You burn your Western contacts, forge a treason dossier against your KGB rivals, and board a sealed diplomatic courier plane to the Soviet Signals Directorate in Havana. You enter the final act inside the Eastern Command Bunker, holding Soviet launch authority—while CIA assassination teams close in on your perimeter.",
        visual:
          "",
      },
    ],
  },
  hill: {
    title: "SECTION 11: 2X2 HILL CIPHER",
    subtitle: "Lester Hill Linear Algebra System",
    sections: [
      {
        heading: "Round 11 BRIEFING — THE U-2 SHOOTDOWN TELEMETRY (MAY 1960)",
        content:
          "Seventy thousand feet above Sverdlovsk, an American U-2 spy plane piloted by Francis Gary Powers is blown out of the sky by a Soviet surface-to-air missile. Most of the aircraft is destroyed—except for a black-box cryptographic transponder in the tail section that your team personally designed during Act II. Whether you are currently sitting in a CIA bunker or a KGB facility, that transponder contains a hard-coded calibration matrix linking back to your Vienna triple-cross. If forensic analysts crack the crash telemetry before you do, your cover is dead. You must intercept the raw vectors and wipe your signature first.",
        visual:
          "",
      },
    ],
  },
  baconian: {
    title: "SECTION 12: BACONIAN STEGANOGRAPHY",
    subtitle: "Francis Bacon 5-Bit Biliteral Cipher",
    sections: [
      {
        heading: "ROUND 12 BRIEFING — THE PENKOVSKY MICRODOTS & PROJECT JANUS (AUGUST 1961)",
        content:
          "As East German troops roll out barbed wire to erect the Berlin Wall overnight, Soviet military intelligence Colonel Oleg Penkovsky risks his life to smuggle microscopic film dots to the West. Your team is assigned to decode a seemingly mundane trade letter hiding Penkovsky's steganographic message. Halfway through the decryption, the room goes dead silent. Attached to the military intelligence is a classified joint memorandum titled PROJECT JANUS: Washington and Moscow have quietly agreed on one thing—Unit 404 knows too many dirty secrets from World War II and the Cold War. A joint CIA-KGB liquidation squad has been authorized to eliminate your team the moment the current crisis ends.",
        visual:
          "",
      },
    ],
  },
  feistel: {
    title: "SECTION 13: 2-ROUND FEISTEL CIPHER",
    subtitle: "Horst Feistel Modern Block Architecture",
    sections: [
      {
        heading: "ROUND 13 BRIEFING — OPERATION ANADYR: MISSILES IN CUBA ",
        content:
          " For the first time in human history, strategic nuclear bombers are airborne around the clock and Soviet medium-range ballistic missiles are armed on launchpads in Cuba, ninety miles off the coast of Florida. Inside your subterranean command bunker, you hear the unmistakable sound of heavy arc-welders outside the blast doors. Internal security guards—following the Project Janus liquidation order—are sealing your team inside the room so you can finish decoding the incoming Cuban blockade traffic before they flood the chamber. You must crack the Feistel block cipher to override the bunker's internal life-support and comms lock.",
        visual:
          "",
      },
    ],
  },
  rsa: {
    title: "SECTION 14: TOY RSA PUBLIC KEY",
    subtitle: "Rivest-Shamir-Adleman Asymmetric Cryptosystem",
    sections: [
      {
        heading: "ROUND 14 BRIEFING [THE ULTIMATE DILEMMA] — BLACK SATURDAY & SUBMARINE B-59 ",
        content:
          "It is \"Black Saturday\"—the darkest hour of the Cold War. In the Atlantic waters off Cuba, US Navy destroyers are dropping signaling depth charges onto nuclear-armed Soviet submarine B-59. Cut off from Moscow radio contact and sweltering in 120-degree heat, the submarine's captain believes World War III has already started and orders a 10-kiloton nuclear torpedo loaded into Tube 1. Only Second Captain Vasili Arkhipov refuses to turn his launch key, desperately waiting for an authenticated stand-down signal.\n At the exact same second, shaped charges detonate against your outer bunker doors—the joint CIA-KGB hit squad is breaching. Your high-power transmitter has enough capacitor charge for one final broadcast after you decrypt the RSA abort stream:\nConsequences of Option X (The Martyr's Broadcast — Save Humanity, Sacrifice Unit 404): You divert 100% of your terminal's power to relay the authenticated stand-down order directly to Arkhipov aboard Submarine B-59 and verify Khrushchev's peace cable. You stop a nuclear war that would have killed 100 million people—but you leave your bunker blast doors unpowered, guaranteeing the strike team captures your cell in the final round. \nConsequences of Option Y (Protocol Phantom — The Chaos Escape): You inject a forged radar telemetry packet simulating a rogue missile track over the Bering Strait. Both the Pentagon and the Kremlin are thrown into ten minutes of blind panic—automatically unlocking all emergency drainage hatches and allowing your team to vanish into the night toward South America, gambling with the survival of civilization to buy your freedom. \nConsequences of Option Z (The Dead Man's Switch — Global Blackmail): You transmit the B-59 abort code alongside an encrypted master archive directed to the printing presses of The New York Times, Le Monde, and Pravda—containing every war crime, doctored Kursk map, Operation Unthinkable file, and assassination order committed by MI6, the CIA, and the KGB since 1943. If a single member of your team is harmed in the next five minutes, the world learns everything.",
        visual:
          "",
      },
    ],
  },
  masterkey: {
    title: "SECTION 15: MASTER KEY ASSEMBLY",
    subtitle: "Gronsfeld De-indexing & Atbash Inversion",
    sections: [
      {
        heading: "ROUND 15 BRIEFING — THE MASTER KEY: DOOMSDAY OVERRIDE (OCTOBER 28, 1962)",
        content:
          "\n[!] FINAL BOSS ROUND: 300 SECONDS TO DETONATION / BREACH\n\nSparks shower from the bunker ceiling as the outer steel door buckles inward. The red rotary phone on your desk is ringing off the hook. To execute the final protocol you locked in during Round 14, the terminal demands the Janus Master Core Override. There are no hints left from headquarters—you must reach back across nineteen years of espionage (1943–1962), combine the four Master Key digits you collected in Rounds 1, 5, 10, and 14, and shatter the final two-stage cipher before the clock hits zero.\n\nEPILOGUE — AFTER ROUND 15: DECLASSIFIED CLOSING NOTES(The website displays one of these three cinematic endings based on the team's Round 14–15 execution):\n\nENDING X: THE UNWRITTEN HEROES (If Option X Was Chosen\n\nOCTOBER 28, 1962 — 09:00 HOURSAboard Submarine B-59, Vasili Arkhipov receives your decrypted transmission by a margin of eleven seconds. The nuclear torpedo is disarmed, the ships turn back, and the world breathes again.\n\nWhen the CIA-KGB strike team blows open your bunker door, they find your terminal wiped clean and your team sitting calmly at the table. Because you prevented a nuclear exchange that neither Washington nor Moscow truly wanted, the Directors quietly cancel your execution order. You spend the rest of your lives under benign house arrest in a quiet Swiss mountain village—nameless, forgotten by the history books, yet knowing that every sunrise the world sees belongs to Unit 404.\n\nENDING Y: GHOSTS OF THE SOUTHERN CROSS (If Option Y Was Chosen)\n\nOCTOBER 28, 1962 — 09:00 HOURS Your forged Bering Strait radar ghost throws NORAD and the Soviet General Staff into seven minutes of total paralysis. In the confusion, the automated bunker lockdown resets. By the time the joint liquidation squad breaches the steel door, the room is empty save for five smoldering cigarettes and a spinning reel of magnetic tape.\n\nSubmarine B-59 surfaces on its own after battery depletion, narrowly avoiding war without you. Six weeks later, five strangers with clean diplomatic passports clink glasses at a seaside café in Buenos Aires. You survived World War II, outsmarted three empires, and walked away into the shadows.\n\nENDING Z: THE FOURTH SUPERPOWER (If Option Z Was Chosen\n\nOCTOBER 28, 1962 — 09:00 HOURSThe strike team kicks open the bunker door with rifles raised—only to freeze as their commanders radio crackles urgently. The Directors of MI6, the CIA, and the KGB are all on the line at once with a single screamed order: \"STAND DOWN! DO NOT TOUCH THEM!\"\n\n Your Dead Mans Switch is live on satellites and telegraph relays across four continents. Every dirty secret from 1943 to 1962 is locked behind your heartbeat. The soldiers lower their weapons and step aside. You pick up your coats, walk past the most powerful intelligence agencies on Earth, and step out into the morning sun—no longer prisoners, no longer pawns, but untouchable.",
        visual:
          "",
      },
    ],
  },
};
