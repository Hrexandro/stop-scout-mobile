import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput
} from "react-native";
import { registerUser } from "../src/use-cases/RegisterUserUseCase";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (loading) return;

    setLoading(true);

    try {
      const user = await registerUser(username, password);

      Alert.alert(
        "Sukces",
        `Zarejestrowano użytkownika ${user.username} (ID: ${user.id})`,
      );
    } catch (error) {
      Alert.alert(
        "Błąd rejestracji",
        error instanceof Error ? error.message : "Nieznany błąd",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          paddingTop: 40,
          justifyContent: "flex-start",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Rejestracja</Text>

        <TextInput
          style={styles.input}
          placeholder="Nazwa użytkownika"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator />
        ) : (
          <Button title="Zarejestruj" onPress={handleRegister} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
});
