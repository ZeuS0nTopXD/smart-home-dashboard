import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Database } from '../storage/database.mjs';

test('first database initializes events and readings tables', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'homegrid-'));
  const database = new Database(path.join(directory, 'events.db'));
  database.initialize();
  assert.equal(database.tableExists('events'), true);
  assert.equal(database.tableExists('readings'), true);
  database.close();
  fs.rmSync(directory, { recursive: true, force: true });
});

