/// <reference types="jest" />

import { Coordinates } from "../Coordinates";
import { GeoBoundingBox } from "../GeoBoundingBox";

describe("GeoBoundingBox", () => {
  test("tworzy poprawny obszar mapy", () => {
    const bounds = new GeoBoundingBox(54.3, 18.5, 54.4, 18.7);

    expect(bounds.south).toBe(54.3);
    expect(bounds.north).toBe(54.4);
    expect(bounds.west).toBe(18.5);
    expect(bounds.east).toBe(18.7);
  });

  test("rozpoznaje punkt wewnątrz obszaru", () => {
    const bounds = new GeoBoundingBox(54.3, 18.5, 54.4, 18.7);

    expect(bounds.contains(new Coordinates(54.352, 18.646))).toBe(true);

    expect(bounds.contains(new Coordinates(54.5, 18.646))).toBe(false);
  });

  test("uwzględnia punkty na granicy obszaru", () => {
    const bounds = new GeoBoundingBox(54.3, 18.5, 54.4, 18.7);

    expect(bounds.contains(new Coordinates(54.3, 18.5))).toBe(true);

    expect(bounds.contains(new Coordinates(54.4, 18.7))).toBe(true);
  });

  test("odrzuca nieprawidłowe granice", () => {
    expect(() => new GeoBoundingBox(54.4, 18.5, 54.3, 18.7)).toThrow();

    expect(() => new GeoBoundingBox(54.3, 18.8, 54.4, 18.7)).toThrow();

    expect(() => new GeoBoundingBox(-91, 18.5, 54.4, 18.7)).toThrow();

    expect(() => new GeoBoundingBox(54.3, 18.5, 54.4, 181)).toThrow();

    expect(() => new GeoBoundingBox(NaN, 18.5, 54.4, 18.7)).toThrow();
  });

  test("porównuje obiekty według wartości", () => {
    const a = new GeoBoundingBox(54.3, 18.5, 54.4, 18.7);
    const b = new GeoBoundingBox(54.3, 18.5, 54.4, 18.7);
    const c = new GeoBoundingBox(54.3, 18.5, 54.5, 18.7);

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(null)).toBe(false);
  });
});
