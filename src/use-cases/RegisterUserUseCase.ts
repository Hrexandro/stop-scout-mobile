import {
    createUser,
    findUserByUsername,
} from "../infrastructure/storage/SqliteAuthRepository";

import { hashPassword } from "../infrastructure/security/passwordHasher";

export async function registerUser(
  username: string,
  password: string,
): Promise<{ id: number; username: string }> {
  const normalizedUsername = username.trim();

  // Sprawdzamy, czy pola nie są puste.
  if (!normalizedUsername || !password) {
    throw new Error("Nazwa użytkownika i hasło są wymagane.");
  }

  // Sprawdzamy, czy użytkownik już istnieje.
  const existingUser = await findUserByUsername(normalizedUsername);

  if (existingUser) {
    throw new Error("Użytkownik o tej nazwie już istnieje.");
  }

  // Hashujemy hasło przed zapisaniem do bazy.
  const passwordHash = await hashPassword(password);

  // Zapisujemy użytkownika w SQLite.
  const id = await createUser(normalizedUsername, passwordHash);

  return {
    id,
    username: normalizedUsername,
  };
}
