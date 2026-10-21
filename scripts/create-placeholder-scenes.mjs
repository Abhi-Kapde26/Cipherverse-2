import fs from 'node:fs';
import path from 'node:path';

const SCENES_DIR = path.join(process.cwd(), 'public', 'scenes');
if (!fs.existsSync(SCENES_DIR)) {
  fs.mkdirSync(SCENES_DIR, { recursive: true });
}

const SCENE_NAMES = [
  { name: 'bletchley-hut', title: 'BLETCHLEY PARK HUT 99', year: '1943', act: 'ACT I', subtitle: 'NAVAL ENIGMA & LORENZ TELEPRINTER INTERCEPTS', iconType: 'radar' },
  { name: 'berlin-ruins', title: 'DIVIDED BERLIN SECTOR', year: '1948', act: 'ACT II', subtitle: 'FOUR-POWER OCCUPATION BORDER & CHECKPOINT ZONE', iconType: 'city' },
  { name: 'cuban-crisis', title: 'CARIBBEAN DEFCON NAVAL BLOCKADE', year: '1962', act: 'ACT III', subtitle: 'QUARANTINE LINE & SOVIET MARITIME SQUADRONS', iconType: 'sonar' },
  { name: 'kursk-tanks', title: 'BATTLE OF KURSK ARMORED SALIENT', year: '1943', act: 'ROUND 01', subtitle: 'PANZER RECONNAISSANCE & RED ARMY DEFENSIVE CORRIDOR', iconType: 'salient' },
  { name: 'venona-cables', title: 'PROJECT VENONA DIPLOMATIC TRAFFIC', year: '1944', act: 'ROUND 02', subtitle: 'ARLINGTON HALL ONE-TIME PAD DECRYPTION GRID', iconType: 'teleprinter' },
  { name: 'yalta-conference', title: 'OPERATION UNTHINKABLE / YALTA', year: '1945', act: 'ROUND 03', subtitle: 'EUROPEAN THEATRE DIVISION & CONTINGENCY MARCH ORDERS', iconType: 'map' },
  { name: 'paperclip-rockets', title: 'HARZ MOUNTAINS V-2 DOSSIERS', year: '1945', act: 'ROUND 04', subtitle: 'BALLISTIC ROCKET TEST SITE & ALPINE STORAGE VAULTS', iconType: 'rocket' },
  { name: 'trinity-atomic', title: 'TRINITY ATOMIC IMPLOSION SPHERE', year: '1945', act: 'ROUND 05', subtitle: 'LOS ALAMOS EXPERIMENTAL SITE & SHADOW LENS BLUEPRINT', iconType: 'atomic' },
  { name: 'berlin-airlift', title: 'OPERATION VITTLES TEMPELHOF AIRLIFT', year: '1948', act: 'ROUND 06', subtitle: 'ALLIED AIR CORRIDOR & SUPPLY FLIGHT FORMATIONS', iconType: 'aircraft' },
  { name: 'cambridge-spies', title: 'CAMBRIDGE FIVE MOLE NETWORK', year: '1950', act: 'ROUND 07', subtitle: 'WHITEHALL TO MOSCOW CENTRE COURIER CHANNELS', iconType: 'network' },
  { name: 'berlin-tunnel', title: 'OPERATION GOLD SUBTERRANEAN TAP', year: '1954', act: 'ROUND 08', subtitle: 'ALTGLIENICKE TELEPHONE CABLE INTERCEPTION SHAFT', iconType: 'tunnel' },
  { name: 'vienna-cafe', title: 'VIENNA OCCUPATION SECTOR INTERCEPT', year: '1955', act: 'ROUND 09', subtitle: 'RINGSTRASSE FOUR-POWER COVERT RATLINE', iconType: 'map' },
  { name: 'budapest-1956', title: 'DANUBE CROSSINGS & SUEZ CRISIS', year: '1956', act: 'ROUND 10', subtitle: 'HUNGARIAN MECHANIZED DEPLOYMENT & CANAL THEATRE', iconType: 'bridge' },
  { name: 'u2-aircraft', title: 'U-2 HIGH-ALTITUDE RECONNAISSANCE', year: '1960', act: 'ROUND 11', subtitle: '70,000 FT OVER SVERDLOVSK SA-2 SURFACE-TO-AIR TRAJECTORY', iconType: 'u2' },
  { name: 'moscow-cold-war', title: 'MOSCOW CENTRE MICRODOT ARCHIVE', year: '1961', act: 'ROUND 12', subtitle: 'LUBYANKA MICROFILM CANISTERS & BERLIN WALL EMBARGO', iconType: 'microfilm' },
  { name: 'anadyr-missiles', title: 'OPERATION ANADYR CARIBBEAN DEPLOYMENT', year: '1962', act: 'ROUND 13', subtitle: 'R-12 DVINA BALLISTIC LAUNCH SITE SAN CRISTOBAL', iconType: 'missile' },
  { name: 'submarine-b59', title: 'FOXTROT SUBMARINE B-59 EMERGENCY SONAR', year: '1962', act: 'ROUND 14', subtitle: 'SARGASSO SEA DEPTH CHARGES & TORPEDO OVERRIDE DIRECTIVE', iconType: 'submarine' },
  { name: 'doomsday-clock', title: 'DEFCON 1 MASTER VAULT THRESHOLD', year: '1962', act: 'ROUND 15', subtitle: 'UNIT 404 FINAL CRYPTOGRAPHIC TERMINAL OVERRIDE', iconType: 'clock' },
];

