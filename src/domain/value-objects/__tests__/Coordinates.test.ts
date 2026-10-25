/// <reference types="jest" />

import { Coordinates } from "../Coordinates";

describe("Coordinates", () => {
  test("tworzy poprawne współrzędne", () => {
    const coords = new Coordinates(54.352, 18.646);

    expect(coords.latitude).toBe(54.352);
    expect(coords.longitude).toBe(18.646);
    expect(coords.accuracy).toBeNull();
  });

  test("odrzuca nieprawidłowe współrzędne", () => {
    expect(() => new Coordinates(91, 18)).toThrow();
    expect(() => new Coordinates(-91, 18)).toThrow();
    expect(() => new Coordinates(54, 181)).toThrow();
    expect(() => new Coordinates(54, -181)).toThrow();
    expect(() => new Coordinates(NaN, 18)).toThrow();
    expect(() => new Coordinates(Infinity, 18)).toThrow();
  });

  test("porównuje punkty na podstawie wartości", () => {
    const a = new Coordinates(54.352, 18.646);
    const b = new Coordinates(54.352, 18.646);
    const c = new Coordinates(54.4, 18.646);

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(null)).toBe(false);
  });

  test("oblicza odległość między punktami", () => {
    const a = new Coordinates(0, 0);
    const b = new Coordinates(0, 1);

    expect(a.distanceToInMeters(a)).toBe(0);
    expect(a.distanceToInMeters(b)).toBe(111195);
  });
});
