import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('server entry starts and exposes health', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'homegrid-start-'));
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const child = spawn(process.execPath, ['backend/server.mjs'], {
    cwd: projectRoot,
    env: { ...process.env, HOST: '127.0.0.1', PORT: '8127', DATABASE_PATH: path.join(directory, 'events.db'), GPIO_ENABLED: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('server did not announce startup')), 3000);
      const onData = (chunk) => {
        if (chunk.toString().includes('HomeGrid server listening')) {
          clearTimeout(timer);
          resolve();
        }
      };
      child.stdout.on('data', onData);
      child.stderr.on('data', onData);
      child.once('error', reject);
      child.once('exit', (code) => code && reject(new Error(`server exited with ${code}`)));
    });
    const response = await fetch('http://127.0.0.1:8127/api/health');
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'ok');
  } finally {
    child.kill();
    if (child.exitCode === null) await new Promise((resolve) => child.once('exit', resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
