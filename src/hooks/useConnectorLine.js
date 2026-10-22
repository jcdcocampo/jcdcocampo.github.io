import { useEffect } from 'react';

/**
 * Draws the vertical line that links the first and last timeline dots.
 * Used by the home page (.experience-list) and the experience page (.timeline-wrap).
 */
export function useConnectorLine(listSel, dotSel, lineClass, opts = {}) {
  useEffect(() => {
    const draw = () => {
      const list = document.querySelector(listSel);
      if (!list) return;
      const dots = list.querySelectorAll(dotSel);
      if (dots.length < 2) return;

      let line = list.querySelector('.' + lineClass);
      if (!line) {
        line = document.createElement('div');
        line.className = lineClass;
        line.style.cssText =
          'position:absolute;width:2px;z-index:0;pointer-events:none;' + (opts.left ? `left:${opts.left};` : '');
        if (opts.insertFirst) list.insertBefore(line, list.firstChild);
        else list.appendChild(line);
      }
      const listRect = list.getBoundingClientRect();
      const first = dots[0].getBoundingClientRect();
      const last = dots[dots.length - 1].getBoundingClientRect();
      const top = first.top + first.height / 2 - listRect.top;
      const bottom = last.top + last.height / 2 - listRect.top;
      if (opts.centerOnDot) line.style.left = first.left + first.width / 2 - listRect.left - 1 + 'px';
      line.style.top = top + 'px';
      line.style.height = bottom - top + 'px';
      line.style.background = 'var(--separator)';
    };

    draw();
    const t = setTimeout(draw, 300);
    window.addEventListener('resize', draw);
    window.addEventListener('load', draw);
    let ro;
    const list = document.querySelector(listSel);
    if (list && 'ResizeObserver' in window) {
      ro = new ResizeObserver(draw);
      ro.observe(list);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', draw);
      window.removeEventListener('load', draw);
      if (ro) ro.disconnect();
      const l = list ? list.querySelector('.' + lineClass) : null;
      if (l) l.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
