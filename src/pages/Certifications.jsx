import { Link } from 'react-router-dom';
import PlatformGrid from '../components/PlatformGrid.jsx';
import { useSeo } from '../hooks/useSeo.js';
import { useTopBarMorph } from '../hooks/useTopBarMorph.js';
import './Certifications.css';

// Generated from certifications.html and then hand-tuned for React.
export default function Certifications({ active = true }) {
  useSeo('/certifications', active);
  useTopBarMorph('.page-certifications', active);

  return (
    <div className="page-certifications">
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
            Certifications and Licenses
          </span>
        </div>
        <div className="cert-list">
          {/* Licenses */}
          <div className="cert-section fade-up delay-1">
            <div className="cert-category" id="section-licenses">
              Licenses
            </div>
            <div className="cert-grid">
              <div className="cert-item">
                <img className="cert-logo" src="/assets/prc-logo.png" alt="PRC logo" />
                <div className="cert-name">
                  Electronics Engineer License
                </div>
                <div className="cert-issuer">
                  Philippine Professional Regulation Commission
                </div>
                <a className="cert-verify-btn" href="https://www.prcboard.com/eele-results-march-2026-electronics-engineering-licensure-exam-list-of-passers" target="_blank" rel="noopener">
                  See credential
                </a>
              </div>
              <div className="cert-item">
                <img className="cert-logo" src="/assets/prc-logo.png" alt="PRC logo" />
                <div className="cert-name">
                  Electronics Technician License
                </div>
                <div className="cert-issuer">
                  Philippine Professional Regulation Commission
                </div>
                <a className="cert-verify-btn" href="https://www.prcboard.com/etle-results-march-2026-electronics-technician-licensure-exam-list-of-passers" target="_blank" rel="noopener">
                  See credential
                </a>
              </div>
            </div>
          </div>
          {/* Networking */}
          <div className="cert-section fade-up delay-3">
            <div className="cert-category" id="section-networking">
              Networking
            </div>
            <div className="cert-grid">
              <div className="cert-item">
                <img className="cert-logo" src="/assets/cisco-logo.png" alt="Cisco logo" />
                <div className="cert-name">
                  Network Fundamentals
                </div>
                <div className="cert-issuer">
                  Cisco Learning and Certifications
                </div>
                <a className="cert-verify-btn" href="https://www.coursera.org/account/accomplishments/specialization/666CM1P8M9AJ" target="_blank" rel="noopener">
                  See credential
                </a>
              </div>
              <div className="cert-item">
                <img className="cert-logo" src="/assets/cisco-logo.png" alt="Cisco logo" />
                <div className="cert-name">
                  CCNA: Enterprise Networking, Security, and Automation
                </div>
                <div className="cert-issuer">
                  Cisco Networking Academy
                </div>
                <a className="cert-verify-btn" href="https://drive.google.com/file/d/1Rb07RrG52IYeNGnzPzjFkWZtVKmgKpCZ/view?usp=sharing" target="_blank" rel="noopener">
                  See credential
                </a>
              </div>
              <div className="cert-item">
                <img className="cert-logo" src="/assets/cisco-logo.png" alt="Cisco logo" />
                <div className="cert-name">
                  CCNA: Switching, Routing, and Wireless Essentials
                </div>
                <div className="cert-issuer">
                  Cisco Networking Academy
                </div>
                <a className="cert-verify-btn" href="https://drive.google.com/file/d/1HB3AstXyinvABZoDOFTtwENa4HQhVvTq/view?usp=sharing" target="_blank" rel="noopener">
                  See credential
                </a>
              </div>
            </div>
          </div>
          {/* Cloud Computing */}
          <div className="cert-section fade-up delay-6">
            <div className="cert-category" id="section-cloud-computing">
              Cloud Computing
            </div>
            <div className="cert-grid">
              <div className="cert-item">
                <img className="cert-logo" src="/assets/google-cloud-logo.png" alt="Google Cloud logo" />
                <div className="cert-name">
                  Google Cloud Fundamentals
                </div>
                <div className="cert-issuer">
                  Google Cloud Training Online
                </div>
                <a className="cert-verify-btn" href="https://www.coursera.org/account/accomplishments/records/5MYY152OQTWD" target="_blank" rel="noopener">
                  See credential
                </a>
              </div>
            </div>
          </div>
          {/* Cybersecurity */}
          <div className="cert-section fade-up delay-7">
            <div className="cert-category" id="section-cybersecurity">
              Cybersecurity
            </div>
            <div className="cert-grid">
              <div className="cert-item">
                <img className="cert-logo" src="/assets/google-logo.png" alt="Google logo" />
                <div className="cert-name">
                  Foundations of Cybersecurity
                </div>
                <div className="cert-issuer">
                  Google
                </div>
                <a className="cert-verify-btn" href="https://www.coursera.org/account/accomplishments/records/B8HXJVXNMB0A" target="_blank" rel="noopener">
                  See credential
                </a>
              </div>
            </div>
          </div>
          {/* Credentials & learning profiles */}
          <div className="cert-section fade-up delay-8">
            <div className="cert-category" id="section-certifications-credentials-learning" data-section-anchor="section-credentials-learning">
              Credentials &amp; Learning
            </div>
              <PlatformGrid />
          </div>
        </div>
        <footer className="fade-up delay-9">
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
