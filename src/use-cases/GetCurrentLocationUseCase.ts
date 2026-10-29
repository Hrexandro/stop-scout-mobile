import type { ILocationService } from "../domain/repositories/ILocationService";
import type { Coordinates } from "../domain/value-objects/Coordinates";

export class GetCurrentLocationUseCase {
  constructor(private readonly locationService: ILocationService) {}

  async execute(): Promise<Coordinates | null> {
    return this.locationService.getCurrentPosition();
  }
}
