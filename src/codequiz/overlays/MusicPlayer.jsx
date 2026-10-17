export default function MusicPlayer({ vm }) {
  const {
    activeMusicTrack,
    handleMusicSkip,
    musicMode
  } = vm;

  return (
    <div className="music-player visible">
      <span className="music-player-icon">{musicMode === 'battle' ? '🔥' : '🎵'}</span>
      <span className="music-player-name">
        {musicMode === 'battle' ? 'Partida: ' : 'Menu: '}
        {activeMusicTrack?.name || 'Sem trilha'}
      </span>
      <button className="music-player-skip" onClick={handleMusicSkip} aria-label="Trocar trilha">
        ⏭
      </button>
    </div>
  );
}
