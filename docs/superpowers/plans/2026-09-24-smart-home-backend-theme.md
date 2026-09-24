# Smart Home Backend and Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing React smart-home dashboard into a simulator-first, Raspberry Pi-ready app with a FastAPI backend, safe placeholder GPIO configuration, and the approved warm editorial theme.

**Architecture:** Keep the Vite React app as the browser client and add a colocated dependency-light Node.js service under `backend/`. The backend owns dashboard state, simulated controls, built-in SQLite events, and a GPIO-neutral device interface; GPIO is opt-in and refuses unconfigured pins. The Node server serves `/api/*` and the built `dist/` directory in Pi mode, while Vite remains the development server.

**Tech Stack:** React, Vite, Vitest, Node.js 22+, built-in `node:http`, built-in `node:sqlite`, Node test runner, Raspberry Pi GPIO adapter boundary.

**Spec:** `docs/superpowers/specs/2026-09-24-smart-home-backend-theme-design.md`

## Global Constraints

- Frontend remains React/Vite.
- Target deployment is a Raspberry Pi, but development must work without connected hardware.
- GPIO pin numbers are not known yet and must remain placeholders.
- GPIO writes must be disabled by default for safety.
- The dashboard covers fire, camera, entrance, solar, earthquake, rain storage, and light/fan automation.
- The UI should use the provided visual reference as a theme direction: warm off-white canvas, compact navigation, editorial type contrast, dark control surface, lime accent, thin borders, and generous spacing.
- This is a frontend-plus-local-backend project, not a cloud service or authentication system.

## Review Focus

- GPIO enabled with a `None` pin: return a clear hardware configuration error and perform no write; tested in `backend/tests/test_device_service.py`.
- Backend unavailable: render the last local/mock dashboard with an offline message and keep the page usable; tested in `src/App.test.jsx`.
- Invalid module/control/value: return HTTP 400 and leave state unchanged; tested in `backend/tests/test_api.py`.
- First run without a database or built `dist/`: create SQLite automatically and keep API startup healthy; tested in `backend/tests/test_database.py` and `backend/tests/test_api.py`.
- Narrow/mobile viewport: keep the navigation, cards, charts, and controls readable without horizontal overflow; tested in `src/responsive.test.js` and browser verification.

## File Map

### Backend files

- Create: `backend/server.mjs` — Node HTTP server, CORS, static frontend mount, and API router.
- Create: `backend/config.mjs` — environment-backed settings.
- Create: `backend/api/routes.mjs` — health, dashboard, module, and event endpoints.
- Create: `backend/models/schemas.mjs` — request validation helpers.
- Create: `backend/data/initial-state.mjs` — simulator state matching the seven frontend modules.
- Create: `backend/services/device-service.mjs` — simulator/GPIO-neutral state and command service.
- Create: `backend/services/simulator.mjs` — deterministic simulated readings and trends.
- Create: `backend/hardware/pin-map.mjs` — `null` placeholder pins grouped by module.
- Create: `backend/hardware/gpio-adapter.mjs` — safe adapter that rejects unconfigured writes.
- Create: `backend/storage/database.mjs` — built-in SQLite initialization and connection lifecycle.
- Create: `backend/storage/repository.mjs` — event and reading persistence.
- Create: `backend/package.json` — backend start and test scripts.
- Create: `backend/.env.example` — simulator-safe configuration template.
- Create: `backend/tests/*.test.mjs` — backend coverage with Node's built-in test runner.

### Frontend files

- Create: `src/api/client.js` — API base URL, dashboard fetch, and control command helpers.
- Modify: `src/App.jsx` — load backend state, handle fallback/offline state, and send controls.
- Modify: `src/state/dashboardState.js` — preserve local reducer helpers and add snapshot/control result helpers.
- Modify: `src/components/TopBar.jsx` — compact horizontal navigation and connection state.
- Modify: `src/components/Sidebar.jsx` — convert the rail into responsive section navigation.
- Modify: `src/components/StatusOverview.jsx`, `ModuleCard.jsx`, `TrendChart.jsx` — preserve behavior while supporting API-backed data and the new composition.
- Modify: `src/styles.css` — apply ivory/ink/lime palette, editorial typography, bordered surfaces, dark live-control panel, and responsive layout.
- Modify: `src/App.test.jsx`, `src/components/dashboard.test.jsx`, `src/responsive.test.js` — API/offline/theme behavior coverage.

### Runtime and documentation files

- Create: `scripts/start-backend.sh` — Raspberry Pi/Linux startup command.
- Create: `scripts/start-backend.ps1` — Windows/college-PC startup command.
- Create: `README.md` — install, simulator, Pi deployment, pin editing, and GPIO safety instructions.
- Modify: `package.json` — add a `build:preview` convenience script only if it does not duplicate an existing command.