function generateSvg(scene) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="vignette-${scene.name}" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#141c17" stop-opacity="1"/>
      <stop offset="45%" stop-color="#0d1410" stop-opacity="1"/>
      <stop offset="85%" stop-color="#080c09" stop-opacity="1"/>
      <stop offset="100%" stop-color="#040605" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="radar-glow-${scene.name}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.12"/>
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid-${scene.name}" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.25)"/>
    </pattern>
    <pattern id="dots-${scene.name}" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.12)"/>
    </pattern>
  </defs>

  <!-- Background Base Gradients -->
  <rect width="100%" height="100%" fill="url(#vignette-${scene.name})"/>
  <rect width="100%" height="100%" fill="url(#grid-${scene.name})"/>
  <rect width="100%" height="100%" fill="url(#dots-${scene.name})" opacity="0.7"/>

  <!-- Central Tactical Radar Glow -->
  <circle cx="960" cy="540" r="500" fill="url(#radar-glow-${scene.name})"/>

  <!-- Archival War Blueprint Outer Border Frame -->
  <rect x="50" y="50" width="1820" height="980" fill="none" stroke="rgba(245,158,11,0.45)" stroke-width="2.5"/>
  <rect x="62" y="62" width="1796" height="956" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="10 6"/>

  <!-- Prominent Central Military Radar & War Diagram Reticles -->
  <g stroke="rgba(255,255,255,0.38)" fill="none" stroke-width="2">
    <circle cx="960" cy="540" r="440" stroke-dasharray="14 8"/>
    <circle cx="960" cy="540" r="330"/>
    <circle cx="960" cy="540" r="220" stroke-dasharray="8 6"/>
    <circle cx="960" cy="540" r="110"/>
    <circle cx="960" cy="540" r="24" fill="rgba(245,158,11,0.5)"/>
    
    <!-- Crosshairs & Angle Radials -->
    <line x1="960" y1="60" x2="960" y2="1020" stroke="rgba(245,158,11,0.5)" stroke-width="2.5"/>
    <line x1="440" y1="540" x2="1480" y2="540" stroke="rgba(245,158,11,0.5)" stroke-width="2.5"/>
    <line x1="620" y1="200" x2="1300" y2="880" stroke="rgba(255,255,255,0.25)" stroke-dasharray="6 6"/>
    <line x1="620" y1="880" x2="1300" y2="200" stroke="rgba(255,255,255,0.25)" stroke-dasharray="6 6"/>
  </g>

  <!-- Large Military Salient / Strategic Advance Vectors -->
  <g fill="none" stroke="rgba(245,158,11,0.55)" stroke-width="3.5">
    <path d="M 280 820 Q 620 660 960 540 T 1640 260" stroke-dasharray="12 8"/>
    <polygon points="1655,250 1620,265 1635,285" fill="rgba(245,158,11,0.7)"/>
    <path d="M 280 260 Q 620 400 960 540 T 1640 820" stroke="rgba(239,68,68,0.5)" stroke-dasharray="10 6"/>
    <polygon points="1655,830 1635,805 1620,825" fill="rgba(239,68,68,0.7)"/>
  </g>

  <!-- Tactical Range Rings & Azimuth Markings -->
  <g fill="rgba(255,255,255,0.55)" font-family="monospace" font-size="14" font-weight="bold">
    <text x="975" y="220">000° NORTH [AZIMUTH 360]</text>
    <text x="1310" y="535">090° EAST</text>
    <text x="975" y="890">180° SOUTH</text>
    <text x="570" y="535">270° WEST</text>
    <text x="1110" y="390">RANGE 50 KM</text>
    <text x="1190" y="310">RANGE 100 KM</text>
    <text x="1270" y="230">RANGE 150 KM</text>
  </g>

  <!-- War Documentation Header Stencil -->
  <g font-family="monospace" text-anchor="start">
    <rect x="90" y="90" width="680" height="155" fill="rgba(8,12,10,0.85)" stroke="rgba(245,158,11,0.6)" stroke-width="2"/>
    <text x="115" y="128" font-size="16" font-weight="bold" fill="rgba(239,68,68,0.95)" letter-spacing="4">
      [TOP SECRET // EYES ONLY // BLETCHLEY HUT 99]
    </text>
    <text x="115" y="170" font-size="28" font-weight="900" fill="rgba(245,158,11,0.98)" letter-spacing="4">
      ${scene.title}
    </text>
    <text x="115" y="208" font-size="13" font-weight="bold" fill="rgba(255,255,255,0.85)" letter-spacing="2">
      THEATRE: ${scene.act} // ERA: ${scene.year} // ${scene.subtitle}
    </text>
  </g>

  <!-- Bottom Coordinates & Sector Grid Box -->
  <g font-family="monospace">
    <rect x="90" y="890" width="760" height="95" fill="rgba(8,12,10,0.85)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
    <text x="115" y="925" font-size="14" font-weight="bold" fill="rgba(255,255,255,0.9)" letter-spacing="2">
      COORDINATES: 52°31'12"N 13°24'18"E // SECTOR GRID 404-JANUS
    </text>
    <text x="115" y="955" font-size="12" fill="rgba(245,158,11,0.9)" letter-spacing="2">
      TELETYPE FREQ: 8.420 MHZ // ENCRYPTION: ROTOR STAGE VERIFIED // STATUS: INTERCEPTED
    </text>
  </g>

  <!-- Right Side Tactical Gauge Box -->
  <g font-family="monospace" text-anchor="end">
    <rect x="1400" y="90" width="430" height="190" fill="rgba(8,12,10,0.85)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
    <text x="1805" y="128" font-size="14" font-weight="bold" fill="rgba(245,158,11,0.95)" letter-spacing="3">
      DEFCON STATUS: READY
    </text>
    <text x="1805" y="160" font-size="12" fill="rgba(255,255,255,0.85)" letter-spacing="2">
      SYSTEM: CRYPTANALYSIS RADAR
    </text>
    <text x="1805" y="192" font-size="12" fill="rgba(255,255,255,0.75)" letter-spacing="2">
      STATION: BLETCHLEY DISPATCH
    </text>
    <text x="1805" y="240" font-size="20" font-weight="900" fill="rgba(239,68,68,0.95)" letter-spacing="4">
      [OPERATION JANUS]
    </text>
  </g>
</svg>`;
}

for (const s of SCENE_NAMES) {
  const filePath = path.join(SCENES_DIR, `${s.name}.svg`);
  fs.writeFileSync(filePath, generateSvg(s));
}

console.log(`Updated ${SCENE_NAMES.length} high-contrast archival SVG scenes in public/scenes/`);
