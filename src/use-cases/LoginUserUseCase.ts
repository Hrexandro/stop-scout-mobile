import { findUserByUsername } from "../infrastructure/storage/SqliteAuthRepository";

import { verifyPassword } from "../infrastructure/security/passwordHasher";

export async function loginUser(
  username: string,
  password: string,
): Promise<{ id: number; username: string }> {
  const normalizedUsername = username.trim();

  const user = await findUserByUsername(normalizedUsername);

  if (!user) {
    throw new Error("Nieprawidłowa nazwa użytkownika lub hasło.");
  }

  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);

  if (!isPasswordCorrect) {
    throw new Error("Nieprawidłowa nazwa użytkownika lub hasło.");
  }

  return {
    id: user.id,
    username: user.username,
  };
}
