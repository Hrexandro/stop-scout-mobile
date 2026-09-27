import { create } from "zustand";

export interface SavedStop {
  stopId: number;
  name: string;
  subName?: string;
  lat: number;
  lon: number;
  notes?: string;
}

interface AppState {
  user: string | null;
  favoriteStops: SavedStop[];
  login: (username: string) => void;
  logout: () => void;
  setFavorites: (stops: SavedStop[]) => void;
  addStop: (stop: SavedStop) => void;
  removeStop: (stopId: number) => void;
  updateStopNote: (stopId: number, note: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  favoriteStops: [],

  login: (username) => set({ user: username }),
  logout: () => set({ user: null, favoriteStops: [] }),

  setFavorites: (stops) => set({ favoriteStops: stops }),

  addStop: (stop) =>
    set((state) => ({
      favoriteStops: [...state.favoriteStops, stop],
    })),

  removeStop: (stopId) =>
    set((state) => ({
      favoriteStops: state.favoriteStops.filter((s) => s.stopId !== stopId),
    })),

  updateStopNote: (stopId, note) =>
    set((state) => ({
      favoriteStops: state.favoriteStops.map((s) =>
        s.stopId === stopId ? { ...s, notes: note } : s,
      ),
    })),
}));
