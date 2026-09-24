import { useState } from 'react';

function StatusChip({ module }) { return <span className={`status-chip status-chip-${module.status}`}>{module.statusLabel}</span>; }

function ControlButton({ children, pressed, onClick, label }) {
  return <button className={`control-button ${pressed ? 'is-on' : ''}`} type="button" aria-label={`${label}: ${children}`} aria-pressed={pressed} onClick={onClick}><span className="control-button-indicator" aria-hidden="true" /><span>{label}</span><strong>{children}</strong></button>;
}

function NoSignal({ label }) {
  return <div className="no-signal-state"><span className="no-signal-icon" aria-hidden="true">∿</span><strong>No signal</strong><span>{label} data is unavailable</span></div>;
}

export default function ModuleCard({ module, onToggle }) {
  const [feedback, setFeedback] = useState('Mock control');
  const isNoSignal = module.status === 'offline' || module.reading === null;
  const icon = module.id === 'fire' ? '♨' : module.id === 'camera' ? '◉' : module.id === 'entrance' ? '⌂' : module.id === 'solar' ? '☼' : module.id === 'earthquake' ? '≋' : module.id === 'rain' ? '◒' : '✦';
  const handleToggle = (moduleId, field) => {
    onToggle(moduleId, field);
    setFeedback('Mock control · state updated');
  };

  return (
    <article className={`module-card module-card-${module.id}`}>
      <div className="module-card-header"><div className="module-title-group"><span className="module-icon" aria-hidden="true">{icon}</span><div><h3>{module.label}</h3><span className="module-caption">{module.shortLabel} module</span></div></div><StatusChip module={module} /></div>

      {isNoSignal ? <NoSignal label={module.shortLabel} /> : <>
        {module.id === 'fire' && <div className="module-body"><div className="metric-row"><span>Smoke level</span><strong>{module.smoke}</strong></div><div className="metric-row"><span>Temperature</span><strong>{module.temperature}</strong></div><button className="module-action" type="button" onClick={() => setFeedback('Sensor test passed · mock')}>Run sensor test <span aria-hidden="true">→</span></button></div>}
        {module.id === 'camera' && <div className="module-body"><div className="camera-preview" aria-label="Camera preview placeholder"><span className="camera-live"><span className="status-dot status-dot-safe" aria-hidden="true" />LIVE</span><span className="camera-grid-line camera-grid-line-horizontal" /><span className="camera-grid-line camera-grid-line-vertical" /><strong>Perimeter view</strong></div><div className="module-inline-meta"><span>{module.coverage}</span><span>Privacy {module.privacyOn ? 'on' : 'off'}</span></div><button className="module-action" type="button" aria-pressed={module.privacyOn} onClick={() => handleToggle('camera', 'privacyOn')}>{module.privacyOn ? 'Disable privacy' : 'Enable privacy'} <span aria-hidden="true">→</span></button></div>}
        {module.id === 'entrance' && <div className="module-body"><div className="metric-row"><span>Front door</span><strong>{module.door}</strong></div><div className="metric-row"><span>Last event</span><strong>{module.lastEvent}</strong></div><button className="module-action" type="button" aria-pressed={module.armed} onClick={() => handleToggle('entrance', 'armed')}>{module.armed ? 'Disarm entrance' : 'Arm entrance'} <span aria-hidden="true">→</span></button></div>}
        {module.id === 'solar' && <div className="module-body"><div className="solar-reading"><strong>{module.generation}</strong><span>producing now</span></div><div className="solar-split"><span>Home use <strong>{module.usage}</strong></span><span>Battery <strong>{module.battery}%</strong></span></div><div className="mini-progress" aria-label={`${module.battery}% battery`}><span style={{ width: `${module.battery}%` }} /></div></div>}
        {module.id === 'earthquake' && <div className="module-body"><div className="earthquake-reading"><strong>{module.reading}</strong><span>current reading</span></div><div className="metric-row"><span>Sensor status</span><strong>{module.lastEvent}</strong></div><button className="module-action" type="button">Calibrate sensor <span aria-hidden="true">→</span></button></div>}
        {module.id === 'rain' && <div className="module-body"><div className="storage-reading"><strong>{module.level}%</strong><span>tank reserve</span></div><div className="storage-progress" aria-label={`${module.level}% tank reserve`}><span style={{ width: `${module.level}%` }} /></div><div className="solar-split"><span>Collected <strong>{module.collected}</strong></span><span>Pump <strong>{module.pump}</strong></span></div></div>}
        {module.id === 'climate' && <div className="module-body"><div className="climate-scene"><span className="section-kicker">Current scene</span><strong>{module.scene}</strong></div><div className="control-stack"><ControlButton label="Lights" pressed={module.lightOn} onClick={() => handleToggle('climate', 'lightOn')}>{module.lightOn ? 'On' : 'Off'}</ControlButton><ControlButton label="Fan" pressed={module.fanOn} onClick={() => handleToggle('climate', 'fanOn')}>{module.fanOn ? 'On' : 'Off'}</ControlButton></div></div>}
      </>}
      <div className="module-footer"><span>{feedback}</span><span aria-hidden="true">•••</span></div>
    </article>
  );
}
