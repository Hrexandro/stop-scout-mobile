/// <reference types="jest" />

import type { Departure } from "../../domain/entities/Departure";
import type { IDeparturesRepository } from "../../domain/repositories/IDeparturesRepository";
import { GetLiveDeparturesUseCase } from "../GetLiveDeparturesUseCase";

const FIXED_TIME = new Date("2026-10-18T12:00:00.000Z");

function makeDeparture(id: string, estimatedTime: string): Departure {
  return {
    id,
    routeId: 8,
    headsign: "Głęboka",
    estimatedTime,
    theoreticalTime: estimatedTime,
    delayInSeconds: 0,
  };
}

describe("GetLiveDeparturesUseCase", () => {
  let repository: jest.Mocked<IDeparturesRepository>;
  let useCase: GetLiveDeparturesUseCase;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_TIME);

    repository = {
      getDepartures: jest.fn(),
    };

    useCase = new GetLiveDeparturesUseCase(repository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("pobiera odjazdy dla wskazanego przystanku", async () => {
    repository.getDepartures.mockResolvedValue([
      makeDeparture("1", "2026-10-18T12:05:00Z"),
    ]);

    const result = await useCase.execute(2072);

    expect(repository.getDepartures).toHaveBeenCalledWith(2072);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  test("odrzuca kursy starsze niż 2 minuty", async () => {
    repository.getDepartures.mockResolvedValue([
      makeDeparture("stary", "2026-10-18T11:57:59Z"),
      makeDeparture("granica", "2026-10-18T11:58:00Z"),
      makeDeparture("aktualny", "2026-10-18T11:58:01Z"),
      makeDeparture("przyszly", "2026-10-18T12:05:00Z"),
    ]);

    const result = await useCase.execute(2072);

    expect(result.map((departure) => departure.id)).toEqual([
      "granica",
      "aktualny",
      "przyszly",
    ]);
  });

  test("sortuje odjazdy chronologicznie", async () => {
    repository.getDepartures.mockResolvedValue([
      makeDeparture("pozniejszy", "2026-10-18T12:10:00Z"),
      makeDeparture("wczesniejszy", "2026-10-18T12:03:00Z"),
    ]);

    const result = await useCase.execute(2072);

    expect(result.map((departure) => departure.id)).toEqual([
      "wczesniejszy",
      "pozniejszy",
    ]);
  });

  test("odrzuca nieprawidłowy identyfikator przystanku", async () => {
    await expect(useCase.execute(-1)).rejects.toThrow(
      "Nieprawidłowy identyfikator przystanku.",
    );

    expect(repository.getDepartures).not.toHaveBeenCalled();
  });
  test("uwzględnia estimatedTime zamiast theoreticalTime", async () => {
    repository.getDepartures.mockResolvedValue([
      {
        ...makeDeparture("opozniony", "2026-10-18T12:08:00Z"),
        theoreticalTime: "2026-10-18T11:55:00Z",
      },
      {
        ...makeDeparture("przyspieszony", "2026-10-18T11:57:00Z"),
        theoreticalTime: "2026-10-18T12:10:00Z",
      },
      makeDeparture("regularny", "2026-10-18T12:03:00Z"),
    ]);

    const result = await useCase.execute(2072);

    expect(result.map((departure) => departure.id)).toEqual([
      "regularny",
      "opozniony",
    ]);
  });
  test("przekazuje błąd zgłoszony przez repozytorium", async () => {
    repository.getDepartures.mockRejectedValue(
      new Error("Brak połączenia z API"),
    );

    await expect(useCase.execute(2072)).rejects.toThrow(
      "Brak połączenia z API",
    );
  });
});
