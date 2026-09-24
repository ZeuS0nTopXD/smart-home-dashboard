import { parseControlBody } from '../models/schemas.mjs';
import { HardwareNotConfiguredError } from '../hardware/gpio-adapter.mjs';

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  return raw ? JSON.parse(raw) : null;
}

export async function routeRequest(request, response, context) {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method === 'GET' && url.pathname === '/api/health') {
      sendJson(response, 200, { status: 'ok', mode: context.deviceService.mode, gpioEnabled: Boolean(context.settings.gpioEnabled), database: 'ok' });
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/dashboard') {
      sendJson(response, 200, context.deviceService.getSnapshot());
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/modules') {
      const snapshot = context.deviceService.getSnapshot();
      sendJson(response, 200, { modules: snapshot.modules, mode: snapshot.mode });
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/events') {
      sendJson(response, 200, { events: context.repository.listEvents(url.searchParams.get('limit') || 50) });
      return;
    }
    const controlMatch = url.pathname.match(/^\/api\/modules\/([^/]+)\/control$/);
    if (request.method === 'POST' && controlMatch) {
      const { control, value } = parseControlBody(await readBody(request));
      sendJson(response, 200, context.deviceService.control(controlMatch[1], control, value));
      return;
    }
    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    const status = error instanceof HardwareNotConfiguredError ? 503 : ['INVALID_CONTROL', 'INVALID_MODULE', 'INVALID_VALUE', 'INVALID_BODY', 'SyntaxError'].includes(error.code || error.name) ? 400 : 500;
    sendJson(response, status, { error: error.message });
  }
}
