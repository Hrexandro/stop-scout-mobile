import type { Departure } from "../domain/entities/Departure";
import type { IDeparturesRepository } from "../domain/repositories/IDeparturesRepository";
import { filterRecentDepartures } from "../domain/utils/departureTime";

export class GetLiveDeparturesUseCase {
  constructor(private readonly repository: IDeparturesRepository) {}

  async execute(stopId: number): Promise<Departure[]> {
    if (!Number.isInteger(stopId) || stopId <= 0) {
      throw new Error("Nieprawidłowy identyfikator przystanku.");
    }

    const departures = await this.repository.getDepartures(stopId);

    return filterRecentDepartures(departures);
  }
}
