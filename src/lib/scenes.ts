export interface SceneConfig {
  defaultScene: string;
  act: 1 | 2 | 3;
  title: string;
  branchOverrides?: Record<string, string>;
}

export const SCENES: Record<number | string, SceneConfig> = {
  // Dashboard Act-specific fallbacks
  'dashboard-act-1': {
    defaultScene: '/scenes/bletchley-hut.svg',
    act: 1,
    title: 'Bletchley Park Hut 99 (1943-1945)',
  },
  'dashboard-act-2': {
    defaultScene: '/scenes/berlin-ruins.svg',
    act: 2,
    title: 'Divided Berlin Ruins (1948-1956)',
  },
  'dashboard-act-3': {
    defaultScene: '/scenes/cuban-crisis.svg',
    act: 3,
    title: 'DEFCON Naval Blockade (1960-1962)',
  },

  // Round 1 to 15 Scenes
  1: {
    defaultScene: '/scenes/kursk-tanks.svg',
    act: 1,
    title: 'Battle of Kursk (1943)',
  },
  2: {
    defaultScene: '/scenes/venona-cables.svg',
    act: 1,
    title: 'Project Venona Consular Cables (1944)',
  },
  3: {
    defaultScene: '/scenes/yalta-conference.svg',
    act: 1,
    title: 'Yalta Conference & Operation Unthinkable (1945)',
  },
  4: {
    defaultScene: '/scenes/paperclip-rockets.svg',
    act: 1,
    title: 'Operation Paperclip Harz Mountains (1945)',
  },
  5: {
    defaultScene: '/scenes/trinity-atomic.svg',
    act: 1,
    title: 'Klaus Fuchs Leak & Trinity Atomic Site (1945)',
    branchOverrides: {
      A: '/scenes/trinity-atomic.svg',
      B: '/scenes/trinity-atomic.svg',
    },
  },
  6: {
    defaultScene: '/scenes/berlin-airlift.svg',
    act: 2,
    title: 'Berlin Blockade & Airlift (1948)',
    branchOverrides: {
      A: '/scenes/berlin-airlift.svg',
      B: '/scenes/berlin-ruins.svg',
    },
  },
  7: {
    defaultScene: '/scenes/cambridge-spies.svg',
    act: 2,
    title: 'Cambridge Five & Kim Philby (1950)',
    branchOverrides: {
      A: '/scenes/cambridge-spies.svg',
      B: '/scenes/moscow-cold-war.svg',
    },
  },
  8: {
    defaultScene: '/scenes/berlin-tunnel.svg',
    act: 2,
    title: 'Operation Gold Berlin Tunnel (1954)',
  },
  9: {
    defaultScene: '/scenes/vienna-cafe.svg',
    act: 2,
    title: 'Vienna Four-Power Sector Café (1955)',
  },
  10: {
    defaultScene: '/scenes/budapest-1956.svg',
    act: 2,
    title: 'Budapest Hungarian Uprising & Suez (1956)',
    branchOverrides: {
      A1: '/scenes/u2-aircraft.svg',
      A2: '/scenes/moscow-cold-war.svg',
      B1: '/scenes/berlin-ruins.svg',
      B2: '/scenes/cuban-crisis.svg',
    },
  },
  11: {
    defaultScene: '/scenes/u2-aircraft.svg',
    act: 3,
    title: 'Francis Gary Powers U-2 Shootdown (1960)',
  },
  12: {
    defaultScene: '/scenes/moscow-cold-war.svg',
    act: 3,
    title: 'Penkovsky Microdots & Berlin Wall (1961)',
  },
  13: {
    defaultScene: '/scenes/anadyr-missiles.svg',
    act: 3,
    title: 'Operation Anadyr Caribbean Ballistics (1962)',
  },
  14: {
    defaultScene: '/scenes/submarine-b59.svg',
    act: 3,
    title: 'Black Saturday Soviet Submarine B-59 (1962)',
    branchOverrides: {
      X: '/scenes/submarine-b59.svg',
      Y: '/scenes/doomsday-clock.svg',
      Z: '/scenes/cuban-crisis.svg',
    },
  },
  15: {
    defaultScene: '/scenes/doomsday-clock.svg',
    act: 3,
    title: 'The Master Key Vault & Doomsday Threshold (1962)',
  },
};

export function getSceneForRound(roundNumber: number, branch?: string, subBranch?: string): {
  scene: string;
  act: 1 | 2 | 3;
} {
  const config = SCENES[roundNumber];
  if (!config) {
    return { scene: '/scenes/bletchley-hut.svg', act: 1 };
  }

  // Check branch / sub-branch overrides
  if (subBranch && config.branchOverrides && config.branchOverrides[subBranch]) {
    return { scene: config.branchOverrides[subBranch], act: config.act };
  }

  if (branch && config.branchOverrides && config.branchOverrides[branch]) {
    return { scene: config.branchOverrides[branch], act: config.act };
  }

  return { scene: config.defaultScene, act: config.act };
}

export function getSceneForDashboard(act: number = 1): {
  scene: string;
  act: 1 | 2 | 3;
} {
  const key = `dashboard-act-${Math.min(3, Math.max(1, act))}`;
  const config = SCENES[key] || SCENES['dashboard-act-1'];
  return { scene: config.defaultScene, act: config.act };
}
