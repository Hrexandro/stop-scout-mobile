import type { User } from "../../domain/entities/User";
import { getDatabase } from "./database";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export async function createUser(
  username: string,
  passwordHash: string,
): Promise<number> {
  const db = await getDatabase();

  const result = await db.runAsync(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, passwordHash],
  );

  return result.lastInsertRowId;
}

export async function findUserByUsername(
  username: string,
): Promise<User | null> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<{
    id: number;
    username: string;
    password_hash: string;
  }>("SELECT id, username, password_hash FROM users WHERE username = ?", [
    username,
  ]);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
  };
}
export class SqliteAuthRepository implements IAuthRepository {
  async createUser(username: string, passwordHash: string): Promise<number> {
    return createUser(username, passwordHash);
  }

  async findUserByUsername(username: string) {
    return findUserByUsername(username);
  }
}
