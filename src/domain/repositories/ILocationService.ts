import { Coordinates } from "../entities/Coordinates";

export interface ILocationService {
  requestPermissions(): Promise<boolean>;
  getCurrentPosition(): Promise<Coordinates | null>;
}
