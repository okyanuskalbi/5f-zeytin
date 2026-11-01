/** One native seek in flight. A fast reversal replaces, rather than queues,
 * intermediate frames. Same-time writes never arm a wait for a missing event. */
export function createSeekQueue(read: () => number, write: (time: number) => void) {
  let busy = false;
  let pending: number | undefined;
  function request(time: number): void {
    if (!Number.isFinite(time)) return;
    if (busy) { pending = time; return; }
    if (Math.abs(read() - time) < 1 / 120) return;
    busy = true;
    try { write(time); } catch { busy = false; pending = undefined; }
  }
  return {
    request,
    complete() {
      busy = false;
      const latest = pending; pending = undefined;
      if (latest !== undefined) request(latest);
    },
    reset() { busy = false; pending = undefined; },
  };
}

export function progressTime(progress: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.max(0, Math.min(1, progress)) * Math.max(0, duration - 1 / 24);
}

/** Frame-rate independent exponential approach, bounded in both directions. */
export function approachTime(shown: number, target: number, dt: number): number {
  return shown + (target - shown) * (1 - Math.pow(.78, Math.max(0, Math.min(100, dt)) / (1000 / 60)));
}
