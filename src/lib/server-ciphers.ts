import crypto from 'node:crypto';

export function normalizeAnswer(ans: string): string {
  return ans.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function hashAnswer(ans: string): string {
  return crypto.createHash('sha256').update(normalizeAnswer(ans)).digest('hex');
}

export interface ServerLevelAnswer {
  number: number;
  answerHash: string;
  acceptedVariants: string[];
}

export interface ServerVariantAnswer {
  levelNumber: number;
  branch: string;
  answerHash: string;
  acceptedVariants: string[];
}

export const SERVER_LEVEL_ANSWERS: ServerLevelAnswer[] = [
  {
    number: 1,
    answerHash: hashAnswer("WITHHOLD PANZER ROUTES FROM STALIN"),
    acceptedVariants: [
      normalizeAnswer("WITHHOLD PANZER ROUTES FROM STALIN"),
      normalizeAnswer("WITHHOLD PANZER ROUTES"),
    ],
  },
  {
    number: 2,
    answerHash: hashAnswer("ENORMOZ"),
    acceptedVariants: [normalizeAnswer("ENORMOZ")],
  },
  {
    number: 3,
    answerHash: hashAnswer("UNTHINKABLE JULY FIRST"),
    acceptedVariants: [
      normalizeAnswer("UNTHINKABLE JULY FIRST"),
      normalizeAnswer("UNTHINKABLEJULYFIRST"),
    ],
  },
  {
    number: 4,
    answerHash: hashAnswer("ALPINE REDOUBT"),
    acceptedVariants: [
      normalizeAnswer("ALPINE REDOUBT"),
      normalizeAnswer("ALPINEREDOUBT"),
    ],
  },
  {
    number: 5,
    answerHash: hashAnswer("ATOMIC SHADOW"),
    acceptedVariants: [
      normalizeAnswer("ATOMIC SHADOW"),
      normalizeAnswer("ATOMICSHADOW"),
    ],
  },
  {
    number: 6,
    answerHash: hashAnswer("AIRLIFT1"),
    acceptedVariants: [normalizeAnswer("AIRLIFT1"), normalizeAnswer("AIRLIFT")],
  },
  {
    number: 7,
    answerHash: hashAnswer("STANLEY"),
    acceptedVariants: [normalizeAnswer("STANLEY")],
  },
  {
    number: 8,
    answerHash: hashAnswer("BLAKE MOLE"),
    acceptedVariants: [normalizeAnswer("BLAKE MOLE"), normalizeAnswer("BLAKEMOLE")],
  },
  {
    number: 9,
    answerHash: hashAnswer("JANUS"),
    acceptedVariants: [normalizeAnswer("JANUS")],
  },
  {
    number: 10,
    answerHash: hashAnswer("DANUBE"),
    acceptedVariants: [normalizeAnswer("DANUBE")],
  },
  {
    number: 11,
    answerHash: hashAnswer("POWERS"),
    acceptedVariants: [normalizeAnswer("POWERS")],
  },
  {
    number: 12,
    answerHash: hashAnswer("OMEGA"),
    acceptedVariants: [normalizeAnswer("OMEGA")],
  },
  {
    number: 13,
    answerHash: hashAnswer("01101000"),
    acceptedVariants: [normalizeAnswer("01101000"), normalizeAnswer("0110 1000")],
  },
  {
    number: 14,
    answerHash: hashAnswer("ABORT"),
    acceptedVariants: [normalizeAnswer("ABORT")],
  },
  {
    number: 15,
    answerHash: hashAnswer("GHOST FREEDOM"),
    acceptedVariants: [
      normalizeAnswer("GHOST FREEDOM"),
      normalizeAnswer("GHOSTFREEDOM"),
    ],
  },
];

export const SERVER_VARIANT_ANSWERS: ServerVariantAnswer[] = [
  {
    levelNumber: 6,
    branch: "A",
    answerHash: hashAnswer("AIRLIFT1"),
    acceptedVariants: [normalizeAnswer("AIRLIFT1"), normalizeAnswer("AIRLIFT")],
  },
  {
    levelNumber: 6,
    branch: "B",
    answerHash: hashAnswer("BLOCKADE"),
    acceptedVariants: [normalizeAnswer("BLOCKADE")],
  },
  {
    levelNumber: 7,
    branch: "A",
    answerHash: hashAnswer("STANLEY"),
    acceptedVariants: [normalizeAnswer("STANLEY")],
  },
  {
    levelNumber: 7,
    branch: "B",
    answerHash: hashAnswer("CAMBRIDGE"),
    acceptedVariants: [normalizeAnswer("CAMBRIDGE")],
  },
  {
    levelNumber: 10,
    branch: "B",
    answerHash: hashAnswer("DANUBE"),
    acceptedVariants: [normalizeAnswer("DANUBE")],
  },
];
