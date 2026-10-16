/// <reference types="jest" />
import { getDelayDisplayInfo } from "../delayFormatter";

describe("getDelayDisplayInfo", () => {
  test("brak opóźnienia (0 sekund)", () => {
    expect(getDelayDisplayInfo(0)).toEqual({
      severity: "ON_TIME",
      formattedText: "Na czas",
      shouldAnimate: false,
    });
  });

  test("pojazd przed czasem (-30 sekund)", () => {
    expect(getDelayDisplayInfo(-30)).toEqual({
      severity: "ON_TIME",
      formattedText: "Na czas",
      shouldAnimate: false,
    });
  });

  test("brak danych o opóźnieniu (null i undefined)", () => {
    expect(getDelayDisplayInfo(null).severity).toBe("ON_TIME");
    expect(getDelayDisplayInfo(undefined).severity).toBe("ON_TIME");

    expect(getDelayDisplayInfo(null).shouldAnimate).toBe(false);
    expect(getDelayDisplayInfo(undefined).shouldAnimate).toBe(false);
  });

  test("niewielkie opóźnienie (1 sekunda)", () => {
    expect(getDelayDisplayInfo(1)).toEqual({
      severity: "MINOR",
      formattedText: "+1s",
      shouldAnimate: false,
    });
  });

  test("granica kategorii MINOR (119 sekund)", () => {
    expect(getDelayDisplayInfo(119)).toEqual({
      severity: "MINOR",
      formattedText: "+119s",
      shouldAnimate: false,
    });
  });

  test("granica kategorii MAJOR (120 sekund)", () => {
    expect(getDelayDisplayInfo(120)).toEqual({
      severity: "MAJOR",
      formattedText: "+2 min",
      shouldAnimate: true,
    });
  });

  test("duże opóźnienie (180 sekund)", () => {
    expect(getDelayDisplayInfo(180)).toEqual({
      severity: "MAJOR",
      formattedText: "+3 min",
      shouldAnimate: true,
    });
  });
});
