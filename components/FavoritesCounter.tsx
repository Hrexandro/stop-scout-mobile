import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useStore } from "../src/store/useStore";

export function FavoritesCounter() {
  const count = useStore((state) => state.favoriteStops.length);
  const addStop = useStore((state) => state.addStop);

  const handleAddMockStop = () => {
    addStop({
      stopId: Date.now(),
      name: `Przystanek testowy #${count + 1}`,
      lat: 54.352,
      lon: 18.646,
    });
  };

  return (
    <View style={styles.counterBox}>
      <Text style={styles.counterText}>Zapisane ulubione: {count}</Text>

      <TouchableOpacity onPress={handleAddMockStop} style={styles.addButton}>
        <Text style={styles.buttonText}>+ Dodaj testowy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  counterBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  counterText: {
    fontWeight: "bold",
    color: "#374151",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
