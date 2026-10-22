import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';
import { useTopBarMorph } from '../hooks/useTopBarMorph.js';
import './BananaShelfLife.css';

// Generated from banana-shelflife.html and then hand-tuned for React.
export default function BananaShelfLife() {
  useSeo('/banana-shelflife');
  useTopBarMorph();

  return (
    <div className="page-banana-shelflife">
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
          Research · IEEE
        </div>
        <h1 className="article-title fade-up delay-1">
          Feedforward Neural Network for Real-time Prediction of Lakatan Banana Shelf Life using Sensor Data from Transport Conditions
        </h1>
        <p className="article-subtitle fade-up delay-2">
          An IoT and machine learning system that monitors transport conditions in real time to predict how much shelf life a batch of Lakatan bananas has left, while they are still on the way.
        </p>
        <div className="hero-image fade-up delay-2">
          <img src="/assets/projects/banana-shelflife-hero.jpg" alt="Lakatan banana shelf life prediction project" />
        </div>
        <div className="article-cta-row fade-up delay-3">
          <a className="view-full-btn" href="https://ieeexplore.ieee.org/document/11140885" target="_blank" rel="noopener">
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
            The Philippines is one of the world's largest banana producers, and Lakatan is one of the most beloved varieties in the country. Yet a significant amount of it spoils before it ever reaches the table, not because of bad farming, but because of what happens in between.
          </p>
          <p className="fade-up delay-3">
            Temperature, humidity, and the physical stress of being moved around quietly shorten a banana's remaining life while it sits in a truck or a storage facility. By the time anyone notices, the damage is already done.
          </p>
          <p className="fade-up delay-3">
            That was the problem we wanted to solve. My co-researcher and I built a system that monitors those transport conditions in real time using sensors, and feeds that data into a neural network, a program trained to recognize patterns and make predictions the way a human brain learns from experience. The system figures out how those conditions interact and uses that to estimate how much shelf life a batch of bananas has left, while they are still on the way.
          </p>
          <p className="fade-up delay-3">
            The goal was not simply to detect that something was going wrong. It was to give enough warning that someone could actually do something about it.
          </p>
          <p className="fade-up delay-3">
            I was responsible for both the software and hardware side of the project, from wiring up the sensors to writing the code and gathering the data that made everything run. It was some of the most demanding work I have done, and also some of the most rewarding.
          </p>
          <h2 className="fade-up delay-4">
            Awards and Recognition
          </h2>
          <ul className="fade-up delay-4">
            <li>
              Best Presenter — 57th EECE Thesis Colloquium
            </li>
            <li>
              Presented at the 2025 8th International Conference on Computing Methodologies and Communication (ICCMC)
            </li>
          </ul>
          <div className="article-meta fade-up delay-4">
            <p>
              <strong>
                Proponents:
              </strong>
              {' '}
              Jose Carlo David C. Ocampo, Marianne Karylle C. Felix
            </p>
            <p>
              <strong>
                Research Adviser:
              </strong>
              {' '}
              Dr. Jennifer C. Dela Cruz
            </p>
            <p>
              <strong>
                Institution:
              </strong>
              {' '}
              Mapua University — School of Electrical, Electronics, and Computer Engineering
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
