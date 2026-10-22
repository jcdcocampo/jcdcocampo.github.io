import { useEffect } from 'react';

/**
 * The 404 page's pixel-horse cactus-jumper. Original game code, wrapped so it
 * mounts/unmounts cleanly inside the SPA (listeners + rAF loop are torn down on leave).
 */
export function useDinoGame() {
  useEffect(() => {
    /* eslint-disable */
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Tiny native resolution, scaled up with `image-rendering: pixelated`
    // — the same trick that makes the actual Chrome dino game read as
    // pixel art. Flat two-tone fills only, no gradients, no images.
    var W = 168, H = 46;
    var GROUND = 36;

    function ink() {
      return getComputedStyle(canvas).getPropertyValue('--game-ink').trim() || '#1c1c1e';
    }
    function bg() {
      return getComputedStyle(canvas).getPropertyValue('--game-bg').trim() || '#ffffff';
    }

    // ---- State ----
    var STATE = 'ready';                 // ready | running | over
    var score = 0, best = 0;
    try { best = parseInt(localStorage.getItem('sw404_best') || '0', 10) || 0; } catch (e) {}
    var speed = 62, baseSpeed = 62, spawnT = 0, nextGap = 55, elapsed = 0;

    var scoreEl = document.getElementById('score');
    var hiEl = document.getElementById('hi');
    var overlay = document.getElementById('overlay');
    var ovTitle = document.getElementById('ovTitle');
    var ovText = document.getElementById('ovText');
    function pad3(n) { n = Math.floor(n); return (n < 10 ? '00' : n < 100 ? '0' : '') + n; }
    hiEl.textContent = pad3(best);

    // ---- Player: a horse, side-on, simple two-frame gallop ----
    var horse = { x: 16, y: GROUND, vy: 0, w: 17, h: 12 };
    var GRAV = 700, JUMP = -165;
    var legPhase = 0;

    // ---- Obstacles: cacti — a single stem, or a stem with one or two
    // side arms, at a couple of widths, exactly like the real game's
    // obstacle variety ----
    var obs = [];
    function spawnCactus() {
      var kind = Math.random();
      var h = kind < 0.34 ? 8 : kind < 0.7 ? 11 : 13;
      var arms = kind < 0.34 ? 0 : kind < 0.7 ? 1 : 2;
      obs.push({ x: W + 4, y: GROUND, w: 6, h: h, arms: arms });
    }
    function spawn() {
      spawnCactus();
      // occasional close cluster, once the run has warmed up
      if (score > 45 && Math.random() < 0.24) {
        obs.push({ x: W + 4 + 12, y: GROUND, w: 5, h: 7, arms: 0 });
      }
    }

    // ---- A few slow drifting clouds — fixed shape, simple horizontal
    // drift, no per-frame recompute beyond an x position ----
    var clouds = [
      { x: 30, y: 8, w: 14 },
      { x: 95, y: 14, w: 10 },
      { x: 150, y: 6, w: 12 }
    ];

    // ---- Audio: tiny synthesized blips, no audio files ----
    var AC = null, muted = false;
    try { muted = localStorage.getItem('sw404_mute') === '1'; } catch (e) {}
    function beep(freq, dur) {
      if (muted) return;
      try {
        if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
        var o = AC.createOscillator(), g = AC.createGain();
        o.type = 'square';
        o.frequency.value = freq;
        g.gain.value = 0.035;
        o.connect(g); g.connect(AC.destination);
        var t = AC.currentTime;
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.08));
        o.start(t); o.stop(t + (dur || 0.08));
      } catch (e) {}
    }

    // ---- Input: single action — jump ----
    function jump() {
      if (STATE === 'ready') { start(); return; }
      if (STATE === 'over') { reset(); return; }
      if (horse.y >= GROUND - 0.5) { horse.vy = JUMP; beep(520, 0.07); }
    }
    function onKey(e) {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
    }
    document.addEventListener('keydown', onKey);
    var shell = document.getElementById('shell');
    function onTouch(e) { e.preventDefault(); jump(); }
    function onMouse() { jump(); }
    function onRestart() { reset(); }
    var restartBtn = document.getElementById('restart');
    shell.addEventListener('touchstart', onTouch, { passive: false });
    shell.addEventListener('mousedown', onMouse);
    restartBtn.addEventListener('click', onRestart);

    // ---- Lifecycle ----
    function start() { STATE = 'running'; overlay.classList.add('hidden'); }
    function reset() {
      obs.length = 0; score = 0; speed = baseSpeed; spawnT = 0; nextGap = 55;
      elapsed = 0; horse.y = GROUND; horse.vy = 0;
      STATE = 'running';
      overlay.classList.add('hidden');
    }
    function gameOver() {
      STATE = 'over';
      beep(140, 0.18);
      var finalScore = Math.floor(score);
      if (finalScore > best) {
        best = finalScore;
        try { localStorage.setItem('sw404_best', String(best)); } catch (e) {}
        hiEl.textContent = pad3(best);
        ovTitle.textContent = 'NEW BEST: ' + pad3(finalScore);
      } else {
        ovTitle.textContent = 'STUMBLED — ' + pad3(finalScore);
      }
      ovText.textContent = 'Run it back?';
      overlay.querySelector('.controls-line').innerHTML =
        '<span class="desktop-only"><kbd>Space</kbd> to retry &nbsp;·&nbsp; </span><span>tap to retry</span>';
      overlay.classList.remove('hidden');
    }

    function hit(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    // ---- Update ----
    var last = performance.now();
    function update(dt) {
      elapsed += dt;
      speed = baseSpeed + Math.min(70, elapsed * 5.5);

      horse.vy += GRAV * dt;
      horse.y += horse.vy * dt;
      if (horse.y > GROUND) { horse.y = GROUND; horse.vy = 0; }

      // leg-gallop cycle only advances while grounded
      if (horse.y >= GROUND - 0.5) legPhase += dt * speed * 0.35;

      spawnT += speed * dt;
      if (spawnT >= nextGap) {
        spawnT = 0;
        nextGap = 42 + Math.random() * 30 - Math.min(14, elapsed * 0.6);
        spawn();
      }

      for (var i = obs.length - 1; i >= 0; i--) {
        var o = obs[i];
        o.x -= speed * dt;
        var box = { x: o.x, y: o.y - o.h, w: o.w, h: o.h };
        var horseBox = { x: horse.x + 2, y: horse.y - horse.h + 2, w: horse.w - 5, h: horse.h - 3 };
        if (hit(horseBox, box)) { gameOver(); return; }
        if (o.x + o.w < 0) obs.splice(i, 1);
      }

      for (var c = 0; c < clouds.length; c++) {
        clouds[c].x -= speed * dt * 0.2;
        if (clouds[c].x + clouds[c].w < 0) clouds[c].x = W + Math.random() * 20;
      }

      score += speed * dt * 0.28;
      scoreEl.textContent = pad3(score);
    }

    // ---- Draw: flat two-tone only ----
    function drawHorse(fill) {
      var x = Math.round(horse.x), y = Math.round(horse.y - horse.h);
      var legUp = Math.floor(legPhase) % 2 === 0;
      var grounded = horse.y >= GROUND - 0.5;
      ctx.fillStyle = fill;

      // body
      ctx.fillRect(x + 3, y + 4, 10, 4);
      // neck + head, angled up-right
      ctx.fillRect(x + 11, y + 2, 3, 3);
      ctx.fillRect(x + 13, y, 3, 3);
      // ear
      ctx.fillRect(x + 14, y - 1, 1, 1);
      // mane
      ctx.fillRect(x + 11, y + 1, 1, 2);
      ctx.fillRect(x + 12, y, 1, 1);
      // tail
      ctx.fillRect(x, y + 3, 2, 1);
      ctx.fillRect(x, y + 5, 1, 2);

      // legs — while airborne, both pairs tuck into a single jump pose;
      // while grounded, front/back pairs alternate for a simple 2-frame gallop
      if (!grounded) {
        ctx.fillRect(x + 4, y + 8, 2, 3);
        ctx.fillRect(x + 10, y + 8, 2, 3);
      } else if (legUp) {
        ctx.fillRect(x + 4, y + 8, 2, 4);
        ctx.fillRect(x + 11, y + 8, 2, 3);
      } else {
        ctx.fillRect(x + 3, y + 8, 2, 3);
        ctx.fillRect(x + 10, y + 8, 2, 4);
      }
    }

    function drawCactus(o, fill) {
      var x = Math.round(o.x), y = Math.round(o.y - o.h);
      ctx.fillStyle = fill;
      // stem
      ctx.fillRect(x + 2, y, 2, o.h);
      if (o.arms >= 1) {
        // right arm
        ctx.fillRect(x + 4, y + 3, 2, 1);
        ctx.fillRect(x + 5, y + 1, 1, 3);
      }
      if (o.arms >= 2) {
        // left arm
        ctx.fillRect(x, y + 5, 2, 1);
        ctx.fillRect(x, y + 3, 1, 3);
      }
    }

    function drawCloud(c, fill) {
      var x = Math.round(c.x), y = Math.round(c.y), w = c.w;
      ctx.fillStyle = fill;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x, y, w, 2);
      ctx.fillRect(x + Math.round(w * 0.25), y - 1, Math.round(w * 0.5), 1);
      ctx.globalAlpha = 1;
    }

    function draw() {
      var GAME_INK = ink(), GAME_BG = bg();

      ctx.fillStyle = GAME_BG;
      ctx.fillRect(0, 0, W, H);

      for (var c = 0; c < clouds.length; c++) drawCloud(clouds[c], GAME_INK);

      // ground line + scrolling dash ticks
      ctx.fillStyle = GAME_INK;
      ctx.fillRect(0, GROUND, W, 1);
      var dashSpace = 8, dashLen = 3;
      var off = Math.floor((elapsed * speed) % dashSpace);
      for (var dx = -dashSpace + off; dx < W; dx += dashSpace) {
        ctx.fillRect(dx, GROUND + 2, dashLen, 1);
      }

      for (var j = 0; j < obs.length; j++) drawCactus(obs[j], GAME_INK);
      drawHorse(GAME_INK);
    }

    // ---- Loop ----
    var rafId = 0, disposed = false;
    function frame(now) {
      if (disposed) return;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (STATE === 'running') update(dt);
      draw();
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return function cleanup() {
      disposed = true;
      cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', onKey);
      shell.removeEventListener('touchstart', onTouch);
      shell.removeEventListener('mousedown', onMouse);
      restartBtn.removeEventListener('click', onRestart);
      if (AC) { try { AC.close(); } catch (e) {} }
    };
    /* eslint-enable */
  }, []);
}
