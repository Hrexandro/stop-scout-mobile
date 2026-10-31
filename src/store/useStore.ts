import { create } from "zustand";
import { container } from "../di/container";

export interface SavedStop {
  stopId: number;
  name: string;
  subName?: string;
  lat: number;
  lon: number;
  notes?: string;
}
export interface ActiveStop {
  stopId: number;
  name: string;
}
interface AppState {
  user: string | null;
  userId: number | null;
  favoriteStops: SavedStop[];

  login: (user: { id: number; username: string }) => void;
  logout: () => void;

  setFavorites: (stops: SavedStop[]) => void;
  loadFavorites: () => Promise<void>;
  addStop: (stop: SavedStop) => Promise<void>;
  removeStop: (stopId: number) => Promise<void>;
  updateStopNote: (stopId: number, note: string) => Promise<void>;
  activeStop: ActiveStop;
  setActiveStop: (stop: ActiveStop) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  userId: null,
  favoriteStops: [],
  activeStop: {
    stopId: 2072,
    name: "Dworzec Główny",
  },

  setActiveStop: (stop) => set({ activeStop: stop }),

  login: ({ id, username }) =>
    set({
      user: username,
      userId: id,
      favoriteStops: [],
    }),

  logout: () =>
    set({
      user: null,
      userId: null,
      favoriteStops: [],
    }),

  setFavorites: (stops) => set({ favoriteStops: stops }),

  // Wczytanie ulubionych z SQLite
  loadFavorites: async () => {
    const userId = get().userId;

    if (userId === null) return;

    const favorites =
      await container.favoritesRepository.getUserFavorites(userId);

    // Zabezpieczenie przed zmianą konta w trakcie odczytu
    if (get().userId !== userId) return;

    set({
      favoriteStops: favorites.map((stop) => ({
        ...stop,
        notes: stop.notes ?? undefined,
      })),
    });
  },

  // Optimistic UI: najpierw aktualizacja ekranu,
  // potem zapis do SQLite
  addStop: async (stop) => {
    const userId = get().userId;

    if (userId === null) {
      throw new Error("Najpierw zaloguj się.");
    }

    if (get().favoriteStops.some((s) => s.stopId === stop.stopId)) {
      return;
    }

    set((state) => ({
      favoriteStops: [...state.favoriteStops, stop],
    }));

    try {
      await container.favoritesRepository.addFavorite(userId, stop.stopId);
    } catch (error) {
      // Rollback: usuwamy niedodaną pozycję
      if (get().userId === userId) {
        set((state) => ({
          favoriteStops: state.favoriteStops.filter(
            (s) => s.stopId !== stop.stopId,
          ),
        }));
      }

      throw error;
    }
  },

  // Optimistic UI przy usuwaniu
  removeStop: async (stopId) => {
    const userId = get().userId;

    if (userId === null) {
      throw new Error("Najpierw zaloguj się.");
    }

    const removedStop = get().favoriteStops.find((s) => s.stopId === stopId);

    if (!removedStop) return;

    set((state) => ({
      favoriteStops: state.favoriteStops.filter((s) => s.stopId !== stopId),
    }));

    try {
      await container.favoritesRepository.removeFavorite(userId, stopId);
    } catch (error) {
      // Rollback: przywracamy usunięty przystanek
      if (get().userId === userId) {
        set((state) => ({
          favoriteStops: state.favoriteStops.some((s) => s.stopId === stopId)
            ? state.favoriteStops
            : [...state.favoriteStops, removedStop],
        }));
      }

      throw error;
    }
  },

  updateStopNote: async (stopId, note) => {
    const userId = get().userId;

    if (userId === null) {
      throw new Error("Najpierw zaloguj się.");
    }

    const previousStop = get().favoriteStops.find(
      (stop) => stop.stopId === stopId,
    );

    if (!previousStop) {
      throw new Error("Nie znaleziono ulubionego przystanku.");
    }

    const previousNote = previousStop.notes;

    // Optimistic UI
    set((state) => ({
      favoriteStops: state.favoriteStops.map((stop) =>
        stop.stopId === stopId ? { ...stop, notes: note } : stop,
      ),
    }));

    try {
      await container.favoritesRepository.updateFavoriteNote(
        userId,
        stopId,
        note,
      );
    } catch (error) {
      // Rollback
      if (get().userId === userId) {
        set((state) => ({
          favoriteStops: state.favoriteStops.map((stop) =>
            stop.stopId === stopId ? { ...stop, notes: previousNote } : stop,
          ),
        }));
      }

      throw error;
    }
  },
}));
