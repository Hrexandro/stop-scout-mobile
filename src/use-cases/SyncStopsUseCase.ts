import type { IStopsDataSource } from "../domain/repositories/IStopsDataSource";
import type { IStopRepository } from "../domain/repositories/IStopRepository";

interface SyncResult {
  count: number;
  downloaded: boolean;
}

export class SyncStopsUseCase {
  private syncInProgress: Promise<SyncResult> | null = null;

  constructor(
    private readonly stopsDataSource: IStopsDataSource,
    private readonly stopRepository: IStopRepository,
  ) {}

  execute(force = false): Promise<SyncResult> {
    // Nie uruchamiamy dwóch synchronizacji jednocześnie.
    if (this.syncInProgress) {
      return this.syncInProgress;
    }

    this.syncInProgress = (async () => {
      const storedCount = await this.stopRepository.countStoredStops();

      // Przy automatycznym starcie nie pobieramy danych ponownie,
      // jeśli w SQLite są już przystanki.
      if (!force && storedCount > 0) {
        return {
          count: storedCount,
          downloaded: false,
        };
      }

      const stops = await this.stopsDataSource.fetchStops();

      await this.stopRepository.saveStops(stops);

      return {
        count: await this.stopRepository.countStoredStops(),
        downloaded: true,
      };
    })().finally(() => {
      this.syncInProgress = null;
    });

    return this.syncInProgress;
  }
}
