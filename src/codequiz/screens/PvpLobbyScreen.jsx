import { useEffect, useState } from 'react';
import { ArrowLeftRight, Crown, Lock, Plus, Smile, Swords, UserCheck, Users } from 'lucide-react';
import { DIFFICULTY_LABELS } from '../lib/constants';
import { normalizeDifficulty } from '../lib/utils';
import {
  PVP_MODE_DUEL,
  PVP_MODE_ELIMINATION,
  PVP_MODE_TEAM_BATTLE,
  PVP_TEAM_ROOM_SIDE_CAPACITY,
  getPvpTeamMemberReadyAtMs,
  getPvpTeamMembersBySide,
  getPvpTeamRoomStatusLabel,
  getPvpTeamSideColorLabel,
  getPvpTeamUserSide,
  normalizePvpEliminationAcceptState
} from '../app/helpers';
import { Badge, Button, Card, EmptyState, PageHeader, SectionHeader, cx } from '../ui';
import {
  AreaPicker,
  Countdown,
  DifficultyPicker,
  LoadingDots,
  PlayerCard,
  QueuePanel,
  arenaStyles as arena
} from './shared/ArenaParts';
import { buildPlayerView, playerViewFromShop } from './shared/players';
import styles from './PvpLobbyScreen.module.css';

const DIFFICULTY_TONES = { easy: 'lime', medium: 'orange', hard: 'pink' };

const MODES = [
  {
    id: PVP_MODE_DUEL,
    icon: Swords,
    title: 'Duelo 1x1',
    tag: 'Mais rápido',
    text: 'Enfrente outro jogador em rodadas de perguntas valendo pontos de liga.',
    className: styles.modeDuel
  },
  {
    id: PVP_MODE_TEAM_BATTLE,
    icon: Users,
    title: 'Batalha de equipes',
    tag: '2 contra 2',
    text: 'Monte uma sala, escolha seu time e vença junto com seu parceiro.',
    className: styles.modeTeam
  },
  {
    id: PVP_MODE_ELIMINATION,
    icon: Crown,
    title: 'Um contra todos',
    tag: '4 jogadores',
    text: 'Eliminatória em duelos: só o último em pé leva a coroa.',
    className: styles.modeElim
  }
];

const MODE_HEADERS = {
  [PVP_MODE_DUEL]: { title: 'Duelo 1x1', subtitle: 'Escolha a dificuldade e a área, depois entre na fila.' },
  [PVP_MODE_TEAM_BATTLE]: { title: 'Batalha de equipes', subtitle: 'Entre numa sala aberta ou crie a sua.' },
  [PVP_MODE_ELIMINATION]: { title: 'Um contra todos', subtitle: 'Fila para 4 jogadores em eliminatória.' }
};

