export function createInitialDashboardState() {
  return {
    home: {
      name: 'HomeGrid',
      location: 'Pune residence',
      connectionLabel: 'Simulator feed',
      lastUpdated: 'Just now',
    },
    alerts: [
      {
        id: 'alert-1',
        severity: 'warning',
        title: 'Rain tank is at 78%',
        detail: 'Good reserve · overflow valve idle',
      },
    ],
    energyTrend: [42, 56, 49, 68, 72, 66, 81, 76, 88],
    waterTrend: [41, 43, 47, 52, 58, 61, 67, 71, 78],
    modules: {
      fire: {
        id: 'fire', label: 'Fire security', shortLabel: 'Fire', status: 'safe', statusLabel: 'Clear', smoke: 'No smoke', temperature: '24°C',
      },
      camera: {
        id: 'camera', label: 'Camera security', shortLabel: 'Cameras', status: 'safe', statusLabel: 'Online', privacyOn: false, coverage: '4 / 4 online',
      },
      entrance: {
        id: 'entrance', label: 'Entrance security', shortLabel: 'Entry', status: 'safe', statusLabel: 'Armed', armed: true, door: 'Front door locked', lastEvent: 'No activity for 2h 18m',
      },
      solar: {
        id: 'solar', label: 'Solar power energy', shortLabel: 'Solar', status: 'safe', statusLabel: 'Producing', generation: '3.8 kW', usage: '1.4 kW', battery: 82,
      },
      earthquake: {
        id: 'earthquake', label: 'Earthquake detection', shortLabel: 'Seismic', status: 'safe', statusLabel: 'Stable', reading: '0.02 g', lastEvent: 'No movement detected',
      },
      rain: {
        id: 'rain', label: 'Smart rain storage', shortLabel: 'Rain', status: 'warning', statusLabel: 'Reserve', level: 78, collected: '1,248 L', pump: 'Idle', pumpOn: false,
      },
      climate: {
        id: 'climate', label: 'Light + fan automation', shortLabel: 'Climate', status: 'safe', statusLabel: 'Auto mode', lightOn: true, fanOn: false, scene: 'Evening comfort',
      },
    },
  };
}
