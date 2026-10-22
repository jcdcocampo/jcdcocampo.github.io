import { useLayoutEffect } from 'react';

/** Apple-style sticky header that scrubs in as the main header card scrolls away. */
export function useStickyHeader(enabled = true) {
  useLayoutEffect(() => {
    const sticky = document.getElementById('stickyHeader');
    if (!sticky) return undefined;
    if (!enabled) {
      sticky.style.opacity = '0';
      sticky.style.visibility = 'hidden';
      sticky.style.pointerEvents = 'none';
      sticky.style.transform = 'translateY(-18px)';
      const stickyAvatar = document.getElementById('stickyAvatar');
      const stickyName = sticky.querySelector('.sticky-name');
      if (stickyAvatar) {
        stickyAvatar.style.opacity = '0';
        stickyAvatar.style.transform = 'scale(1.35)';
      }
      if (stickyName) stickyName.style.opacity = '0';
      return undefined;
    }
    const headerCard = document.querySelector('.header-card');
    const mainToggle = document.getElementById('themeToggle');
    const stickyToggle = document.getElementById('stickyThemeToggle');
    const stickyAvatar = document.getElementById('stickyAvatar');
    const stickyNameEl = sticky ? sticky.querySelector('.sticky-name') : null;
    if (!sticky || !headerCard) return;
    const panel = headerCard.closest('[data-main-section-panel]');

    const lerp = (a, b, t) => a + (b - a) * t;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const AVATAR_SCALE_START = 1.35;
    const AVATAR_SCALE_END = 1;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          morph();
          ticking = false;
        });
      }
    };

    function morph() {
      const rect = headerCard.getBoundingClientRect();
      const cardH = headerCard.offsetHeight;
      const morphStart = cardH * 0.6;
      const morphEnd = 0;
      const raw = (morphStart - rect.bottom) / (morphStart - morphEnd);
      const progress = Math.max(0, Math.min(1, raw));

      if (progress <= 0) {
        sticky.style.opacity = '0';
        sticky.style.visibility = 'hidden';
        sticky.style.pointerEvents = 'none';
        stickyAvatar.style.opacity = '0';
        stickyAvatar.style.transform = 'scale(' + AVATAR_SCALE_START + ')';
        if (stickyNameEl) stickyNameEl.style.opacity = '0';
        return;
      }
      const ease = easeOut(progress);
      sticky.style.visibility = 'visible';
      sticky.style.opacity = String(Math.min(1, progress * 1.8));
      sticky.style.pointerEvents = progress > 0.4 ? 'auto' : 'none';
      sticky.style.transform = 'translateY(' + lerp(-18, 0, ease).toFixed(1) + 'px)';

      const contentOp = Math.min(1, Math.max(0, progress * 1.6));
      stickyAvatar.style.transform = 'scale(' + lerp(AVATAR_SCALE_START, AVATAR_SCALE_END, ease).toFixed(3) + ')';
      stickyAvatar.style.opacity = String(contentOp);
      if (stickyNameEl) stickyNameEl.style.opacity = String(contentOp);

      const feather = lerp(20, 48, ease);
      const m = 'linear-gradient(to bottom,black calc(100% - ' + feather.toFixed(0) + 'px),transparent)';
      sticky.style.webkitMaskImage = m;
      sticky.style.maskImage = m;
    }

    let scrollTarget = window.matchMedia('(max-width: 767px)').matches && panel ? panel : window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    morph();
    const onResize = () => {
      const nextTarget = window.matchMedia('(max-width: 767px)').matches && panel ? panel : window;
      if (nextTarget !== scrollTarget) {
        scrollTarget.removeEventListener('scroll', onScroll);
        scrollTarget = nextTarget;
        scrollTarget.addEventListener('scroll', onScroll, { passive: true });
      }
      morph();
    };
    window.addEventListener('resize', onResize);

    const onStickyToggle = (e) => {
      e.preventDefault();
      if (mainToggle) mainToggle.click();
    };
    if (stickyToggle && mainToggle) stickyToggle.addEventListener('click', onStickyToggle);

    const themeColorMeta = document.getElementById('themeColorMeta');
    const syncStickyTheme = () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (stickyAvatar) stickyAvatar.src = dark ? '/assets/profile-dark.jpg' : '/assets/profile-light.jpg';
      if (stickyToggle) stickyToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
      if (themeColorMeta) themeColorMeta.setAttribute('content', dark ? '#000000' : '#f2f2f7');
    };
    syncStickyTheme();
    const obs = new MutationObserver(syncStickyTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (stickyToggle) stickyToggle.removeEventListener('click', onStickyToggle);
      obs.disconnect();
    };
  }, [enabled]);
}
