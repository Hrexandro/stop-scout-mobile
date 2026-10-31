import type { Stop } from "../../domain/entities/Stop";
import type { IStopsDataSource } from "../../domain/repositories/IStopsDataSource";
import { fetchStopsFromApi } from "./ZtmApiClient";

export class ZtmStopsDataSource implements IStopsDataSource {
  async fetchStops(): Promise<Stop[]> {
    return fetchStopsFromApi();
  }
}
