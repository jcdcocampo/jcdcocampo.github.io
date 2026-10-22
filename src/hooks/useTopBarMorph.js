import { useEffect } from 'react';

/** Page title in the sticky top bar shrinks smoothly as you scroll. */
export function useTopBarMorph(pageSelector = null, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const page = pageSelector
      ? document.querySelector(pageSelector)
      : document.querySelector('#route-root > *');
    const tb = page ? page.querySelector('.top-bar') : document.querySelector('.main-section-panel[data-active="true"] .top-bar');
    const title = tb && (tb.querySelector('.page-title') || tb.querySelector('.breadcrumb'));
    if (!tb || !title) return;
    const panel = page && page.closest('[data-main-section-panel]');
    const routeRoot = page && page.closest('#route-root');
    let scroller = window.matchMedia('(max-width: 767px)').matches ? (panel || routeRoot) : null;
    const origSize = parseFloat(getComputedStyle(title).fontSize);
    const minSize = Math.max(16, origSize * 0.7);
    let lastSize = origSize;
    let ticking = false;
    const apply = () => {
      const scrollY = scroller ? scroller.scrollTop : window.scrollY;
      const p = Math.min(1, scrollY / 80);
      // Font-size changes trigger layout. Quantize to half-pixel steps to avoid
      // writing a new layout value on every fractional scroll frame.
      const nextSize = Math.round(((1 - p) * origSize + p * minSize) * 2) / 2;
      if (nextSize !== lastSize) {
        title.style.fontSize = nextSize + 'px';
        lastSize = nextSize;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };
    let scrollTarget = scroller || window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => {
      scroller = window.matchMedia('(max-width: 767px)').matches ? (panel || routeRoot) : null;
      const nextTarget = scroller || window;
      if (nextTarget !== scrollTarget) {
        scrollTarget.removeEventListener('scroll', onScroll);
        scrollTarget = nextTarget;
        scrollTarget.addEventListener('scroll', onScroll, { passive: true });
      }
      apply();
    };
    window.addEventListener('resize', onResize);
    apply();
    return () => {
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [pageSelector, enabled]);
}
