import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';
import { useDinoGame } from '../hooks/useDinoGame.js';
import './NotFound.css';

// Generated from 404.html and then hand-tuned for React.
export default function NotFound() {
  useSeo('/404');
  useDinoGame();

  return (
    <div className="page-notfound">
      <main className="wrap">
        <div className="eyebrow">
          Error 404
        </div>
        <h1>
          404
        </h1>
        <p className="lead">
          This page doesn't exist. Jump the cacti and make your way back.
        </p>
        <div className="game-shell" id="shell" aria-label="Mini pixel runner — a horse jumping cacti. Press space or tap to jump.">
          <canvas id="game" width="168" height="46" />
          <div className="hud">
            <span id="score">
              000
            </span>
            {' '}
            <span className="hi">
              HI
              {' '}
              <span id="hi">
                000
              </span>
            </span>
          </div>
          <div className="overlay" id="overlay">
            <div className="big" id="ovTitle">
              JUMP TO START
            </div>
            <div className="small" id="ovText">
              Clear the cacti.
            </div>
            <div className="controls-line">
              <span className="desktop-only">
                <kbd>Space</kbd> / <kbd>&uarr;</kbd> jump &nbsp;·&nbsp;{' '}
              </span>
              <span>
                tap to jump
              </span>
            </div>
          </div>
        </div>
        <div className="btns">
          <Link className="btn btn-primary" to="/">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Home
          </Link>
          <button className="btn btn-ghost" id="restart" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Restart run
          </button>
        </div>
      </main>
    </div>
  );
}
