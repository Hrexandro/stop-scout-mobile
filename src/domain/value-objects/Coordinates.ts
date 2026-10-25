export class Coordinates {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly accuracy: number | null = null,
  ) {
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new Error(`Nieprawidłowa szerokość geograficzna: ${latitude}`);
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new Error(`Nieprawidłowa długość geograficzna: ${longitude}`);
    }
  }

  public equals(other: Coordinates | null | undefined): boolean {
    return (
      other != null &&
      this.latitude === other.latitude &&
      this.longitude === other.longitude
    );
  }

  public distanceToInMeters(other: Coordinates): number {
    const R = 6371e3;
    const toRad = (degrees: number) => (degrees * Math.PI) / 180;

    const dLat = toRad(other.latitude - this.latitude);
    const dLon = toRad(other.longitude - this.longitude);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(this.latitude)) *
        Math.cos(toRad(other.latitude)) *
        Math.sin(dLon / 2) ** 2;

    return Math.round(
      R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a))),
    );
  }
}
