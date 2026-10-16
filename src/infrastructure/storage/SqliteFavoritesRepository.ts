import { getDatabase } from "./database";
import type { Stop } from "../../domain/entities/Stop";

export interface FavoriteStop extends Stop {
  notes: string | null;
}

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
export async function getFirstUnfavoritedStop(
  userId: number,
): Promise<Stop | null> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<Omit<FavoriteRow, "notes">>(
    `SELECT s.stop_id, s.name, s.sub_name, s.lat, s.lon
     FROM stops AS s
     WHERE NOT EXISTS (
       SELECT 1 FROM favorites AS f
       WHERE f.user_id = ? AND f.stop_id = s.stop_id
     )
     ORDER BY s.stop_id
     LIMIT 1`,
    [userId],
  );

  if (!row) return null;

  return {
    stopId: row.stop_id,
    name: row.name,
    subName: row.sub_name ?? undefined,
    lat: row.lat,
    lon: row.lon,
  };
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
