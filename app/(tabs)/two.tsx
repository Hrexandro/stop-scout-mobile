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
import { container } from "../../src/di/container";

import { useStore } from "../../src/store/useStore";
import { GeoBoundingBox } from "../../src/domain/value-objects/GeoBoundingBox";

export default function MapTabScreen() {
  const webViewRef = useRef<WebView>(null);
  const boundsRequestRef = useRef(0);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const handleCenterOnUser = async () => {
    try {
      setLoadingLoc(true);
      const coords = await container.getCurrentLocationUseCase.execute();

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
  const handleMapMessage = async (rawMessage: string) => {
    try {
      const message = JSON.parse(rawMessage);
      if (message.type === "addFavorite") {
        const stopId = message.stopId;

        if (!Number.isInteger(stopId) || stopId <= 0) {
          return;
        }

        const { userId, favoriteStops, addStop } = useStore.getState();

        if (userId === null) {
          Alert.alert(
            "Wymagane logowanie",
            "Zaloguj się, aby dodawać przystanki do ulubionych.",
          );
          return;
        }

        if (favoriteStops.some((stop) => stop.stopId === stopId)) {
          Alert.alert("Informacja", "Ten przystanek jest już w ulubionych.");
          return;
        }

        const stop = await container.getStopByIdUseCase.execute(stopId);

        if (!stop) {
          Alert.alert("Błąd", "Nie znaleziono przystanku w bazie.");
          return;
        }

        await addStop(stop);

        Alert.alert(
          "Dodano do ulubionych",
          `Przystanek ${stop.name} został zapisany.`,
        );

        return;
      }
      if (message.type !== "bounds") return;

      const requestNumber = ++boundsRequestRef.current;

      // Przy małym przybliżeniu nie pokazujemy pinezek.
      if (message.zoom < 15) {
        webViewRef.current?.injectJavaScript("window.renderStops([]); true;");
        return;
      }

      // Pobieramy z SQLite tylko widoczne przystanki.
      const bounds = new GeoBoundingBox(
        message.south,
        message.west,
        message.north,
        message.east,
      );

      const stops = await container.getStopsInBoundsUseCase.execute(bounds);

      // Ignorujemy wynik, jeśli użytkownik zdążył
      // już przesunąć mapę w inne miejsce.
      if (requestNumber !== boundsRequestRef.current) return;

      // Przekazujemy przystanki do Leafleta.
      webViewRef.current?.injectJavaScript(
        `window.renderStops(${JSON.stringify(stops)}); true;`,
      );

      console.log(`Mapa: znaleziono ${stops.length} przystanków.`);
    } catch (error) {
      console.error("Błąd obsługi mapy:", error);
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
          var map = L.map('map').setView([54.352, 18.646], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // Warstwa z przystankami komunikacji miejskiej.
          var stopMarkers = L.layerGroup().addTo(map);

          // React Native wywoła tę funkcję po odczycie SQLite.
          window.renderStops = function(stops) {
            stopMarkers.clearLayers();

            stops.forEach(function(stop) {
              var marker = L.marker([stop.lat, stop.lon]);

              var popup = document.createElement('div');

              var title = document.createElement('strong');
              title.textContent = stop.name;

              var details = document.createElement('div');
              details.textContent =
                'Słupek: ' + (stop.subName || '—') +
                ' | ID: ' + stop.stopId;

              popup.appendChild(title);
              popup.appendChild(details);
              var favoriteButton = document.createElement('button');

              favoriteButton.textContent = '☆ Dodaj do ulubionych';

              favoriteButton.style.cssText =
                'display:block; margin-top:10px; padding:8px; ' +
                'background:#2563EB; color:white; border:0; ' +
                'border-radius:5px; font-weight:bold;';

              favoriteButton.onclick = function() {
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({
                    type: 'addFavorite',
                    stopId: stop.stopId
                  })
                );
              };

              popup.appendChild(favoriteButton);
              marker.bindPopup(popup);
              marker.addTo(stopMarkers);
            });
          };

          // Przekazanie granic aktualnego widoku do React Native.
          function sendMapBounds() {
            var bounds = map.getBounds();

            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: 'bounds',
                south: bounds.getSouth(),
                west: bounds.getWest(),
                north: bounds.getNorth(),
                east: bounds.getEast(),
                zoom: map.getZoom()
              })
            );
          }

          // Aktualizacja po przesunięciu lub zmianie przybliżenia.
          map.on('moveend', sendMapBounds);

          // Pierwsze sprawdzenie po załadowaniu mapy.
          map.whenReady(sendMapBounds);
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
        onMessage={(event) => {
          void handleMapMessage(event.nativeEvent.data);
        }}
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
