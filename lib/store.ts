'use client';

import { create } from 'zustand';

/* -------------------------------------------------------------------------- */
/*  Load / readiness signalling                                                */
/*  Every value here is set by real work completing — never a timer.           */
/* -------------------------------------------------------------------------- */

type LoadState = {
  /** Web fonts have resolved (document.fonts.ready). */
  fontsReady: boolean;
  /** The WebGL scene reported a successfully rendered first frame. */
  sceneReady: boolean;
  /** No 3D will be attempted (low tier / no WebGL) — the loader can resolve. */
  sceneSkipped: boolean;
  markFonts: () => void;
  markScene: () => void;
  skipScene: () => void;
};

export const useLoad = create<LoadState>((set) => ({
  fontsReady: false,
  sceneReady: false,
  sceneSkipped: false,
  markFonts: () => set({ fontsReady: true }),
  markScene: () => set({ sceneReady: true }),
  skipScene: () => set({ sceneSkipped: true, sceneReady: true }),
}));

/**
 * Weighted real-progress signal: fonts gate text layout, the scene gates the
 * hero. Both are actual blocking work, so the bar reflects the machine, not a
 * choreographed delay.
 */
export function useLoadProgress(): number {
  return useLoad((s) => {
    const fonts = s.fontsReady ? 0.4 : 0;
    const scene = s.sceneReady ? 0.55 : 0;
    const chrome = 0.05; // CSS + first paint of the shell
    return Math.min(1, fonts + scene + chrome);
  });
}

export function useLoaded(): boolean {
  return useLoad((s) => s.fontsReady && s.sceneReady);
}

/* -------------------------------------------------------------------------- */
/*  UI                                                                        */
/* -------------------------------------------------------------------------- */

type UiState = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

export const useUi = create<UiState>((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));
