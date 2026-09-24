import { describe, expect, it } from 'vitest';
import { toggleModuleField } from './dashboardState';

describe('dashboard state updates', () => {
  it('toggles one module field without mutating other modules', () => {
    const current = {
      modules: {
        entrance: { armed: true, door: 'locked' },
        climate: { lightOn: true, fanOn: false }
      }
    };

    const next = toggleModuleField(current, 'entrance', 'armed');

    expect(next.modules.entrance.armed).toBe(false);
    expect(next.modules.entrance.door).toBe('locked');
    expect(next.modules.climate).toEqual(current.modules.climate);
    expect(current.modules.entrance.armed).toBe(true);
  });
});
