import { useState } from 'react';

/** Verified tick — falls back to an inline SVG if the PNG fails to load. */
export default function VerifiedBadge() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="verified-badge-svg" aria-label="Verified">
        <svg viewBox="0 0 12 12">
          <path d="M4.8 8.4L2.4 6l1-1 1.4 1.4L8.6 2.6l1 1z" />
        </svg>
      </span>
    );
  }
  return <img className="verified-badge-img" src="/assets/verified-badge.png" alt="Verified" onError={() => setFailed(true)} />;
}
