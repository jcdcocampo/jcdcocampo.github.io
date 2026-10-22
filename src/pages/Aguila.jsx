import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';
import { useTopBarMorph } from '../hooks/useTopBarMorph.js';
import './Aguila.css';

// Generated from aguila.html and then hand-tuned for React.
export default function Aguila() {
  useSeo('/aguila');
  useTopBarMorph();

  return (
    <div className="page-aguila">
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
          Energy-Efficient Vehicle Engineering
        </div>
        <h1 className="article-title fade-up delay-1">
          Aguila: Design and Development of an Energy-Efficient Vehicle for Shell Eco-marathon
        </h1>
        <p className="article-subtitle fade-up delay-2">
          Mapua University Cardinal One, competing for maximum efficiency at Shell Eco-marathon Asia Pacific and the Middle East, from internal combustion to the Philippines' first battery electric prototype.
        </p>
        <div className="hero-image fade-up delay-2">
          <img src="/assets/projects/aguila-hero.jpg" alt="Aguila energy-efficient vehicle by Mapua University Cardinal One" />
        </div>
        <div className="article-body">
          <p className="lead fade-up delay-3">
            Before I even set foot inside Mapua University, joining Cardinal One was already the plan. I had always loved cars, taking apart RC cars as a kid, customizing them, figuring out how they worked. The team was the reason I chose Mapua in the first place.
          </p>
          <p className="fade-up delay-3">
            Cardinal One competes in the Shell Eco-marathon Asia Pacific and the Middle East, a global engineering competition where teams build prototype vehicles and push them to travel as far as possible on the least amount of energy. It is not about speed. It is about efficiency, and every gram, every circuit, every design decision is measured against fuel consumption or electrical draw.
          </p>
          <p className="fade-up delay-3">
            In 2022, during my second year at Mapua, the team opened applications for apprentices. I applied. In Season 2024, I joined as an Electronics Engineer, the role I had always been working toward.
          </p>
          <h2 className="fade-up delay-3">
            Season 2024: Back on the Track
          </h2>
          <p className="fade-up delay-3">
            Season 2024 marked the team's return after years of hiatus, and Aguila ran on an internal combustion engine. My primary contribution was to the vehicle's electronics, a role that came with little room for error, since failure during a run was not an option.
          </p>
          <p className="fade-up delay-3">
            We passed the technical inspection, which in itself was a milestone for the returning team. From there, Aguila performed.
          </p>
          <ul className="fade-up delay-3">
            <li>
              7th place in the Prototype ICE division
            </li>
            <li>
              1st among all Philippine teams
            </li>
            <li>
              Technical Innovation Award, for the Atkinson cycle thesis authored by Engr. Jose Luis Villalon
            </li>
            <li>
              Mileage: 274 km/L
            </li>
          </ul>
          <h2 className="fade-up delay-4">
            Season 2025: Development Continues
          </h2>
          <p className="fade-up delay-4">
            We were unable to compete in 2025 due to time constraints and the vehicle not being ready. But the work did not stop. The team continued developing and improving Aguila, laying the groundwork for what was coming next.
          </p>
          <h2 className="fade-up delay-4">
            Season 2026: A New Frontier
          </h2>
          <p className="fade-up delay-4">
            Season 2026 was different in every way. The team made the shift from internal combustion to battery electric, a transition that put Mapua Cardinal One among the first Philippine teams to compete with a fully electric prototype at Shell Eco-marathon Asia Pacific and the Middle East. It was uncharted territory, and I was still part of it, continuing my role in vehicle electronics development while also serving as Media Manager, handling the team's branding and public presence.
          </p>
          <p className="fade-up delay-4">
            I concluded my participation during the preparation phase for 2026. Graduation and board exam preparations meant stepping away, but stepping away was not the same as leaving. The team had become my second home at Mapua, and from a distance, I still followed every update, every run, every milestone.
          </p>
          <p className="fade-up delay-4">
            Aguila passed technical inspection again. The team posted 91 km/kWh, modest by the competition's standards, but a genuine first for the Philippines in battery electric. Every first has to start somewhere.
          </p>
          <div className="article-meta fade-up delay-4">
            <p>
              <strong>
                Team:
              </strong>
              {' '}
              Mapua University Cardinal One
            </p>
            <p>
              <strong>
                Competition:
              </strong>
              {' '}
              Shell Eco-marathon Asia Pacific and the Middle East
            </p>
            <p>
              <strong>
                Role:
              </strong>
              {' '}
              Electronics Engineer, Media Manager
            </p>
            <p>
              <strong>
                Seasons:
              </strong>
              {' '}
              2024, 2026 (active participation 2022 to 2025)
            </p>
            <p>
              <strong>
                Institution:
              </strong>
              {' '}
              Mapua University
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
