import { DIFFICULTY_LABELS } from '../lib/constants';
import { getAvatarFrameClass, getAvatarFrameStyle, getDisplayAvatar, getHeroBackgroundStyle } from '../lib/shop';
import { normalizeDifficulty } from '../lib/utils';
import {
  KNOWLEDGE_AREAS,
  PVP_MODE_DUEL,
  PVP_MODE_ELIMINATION,
  PVP_MODE_TEAM_BATTLE,
  PVP_TEAM_ROOM_SIDE_CAPACITY,
  getBackgroundVisualMeta,
  getMatchAcceptStateLabel,
  getPvpTeamMembersBySide,
  getPvpTeamRoomStatusLabel,
  getPvpTeamSideColorLabel,
  getPvpTeamUserSide,
  normalizePvpEliminationAcceptState
} from '../app/helpers';

export default function PvpLobbyScreen({ vm }) {
  const {
    acceptPvpEliminationRoomInvite,
    acceptPvpMatchInvite,
    arenaKaCarouselIndex,
    arenaPrimaryAction,
    authUser,
    buildCosmeticSnapshot,
    chooseKnowledgeAreaForPvp,
    choosePvpDifficulty,
    handleKnowledgeAreaTouchEnd,
    handleKnowledgeAreaTouchStart,
    joinPvpTeamRoomSide,
    knowledgeAreaById,
    matchAcceptBusy,
    matchAcceptCountdownLabel,
    matchBothAccepted,
    matchOpponentName,
    matchPlayer1AcceptState,
    matchPlayer2AcceptState,
    openPvpEmojiPicker,
    openPvpMode,
    openPvpTeamRoomCreate,
    openPvpTeamRoomLobby,
    playSfx,
    pvpAreaSelectionLocked,
    pvpBattleEmojis,
    pvpEliminationAcceptCountdownLabel,
    pvpEliminationAcceptMembers,
    pvpEliminationAcceptStateMap,
    pvpEliminationActionBusy,
    pvpEliminationAreaSelectionLocked,
    pvpEliminationHasLiveMatch,
    pvpEliminationInviteBusy,
    pvpEliminationPendingAccept,
    pvpEliminationPrimaryAction,
    pvpEliminationQueueTimeLabel,
    pvpEliminationQueueing,
    pvpEliminationShouldShowAcceptActions,
    pvpEliminationShowMatchFoundTransition,
    pvpKnowledgeArea,
    pvpMatch,
    pvpMode,
    pvpPlayer1Avatar,
    pvpPlayer1BackgroundMeta,
    pvpPlayer1FrameClass,
    pvpPlayer1FrameStyle,
    pvpPlayer1Shop,
    pvpPlayer2Avatar,
    pvpPlayer2BackgroundMeta,
    pvpPlayer2FrameClass,
    pvpPlayer2FrameStyle,
    pvpPlayer2Shop,
    pvpQueueTimeLabel,
    pvpSelectedDifficulty,
    pvpState,
    pvpTeamActionBusy,
    pvpTeamCurrentUserReady,
    pvpTeamMySide,
    pvpTeamRoom,
    pvpTeamRoomAreaMeta,
    pvpTeamRoomHostUserId,
    pvpTeamRoomId,
    pvpTeamRoomReadyMemberIds,
    pvpTeamRooms,
    queueActionBusy,
    rejectPvpEliminationRoomInvite,
    rejectPvpMatchInvite,
    screen,
    setArenaKaCarouselIndex,
    shiftKnowledgeAreaCarousel,
    shouldKeepQueueButtonPressed,
    shouldShowAcceptActions,
    showMatchFoundTransition,
    startPvpTeamBattle,
    togglePvpTeamReadyState,
    triggerAppBackNavigation
  } = vm;

  return (
    <div className={`screen screen-challenge ${screen === 'challenge' ? 'active' : ''}`}>
      <div className="screen-top">
        <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
        <h2>PVP</h2>
      </div>
      {!pvpMode ? (
        <div className="challenge-panel challenge-mode-menu">
          <h3>Escolha um modo</h3>
          <p>Selecione como voce quer disputar no PVP.</p>
          <div className="pvp-mode-grid">
            <button className="pvp-mode-banner mode-duel" type="button" onClick={() => openPvpMode(PVP_MODE_DUEL)}>
              <div className="pvp-mode-banner-art">
                <div className="pvp-mode-banner-strip">
                  <span className="pvp-mode-banner-code">01 / Solo Queue</span>
                  <span className="pvp-mode-banner-pill">Mais rapido</span>
                </div>
                <div className="pvp-mode-banner-roster duel" aria-hidden="true">
                  <span className="pvp-mode-banner-agent agent-red" />
                  <span className="pvp-mode-banner-vs">VS</span>
                  <span className="pvp-mode-banner-agent agent-blue" />
                </div>
              </div>
              <div className="pvp-mode-banner-body">
                <strong className="pvp-mode-banner-title">Duelo</strong>
              </div>
            </button>
            <button className="pvp-mode-banner mode-team" type="button" onClick={() => openPvpMode(PVP_MODE_TEAM_BATTLE)}>
              <div className="pvp-mode-banner-art">
                <div className="pvp-mode-banner-strip">
                  <span className="pvp-mode-banner-code">02 / Squad Lobby</span>
                  <span className="pvp-mode-banner-pill">Tatico</span>
                </div>
                <div className="pvp-mode-banner-roster team" aria-hidden="true">
                  <span className="pvp-mode-banner-agent agent-red" />
                  <span className="pvp-mode-banner-agent agent-red alt" />
                  <span className="pvp-mode-banner-vs">VS</span>
                  <span className="pvp-mode-banner-agent agent-blue" />
                  <span className="pvp-mode-banner-agent agent-blue alt" />
                </div>
              </div>
              <div className="pvp-mode-banner-body">
                <strong className="pvp-mode-banner-title">Batalha de Equipes</strong>
              </div>
            </button>
            <button className="pvp-mode-banner mode-elimination" type="button" onClick={() => openPvpMode(PVP_MODE_ELIMINATION)}>
              <div className="pvp-mode-banner-art">
                <div className="pvp-mode-banner-strip">
                  <span className="pvp-mode-banner-code">03 / Last Survivor</span>
                  <span className="pvp-mode-banner-pill">4 jogadores</span>
                </div>
                <div className="pvp-mode-banner-roster royale" aria-hidden="true">
                  <span className="pvp-mode-banner-agent agent-red" />
                  <span className="pvp-mode-banner-agent agent-blue" />
                  <span className="pvp-mode-banner-agent agent-gold champion" />
                  <span className="pvp-mode-banner-agent agent-red alt" />
                  <span className="pvp-mode-banner-agent agent-blue alt" />
                </div>
              </div>
              <div className="pvp-mode-banner-body">
                <strong className="pvp-mode-banner-title">Um Contra Todos</strong>
              </div>
            </button>
          </div>
        </div>
      ) : pvpMode === PVP_MODE_DUEL ? (
        <div className="challenge-panel challenge-arena">
        {pvpState.status === 'pending_accept' && pvpMatch ? (
          showMatchFoundTransition ? (
            <div className="match-found-transition" role="status" aria-live="polite">
              <div className="match-found-transition-card">
                <span className="match-found-transition-kicker">Matchmaking</span>
                <h3 className="match-found-transition-title">Partida encontrada</h3>
                <p className="match-found-transition-subtitle">
                  Preparando o duelo contra {matchOpponentName}.
                </p>
                <div className="match-found-transition-players">
                  <div
                    className={[
                      'match-found-transition-player-card',
                      pvpPlayer1BackgroundMeta.className
                    ].filter(Boolean).join(' ')}
                    data-bg-id={pvpPlayer1BackgroundMeta.id}
                    data-bg-rarity={pvpPlayer1BackgroundMeta.rarity}
                    style={{ background: getHeroBackgroundStyle(pvpPlayer1Shop) }}
                  >
                    <span className={`pvp-player-avatar match-found-transition-avatar ${pvpPlayer1FrameClass}`} style={pvpPlayer1FrameStyle}>{pvpPlayer1Avatar}</span>
                    <span className="match-found-transition-name">{pvpMatch?.player1_nickname || 'Jogador 1'}</span>
                  </div>
                  <div className="match-found-transition-vs" aria-hidden="true">VS</div>
                  <div
                    className={[
                      'match-found-transition-player-card',
                      pvpPlayer2BackgroundMeta.className
                    ].filter(Boolean).join(' ')}
                    data-bg-id={pvpPlayer2BackgroundMeta.id}
                    data-bg-rarity={pvpPlayer2BackgroundMeta.rarity}
                    style={{ background: getHeroBackgroundStyle(pvpPlayer2Shop) }}
                  >
                    <span className={`pvp-player-avatar match-found-transition-avatar ${pvpPlayer2FrameClass}`} style={pvpPlayer2FrameStyle}>{pvpPlayer2Avatar}</span>
                    <span className="match-found-transition-name">{pvpMatch?.player2_nickname || 'Jogador 2'}</span>
                  </div>
                </div>
                <div className="match-found-transition-loader" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          ) : (
            <div className="match-accept-card">
            <h3>Partida encontrada:</h3>
            <div className="match-accept-players">
              <div className={`match-accept-player ${matchPlayer1AcceptState}`}>
                <div
                  className={[
                    'match-accept-player-card',
                    pvpPlayer1BackgroundMeta.className
                  ].filter(Boolean).join(' ')}
                  data-bg-id={pvpPlayer1BackgroundMeta.id}
                  data-bg-rarity={pvpPlayer1BackgroundMeta.rarity}
                  style={{ background: getHeroBackgroundStyle(pvpPlayer1Shop) }}
                >
                  <span className="match-accept-dot" />
                  <div className="pvp-player-identity match-accept-identity">
                    <span className={`pvp-player-avatar match-accept-avatar ${pvpPlayer1FrameClass}`} style={pvpPlayer1FrameStyle}>{pvpPlayer1Avatar}</span>
                    <div className="match-accept-name-block">
                      <span className="pvp-player-name">{pvpMatch?.player1_nickname || 'Jogador 1'}</span>
                      <span className="match-accept-meta">
                        Nv. {Math.max(1, Number(pvpMatch?.player1_level || 1))} · {Math.max(0, Number(pvpMatch?.player1_pvp_points || 0))} pts
                      </span>
                    </div>
                  </div>
                  <div className="match-accept-state">{getMatchAcceptStateLabel(matchPlayer1AcceptState)}</div>
                </div>
              </div>
              <div className={`match-accept-vs ${matchBothAccepted ? 'ready' : ''}`}>⚔️</div>
              <div className={`match-accept-player ${matchPlayer2AcceptState}`}>
                <div
                  className={[
                    'match-accept-player-card',
                    pvpPlayer2BackgroundMeta.className
                  ].filter(Boolean).join(' ')}
                  data-bg-id={pvpPlayer2BackgroundMeta.id}
                  data-bg-rarity={pvpPlayer2BackgroundMeta.rarity}
                  style={{ background: getHeroBackgroundStyle(pvpPlayer2Shop) }}
                >
                  <span className="match-accept-dot" />
                  <div className="pvp-player-identity match-accept-identity">
                    <span className={`pvp-player-avatar match-accept-avatar ${pvpPlayer2FrameClass}`} style={pvpPlayer2FrameStyle}>{pvpPlayer2Avatar}</span>
                    <div className="match-accept-name-block">
                      <span className="pvp-player-name">{pvpMatch?.player2_nickname || 'Jogador 2'}</span>
                      <span className="match-accept-meta">
                        Nv. {Math.max(1, Number(pvpMatch?.player2_level || 1))} · {Math.max(0, Number(pvpMatch?.player2_pvp_points || 0))} pts
                      </span>
                    </div>
                  </div>
                  <div className="match-accept-state">{getMatchAcceptStateLabel(matchPlayer2AcceptState)}</div>
                </div>
              </div>
            </div>
            <div className="match-accept-countdown">{matchAcceptCountdownLabel}</div>
            {shouldShowAcceptActions ? (
              <div className="match-accept-actions">
                <button className="btn btn-primary btn-lg" disabled={matchAcceptBusy} onClick={acceptPvpMatchInvite}>
                  Aceitar
                </button>
                <button className="btn btn-secondary btn-lg" disabled={matchAcceptBusy} onClick={rejectPvpMatchInvite}>
                  Recusar
                </button>
              </div>
            ) : null}
            </div>
          )
        ) : (
          <>
            <h3 className="arena-title">Duelo</h3>
            <div className="arena-difficulty-selector">
              <div className="arena-ka-head">
                <span>Dificuldade da fila</span>
              </div>
              <div className="challenge-diff-list">
                {['easy', 'medium', 'hard'].map((difficulty) => {
                  const isSelected = pvpSelectedDifficulty === difficulty;
                  return (
                    <button
                      key={`arena_diff_${difficulty}`}
                      className={`challenge-diff-btn arena-diff-btn arena-diff-btn-${difficulty} ${isSelected ? 'active' : ''}`}
                      disabled={pvpAreaSelectionLocked}
                      onClick={() => choosePvpDifficulty(difficulty)}
                    >
                      {DIFFICULTY_LABELS[difficulty] || difficulty}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="arena-ka-selector">
              <div className="arena-ka-head">
                <span>Area de confronto</span>
              </div>
              <div className="arena-ka-carousel-container">
                <button
                  className="ka-arrow-btn arena-ka-arrow-btn arena-ka-arrow-left"
                  disabled={pvpAreaSelectionLocked || arenaKaCarouselIndex <= 0}
                  onClick={() => shiftKnowledgeAreaCarousel('pvp', -1)}
                  aria-label="Area anterior"
                >
                  ◀
                </button>
                <div
                  className="arena-ka-carousel-track"
                  onTouchStart={(e) => handleKnowledgeAreaTouchStart('pvp', e)}
                  onTouchEnd={(e) => handleKnowledgeAreaTouchEnd('pvp', e)}
                >
                  <div
                    className="arena-ka-carousel-slider"
                    style={{ transform: `translateX(-${arenaKaCarouselIndex * 100}%)` }}
                  >
                    {KNOWLEDGE_AREAS.map((area) => {
                      const isSelected = area.id === pvpKnowledgeArea;
                      return (
                        <div key={area.id} className={`arena-ka-card ${isSelected ? 'selected' : ''}`} style={{ '--ka-color': area.color }}>
                          <div className="arena-ka-card-icon">{area.icon}</div>
                          <div className="arena-ka-card-name">{area.name}</div>
                          <div className="arena-ka-card-desc">{area.desc}</div>
                          <button
                            className={`ka-card-btn arena-ka-card-btn ${isSelected ? 'selected' : ''}`}
                            disabled={pvpAreaSelectionLocked}
                            onClick={() => chooseKnowledgeAreaForPvp(area.id)}
                          >
                            {isSelected ? 'Selecionada' : 'Escolher'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  className="ka-arrow-btn arena-ka-arrow-btn arena-ka-arrow-right"
                  disabled={pvpAreaSelectionLocked || arenaKaCarouselIndex >= KNOWLEDGE_AREAS.length - 1}
                  onClick={() => shiftKnowledgeAreaCarousel('pvp', 1)}
                  aria-label="Proxima area"
                >
                  ▶
                </button>
              </div>
              <div className="arena-ka-dots">
                {KNOWLEDGE_AREAS.map((area, idx) => (
                  <button
                    key={`arena_ka_dot_${area.id}`}
                    className={`arena-ka-dot ${idx === arenaKaCarouselIndex ? 'active' : ''}`}
                    disabled={pvpAreaSelectionLocked}
                    onClick={() => {
                      if (idx === arenaKaCarouselIndex) return;
                      setArenaKaCarouselIndex(idx);
                      playSfx('click');
                    }}
                    aria-label={area.name}
                  />
                ))}
              </div>
            </div>

            <button className={`${arenaPrimaryAction.className} arena-primary-btn`} onClick={arenaPrimaryAction.onClick} disabled={arenaPrimaryAction.disabled}>
              {shouldKeepQueueButtonPressed && !queueActionBusy ? (
                <span className="arena-queue-time-label" aria-live="polite">{pvpQueueTimeLabel}</span>
              ) : arenaPrimaryAction.label}
            </button>
            <button className="btn btn-secondary challenge-edit-emojis-btn arena-secondary-btn" onClick={openPvpEmojiPicker}>
              Selecionar Emojis
            </button>
            <div className="challenge-emoji-preview">
              {pvpBattleEmojis.map((emoji) => (
                <span key={`arena_preview_${emoji}`} className="challenge-emoji-chip">{emoji}</span>
              ))}
            </div>
          </>
        )}
        </div>
      ) : pvpMode === PVP_MODE_TEAM_BATTLE ? (
        <div className="challenge-panel challenge-arena challenge-team-panel">
          <div className="challenge-team-head">
            <h3 className="arena-title">Batalha de Equipes</h3>
          </div>

          {!pvpTeamRoomId ? (
            <>
              <div className="pvp-team-room-list">
                {pvpTeamRooms.length ? pvpTeamRooms.map((room) => {
                  const roomId = String(room?.id || '').trim();
                  const roomAreaMeta = knowledgeAreaById.get(String(room?.knowledge_area || '').trim()) || null;
                  const roomRedMembers = getPvpTeamMembersBySide(room, 'red');
                  const roomBlueMembers = getPvpTeamMembersBySide(room, 'blue');
                  const roomMySide = getPvpTeamUserSide(room, authUser?.uid || '');
                  return (
                    <button
                      key={roomId}
                      type="button"
                      className={`pvp-team-room-card pvp-team-room-card-button ${roomMySide ? 'is-member' : ''}`}
                      onClick={() => openPvpTeamRoomLobby(room)}
                    >
                      <div className="pvp-team-room-card-head">
                        <div>
                          <strong>{room?.name || 'Sala de Equipe'}</strong>
                          <span>{room?.has_password ? 'Privada' : 'Aberta'} - {getPvpTeamRoomStatusLabel(room)}</span>
                        </div>
                        <span className="tier-badge tier-badge-compact tier-badge-arena">
                          {DIFFICULTY_LABELS[normalizeDifficulty(room?.difficulty || 'easy')] || 'Facil'}
                        </span>
                      </div>
                      <div className="pvp-team-room-card-meta">
                        <span>{roomAreaMeta?.name || 'Area geral'}</span>
                        <span>Vermelho {roomRedMembers.length}/2</span>
                        <span>Azul {roomBlueMembers.length}/2</span>
                        {roomMySide ? <span>No time {getPvpTeamSideColorLabel(roomMySide)}</span> : null}
                      </div>
                    </button>
                  );
                }) : (
                  <div className="challenge-status pvp-team-empty-state">
                    Nenhuma sala aberta agora. Crie a primeira para iniciar a batalha.
                  </div>
                )}
              </div>

              <div className="pvp-team-toolbar">
                <button className="btn btn-primary arena-primary-btn" disabled={pvpTeamActionBusy} onClick={openPvpTeamRoomCreate}>
                  Criar sala
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="pvp-team-room-card pvp-team-room-card-active">
                <div className="pvp-team-room-card-head">
                  <div>
                    <strong>{pvpTeamRoom?.name || 'Sala de Equipe'}</strong>
                    <span>{pvpTeamRoom?.has_password ? 'Privada' : 'Aberta'} - {getPvpTeamRoomStatusLabel(pvpTeamRoom)}</span>
                  </div>
                  <span className="tier-badge tier-badge-compact tier-badge-arena">
                    {DIFFICULTY_LABELS[normalizeDifficulty(pvpTeamRoom?.difficulty || 'easy')] || 'Facil'}
                  </span>
                </div>
                <div className="pvp-team-room-card-meta">
                  <span>{pvpTeamRoomAreaMeta?.name || 'Area geral'}</span>
                  <span>{String(pvpTeamRoomHostUserId || '').trim() === String(authUser?.uid || '').trim() ? 'Voce e o lider' : 'Aguardando o lider iniciar'}</span>
                </div>
              </div>

              <div className="pvp-team-lobby-grid">
                {['red', 'blue'].map((side) => {
                  const members = getPvpTeamMembersBySide(pvpTeamRoom, side);
                  const isMine = pvpTeamMySide === side;
                  return (
                    <div key={`team_side_${side}`} className={`pvp-team-side-panel ${side} ${isMine ? 'is-mine' : ''}`}>
                      <div className="pvp-team-side-head">
                        <strong>Time {getPvpTeamSideColorLabel(side)}</strong>
                        <span>{members.length}/{PVP_TEAM_ROOM_SIDE_CAPACITY}</span>
                      </div>
                      <div className="pvp-team-side-slots">
                        {Array.from({ length: PVP_TEAM_ROOM_SIDE_CAPACITY }, (_, slotIndex) => {
                          const member = members[slotIndex] || null;
                          if (!member) {
                            return (
                              <div key={`team_slot_${side}_${slotIndex}`} className="pvp-team-member-card is-empty">
                                <span className="pvp-team-member-avatar">+</span>
                                <div className="pvp-team-member-copy">
                                  <strong>Vaga aberta</strong>
                                  <span>Aguardando jogador</span>
                                </div>
                              </div>
                            );
                          }
                          const memberShop = buildCosmeticSnapshot(
                            member?.equipped_frame,
                            member?.equipped_background,
                            member?.equipped_emoji
                          );
                          const memberAvatar = getDisplayAvatar(member?.avatar || '\uD83D\uDE42', memberShop);
                          const memberFrameStyle = getAvatarFrameStyle(memberShop);
                          const memberFrameClass = getAvatarFrameClass(memberShop);
                          const memberBgStyle = getHeroBackgroundStyle(memberShop);
                          const memberBgMeta = getBackgroundVisualMeta(memberShop);
                          const memberId = String(member?.user_id || '').trim();
                          const isSelf = memberId === String(authUser?.uid || '').trim();
                          const isHost = memberId === String(pvpTeamRoomHostUserId || '').trim();
                          const isReady = pvpTeamRoomReadyMemberIds.includes(memberId);
                          return (
                            <div
                              key={`team_slot_${side}_${member.user_id}`}
                              className={['pvp-team-member-card', isSelf ? 'is-self' : '', memberBgMeta.className].filter(Boolean).join(' ')}
                              data-bg-id={memberBgMeta.id}
                              data-bg-rarity={memberBgMeta.rarity}
                              style={{ background: memberBgStyle }}
                            >
                              <span className={`pvp-player-avatar pvp-team-member-avatar ${memberFrameClass}`} style={memberFrameStyle}>{memberAvatar}</span>
                              <div className="pvp-team-member-copy">
                                <strong>{member?.nickname || 'Jogador'}</strong>
                                <div className="pvp-team-member-flags">
                                  {isHost ? <span className="pvp-team-member-flag host">Lider</span> : null}
                                  {isReady ? <span className="pvp-team-member-flag ready">Pronto</span> : null}
                                </div>
                                <span>Nv. {Math.max(1, Number(member?.level || 1))} - {Math.max(0, Number(member?.pvp_points || 0))} pts</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        className={`btn ${isMine ? 'btn-secondary' : 'btn-primary'}`}
                        disabled={pvpTeamActionBusy || isMine}
                        onClick={() => joinPvpTeamRoomSide(side)}
                      >
                        {isMine ? 'Neste lado' : `Entrar no ${getPvpTeamSideColorLabel(side)}`}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pvp-team-room-actions">
                {String(pvpTeamRoomHostUserId || '').trim() === String(authUser?.uid || '').trim() ? (
                  <button
                    className="btn btn-primary"
                    disabled={pvpTeamActionBusy}
                    onClick={() => startPvpTeamBattle()}
                  >
                    {pvpTeamActionBusy ? 'Iniciando...' : 'Iniciar batalha'}
                  </button>
                ) : (
                  <button
                    className={`btn ${pvpTeamCurrentUserReady ? 'btn-secondary pvp-team-ready-btn is-ready' : 'btn-primary pvp-team-ready-btn'}`}
                    disabled={pvpTeamActionBusy}
                    onClick={() => togglePvpTeamReadyState()}
                  >
                    {pvpTeamCurrentUserReady ? 'Pronto' : 'Pronto'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="challenge-panel challenge-arena challenge-team-panel challenge-elimination-panel">
          <div className="challenge-team-head">
            <h3 className="arena-title">Um Contra Todos</h3>
          </div>

          {!pvpEliminationPendingAccept ? (
            <>
              <div className="arena-difficulty-selector">
                <div className="arena-ka-head">
                  <span>Dificuldade da fila</span>
                </div>
                <div className="challenge-diff-list">
                  {['easy', 'medium', 'hard'].map((difficulty) => {
                    const isSelected = pvpSelectedDifficulty === difficulty;
                    return (
                      <button
                        key={`elimination_diff_${difficulty}`}
                        className={`challenge-diff-btn arena-diff-btn arena-diff-btn-${difficulty} ${isSelected ? 'active' : ''}`}
                        disabled={pvpEliminationAreaSelectionLocked}
                        onClick={() => choosePvpDifficulty(difficulty)}
                      >
                        {DIFFICULTY_LABELS[difficulty] || difficulty}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="arena-ka-selector">
                <div className="arena-ka-head">
                  <span>Area de confronto</span>
                </div>
                <div className="arena-ka-carousel-container">
                  <button
                    className="ka-arrow-btn arena-ka-arrow-btn arena-ka-arrow-left"
                    disabled={pvpEliminationAreaSelectionLocked || arenaKaCarouselIndex <= 0}
                    onClick={() => shiftKnowledgeAreaCarousel('pvp', -1)}
                    aria-label="Area anterior"
                  >
                    &#9664;
                  </button>
                  <div
                    className="arena-ka-carousel-track"
                    onTouchStart={(e) => handleKnowledgeAreaTouchStart('pvp', e)}
                    onTouchEnd={(e) => handleKnowledgeAreaTouchEnd('pvp', e)}
                  >
                    <div
                      className="arena-ka-carousel-slider"
                      style={{ transform: `translateX(-${arenaKaCarouselIndex * 100}%)` }}
                    >
                      {KNOWLEDGE_AREAS.map((area) => {
                        const isSelected = area.id === pvpKnowledgeArea;
                        return (
                          <div key={area.id} className={`arena-ka-card ${isSelected ? 'selected' : ''}`} style={{ '--ka-color': area.color }}>
                            <div className="arena-ka-card-icon">{area.icon}</div>
                            <div className="arena-ka-card-name">{area.name}</div>
                            <div className="arena-ka-card-desc">{area.desc}</div>
                            <button
                              className={`ka-card-btn arena-ka-card-btn ${isSelected ? 'selected' : ''}`}
                              disabled={pvpEliminationAreaSelectionLocked}
                              onClick={() => chooseKnowledgeAreaForPvp(area.id)}
                            >
                              {isSelected ? 'Selecionada' : 'Escolher'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    className="ka-arrow-btn arena-ka-arrow-btn arena-ka-arrow-right"
                    disabled={pvpEliminationAreaSelectionLocked || arenaKaCarouselIndex >= KNOWLEDGE_AREAS.length - 1}
                    onClick={() => shiftKnowledgeAreaCarousel('pvp', 1)}
                    aria-label="Proxima area"
                  >
                    &#9654;
                  </button>
                </div>
                <div className="arena-ka-dots">
                  {KNOWLEDGE_AREAS.map((area, idx) => (
                    <button
                      key={`elimination_ka_dot_${area.id}`}
                      className={`arena-ka-dot ${idx === arenaKaCarouselIndex ? 'active' : ''}`}
                      disabled={pvpEliminationAreaSelectionLocked}
                      onClick={() => {
                        if (idx === arenaKaCarouselIndex) return;
                        setArenaKaCarouselIndex(idx);
                        playSfx('click');
                      }}
                      aria-label={area.name}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {pvpEliminationPendingAccept ? (
            pvpEliminationShowMatchFoundTransition ? (
              <div className="match-found-transition" role="status" aria-live="polite">
                <div className="match-found-transition-card match-found-transition-card-elimination">
                  <span className="match-found-transition-kicker">Matchmaking</span>
                  <h3 className="match-found-transition-title">Grupo encontrado</h3>
                  <p className="match-found-transition-subtitle">
                    Confirmando aceite dos 4 jogadores.
                  </p>
                  <div className="match-found-transition-players match-found-transition-players-elimination">
                    {pvpEliminationAcceptMembers.map((member) => {
                      const memberId = String(member?.user_id || '').trim();
                      const memberShop = buildCosmeticSnapshot(
                        member?.equipped_frame,
                        member?.equipped_background,
                        member?.equipped_emoji
                      );
                      const memberAvatar = getDisplayAvatar(member?.avatar || '\uD83D\uDE42', memberShop);
                      const memberFrameStyle = getAvatarFrameStyle(memberShop);
                      const memberFrameClass = getAvatarFrameClass(memberShop);
                      const memberBgMeta = getBackgroundVisualMeta(memberShop);
                      return (
                        <div
                          key={`elimination_transition_player_${memberId}`}
                          className={[
                            'match-found-transition-player-card',
                            'match-found-transition-player-card-elimination',
                            memberBgMeta.className
                          ].filter(Boolean).join(' ')}
                          data-bg-id={memberBgMeta.id}
                          data-bg-rarity={memberBgMeta.rarity}
                          style={{ background: getHeroBackgroundStyle(memberShop) }}
                        >
                          <span className={`pvp-player-avatar match-found-transition-avatar ${memberFrameClass}`} style={memberFrameStyle}>{memberAvatar}</span>
                          <span className="match-found-transition-name">{member?.nickname || 'Jogador'}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="match-found-transition-loader" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            ) : (
              <div className="match-accept-card match-accept-card-elimination">
                <h3>Partida encontrada:</h3>
                <div className="match-accept-players match-accept-players-elimination">
                  {pvpEliminationAcceptMembers.map((member) => {
                    const memberId = String(member?.user_id || '').trim();
                    const acceptState = normalizePvpEliminationAcceptState(pvpEliminationAcceptStateMap[memberId]);
                    const memberShop = buildCosmeticSnapshot(
                      member?.equipped_frame,
                      member?.equipped_background,
                      member?.equipped_emoji
                    );
                    const memberAvatar = getDisplayAvatar(member?.avatar || '\uD83D\uDE42', memberShop);
                    const memberFrameStyle = getAvatarFrameStyle(memberShop);
                    const memberFrameClass = getAvatarFrameClass(memberShop);
                    const memberBgMeta = getBackgroundVisualMeta(memberShop);
                    return (
                      <div key={`elimination_accept_player_${memberId}`} className={`match-accept-player ${acceptState}`}>
                        <div
                          className={[
                            'match-accept-player-card',
                            'match-accept-player-card-elimination',
                            memberBgMeta.className
                          ].filter(Boolean).join(' ')}
                          data-bg-id={memberBgMeta.id}
                          data-bg-rarity={memberBgMeta.rarity}
                          style={{ background: getHeroBackgroundStyle(memberShop) }}
                        >
                          <span className="match-accept-dot" />
                          <div className="pvp-player-identity match-accept-identity">
                            <span className={`pvp-player-avatar match-accept-avatar ${memberFrameClass}`} style={memberFrameStyle}>{memberAvatar}</span>
                            <div className="match-accept-name-block">
                              <span className="pvp-player-name">{member?.nickname || 'Jogador'}</span>
                            </div>
                          </div>
                          <div className="match-accept-state">{getMatchAcceptStateLabel(acceptState)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="match-accept-countdown">{pvpEliminationAcceptCountdownLabel}</div>
                {pvpEliminationShouldShowAcceptActions ? (
                  <div className="match-accept-actions">
                    <button className="btn btn-primary btn-lg" disabled={pvpEliminationInviteBusy} onClick={acceptPvpEliminationRoomInvite}>
                      Aceitar
                    </button>
                    <button className="btn btn-secondary btn-lg" disabled={pvpEliminationInviteBusy} onClick={rejectPvpEliminationRoomInvite}>
                      Recusar
                    </button>
                  </div>
                ) : null}
              </div>
            )
          ) : null}

          <button
            className={`${pvpEliminationPrimaryAction.className} arena-primary-btn`}
            onClick={pvpEliminationPrimaryAction.onClick}
            disabled={pvpEliminationPrimaryAction.disabled}
          >
            {pvpEliminationQueueing && !pvpEliminationActionBusy && !pvpEliminationHasLiveMatch ? (
              <span className="arena-queue-time-label" aria-live="polite">{pvpEliminationQueueTimeLabel}</span>
            ) : pvpEliminationPrimaryAction.label}
          </button>
        </div>
      )}
    </div>
  );
}
