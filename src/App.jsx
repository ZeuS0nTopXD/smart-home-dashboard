import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatusOverview from './components/StatusOverview';
import ModuleCard from './components/ModuleCard';
import TrendChart from './components/TrendChart';
import { initialDashboardData } from './data/mockData';
import { toggleModuleField } from './state/dashboardState';
import { getDashboard, sendControl } from './api/client';

export default function App() {
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [isOffline, setIsOffline] = useState(false);
  const [actionError, setActionError] = useState('');
  const safeCount = Object.values(dashboardData.modules).filter((module) => module.status === 'safe').length;
  const loadDashboard = useCallback(async (signal) => {
    try {
      const snapshot = await getDashboard({ signal });
      setDashboardData(snapshot);
      setIsOffline(false);
    } catch (error) {
      if (error.name !== 'AbortError') setIsOffline(true);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard]);

  const handleToggle = async (moduleId, field) => {
    const previous = dashboardData;
    const nextValue = !dashboardData.modules[moduleId][field];
    setDashboardData((current) => toggleModuleField(current, moduleId, field));
    setActionError('');
    try {
      const snapshot = await sendControl(moduleId, field, nextValue);
      setDashboardData(snapshot);
      setIsOffline(false);
    } catch (error) {
      setDashboardData(previous);
      setActionError(error.message);
    }
  };

  const retry = () => {
    setActionError('');
    loadDashboard();
  };

  return (
    <div className="app-shell" data-theme="editorial" data-testid="dashboard-shell">
      <Sidebar activeItem="Overview" />
      <main className="main-content">
        <TopBar home={dashboardData.home} safeCount={safeCount} totalCount={Object.keys(dashboardData.modules).length} offline={isOffline} />
        {isOffline && <div className="connection-banner" role="status"><span>Backend offline</span><button type="button" onClick={retry}>Retry connection</button></div>}
        {actionError && <div className="action-error" role="alert">{actionError}</div>}
        <StatusOverview modules={dashboardData.modules} alerts={dashboardData.alerts} />

        <section className="section-block" id="overview" aria-label="Automation modules">
          <div className="section-marker" data-testid="system-section-marker"><span>01</span><span className="marker-line" aria-hidden="true" /><span>Home systems</span></div>
          <div className="section-heading"><div><span className="section-kicker">Live modules</span><h2>Control center</h2></div><span className="section-note"><span className="status-dot status-dot-safe" aria-hidden="true" />{Object.keys(dashboardData.modules).length} modules reporting</span></div>
          <div className="module-grid">
            {Object.values(dashboardData.modules).map((module) => <ModuleCard key={module.id} module={module} onToggle={handleToggle} />)}
          </div>
        </section>

        <section className="section-block" id="energy" aria-label="Energy and water insights">
          <div className="section-heading"><div><span className="section-kicker">Small trends</span><h2>Resource watch</h2></div><span className="section-note">Mock readings · last 9 updates</span></div>
          <div className="insight-grid">
            <TrendChart data={dashboardData.energyTrend} stroke="#67b8ff" label="Solar output · last 9 readings" />
            <TrendChart data={dashboardData.waterTrend} stroke="#7de1c3" label="Rain reserve · last 9 readings" />
          </div>
        </section>
      </main>
    </div>
  );
}