function ModeMenu({ openPvpMode }) {
  return (
    <ul className={styles.modes}>
      {MODES.map((mode) => {
        const Icon = mode.icon;
        return (
          <li key={mode.id}>
            <button type="button" className={cx(styles.mode, mode.className)} onClick={() => openPvpMode(mode.id)}>
              <span className={styles.modeTop}>
                <span className={styles.modeIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
                <span className={styles.modeTag}>{mode.tag}</span>
              </span>
              <span>
                <span className={styles.modeTitle}>{mode.title}</span>
                <span className={styles.modeText}>{mode.text}</span>
              </span>
              <Icon className={styles.modeDecor} aria-hidden="true" strokeWidth={1.4} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// O que o jogador escolheu para a fila (aparece no radar enquanto procura)
function QueueChoice({ difficulty, areaId, knowledgeAreaById }) {
  const level = normalizeDifficulty(difficulty || 'easy');
  const area = knowledgeAreaById?.get(String(areaId || '').trim()) || null;
  return (
    <>
      <Badge tone={DIFFICULTY_TONES[level] || 'lime'} size="sm">{DIFFICULTY_LABELS[level]}</Badge>
      {area ? <Badge tone="neutral" size="sm">{`${area.icon} ${area.name}`}</Badge> : null}
    </>
  );
}

function EmojiList({ emojis }) {
  return (
    <div className={styles.emojiRow}>
      {(Array.isArray(emojis) ? emojis : []).map((emoji) => (
        <span key={`emoji_${emoji}`} className={styles.emoji} aria-hidden="true">{emoji}</span>
      ))}
    </div>
  );
}

function EmojiCard({ emojis, onEdit, subtitle = 'Reaja durante o duelo.' }) {
  return (
    <Card padding="lg" className={styles.emojiCard}>
      <SectionHeader title="Emojis da partida" subtitle={subtitle} icon={Smile} />
      <EmojiList emojis={emojis} />
      <Button variant="secondary" size="sm" onClick={onEdit}>Editar emojis</Button>
    </Card>
  );
}

// Faixa compacta para a sala 2x2: os emojis que você leva para a batalha e o atalho para trocar
function EmojiStrip({ emojis, onEdit }) {
  return (
    <div className={styles.emojiStrip} role="group" aria-label="Emojis da partida">
      <span className={styles.emojiStripLabel}>
        <Smile aria-hidden="true" strokeWidth={2.4} />
        <span>Emojis<span className={styles.labelLong}> da partida</span></span>
      </span>
      <EmojiList emojis={emojis} />
      <Button variant="secondary" size="sm" onClick={onEdit}>Editar</Button>
    </div>
  );
}

function DuelPanel({ vm }) {
  const {
    acceptPvpMatchInvite,
    arenaPrimaryAction,
    chooseKnowledgeAreaForPvp,
    choosePvpDifficulty,
    knowledgeAreaById,
    matchAcceptBusy,
    matchAcceptCountdownLabel,
    matchBothAccepted,
    matchOpponentName,
    matchPlayer1AcceptState,
    matchPlayer2AcceptState,
    openPvpEmojiPicker,
    pvpAreaSelectionLocked,
    pvpBattleEmojis,
    pvpKnowledgeArea,
    pvpMatch,
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
    queueActionBusy,
    rejectPvpMatchInvite,
    shouldKeepQueueButtonPressed,
    shouldShowAcceptActions,
    showMatchFoundTransition
  } = vm;

  if (pvpState.status === 'pending_accept' && pvpMatch) {
    const player1 = playerViewFromShop({
      nickname: pvpMatch?.player1_nickname || 'Jogador 1',
      avatar: pvpPlayer1Avatar,
      frameClass: pvpPlayer1FrameClass,
      frameStyle: pvpPlayer1FrameStyle,
      shop: pvpPlayer1Shop,
      backgroundMeta: pvpPlayer1BackgroundMeta,
      level: pvpMatch?.player1_level,
      points: pvpMatch?.player1_pvp_points
    });
    const player2 = playerViewFromShop({
      nickname: pvpMatch?.player2_nickname || 'Jogador 2',
      avatar: pvpPlayer2Avatar,
      frameClass: pvpPlayer2FrameClass,
      frameStyle: pvpPlayer2FrameStyle,
      shop: pvpPlayer2Shop,
      backgroundMeta: pvpPlayer2BackgroundMeta,
      level: pvpMatch?.player2_level,
      points: pvpMatch?.player2_pvp_points
    });
    const metaOf = (player) => `Nv. ${player.level} · ${player.points} pts`;

    if (showMatchFoundTransition) {
      return (
        <section className={arena.found} role="status" aria-live="polite">
          <span className={arena.foundKicker}>Matchmaking</span>
          <h2 className={arena.foundTitle}>Partida encontrada!</h2>
          <p className={styles.muted}>Preparando o duelo contra {matchOpponentName}.</p>
          <div className={arena.versus}>
            <PlayerCard player={player1} meta={metaOf(player1)} vertical avatarSize="lg" />
            <span className={arena.vs}>VS</span>
            <PlayerCard player={player2} meta={metaOf(player2)} vertical avatarSize="lg" />
          </div>
          <LoadingDots />
        </section>
      );
    }

    return (
      <section className={arena.found} aria-live="polite">
        <span className={arena.foundKicker}>Confirme sua vaga</span>
        <h2 className={arena.foundTitle}>Partida encontrada</h2>
        <div className={arena.versus}>
          <PlayerCard player={player1} meta={metaOf(player1)} state={matchPlayer1AcceptState} vertical avatarSize="lg" />
          <span className={cx(arena.vs, matchBothAccepted ? arena.vsReady : '')}>VS</span>
          <PlayerCard player={player2} meta={metaOf(player2)} state={matchPlayer2AcceptState} vertical avatarSize="lg" />
        </div>
        <Countdown label={matchAcceptCountdownLabel} />
        {shouldShowAcceptActions ? (
          <div className={arena.acceptActions}>
            <Button size="lg" variant="success" disabled={matchAcceptBusy} onClick={acceptPvpMatchInvite}>Aceitar</Button>
            <Button size="lg" variant="secondary" disabled={matchAcceptBusy} onClick={rejectPvpMatchInvite}>Recusar</Button>
          </div>
        ) : (
          <p className={styles.muted}>{matchBothAccepted ? 'Tudo pronto! O duelo vai começar.' : 'Aguardando o outro jogador confirmar.'}</p>
        )}
      </section>
    );
  }

  const searching = shouldKeepQueueButtonPressed && !queueActionBusy;
  return (
    <div className={cx(styles.layout, searching ? styles.layoutSearching : '')}>
      <Card padding="lg" className={styles.config}>
        <DifficultyPicker value={pvpSelectedDifficulty} onChoose={choosePvpDifficulty} disabled={pvpAreaSelectionLocked} label="Dificuldade da fila" />
        <AreaPicker value={pvpKnowledgeArea} onChoose={chooseKnowledgeAreaForPvp} disabled={pvpAreaSelectionLocked} />
      </Card>
      <div className={styles.side}>
        <QueuePanel
          searching={searching}
          timeLabel={pvpQueueTimeLabel}
          action={arenaPrimaryAction}
          details={<QueueChoice difficulty={pvpSelectedDifficulty} areaId={pvpKnowledgeArea} knowledgeAreaById={knowledgeAreaById} />}
        />
        <EmojiCard emojis={pvpBattleEmojis} onEdit={openPvpEmojiPicker} />
      </div>
    </div>
  );
}

// Sala 2x2 "frente a frente": cada time numa faixa inteira, um contra o outro, com o VS na
// costura (no celular as faixas ficam empilhadas; do tablet para cima, lado a lado). Tocar na
// faixa do outro time troca de time. Quem completa as vagas aparece como qualquer jogador.
function TeamRoom({ vm }) {
  const {
    authUser,
    buildCosmeticSnapshot,
    joinPvpTeamRoomSide,
    openPvpEmojiPicker,
    pvpBattleEmojis,
    pvpTeamActionBusy,
    pvpTeamAutoStartPending,
    pvpTeamCurrentUserReady,
    pvpTeamMySide,
    pvpTeamRoom,
    pvpTeamRoomAreaMeta,
    pvpTeamRoomHostUserId,
    startPvpTeamBattle,
    togglePvpTeamReadyState
  } = vm;
  const selfId = String(authUser?.uid || '').trim();
  const hostId = String(pvpTeamRoomHostUserId || '').trim();
  const isHost = hostId === selfId;
  const roomDifficulty = normalizeDifficulty(pvpTeamRoom?.difficulty || 'easy');
  const membersBySide = {
    red: getPvpTeamMembersBySide(pvpTeamRoom, 'red'),
    blue: getPvpTeamMembersBySide(pvpTeamRoom, 'blue')
  };
  const allMembers = [...membersBySide.red, ...membersBySide.blue];
  const openSlots = Math.max(0, (PVP_TEAM_ROOM_SIDE_CAPACITY * 2) - allMembers.length);

  // "Pronto" de cada um. Quem ainda vai ficar pronto sozinho tem hora marcada: o relógio só
  // anda até essa hora, para a etiqueta aparecer no momento certo.
  const [nowMs, setNowMs] = useState(() => Date.now());
  const readyAtById = new Map(allMembers.map((member) => [
    String(member?.user_id || '').trim(),
    getPvpTeamMemberReadyAtMs(pvpTeamRoom, member)
  ]));
  const nextReadyAtMs = Math.min(Infinity, ...[...readyAtById.values()].filter((atMs) => atMs !== null && atMs > nowMs));
  useEffect(() => {
    if (!Number.isFinite(nextReadyAtMs)) return undefined;
    const timer = setTimeout(() => setNowMs(Date.now()), Math.max(50, nextReadyAtMs - Date.now()));
    return () => clearTimeout(timer);
  }, [nextReadyAtMs]);
  const isShownReady = (userId) => {
    const atMs = readyAtById.get(userId);
    return atMs !== null && atMs !== undefined && atMs <= nowMs;
  };

  // O líder não marca pronto: a contagem é de quem ele espera
  const guestIds = allMembers.map((member) => String(member?.user_id || '').trim()).filter((id) => id && id !== hostId);
  const readyGuests = guestIds.filter(isShownReady).length;
  const allReady = openSlots === 0 && readyGuests === guestIds.length;

  const renderBand = (side) => {
    const members = membersBySide[side];
    const isMine = pvpTeamMySide === side;
    const isFull = members.length >= PVP_TEAM_ROOM_SIDE_CAPACITY;
    const canJoin = !isMine && !isFull && !pvpTeamActionBusy;
    const sideLabel = getPvpTeamSideColorLabel(side);
    return (
      <section
        key={side}
        className={cx(styles.band, side === 'blue' ? styles.bandBlue : styles.bandRed, canJoin ? styles.bandJoinable : '')}
        aria-label={`Time ${sideLabel}`}
        // A faixa inteira troca de time; o botão do cabeçalho é o mesmo toque para teclado e leitor de tela
        onClick={canJoin ? () => joinPvpTeamRoomSide(side) : undefined}
      >
        <div className={styles.bandHead}>
          <span className={styles.bandName}>{sideLabel}</span>
          <span className={styles.bandCount}>{members.length}/{PVP_TEAM_ROOM_SIDE_CAPACITY}</span>
          <span className={styles.bandAside}>
            {isMine ? <span className={styles.bandTag}>Seu time</span> : null}
            {canJoin ? (
              <button type="button" className={styles.bandSwap} aria-label={pvpTeamMySide ? `Trocar para o ${sideLabel}` : `Entrar no ${sideLabel}`}>
                <ArrowLeftRight aria-hidden="true" strokeWidth={2.6} />
                <span className={styles.labelLong}>{pvpTeamMySide ? `Trocar para o ${sideLabel}` : `Entrar no ${sideLabel}`}</span>
                <span className={styles.labelShort}>{pvpTeamMySide ? 'Trocar' : 'Entrar'}</span>
              </button>
            ) : null}
            {!isMine && isFull ? <span className={styles.bandTag}>Time cheio</span> : null}
          </span>
        </div>
        <div className={styles.bandPlayers}>
          {Array.from({ length: PVP_TEAM_ROOM_SIDE_CAPACITY }, (_, slotIndex) => {
            const member = members[slotIndex] || null;
            if (!member) {
              return (
                <div key={`slot_${side}_${slotIndex}`} className={styles.slot}>
                  <span className={styles.slotPlus} aria-hidden="true"><Plus strokeWidth={2.6} /></span>
                  <span className={styles.slotText}>
                    Vaga aberta
                    <small>Aguardando jogador</small>
                  </span>
                </div>
              );
            }
            const player = buildPlayerView(member, buildCosmeticSnapshot);
            const memberId = player.userId;
            const tags = (
              <>
                {memberId === hostId ? <Badge tone="gold" size="sm" icon={Crown}>Líder</Badge> : null}
                {memberId !== hostId && isShownReady(memberId) ? <Badge tone="lime" size="sm" icon={UserCheck}>Pronto</Badge> : null}
              </>
            );
            return (
              <PlayerCard
                key={`slot_${side}_${memberId}`}
                player={player}
                meta={`Nv. ${player.level} · ${player.points} pts`}
                tags={tags}
                side={side}
                self={memberId === selfId}
                vertical
                avatarSize="md"
              />
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <>
      {/* O nome da sala já está no título da tela: aqui ficam só as etiquetas da partida */}
      <div className={styles.roomInfo}>
        <Badge tone={DIFFICULTY_TONES[roomDifficulty] || 'lime'} size="sm">{DIFFICULTY_LABELS[roomDifficulty]}</Badge>
        <Badge tone="neutral" size="sm">
          {pvpTeamRoomAreaMeta ? `${pvpTeamRoomAreaMeta.icon} ${pvpTeamRoomAreaMeta.name}` : 'Área geral'}
        </Badge>
        {pvpTeamRoom?.has_password ? <Badge tone="neutral" size="sm" icon={Lock}>Privada</Badge> : null}
      </div>

      <div className={styles.arena}>
        {renderBand('red')}
        <div className={styles.seam} role="status">
          <span className={cx(styles.seamPill, allReady ? styles.seamPillReady : '')}>
            {guestIds.length ? `${readyGuests}/${guestIds.length} prontos` : 'Só o líder'}
          </span>
          <span className={styles.vs} aria-hidden="true">VS</span>
          <span className={styles.seamPill}>
            {openSlots ? `${openSlots} ${openSlots === 1 ? 'vaga' : 'vagas'}` : 'Sala cheia'}
          </span>
        </div>
        {renderBand('blue')}
      </div>

      <EmojiStrip emojis={pvpBattleEmojis} onEdit={openPvpEmojiPicker} />

      <div className={styles.roomActions}>
        {isHost ? (
          <>
            <Button
              size="xl"
              variant="success"
              block
              loading={pvpTeamActionBusy || pvpTeamAutoStartPending}
              disabled={pvpTeamAutoStartPending}
              onClick={() => startPvpTeamBattle()}
            >
              {pvpTeamAutoStartPending ? 'Procurando jogadores...' : 'Iniciar batalha'}
            </Button>
            {openSlots > 0 ? (
              <p className={styles.hint} role="status">
                {pvpTeamAutoStartPending
                  ? 'A batalha começa assim que a sala lotar.'
                  : 'Ao iniciar, procuramos jogadores para as vagas abertas.'}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <Button
              size="xl"
              variant={pvpTeamCurrentUserReady ? 'secondary' : 'success'}
              icon={pvpTeamCurrentUserReady ? UserCheck : undefined}
              block
              disabled={pvpTeamActionBusy}
              onClick={() => togglePvpTeamReadyState()}
            >
              {pvpTeamCurrentUserReady ? 'Pronto! (toque para cancelar)' : 'Estou pronto'}
            </Button>
            <p className={styles.hint} role="status">O líder inicia a batalha quando a sala estiver pronta.</p>
          </>
        )}
      </div>
    </>
  );
}

function TeamPanel({ vm }) {
  const {
    authUser,
    knowledgeAreaById,
    openPvpTeamRoomCreate,
    openPvpTeamRoomLobby,
    pvpTeamActionBusy,
    pvpTeamRoomId,
    pvpTeamRooms
  } = vm;
  const selfId = String(authUser?.uid || '').trim();

  if (!pvpTeamRoomId) {
    return (
      <>
        <SectionHeader
          title="Salas abertas"
          subtitle="Toque numa sala para ver os times."
          icon={Users}
          action={<Button size="sm" icon={Plus} disabled={pvpTeamActionBusy} onClick={openPvpTeamRoomCreate}>Criar sala</Button>}
        />
        {pvpTeamRooms.length ? (
          <ul className={styles.rooms}>
            {pvpTeamRooms.map((room) => {
              const roomId = String(room?.id || '').trim();
              const area = knowledgeAreaById.get(String(room?.knowledge_area || '').trim()) || null;
              const red = getPvpTeamMembersBySide(room, 'red');
              const blue = getPvpTeamMembersBySide(room, 'blue');
              const mySide = getPvpTeamUserSide(room, selfId);
              const difficulty = normalizeDifficulty(room?.difficulty || 'easy');
              return (
                <li key={roomId}>
                  <button type="button" className={cx(styles.room, mySide ? styles.roomMine : '')} onClick={() => openPvpTeamRoomLobby(room)}>
                    <span className={styles.roomHead}>
                      <span className={styles.roomName}>
                        {room?.has_password ? <Lock aria-label="Sala privada" strokeWidth={2.6} /> : null}
                        {room?.name || 'Sala de equipe'}
                      </span>
                      <Badge tone={DIFFICULTY_TONES[difficulty] || 'lime'} size="sm">{DIFFICULTY_LABELS[difficulty]}</Badge>
                    </span>
                    <span className={styles.roomMeta}>
                      <span>{area ? `${area.icon} ${area.name}` : 'Área geral'}</span>
                      <span>·</span>
                      <span>{getPvpTeamRoomStatusLabel(room)}</span>
                    </span>
                    <span className={styles.roomMeta}>
                      <span className={styles.teamCount}><span className={styles.dotRed} aria-hidden="true" />Vermelho {red.length}/{PVP_TEAM_ROOM_SIDE_CAPACITY}</span>
                      <span className={styles.teamCount}><span className={styles.dotBlue} aria-hidden="true" />Azul {blue.length}/{PVP_TEAM_ROOM_SIDE_CAPACITY}</span>
                      {mySide ? <Badge tone="violet" size="sm">Você está no {getPvpTeamSideColorLabel(mySide)}</Badge> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <Card>
            <EmptyState
              icon={Users}
              title="Nenhuma sala aberta"
              text="Crie a primeira sala e chame seus amigos para a batalha."
              action={<Button icon={Plus} disabled={pvpTeamActionBusy} onClick={openPvpTeamRoomCreate}>Criar sala</Button>}
            />
          </Card>
        )}
      </>
    );
  }

  return <TeamRoom vm={vm} />;
}

function EliminationPanel({ vm }) {
  const {
    acceptPvpEliminationRoomInvite,
    authUser,
    buildCosmeticSnapshot,
    chooseKnowledgeAreaForPvp,
    choosePvpDifficulty,
    knowledgeAreaById,
    openPvpEmojiPicker,
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
    pvpSelectedDifficulty,
    rejectPvpEliminationRoomInvite
  } = vm;

  const members = (Array.isArray(pvpEliminationAcceptMembers) ? pvpEliminationAcceptMembers : [])
    .map((member) => buildPlayerView(member, buildCosmeticSnapshot));

  const eliminationSearching = pvpEliminationQueueing && !pvpEliminationActionBusy && !pvpEliminationHasLiveMatch;
  const acceptStates = members.map((player) => normalizePvpEliminationAcceptState(pvpEliminationAcceptStateMap[player.userId]));
  // Quem já aceitou vê o aviso no lugar dos botões (até todos confirmarem)
  const waitingOthers = !pvpEliminationShouldShowAcceptActions
    && normalizePvpEliminationAcceptState(pvpEliminationAcceptStateMap[String(authUser?.uid || '').trim()]) === 'accepted'
    && acceptStates.some((state) => state === 'pending')
    && !acceptStates.includes('rejected');
  return (
    <div
      className={cx(
        styles.layout,
        eliminationSearching && !pvpEliminationPendingAccept ? styles.layoutSearching : '',
        pvpEliminationPendingAccept ? styles.layoutSolo : ''
      )}
    >
      {!pvpEliminationPendingAccept ? (
        <Card padding="lg" className={styles.config}>
          <DifficultyPicker value={pvpSelectedDifficulty} onChoose={choosePvpDifficulty} disabled={pvpEliminationAreaSelectionLocked} label="Dificuldade da fila" />
          <AreaPicker value={pvpKnowledgeArea} onChoose={chooseKnowledgeAreaForPvp} disabled={pvpEliminationAreaSelectionLocked} />
        </Card>
      ) : pvpEliminationShowMatchFoundTransition ? (
        <section className={cx(arena.found, styles.groupCard)} role="status" aria-live="polite">
          <span className={arena.foundKicker}>Matchmaking</span>
          <h2 className={arena.foundTitle}>Grupo encontrado!</h2>
          <p className={styles.muted}>Confirmando o aceite dos 4 jogadores.</p>
          <div className={cx(arena.group, styles.groupGrid)}>
            {members.map((player) => (
              <PlayerCard key={player.userId} player={player} vertical avatarSize="md" />
            ))}
          </div>
          <LoadingDots />
        </section>
      ) : (
        <section className={cx(arena.found, styles.groupCard)} aria-live="polite">
          <span className={arena.foundKicker}>Confirme sua vaga</span>
          <h2 className={arena.foundTitle}>Partida encontrada</h2>
          <div className={cx(arena.group, styles.groupGrid)}>
            {members.map((player) => (
              <PlayerCard
                key={player.userId}
                player={player}
                state={normalizePvpEliminationAcceptState(pvpEliminationAcceptStateMap[player.userId])}
                vertical
                avatarSize="md"
              />
            ))}
          </div>
          <Countdown label={pvpEliminationAcceptCountdownLabel} />
          {pvpEliminationShouldShowAcceptActions ? (
            <div className={arena.acceptActions}>
              <Button size="lg" variant="success" disabled={pvpEliminationInviteBusy} onClick={acceptPvpEliminationRoomInvite}>Aceitar</Button>
              <Button size="lg" variant="secondary" disabled={pvpEliminationInviteBusy} onClick={rejectPvpEliminationRoomInvite}>Recusar</Button>
            </div>
          ) : waitingOthers ? (
            <p className={styles.muted}>Você confirmou. Aguardando os outros jogadores.</p>
          ) : null}
        </section>
      )}
      {/* No aceite (como no duelo) o radar da fila sai de cena: o grupo já foi encontrado */}
      {!pvpEliminationPendingAccept ? (
        <div className={styles.side}>
          <QueuePanel
            searching={eliminationSearching}
            timeLabel={pvpEliminationQueueTimeLabel}
            action={pvpEliminationPrimaryAction}
            title="Montando o grupo"
            text="A partida começa quando 4 jogadores estiverem na fila."
            details={<QueueChoice difficulty={pvpSelectedDifficulty} areaId={pvpKnowledgeArea} knowledgeAreaById={knowledgeAreaById} />}
          />
          <EmojiCard emojis={pvpBattleEmojis} onEdit={openPvpEmojiPicker} subtitle="Reaja durante a eliminatória." />
        </div>
      ) : null}
    </div>
  );
}

export default function PvpLobbyScreen({ vm }) {
  const { openPvpMode, pvpMode, pvpTeamRoom, pvpTeamRoomId, triggerAppBackNavigation } = vm;
  const inTeamRoom = pvpMode === PVP_MODE_TEAM_BATTLE && !!pvpTeamRoomId;
  // Dentro da sala o título é o nome dela (o cartão da sala saiu: libera altura no celular)
  const header = inTeamRoom
    ? {
      eyebrow: 'Batalha de equipes',
      title: pvpTeamRoom?.name || 'Sala de equipe',
      subtitle: 'Escolha seu time. A batalha começa quando o líder iniciar.'
    }
    : {
      eyebrow: pvpMode ? 'Arena PvP' : 'Modo online',
      ...(MODE_HEADERS[pvpMode] || { title: 'Arena PvP', subtitle: 'Escolha como você quer disputar.' })
    };

  return (
    <div className={cx(styles.screen, inTeamRoom ? styles.screenRoom : '')}>
      <PageHeader
        eyebrow={header.eyebrow}
        title={header.title}
        subtitle={header.subtitle}
        onBack={() => triggerAppBackNavigation('button')}
      />
      {!pvpMode ? <ModeMenu openPvpMode={openPvpMode} /> : null}
      {pvpMode === PVP_MODE_DUEL ? <DuelPanel vm={vm} /> : null}
      {pvpMode === PVP_MODE_TEAM_BATTLE ? <TeamPanel vm={vm} /> : null}
      {pvpMode === PVP_MODE_ELIMINATION ? <EliminationPanel vm={vm} /> : null}
    </div>
  );
}
