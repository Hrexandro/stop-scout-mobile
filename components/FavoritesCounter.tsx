import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";

import { useStore } from "../src/store/useStore";
import { getFirstUnfavoritedStop } from "../src/infrastructure/storage/SqliteFavoritesRepository";

export function FavoritesCounter() {
  const userId = useStore((state) => state.userId);
  const favoriteStops = useStore((state) => state.favoriteStops);
  const loadFavorites = useStore((state) => state.loadFavorites);
  const addStop = useStore((state) => state.addStop);
  const removeStop = useStore((state) => state.removeStop);

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState("");
  const updateStopNote = useStore((state) => state.updateStopNote);
  const count = favoriteStops.length;
  const lastStop = favoriteStops[count - 1];
  useEffect(() => {
    setNoteDraft(lastStop?.notes ?? "");
  }, [lastStop?.stopId, lastStop?.notes]);
  // Wczytanie ulubionych po zalogowaniu
  useEffect(() => {
    let active = true;

    if (userId === null) {
      setLoading(false);
      return;
    }

    setLoading(true);

    loadFavorites()
      .catch((error) => {
        if (active) {
          Alert.alert("Błąd odczytu ulubionych", String(error));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, loadFavorites]);

  const handleAddStop = async () => {
    if (userId === null) {
      Alert.alert("Brak użytkownika", "Najpierw się zaloguj.");
      return;
    }

    setBusy(true);

    try {
      const stop = await getFirstUnfavoritedStop(userId);

      if (!stop) {
        Alert.alert("Brak kolejnych przystanków.");
        return;
      }

      await addStop(stop);
    } catch (error) {
      Alert.alert("Błąd dodawania", String(error));
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveStop = async () => {
    if (!lastStop) return;

    setBusy(true);

    try {
      await removeStop(lastStop.stopId);
    } catch (error) {
      Alert.alert("Błąd usuwania", String(error));
    } finally {
      setBusy(false);
    }
  };
  const handleSaveNote = async () => {
    if (!lastStop) return;

    setBusy(true);

    try {
      await updateStopNote(lastStop.stopId, noteDraft);
      Alert.alert("Sukces", "Notatka została zapisana.");
    } catch (error) {
      Alert.alert("Błąd zapisu notatki", String(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.counterBox}>
      <Text style={styles.counterText}>Zapisane ulubione: {count}</Text>

      <Text style={styles.detailsText}>
        {userId === null
          ? "Zaloguj się, aby zapisywać przystanki."
          : lastStop
            ? `Ostatni na liście: ${lastStop.name}`
            : "Brak ulubionych przystanków."}
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={handleAddStop}
          disabled={busy || loading}
          style={styles.addButton}
        >
          <Text style={styles.buttonText}>+ Dodaj przystanek</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRemoveStop}
          disabled={busy || loading || count === 0}
          style={styles.removeButton}
        >
          <Text style={styles.buttonText}>Usuń ostatni</Text>
        </TouchableOpacity>
      </View>
      {lastStop && (
        <View>
          <Text style={styles.counterText}>Notatka do: {lastStop.name}</Text>

          <TextInput
            style={styles.noteInput}
            value={noteDraft}
            onChangeText={setNoteDraft}
            placeholder="Wpisz notatkę..."
            multiline
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSaveNote}
            disabled={busy || loading}
          >
            <Text style={styles.buttonText}>Zapisz notatkę</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  counterBox: {
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  counterText: {
    fontWeight: "bold",
    color: "#374151",
    fontSize: 14,
  },
  detailsText: {
    color: "#374151",
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    padding: 10,
    marginVertical: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },
});
