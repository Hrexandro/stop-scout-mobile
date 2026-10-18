import type { Departure } from "../entities/Departure";

export interface IDeparturesRepository {
  getDepartures(stopId: number): Promise<Departure[]>;
}
