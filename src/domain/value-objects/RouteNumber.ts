export class RouteNumber {
  public readonly value: string;

  constructor(rawRouteId: number | string | null | undefined) {
    this.value = RouteNumber.normalize(rawRouteId);
  }

  private static normalize(raw: number | string | null | undefined): string {
    if (raw === null || raw === undefined) return "?";

    const trimmed = String(raw).trim();
    if (!trimmed) return "?";

    const numericValue = Number(trimmed);

    if (!Number.isNaN(numericValue) && Number.isInteger(numericValue)) {
      return numericValue >= 10000
        ? String(numericValue % 10000)
        : String(numericValue);
    }

    return trimmed.toUpperCase();
  }

  public isNightLine(): boolean {
    return this.value.startsWith("N");
  }

  public equals(other: RouteNumber | null | undefined): boolean {
    return other != null && this.value === other.value;
  }
}
