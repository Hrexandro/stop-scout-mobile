import { StyleSheet, Text, View } from "react-native";
import { routeFormatter } from "../src/domain/utils/routeFormatter";
import DelayHighlight from "./DelayHighlight";

interface DepartureCardProps {
  routeId: number | string;
  headsign: string;
  theoreticalTime: string;
  delayInSeconds: number | null;
}

export default function DepartureCard({
  routeId,
  headsign,
  theoreticalTime,
  delayInSeconds,
}: DepartureCardProps) {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.routeBadge}>
        <Text style={styles.routeText}>{routeFormatter(routeId)}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.headsign}>{headsign}</Text>
        <Text style={styles.timeText}>Planowo: {theoreticalTime}</Text>
        <DelayHighlight delayInSeconds={delayInSeconds} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
    marginBottom: 12,
  },
  routeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  routeText: {
    color: "#1D4ED8",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
  },
  headsign: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
  },
  timeText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  delayText: {
    color: "#DC2626",
    fontWeight: "bold",
  },
});
