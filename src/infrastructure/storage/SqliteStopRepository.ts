import type { Stop } from "../../domain/entities/Stop";
import { getDatabase } from "./database";
import type { GeoBoundingBox } from "../../domain/value-objects/GeoBoundingBox";

interface StopRow {
  stop_id: number;
  name: string;
  sub_name: string | null;
  lat: number;
  lon: number;
}

export async function saveStop(stop: Stop): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO stops (stop_id, name, sub_name, lat, lon)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(stop_id) DO UPDATE SET
       name = excluded.name,
       sub_name = excluded.sub_name,
       lat = excluded.lat,
       lon = excluded.lon`,
    [stop.stopId, stop.name, stop.subName ?? null, stop.lat, stop.lon],
  );
}

export async function getStopById(stopId: number): Promise<Stop | null> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<StopRow>(
    "SELECT * FROM stops WHERE stop_id = ?",
    [stopId],
  );

  if (!row) {
    return null;
  }

  return {
    stopId: row.stop_id,
    name: row.name,
    subName: row.sub_name ?? undefined,
    lat: row.lat,
    lon: row.lon,
  };
}

export async function saveStops(stops: Stop[]): Promise<void> {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    const statement = await tx.prepareAsync(`
      INSERT INTO stops (stop_id, name, sub_name, lat, lon)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(stop_id) DO UPDATE SET
        name = excluded.name,
        sub_name = excluded.sub_name,
        lat = excluded.lat,
        lon = excluded.lon
    `);

    try {
      for (const stop of stops) {
        await statement.executeAsync([
          stop.stopId,
          stop.name,
          stop.subName ?? null,
          stop.lat,
          stop.lon,
        ]);
      }
    } finally {
      await statement.finalizeAsync();
    }
  });
}

export async function countStoredStops(): Promise<number> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM stops",
  );

  return result?.total ?? 0;
}
export async function searchStops(query: string): Promise<Stop[]> {
  const db = await getDatabase();

  const search = `%${query.trim()}%`;

  const rows = await db.getAllAsync<StopRow>(
    `SELECT stop_id, name, sub_name, lat, lon
     FROM stops
     WHERE name LIKE ? OR sub_name LIKE ?
     ORDER BY name, sub_name
     LIMIT 8`,
    [search, search],
  );

  return rows.map((row) => ({
    stopId: row.stop_id,
    name: row.name,
    subName: row.sub_name ?? undefined,
    lat: row.lat,
    lon: row.lon,
  }));
}

export async function getStopsInBounds(
  bounds: GeoBoundingBox,
): Promise<Stop[]> {
  const { south, west, north, east } = bounds;

  const db = await getDatabase();

  const rows = await db.getAllAsync<StopRow>(
    `SELECT stop_id, name, sub_name, lat, lon
     FROM stops
     WHERE lat BETWEEN ? AND ?
       AND lon BETWEEN ? AND ?
     ORDER BY name`,
    [south, north, west, east],
  );

  return rows.map((row) => ({
    stopId: row.stop_id,
    name: row.name,
    subName: row.sub_name ?? undefined,
    lat: row.lat,
    lon: row.lon,
  }));
}
