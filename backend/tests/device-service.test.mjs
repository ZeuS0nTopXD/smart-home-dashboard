import test from 'node:test';
import assert from 'node:assert/strict';
import { DeviceService } from '../services/device-service.mjs';
import { GpioAdapter, HardwareNotConfiguredError } from '../hardware/gpio-adapter.mjs';

test('GPIO write refuses a placeholder pin', () => {
  const adapter = new GpioAdapter({ gpioEnabled: true }, { climate: { fan_relay: null } });
  assert.throws(
    () => adapter.write('climate', 'fan_relay', true),
    HardwareNotConfiguredError,
  );
});

test('simulator control updates state without GPIO', () => {
  const service = new DeviceService({ gpioEnabled: false });
  const result = service.control('climate', 'fanOn', true);
  assert.equal(result.modules.climate.fanOn, true);
  assert.equal(result.mode, 'simulator');
});

