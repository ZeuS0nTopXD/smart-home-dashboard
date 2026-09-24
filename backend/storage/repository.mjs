export class Repository {
  constructor(database) {
    this.database = database;
  }

  recordEvent(event) {
    const result = this.database.connection.prepare(
      'INSERT INTO events (module_id, control, value_json, mode, created_at) VALUES (?, ?, ?, ?, ?)',
    ).run(event.moduleId, event.control, JSON.stringify(event.value), event.mode, event.createdAt);
    return { id: Number(result.lastInsertRowid), ...event };
  }

  listEvents(limit = 50) {
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
    return this.database.connection.prepare(
      'SELECT id, module_id, control, value_json, mode, created_at FROM events ORDER BY id DESC LIMIT ?',
    ).all(safeLimit).map((row) => ({
      id: row.id,
      moduleId: row.module_id,
      control: row.control,
      value: JSON.parse(row.value_json),
      mode: row.mode,
      createdAt: row.created_at,
    }));
  }
}
