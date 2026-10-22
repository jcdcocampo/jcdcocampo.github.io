import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';
import { useTopBarMorph } from '../hooks/useTopBarMorph.js';
import './Projects.css';

// Generated from projects.html and then hand-tuned for React.
export default function Projects({ active = true }) {
  useSeo('/projects', active);
  useTopBarMorph('.page-projects', active);

  return (
    <div className="page-projects">
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
            Projects
          </span>
        </div>
        <div className="project-list">
          {/* Personal Project */}
          <div className="project-section fade-up delay-1">
            <div className="project-category" id="section-personal-project">
              Personal Project
            </div>
            <Link to="/mian" className="project-item">
              <img className="project-thumb" src="/assets/projects/mian-hero.jpg" alt="Mian Portfolio Assistant" />
              <div className="project-text">
                <div className="project-name">
                  Mian: An Intelligent Portfolio Assistant
                </div>
                <div className="project-issuer">
                  Personal Project — AI Portfolio Assistant
                </div>
              </div>
            </Link>
          </div>
          {/* Institutional Research and Projects */}
          <div className="project-section fade-up delay-2">
            <div className="project-category" id="section-institutional-research">
              Institutional Research and Projects
            </div>
            <Link to="/bushop-project" className="project-item">
              <img className="project-thumb" src="/assets/projects/bushop-hero.jpg" alt="BusHop live bus tracking application" />
              <div className="project-text">
                <div className="project-name">
                  BusHop: Live Bus Tracking and Trip Planning for Victory Liner Routes
                </div>
                <div className="project-issuer">
                  Accenture Digital Core Elite Bootcamp
                </div>
              </div>
            </Link>
            {' '}
            <Link to="/banana-shelflife" className="project-item">
              <img className="project-thumb" src="/assets/projects/banana-shelflife-hero.jpg" alt="Banana Shelf Life Research" />
              <div className="project-text">
                <div className="project-name">
                  Feedforward Neural Network for Real-time Prediction of Lakatan Banana Shelf Life using Sensor Data from Transport Conditions
                </div>
                <div className="project-issuer">
                  Institute of Electrical and Electronics Engineers
                </div>
              </div>
            </Link>
            {' '}
            <Link to="/aguila" className="project-item">
              <img className="project-thumb" src="/assets/projects/aguila-hero.jpg" alt="Aguila Energy-Efficient Vehicle by Mapua Cardinal One" />
              <div className="project-text">
                <div className="project-name">
                  Aguila: Design and Development of an Energy-Efficient Vehicle for Shell Eco-marathon
                </div>
                <div className="project-issuer">
                  Mapua University Cardinal One
                </div>
              </div>
            </Link>
            {' '}
            <Link to="/eeg-exoskeleton" className="project-item">
              <img className="project-thumb" src="/assets/projects/eeg-exoskeleton-hero.jpg" alt="EEG Exoskeleton" />
              <div className="project-text">
                <div className="project-name">
                  Electroencephalogram (EEG) Headset-controlled Lower Body Adjustable Cybernetic Exoskeleton Through a Brain-computer Interface (BCI): A Potential Rehabilitation Device for Physical Therapy
                </div>
                <div className="project-issuer">
                  Marcelo H. del Pilar National High School — Junior High School, Science, Technology, and Engineering (STE) Program
                </div>
              </div>
            </Link>
          </div>
        </div>
        <footer className="fade-up delay-6">
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
