import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { ExpoLocationService } from "../../src/infrastructure/location/ExpoLocationService";

const locationService = new ExpoLocationService();

export default function MapTabScreen() {
  const webViewRef = useRef<WebView>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const handleCenterOnUser = async () => {
    try {
      setLoadingLoc(true);
      const coords = await locationService.getCurrentPosition();

      if (!coords) {
        Alert.alert(
          "Wymagane uprawnienia",
          "Aplikacja potrzebuje dostępu do lokalizacji, aby wskazać Twoją pozycję na mapie.",
        );
        return;
      }

      // Wstrzyknięcie kodu JS do Leafleta: usunięcie starego markera, narysowanie nowego i wycentrowanie widoku
      const jsCode = `
        if (typeof userMarker !== 'undefined') {
          map.removeLayer(userMarker);
        }
        var userMarker = L.circleMarker([${coords.latitude}, ${coords.longitude}], {
          radius: 9,
          fillColor: '#2563EB',
          color: '#FFFFFF',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);
        userMarker.bindPopup("<b>Twoja lokalizacja</b>").openPopup();
        map.setView([${coords.latitude}, ${coords.longitude}], 16);
        true;
      `;

      webViewRef.current?.injectJavaScript(jsCode);
    } catch (error) {
      Alert.alert(
        "Błąd GPS",
        "Nie udało się pobrać aktualnej pozycji urządzenia.",
      );
      console.error(error);
    } finally {
      setLoadingLoc(false);
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([54.352, 18.646], 14);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          var marker = L.marker([54.352, 18.646]).addTo(map);
          marker.bindPopup("<b>Dworzec Główny</b><br>Węzeł przesiadkowy").openPopup();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: mapHtml }}
        style={styles.map}
      />

      {/* Pływający przycisk lokalizacji użytkownika (FAB) */}
      <TouchableOpacity
        disabled={loadingLoc}
        onPress={handleCenterOnUser}
        style={styles.fabButton}
      >
        {loadingLoc ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.fabText}>📍 Zlokalizuj mnie</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
