import { Crown, Lock, Plus, Smile, Swords, UserCheck, Users } from 'lucide-react';
import { DIFFICULTY_LABELS } from '../lib/constants';
import { normalizeDifficulty } from '../lib/utils';
import {
  PVP_MODE_DUEL,
  PVP_MODE_ELIMINATION,
  PVP_MODE_TEAM_BATTLE,
  PVP_TEAM_ROOM_SIDE_CAPACITY,
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

function EmojiCard({ emojis, onEdit }) {
  return (
    <Card padding="lg" className={styles.emojiCard}>
      <SectionHeader title="Emojis da partida" subtitle="Reaja durante o duelo." icon={Smile} />
      <div className={styles.emojiRow}>
        {(Array.isArray(emojis) ? emojis : []).map((emoji) => (
          <span key={`emoji_${emoji}`} className={styles.emoji} aria-hidden="true">{emoji}</span>
        ))}
      </div>
      <Button variant="secondary" size="sm" onClick={onEdit}>Editar emojis</Button>
    </Card>
  );
}

function DuelPanel({ vm }) {
  const {
    acceptPvpMatchInvite,
    arenaPrimaryAction,
    chooseKnowledgeAreaForPvp,
    choosePvpDifficulty,
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
        />
        <EmojiCard emojis={pvpBattleEmojis} onEdit={openPvpEmojiPicker} />
      </div>
    </div>
  );
}

function TeamPanel({ vm }) {
  const {
    authUser,
    buildCosmeticSnapshot,
    joinPvpTeamRoomSide,
    knowledgeAreaById,
    openPvpTeamRoomCreate,
    openPvpTeamRoomLobby,
    pvpTeamActionBusy,
    pvpTeamAutoStartPending,
    pvpTeamCurrentUserReady,
    pvpTeamMySide,
    pvpTeamRoom,
    pvpTeamRoomAreaMeta,
    pvpTeamRoomHostUserId,
    pvpTeamRoomId,
    pvpTeamRoomReadyMemberIds,
    pvpTeamRooms,
    startPvpTeamBattle,
    togglePvpTeamReadyState
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

  const isHost = String(pvpTeamRoomHostUserId || '').trim() === selfId;
  const roomDifficulty = normalizeDifficulty(pvpTeamRoom?.difficulty || 'easy');
  const openSlots = Math.max(
    0,
    (PVP_TEAM_ROOM_SIDE_CAPACITY * 2)
      - getPvpTeamMembersBySide(pvpTeamRoom, 'red').length
      - getPvpTeamMembersBySide(pvpTeamRoom, 'blue').length
  );

  return (
    <>
      <Card padding="lg" className={styles.room}>
        <span className={styles.roomHead}>
          <span className={styles.roomName}>
            {pvpTeamRoom?.has_password ? <Lock aria-label="Sala privada" strokeWidth={2.6} /> : null}
            {pvpTeamRoom?.name || 'Sala de equipe'}
          </span>
          <Badge tone={DIFFICULTY_TONES[roomDifficulty] || 'lime'} size="sm">{DIFFICULTY_LABELS[roomDifficulty]}</Badge>
        </span>
        <span className={styles.roomMeta}>
          <span>{pvpTeamRoomAreaMeta ? `${pvpTeamRoomAreaMeta.icon} ${pvpTeamRoomAreaMeta.name}` : 'Área geral'}</span>
          <span>·</span>
          <span>{getPvpTeamRoomStatusLabel(pvpTeamRoom)}</span>
          <span>·</span>
          <span>{isHost ? 'Você é o líder da sala' : 'Aguardando o líder iniciar'}</span>
        </span>
      </Card>

      <div className={styles.sides}>
        {['red', 'blue'].map((side) => {
          const members = getPvpTeamMembersBySide(pvpTeamRoom, side);
          const isMine = pvpTeamMySide === side;
          return (
            <section key={side} className={cx(styles.sidePanel, side === 'blue' ? styles.sideBlue : '', isMine ? styles.sideMine : '')}>
              <div className={styles.sideHead}>
                <span>Time {getPvpTeamSideColorLabel(side)}</span>
                <Badge tone={side === 'blue' ? 'blue' : 'red'} size="sm">{members.length}/{PVP_TEAM_ROOM_SIDE_CAPACITY}</Badge>
              </div>
              {Array.from({ length: PVP_TEAM_ROOM_SIDE_CAPACITY }, (_, slotIndex) => {
                const member = members[slotIndex] || null;
                if (!member) {
                  return (
                    <div key={`slot_${side}_${slotIndex}`} className={styles.slot}>
                      <span className={styles.slotPlus} aria-hidden="true"><Plus strokeWidth={2.6} /></span>
                      Vaga aberta
                    </div>
                  );
                }
                const player = buildPlayerView(member, buildCosmeticSnapshot);
                const memberId = player.userId;
                const tags = (
                  <>
                    {memberId === String(pvpTeamRoomHostUserId || '').trim() ? <Badge tone="gold" size="sm" icon={Crown}>Líder</Badge> : null}
                    {pvpTeamRoomReadyMemberIds.includes(memberId) ? <Badge tone="lime" size="sm" icon={UserCheck}>Pronto</Badge> : null}
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
                    avatarSize="sm"
                  />
                );
              })}
              <Button
                variant={isMine ? 'secondary' : (side === 'blue' ? 'cyan' : 'danger')}
                block
                disabled={pvpTeamActionBusy || isMine}
                onClick={() => joinPvpTeamRoomSide(side)}
              >
                {isMine ? 'Você está neste time' : `Entrar no ${getPvpTeamSideColorLabel(side)}`}
              </Button>
            </section>
          );
        })}
      </div>

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
              {pvpTeamAutoStartPending ? 'Completando a sala...' : 'Iniciar batalha'}
            </Button>
            {openSlots > 0 ? (
              <p className={styles.muted} role="status">
                {pvpTeamAutoStartPending
                  ? 'Jogadores entrando nas vagas abertas. A batalha começa quando a sala lotar.'
                  : `${openSlots === 1 ? '1 vaga aberta' : `${openSlots} vagas abertas`}. Ao iniciar, outros jogadores completam a sala.`}
              </p>
            ) : null}
          </>
        ) : (
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
        )}
      </div>
    </>
  );
}

