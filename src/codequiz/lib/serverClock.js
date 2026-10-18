import { readServerTimeMs } from './dbClient';

export function createServerClock({
  readTime = readServerTimeMs,
  wallNow = () => Date.now(),
  monotonicNow = () => performance.now()
} = {}) {
  let anchor = null;
  let inFlight = null;

  function getServerNowMs() {
    if (!anchor) return wallNow();
    return anchor.serverMs + Math.max(0, monotonicNow() - anchor.monotonicMs);
  }

  function syncServerClock() {
    if (inFlight) return inFlight;
    const sentAtMs = monotonicNow();
    inFlight = (async () => {
      try {
        const serverMs = await readTime();
        const receivedAtMs = monotonicNow();
        if (!Number.isFinite(serverMs) || serverMs <= 0) return false;
        const roundTripMs = Math.max(0, receivedAtMs - sentAtMs);
        // The timestamp was produced between request and response. Half the
        // round trip estimates its age when this client receives the sample.
        anchor = {
          serverMs: serverMs + roundTripMs / 2,
          monotonicMs: receivedAtMs
        };
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      inFlight = null;
    });
    return inFlight;
  }

  return { getServerNowMs, syncServerClock };
}

const clock = createServerClock();
export const getServerNowMs = clock.getServerNowMs;
export const syncServerClock = clock.syncServerClock;
