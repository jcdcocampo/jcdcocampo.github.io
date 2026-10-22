import { useCallback, useEffect, useRef } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const WHEEL_EASE_PER_FRAME = 0.085;
const REFERENCE_FRAME_MS = 1000 / 60;

function hasNestedScroller(target) {
  let element = target instanceof Element ? target : target?.parentElement;
  if (element?.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return true;

  while (element && element !== document.body && element !== document.documentElement) {
    const { overflowY } = getComputedStyle(element);
    if (/^(auto|scroll|overlay)$/.test(overflowY) && element.scrollHeight > element.clientHeight + 1) return true;
    element = element.parentElement;
  }
  return false;
}

function normalizeWheelDelta(event) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const lineHeight = Number.parseFloat(target ? getComputedStyle(target).lineHeight : '') || 16;
    return event.deltaY * lineHeight;
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

/** Eases desktop document-wheel input and keeps explicit route/hash scrolling coordinated. */
export function useNavigationScroll() {
  const navigationFrameRef = useRef(0);
  const observerRef = useRef(null);
  const wheelFrameRef = useRef(0);
  const wheelActiveRef = useRef(false);
  const wheelCurrentRef = useRef(0);
  const wheelTargetRef = useRef(0);
  const wheelLastFrameRef = useRef(0);
  const wheelLastAppliedRef = useRef(0);

  const syncWheelPosition = useCallback((position = window.scrollY) => {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const y = Math.min(max, Math.max(0, position));
    wheelCurrentRef.current = y;
    wheelTargetRef.current = y;
    wheelLastAppliedRef.current = y;
    wheelLastFrameRef.current = 0;
  }, []);

  const cancelWheel = useCallback((sync = true) => {
    if (wheelFrameRef.current) cancelAnimationFrame(wheelFrameRef.current);
    wheelFrameRef.current = 0;
    wheelActiveRef.current = false;
    wheelLastFrameRef.current = 0;
    if (sync) syncWheelPosition();
  }, [syncWheelPosition]);

  const cancelNavigation = useCallback(() => {
    if (navigationFrameRef.current) cancelAnimationFrame(navigationFrameRef.current);
    navigationFrameRef.current = 0;
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    cancelNavigation();
    cancelWheel();
  }, [cancelNavigation, cancelWheel]);

  const scrollTo = useCallback((destination, { instant = false, observe = null } = {}) => {
    cancelWheel();
    cancelNavigation();
    let target = Math.max(0, destination);
    const startY = window.scrollY;
    const distance = target - startY;
    const reduceMotion = window.matchMedia?.(REDUCED_MOTION_QUERY).matches;
    if (instant || reduceMotion || Math.abs(distance) < 1) {
      window.scrollTo(0, target);
      syncWheelPosition(target);
      return;
    }

    const startedAt = performance.now();
    const duration = Math.min(680, Math.max(260, Math.abs(distance) * 0.42));
    const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    if (observe && 'ResizeObserver' in window) {
      observerRef.current = new ResizeObserver(() => {
        const margin = parseFloat(getComputedStyle(observe).scrollMarginTop) || 0;
        target = Math.max(0, window.scrollY + observe.getBoundingClientRect().top - margin);
      });
      observerRef.current.observe(observe);
      observerRef.current.observe(document.documentElement);
    }

    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      window.scrollTo(0, startY + (target - startY) * easeInOut(progress));
      if (progress < 1) navigationFrameRef.current = requestAnimationFrame(step);
      else {
        navigationFrameRef.current = 0;
        observerRef.current?.disconnect();
        observerRef.current = null;
        syncWheelPosition();
      }
    };
    navigationFrameRef.current = requestAnimationFrame(step);
  }, [cancelNavigation, cancelWheel, syncWheelPosition]);

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    const finishWheel = () => {
      wheelFrameRef.current = 0;
      wheelActiveRef.current = false;
      syncWheelPosition();
    };

    const stepWheel = (now) => {
      if (mobileQuery.matches || reducedMotionQuery.matches) {
        cancelWheel();
        return;
      }

      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      wheelTargetRef.current = Math.min(max, Math.max(0, wheelTargetRef.current));
      const elapsed = wheelLastFrameRef.current ? Math.min(50, now - wheelLastFrameRef.current) : REFERENCE_FRAME_MS;
      wheelLastFrameRef.current = now;
      const blend = 1 - Math.pow(1 - WHEEL_EASE_PER_FRAME, elapsed / REFERENCE_FRAME_MS);
      const difference = wheelTargetRef.current - wheelCurrentRef.current;
      wheelCurrentRef.current += difference * blend;

      if (Math.abs(difference) < 0.45) {
        wheelCurrentRef.current = wheelTargetRef.current;
        wheelLastAppliedRef.current = wheelCurrentRef.current;
        window.scrollTo(0, wheelCurrentRef.current);
        finishWheel();
        return;
      }

      wheelLastAppliedRef.current = wheelCurrentRef.current;
      window.scrollTo(0, wheelCurrentRef.current);
      wheelFrameRef.current = requestAnimationFrame(stepWheel);
    };

    const onWheel = (event) => {
      if (mobileQuery.matches || reducedMotionQuery.matches || event.defaultPrevented || !event.cancelable) return;
      // Leave horizontal trackpad gestures, browser zoom, and shifted wheel input to the browser.
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.deltaY === 0) return;
      if (hasNestedScroller(event.target)) return;

      const delta = normalizeWheelDelta(event);
      if (!Number.isFinite(delta) || delta === 0) return;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (!wheelActiveRef.current) syncWheelPosition();
      const nextTarget = Math.min(max, Math.max(0, wheelTargetRef.current + delta));
      if (nextTarget === wheelTargetRef.current) return;

      // A real document-wheel gesture interrupts only an explicit route/hash animation.
      cancelNavigation();
      event.preventDefault();
      wheelTargetRef.current = nextTarget;
      wheelActiveRef.current = true;
      if (!wheelFrameRef.current) wheelFrameRef.current = requestAnimationFrame(stepWheel);
    };

    const onScroll = () => {
      const actual = window.scrollY;
      if (wheelActiveRef.current) {
        // Wheel-generated scroll events match our last write. Any other movement (history
        // restoration, scrollbar drag, script, or browser input) becomes the new baseline.
        if (Math.abs(actual - wheelLastAppliedRef.current) > 2) cancelWheel();
        return;
      }
      syncWheelPosition(actual);
    };

    const interrupt = () => {
      cancelNavigation();
      cancelWheel();
    };

    const onResize = () => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      wheelTargetRef.current = Math.min(max, Math.max(0, wheelTargetRef.current));
      wheelCurrentRef.current = Math.min(max, Math.max(0, wheelCurrentRef.current));
      if (!wheelActiveRef.current) syncWheelPosition();
    };

    const onMotionPreferenceChange = () => {
      if (reducedMotionQuery.matches) interrupt();
    };

    let resizeObserver;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(document.documentElement);
      if (document.body) resizeObserver.observe(document.body);
    }

    syncWheelPosition();
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('touchstart', interrupt, { passive: true });
    window.addEventListener('pointerdown', interrupt, { passive: true });
    window.addEventListener('keydown', interrupt);
    mobileQuery.addEventListener?.('change', onResize);
    reducedMotionQuery.addEventListener?.('change', onMotionPreferenceChange);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('touchstart', interrupt);
      window.removeEventListener('pointerdown', interrupt);
      window.removeEventListener('keydown', interrupt);
      mobileQuery.removeEventListener?.('change', onResize);
      reducedMotionQuery.removeEventListener?.('change', onMotionPreferenceChange);
      cancel();
    };
  }, [cancel, cancelNavigation, cancelWheel, syncWheelPosition]);

  return { scrollTo, cancel };
}
