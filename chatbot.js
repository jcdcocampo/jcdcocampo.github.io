/* ============================================================
   Mian — JC's Personal AI Assistant (drop-in widget)
   ------------------------------------------------------------
   Usage: add this single line before </body> on any page:
     <script src="chatbot.js" defer></script>

   To swap backends later, only edit the CONFIG block and the
   sendToAI() function at the bottom of this file.
   ============================================================ */
(function () {
  'use strict';

  // -------------------- CONFIG --------------------
  const CONFIG = {
    apiEndpoint: 'https://mian-chatbot.jc-ocampo0907.workers.dev',

    botName: 'Mian',
    botSubtitle: "JC's AI Assistant",
    welcomeMessage: "Hi! I'm Mian, JC's personal AI assistant. Ask me anything about his background, projects, certifications, or experience!",

    // Profile picture. Recommended size: 512x512 PNG so it stays crisp
    // at every place we render it (28px small avatar, 48px header,
    // 140px ID-card portrait), including 2x/3x retina displays.
    avatarUrl: 'assets/mian.png',

    // ID-card popup text
    cardDedication: 'Created on April 2026. Dedicated to the love of my life.',

    maxChars: 500,
    maxHistory: 10,
  };

  if (window.__mianChatbotLoaded) return;
  window.__mianChatbotLoaded = true;

  // -------------------- STYLES --------------------
  const css = `
    /* ── Siri-style outer border glow ────────────────────────────
       The ring is a SIBLING positioned behind the panel (z-index
       9998 vs panel's 9999). It is the exact same size and position
       as the panel. filter:blur makes the colored edges bleed ~18px
       outward — that outer strip is all that's visible, because the
       panel covers the center completely.

       Panel content is 100% untouched. No overlay, no tinting.

       Colors (from the iPhone Siri bezel reference):
         top-left  → electric blue
         left      → indigo / violet
         bottom-left  → deep purple
         top-right → hot pink / rose
         right     → crimson
         bottom-right → warm amber
         bottom    → magenta                                     */

    @keyframes cbGlowBreathe {
      0%   { opacity: 0;   }
      12%  { opacity: 1;   }
      65%  { opacity: 0.8; }
      80%  { opacity: 1;   }
      100% { opacity: 0;   }
    }

    .cb-siri-ring {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 48px);
      border-radius: 18px;
      z-index: 9998;          /* sits just behind the panel       */
      pointer-events: none;
      background:
        /* top-left — electric blue */
        radial-gradient(ellipse 65% 45% at 0%   0%,   #1244ff 0%, transparent 62%),
        /* left edge — indigo */
        radial-gradient(ellipse 42% 55% at 0%   48%,  #5018e0 0%, transparent 60%),
        /* bottom-left — deep purple */
        radial-gradient(ellipse 58% 42% at 0%   100%, #9010cc 0%, transparent 60%),
        /* top-right — hot pink */
        radial-gradient(ellipse 58% 42% at 100% 0%,   #e0208a 0%, transparent 60%),
        /* right edge — crimson */
        radial-gradient(ellipse 42% 55% at 100% 48%,  #cc1428 0%, transparent 60%),
        /* bottom-right — warm amber */
        radial-gradient(ellipse 58% 42% at 100% 100%, #dd7808 0%, transparent 60%),
        /* bottom center — magenta bridge */
        radial-gradient(ellipse 60% 32% at 50%  100%, #c01888 0%, transparent 58%);
      /* blur pushes color outward so it glows around the panel edge */
      filter: blur(18px);
      animation: cbGlowBreathe 3s ease forwards;
    }

    @media (max-width: 480px) {
      .cb-siri-ring {
        bottom: 12px;
        right: 8px;
        left: 8px;
        width: auto;
        max-width: none;
        height: calc(100vh - 80px);
        height: calc(100dvh - 80px);
        max-height: none;
        border-radius: 16px;
      }
    }

    /* Floating action button (iMessage-style balloon) */
    .cb-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--accent, #007aff);
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      transition: transform 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease;
      font-family: var(--sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
      padding: 0;
    }
    .cb-fab:hover  { transform: scale(1.06); box-shadow: 0 6px 22px rgba(0,0,0,0.28); }
    .cb-fab:active { transform: scale(0.94); }
    .cb-fab svg    { width: 32px; height: 32px; display: block; }
    .cb-fab.cb-hidden { opacity: 0; transform: scale(0.6); pointer-events: none; }

    /* Panel */
    .cb-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 48px);
      background: var(--card, #ffffff);
      border-radius: 18px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.22);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      font-family: var(--sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
      color: var(--text-primary, #1c1c1e);
      transform-origin: bottom right;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .cb-panel.cb-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Header */
    .cb-header {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--separator, #e5e5ea);
      flex-shrink: 0;
    }
    .cb-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      border: none;
      transition: background 0.4s ease, transform 0.18s ease, box-shadow 0.18s ease;
    }
    .cb-avatar:hover  { transform: scale(1.05); box-shadow: 0 2px 10px rgba(0,0,0,0.18); }
    .cb-avatar:active { transform: scale(0.96); }
    .cb-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .cb-header-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .cb-header-name {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.2px;
      line-height: 1.2;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .cb-header-subtitle {
      font-size: 12px;
      color: var(--text-secondary, #636366);
      line-height: 1.2;
    }
    .cb-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34c759;
      display: inline-block;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(52, 199, 89, 0.18);
    }
    .cb-close {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.18s ease, transform 0.18s ease;
      flex-shrink: 0;
    }
    .cb-close:hover  { background: var(--sub-hover, #e5e5ea); }
    .cb-close:active { transform: scale(0.92); }
    .cb-close svg { width: 16px; height: 16px; }

    /* Messages */
    .cb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
    }
    .cb-messages::-webkit-scrollbar { width: 6px; }
    .cb-messages::-webkit-scrollbar-thumb {
      background: var(--text-tertiary, #aeaeb2);
      border-radius: 3px;
    }

    .cb-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.45;
      word-wrap: break-word;
      animation: cbFadeIn 0.25s ease;
    }
    @keyframes cbFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Bot row: small avatar + bubble */
    .cb-bot-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      align-self: flex-start;
      max-width: 90%;
      animation: cbFadeIn 0.25s ease;
    }
    .cb-bot-row .cb-msg { animation: none; max-width: 100%; }
    .cb-msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      overflow: hidden;
      transition: opacity 0.18s ease, background 0.4s ease;
    }
    .cb-msg-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .cb-msg-avatar.cb-avatar-hidden { visibility: hidden; }

    .cb-msg-bot {
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .cb-msg-user {
      background: var(--accent, #007aff);
      color: #fff;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }
    .cb-msg-error {
      background: #ffefef;
      color: #c0392b;
      border: 1px solid #f5c6c6;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    [data-theme="dark"] .cb-msg-error {
      background: #3a1f1f;
      color: #ff7b72;
      border-color: #5a2a2a;
    }

    .cb-typing { display: inline-flex; gap: 4px; align-items: center; padding: 4px 0; }
    .cb-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--text-tertiary, #aeaeb2);
      animation: cbBounce 1.2s infinite ease-in-out;
    }
    .cb-typing span:nth-child(2) { animation-delay: 0.15s; }
    .cb-typing span:nth-child(3) { animation-delay: 0.30s; }
    @keyframes cbBounce {
      0%, 60%, 100% { transform: translateY(0);    opacity: 0.5; }
      30%           { transform: translateY(-5px); opacity: 1;   }
    }

    /* Quick-start chips */
    .cb-chips {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 7px;
      padding: 4px 16px 8px;
    }
    .cb-chip {
      display: inline-flex;
      align-items: center;
      background: var(--sub-card, #f0f0f5);
      color: var(--accent, #007aff);
      border: 1.5px solid var(--accent, #007aff);
      border-radius: 980px;
      padding: 5px 13px;
      font-size: 12.5px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      opacity: 0;
      transform: translateX(20px);
      transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
    }
    .cb-chip.cb-chip-in {
      animation: cbChipSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .cb-chip:hover  { background: var(--accent, #007aff); color: #fff; box-shadow: 0 2px 8px rgba(0,122,255,0.22); }
    .cb-chip:active { transform: scale(0.95); }
    .cb-chip.cb-chip-gone { display: none; }
    @keyframes cbChipSlideIn {
      to { opacity: 1; transform: translateX(0); }
    }

    /* Input */
    .cb-input-area {
      border-top: 1px solid var(--separator, #e5e5ea);
      padding: 10px 12px 8px;
      flex-shrink: 0;
      background: var(--card, #ffffff);
    }
    .cb-input-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: var(--sub-card, #f0f0f5);
      border-radius: 20px;
      padding: 6px 6px 6px 14px;
    }
    .cb-textarea {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      resize: none;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
      color: var(--text-primary, #1c1c1e);
      max-height: 100px;
      min-height: 22px;
      padding: 4px 0;
    }
    .cb-textarea::placeholder { color: var(--text-tertiary, #aeaeb2); }
    .cb-send {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent, #007aff);
      color: #fff;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }
    .cb-send:hover:not(:disabled)  { transform: scale(1.05); }
    .cb-send:active:not(:disabled) { transform: scale(0.92); }
    .cb-send:disabled { opacity: 0.4; cursor: not-allowed; }
    .cb-send svg { width: 16px; height: 16px; }

    .cb-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 4px 0;
      font-size: 11px;
      color: var(--text-tertiary, #aeaeb2);
      gap: 12px;
    }
    .cb-disclaimer-inline { flex: 1; min-width: 0; }
    .cb-counter.cb-near-limit { color: #ff9500; }
    .cb-counter.cb-at-limit   { color: var(--red, #ff3b30); }

    /* ----- ID Card popup (shown when header avatar is clicked) ----- */
    .cb-card-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s ease;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .cb-card-overlay.cb-open {
      opacity: 1;
      pointer-events: auto;
    }
    .cb-card {
      background: var(--card, #ffffff);
      color: var(--text-primary, #1c1c1e);
      border-radius: 22px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      padding: 36px 28px 28px;
      width: 100%;
      max-width: 320px;
      text-align: center;
      position: relative;
      transform: scale(0.92);
      transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: var(--sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
    }
    .cb-card-overlay.cb-open .cb-card { transform: scale(1); }

    .cb-card-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.18s ease, transform 0.18s ease;
    }
    .cb-card-close:hover  { background: var(--sub-hover, #e5e5ea); }
    .cb-card-close:active { transform: scale(0.92); }
    .cb-card-close svg { width: 16px; height: 16px; }

    .cb-card-avatar {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      margin: 0 auto 18px;
      overflow: hidden;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 52px;
      font-weight: 700;
      box-shadow: 0 4px 18px rgba(0,0,0,0.18);
    }
    .cb-card-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .cb-card-name {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.4px;
      margin-bottom: 4px;
    }
    .cb-card-role {
      font-size: 15px;
      color: var(--text-secondary, #636366);
    }
    .cb-card-dedication {
      font-size: 12px;
      color: var(--text-tertiary, #aeaeb2);
      line-height: 1.5;
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid var(--separator, #e5e5ea);
      font-style: italic;
    }

    /* Mobile */
    @media (max-width: 480px) {
      .cb-panel {
        width: calc(100vw - 16px);
        height: calc(100vh - 80px);
        height: calc(100dvh - 80px);
        bottom: 12px;
        right: 8px;
        left: 8px;
        max-width: none;
        border-radius: 16px;
      }
      .cb-fab { bottom: 16px; right: 16px; width: 56px; height: 56px; }
      .cb-fab svg { width: 30px; height: 30px; }

      .cb-avatar { width: 44px; height: 44px; font-size: 16px; }

      .cb-card { max-width: 280px; padding: 32px 22px 24px; }
      .cb-card-avatar { width: 120px; height: 120px; font-size: 44px; margin-bottom: 16px; }
      .cb-card-name { font-size: 22px; }
      .cb-card-role { font-size: 14px; }
      .cb-card-dedication { font-size: 11.5px; }
    }
  `;

  // -------------------- HELPERS --------------------
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'cb-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  const escapeAttr = escapeHtml;

  // Strip basic markdown that some models leak into responses.
  function stripMarkdown(s) {
    if (!s) return s;
    return String(s)
      .replace(/\*{3}([^*]+?)\*{3}/g, '$1')
      .replace(/_{3}([^_]+?)_{3}/g, '$1')
      .replace(/\*{2}([^*]+?)\*{2}/g, '$1')
      .replace(/_{2}([^_]+?)_{2}/g, '$1')
      .replace(/(^|[\s(])\*([^\s*][^*]*?[^\s*]|\S)\*(?=[\s).,!?;:]|$)/g, '$1$2')
      .replace(/(^|[\s(])_([^\s_][^_]*?[^\s_]|\S)_(?=[\s).,!?;:]|$)/g, '$1$2')
      .replace(/`([^`]+?)`/g, '$1')
      .replace(/~~([^~]+?)~~/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/  +/g, ' ');
  }

  // ── Siri-style outer border glow ──────────────────────────────
  // Inserts a sibling div BEFORE the panel in the DOM. The ring
  // has the same fixed position/size as the panel but z-index 9998
  // (panel is 9999), so the panel covers the center. Only the
  // filter:blur bleed around the edges is visible — exactly like
  // the iPhone Siri bezel glow. Panel content is never affected.
  function showSiriGlow(panel) {
    const old = document.querySelector('.cb-siri-ring');
    if (old) old.remove();

    const ring = document.createElement('div');
    ring.className = 'cb-siri-ring';
    // Insert before the panel so the panel's z-index covers the center
    panel.parentNode.insertBefore(ring, panel);

    setTimeout(() => ring.remove(), 3150);
  }

  const IMESSAGE_ICON = `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#ffffff" d="M16 5.2c-7 0-12.5 4.6-12.5 10.6 0 3.4 1.8 6.5 4.7 8.5.2.2.3.4.3.7 0 .8-.7 2.3-1.4 3.3-.2.3 0 .7.4.6 2.4-.4 4.5-1.4 5.7-2.1.2-.1.5-.2.8-.1 1.3.3 2.7.5 4 .5 7 0 12.5-4.6 12.5-10.6S23 5.2 16 5.2z"/>
    </svg>
  `;

  const CLOSE_ICON = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;

  function buildAvatarInner() {
    return CONFIG.avatarUrl
      ? `<img src="${escapeAttr(CONFIG.avatarUrl)}" alt="${escapeAttr(CONFIG.botName)}" onerror="this.replaceWith(document.createTextNode('M'))">`
      : 'M';
  }

  // -------------------- DOM --------------------
  function createUI() {
    const fab = document.createElement('button');
    fab.className = 'cb-fab';
    fab.setAttribute('aria-label', 'Open chat with Mian');
    fab.innerHTML = IMESSAGE_ICON;

    const panel = document.createElement('div');
    panel.className = 'cb-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', CONFIG.botName);
    panel.innerHTML = `
      <div class="cb-header">
        <button class="cb-avatar" type="button" aria-label="View ${escapeAttr(CONFIG.botName)}'s profile card">
          ${buildAvatarInner()}
        </button>
        <div class="cb-header-info">
          <div class="cb-header-name">
            <span>${escapeHtml(CONFIG.botName)}</span>
            <span class="cb-status-dot" aria-label="Online"></span>
          </div>
          <div class="cb-header-subtitle">${escapeHtml(CONFIG.botSubtitle)}</div>
        </div>
        <button class="cb-close" aria-label="Close chat">${CLOSE_ICON}</button>
      </div>
      <div class="cb-messages" role="log" aria-live="polite"></div>
      <div class="cb-chips" id="cb-chips-row">
        <button class="cb-chip" type="button">Tell me about JC</button>
        <button class="cb-chip" type="button">Is he open to work?</button>
        <button class="cb-chip" type="button">What's his experience?</button>
      </div>
      <div class="cb-input-area">
        <div class="cb-input-row">
          <textarea class="cb-textarea" rows="1" placeholder="Ask about JC..." maxlength="${CONFIG.maxChars}"></textarea>
          <button class="cb-send" aria-label="Send message" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>
        <div class="cb-meta-row">
          <span class="cb-disclaimer-inline">AI responses may be inaccurate. Please verify.</span>
          <span class="cb-counter">0 / ${CONFIG.maxChars}</span>
        </div>
      </div>
    `;

    const overlay = document.createElement('div');
    overlay.className = 'cb-card-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `${CONFIG.botName} profile card`);
    overlay.innerHTML = `
      <div class="cb-card">
        <button class="cb-card-close" aria-label="Close profile card">${CLOSE_ICON}</button>
        <div class="cb-card-avatar">${buildAvatarInner()}</div>
        <div class="cb-card-name">${escapeHtml(CONFIG.botName)}</div>
        <div class="cb-card-role">${escapeHtml(CONFIG.botSubtitle)}</div>
        <div class="cb-card-dedication">${escapeHtml(CONFIG.cardDedication)}</div>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);
    document.body.appendChild(overlay);
    return { fab, panel, overlay };
  }

  // -------------------- STATE --------------------
  let history = [];
  let isSending = false;
  let welcomeShown = false;

  function init() {
    injectStyles();
    const { fab, panel, overlay } = createUI();

    const messagesEl   = panel.querySelector('.cb-messages');
    const textarea     = panel.querySelector('.cb-textarea');
    const sendBtn      = panel.querySelector('.cb-send');
    const closeBtn     = panel.querySelector('.cb-close');
    const counterEl    = panel.querySelector('.cb-counter');
    const chipsRow     = panel.querySelector('.cb-chips');

    // Chip click: fill textarea and send, then hide all chips
    chipsRow.querySelectorAll('.cb-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (isSending) return;
        textarea.value = chip.textContent.trim();
        updateUI();
        // Hide chips before sending
        chipsRow.querySelectorAll('.cb-chip').forEach(c => c.classList.add('cb-chip-gone'));
        send();
      });
    });
    const avatarBtn    = panel.querySelector('.cb-avatar');
    const cardCloseBtn = overlay.querySelector('.cb-card-close');

    // ---- Panel open/close ----
    function openPanel() {
      panel.classList.add('cb-open');
      fab.classList.add('cb-hidden');
      // Play the Siri-style inner breathing glow every time the chat is opened
      showSiriGlow(panel);
      setTimeout(() => textarea.focus(), 250);
      if (!welcomeShown) {
        welcomeShown = true;
        // Welcome message appears instantly — no typing animation
        addMessage('bot', CONFIG.welcomeMessage);
        // Chips slide in immediately, staggered
        const chips = chipsRow.querySelectorAll('.cb-chip');
        chips.forEach((chip, i) => {
          setTimeout(() => chip.classList.add('cb-chip-in'), i * 120);
        });
      }
    }
    function closePanel() {
      panel.classList.remove('cb-open');
      fab.classList.remove('cb-hidden');
    }
    function isPanelOpen() { return panel.classList.contains('cb-open'); }

    fab.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);

    // ---- ID card popup ----
    function openCard()  { overlay.classList.add('cb-open'); }
    function closeCard() { overlay.classList.remove('cb-open'); }
    function isCardOpen() { return overlay.classList.contains('cb-open'); }

    avatarBtn.addEventListener('click', openCard);
    cardCloseBtn.addEventListener('click', closeCard);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCard();
    });

    // Escape key: close card first if open, otherwise close panel
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (isCardOpen())  { closeCard();  return; }
      if (isPanelOpen()) { closePanel(); }
    });

    // ---- Message rendering ----
    function buildSmallAvatar() {
      const av = document.createElement('div');
      av.className = 'cb-msg-avatar';
      if (CONFIG.avatarUrl) {
        const img = document.createElement('img');
        img.src = CONFIG.avatarUrl;
        img.alt = CONFIG.botName;
        img.onerror = () => { av.textContent = 'M'; };
        av.appendChild(img);
      } else {
        av.textContent = 'M';
      }
      return av;
    }

    function hideOlderBotAvatars() {
      messagesEl.querySelectorAll('.cb-msg-avatar').forEach(a => {
        a.classList.add('cb-avatar-hidden');
      });
    }

    function addMessage(role, text, opts) {
      opts = opts || {};

      if (role === 'user') {
        const div = document.createElement('div');
        div.className = 'cb-msg cb-msg-user';
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
      }

      hideOlderBotAvatars();

      const row = document.createElement('div');
      row.className = 'cb-bot-row';

      const avatar = buildSmallAvatar();
      const bubble = document.createElement('div');
      bubble.className = 'cb-msg ' + (opts.error ? 'cb-msg-error' : 'cb-msg-bot');
      bubble.textContent = text;

      row.appendChild(avatar);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return { row, bubble };
    }

    // Add an empty bot bubble that we'll type into character-by-character.
    function addBotBubbleForTyping(opts) {
      opts = opts || {};
      hideOlderBotAvatars();

      const row = document.createElement('div');
      row.className = 'cb-bot-row';

      const avatar = buildSmallAvatar();
      const bubble = document.createElement('div');
      bubble.className = 'cb-msg ' + (opts.error ? 'cb-msg-error' : 'cb-msg-bot');
      bubble.textContent = '';

      row.appendChild(avatar);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return { row, bubble };
    }

    // Type text into a bubble one character at a time.
    // Speed scales with length so very long messages don't take forever,
    // and small natural pauses are added after sentence-ending punctuation.
    function typeIntoBubble(bubble, text) {
      return new Promise((resolve) => {
        const total = text.length;
        // Faster per-char delay for longer messages, slower for short ones.
        // Roughly: ~22ms for short replies, ~10ms for long ones.
        const baseDelay = total > 220 ? 10 : total > 120 ? 14 : total > 60 ? 18 : 22;

        let i = 0;
        function step() {
          if (i >= total) {
            resolve();
            return;
          }
          const ch = text.charAt(i);
          bubble.textContent += ch;
          messagesEl.scrollTop = messagesEl.scrollHeight;
          i++;

          // Small extra pause after sentence-ending punctuation for a natural rhythm.
          let extra = 0;
          if (ch === '.' || ch === '!' || ch === '?') extra = 140;
          else if (ch === ',' || ch === ';' || ch === ':') extra = 60;

          setTimeout(step, baseDelay + extra);
        }
        step();
      });
    }

    function addTyping() {
      hideOlderBotAvatars();

      const row = document.createElement('div');
      row.className = 'cb-bot-row';

      const avatar = buildSmallAvatar();
      const bubble = document.createElement('div');
      bubble.className = 'cb-msg cb-msg-bot';
      bubble.innerHTML = '<span class="cb-typing"><span></span><span></span><span></span></span>';

      row.appendChild(avatar);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return row;
    }

    function updateUI() {
      const len = textarea.value.length;
      counterEl.textContent = `${len} / ${CONFIG.maxChars}`;
      counterEl.classList.toggle('cb-near-limit', len > CONFIG.maxChars * 0.8 && len < CONFIG.maxChars);
      counterEl.classList.toggle('cb-at-limit', len >= CONFIG.maxChars);
      sendBtn.disabled = len === 0 || isSending;

      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    textarea.addEventListener('input', updateUI);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
    sendBtn.addEventListener('click', send);

    async function send() {
      const text = textarea.value.trim();
      if (!text || isSending) return;

      isSending = true;
      updateUI();
      addMessage('user', text);
      // Hide chips once user sends any message
      chipsRow.querySelectorAll('.cb-chip').forEach(c => c.classList.add('cb-chip-gone'));
      history.push({ role: 'user', content: text });
      if (history.length > CONFIG.maxHistory) {
        history = history.slice(-CONFIG.maxHistory);
      }

      textarea.value = '';
      updateUI();

      const typingEl = addTyping();

      try {
        const rawReply = await sendToAI(history);
        const reply = stripMarkdown(rawReply);
        typingEl.remove();

        // Reveal the reply letter-by-letter.
        const { bubble } = addBotBubbleForTyping();
        await typeIntoBubble(bubble, reply);

        history.push({ role: 'assistant', content: reply });
      } catch (err) {
        console.error('[Mian]', err);
        typingEl.remove();
        const { bubble } = addBotBubbleForTyping({ error: true });
        await typeIntoBubble(
          bubble,
          "Sorry, I'm having trouble connecting right now. Please try again in a moment, or reach JC directly at jcdcocampo@gmail.com."
        );
      } finally {
        isSending = false;
        updateUI();
        textarea.focus();
      }
    }
  }

  // -------------------- BACKEND CALL --------------------
  async function sendToAI(messages) {
    const res = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data || typeof data.reply !== 'string') {
      throw new Error('Invalid response from server');
    }
    return data.reply;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // -------------------- BFCACHE FIX --------------------
  // When the browser restores a page from the back-forward cache
  // (pressing the browser back/forward button or mouse buttons),
  // it reuses a frozen snapshot of the page — so CSS animations
  // that already finished won't replay. This listener detects that
  // case and resets all .fade-up elements so the animations play again.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      document.querySelectorAll('.fade-up').forEach(function (el) {
        el.style.animation = 'none';
        // Force a reflow so the browser registers the reset before
        // we clear the override and let the CSS animation retrigger.
        void el.offsetHeight;
        el.style.animation = '';
      });
    }
  });
})();
