import { SyncStopsUseCase } from "../SyncStopsUseCase";
import type { IStopsDataSource } from "../../domain/repositories/IStopsDataSource";
import type { IStopRepository } from "../../domain/repositories/IStopRepository";

function createDependencies() {
  const dataSource: jest.Mocked<IStopsDataSource> = {
    fetchStops: jest.fn().mockResolvedValue([]),
  };

  const repository: jest.Mocked<IStopRepository> = {
    getById: jest.fn(),
    getInBounds: jest.fn(),
    search: jest.fn(),
    saveStops: jest.fn().mockResolvedValue(undefined),
    countStoredStops: jest.fn().mockResolvedValue(0),
  };

  return { dataSource, repository };
}

describe("SyncStopsUseCase", () => {
  test("pomija pobieranie, gdy przystanki są już w bazie", async () => {
    const { dataSource, repository } = createDependencies();
    repository.countStoredStops.mockResolvedValue(100);

    const useCase = new SyncStopsUseCase(dataSource, repository);
    const result = await useCase.execute();

    expect(result).toEqual({
      count: 100,
      downloaded: false,
    });
    expect(dataSource.fetchStops).not.toHaveBeenCalled();
  });

  test("wymuszona synchronizacja pobiera i zapisuje dane", async () => {
    const { dataSource, repository } = createDependencies();
    repository.countStoredStops.mockResolvedValue(100);

    const useCase = new SyncStopsUseCase(dataSource, repository);
    const result = await useCase.execute(true);

    expect(dataSource.fetchStops).toHaveBeenCalledTimes(1);
    expect(repository.saveStops).toHaveBeenCalledWith([]);
    expect(result).toEqual({
      count: 100,
      downloaded: true,
    });
  });

  test("po błędzie pozwala ponownie uruchomić synchronizację", async () => {
    const { dataSource, repository } = createDependencies();

    dataSource.fetchStops
      .mockRejectedValueOnce(new Error("Brak połączenia"))
      .mockResolvedValueOnce([]);

    const useCase = new SyncStopsUseCase(dataSource, repository);

    await expect(useCase.execute(true)).rejects.toThrow("Brak połączenia");

    await expect(useCase.execute(true)).resolves.toEqual({
      count: 0,
      downloaded: true,
    });

    expect(dataSource.fetchStops).toHaveBeenCalledTimes(2);
  });
});
