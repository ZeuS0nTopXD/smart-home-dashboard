import { createInitialDashboardState } from '../data/initial-state.mjs';
import { GpioAdapter } from '../hardware/gpio-adapter.mjs';

const CONTROL_DEFINITIONS = {
  camera: { privacyOn: { field: 'privacyOn', device: 'camera_power', type: 'boolean' } },
  entrance: { armed: { field: 'armed', device: 'lock_relay', type: 'boolean' } },
  rain: { pumpOn: { field: 'pumpOn', device: 'pump_relay', type: 'boolean' } },
  climate: {
    lightOn: { field: 'lightOn', device: 'light_relay', type: 'boolean' },
    fanOn: { field: 'fanOn', device: 'fan_relay', type: 'boolean' },
  },
};

function clone(value) {
  return structuredClone(value);
}

function isExpectedType(value, type) {
  return type === 'boolean' ? typeof value === 'boolean' : true;
}

export class DeviceService {
  constructor(settings = { gpioEnabled: false }, { repository = null, pinMap } = {}) {
    this.settings = settings;
    this.repository = repository;
    this.gpioAdapter = new GpioAdapter(settings, pinMap);
    this.state = createInitialDashboardState();
  }

  get mode() {
    return this.settings.gpioEnabled ? 'gpio' : 'simulator';
  }

  getSnapshot() {
    return {
      ...clone(this.state),
      mode: this.mode,
      capabilities: {
        simulator: true,
        gpioEnabled: Boolean(this.settings.gpioEnabled),
        controls: Object.fromEntries(Object.entries(CONTROL_DEFINITIONS).map(([moduleId, controls]) => [moduleId, Object.keys(controls)])),
      },
    };
  }

  control(moduleId, control, value) {
    const definition = CONTROL_DEFINITIONS[moduleId]?.[control];
    if (!definition) {
      const error = new Error(`Unknown control: ${moduleId}.${control}`);
      error.code = 'INVALID_CONTROL';
      throw error;
    }
    if (!this.state.modules[moduleId]) {
      const error = new Error(`Unknown module: ${moduleId}`);
      error.code = 'INVALID_MODULE';
      throw error;
    }
    if (!isExpectedType(value, definition.type)) {
      const error = new Error(`Invalid value for ${moduleId}.${control}`);
      error.code = 'INVALID_VALUE';
      throw error;
    }

    if (this.settings.gpioEnabled) {
      this.gpioAdapter.write(moduleId, definition.device, value);
    }

    this.state.modules[moduleId][definition.field] = value;
    if (moduleId === 'entrance') this.state.modules.entrance.statusLabel = value ? 'Armed' : 'Disarmed';
    if (moduleId === 'rain') this.state.modules.rain.pump = value ? 'Running' : 'Idle';

    const event = {
      moduleId,
      control,
      value,
      mode: this.mode,
      createdAt: new Date().toISOString(),
    };
    this.repository?.recordEvent(event);
    return this.getSnapshot();
  }
}

export { CONTROL_DEFINITIONS };
