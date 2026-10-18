export const BATTLE_MUSIC_TRACK_DURATION_MS = 120 * 1000;

// All players derive their place in the playlist from the same persisted match
// start. Joining later or reconnecting therefore does not restart the music.
export function getMatchMusicPlayback({ matchId, startedAtMs, nowMs, trackCount } = {}) {
  if (typeof matchId !== 'string' || !matchId.trim()) return null;
  if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) return null;
  if (!Number.isFinite(nowMs) || nowMs < 0) return null;
  if (!Number.isInteger(trackCount) || trackCount <= 0) return null;

  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const slot = Math.floor(elapsedMs / BATTLE_MUSIC_TRACK_DURATION_MS);
  const trackElapsedMs = elapsedMs % BATTLE_MUSIC_TRACK_DURATION_MS;

  return {
    key: `${matchId.trim()}:${slot}`,
    trackIndex: slot % trackCount,
    trackElapsedMs,
    remainingMs: BATTLE_MUSIC_TRACK_DURATION_MS - trackElapsedMs,
    slot
  };
}
