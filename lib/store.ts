'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* -------------------------------------------------------------------------- */
/*  Cart                                                                       */
/* -------------------------------------------------------------------------- */

export type CartLine = {
  slug: string;
  finishId: string;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  /** True once localStorage has been read. Gates any UI that would otherwise
   *  hydrate differently on the server and mismatch on the client. */
  ready: boolean;
  add: (slug: string, finishId: string, qty?: number) => void;
  remove: (slug: string, finishId: string) => void;
  setQty: (slug: string, finishId: string, qty: number) => void;
  clear: () => void;
  hydrate: () => void;
};

const sameLine = (l: CartLine, slug: string, finishId: string) =>
  l.slug === slug && l.finishId === finishId;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      ready: false,
      add: (slug, finishId, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => sameLine(l, slug, finishId));
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                sameLine(l, slug, finishId) ? { ...l, qty: Math.min(99, l.qty + qty) } : l,
              ),
            };
          }
          return { lines: [...state.lines, { slug, finishId, qty }] };
        }),
      remove: (slug, finishId) =>
        set((state) => ({ lines: state.lines.filter((l) => !sameLine(l, slug, finishId)) })),
      setQty: (slug, finishId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => !sameLine(l, slug, finishId))
              : state.lines.map((l) =>
                  sameLine(l, slug, finishId) ? { ...l, qty: Math.min(99, qty) } : l,
                ),
        })),
      clear: () => set({ lines: [] }),
      hydrate: () => {
        void useCart.persist.rehydrate();
      },
    }),
    {
      name: 'frecom.cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Hydration is triggered deliberately from an effect so the static export
      // never renders a cart state it cannot reproduce on the client.
      skipHydration: true,
      partialize: (state) => ({ lines: state.lines }),
      // Fires after the storage read settles, success or failure.
      onRehydrateStorage: () => () => {
        useCart.setState({ ready: true });
      },
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);

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
