import * as SQLite from "expo-sqlite";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = initializeDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync("stopscout.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stops (
      stop_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      sub_name TEXT,
      lat REAL NOT NULL,
      lon REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL,
      stop_id INTEGER NOT NULL,
      notes TEXT,

      PRIMARY KEY (user_id, stop_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE
    );
  `);

  return db;
}
