function SolarSnapshot({ solar }) {
  return (
    <div className="snapshot-card">
      <div className="snapshot-heading"><span className="section-kicker">Power snapshot</span><span className="snapshot-icon" aria-hidden="true">↗</span></div>
      <div className="snapshot-value-row"><strong>{solar.generation}</strong><span>generated</span></div>
      <div className="snapshot-meta"><span>Using {solar.usage}</span><span>{solar.battery}% battery</span></div>
      <div className="mini-progress" aria-label={`${solar.battery}% battery`}><span style={{ width: `${solar.battery}%` }} /></div>
    </div>
  );
}

function SummaryMetric({ label, value, note, tone = 'default' }) {
  return (
    <article className={`summary-metric summary-metric-${tone}`}>
      <span className="section-kicker">{label}</span>
      <strong>{value}</strong>
      <span className="summary-metric-note">{note}</span>
    </article>
  );
}

export default function StatusOverview({ modules, alerts }) {
  const safeCount = Object.values(modules).filter((module) => module.status === 'safe').length;
  const totalCount = Object.keys(modules).length;
  const alert = alerts[0];

  return (
    <>
      <section className="metric-strip" aria-label="System summary">
        <SummaryMetric label="Systems online" value={`${safeCount} / ${totalCount}`} note={safeCount === totalCount ? 'All systems clear' : `${totalCount - safeCount} needs attention`} tone="safe" />
        <SummaryMetric label="Active alerts" value={alerts.length} note={alerts.length ? 'Review recommended' : 'No active alerts'} tone={alerts.length ? 'warning' : 'safe'} />
        <SummaryMetric label="Energy now" value={modules.solar.generation.replace(' kW', '')} note={`kW generation · ${modules.solar.battery}% battery reserve`} tone="accent" />
      </section>

      <section className="overview-grid" aria-label="Home overview">
        <article className="hero-status-card hero-status-card-paper" data-testid="live-control-panel">
          <div className="hero-status-graphic" aria-hidden="true"><span className="hero-ring hero-ring-outer" /><span className="hero-ring hero-ring-inner" /><span className="hero-check">✓</span></div>
          <div className="hero-status-copy"><span className="section-kicker">Home status</span><h2>Home systems are steady</h2><p>{safeCount} of {totalCount} systems are clear. No critical events in the last 24 hours.</p></div>
          <span className="status-chip status-chip-safe">All clear</span>
        </article>

        <article className={`alert-card alert-card-${alert.severity}`}>
          <div className="alert-heading"><span className="alert-symbol" aria-hidden="true">!</span><span className="section-kicker">Needs a look</span></div>
          <h3>{alert.title}</h3><p>{alert.detail}</p>
          <button className="text-button" type="button">Open rain storage <span aria-hidden="true">→</span></button>
        </article>

        <SolarSnapshot solar={modules.solar} />
      </section>
    </>
  );
}
