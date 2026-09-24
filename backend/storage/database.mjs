import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export class Database {
  constructor(filePath) {
    this.filePath = filePath;
    this.connection = null;
  }

  initialize() {
    if (this.filePath !== ':memory:') {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    }
    this.connection = new DatabaseSync(this.filePath);
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id TEXT NOT NULL,
        control TEXT NOT NULL,
        value_json TEXT NOT NULL,
        mode TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id TEXT NOT NULL,
        reading_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  tableExists(tableName) {
    const row = this.connection.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
    return Boolean(row);
  }

  close() {
    this.connection?.close();
    this.connection = null;
  }
}
