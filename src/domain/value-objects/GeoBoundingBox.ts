import { Coordinates } from "./Coordinates";

export class GeoBoundingBox {
  constructor(
    public readonly south: number,
    public readonly west: number,
    public readonly north: number,
    public readonly east: number,
  ) {
    if (
      ![south, west, north, east].every(Number.isFinite) ||
      south < -90 ||
      north > 90 ||
      west < -180 ||
      east > 180 ||
      south > north ||
      west > east
    ) {
      throw new Error("Nieprawidłowe granice mapy.");
    }
  }

  public contains(point: Coordinates): boolean {
    return (
      point.latitude >= this.south &&
      point.latitude <= this.north &&
      point.longitude >= this.west &&
      point.longitude <= this.east
    );
  }

  public equals(other: GeoBoundingBox | null | undefined): boolean {
    return (
      other != null &&
      this.south === other.south &&
      this.west === other.west &&
      this.north === other.north &&
      this.east === other.east
    );
  }
}
