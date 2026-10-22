import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';
import { useTopBarMorph } from '../hooks/useTopBarMorph.js';
import './Mian.css';

// Generated from mian.html and then hand-tuned for React.
export default function Mian() {
  useSeo('/mian');
  useTopBarMorph();

  return (
    <div className="page-mian">
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
          Artificial Intelligence
        </div>
        <h1 className="article-title fade-up delay-1">
          Mian: An Intelligent Portfolio Assistant
        </h1>
        <p className="article-subtitle fade-up delay-2">
          An AI assistant built to greet visitors of this website, answer their questions about my background, and make a personal portfolio feel a little more like a conversation.
        </p>
        <div className="hero-image fade-up delay-2">
          <img src="/assets/projects/mian-hero.jpg" alt="Mian, an intelligent portfolio assistant" />
        </div>
        <div className="article-body">
          <p className="lead fade-up delay-3">
            A resume tells you what someone has done. A conversation tells you who they are. I wanted my portfolio to do a little of both.
          </p>
          <p className="fade-up delay-3">
            Mian is the AI assistant you can find tucked into the corner of this website. She is there for anyone who would rather ask a question than scroll through a long page. Curious about my licenses? My thesis? Where I interned? You can simply ask her, and she will answer in plain conversation, the way a knowledgeable friend might.
          </p>
          <p className="fade-up delay-3">
            Behind the scenes, Mian is a custom chatbot interface that connects to a large language model through a secure proxy. I designed her personality, wrote her instructions, and gave her the context she needs to talk about my work accurately. She does not collect your messages, and she does not pretend to be something she is not. If she does not know something, she says so and points you to my email instead.
          </p>
          <p className="fade-up delay-3">
            Building Mian was my way of stepping outside the boundaries of my electronics engineering background and into something a little more personal. It pulled together everything I have been quietly drawn to over the past few years, namely artificial intelligence, web development, user experience, and the small craft of making technology feel human. None of those were part of my degree, but all of them mattered to me.
          </p>
          <p className="fade-up delay-3">
            She is also a tribute. Mian was named, designed, and dedicated to the person I love the most. Her warmth, her patience, and the way she carries herself were all inspired by her. In a small way, every visitor who talks to Mian gets to meet a piece of someone very dear to me.
          </p>
          <h2 className="fade-up delay-4">
            What She Does
          </h2>
          <ul className="fade-up delay-4">
            <li>
              Answers questions about my education, licenses, certifications, projects, and experience
            </li>
            <li>
              Keeps every conversation focused, accurate, and grounded in real information
            </li>
            <li>
              Politely redirects when a question falls outside her scope, pointing visitors to my email
            </li>
          </ul>
          <div className="article-meta fade-up delay-4">
            <p>
              <strong>
                Built with:
              </strong>
              {' '}
              HTML, CSS, JavaScript, Cloudflare Worker, and third party LLM API
            </p>
            <p>
              <strong>
                Developed with:
              </strong>
              {' '}
              Claude (Anthropic)
            </p>
            <p>
              <strong>
                Year:
              </strong>
              {' '}
              April 2026
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
