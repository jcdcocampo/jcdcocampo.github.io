import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';
import { useTopBarMorph } from '../hooks/useTopBarMorph.js';
import './Terms.css';

// Generated from terms.html and then hand-tuned for React.
export default function Terms() {
  useSeo('/terms');
  useTopBarMorph();

  return (
    <div className="page-terms">
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
            Terms and Conditions
          </span>
        </div>
        <div className="content-inner">
          <div className="last-updated fade-up delay-0">
            Last updated: April 2026
          </div>
          <div className="content-card fade-up delay-1">
            <h2>
              Acceptance of Terms
            </h2>
            <p>
              By accessing this website or interacting with the AI assistant ("Mian"), you agree to these Terms and Conditions. If you do not agree, please do not use the site or the chatbot.
            </p>
            <h2>
              Purpose of the Site
            </h2>
            <p>
              This is the personal website of Engr. Jose Carlo David Ocampo ("JC"). It exists to share information about JC's professional background, education, certifications, projects, and experience so that visitors can learn about him and consider connecting for opportunities.
            </p>
            <h2>
              About the AI Assistant
            </h2>
            <p>
              Mian is an AI assistant powered by a third-party large language model accessed via an external API. JC did not build, train, or develop the underlying model — he is using a borrowed AI service. Mian's role is limited to helping visitors learn about JC.
            </p>
            <div className="callout">
              AI responses can be inaccurate. Mian may misremember, generalize, or make mistakes — even when she sounds confident. Always independently verify any factual claim about JC's credentials, dates, employers, or projects against the documented sources linked elsewhere on this site, or by emailing JC directly.
            </div>
            <h2>
              No Professional Advice
            </h2>
            <p>
              Nothing said by Mian, or written elsewhere on this site, constitutes professional engineering advice, legal advice, financial advice, or any other form of professional consultation. Information is provided for general informational purposes only.
            </p>
            <h2>
              Use of the Chatbot
            </h2>
            <p>
              By using Mian, you acknowledge and agree to the following:
            </p>
            <ul>
              <li>
                Anything you type into the chatbot is transmitted to a third-party AI provider in order to generate a response.
              </li>
              <li>
                The third-party AI provider may process, log, or use your messages according to its own policies, which are outside JC's control.
              </li>
              <li>
                You will not enter sensitive personal information (passwords, government IDs, financial details, medical records, confidential business information, or private information about other people) into the chatbot.
              </li>
              <li>
                You will not use the chatbot to attempt to harm, harass, deceive, or impersonate anyone, or to extract information for malicious purposes.
              </li>
              <li>
                You will not attempt to abuse, overload, or otherwise interfere with the chatbot or the proxy service that supports it.
              </li>
            </ul>
            <h2>
              Intellectual Property
            </h2>
            <p>
              All original text, images, code, and design on this website — including the structure of the AI assistant — are the personal work of JC unless otherwise credited. Logos and trademarks of third parties (such as schools, certification bodies, and platforms) belong to their respective owners and are used here only for identification purposes.
            </p>
            <p>
              You may not republish, redistribute, or commercially reuse the content of this site without written permission from JC.
            </p>
            <h2>
              Disclaimer and Limitation of Liability
            </h2>
            <p>
              This site and the chatbot are provided "as is" and "as available," without warranties of any kind, either express or implied. JC does not guarantee that the site or the chatbot will always be available, error-free, secure, or accurate.
            </p>
            <p>
              To the fullest extent permitted by law, JC will not be liable for any direct, indirect, incidental, consequential, or other damages arising from your use of this site or the chatbot, including reliance on any information generated by Mian.
            </p>
            <h2>
              External Links
            </h2>
            <p>
              This site links to third-party websites for verification and reference. JC has no control over, and assumes no responsibility for, the content, policies, or practices of any third-party sites.
            </p>
            <h2>
              Changes to These Terms
            </h2>
            <p>
              These Terms and Conditions may be updated at any time. The "Last updated" date at the top reflects the most recent revision. Continued use of the site after changes are posted means you accept the updated terms.
            </p>
            <h2>
              Contact
            </h2>
            <p>
              For any questions about these Terms, please email
              {' '}
              <a href="mailto:jcdcocampo@gmail.com">
                jcdcocampo@gmail.com
              </a>
              .
            </p>
          </div>
          <footer className="site-footer fade-up delay-2">
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
        {/* /.content-inner */}
      </div>
    </div>
  );
}
