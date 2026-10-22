import { Link } from 'react-router-dom';
import VerifiedBadge from '../components/VerifiedBadge.jsx';
import PlatformGrid from '../components/PlatformGrid.jsx';
import { useSeo } from '../hooks/useSeo.js';
import { useProfileTheme } from '../hooks/useProfileTheme.js';
import { useStickyHeader } from '../hooks/useStickyHeader.js';
import { useConnectorLine } from '../hooks/useConnectorLine.js';
import { useProfileEasterEgg } from '../hooks/useProfileEasterEgg.js';
import './Home.css';

// Generated from index.html and then hand-tuned for React.
export default function Home({ active = true }) {
  useSeo('/', active);
  useProfileTheme();
  useStickyHeader(active);
  useConnectorLine('.experience-list', '.exp-dot', 'exp-connector-line', { insertFirst: true, left: '7px' });
  useProfileEasterEgg();

  return (
    <div className="page-home">
      {/* Sticky header bar — slides in when the main header scrolls out */}
      <div id="stickyHeader" className="sticky-header">
        <div className="sticky-header-inner">
          <img src="/assets/profile-light.jpg" alt="" className="sticky-avatar" id="stickyAvatar" />
          {' '}
          <span className="sticky-name">
            {' '}
            Engr. Jose Carlo David Ocampo
            <VerifiedBadge />
          </span>
          <button className="theme-toggle" id="stickyThemeToggle" type="button" aria-label="Toggle light and dark mode" aria-pressed="false">
            <span className="thumb">
              <svg className="icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                {' '}
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                {' '}
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
                {' '}
                <line x1="4.5" y1="4.5" x2="6.6" y2="6.6" />
                <line x1="17.4" y1="17.4" x2="19.5" y2="19.5" />
                {' '}
                <line x1="4.5" y1="19.5" x2="6.6" y2="17.4" />
                <line x1="17.4" y1="6.6" x2="19.5" y2="4.5" />
              </svg>
              <svg className="icon icon-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 14.5A8 8 0 0 1 9.5 4a1 1 0 0 0-1.3-1.2A10 10 0 1 0 21.2 15.8a1 1 0 0 0-1.2-1.3z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
      <div className="page-wrap">
        <div className="header-card fade-up delay-0">
          <div className="profile-pic" id="profilePic">
            <canvas id="profileCanvas" width="140" height="140" aria-label="Profile photo of Engr. Jose Carlo David Ocampo" style={{ width: "100%", height: "100%", display: "block" }} />
            <video id="profileVideo" src="/assets/profile-transition.mp4" muted playsInline webkit-playsinline="true" preload="auto" disablePictureInPicture aria-hidden="true" style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: "1px", height: "1px" }} />
          </div>
          <div className="header-corner">
            <button className="theme-toggle" id="themeToggle" type="button" aria-label="Toggle light and dark mode" aria-pressed="false">
              <span className="thumb">
                <svg className="icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                  {' '}
                  <line x1="12" y1="2" x2="12" y2="5" />
                  {' '}
                  <line x1="12" y1="19" x2="12" y2="22" />
                  {' '}
                  <line x1="2" y1="12" x2="5" y2="12" />
                  {' '}
                  <line x1="19" y1="12" x2="22" y2="12" />
                  {' '}
                  <line x1="4.5" y1="4.5" x2="6.6" y2="6.6" />
                  {' '}
                  <line x1="17.4" y1="17.4" x2="19.5" y2="19.5" />
                  {' '}
                  <line x1="4.5" y1="19.5" x2="6.6" y2="17.4" />
                  {' '}
                  <line x1="17.4" y1="6.6" x2="19.5" y2="4.5" />
                </svg>
                <svg className="icon icon-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20 14.5A8 8 0 0 1 9.5 4a1 1 0 0 0-1.3-1.2A10 10 0 1 0 21.2 15.8a1 1 0 0 0-1.2-1.3z" />
                </svg>
              </span>
            </button>
          </div>
          <div className="header-info">
            <div className="header-name-row">
              <span className="header-name">
                <span className="name-line-1">
                  Engr. Jose Carlo
                </span>
                {' '}
                <span className="name-line-2">
                  David
                  {' '}
                  <span className="surname-badge">
                    Ocampo
                    <VerifiedBadge />
                  </span>
                </span>
              </span>
            </div>
            <div className="header-title">
              <span className="title-line-1">
                Application &amp; Cloud Support Associate
                <span className="title-pipe">
                  {' '}
                  |
                  {' '}
                </span>
              </span>
              {' '}
              <span className="title-line-2">
                Electronics Engineer
              </span>
            </div>
            <div className="header-location">
              <svg className="location-pin-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Metro Manila, Philippines
            </div>
            <button className="send-email-btn" onClick={() => { window.location.href='mailto:jcdcocampo@gmail.com' }}>
              Send Email
            </button>
          </div>
        </div>
        <div className="main-grid">
          <div className="col-left">
            <div id="section-about" className="section-card mob-order-about fade-up delay-1">
              <div className="section-title">
                About
              </div>
              <div className="about-text">
                <p>
                  I'm a licensed Electronics Engineer from Mapúa University, where I specialized in Advanced Internet Protocol Networking. I currently work as an Application &amp; Cloud Support Associate at Accenture Philippines, gaining hands-on experience in enterprise application and cloud support.
                </p>
                <p>
                  During my studies, I completed an internship at Converge ICT Solutions as an IT Helpdesk Intern, gaining experience in enterprise network support and Level 1 IT operations. I also contributed to IEEE-recognized research through my thesis on neural network applications for real-time sensor data prediction.
                </p>
                <p>
                  Beyond engineering, I am passionate about cloud computing, artificial intelligence, and finance. I am particularly interested in the intersection of technology and financial markets, and I continuously seek opportunities to deepen my knowledge in both fields.
                </p>
              </div>
            </div>
            <div id="section-projects" className="section-card mob-order-projects fade-up delay-4">
              <div className="section-title">
                Recent Projects
              </div>
              <div className="home-project-list">
                <Link to="/bushop-project" className="home-project-item">
                  <img className="home-project-thumb" src="/assets/projects/bushop-hero.jpg" alt="BusHop live bus tracking application" />
                  <div className="home-project-text">
                    <div className="home-project-name">
                      BusHop: Live Bus Tracking and Trip Planning for Victory Liner Routes
                    </div>
                    <div className="home-project-issuer">
                      Accenture Digital Core Elite Bootcamp
                    </div>
                  </div>
                </Link>
                {' '}
                <Link to="/mian" className="home-project-item">
                  <img className="home-project-thumb" src="/assets/projects/mian-hero.jpg" alt="Mian Portfolio Assistant" />
                  <div className="home-project-text">
                    <div className="home-project-name">
                      Mian: An Intelligent Portfolio Assistant
                    </div>
                    <div className="home-project-issuer">
                      Personal Project — AI Portfolio Assistant
                    </div>
                  </div>
                </Link>
                {' '}
                <Link to="/aguila" className="home-project-item">
                  <img className="home-project-thumb" src="/assets/projects/aguila-hero.jpg" alt="Aguila Energy-Efficient Vehicle by Mapua Cardinal One" />
                  <div className="home-project-text">
                    <div className="home-project-name">
                      Aguila: Design and Development of an Energy-Efficient Vehicle for Shell Eco-marathon
                    </div>
                    <div className="home-project-issuer">
                      Mapua University Cardinal One
                    </div>
                  </div>
                </Link>
              </div>
              <Link to="/projects" className="see-more-btn">
                See more
              </Link>
            </div>
            {/* Desktop: certifications (left) + credentials & learning (right) side by side under Recent Projects */}
            <div className="cert-row">
            <div id="section-certifications" className="section-card mob-order-certifications fade-up delay-5">
              <div className="section-title">
                Recent Certifications &amp; Licenses
              </div>
              <div className="cert-grid">
                <a className="cert-item" href="https://www.prcboard.com/eele-results-march-2026-electronics-engineering-licensure-exam-list-of-passers" target="_blank" rel="noopener">
                  <img className="cert-logo" src="/assets/prc-logo.png" alt="PRC logo" />
                  <div className="cert-text">
                    <div className="cert-name">
                      Electronics Engineer License
                    </div>
                    <div className="cert-issuer">
                      Philippine Professional Regulation Commission
                    </div>
                  </div>
                </a>
                {' '}
                <a className="cert-item" href="https://www.prcboard.com/etle-results-march-2026-electronics-technician-licensure-exam-list-of-passers" target="_blank" rel="noopener">
                  <img className="cert-logo" src="/assets/prc-logo.png" alt="PRC logo" />
                  <div className="cert-text">
                    <div className="cert-name">
                      Electronics Technician License
                    </div>
                    <div className="cert-issuer">
                      Philippine Professional Regulation Commission
                    </div>
                  </div>
                </a>
                {' '}
                <a className="cert-item" href="https://www.coursera.org/account/accomplishments/specialization/666CM1P8M9AJ" target="_blank" rel="noopener">
                  <img className="cert-logo" src="/assets/cisco-logo.png" alt="Cisco logo" />
                  <div className="cert-text">
                    <div className="cert-name">
                      Network Fundamentals
                    </div>
                    <div className="cert-issuer">
                      Cisco Learning and Certifications
                    </div>
                  </div>
                </a>
                {' '}
                <a className="cert-item" href="https://www.coursera.org/account/accomplishments/records/5MYY152OQTWD" target="_blank" rel="noopener">
                  <img className="cert-logo" src="/assets/google-cloud-logo.png" alt="Google Cloud logo" />
                  <div className="cert-text">
                    <div className="cert-name">
                      Google Cloud Fundamentals
                    </div>
                    <div className="cert-issuer">
                      Google Cloud Training Online
                    </div>
                  </div>
                </a>
              </div>
              <Link to="/certifications" className="see-more-btn">
                See more
              </Link>
            </div>
            <div id="section-credentials-learning" className="section-card cred-card mob-order-platforms fade-up delay-6">
              <div className="section-title">
                Credentials &amp; Learning
              </div>
              <PlatformGrid compact />
            </div>
            </div>
          </div>
          <div className="col-right">
            <div id="section-experience" className="section-card mob-order-experience fade-up delay-2">
              <div className="section-title">
                Experience
              </div>
              <div className="experience-list">
                <div className="exp-item active">
                  <div className="exp-dot" />
                  <div className="exp-inner">
                    <img className="exp-logo" src="/assets/accenture-logo.png" alt="Accenture logo" />
                    <div className="exp-item-info">
                      <div className="exp-name">
                        Application &amp; Cloud Support Associate
                      </div>
                      <div className="exp-company">
                        Accenture, Inc.
                      </div>
                    </div>
                    <div className="exp-year">
                      2026
                    </div>
                  </div>
                </div>
                <div className="exp-item exp-item--past">
                  <div className="exp-dot" />
                  <div className="exp-inner">
                    <img className="exp-logo" src="/assets/converge-logo.png" alt="Converge ICT logo" />
                    <div className="exp-item-info">
                      <div className="exp-name">
                        IT Helpdesk Intern
                      </div>
                      <div className="exp-company">
                        Converge ICT Solutions Inc.
                      </div>
                    </div>
                    <div className="exp-year">
                      2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="section-education" className="section-card mob-order-education fade-up delay-3">
              <div className="section-title">
                Education
              </div>
              <a className="sub-item" href="https://www.mapua.edu.ph/" target="_blank" rel="noopener">
                <img className="sub-logo" src="/assets/mapua-logo.png" alt="Mapua University logo" />
                <div className="sub-info">
                  <div className="sub-name">
                    Mapua University
                  </div>
                  <div className="sub-detail">
                    BS Electronics Engineering
                  </div>
                </div>
                <div className="sub-year">
                  2025
                </div>
              </a>
            </div>
            <div id="section-leadership" className="section-card mob-order-leadership fade-up delay-4">
              <div className="section-title">
                Leadership &amp; Activities
              </div>
              <a className="sub-item" href="https://www.facebook.com/mucardinalone/" target="_blank" rel="noopener">
                <img className="sub-logo" src="/assets/cardinal-one-logo.png" alt="Mapua Cardinal One logo" />
                <div className="sub-info">
                  <div className="sub-name">
                    Electronics Engineer
                  </div>
                  <div className="sub-detail">
                    Mapua Cardinal One
                  </div>
                </div>
              </a>
              {' '}
              <a className="sub-item" href="https://www.facebook.com/iecep.musc/" target="_blank" rel="noopener">
                <img className="sub-logo" src="/assets/iecep-logo.png" alt="IECEP MUSC logo" />
                <div className="sub-info">
                  <div className="sub-name">
                    Treasurer/Board Auditor
                  </div>
                  <div className="sub-detail">
                    IECEP – MUSC
                  </div>
                </div>
              </a>
              {' '}
              <a className="sub-item" href="https://www.facebook.com/ieeemapuasb/" target="_blank" rel="noopener">
                <img className="sub-logo" src="/assets/ieee-logo.png" alt="IEEE MUSB logo" />
                <div className="sub-info">
                  <div className="sub-name">
                    Finance Committee Head
                  </div>
                  <div className="sub-detail">
                    IEEE – MUSB
                  </div>
                </div>
              </a>
            </div>
            <div id="section-organization" className="section-card mob-order-organization fade-up delay-5">
              <div className="section-title">
                Affiliation
              </div>
              <a className="member-item" href="https://iecepnational.com/" target="_blank" rel="noopener">
                <img className="member-logo" src="/assets/iecep-national-logo.png" alt="IECEP National logo" />
                <div className="member-info">
                  <span className="member-org-name">
                    Institute of Electronics Engineers
                    <br />
                    of the Philippines (IECEP)
                  </span>
                  {' '}
                  <span className="member-chip">
                    Member
                  </span>
                </div>
                <svg className="member-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  {' '}
                  <polyline points="8 7 17 7 17 16" />
                </svg>
              </a>
            </div>
            <div id="section-social" className="section-card mob-order-social fade-up delay-6">
              <div className="section-title">
                Social Links
              </div>
              <div className="social-grid">
                <a className="social-item" href="https://www.linkedin.com/in/jcdcocampo" target="_blank" rel="noopener">
                  <img className="social-logo logo-light" src="/assets/linkedin-logo.png" alt="LinkedIn logo" />
                  {' '}
                  <img className="social-logo logo-dark" src="/assets/linkedin-logo-white.png" alt="LinkedIn logo" />
                  {' '}
                  <span className="social-name">
                    LinkedIn
                  </span>
                </a>
                {' '}
                <a className="social-item" href="https://github.com/jcdcocampo" target="_blank" rel="noopener">
                  <img className="social-logo logo-light" src="/assets/github-logo.png" alt="GitHub logo" />
                  {' '}
                  <img className="social-logo logo-dark" src="/assets/github-logo-white.png" alt="GitHub logo" />
                  {' '}
                  <span className="social-name">
                    GitHub
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <footer>
          <div className="footer-connect">
            <h2 className="footer-connect-title">
              Let's Connect
            </h2>
            <a href="mailto:jcdcocampo@gmail.com" className="footer-connect-email">
              jcdcocampo@gmail.com
            </a>
            <button className="send-email-btn" onClick={() => { window.location.href='mailto:jcdcocampo@gmail.com' }}>
              Send Email
            </button>
          </div>
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
      {/* Liquid Glass Nav */}
      {' '}
      {' '}
    </div>
  );
}
