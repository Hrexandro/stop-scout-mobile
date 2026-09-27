import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import DepartureCard from "../../components/DepartureCard";
import { FavoritesCounter } from "../../components/FavoritesCounter";

export default function HomeScreen() {
  const [departures] = useState([
    {
      id: "1",
      routeId: 10177,
      headsign: "Test 10177->177",
      theoreticalTime: "19:09",
      delayInSeconds: 1000,
    },
    {
      id: "1",
      routeId: 9,
      headsign: "Strzyża PKM",
      theoreticalTime: "19:09",
      delayInSeconds: 12,
    },
    {
      id: "2",
      routeId: 2,
      headsign: "Jelitkowo",
      theoreticalTime: "19:15",
      delayInSeconds: 0,
    },
    {
      id: "3",
      routeId: 12,
      headsign: "Ujeścisko",
      theoreticalTime: "19:22",
      delayInSeconds: 150,
    },
    {
      id: "4",
      routeId: 6,
      headsign: "Łostowice Świętokrzyska",
      theoreticalTime: "19:27",
      delayInSeconds: null,
    },
    {
      id: "5",
      routeId: 8,
      headsign: "Stogi Plaża",
      theoreticalTime: "19:31",
      delayInSeconds: 45,
    },
    {
      id: "6",
      routeId: 10,
      headsign: "Brętowo PKM",
      theoreticalTime: "19:36",
      delayInSeconds: 210,
    },
    {
      id: "7",
      routeId: 11,
      headsign: "Lawendowe Wzgórze",
      theoreticalTime: "19:42",
      delayInSeconds: 0,
    },
    {
      id: "8",
      routeId: 5,
      headsign: "Oliwa",
      theoreticalTime: "19:48",
      delayInSeconds: 85,
    },
    {
      id: "9",
      routeId: 199,
      headsign: "Wały Piastowskie",
      theoreticalTime: "19:53",
      delayInSeconds: 130,
    },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Najbliższe odjazdy (Mock)</Text>
      <FavoritesCounter />

      <FlatList
        data={departures}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DepartureCard
            routeId={item.routeId}
            headsign={item.headsign}
            theoreticalTime={item.theoreticalTime}
            delayInSeconds={item.delayInSeconds}
          />
        )}
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
});
