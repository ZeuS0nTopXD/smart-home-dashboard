# HomeGrid Smart Home Dashboard

React/Vite dashboard plus a simulator-first Node.js backend for Raspberry Pi deployment.

## Fast local preview

From the project folder:

```bash
npm install
npm run build
node backend/server.mjs
```

Open `http://localhost:8000`. The backend serves the built React dashboard and the API from one process. It starts in simulator mode with `GPIO_ENABLED=false`.

For frontend-only editing, `npm run dev` opens the Vite preview. If the backend is not running, the UI keeps the local mock data and shows a Backend offline message.

## Raspberry Pi

Install Node.js 22+ on Raspberry Pi OS, copy this whole folder to the Pi, then run:

```bash
npm install
npm run build
bash scripts/start-backend.sh
```

From another device on the same network, open `http://PI_IP_ADDRESS:8000`.

The server listens on `0.0.0.0:8000`, creates `backend/data/smart-home.db` automatically, and serves the production `dist/` folder. No cloud server is required.

## Placeholder pins

Put the real GPIO numbers only in:

```text
backend/hardware/pin-map.mjs
```

Every pin is currently `null`. Keep `GPIO_ENABLED=false` while wiring and testing. The backend refuses to write to a missing pin. When hardware is connected, set the required values, export `GPIO_ENABLED=true`, and add the Raspberry Pi GPIO adapter implementation for the sensor/relay library you choose.

## Dashboard modules

- Fire security
- Camera security
- Entrance security
- Solar power energy
- Earthquake detection
- Smart rain storage
- Light + fan automation

## API

```text
GET  /api/health
GET  /api/dashboard
GET  /api/modules
GET  /api/events?limit=50
POST /api/modules/:moduleId/control
```

Example control request:

```json
{
  "control": "fanOn",
  "value": true
}
```

The current backend simulates controls and records them in SQLite. Real pin drivers can be added behind `backend/hardware/gpio-adapter.mjs` without changing the React API.

## Tests

```bash
npm test
node --test backend/tests/api.test.mjs backend/tests/database.test.mjs backend/tests/device-service.test.mjs
```