function EliminationPanel({ vm }) {
  const {
    acceptPvpEliminationRoomInvite,
    buildCosmeticSnapshot,
    chooseKnowledgeAreaForPvp,
    choosePvpDifficulty,
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
  return (
    <div className={cx(styles.layout, eliminationSearching ? styles.layoutSearching : '')}>
      {!pvpEliminationPendingAccept ? (
        <Card padding="lg" className={styles.config}>
          <DifficultyPicker value={pvpSelectedDifficulty} onChoose={choosePvpDifficulty} disabled={pvpEliminationAreaSelectionLocked} label="Dificuldade da fila" />
          <AreaPicker value={pvpKnowledgeArea} onChoose={chooseKnowledgeAreaForPvp} disabled={pvpEliminationAreaSelectionLocked} />
        </Card>
      ) : pvpEliminationShowMatchFoundTransition ? (
        <section className={arena.found} role="status" aria-live="polite">
          <span className={arena.foundKicker}>Matchmaking</span>
          <h2 className={arena.foundTitle}>Grupo encontrado!</h2>
          <p className={styles.muted}>Confirmando o aceite dos 4 jogadores.</p>
          <div className={arena.group}>
            {members.map((player) => (
              <PlayerCard key={player.userId} player={player} vertical avatarSize="md" />
            ))}
          </div>
          <LoadingDots />
        </section>
      ) : (
        <section className={arena.found} aria-live="polite">
          <span className={arena.foundKicker}>Confirme sua vaga</span>
          <h2 className={arena.foundTitle}>Partida encontrada</h2>
          <div className={arena.group}>
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
          ) : null}
        </section>
      )}
      <div className={styles.side}>
        <QueuePanel
          searching={eliminationSearching}
          timeLabel={pvpEliminationQueueTimeLabel}
          action={pvpEliminationPrimaryAction}
          title="Montando o grupo"
          text="A partida começa quando 4 jogadores estiverem na fila."
        />
      </div>
    </div>
  );
}

export default function PvpLobbyScreen({ vm }) {
  const { openPvpMode, pvpMode, triggerAppBackNavigation } = vm;
  const header = MODE_HEADERS[pvpMode] || {
    title: 'Arena PvP',
    subtitle: 'Escolha como você quer disputar.'
  };

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow={pvpMode ? 'Arena PvP' : 'Modo online'}
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
