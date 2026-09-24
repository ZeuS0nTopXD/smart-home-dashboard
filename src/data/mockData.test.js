import { describe, expect, it } from 'vitest';
import { initialDashboardData } from './mockData';

describe('initial dashboard data', () => {
  it('contains all seven smart-home modules and mock connection context', () => {
    expect(initialDashboardData.home.connectionLabel).toBe('Mock feed');
    expect(Object.keys(initialDashboardData.modules)).toEqual([
      'fire',
      'camera',
      'entrance',
      'solar',
      'earthquake',
      'rain',
      'climate'
    ]);
  });
});
