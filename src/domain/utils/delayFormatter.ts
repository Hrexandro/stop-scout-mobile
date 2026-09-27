export type DelaySeverity = "ON_TIME" | "MINOR" | "MAJOR";

export interface DelayDisplayInfo {
  severity: DelaySeverity;
  formattedText: string;
  shouldAnimate: boolean;
}

export function getDelayDisplayInfo(
  delayInSeconds: number | null | undefined,
): DelayDisplayInfo {
  if (
    delayInSeconds === null ||
    delayInSeconds === undefined ||
    delayInSeconds <= 0
  ) {
    return {
      severity: "ON_TIME",
      formattedText: "Na czas",
      shouldAnimate: false,
    };
  }

  if (delayInSeconds < 120) {
    return {
      severity: "MINOR",
      formattedText: `+${delayInSeconds}s`,
      shouldAnimate: false,
    };
  }

  return {
    severity: "MAJOR",
    formattedText: `+${Math.floor(delayInSeconds / 60)} min`,
    shouldAnimate: true,
  };
}
