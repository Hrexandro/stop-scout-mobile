import * as Location from "expo-location";
import { Coordinates } from "../../domain/entities/Coordinates";
import { ILocationService } from "../../domain/repositories/ILocationService";

export class ExpoLocationService implements ILocationService {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  }

  async getCurrentPosition(): Promise<Coordinates | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn("Brak uprawnień do odczytu lokalizacji urządzenia.");
      return null;
    }

    // Pobieramy współrzędne z balansem między dokładnością a zużyciem baterii
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  }
}
