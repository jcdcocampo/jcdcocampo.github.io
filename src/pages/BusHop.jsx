import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';
import { useTopBarMorph } from '../hooks/useTopBarMorph.js';
import './BusHop.css';

// Generated from bushop.html and then hand-tuned for React.
export default function BusHop() {
  useSeo('/bushop-project');
  useTopBarMorph();

  return (
    <div className="page-bushop">
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
          Capstone Project — Mobility and Applied AI
        </div>
        <h1 className="article-title fade-up delay-1">
          BusHop: Live Bus Tracking and Trip Planning for Victory Liner Routes
        </h1>
        <p className="article-subtitle fade-up delay-2">
          Our capstone project at Accenture's Digital Core Elite Bootcamp, a proposal for a web application that would tell a commuter where the bus is, when it arrives, what the fare costs, and exactly where they are allowed to board. The buses in the prototype are simulated, not live.
        </p>
        <div className="hero-image fade-up delay-2">
          <img src="/assets/projects/bushop-hero.jpg" alt="BusHop live bus tracking application" />
        </div>
        <div className="article-cta-row fade-up delay-3">
          <a className="view-full-btn" href="https://jcdcocampo.github.io/bushop/" target="_blank" rel="noopener">
            {' '}
            Visit BusHop
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              {' '}
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
        <div className="article-body">
          <p className="lead fade-up delay-3">
            BusHop is a proposal, not a service that is running today. It is a working prototype built to show what live bus information could look like for provincial commuters, and the buses moving on its map are simulated rather than reported by real vehicles. Everything around them, the routes, the terminals, the boarding rules and the fares, is drawn from published Victory Liner information, government road data and fares confirmed by riders.
          </p>
          <p className="fade-up delay-3">
            Anyone who has waited for a provincial bus knows the same three questions: is one actually coming, how long until it gets here, and how much will it cost. Printed schedules answer none of these, and none of them can be answered from the side of the road.
          </p>
          <p className="fade-up delay-3">
            BusHop is our proposed answer to those questions. It runs in any browser, with no installation and no account, and it covers Victory Liner services across Central and Northern Luzon: the Zambales, Pangasinan, Baguio and Cagayan Valley lines, in both their Express and Inner Cities forms.
          </p>
          <h2 className="fade-up delay-3">
            What It Does
          </h2>
          <p className="fade-up delay-3">
            Open the prototype and the map shows buses moving along the real road network, colour-coded by line. Set your location and you immediately see the nearest bus, its plate number, how many minutes away it is, and when it will reach you. Add a destination and the app plans the whole trip, including the fare, the arrival time, and whether the journey needs one bus or two.
          </p>
          <ul className="fade-up delay-3">
            <li>
              Live tracking of around 900 buses across four lines, simulated in this prototype
            </li>
            <li>
              Fare estimates calibrated against real Victory Liner fares
            </li>
            <li>
              Boarding points with walking, motorcycle or car travel times
            </li>
            <li>
              Automatic transfers at real terminals such as Dau, San Fernando and Urdaneta
            </li>
            <li>
              BusBoy, a conversational assistant that answers in English, Filipino or a mix of both
            </li>
          </ul>
          <h2 className="fade-up delay-4">
            How It Is Built
          </h2>
          <p className="fade-up delay-4">
            The entire application is a single HTML file served as a static page, with one small Cloudflare Worker behind the assistant so that no API key is ever exposed to the browser. The map is rendered with MapLibre GL JS over open map tiles, and the road shapes are traced against a public routing service, so the lines on screen follow the actual highways rather than straight approximations.
          </p>
          <p className="fade-up delay-4">
            The buses themselves are simulated rather than fed by live GPS, which is the main thing that separates the proposal from a deployable service. In practice the positions would come from the operator's own GPS units. For now, each bus is generated from a seeded model, so every device shows the same fleet without any server, and their speeds respond to rush hour, night-time, weather and terrain. Fares come from a model calibrated against fares confirmed by riders, which is why BusBoy cannot invent a number: the assistant chooses which calculation to run, but the figures come from the fare matrix and the live simulation.
          </p>
          <h2 className="fade-up delay-4">
            The Team
          </h2>
          <p className="fade-up delay-4">
            BusHop was built as our capstone project at Accenture's Digital Core Elite Bootcamp, a programme focused on applying cloud, data and AI to real problems. It was a genuinely collaborative build, and the routing, the fare model and the assistant each came out of long discussions about how commuters actually travel.
          </p>
          <div className="article-meta fade-up delay-4">
            <p>
              <strong>
                Team:
              </strong>
              {' '}
              Jose Carlo David Ocampo, Micheal Radislao, Jayrene Culasing, Nestor Morales III, Prince Mangahas
            </p>
            <p>
              <strong>
                Programme:
              </strong>
              {' '}
              Digital Core Elite Bootcamp, Accenture Philippines
            </p>
            <p>
              <strong>
                Type:
              </strong>
              {' '}
              Capstone project
            </p>
            <p>
              <strong>
                Status:
              </strong>
              {' '}
              Proposal and working prototype; bus positions are simulated, not live
            </p>
            <p>
              <strong>
                Coverage:
              </strong>
              {' '}
              Victory Liner Zambales, Pangasinan, Baguio and Cagayan Valley lines
            </p>
            <p>
              <strong>
                Live demo:
              </strong>
              {' '}
              <a href="https://jcdcocampo.github.io/bushop/" target="_blank" rel="noopener" style={{ color: "var(--accent)", textDecoration: "none" }}>
                jcdcocampo.github.io/bushop
              </a>
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
