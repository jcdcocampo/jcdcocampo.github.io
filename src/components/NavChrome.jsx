import { memo } from 'react';

// The liquid-glass nav pill + Mian button. nav.js (physics, chatbot, ⌘K) drives these
// nodes imperatively, so React renders them once and never touches them again.
function NavChrome() {
  return (
    <>
      <div id="navc" style={{ opacity: "0", position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "14px", zIndex: "1000" }}>
        <div id="pill" style={{ position: "relative", display: "flex", alignItems: "stretch", padding: "5px", borderRadius: "var(--radius-pill)", background: "linear-gradient(180deg,rgba(255,255,255,.18) 0%,rgba(245,245,255,.14) 100%)", backdropFilter: "blur(72px) saturate(240%) brightness(1.08)", WebkitBackdropFilter: "blur(72px) saturate(240%) brightness(1.08)", boxShadow: "0 0 0 .5px rgba(255,255,255,.5),0 0 0 1px rgba(0,0,0,.06),0 6px 30px rgba(0,0,0,.10),inset 0 1.5px 0 rgba(255,255,255,1),inset 0 -.5px 0 rgba(0,0,0,.04)", cursor: "grab", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", transition: "background .45s,box-shadow .45s,transform .38s ease" }}>
          <div id="rpill" style={{ position: "absolute", borderRadius: "var(--radius-pill)", pointerEvents: "none", zIndex: "0", background: "rgba(0,0,0,.10)", opacity: "1", transition: "opacity .2s ease" }} />
          <div id="ind" style={{ position: "absolute", borderRadius: "var(--radius-pill)", pointerEvents: "none", zIndex: "1", opacity: "0", transition: "opacity .18s ease", background: "rgba(0,122,255,.13)", backdropFilter: "blur(16px) saturate(400%) brightness(1.15)", WebkitBackdropFilter: "blur(16px) saturate(400%) brightness(1.15)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.68),inset 0 1.5px 0 rgba(255,255,255,.92),inset 0 -1px 0 rgba(0,0,0,.07),0 0 0 .5px rgba(255,255,255,.5),0 0 18px rgba(0,122,255,.18),0 3px 12px rgba(0,122,255,.13)" }} />
          <button className="nb" data-nav="home" style={{ color: "rgba(0,0,0,.36)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".3px", lineHeight: "1" }}>
              Home
            </span>
          </button>
          <button className="nb" data-nav="experience" style={{ color: "rgba(0,0,0,.36)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".3px", lineHeight: "1" }}>
              Experience
            </span>
          </button>
          <button className="nb" data-nav="projects" style={{ color: "rgba(0,0,0,.36)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".3px", lineHeight: "1" }}>
              Projects
            </span>
          </button>
          <button className="nb" data-nav="certs" style={{ color: "rgba(0,0,0,.36)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5" />
              <path d="M9.09 14L7 21l5-2 5 2-2.09-7" />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".3px", lineHeight: "1" }}>
              Certs
            </span>
          </button>
          <div id="wl" style={{ position: "absolute", inset: "0", pointerEvents: "none", zIndex: "3", display: "flex", alignItems: "stretch", padding: "5px", gap: "1px", willChange: "clip-path" }}>
            <div className="bw">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span style={{ fontSize: "10px", letterSpacing: ".3px", lineHeight: "1" }}>
                Home
              </span>
            </div>
            <div className="bw">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span style={{ fontSize: "10px", letterSpacing: ".3px", lineHeight: "1" }}>
                Experience
              </span>
            </div>
            <div className="bw">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span style={{ fontSize: "10px", letterSpacing: ".3px", lineHeight: "1" }}>
                Projects
              </span>
            </div>
            <div className="bw">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" />
                <path d="M9.09 14L7 21l5-2 5 2-2.09-7" />
              </svg>
              <span style={{ fontSize: "10px", letterSpacing: ".3px", lineHeight: "1" }}>
                Certs
              </span>
            </div>
          </div>
        </div>
      </div>
      <div id="mian" style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: "1001", width: "60px", height: "60px", borderRadius: "var(--radius-circle)", flexShrink: "0", display: "flex", alignItems: "center", justifyContent: "center", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: "pointer", background: "linear-gradient(180deg,rgba(255,255,255,.18) 0%,rgba(245,245,255,.14) 100%)", backdropFilter: "blur(72px) saturate(240%)", WebkitBackdropFilter: "blur(72px) saturate(240%)", boxShadow: "0 0 0 .5px rgba(255,255,255,.8),0 0 0 1px rgba(0,0,0,.06),0 8px 28px rgba(0,0,0,.09),inset 0 1.5px 0 rgba(255,255,255,1)", transition: "background .45s,box-shadow .45s,transform .38s ease" }}>
        <div id="mind" style={{ position: "absolute", width: "60px", height: "60px", borderRadius: "var(--radius-circle)", pointerEvents: "none", zIndex: "1", willChange: "transform", transformOrigin: "center", background: "rgba(0,122,255,.13)", backdropFilter: "blur(16px) saturate(400%) brightness(1.15)", WebkitBackdropFilter: "blur(16px) saturate(400%) brightness(1.15)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.68),inset 0 1.5px 0 rgba(255,255,255,.92),inset 0 -1px 0 rgba(0,0,0,.07),0 0 0 .5px rgba(255,255,255,.5),0 0 22px rgba(0,122,255,.22),0 4px 16px rgba(0,122,255,.16)", opacity: "0", transition: "opacity .25s ease" }} />
        <svg id="mico" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.38)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: "4", pointerEvents: "none", transition: "stroke .25s ease" }}>
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      </div>
    </>
  );
}

export default memo(NavChrome, () => true);
