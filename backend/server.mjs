import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config.mjs';
import { routeRequest } from './api/routes.mjs';
import { Database } from './storage/database.mjs';
import { Repository } from './storage/repository.mjs';
import { DeviceService } from './services/device-service.mjs';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
};

function sendStatic(request, response, frontendDist) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405);
    response.end();
    return;
  }
  const requestedPath = request.url === '/' ? '/index.html' : new URL(request.url, 'http://localhost').pathname;
  const candidate = path.resolve(frontendDist, `.${requestedPath}`);
  const fallback = path.join(frontendDist, 'index.html');
  const filePath = candidate.startsWith(path.resolve(frontendDist)) && fs.existsSync(candidate) ? candidate : fallback;
  if (!fs.existsSync(filePath)) {
    response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'Frontend build not found. Run npm run build first.' }));
    return;
  }
  const body = fs.readFileSync(filePath);
  response.writeHead(200, { 'content-type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream', 'cache-control': 'no-store' });
  if (request.method !== 'HEAD') response.end(body); else response.end();
}

export function createServer({ settings = loadConfig() } = {}) {
  const database = new Database(settings.databasePath);
  database.initialize();
  const repository = new Repository(database);
  const deviceService = new DeviceService(settings, { repository });
  const context = { settings, database, repository, deviceService };
  const server = http.createServer(async (request, response) => {
    response.setHeader('access-control-allow-origin', settings.corsOrigins.includes('*') ? '*' : settings.corsOrigins.join(','));
    response.setHeader('access-control-allow-headers', 'content-type');
    response.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
    if (request.url?.startsWith('/api/')) await routeRequest(request, response, context);
    else sendStatic(request, response, settings.frontendDist);
  });
  return { server, database, repository, deviceService };
}

export function startServer(settings = loadConfig()) {
  const app = createServer({ settings });
  app.server.listen(settings.port, settings.host, () => {
    console.log(`HomeGrid server listening at http://${settings.host}:${settings.port}`);
    console.log(`Mode: ${app.deviceService.mode}; GPIO enabled: ${Boolean(settings.gpioEnabled)}`);
  });
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) startServer();
