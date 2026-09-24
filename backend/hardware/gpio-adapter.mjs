import { getPin, PIN_MAP } from './pin-map.mjs';

export class HardwareNotConfiguredError extends Error {
  constructor(moduleId, device) {
    super(`Hardware pin is not configured for ${moduleId}.${device}`);
    this.name = 'HardwareNotConfiguredError';
    this.moduleId = moduleId;
    this.device = device;
  }
}

export class GpioAdapter {
  constructor(settings, pinMap = PIN_MAP) {
    this.settings = settings;
    this.pinMap = pinMap;
  }

  write(moduleId, device, value) {
    if (!this.settings.gpioEnabled || getPin(moduleId, device, this.pinMap) === null) {
      throw new HardwareNotConfiguredError(moduleId, device);
    }

    return { moduleId, device, pin: getPin(moduleId, device, this.pinMap), value };
  }
}
