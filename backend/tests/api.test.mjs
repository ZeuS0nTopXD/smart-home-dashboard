import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer } from '../server.mjs';

let directory;
let app;
let baseUrl;

test.before(async () => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'homegrid-api-'));
  app = createServer({
    settings: {
      host: '127.0.0.1',
      port: 0,
      gpioEnabled: false,
      databasePath: path.join(directory, 'events.db'),
      frontendDist: path.join(directory, 'dist'),
      corsOrigins: ['*'],
    },
  });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const address = app.server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve) => app.server.close(resolve));
  app.database.close();
  fs.rmSync(directory, { recursive: true, force: true });
});

async function request(url, options) {
  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options?.headers || {}) },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

test('dashboard endpoint returns all seven modules', async () => {
  const response = await request('/api/dashboard');
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(response.body.modules), ['fire', 'camera', 'entrance', 'solar', 'earthquake', 'rain', 'climate']);
});

test('invalid control returns 400 without mutating state', async () => {
  const before = (await request('/api/dashboard')).body;
  const response = await request('/api/modules/climate/control', { method: 'POST', body: { control: 'unknown', value: true } });
  const after = (await request('/api/dashboard')).body;
  assert.equal(response.status, 400);
  assert.deepEqual(after, before);
});

test('simulated control is saved and returned', async () => {
  const response = await request('/api/modules/climate/control', { method: 'POST', body: { control: 'fanOn', value: true } });
  assert.equal(response.status, 200);
  assert.equal(response.body.modules.climate.fanOn, true);
  const events = await request('/api/events?limit=1');
  assert.equal(events.status, 200);
  assert.equal(events.body.events[0].control, 'fanOn');
});
