import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DepartureCard from "../../components/DepartureCard";
import { FavoritesCounter } from "../../components/FavoritesCounter";
import { fetchStopsFromApi } from "../../src/infrastructure/api/ZtmApiClient";
import {
  saveStops,
  countStoredStops,
} from "../../src/infrastructure/storage/SqliteStopRepository";
import {
  fetchDeparturesFromApi,
  type ZtmDeparture,
} from "../../src/infrastructure/api/ZtmDeparturesClient";
import { filterRecentDepartures } from "../../src/domain/utils/departureTime";
import { useStore } from "../../src/store/useStore";

function formatDepartureTime(isoTime: string): string {
  const date = new Date(isoTime);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  }).format(date);
}

export default function HomeScreen() {
  const [departures, setDepartures] = useState<ZtmDeparture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const activeStop = useStore((state) => state.activeStop);
  const loadDepartures = useCallback(async () => {
    try {
      const data = await fetchDeparturesFromApi(activeStop.stopId);
      const filtered = filterRecentDepartures(data);

      setDepartures(filtered);
      setError(null);

      console.log(
        `Odjazdy ZTM: ${data.length}, po filtrowaniu: ${filtered.length}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nieznany błąd";

      setError(message);
      console.error("Błąd pobierania odjazdów:", message);
    } finally {
      setLoading(false);
    }
  }, [activeStop.stopId]);

  useEffect(() => {
    setDepartures([]);
    setLoading(true);
    setError(null);

    void loadDepartures();

    const interval = setInterval(() => {
      void loadDepartures();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDepartures]);

  const handleTestApi = async () => {
    try {
      const stops = await fetchStopsFromApi();

      if (stops.length === 0) {
        throw new Error("API nie zwróciło żadnych przystanków.");
      }

      await saveStops(stops);

      const storedCount = await countStoredStops();

      Alert.alert(
        "Synchronizacja zakończona",
        `Pobrano z API: ${stops.length}\n` +
          `Przystanki w SQLite: ${storedCount}`,
      );
    } catch (error) {
      Alert.alert(
        "Błąd synchronizacji",
        error instanceof Error ? error.message : "Nieznany błąd",
      );
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Najbliższe odjazdy — {activeStop.name}</Text>
      <Link href="/favorites" asChild>
        <Pressable style={styles.menuButton}>
          <Text style={styles.menuButtonText}>Wybierz przystanek</Text>
        </Pressable>
      </Link>
      <Pressable
        style={styles.menuButton}
        onPress={() => setShowTools((value) => !value)}
      >
        <Text style={styles.menuButtonText}>
          {showTools ? "Ukryj panel" : "Konto i narzędzia"}
        </Text>
      </Pressable>

      {showTools && (
        <View>
          {user ? (
            <Pressable style={styles.registerButton} onPress={logout}>
              <Text style={styles.registerButtonText}>
                Wyloguj się ({user})
              </Text>
            </Pressable>
          ) : (
            <>
              <Link href="/register" asChild>
                <Pressable style={styles.registerButton}>
                  <Text style={styles.registerButtonText}>
                    Zarejestruj użytkownika
                  </Text>
                </Pressable>
              </Link>

              <Link href="/login" asChild>
                <Pressable style={styles.registerButton}>
                  <Text style={styles.registerButtonText}>Zaloguj się</Text>
                </Pressable>
              </Link>
            </>
          )}
          <Pressable style={styles.registerButton} onPress={handleTestApi}>
            <Text style={styles.registerButtonText}>Test API ZTM</Text>
          </Pressable>
          <Pressable
            style={styles.registerButton}
            onPress={() => void loadDepartures()}
          >
            <Text style={styles.registerButtonText}>Odśwież odjazdy</Text>
          </Pressable>
        </View>
      )}
      {error && (
        <Text style={{ color: "#DC2626", marginBottom: 8 }}>
          Błąd pobierania: {error}
        </Text>
      )}
      <FlatList
        data={departures}
        keyExtractor={(item, index) =>
          `${item.id}-${item.routeId}-${item.theoreticalTime}-${index}`
        }
        renderItem={({ item }) => (
          <DepartureCard
            routeId={item.routeShortName || item.routeId}
            headsign={item.headsign}
            theoreticalTime={formatDepartureTime(item.theoreticalTime)}
            delayInSeconds={item.delayInSeconds}
          />
        )}
        ListEmptyComponent={
          <Text>
            {loading
              ? "Pobieranie odjazdów..."
              : error
                ? "Nie udało się pobrać odjazdów."
                : "Brak najbliższych odjazdów."}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1F2937",
  },
  registerButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuButton: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  menuButtonText: {
    color: "#374151",
    fontWeight: "bold",
  },
});
