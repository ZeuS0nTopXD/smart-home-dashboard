import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import StatusOverview from './StatusOverview';
import ModuleCard from './ModuleCard';
import TrendChart from './TrendChart';
import { initialDashboardData } from '../data/mockData';

describe('dashboard components', () => {
  it('renders the navigation and active overview item', () => {
    render(<Sidebar activeItem="Overview" />);

    expect(screen.queryByText('HomeGrid')).toBeNull();
    expect(screen.getByTestId('home-logo')).toBeTruthy();
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0);
  });

  it('renders connection context and global safety count', () => {
    render(<TopBar home={initialDashboardData.home} safeCount={6} totalCount={7} />);

    expect(screen.getByText('Mock feed')).toBeTruthy();
    expect(screen.getByText('6 / 7 systems safe')).toBeTruthy();
  });

  it('renders overview alert and energy snapshot', () => {
    render(
      <StatusOverview
        modules={initialDashboardData.modules}
        alerts={initialDashboardData.alerts}
      />
    );

    expect(screen.getByText('Home systems are steady')).toBeTruthy();
    expect(screen.getByText('Rain tank is at 78%')).toBeTruthy();
    expect(screen.getByText('3.8 kW')).toBeTruthy();
  });

  it('renders a module card and a readable trend label', () => {
    render(
      <>
        <ModuleCard module={initialDashboardData.modules.fire} onToggle={() => {}} />
        <TrendChart data={initialDashboardData.energyTrend} stroke="#67b8ff" label="Solar output" />
      </>
    );

    expect(screen.getByText('Fire security')).toBeTruthy();
    expect(screen.getByText('Clear')).toBeTruthy();
    expect(screen.getByText('Solar output')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Solar output' })).toBeTruthy();
  });

  it('renders a neutral no-signal state for an unavailable sensor', () => {
    render(<ModuleCard module={{ id: 'earthquake', label: 'Earthquake detection', shortLabel: 'Seismic', status: 'offline', statusLabel: 'Offline', reading: null }} onToggle={() => {}} />);

    expect(screen.getByText('No signal')).toBeTruthy();
    expect(screen.getByText('Seismic data is unavailable')).toBeTruthy();
  });

  it('shows the rain reserve percentage as a horizontal fill', () => {
    const { container } = render(<ModuleCard module={{ id: 'rain', label: 'Smart rain storage', shortLabel: 'Rain', status: 'warning', statusLabel: 'Reserve', level: 78, collected: '1,248 L', pump: 'Idle' }} onToggle={() => {}} />);

    expect(container.querySelector('.storage-progress span').style.width).toBe('78%');
  });

  it('shows mock feedback after the fire sensor test', () => {
    render(<ModuleCard module={{ id: 'fire', label: 'Fire security', shortLabel: 'Fire', status: 'safe', statusLabel: 'Clear', smoke: 'No smoke', temperature: '24°C' }} onToggle={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Run sensor test' }));

    expect(screen.getByText('Sensor test passed · mock')).toBeTruthy();
  });
});