### Task 1: Add the safe backend foundation

**Files:**
- Create: `backend/config.mjs`, `backend/hardware/pin-map.mjs`, `backend/hardware/gpio-adapter.mjs`, `backend/data/initial-state.mjs`, `backend/services/device-service.mjs`.
- Create: `backend/tests/device-service.test.mjs`.

**Interfaces:**
- `loadConfig(env = process.env) -> Settings` returns `gpioEnabled: boolean`, `databasePath: string`, `corsOrigins: string[]`, and `frontendDist: string`.
- `PIN_MAP[moduleId][deviceName]` returns `number | null`; every initial value is `null`.
- `GpioAdapter.write(moduleId, device, value)` throws `HardwareNotConfiguredError` when GPIO is disabled or the requested pin is `null`.
- `DeviceService.getSnapshot() -> object` and `DeviceService.control(moduleId, control, value) -> object` are the stable service interface used by routes.

- [ ] **Step 1: Write failing tests for placeholder safety and simulator controls.**

```js
test('GPIO write refuses a placeholder pin', () => {
  const adapter = new GpioAdapter({ gpioEnabled: true }, { climate: { fan_relay: null } });
  assert.throws(() => adapter.write('climate', 'fan_relay', true), HardwareNotConfiguredError);
});

test('simulator control updates state without GPIO', () => {
  const service = new DeviceService({ gpioEnabled: false });
  const result = service.control('climate', 'fanOn', true);
  assert.equal(result.modules.climate.fanOn, true);
  assert.equal(result.mode, 'simulator');
});
```

- [ ] **Step 2: Run `node --test backend/tests/device-service.test.mjs` and verify the tests fail because the backend modules do not exist.**
- [ ] **Step 3: Implement `loadConfig`, the complete `PIN_MAP` with `null` values, the simulator state, the GPIO adapter error, and the minimal `DeviceService` control map for the current climate toggles and entrance arm control.**
- [ ] **Step 4: Run `node --test backend/tests/device-service.test.mjs` and verify both tests pass.**
- [ ] **Step 5: Add the remaining module control definitions for camera privacy, rain pump, and light/fan controls, then rerun the focused tests.**

### Task 2: Add SQLite persistence and FastAPI endpoints

**Files:**
- Create: `backend/storage/database.mjs`, `backend/storage/repository.mjs`, `backend/services/simulator.mjs`, `backend/models/schemas.mjs`, `backend/api/routes.mjs`, `backend/server.mjs`.
- Create: `backend/package.json`, `backend/.env.example`.
- Create: `backend/tests/api.test.mjs`, `backend/tests/database.test.mjs`.

**Interfaces:**
- `Database.initialize() -> void` creates `events` and `readings` tables idempotently using `node:sqlite`.
- `Repository.recordEvent(moduleId, control, value, mode) -> object` returns the saved event.
- `Repository.listEvents(limit) -> object[]` clamps `limit` to `1..100`.
- `GET /api/health` returns `{status, mode, gpioEnabled, database}`.
- `GET /api/dashboard` returns `{home, alerts, energyTrend, waterTrend, modules, mode, capabilities}`.
- `GET /api/modules` returns `{modules, mode}`.
- `POST /api/modules/{module_id}/control` accepts `{"control": str, "value": object}` and returns the updated dashboard state.
- `GET /api/events?limit=50` returns `{events}`.

- [ ] **Step 1: Write failing API and database tests.**

```js
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

test('first database initializes tables', () => {
  const database = new Database(tempDatabasePath);
  database.initialize();
  assert.equal(database.tableExists('events'), true);
  assert.equal(database.tableExists('readings'), true);
});
```

- [ ] **Step 2: Run `node --test backend/tests/api.test.mjs backend/tests/database.test.mjs` and verify failure.**
- [ ] **Step 3: Implement the repository, deterministic simulator, request validation, routes, CORS, and Node server. Mount `dist/` only when it exists so API startup does not depend on a frontend build.**
- [ ] **Step 4: Run the focused backend tests and verify they pass, including automatic SQLite initialization and saved control events.**
- [ ] **Step 5: Run `node --test backend/tests/*.test.mjs` and keep the full backend suite green before frontend work.**

### Task 3: Connect React to the backend with a safe fallback

**Files:**
- Create: `src/api/client.js`.
- Modify: `src/App.jsx`, `src/state/dashboardState.js`, `src/components/TopBar.jsx`.
- Modify: `src/App.test.jsx`, `src/components/dashboard.test.jsx`.

**Interfaces:**
- `getDashboard({ signal } = {}) -> Promise<DashboardPayload>` calls `${API_BASE_URL}/api/dashboard`.
- `sendControl(moduleId, control, value) -> Promise<DashboardPayload>` posts the control payload.
- `API_BASE_URL` reads `import.meta.env.VITE_API_BASE_URL` and falls back to `""` for same-origin Pi hosting.
- `App` keeps `data`, `isLoading`, `isOffline`, and `actionError` state; a failed initial request uses `initialDashboardData` and displays an offline badge.

