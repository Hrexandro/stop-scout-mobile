import { getDatabase } from "./database";
import type { Stop } from "../../domain/entities/Stop";
import type { FavoriteStop } from "../../domain/entities/FavoriteStop";
import type { IFavoritesRepository } from "../../domain/repositories/IFavoritesRepository";

interface FavoriteRow {
  stop_id: number;
  name: string;
  sub_name: string | null;
  lat: number;
  lon: number;
  notes: string | null;
}

// Dodawanie przystanku do ulubionych danego użytkownika.
export async function addFavorite(
  userId: number,
  stopId: number,
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO favorites (user_id, stop_id)
     VALUES (?, ?)
     ON CONFLICT(user_id, stop_id) DO NOTHING`,
    [userId, stopId],
  );
}

// Usuwanie przystanku z ulubionych danego użytkownika.
export async function removeFavorite(
  userId: number,
  stopId: number,
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM favorites
     WHERE user_id = ? AND stop_id = ?`,
    [userId, stopId],
  );
}

// Pobieranie ulubionych przystanków użytkownika.
export async function getUserFavorites(
  userId: number,
): Promise<FavoriteStop[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<FavoriteRow>(
    `SELECT
       s.stop_id,
       s.name,
       s.sub_name,
       s.lat,
       s.lon,
       f.notes
     FROM favorites AS f
     JOIN stops AS s ON s.stop_id = f.stop_id
     WHERE f.user_id = ?
     ORDER BY s.name`,
    [userId],
  );

  return rows.map((row) => ({
    stopId: row.stop_id,
    name: row.name,
    subName: row.sub_name ?? undefined,
    lat: row.lat,
    lon: row.lon,
    notes: row.notes,
  }));
}

export async function updateFavoriteNote(
  userId: number,
  stopId: number,
  note: string,
): Promise<void> {
  const db = await getDatabase();

  const result = await db.runAsync(
    `UPDATE favorites
     SET notes = ?
     WHERE user_id = ? AND stop_id = ?`,
    [note.trim() || null, userId, stopId],
  );

  if (result.changes === 0) {
    throw new Error("Nie znaleziono ulubionego przystanku.");
  }
}
export class SqliteFavoritesRepository implements IFavoritesRepository {
  async getUserFavorites(userId: number): Promise<FavoriteStop[]> {
    return getUserFavorites(userId);
  }

  async addFavorite(userId: number, stopId: number): Promise<void> {
    return addFavorite(userId, stopId);
  }

  async removeFavorite(userId: number, stopId: number): Promise<void> {
    return removeFavorite(userId, stopId);
  }

  async updateFavoriteNote(
    userId: number,
    stopId: number,
    note: string,
  ): Promise<void> {
    return updateFavoriteNote(userId, stopId, note);
  }
}
