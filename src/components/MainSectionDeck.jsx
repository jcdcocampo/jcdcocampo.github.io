import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { normalizePath } from '../routes.js';
import Home from '../pages/Home.jsx';
import Experience from '../pages/Experience.jsx';
import Projects from '../pages/Projects.jsx';
import Certifications from '../pages/Certifications.jsx';

const sections = [
  { id: 'home', path: '/', Page: Home },
  { id: 'experience', path: '/experience', Page: Experience },
  { id: 'projects', path: '/projects', Page: Projects },
  { id: 'certs', path: '/certifications', Page: Certifications },
];

function sectionIndex(pathname) {
  pathname = normalizePath(pathname);
  if (pathname === '/') return 0;
  const direct = sections.findIndex((section) => section.path === pathname);
  if (direct >= 0) return direct;
  if (['/mian', '/bushop-project', '/banana-shelflife', '/aguila', '/eeg-exoskeleton'].includes(pathname)) return 2;
  return 0;
}

function isMainPath(pathname) {
  const path = normalizePath(pathname);
  return sections.some((section) => section.path === path);
}

const Interactive = 'input,textarea,select,option,label,summary,[contenteditable="true"],[data-no-swipe],canvas,video,audio,iframe';

function MainSectionDeck() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const gestureRef = useRef(null);
  const pendingSwipePathRef = useRef(null);
  const transitionTimerRef = useRef(0);
  const suppressClickRef = useRef(false);
  const currentIndex = sectionIndex(pathname);
  const mainRouteActive = isMainPath(pathname);
  const normalizedPath = normalizePath(pathname);
  const swipeTransition = pendingSwipePathRef.current === normalizedPath;

  useLayoutEffect(() => {
    trackRef.current?.querySelectorAll('[data-main-section-panel]').forEach((panel) => {
      panel.inert = !mainRouteActive || Number(panel.dataset.sectionIndex) !== currentIndex;
    });
    if (pendingSwipePathRef.current && pendingSwipePathRef.current !== normalizedPath) {
      pendingSwipePathRef.current = null;
      clearTimeout(transitionTimerRef.current);
      trackRef.current?.style.removeProperty('--swipe-snap-duration');
    }
  }, [currentIndex, mainRouteActive, normalizedPath]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const onTransitionEnd = (event) => {
      if (event.target === track && event.propertyName === 'transform') {
        if (pendingSwipePathRef.current === normalizePath(window.location.pathname)) {
          pendingSwipePathRef.current = null;
          track.dataset.swipeTransition = 'false';
          track.style.removeProperty('--swipe-snap-duration');
          clearTimeout(transitionTimerRef.current);
        }
      }
    };
    let clickTimer = 0;
    const onClickCapture = (event) => {
      if (!suppressClickRef.current) return;
      suppressClickRef.current = false;
      clearTimeout(clickTimer);
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    document.addEventListener('click', onClickCapture, true);
    track.addEventListener('transitionend', onTransitionEnd);

    const onMove = (event) => {
      const gesture = gestureRef.current;
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const dx = event.clientX - gesture.startX;
      const dy = event.clientY - gesture.startY;
      if (!gesture.dragging) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
          gestureRef.current = null;
          return;
        }
        if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
        gesture.dragging = true;
        gesture.direction = dx < 0 ? 1 : -1;
        gesture.target = gesture.index + gesture.direction;
        gesture.boundary = gesture.target < 0 || gesture.target >= sections.length;
        track.style.transition = 'none';
        document.documentElement.classList.add('swiping');
        suppressClickRef.current = true;
        clearTimeout(clickTimer);
        if (window.__navSwipe) window.__navSwipe.begin(sections[gesture.index].id);
        try { gesture.panel.setPointerCapture(event.pointerId); } catch { /* pointer may already be released */ }
      }
      event.preventDefault();
      const width = window.innerWidth;
      const direction = gesture.direction;
      const towardNeighbor = -dx * direction;
      const resisted = gesture.boundary || towardNeighbor < 0 ? dx * 0.18 : dx;
      track.style.transform = `translate3d(${gesture.trackStartX + resisted}px,0,0)`;
      if (!gesture.boundary && window.__navSwipe) window.__navSwipe.move(sections[gesture.index].id, sections[gesture.target].id, Math.min(1, Math.max(0, -dx * direction / width)));
    };

    const finish = (event) => {
      const gesture = gestureRef.current;
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      gestureRef.current = null;
      document.documentElement.classList.remove('swiping');
      if (!gesture.dragging) return;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { suppressClickRef.current = false; }, 350);
      const dx = event.clientX - gesture.startX;
      const elapsed = Math.max(1, event.timeStamp - gesture.startedAt);
      const fastFlick = Math.abs(dx) / elapsed > 0.45;
      const targetValid = gesture.target >= 0 && gesture.target < sections.length;
      const go = targetValid && event.type !== 'pointercancel' && (Math.abs(dx) >= window.innerWidth * 0.22 || fastFlick);
      if (go) {
        const target = gesture.target;
        const targetPath = normalizePath(sections[target].path);
        const width = Math.max(1, window.innerWidth);
        const towardNeighbor = -dx * gesture.direction;
        const resisted = towardNeighbor < 0 ? dx * 0.18 : dx;
        const releaseX = gesture.trackStartX + resisted;
        const remainingRatio = Math.min(1, Math.abs(-target * width - releaseX) / width);
        const snapDuration = Math.round(280 + remainingRatio * 180);
        pendingSwipePathRef.current = targetPath;
        track.style.setProperty('--swipe-snap-duration', `${snapDuration}ms`);
        track.style.transition = '';
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = setTimeout(() => {
          if (pendingSwipePathRef.current === targetPath) {
            pendingSwipePathRef.current = null;
            track.dataset.swipeTransition = 'false';
            track.style.removeProperty('--swipe-snap-duration');
          }
        }, snapDuration + 120);
        if (window.__navSwipe) window.__navSwipe.end(sections[target].id);
        navigate(sections[target].path);
      } else {
        track.style.transition = 'transform 180ms cubic-bezier(.22,1,.36,1)';
        track.style.transform = `translate3d(-${gesture.index * 100}vw,0,0)`;
        setTimeout(() => { if (track.isConnected) track.style.transition = ''; }, 200);
        if (window.__navSwipe) window.__navSwipe.end(sections[gesture.index].id);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    return () => {
      clearTimeout(transitionTimerRef.current);
      clearTimeout(clickTimer);
      suppressClickRef.current = false;
      document.removeEventListener('click', onClickCapture, true);
      track.removeEventListener('transitionend', onTransitionEnd);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      document.documentElement.classList.remove('swiping');
    };
  }, [navigate]);

  function beginGesture(event, index) {
    if (window.innerWidth > 767 || event.pointerType !== 'touch' || !event.isPrimary) return;
    if (event.clientX < 24 || window.innerWidth - event.clientX < 24) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(Interactive)) return;
    for (let node = target; node && node !== event.currentTarget; node = node.parentElement) {
      if (node.scrollWidth > node.clientWidth + 2 && ['auto', 'scroll'].includes(getComputedStyle(node).overflowX)) return;
    }
    if (gestureRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: event.timeStamp,
      index,
      trackStartX: track.getBoundingClientRect().left,
      panel: event.currentTarget,
      dragging: false,
    };
  }

  return (
    <div className="main-section-deck" data-main-active={mainRouteActive} aria-hidden={!mainRouteActive}>
      <div
        className="main-section-track"
        data-swipe-transition={swipeTransition}
        ref={trackRef}
        style={{ transform: `translate3d(-${currentIndex * 100}vw,0,0)` }}
      >
        {sections.map(({ id, Page }, index) => {
          const active = mainRouteActive && index === currentIndex;
          return (
            <section
              className="main-section-panel"
              data-main-section-panel={id}
              data-section-index={index}
              data-active={active}
              aria-hidden={!active}
              key={id}
              onPointerDown={(event) => beginGesture(event, index)}
            >
              <Page active={active} />
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default memo(MainSectionDeck);
