import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import NavChrome from './NavChrome.jsx';
import MainSectionDeck from './MainSectionDeck.jsx';
import { useNavigationScroll } from '../hooks/useNavigationScroll.js';
import { isChromeless, isSpaPath, navIdFor, normalizePath } from '../routes.js';

const MAIN_PATHS = new Set(['/', '/experience', '/projects', '/certifications']);
const isMainPath = (path) => MAIN_PATHS.has(normalizePath(path));
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

function collectPortfolioLayoutDiagnostics() {
  const describe = (element) => {
    if (!element) return null;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      node: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${typeof element.className === 'string' && element.className.trim() ? `.${element.className.trim().replace(/\s+/g, '.')}` : ''}`,
      rect: { x: rect.x, y: rect.y, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height },
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      position: style.position,
      height: style.height,
      minHeight: style.minHeight,
      overflow: style.overflow,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      transform: style.transform,
      scrollTop: element.scrollTop ?? 0,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    };
  };

  const describePanel = (panel) => {
    const page = panel.firstElementChild;
    const content = page?.querySelector('.main-grid, .timeline-outer, .project-list, .cert-list');
    return {
      id: panel.dataset.mainSectionPanel,
      active: panel.dataset.active === 'true',
      ariaHidden: panel.getAttribute('aria-hidden'),
      inert: panel.inert,
      panel: describe(panel),
      page: describe(page),
      header: describe(page?.querySelector('.header-card, .top-bar, header')),
      content: describe(content),
      footer: describe(page?.querySelector('footer')),
      expectedContentCount: page?.querySelectorAll('.section-card, .timeline-card, .project-item, .cert-item').length ?? 0,
    };
  };

  const activePanel = document.querySelector('.main-section-panel[data-active="true"]');
  const track = document.querySelector('.main-section-track');
  const deck = document.querySelector('.main-section-deck');
  const routeClip = document.getElementById('route-clip');
  const scrollingElement = document.scrollingElement;
  const ancestors = [];
  for (let node = activePanel; node; node = node.parentElement) {
    const item = describe(node);
    const rect = node.getBoundingClientRect();
    const overflowX = getComputedStyle(node).overflowX;
    const overflowY = getComputedStyle(node).overflowY;
    const contentRect = activePanel?.getBoundingClientRect();
    const clipsX = /^(hidden|clip|auto|scroll)$/.test(overflowX) && contentRect
      && (contentRect.left < rect.left || contentRect.right > rect.right);
    const clipsY = /^(hidden|clip|auto|scroll)$/.test(overflowY) && contentRect
      && (contentRect.top < rect.top || contentRect.bottom > rect.bottom);
    ancestors.push({ ...item, clipsActivePanelX: Boolean(clipsX), clipsActivePanelY: Boolean(clipsY) });
    if (node === document.documentElement) break;
  }
  const snapshot = {
    url: `${location.pathname}${location.search}${location.hash}`,
    viewport: { width: window.innerWidth, height: window.innerHeight, mobileBreakpointMatches: isMobile() },
    scroll: {
      windowY: window.scrollY,
      documentScrollTop: scrollingElement?.scrollTop ?? null,
      documentScrollHeight: scrollingElement?.scrollHeight ?? null,
      documentClientHeight: scrollingElement?.clientHeight ?? null,
      bodyScrollHeight: document.body.scrollHeight,
    },
    shared: {
      routeClip: describe(routeClip),
      deck: describe(deck),
      track: describe(track),
      activePanel: describePanel(activePanel),
      activePanelAncestors: ancestors,
    },
    panels: Array.from(document.querySelectorAll('.main-section-panel'), describePanel),
  };

  console.group(`[Portfolio layout diagnostics] ${snapshot.url}`);
  console.log('Viewport and document scroll:', snapshot.viewport, snapshot.scroll);
  console.log('Shared containers:', snapshot.shared);
  console.table(snapshot.shared.activePanelAncestors.map(({ node, rect, display, visibility, opacity, position, height, minHeight, overflowX, overflowY, transform, clipsActivePanelX, clipsActivePanelY }) => ({
    node, top: rect.top, bottom: rect.bottom, height: rect.height, display, visibility, opacity, position, minHeight, overflowX, overflowY, transform, clipsActivePanelX, clipsActivePanelY,
  })));
  console.table(snapshot.panels.map(({ id, active, ariaHidden, inert, panel, page, header, content, footer, expectedContentCount }) => ({
    id, active, ariaHidden, inert,
    panelTop: panel?.rect.top, panelHeight: panel?.rect.height, panelDisplay: panel?.display, panelPosition: panel?.position,
    pageTop: page?.rect.top, pageHeight: page?.rect.height, pageDisplay: page?.display, pageOpacity: page?.opacity,
    headerTop: header?.rect.top, headerHeight: header?.rect.height,
    contentTop: content?.rect.top, contentHeight: content?.rect.height, contentDisplay: content?.display, contentVisibility: content?.visibility, contentOpacity: content?.opacity,
    footerTop: footer?.rect.top, footerHeight: footer?.rect.height, expectedContentCount,
  })));
  console.log('Full snapshot (copy this object to share):', snapshot);
  console.groupEnd();
  return snapshot;
}

function findById(root, id) {
  if (!root) return null;
  return Array.from(root.querySelectorAll('[id], [data-section-anchor]'))
    .find((node) => node.id === id || node.getAttribute('data-section-anchor') === id) || null;
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();
  const navRef = useRef(navigate);
  navRef.current = navigate;
  const navigationIntentRef = useRef(null);
  const fadeAnimationFrameRef = useRef(0);
  const scrollPositions = useRef(new Map());
  const keyRef = useRef(location.key);
  const { scrollTo, cancel: cancelScroll } = useNavigationScroll();
  const mainRoute = isMainPath(location.pathname);

  useEffect(() => {
    window.__spaNavigate = (url, source = 'link') => {
      let u;
      try { u = new URL(url, window.location.origin); }
      catch { window.location.href = url; return; }
      if (u.origin !== window.location.origin || !isSpaPath(u.pathname)) {
        window.location.href = u.href;
        return;
      }
      const to = normalizePath(u.pathname) + u.search + u.hash;
      const cur = normalizePath(window.location.pathname) + window.location.search + window.location.hash;
      if (to !== cur) {
        navigationIntentRef.current = { path: normalizePath(u.pathname), source };
        navRef.current(to);
      }
    };
    const scrollToElement = (element) => {
      if (!element?.isConnected) return;
      const mainPanel = element.closest('[data-main-section-panel]');
      const routeRoot = element.closest('#route-root');
      const scroller = isMobile() ? (mainPanel || routeRoot) : null;
      if (!scroller) {
        const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
        scrollTo(Math.max(0, window.scrollY + element.getBoundingClientRect().top - margin), { observe: element });
        return;
      }
      const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
      const top = scroller.scrollTop + element.getBoundingClientRect().top - scroller.getBoundingClientRect().top - margin;
      scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };
    window.__portfolioScrollToElement = scrollToElement;
    window.__portfolioScrollToTop = () => scrollTo(0);
    return () => {
      delete window.__spaNavigate;
      delete window.__portfolioScrollToElement;
      delete window.__portfolioScrollToTop;
    };
  }, [scrollTo]);

  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest?.('a[href]');
      if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !isSpaPath(url.pathname)) return;
      event.preventDefault();
      window.__spaNavigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (window.__navJsLoaded) return;
    window.__navJsLoaded = true;
    window.__navActive = navIdFor(window.location.pathname);
    const script = document.createElement('script');
    script.src = '/nav.js';
    document.body.appendChild(script);
  }, []);

  // Development-only layout probe for diagnosing desktop section sizing,
  // visibility, clipping, and document scroll state from DevTools.
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__portfolioLayoutDiagnostics = collectPortfolioLayoutDiagnostics;
    return () => { delete window.__portfolioLayoutDiagnostics; };
  }, []);

  useEffect(() => {
    if (!('ontouchstart' in window)) return undefined;
    const run = () => fetch('/tab-assets.json')
      .then((response) => (response.ok ? response.json() : []))
      .then((list) => list.forEach((url) => { const image = new Image(); image.decoding = 'async'; image.src = url; }))
      .catch(() => {});
    const handle = window.requestIdleCallback ? window.requestIdleCallback(run, { timeout: 4000 }) : setTimeout(run, 1500);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(handle) : clearTimeout(handle));
  }, []);

  // Desktop keeps its shared document-scroll/history behavior. Mobile main
  // sections own their scroll containers, so route changes never reset them.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      const key = keyRef.current;
      const y = window.scrollY;
      frame = requestAnimationFrame(() => {
        if (!isMobile()) scrollPositions.current.set(key, y);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    const previousKey = keyRef.current;
    const mobile = isMobile();
    // Commit the outgoing document position before switching the key. Scroll
    // events are frame-coalesced, so saving here also covers a pending frame.
    if (!mobile && previousKey !== location.key) {
      scrollPositions.current.set(previousKey, window.scrollY);
    }
    keyRef.current = location.key;
    const path = normalizePath(location.pathname);
    const intent = navigationIntentRef.current;
    navigationIntentRef.current = null;
    cancelAnimationFrame(fadeAnimationFrameRef.current);
    document.body.classList.toggle('no-chrome', isChromeless(path));
    const routeClip = document.getElementById('route-clip');
    routeClip?.setAttribute('data-main-route', String(isMainPath(path)));

    if (mobile) {
      if (location.hash) {
        const id = decodeURIComponent(location.hash.slice(1));
        const root = isMainPath(path)
          ? document.querySelector(`[data-main-section-panel="${navIdFor(path)}"]`)
          : document.getElementById('route-root');
        const target = findById(root, id);
        if (target) window.__portfolioScrollToElement?.(target);
      } else if (!isMainPath(path)) {
        const root = document.getElementById('route-root');
        if (navType !== 'POP' && root) root.scrollTop = 0;
      }
      // A section's own scrollTop remains in its mounted panel across swipes.
    } else if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      let tries = 30;
      let frame = 0;
      const go = () => {
        const root = isMainPath(path)
          ? document.querySelector(`[data-main-section-panel="${navIdFor(path)}"]`)
          : document.getElementById('route-root');
        const element = findById(root, id) || document.getElementById(id);
        if (element) {
          const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
          scrollTo(window.scrollY + element.getBoundingClientRect().top - margin, { instant: navType === 'POP', observe: element });
        } else if (tries-- > 0) frame = requestAnimationFrame(go);
      };
      go();
      return () => { if (frame) cancelAnimationFrame(frame); };
    } else {
      const y = navType === 'POP' ? scrollPositions.current.get(location.key) || 0 : 0;
      if (navType === 'POP') { cancelScroll(); window.scrollTo(0, y); }
      else if (intent?.source === 'tab' && intent.path === path) {
        // A tab switch changes which section is in document flow. Start that
        // section at its destination position before its entrance animation,
        // instead of animating the old section's scroll offset through it.
        cancelScroll();
        window.scrollTo(0, y);
      } else scrollTo(y);
    }

    const activeId = isChromeless(path) ? 'none' : navIdFor(path);
    window.__navActive = activeId;
    window.__navSetRoute?.(activeId);

    if (intent?.source === 'tab' && intent.path === path && isMainPath(path)) {
      const page = document.querySelector(`[data-main-section-panel="${activeId}"]`);
      if (page) {
        // Re-run the page's existing CSS animation and stagger values without
        // remounting its component or changing the swipe transition.
        fadeAnimationFrameRef.current = requestAnimationFrame(() => {
          if (!page.isConnected || normalizePath(window.location.pathname) !== path) return;
          page.querySelectorAll('.fade-up').forEach((element) => {
            element.style.animation = 'none';
            void element.offsetHeight;
            element.style.animation = '';
          });
        });
      }
    }
  }, [location, navType, scrollTo, cancelScroll]);

  return (
    <>
      <NavChrome />
      <div id="route-clip" data-main-route={String(mainRoute)}>
        <MainSectionDeck />
        <div id="route-root"><Outlet /></div>
      </div>
    </>
  );
}
