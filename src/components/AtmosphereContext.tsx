'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getSceneForDashboard, getSceneForRound } from '@/lib/scenes';

interface AtmosphereContextType {
  scene: string;
  act: 1 | 2 | 3;
  isDilemmaActive: boolean;
  setScene: (scene: string, act?: 1 | 2 | 3) => void;
  setDilemmaActive: (active: boolean) => void;
}

const AtmosphereContext = createContext<AtmosphereContextType>({
  scene: '/scenes/bletchley-hut.svg',
  act: 1,
  isDilemmaActive: false,
  setScene: () => {},
  setDilemmaActive: () => {},
});

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [scene, setSceneState] = useState<string>('/scenes/bletchley-hut.svg');
  const [act, setActState] = useState<1 | 2 | 3>(1);
  const [isDilemmaActive, setDilemmaActive] = useState<boolean>(false);

  // Automatically sync scene based on current route
  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith('/round/')) {
      const idMatch = pathname.match(/\/round\/(\d+)/);
      if (idMatch) {
        const roundNum = Number(idMatch[1]);
        const res = getSceneForRound(roundNum);
        setSceneState(res.scene);
        setActState(res.act);
      }
    } else if (pathname === '/dashboard') {
      const res = getSceneForDashboard(1);
      setSceneState(res.scene);
      setActState(res.act);
    } else if (pathname === '/complete') {
      setSceneState('/scenes/doomsday-clock.svg');
      setActState(3);
    } else if (pathname === '/leaderboard') {
      setSceneState('/scenes/cuban-crisis.svg');
      setActState(2);
    } else {
      setSceneState('/scenes/bletchley-hut.svg');
      setActState(1);
    }
  }, [pathname]);

  const setScene = (newScene: string, newAct?: 1 | 2 | 3) => {
    setSceneState(newScene);
    if (newAct) setActState(newAct);
  };

  return (
    <AtmosphereContext.Provider
      value={{
        scene,
        act,
        isDilemmaActive,
        setScene,
        setDilemmaActive,
      }}
    >
      {children}
    </AtmosphereContext.Provider>
  );
}

export const useAtmosphere = () => useContext(AtmosphereContext);
