import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Stop } from "../src/domain/entities/Stop";
import { useStore } from "../src/store/useStore";
import { container } from "../src/di/container";

type Tab = "favorites" | "search";

export default function FavoritesScreen() {
  const userId = useStore((state) => state.userId);
  const activeStop = useStore((state) => state.activeStop);
  const setActiveStop = useStore((state) => state.setActiveStop);

  const favoriteStops = useStore((state) => state.favoriteStops);
  const loadFavorites = useStore((state) => state.loadFavorites);
  const addStop = useStore((state) => state.addStop);
  const removeStop = useStore((state) => state.removeStop);
  const updateStopNote = useStore((state) => state.updateStopNote);

  const [tab, setTab] = useState<Tab>("favorites");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Stop[]>([]);
  const [searching, setSearching] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const editingStop =
    favoriteStops.find((stop) => stop.stopId === editingId) ?? null;

  // Wczytanie ulubionych zalogowanego użytkownika.
  useEffect(() => {
    if (userId === null) {
      setEditingId(null);
      return;
    }

    void loadFavorites().catch((error) => {
      Alert.alert("Błąd odczytu ulubionych", String(error));
    });
  }, [userId, loadFavorites]);

  // Wyszukiwanie przystanków w lokalnej bazie SQLite.
  useEffect(() => {
    let active = true;

    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    container.searchStopsUseCase
      .execute(query)
      .then((stops) => {
        if (active) setResults(stops);
      })
      .catch((error) => {
        if (active) {
          Alert.alert("Błąd wyszukiwania", String(error));
        }
      })
      .finally(() => {
        if (active) setSearching(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  // Wczytanie notatki przystanku wybranego do edycji.
  useEffect(() => {
    setNoteDraft(editingStop?.notes ?? "");
  }, [editingStop?.stopId, editingStop?.notes]);

  const handleShowDepartures = (stop: Stop) => {
    setActiveStop({
      stopId: stop.stopId,
      name: stop.name,
    });

    router.replace("/");
  };

  const handleAddFavorite = async (stop: Stop) => {
    if (userId === null) {
      Alert.alert(
        "Wymagane logowanie",
        "Zaloguj się, aby dodawać ulubione przystanki.",
      );
      return;
    }

    if (busy) return;

    setBusy(true);

    try {
      await addStop(stop);
    } catch (error) {
      Alert.alert("Błąd dodawania", String(error));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveNote = async (stopId: number) => {
    if (busy) return;

    setBusy(true);

    try {
      await updateStopNote(stopId, noteDraft);
      Alert.alert("Zapisano", "Notatka została zapisana.");
    } catch (error) {
      Alert.alert("Błąd zapisu notatki", String(error));
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveFavorite = async (stopId: number) => {
    if (busy) return;

    setBusy(true);

    try {
      await removeStop(stopId);

      if (editingId === stopId) {
        setEditingId(null);
      }
    } catch (error) {
      Alert.alert("Błąd usuwania", String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: "Przystanki" }} />

      <Text style={styles.currentStop}>
        Aktualnie oglądasz: {activeStop.name}
      </Text>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "favorites" && styles.activeTab]}
          onPress={() => setTab("favorites")}
        >
          <Text style={styles.tabText}>Ulubione</Text>
        </Pressable>

        <Pressable
          style={[styles.tab, tab === "search" && styles.activeTab]}
          onPress={() => setTab("search")}
        >
          <Text style={styles.tabText}>Wyszukiwarka</Text>
        </Pressable>
      </View>

      {tab === "favorites" ? (
        <>
          <Text style={styles.heading}>
            Twoje ulubione ({favoriteStops.length})
          </Text>

          {userId === null && (
            <Text style={styles.secondary}>
              Zaloguj się, aby zarządzać ulubionymi przystankami. Wyszukiwarka
              jest dostępna bez logowania.
            </Text>
          )}

          {userId !== null && favoriteStops.length === 0 && (
            <Text style={styles.secondary}>
              Brak zapisanych przystanków. Dodaj je w wyszukiwarce.
            </Text>
          )}

          {userId !== null &&
            favoriteStops.map((stop) => (
              <View key={stop.stopId} style={styles.card}>
                <Text style={styles.itemTitle}>{stop.name}</Text>

                <Text style={styles.secondary}>
                  Słupek: {stop.subName ?? "—"} · ID: {stop.stopId}
                </Text>

                {stop.notes ? (
                  <Text style={styles.secondary}>Notatka: {stop.notes}</Text>
                ) : null}

                <View style={styles.actions}>
                  <Pressable
                    style={[styles.button, styles.primaryButton]}
                    onPress={() => handleShowDepartures(stop)}
                  >
                    <Text style={styles.buttonText}>Pokaż odjazdy</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.button, styles.outlineButton]}
                    onPress={() =>
                      setEditingId(
                        editingId === stop.stopId ? null : stop.stopId,
                      )
                    }
                  >
                    <Text style={styles.outlineText}>Edytuj notatkę</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.button, styles.removeButton]}
                    disabled={busy}
                    onPress={() => void handleRemoveFavorite(stop.stopId)}
                  >
                    <Text style={styles.buttonText}>Usuń</Text>
                  </Pressable>
                </View>

                {editingId === stop.stopId && (
                  <View style={styles.editor}>
                    <TextInput
                      style={[styles.input, styles.noteInput]}
                      value={noteDraft}
                      onChangeText={setNoteDraft}
                      placeholder="Opcjonalna notatka"
                      multiline
                    />

                    <Pressable
                      style={[styles.button, styles.primaryButton]}
                      disabled={busy}
                      onPress={() => void handleSaveNote(stop.stopId)}
                    >
                      <Text style={styles.buttonText}>Zapisz notatkę</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
        </>
      ) : (
        <>
          <Text style={styles.heading}>Wyszukaj przystanek</Text>

          <TextInput
            style={styles.input}
            placeholder="Np. Dworzec Główny"
            value={query}
            onChangeText={setQuery}
          />

          {searching && <Text style={styles.secondary}>Wyszukiwanie...</Text>}

          {query.trim().length >= 2 && !searching && results.length === 0 && (
            <Text style={styles.secondary}>Nie znaleziono przystanków.</Text>
          )}

          {results.map((stop) => {
            const saved = favoriteStops.some(
              (favorite) => favorite.stopId === stop.stopId,
            );

            return (
              <View key={stop.stopId} style={styles.card}>
                <Text style={styles.itemTitle}>{stop.name}</Text>

                <Text style={styles.secondary}>
                  Słupek: {stop.subName ?? "—"} · ID: {stop.stopId}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    style={[styles.button, styles.primaryButton]}
                    onPress={() => handleShowDepartures(stop)}
                  >
                    <Text style={styles.buttonText}>Pokaż odjazdy</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.button, styles.outlineButton]}
                    disabled={busy || saved}
                    onPress={() => void handleAddFavorite(stop)}
                  >
                    <Text style={styles.outlineText}>
                      {saved ? "W ulubionych" : "☆ Dodaj do ulubionych"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  currentStop: {
    color: "#374151",
    fontSize: 14,
    marginBottom: 4,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 14,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#BFDBFE",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  tabText: {
    fontWeight: "bold",
    color: "#1F2937",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#9CA3AF",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  itemTitle: {
    color: "#1F2937",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondary: {
    color: "#6B7280",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  outlineButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#2563EB",
    borderWidth: 1,
  },
  removeButton: {
    backgroundColor: "#DC2626",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  outlineText: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 12,
  },
  editor: {
    gap: 8,
    marginTop: 4,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
