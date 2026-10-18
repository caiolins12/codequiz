import { Crown, Flag, Frown, Home, Swords, Trophy } from 'lucide-react';
import { formatPvpDurationBonusLabel, formatSignedPoints } from '../app/helpers';
import { Avatar, Badge, Button, CoinIcon, Confetti, StatTile, XpIcon, cx } from '../ui';
import { battleStyles as battle } from './shared/BattleParts';
import { buildPlayerView } from './shared/players';
import game from './shared/Game.module.css';
import outcome from './shared/Outcome.module.css';
import team from './shared/TeamBattle.module.css';

const OUTCOMES = {
  win: { title: 'Vitória da equipe!', text: 'Trabalho em equipe de respeito.', icon: Trophy, tone: outcome.great },
  cancelled: { title: 'Partida cancelada', text: 'A partida foi interrompida antes da definição do vencedor.', icon: Flag, tone: outcome.ok },
  lose: { title: 'Derrota da equipe', text: 'Reúna o time e volte para a revanche!', icon: Frown, tone: outcome.bad }
};

function TeamResult({ side, label, members, winner, mine, buildCosmeticSnapshot, memberScores }) {
  return (
    <section
      className={cx(team.team, side === 'blue' ? team.blue : '', mine ? team.mine : '', winner ? team.winner : '')}
      aria-label={`Time ${label}`}
    >
      {/* No celular o "(você)" vira a etiqueta "Seu time" na borda do cartão (o nome não corta) */}
      {mine ? <span className={team.youTag}>Seu time</span> : null}
      <div className={team.teamHead}>
        <span className={team.teamName}>{label}{mine ? <span className={team.youSuffix}> (você)</span> : null}</span>
        {winner ? (
          <Badge tone="gold" variant="solid" size="sm" icon={Crown}>
            <span className={team.winnerText}>Venceu</span>
          </Badge>
        ) : null}
      </div>
      <ul className={team.members}>
        {members.map((member) => {
          const player = buildPlayerView(member, buildCosmeticSnapshot);
          const score = Math.max(0, Number(memberScores?.[player.userId] || 0));
          return (
            <li key={`${side}_${player.userId}`} className={team.member}>
              <Avatar avatar={player.avatar} frameClass={player.frameClass} frameStyle={player.frameStyle} size="xs" />
              <span className={team.memberText}>
                <span className={team.memberName}>{player.nickname}</span>
                <span className={team.memberMeta}>{score} acerto{score === 1 ? '' : 's'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function PvpTeamResultScreen({ vm }) {
  const {
    buildCosmeticSnapshot,
    collectPvpTeamResultRewards,
    pvpTeamBlueMembers,
    pvpTeamLeaverNotice,
    pvpTeamMatch,
    pvpTeamMySide,
    pvpTeamRedMembers,
    pvpTeamResultKey,
    pvpTeamResultProcessed,
    pvpTeamResultReward,
    pvpTeamRewardCollecting,
    resetPvpTeamState,
    setPvpMode,
    setScreen
  } = vm;

  const cancelled = pvpTeamMatch?.result_void === true;
  const key = cancelled ? 'cancelled' : (pvpTeamResultKey === 'win' ? 'win' : 'lose');
  const view = OUTCOMES[key];
  const Icon = view.icon;
  const winnerSide = String(pvpTeamMatch?.winner_side || '').trim();
  const redScore = Math.max(0, Number(pvpTeamMatch?.red_score || 0));
  const blueScore = Math.max(0, Number(pvpTeamMatch?.blue_score || 0));
  const points = Number(pvpTeamResultReward?.points || 0);
  const durationBonusLabel = formatPvpDurationBonusLabel(pvpTeamResultReward, 'confrontos');
  const memberScores = pvpTeamMatch?.member_scores;

  const goHome = () => {
    resetPvpTeamState();
    setPvpMode('');
    setScreen('home');
  };

  return (
    <div className={game.game}>
      {key === 'win' ? <Confetti count={80} seed={11} /> : null}
      <main className={outcome.split}>
        <div className={outcome.splitMain}>
          <section className={cx(outcome.hero, view.tone)}>
            <span className={outcome.heroIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
            <h1 className={outcome.heroTitle}>{view.title}</h1>
            {/* Adversário que saiu no meio da partida: o aviso ocupa o lugar do texto padrão */}
            <p className={outcome.heroText} role={pvpTeamLeaverNotice && !cancelled ? 'status' : undefined}>
              {(!cancelled && pvpTeamLeaverNotice) || view.text}
            </p>
            <div className={cx(battle.scoreline, outcome.heroScore)} aria-label={`Placar: Vermelho ${redScore}, Azul ${blueScore}`}>
              <span className={battle.scorelineItem}>
                <span className={battle.scorelineName}>Vermelho</span>
                <span className={cx(battle.scorelineValue, outcome.heroScoreValue, team.scoreRed)}>{redScore}</span>
              </span>
              <span className={battle.scorelineDivider} aria-hidden="true">×</span>
              <span className={battle.scorelineItem}>
                <span className={battle.scorelineName}>Azul</span>
                <span className={cx(battle.scorelineValue, outcome.heroScoreValue, team.scoreBlue)}>{blueScore}</span>
              </span>
            </div>
          </section>
        </div>

        <div className={outcome.splitSide}>
          <div className={team.resultTeams}>
            <TeamResult
              side="red"
              label="Vermelho"
              members={Array.isArray(pvpTeamRedMembers) ? pvpTeamRedMembers : []}
              winner={winnerSide === 'red'}
              mine={pvpTeamMySide === 'red'}
              buildCosmeticSnapshot={buildCosmeticSnapshot}
              memberScores={memberScores}
            />
            <TeamResult
              side="blue"
              label="Azul"
              members={Array.isArray(pvpTeamBlueMembers) ? pvpTeamBlueMembers : []}
              winner={winnerSide === 'blue'}
              mine={pvpTeamMySide === 'blue'}
              buildCosmeticSnapshot={buildCosmeticSnapshot}
              memberScores={memberScores}
            />
          </div>
        </div>

        <div className={outcome.splitActions}>
          {cancelled ? (
            <Button size="xl" variant="primary" block icon={Home} onClick={goHome}>
              Voltar ao início
            </Button>
          ) : pvpTeamResultReward ? (
            <>
              <div className={outcome.rewards}>
                <StatTile icon={Swords} label="Pontos PvP" value={formatSignedPoints(points)} tone={points >= 0 ? 'violet' : 'red'} />
                <StatTile icon={XpIcon} label="XP" value={`+${Math.max(0, Number(pvpTeamResultReward.xp || 0))}`} tone="blue" />
                <StatTile icon={CoinIcon} label="Moedas" value={`+${Math.max(0, Number(pvpTeamResultReward.coins || 0))}`} tone="gold" />
              </div>
              <Button size="xl" variant="warning" block loading={pvpTeamRewardCollecting} onClick={(event) => collectPvpTeamResultRewards(event)}>
                Coletar recompensas
              </Button>
              {/* Partidas longas: mostra o bônus de duração no lugar do aviso, sem ocupar mais altura. */}
              {durationBonusLabel ? (
                <p className={cx(outcome.bonusNote, outcome.centerText)}>{durationBonusLabel}</p>
              ) : (
                <p className={cx(outcome.muted, outcome.centerText)}>Depois da coleta você volta para o início.</p>
              )}
            </>
          ) : !pvpTeamResultProcessed ? (
            <p className={cx(outcome.muted, outcome.centerText)} role="status">Preparando recompensas...</p>
          ) : (
            <Button size="xl" variant="primary" block icon={Home} onClick={goHome}>
              Voltar ao início
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
