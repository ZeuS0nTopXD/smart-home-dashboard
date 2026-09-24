# Smart Home Dashboard Backend and Theme Design

## Outcome

Deliver a plug-and-play smart-home dashboard that runs in simulator mode immediately on a college PC or Raspberry Pi, while leaving a clear configuration point for real Raspberry Pi GPIO pins later. The existing React dashboard will receive the screenshot-inspired visual refit without losing its seven module controls, responsive layout, or testable behavior.

## Confirmed constraints

- Frontend remains React/Vite.
- Target deployment is a Raspberry Pi, but development must work without connected hardware.
- GPIO pin numbers are not known yet and must remain placeholders.
- GPIO writes must be disabled by default for safety.
- The dashboard covers fire, camera, entrance, solar, earthquake, rain storage, and light/fan automation.
- The UI should use the provided visual reference as a theme direction: warm off-white canvas, compact navigation, editorial type contrast, dark control surface, lime accent, thin borders, and generous spacing.
- This is a frontend-plus-local-backend project, not a cloud service or authentication system.

## Recommended architecture

The project will contain two runnable parts:

1. A React/Vite frontend for the dashboard.
2. A dependency-light Node.js backend for state, commands, simulation, event history, and future GPIO adapters.

The backend will start in simulator mode with `GPIO_ENABLED=false`. It uses Node's built-in HTTP server and SQLite support, so there is no Express or database package to install. Its device service will expose the same interface in both simulator and GPIO modes, so filling in the pin map later will not require rewriting the API or React components.

SQLite will store event history and recent readings locally. The dashboard will use REST for initial loads and commands. A lightweight polling loop will keep the first version dependency-light; a later WebSocket stream can be added without changing the API contract.

## Backend modules

Planned structure:

```text
backend/
  server.mjs               # HTTP server and static frontend serving
  config.mjs               # environment flags and paths
  api/routes.mjs           # health, dashboard, module controls, events
  models/schemas.mjs       # request validation helpers
  services/devices.mjs     # simulator/GPIO-neutral device operations
  services/simulator.mjs   # deterministic mock sensor updates
  hardware/gpio-adapter.mjs# safe no-op adapter until GPIO is enabled
  hardware/pin-map.mjs     # placeholder pins, all null initially
  storage/database.mjs     # built-in SQLite setup and queries
  storage/repository.mjs   # event and reading persistence
  package.json             # backend start and test scripts
  .env.example
```

`hardware/pin-map.mjs` will group pins by module rather than scattering numbers through route handlers. Example entries include `smoke_sensor`, `door_sensor`, `lock_relay`, `water_level_sensor`, `pump_relay`, `light_relay`, and `fan_relay`, all set to `null` until provided.

## API contract

- `GET /api/health` returns service version, simulator/GPIO mode, and database status.
- `GET /api/dashboard` returns home metadata, alerts, energy/water trends, module states, and capability flags.
- `GET /api/modules` returns module states plus each module's configured/unconfigured status.
- `POST /api/modules/{module_id}/control` accepts a validated control name and target value, records an event, and delegates to the device service. In simulator mode it updates mock state; in GPIO mode it calls the adapter.
- `GET /api/events?limit=50` returns recent actions and alerts.

Unknown modules, unknown controls, invalid values, and unavailable hardware will return clear `4xx`/`5xx` JSON errors without crashing the service.

## Frontend integration

The React app will replace direct mock-state reads with a small API client and a loading/error/offline state. The mock data remains available as a development fallback when the backend is unreachable, so the UI can still be previewed independently.

Control actions will optimistically update only when the backend confirms success; failed commands will revert and show a visible error. The API base URL will be configurable through `VITE_API_BASE_URL`, with same-origin behavior suitable for a Pi-hosted build.

## Theme refit

The existing working dashboard will be restyled rather than replaced:

- Warm ivory page background and near-black/navy ink.
- Compact brand/navigation header replacing the dominant dark rail.
- Serif display headings with clean sans-serif UI text.
- Lime/chartreuse accent for active states, live indicators, and key metrics.
- Editorial two-column overview with a dark live-control panel built from real dashboard components.
- Module cards become light, bordered surfaces with restrained radius and pill controls.
- All seven modules, trend charts, toggles, no-signal states, alerts, and touch behavior remain functional.

The screenshot is treated as a visual reference only; unrelated brand copy and imagery will not be copied.

## Safety and deployment

- Default configuration is simulator mode.
- GPIO access is opt-in through an environment flag and requires configured pins.
- The backend must refuse to drive a device whose pin remains `null`.
- Development runs on the college PC with simulator data.
- Production can run the Node backend and the built Vite assets on the Pi, with the API bound to the local network only unless the user explicitly configures remote access.
- No cloud credentials, public exposure, or authentication are included in this first local-network version.

## Acceptance criteria

- `npm run build` succeeds for the themed React frontend.
- Frontend tests cover dashboard rendering, API fallback, successful controls, and command errors.
- Backend tests cover health, dashboard payload shape, simulated controls, invalid controls, and refusing unconfigured GPIO pins.
- The app opens in simulator mode with all seven modules populated.
- A user can change placeholder configuration later without editing route handlers or React component logic.
- The Pi deployment instructions clearly distinguish development mode, built frontend serving, and hardware-enable steps.
