const navigationItems = ['Overview', 'Safety', 'Energy', 'Automations'];

export default function Sidebar({ activeItem }) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-lockup" aria-label="HomeGrid mark">
        <div className="brand-mark" aria-hidden="true">
          <svg className="brand-home-mark" data-testid="home-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 10.5 12 3.5l8.5 7" />
            <path d="M5.5 9.5v10h13v-10" />
            <path d="M9.5 19.5v-6h5v6" />
          </svg>
        </div>
      </div>

      <nav className="side-nav">
        <p className="nav-label">Workspace</p>
        {navigationItems.map((item) => (
          <a className={`nav-item ${activeItem === item ? 'is-active' : ''}`} href={`#${item.toLowerCase()}`} aria-current={activeItem === item ? 'page' : undefined} key={item}>
            <span className="nav-icon" aria-hidden="true">{item === 'Overview' ? '◈' : item === 'Safety' ? '⌁' : item === 'Energy' ? '↗' : '✦'}</span>
            {item}
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot status-dot-safe" aria-hidden="true" />
        <div><strong>SIMULATOR READY</strong><span>Local feed active</span></div>
      </div>
    </aside>
  );
}
