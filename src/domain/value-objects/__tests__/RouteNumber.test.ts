/// <reference types="jest" />

import { RouteNumber } from "../RouteNumber";

describe("RouteNumber", () => {
  test("normalizuje identyfikatory TRISTAR", () => {
    expect(new RouteNumber(10177).value).toBe("177");
    expect(new RouteNumber("10177").value).toBe("177");
  });

  test("zachowuje standardowe numery linii", () => {
    expect(new RouteNumber(9).value).toBe("9");
    expect(new RouteNumber(199).value).toBe("199");
  });

  test("normalizuje oznaczenia alfanumeryczne", () => {
    expect(new RouteNumber("n1").value).toBe("N1");
    expect(new RouteNumber("T8").value).toBe("T8");
  });

  test("rozpoznaje linie nocne", () => {
    expect(new RouteNumber("N1").isNightLine()).toBe(true);
    expect(new RouteNumber("T8").isNightLine()).toBe(false);
  });

  test("bezpiecznie obsługuje puste wartości", () => {
    expect(new RouteNumber(null).value).toBe("?");
    expect(new RouteNumber(undefined).value).toBe("?");
    expect(new RouteNumber("").value).toBe("?");
    expect(new RouteNumber("   ").value).toBe("?");
  });

  test("porównuje obiekty na podstawie wartości", () => {
    const first = new RouteNumber(10177);
    const second = new RouteNumber("177");
    const third = new RouteNumber(9);

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
    expect(first.equals(null)).toBe(false);
  });
});
