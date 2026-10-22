import { useState } from 'react';
import { PLATFORMS } from '../data/platforms.js';
import './PlatformGrid.css';

// One logo card. If the logo file isn't there yet, the platform name is shown as text instead.
function PlatformPill({ name, href, logo, logoDark }) {
  const [broken, setBroken] = useState(false);
  const [darkBroken, setDarkBroken] = useState(false);
  const hasDark = !!logoDark && !darkBroken;
  return (
    <a className={'platform-pill' + (hasDark ? ' has-dark' : '')} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} (opens in a new tab)`} title={name}>
      {broken ? (
        <span className="platform-fallback">{name}</span>
      ) : (
        <>
          <img className="logo-light" src={logo} alt="" loading="lazy" onError={() => setBroken(true)} />
          {hasDark && <img className="logo-dark" src={logoDark} alt="" onError={() => setDarkBroken(true)} />}
        </>
      )}
    </a>
  );
}

/** Rounded logo cards (no captions) linking to JC's credential / learning profiles.
 *  `compact` = half-width card on the home page (2 per row); default = full width (3 per row). */
export default function PlatformGrid({ compact = false }) {
  return (
    <div className={'platform-grid' + (compact ? ' platform-grid--compact' : '')}>
      {PLATFORMS.map((p) => <PlatformPill key={p.name} {...p} />)}
    </div>
  );
}
