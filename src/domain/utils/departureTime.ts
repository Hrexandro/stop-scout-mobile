interface DepartureTimeData {
  estimatedTime?: string | null;
  theoreticalTime?: string | null;
}

export function getDepartureTimestamp(
  departure: DepartureTimeData,
): number | null {
  const estimated = Date.parse(departure.estimatedTime ?? "");

  if (Number.isFinite(estimated)) {
    return estimated;
  }

  const theoretical = Date.parse(departure.theoreticalTime ?? "");

  return Number.isFinite(theoretical) ? theoretical : null;
}

export function filterRecentDepartures<T extends DepartureTimeData>(
  departures: T[],
  now: Date = new Date(),
): T[] {
  const cutoff = now.getTime() - 2 * 60 * 1000;

  return departures
    .filter((departure) => {
      const timestamp = getDepartureTimestamp(departure);

      return timestamp !== null && timestamp >= cutoff;
    })
    .sort((a, b) => getDepartureTimestamp(a)! - getDepartureTimestamp(b)!);
}
