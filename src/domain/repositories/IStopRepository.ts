import type { Stop } from "../entities/Stop";
import type { GeoBoundingBox } from "../value-objects/GeoBoundingBox";

export interface IStopRepository {
  getById(stopId: number): Promise<Stop | null>;

  getInBounds(bounds: GeoBoundingBox): Promise<Stop[]>;

  search(query: string): Promise<Stop[]>;

  saveStops(stops: Stop[]): Promise<void>;
  countStoredStops(): Promise<number>;
}
