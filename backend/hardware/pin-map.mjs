export const PIN_MAP = {
  fire: {
    smoke_sensor: null,
    temperature_sensor: null,
    alarm_buzzer: null,
  },
  camera: {
    camera_power: null,
  },
  entrance: {
    door_sensor: null,
    lock_relay: null,
  },
  solar: {
    voltage_sensor: null,
    current_sensor: null,
  },
  earthquake: {
    vibration_sensor: null,
  },
  rain: {
    water_level_sensor: null,
    pump_relay: null,
    valve_relay: null,
  },
  climate: {
    light_relay: null,
    fan_relay: null,
    light_sensor: null,
    temperature_sensor: null,
  },
};

export function getPin(moduleId, device, pinMap = PIN_MAP) {
  return pinMap[moduleId]?.[device] ?? null;
}
