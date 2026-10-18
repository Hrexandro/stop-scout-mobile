import type { Departure } from "../../domain/entities/Departure";
import type { IDeparturesRepository } from "../../domain/repositories/IDeparturesRepository";
import { fetchDeparturesFromApi } from "./ZtmDeparturesClient";

export class ZtmDeparturesRepository implements IDeparturesRepository {
  async getDepartures(stopId: number): Promise<Departure[]> {
    return fetchDeparturesFromApi(stopId);
  }
}
