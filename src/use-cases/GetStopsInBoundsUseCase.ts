import type { Stop } from "../domain/entities/Stop";
import type { IStopRepository } from "../domain/repositories/IStopRepository";
import type { GeoBoundingBox } from "../domain/value-objects/GeoBoundingBox";

export class GetStopsInBoundsUseCase {
  constructor(private readonly stopRepository: IStopRepository) {}

  async execute(bounds: GeoBoundingBox): Promise<Stop[]> {
    return this.stopRepository.getInBounds(bounds);
  }
}
