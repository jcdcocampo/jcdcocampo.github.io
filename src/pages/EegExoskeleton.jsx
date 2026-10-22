import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';
import { useTopBarMorph } from '../hooks/useTopBarMorph.js';
import './EegExoskeleton.css';

// Generated from eeg-exoskeleton.html and then hand-tuned for React.
export default function EegExoskeleton() {
  useSeo('/eeg-exoskeleton');
  useTopBarMorph();

  return (
    <div className="page-eeg-exoskeleton">
      <div className="top-bar-spacer" />
      <div className="top-bar fade-up delay-0">
        <Link to="/projects" className="back-link" aria-label="Back to Projects">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            {' '}
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        {' '}
        <span className="breadcrumb">
          Projects
        </span>
      </div>
      <article className="article">
        <div className="article-eyebrow fade-up delay-1">
          Brain-computer Interface
        </div>
        <h1 className="article-title fade-up delay-1">
          Electroencephalogram (EEG) Headset-controlled Lower Body Adjustable Cybernetic Exoskeleton Through a Brain-computer Interface
        </h1>
        <p className="article-subtitle fade-up delay-2">
          A potential rehabilitation device for physical therapy — built by junior high school students in an open garage, powered by thought, and designed to make robotic recovery accessible to those who need it most.
        </p>
        <div className="hero-image fade-up delay-2">
          <img src="/assets/projects/eeg-exoskeleton-hero.jpg" alt="EEG headset-controlled lower body exoskeleton" />
        </div>
        <div className="article-cta-row fade-up delay-3">
          <a className="view-full-btn" href="https://ojs.aaresearchindex.com/index.php/AAJMRA/article/view/4509" target="_blank" rel="noopener">
            {' '}
            View Full Article
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              {' '}
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
        <div className="article-body">
          <p className="lead fade-up delay-3">
            In 2018, our team of five junior high school students set out to answer a question that felt bigger than us: could someone who struggles to walk control a robotic suit using only their mind?
          </p>
          <p className="fade-up delay-3">
            The answer, after months of work in an open garage with PVC pipes, servo motors, and a whole lot of debugging, was yes.
          </p>
          <p className="fade-up delay-3">
            We built a lower body exoskeleton, a wearable robotic frame that straps onto your legs and moves them for you, controlled entirely through an Emotiv Insight EEG headset that reads brain signals. Think of it as a direct line between thought and movement. The user concentrates on a mental command, the headset picks it up wirelessly, and the exoskeleton walks.
          </p>
          <p className="fade-up delay-3">
            What made ours different from the expensive commercial versions out there was accessibility. We built it from affordable, locally available materials to make robotic rehabilitation less out of reach, because the people who need it most are often the ones who can't afford what already exists.
          </p>
          <h2 className="fade-up delay-4">
            Awards and Recognition
          </h2>
          <ul className="fade-up delay-4">
            <li>
              Best Presenter, Robotics and Intelligent Machines Category — Annual Research Conference, Marcelo H. del Pilar National High School
            </li>
            <li>
              Official Entry, 2018 Regional Science and Technology Fair by DepED
            </li>
            <li>
              Top 12 out of 2,000+ research entries nationwide — Research Advocacy for Community Empowerment (RACE) by Ascendens Asia Singapore
            </li>
          </ul>
          <div className="article-meta fade-up delay-4">
            <p>
              <strong>
                Proponents:
              </strong>
              {' '}
              Ayumi Bolo, Fermina Kassandra D. Dela Cruz, Crincess Jestine N. Maglanque, Jose Carlo David C. Ocampo, Haniel Nikolai J. Rodriguez
            </p>
            <p>
              <strong>
                Research Adviser:
              </strong>
              {' '}
              Risalita C. Nalla, EdD
            </p>
            <p>
              <strong>
                Institution:
              </strong>
              {' '}
              Marcelo H. del Pilar National High School — Junior High School, Science, Technology, and Engineering (STE) Program
            </p>
          </div>
        </div>
      </article>
      <footer className="fade-up delay-5">
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
      {' '}
    </div>
  );
}
