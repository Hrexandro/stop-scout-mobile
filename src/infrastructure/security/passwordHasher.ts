import * as bcrypt from "bcryptjs";
import * as Crypto from "expo-crypto";

bcrypt.setRandomFallback((length) => {
  const bytes = Crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes);
});

export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error("Hasło nie może być puste");
  }

  if (bcrypt.truncates(password)) {
    throw new Error("Hasło przekracza limit 72 bajtów UTF-8");
  }

  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
