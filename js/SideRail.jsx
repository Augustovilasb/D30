/* SideRail.jsx — vertical floating pill that appears once the user logs in.
   Houses the community-only routes: Fórum, Road Map, Palestras. */

const RAIL_ITEMS = [
  {
    id: 'forum',
    label: 'Fórum',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
  },
  {
    id: 'roadmap',
    label: 'Road Map',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
  },
  {
    id: 'palestras',
    label: 'Palestras',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
  },
];

function SideRail({ visible, page, onNavigate }) {
  // Slide-in animation: mount only when truly visible
  return (
    <div className={'side-rail' + (visible ? ' is-visible' : '')} aria-hidden={!visible}>
      <div className="side-rail-inner">
        {RAIL_ITEMS.map((it) => (
          <button
            key={it.id}
            className={'side-rail-item' + (page === it.id ? ' active' : '')}
            data-cursor="hover"
            onClick={() => onNavigate(it.id)}
            aria-label={it.label}
          >
            <span className="side-rail-icon">{it.icon}</span>
            <span className="side-rail-label">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

window.SideRail = SideRail;
window.RAIL_ITEMS = RAIL_ITEMS;
