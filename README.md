# Operation Janus: The Trust Paradox 🕵️‍♂️📜

> **HUT 99 // CLASSIFIED CRYPTANALYTIC CAMPAIGN // 1943 – 1962**  
> *A stateless Cold War cryptanalysis platform, capture-the-flag (CTF) engine, and interactive espionage narrative built with Next.js 14, Tailwind CSS, TypeScript, and Supabase / SQLite.*

---

## 📖 Mission Overview

You are a stateless cryptanalyst operating out of **Hut 99**. From the muddy battlegrounds of Kursk in 1943 to the razor-edge nuclear showdown of the Cuban Missile Crisis in 1962, you intercept, falsify, and decipher top-secret dispatches for MI6, the CIA, and the KGB.

Every cipher is historically grounded and verified. Every betrayal has consequences.

---

## ✨ Core Features & Mechanics

- **15 Classified Intercept Rounds across 3 Historical Acts**:
  - **Act I: The Atomic Shadow (1943–1945)**: Bletchley Park intercepts, Venona pads, and Manhattan Project leaks.
  - **Act II: The Iron Curtain (1948–1956)**: Berlin Blockade, the Cambridge Five moles, and subterranean tunnel wiretaps.
  - **Act III: Brink of Oblivion (1960–1962)**: High-altitude U-2 reconnaissance, Caribbean nuclear missile telemetry, and the Master Vault.
- **Agency Branching (CIA vs. KGB)**:
  - Commit to the **Langley Pact** (CIA) or the **Lubyanka Gambit** (KGB) at pivotal junction points, unlocking divergent cipher suites and storylines.
- **180s Moral Dilemmas**:
  - At Rounds 5, 8, 10, and 14, the workstation locks into a pulsating 180-second siren countdown. Expiration forces high-risk operational contingencies and Burn Meter increases.
- **The Burn Meter (Cover Intact → Watched → Hunted → Burned)**:
  - 3 incorrect decryption attempts trigger suspicion. Reaching *Burned* level incurs escalating penalty minutes (+2m per tier) on the leaderboard clock.
- **Master Keyring Vault**:
  - Collect 4 hidden cryptographic fragments across the campaign (R1=`7`, R5=`3`, R10=`9`, R14=`5`) to unlock the Round 15 Master Vault.
- **DEFCON Live Escalation Clock**:
  - Dynamically calculates DEFCON threat levels (`DEFCON 5` peacetime down to `DEFCON 1` nuclear alert) based on team progress and burn level.
- **Atmospheric Sensory Audio Engine**:
  - Web Audio API synthesizer for teletype printouts, rotary dials, siren strobes, radio static, and typewriter feedback without external audio asset dependencies.
- **Live Leaderboard & Big Screen Mode**:
  - Real-time ranking by rounds cleared, elapsed time (including penalties), and burn level. Includes a high-contrast projector/TV display mode.
- **High Command HQ / Admin Panel**:
  - Manage live teams, view submissions, advance or reset levels, and trigger global operational freezes.
- **Field Pamphlet Manual**:
  - In-game searchable cryptographic reference manual covering classical to mid-century cipher systems (Caesar, Vigenère, Playfair, One-Time Pad, Rail Fence, ADFGVX, Enigma, etc.).

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), PostCSS, Custom Retro CRT Scanline Overlays, Aged Paper & Glassmorphism themes
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database (Dual Adapter)**:
  - **Production**: [Supabase](https://supabase.com/) PostgreSQL with Row-Level Security (RLS)
  - **Development / Offline**: Local file-based [SQLite](https://sqlite.org/) via `better-sqlite3`

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.17+ or v20+ recommended)
- `npm`, `pnpm`, or `yarn`

### 2. Installation

Clone the repository and install project dependencies:

```bash
git clone https://github.com/your-username/cipherverse.git
cd cipherverse
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```ini
# Event Passcode required by participants during registration
EVENT_PASSCODE=JANUS1962

# High Command Master Administrator Key
ADMIN_KEY=your_secure_admin_key
ADMIN_PASSWORD=your_secure_admin_password

# Session Encryption Secret
SESSION_SECRET=a_random_32_character_string_for_sessions

# Optional: Supabase Production Database Configuration
# If omitted, the platform automatically runs locally on SQLite!
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note on Database Adapter**: If Supabase credentials are not provided, the application will automatically initialize a local SQLite database (`cipherverse.db`) in the project root.

### 4. Database Setup (Supabase Production)

If using Supabase:
1. Navigate to your Supabase project's **SQL Editor**.
2. Run the SQL script located at `supabase/schema.sql`.
3. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are placed in `.env.local`.

### 5. Running the Application

```bash
# Start development server
npm run dev

# Run production build
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server at `localhost:3000` |
| `npm run build` | Compiles and builds production-optimized Next.js bundle |
| `npm run start` | Boots the built production server |
| `npm run lint` | Runs ESLint analysis across the project |
| `npm run seed` | Seeds challenge rounds, dilemma options, and baseline data |
| `npm run verify-ciphers` | Validates cryptographic test vectors and cipher solutions |

---

## 🗂️ Project Structure

```
├── public/                 # Static assets and scene illustrations
├── scripts/
│   ├── seed.ts             # Database seeder script
│   ├── verify-ciphers.mjs  # Mathematical cipher verification suite
│   └── verify-all.mjs      # Comprehensive verification check
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── admin/          # High Command HQ Dashboard
│   │   ├── api/            # REST API endpoints (auth, round, dilemma, admin)
│   │   ├── complete/       # Mission Debriefing & Ending Cinematic
│   │   ├── dashboard/      # Case Files Timeline (Acts I - III)
│   │   ├── leaderboard/    # Live Rankings & Big Screen display
│   │   ├── login/          # Cryptanalyst station login
│   │   ├── register/       # Team enlistment & passcode check
│   │   ├── round/[id]/     # Active decryption teletype bay
│   │   ├── globals.css     # Vintage CRT styling, scanlines & paper themes
│   │   └── layout.tsx      # Root layout & atmosphere wrappers
│   ├── components/         # Reusable UI widgets (Navbar, HUDs, Meters, Overlays)
│   ├── lib/
│   │   ├── audio.ts        # Synthesized Web Audio API sound engine
│   │   ├── ciphers.ts      # Level definitions, hints & pamphlet documentation
│   │   ├── scenes.ts       # Act-specific background scene mappings
│   │   ├── session.ts      # Stateless JWT session management
│   │   └── db/             # Unified database adapter (Supabase / SQLite)
│   └── types/              # TypeScript type definitions
├── supabase/
│   └── schema.sql          # Production PostgreSQL database schema
├── tailwind.config.ts      # Custom bunker/sepia/cold-war color palette
└── README.md
```

---

## 🛡️ Security & Integrity

- **Stateless HMAC Sessions**: Cryptanalyst authentication tokens are cryptographically signed using `SESSION_SECRET`.
- **Rate-Limiting Protection**: Submissions are strictly rate-limited to 1 attempt per 3 seconds per team to prevent automated dictionary attacks.
- **Answer Normalization & Hashing**: All submitted answers are stripped of whitespace and punctuation, converted to lowercase, and verified using SHA-256 hashes on the server.
- **Row-Level Security**: Production Supabase queries utilize service-role key authorization with strict table RLS policies.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
