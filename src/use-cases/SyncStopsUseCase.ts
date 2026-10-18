import { fetchStopsFromApi } from "../infrastructure/api/ZtmApiClient";
import {
  countStoredStops,
  saveStops,
} from "../infrastructure/storage/SqliteStopRepository";

interface SyncResult {
  count: number;
  downloaded: boolean;
}

let syncInProgress: Promise<SyncResult> | null = null;

export function syncStops(force = false): Promise<SyncResult> {
  // Nie uruchamiamy dwóch synchronizacji jednocześnie.
  if (syncInProgress) {
    return syncInProgress;
  }

  syncInProgress = (async () => {
    const storedCount = await countStoredStops();

    // Przy automatycznym starcie nie pobieramy danych ponownie,
    // jeśli w SQLite są już przystanki.
    if (!force && storedCount > 0) {
      return {
        count: storedCount,
        downloaded: false,
      };
    }

    const stops = await fetchStopsFromApi();

    if (stops.length === 0) {
      throw new Error("API nie zwróciło żadnych przystanków.");
    }

    await saveStops(stops);

    return {
      count: await countStoredStops(),
      downloaded: true,
    };
  })().finally(() => {
    syncInProgress = null;
  });

  return syncInProgress;
}
