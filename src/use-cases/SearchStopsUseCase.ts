import type { Stop } from "../domain/entities/Stop";
import type { IStopRepository } from "../domain/repositories/IStopRepository";

export class SearchStopsUseCase {
  constructor(private readonly stopRepository: IStopRepository) {}

  async execute(query: string): Promise<Stop[]> {
    return this.stopRepository.search(query);
  }
}