- [ ] **Step 1: Write failing tests for a successful API load, an offline fallback, and a rejected control.**
- [ ] **Step 2: Run `npm test -- --run src/App.test.jsx src/components/dashboard.test.jsx` and verify the new tests fail.**
- [ ] **Step 3: Implement the API client and App request flow. Use `AbortController` cleanup, confirm control responses before replacing state, and expose a retry action in the offline message.**
- [ ] **Step 4: Run the focused frontend tests and verify they pass without removing existing toggle and no-signal tests.**
- [ ] **Step 5: Run `npm test` and verify the complete existing plus new frontend suite passes.**

### Task 4: Apply the approved visual theme without changing behavior

**Files:**
- Modify: `src/styles.css`.
- Modify: `src/components/Sidebar.jsx`, `src/components/TopBar.jsx`, `src/components/StatusOverview.jsx`, `src/components/ModuleCard.jsx`, `src/components/TrendChart.jsx`.
- Modify: `src/App.jsx` only where semantic wrapper classes are required.

**Interfaces:**
- Preserve existing component props and module IDs.
- Preserve accessible button labels, control events, and test selectors.
- Keep layout usable at desktop, tablet, and narrow phone widths.

- [ ] **Step 1: Add a theme-focused test assertion that the page renders the new semantic shell while keeping the existing interaction assertions.**

```jsx
expect(screen.getByTestId('dashboard-shell')).toHaveAttribute('data-theme', 'editorial')
expect(screen.getByTestId('live-control-panel')).toBeInTheDocument()
expect(screen.getByRole('heading', { name: /smart home/i })).toBeInTheDocument()
```
- [ ] **Step 2: Run the focused component tests and verify the assertion fails against the current dark layout.**
- [ ] **Step 3: Refactor the visual shell to a compact header and editorial overview, then update CSS variables and component styles for ivory, ink, lime, serif display type, bordered cards, pill controls, and responsive stacking.**
- [ ] **Step 4: Run `npm test` and `npm run build`, verifying no behavior regressions and a successful production bundle.**
- [ ] **Step 5: Open the local preview at `http://localhost:4173/`, check desktop and narrow viewport states, and confirm the visual reference is reflected without copying its unrelated branding.**

### Task 5: Add Pi/college-PC startup and deployment instructions

**Files:**
- Create: `scripts/start-backend.sh`, `scripts/start-backend.ps1`, `README.md`.
- Modify: `backend/.env.example` if deployment variables need clarification.

**Interfaces:**
- Linux command: install Node.js 22+, build or copy `dist/`, and run `node backend/server.mjs` on `0.0.0.0:8000`.
- Windows command: install Node.js 22+ and run the same backend in simulator mode.
- Pin editing instructions point only to `backend/hardware/pin-map.mjs` and `GPIO_ENABLED=true` is explicitly described as unsafe until every required pin is configured.

- [ ] **Step 1: After adding `README.md`, run this documentation check and verify it exits without missing entries.**

```powershell
$required = @('node backend/server.mjs', 'GPIO_ENABLED=false', 'hardware/pin-map.mjs', '0.0.0.0:8000')
$missing = $required | Where-Object { -not (Select-String -Path README.md -Pattern [regex]::Escape($_) -Quiet) }
if ($missing) { throw "README is missing: $($missing -join ', ')" }
```
- [ ] **Step 2: Implement both startup scripts with quoted paths, a clear error when Python is unavailable, and the backend module path `backend.app.main:app`.**
- [ ] **Step 3: Document college-PC simulator setup, Pi deployment, browser URL using the Pi IP, and the later pin configuration workflow.**
- [ ] **Step 4: Run the documented build/start commands in the local environment, then call `/api/health` and `/api/dashboard`.**

### Task 6: Final verification and design QA

**Files:**
- Create: `design-qa.md`.
- Modify only if verification finds a concrete defect.

- [ ] **Step 1: Run `npm test` and `npm run build`.**
- [ ] **Step 2: Run `python -m pytest backend/tests -q`.**
- [ ] **Step 3: Start the Node backend in simulator mode and verify health, dashboard, control, invalid-control, and events requests.**
- [ ] **Step 4: Capture the implementation in the browser at the same viewport used for the supplied reference and compare palette, spacing, type contrast, card treatment, header density, and responsive stacking.**
- [ ] **Step 5: Write `design-qa.md` with source reference, implementation URL, findings, and the exact final line `final result: passed` when no P0/P1/P2 issue remains.**
- [ ] **Step 6: Hand off the project folder, preview URL, backend start command, and pin-map location with a concise list of verified commands.**
