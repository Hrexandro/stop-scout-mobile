import type { Stop } from "../domain/entities/Stop";
import type { IStopRepository } from "../domain/repositories/IStopRepository";

export class GetStopByIdUseCase {
  constructor(private readonly stopRepository: IStopRepository) {}

  async execute(stopId: number): Promise<Stop | null> {
    return this.stopRepository.getById(stopId);
  }
}
