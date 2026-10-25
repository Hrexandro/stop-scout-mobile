/// <reference types="jest" />

import { DepartureDelay } from "../DepartureDelay";

describe("DepartureDelay", () => {
  test("brak opóźnienia i wartości ujemne", () => {
    for (const value of [0, -30, null, undefined]) {
      const delay = new DepartureDelay(value);

      expect(delay.severity).toBe("ON_TIME");
      expect(delay.formattedText).toBe("Na czas");
      expect(delay.shouldAnimate).toBe(false);
    }
  });

  test("opóźnienia poniżej 120 sekund", () => {
    const delay = new DepartureDelay(90);

    expect(delay.severity).toBe("MINOR");
    expect(delay.formattedText).toBe("+90s");
    expect(delay.shouldAnimate).toBe(false);

    expect(new DepartureDelay(119).severity).toBe("MINOR");
  });

  test("opóźnienia od 120 sekund", () => {
    const delay = new DepartureDelay(120);

    expect(delay.severity).toBe("MAJOR");
    expect(delay.formattedText).toBe("+2 min");
    expect(delay.shouldAnimate).toBe(true);

    expect(new DepartureDelay(175).formattedText).toBe("+2 min");
    expect(new DepartureDelay(180).formattedText).toBe("+3 min");
  });

  test("porównuje obiekty po wartości", () => {
    const first = new DepartureDelay(60);
    const second = new DepartureDelay(60);
    const third = new DepartureDelay(120);

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
    expect(first.equals(null)).toBe(false);
  });
});
