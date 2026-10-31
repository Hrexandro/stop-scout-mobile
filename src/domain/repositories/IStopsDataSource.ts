import type { Stop } from "../entities/Stop";

export interface IStopsDataSource {
  fetchStops(): Promise<Stop[]>;
}
