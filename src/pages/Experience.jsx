import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';
import { useTopBarMorph } from '../hooks/useTopBarMorph.js';
import { useConnectorLine } from '../hooks/useConnectorLine.js';
import './Experience.css';

// Generated from experience.html and then hand-tuned for React.
export default function Experience({ active = true }) {
  useSeo('/experience', active);
  useTopBarMorph('.page-experience', active);
  useConnectorLine('.timeline-wrap', '.timeline-dot', 'timeline-connector-line', { centerOnDot: true });

  return (
    <div className="page-experience">
      <div className="page-wrap">
        <div className="top-bar fade-up delay-0">
          <Link to="/" className="back-link" aria-label="Back to Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              {' '}
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          {' '}
          <span className="page-title">
            Experience
          </span>
        </div>
        <div className="timeline-outer">
          <div className="timeline-card-title fade-up delay-1">
            Career Timeline
          </div>
          <div className="timeline-card fade-up delay-2">
            <div className="timeline-wrap">
              <div className="timeline-section-label" id="section-current">
                Current
              </div>
              <div className="timeline-item">
                <div className="timeline-dot timeline-dot--current" />
                <div className="timeline-row">
                  <img className="timeline-logo" src="/assets/accenture-logo.png" alt="Accenture logo" />
                  <div className="timeline-info">
                    <div className="timeline-role">
                      Application &amp; Cloud Support Associate
                    </div>
                    <div className="timeline-company">
                      Accenture, Inc.
                    </div>
                    <div className="timeline-meta">
                      August 2026 - Present · Taguig, NCR
                    </div>
                    <div className="timeline-desc">
                      Supporting business-critical databases and cloud infrastructure through performance monitoring, troubleshooting, and timely issue resolution.
                    </div>
                  </div>
                </div>
              </div>
              <div className="timeline-section-label" id="section-past">
                Past
              </div>
              <div className="timeline-item">
                <div className="timeline-dot timeline-dot--past" />
                <div className="timeline-row">
                  <img className="timeline-logo" src="/assets/converge-logo.png" alt="Converge ICT logo" />
                  <div className="timeline-info">
                    <div className="timeline-role">
                      IT Helpdesk Intern
                    </div>
                    <div className="timeline-company">
                      Converge ICT Solutions Inc.
                    </div>
                    <div className="timeline-meta">
                      April 2025 - June 2025 · 3 mos · Pasig City, NCR
                    </div>
                    <div className="timeline-desc">
                      Provided Level 1 IT support, troubleshooting network issues and managing cases through JIRA and Salesforce.
                    </div>
                  </div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot timeline-dot--past" />
                <div className="timeline-row">
                  <img className="timeline-logo" src="/assets/cardinal-one-logo.png" alt="Mapua Cardinal One logo" />
                  <div className="timeline-info">
                    <div className="timeline-role">
                      Electronics Engineer &amp; Media Manager
                    </div>
                    <div className="timeline-company">
                      Mapua University Cardinal One
                    </div>
                    <div className="timeline-meta">
                      2023 - 2025 · 2 yrs · Manila, NCR
                    </div>
                    <div className="timeline-desc">
                      Developed vehicle electronics for Shell Eco-marathon while managing Cardinal One's branding and media presence.
                    </div>
                  </div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot timeline-dot--past" />
                <div className="timeline-row">
                  <img className="timeline-logo" src="/assets/cardinal-one-logo.png" alt="Mapua Cardinal One logo" />
                  <div className="timeline-info">
                    <div className="timeline-role">
                      Apprentice
                    </div>
                    <div className="timeline-company">
                      Mapua University Cardinal One
                    </div>
                    <div className="timeline-meta">
                      2022 - 2023 · 1 yr · Manila, NCR
                    </div>
                    <div className="timeline-desc">
                      Trained in electronics and systems engineering through hands-on prototype vehicle development.
                    </div>
                  </div>
                </div>
              </div>
              <div className="timeline-section-label" id="experience-section-education" data-section-anchor="section-education">
                Education
              </div>
              <div className="timeline-item">
                <div className="timeline-dot timeline-dot--past" />
                <div className="timeline-row">
                  <img className="timeline-logo" src="/assets/mapua-logo.png" alt="Mapua University logo" />
                  <div className="timeline-info">
                    <div className="timeline-role">
                      BS Electronics Engineering
                    </div>
                    <div className="timeline-company">
                      Mapua University
                    </div>
                    <div className="timeline-meta">
                      2021 - 2025 · Manila, NCR
                    </div>
                    <div className="timeline-desc">
                      Specialized in Advanced Internet Protocol Networking, with a focus on IoT, AI, and network engineering.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="fade-up delay-2">
          <div className="footer-links">
            <Link to="/">
              Home
            </Link>
            {' '}
            <Link to="/privacy">
              Privacy Policy
            </Link>
            {' '}
            <Link to="/terms">
              Terms and Conditions
            </Link>
          </div>
          © 2026 Jose Carlo David Ocampo. All rights reserved.
        </footer>
      </div>
      {' '}
    </div>
  );
}
