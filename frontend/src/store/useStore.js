/**
 * Global State — Zustand Store
 * Developer B: Ajith
 *
 * Zustand is a lightweight state manager.
 * All pages share this one store — no prop drilling needed.
 */

import { create } from 'zustand'

const useStore = create((set) => ({
  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery: '',
  searchResults: [],
  selectedLocation: null,

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),

  // ── Route ─────────────────────────────────────────────────────────────────
  routeSrc: null,
  routeDst: null,
  routePath: [],
  routeDistance: null,
  routeAlgorithm: 'astar',

  setRouteSrc: (node) => set({ routeSrc: node }),
  setRouteDst: (node) => set({ routeDst: node }),
  setRoute: (path, distance) => set({ routePath: path, routeDistance: distance }),
  setRouteAlgorithm: (algo) => set({ routeAlgorithm: algo }),
  clearRoute: () => set({ routePath: [], routeDistance: null }),
}))

export default useStore
