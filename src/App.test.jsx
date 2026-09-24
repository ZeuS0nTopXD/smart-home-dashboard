import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { initialDashboardData } from './data/mockData';

describe('Smart home dashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('backend offline'));
  });

  it('renders the HomeGrid identity and control heading', () => {
    render(<App />);

    expect(screen.getByText(/HomeGrid/)).toBeTruthy();
    expect(within(screen.getByRole('complementary')).queryByText('HomeGrid')).toBeNull();
    expect(within(screen.getByRole('complementary')).queryByText('Control center')).toBeNull();
    expect(screen.getByRole('heading', { name: /smart home automation control/i })).toBeTruthy();
  });

  it('updates reversible entrance and climate controls locally', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Disarm entrance' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fan: Off' }));

    expect(screen.getByRole('button', { name: 'Arm entrance' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fan: On' })).toBeTruthy();
  });

  it('hydrates the dashboard from the backend snapshot', async () => {
    const snapshot = structuredClone(initialDashboardData);
    snapshot.home.connectionLabel = 'Pi simulator';
    vi.mocked(globalThis.fetch).mockResolvedValue({ ok: true, json: async () => snapshot });

    render(<App />);

    await waitFor(() => expect(screen.getByText('Pi simulator')).toBeTruthy());
  });

  it('shows an offline state while keeping mock data visible', async () => {
    render(<App />);

    await waitFor(() => expect(within(screen.getByRole('status')).getByText('Backend offline')).toBeTruthy());
    expect(screen.getByText(/HomeGrid/)).toBeTruthy();
  });

  it('shows a control error when the backend rejects a command', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => initialDashboardData })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Hardware pin is not configured' }) });

    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock feed')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Fan: Off' }));

    await waitFor(() => expect(screen.getByText('Hardware pin is not configured')).toBeTruthy());
  });

  it('renders the editorial shell and live control surface', () => {
    render(<App />);

    expect(screen.getByTestId('dashboard-shell').getAttribute('data-theme')).toBe('editorial');
    expect(screen.getByTestId('live-control-panel')).toBeTruthy();
    expect(screen.getByTestId('live-control-panel').className).toContain('hero-status-card-paper');
    expect(screen.getByRole('heading', { name: /smart home/i })).toBeTruthy();
    expect(screen.getByText('SYSTEM ACTIVE')).toBeTruthy();
    expect(screen.getByText('Systems online')).toBeTruthy();
    expect(screen.getByText('Active alerts')).toBeTruthy();
    expect(screen.getByText('Energy now')).toBeTruthy();
    expect(screen.getByTestId('system-section-marker')).toBeTruthy();
  });
});
