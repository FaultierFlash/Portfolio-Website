// Shared lifecycle & adaptive motion controller for physics canvas backgrounds.
// Handles off-screen pausing, tab visibility pausing, adaptive FPS throttling on slow hardware,
// gentle slow-motion for OS prefers-reduced-motion, and explicit user play/pause state.

export interface CanvasMotionState {
  isVisible: boolean;
  isTabVisible: boolean;
  isPausedByUser: boolean;
  reducedMotion: boolean;
  speedMultiplier: number;
  cursorMultiplier: number;
  shouldAnimate: boolean;
}

export interface CanvasMotionOptions {
  threshold?: number;
  onVisibilityChange?: (shouldAnimate: boolean) => void;
  onThemeChange?: () => void;
  onReduceMotionChange?: (state: CanvasMotionState) => void;
  step: (nowMs: number, deltaMs: number, state: CanvasMotionState) => void;
}

export interface CanvasMotionController {
  getState: () => CanvasMotionState;
  setPaused: (paused: boolean) => void;
  togglePaused: () => boolean;
  kick: () => void;
  destroy: () => void;
}

export function createCanvasMotionController(
  container: HTMLElement,
  options: CanvasMotionOptions
): CanvasMotionController {
  const mql =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  let isVisible = true;
  let isTabVisible = typeof document !== 'undefined' ? !document.hidden : true;
  let isPausedByUser = container.dataset.motionPaused === 'true';
  let reducedMotion = mql?.matches ?? false;
  let destroyed = false;
  let rafId: number | null = null;
  let lastTickMs = performance.now();
  let lastDrawMs = performance.now();

  // Adaptive frame pacing: full native rate by default; smoothly throttle to ~30fps if sustained slow frames occur
  let emaFrameMs = 16.7;
  let slowFrameStreak = 0;
  let fastFrameStreak = 0;
  let throttled = false;

  const getState = (): CanvasMotionState => {
    const shouldAnimate = !destroyed && isVisible && isTabVisible && !isPausedByUser;
    return {
      isVisible,
      isTabVisible,
      isPausedByUser,
      reducedMotion,
      speedMultiplier: reducedMotion ? 0.2 : 1.0,
      cursorMultiplier: reducedMotion ? 0.25 : 1.0,
      shouldAnimate,
    };
  };

  const stopLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const tick = (nowMs: number) => {
    rafId = null;
    if (destroyed || !container.isConnected) {
      destroy();
      return;
    }

    const state = getState();
    if (!state.shouldAnimate) {
      return;
    }

    const rawDelta = Math.max(0, Math.min(nowMs - lastTickMs, 100));
    lastTickMs = nowMs;

    // Update adaptive frame-time monitor
    emaFrameMs = emaFrameMs * 0.85 + rawDelta * 0.15;
    if (emaFrameMs > 28) {
      slowFrameStreak++;
      fastFrameStreak = 0;
      if (slowFrameStreak >= 12) throttled = true;
    } else if (emaFrameMs < 19) {
      fastFrameStreak++;
      slowFrameStreak = 0;
      if (fastFrameStreak >= 45) throttled = false;
    }

    const drawElapsed = nowMs - lastDrawMs;
    const minInterval = throttled ? 32 : 0; // ~30fps when hardware struggles, native FPS otherwise
    if (drawElapsed >= minInterval) {
      lastDrawMs = nowMs;
      options.step(nowMs, Math.min(drawElapsed, 100), state);
    }

    if (!destroyed && getState().shouldAnimate) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const syncLoop = () => {
    const state = getState();
    options.onVisibilityChange?.(state.shouldAnimate);
    if (state.shouldAnimate && rafId === null) {
      const now = performance.now();
      lastTickMs = now;
      lastDrawMs = now - 34;
      rafId = requestAnimationFrame(tick);
    } else if (!state.shouldAnimate) {
      stopLoop();
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
      syncLoop();
    },
    { threshold: options.threshold ?? 0.01 }
  );
  io.observe(container);

  const onVisChange = () => {
    isTabVisible = !document.hidden;
    syncLoop();
  };
  document.addEventListener('visibilitychange', onVisChange);

  const onMqlChange = (e: MediaQueryListEvent) => {
    reducedMotion = e.matches;
    options.onReduceMotionChange?.(getState());
  };
  mql?.addEventListener?.('change', onMqlChange);

  const themeObserver = new MutationObserver(() => {
    options.onThemeChange?.();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  const setPaused = (paused: boolean) => {
    isPausedByUser = paused;
    container.dataset.motionPaused = paused ? 'true' : 'false';
    syncLoop();
  };

  const togglePaused = () => {
    setPaused(!isPausedByUser);
    return isPausedByUser;
  };

  const kick = () => {
    syncLoop();
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    stopLoop();
    io.disconnect();
    themeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisChange);
    mql?.removeEventListener?.('change', onMqlChange);
  };

  syncLoop();

  return {
    getState,
    setPaused,
    togglePaused,
    kick,
    destroy,
  };
}
