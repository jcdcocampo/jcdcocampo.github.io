import { useEffect } from 'react';

/** Profile picture and theme control. The root data-theme value is authoritative. */
export function useProfileTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const canvas = document.getElementById('profileCanvas');
    const video = document.getElementById('profileVideo');
    if (!btn || !canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let disposed = false;
    let rafId = 0;
    let motionToken = 0;
    let pendingCleanup = null;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    function drawCover(src) {
      const cw = canvas.width;
      const ch = canvas.height;
      const sw = src.videoWidth || src.naturalWidth || cw;
      const sh = src.videoHeight || src.naturalHeight || ch;
      const scale = Math.max(cw / sw, ch / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      try { ctx.drawImage(src, (cw - dw) / 2, (ch - dh) / 2, dw, dh); } catch (e) {}
    }

    const lightImg = new Image();
    lightImg.src = '/assets/profile-light.jpg';
    const darkImg = new Image();
    darkImg.src = '/assets/profile-dark.jpg';
    const paintFrame = () => drawCover(video);
    const paintLight = () => { if (lightImg.complete && lightImg.naturalWidth) drawCover(lightImg); };
    const paintDark = () => { if (darkImg.complete && darkImg.naturalWidth) drawCover(darkImg); };

    lightImg.onload = () => {
      if (!disposed && root.getAttribute('data-theme') !== 'dark') paintLight();
    };
    darkImg.onload = () => {
      if (!disposed && root.getAttribute('data-theme') === 'dark') paintDark();
    };

    function cancelMotion() {
      motionToken += 1;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      if (pendingCleanup) pendingCleanup();
      pendingCleanup = null;
      video.pause();
      return motionToken;
    }

    function whenReady(token, cb) {
      if (disposed || token !== motionToken) return;
      if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
        cb();
        return;
      }
      const ready = () => {
        cleanup();
        if (!disposed && token === motionToken) cb();
      };
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', ready);
        if (pendingCleanup === cleanup) pendingCleanup = null;
      };
      pendingCleanup = cleanup;
      video.addEventListener('loadedmetadata', ready, { once: true });
    }

    function seekTo(time, token, cb) {
      if (pendingCleanup) pendingCleanup();
      video.pause();
      let settled = false;
      const cleanup = () => {
        video.removeEventListener('seeked', done);
        clearTimeout(timer);
        if (pendingCleanup === cleanup) pendingCleanup = null;
      };
      const done = () => {
        if (settled) return;
        settled = true;
        cleanup();
        if (disposed || token !== motionToken) return;
        paintFrame();
        if (cb) cb();
      };
      const timer = setTimeout(done, 250);
      pendingCleanup = cleanup;
      video.addEventListener('seeked', done, { once: true });
      try { video.currentTime = time; } catch (e) { done(); }
    }

    function playForward(token) {
      whenReady(token, () => {
        const finish = () => seekTo(Math.max(0, video.duration - 0.01), token, paintFrame);
        const watch = () => {
          if (disposed || token !== motionToken) return;
          paintFrame();
          if (video.ended || video.currentTime >= video.duration - 0.05) {
            finish();
            return;
          }
          rafId = requestAnimationFrame(watch);
        };
        const play = video.play();
        if (play && typeof play.then === 'function') {
          play.then(() => {
            if (!disposed && token === motionToken) rafId = requestAnimationFrame(watch);
          }).catch(() => {
            if (token === motionToken) seekTo(Math.max(0, video.duration - 0.01), token, paintDark);
          });
        } else rafId = requestAnimationFrame(watch);
      });
    }

    function playReverse(token) {
      whenReady(token, () => {
        let lastTs = null;
        const step = (ts) => {
          if (disposed || token !== motionToken) return;
          if (lastTs === null) lastTs = ts;
          const dt = Math.min(50, ts - lastTs) / 1000;
          lastTs = ts;
          if (!video.seeking) {
            const next = Math.max(0, video.currentTime - dt);
            if (next <= 0.01) {
              seekTo(0, token, paintLight);
              return;
            }
            try {
              video.currentTime = next;
              paintFrame();
            } catch (e) {}
          }
          rafId = requestAnimationFrame(step);
        };
        rafId = requestAnimationFrame(step);
      });
    }

    const initialDark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-pressed', initialDark ? 'true' : 'false');
    if (initialDark) {
      paintDark();
      whenReady(motionToken, () => seekTo(video.duration - 0.01, motionToken, paintFrame));
    } else paintLight();

    const onToggle = () => {
      const targetDark = root.getAttribute('data-theme') !== 'dark';
      if (targetDark) root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
      try { localStorage.setItem('theme', targetDark ? 'dark' : 'light'); } catch (e) {}
      document.querySelectorAll('.theme-toggle').forEach((toggle) => {
        toggle.setAttribute('aria-pressed', targetDark ? 'true' : 'false');
      });

      const token = cancelMotion();
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        if (targetDark) paintDark();
        else paintLight();
        return;
      }
      paintFrame();
      if (targetDark) playForward(token);
      else playReverse(token);
    };
    btn.addEventListener('click', onToggle);

    const onPageShow = (event) => {
      if (!event.persisted) return;
      cancelMotion();
      if (root.getAttribute('data-theme') === 'dark') paintDark();
      else paintLight();
    };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      disposed = true;
      cancelMotion();
      btn.removeEventListener('click', onToggle);
      window.removeEventListener('pageshow', onPageShow);
      lightImg.onload = darkImg.onload = null;
      try { video.pause(); } catch (e) {}
    };
  }, []);
}
