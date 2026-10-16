/// <reference types="jest" />

import { routeFormatter } from "../routeFormatter";

describe("routeFormatter", () => {
  test("usuwa prefiks TRISTAR z numeru 10177", () => {
    expect(routeFormatter(10177)).toBe("177");
  });

  test("obsługuje identyfikator TRISTAR jako tekst", () => {
    expect(routeFormatter("10177")).toBe("177");
  });

  test("pozostawia zwykłe numery linii bez zmian", () => {
    expect(routeFormatter(9)).toBe("9");
    expect(routeFormatter(199)).toBe("199");
  });

  test("obsługuje linie alfanumeryczne", () => {
    expect(routeFormatter("N1")).toBe("N1");
    expect(routeFormatter("T8")).toBe("T8");
  });

  test("obsługuje null i undefined", () => {
    expect(routeFormatter(null)).toBe("");
    expect(routeFormatter(undefined)).toBe("");
  });

  test("obsługuje puste ciągi znaków", () => {
    expect(routeFormatter("")).toBe("");
    expect(routeFormatter("   ")).toBe("");
  });

  test("nie modyfikuje numerów bez prefiksu TRISTAR", () => {
    expect(routeFormatter(12345)).toBe("12345");
    expect(routeFormatter("ABC")).toBe("ABC");
  });
});
