import { Coordinates } from "../value-objects/Coordinates";

export interface ILocationService {
  requestPermissions(): Promise<boolean>;
  getCurrentPosition(): Promise<Coordinates | null>;
}
