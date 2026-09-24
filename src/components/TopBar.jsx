export default function TopBar({ home, safeCount, totalCount, offline = false }) {
  return (
    <header className="topbar">
      <div className="topbar-copy">
        <p className="eyebrow"><span className="eyebrow-badge">SYSTEM ACTIVE</span><span className="eyebrow-context">HomeGrid · local control center</span></p>
        <h1>Smart home automation control</h1>
        <p className="topbar-subtitle">Seven local systems, one calm control surface.</p>
      </div>
      <div className="topbar-meta">
        <div className="connection-meta">
          <span className={`status-dot ${offline ? 'status-dot-warning' : 'status-dot-safe'}`} aria-hidden="true" />
          <div><strong>{offline ? 'Backend offline' : home.connectionLabel}</strong><span>{home.lastUpdated} · {home.location}</span></div>
        </div>
        <div className="safety-pill"><span aria-hidden="true">✓</span>{safeCount} / {totalCount} systems safe</div>
      </div>
    </header>
  );
}
