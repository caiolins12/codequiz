import { Frown, Handshake, Swords, Trophy } from 'lucide-react';
import { formatSignedPoints } from '../app/helpers';
import { Button, CoinIcon, Confetti, StatTile, XpIcon, cx } from '../ui';
import { PlayerCard } from './shared/ArenaParts';
import { playerViewFromShop } from './shared/players';
import game from './shared/Game.module.css';
import outcome from './shared/Outcome.module.css';
import arena from './shared/Arena.module.css';

const OUTCOMES = {
  win: { title: 'Vitória!', text: 'Mandou muito bem na arena.', icon: Trophy, tone: outcome.great },
  draw: { title: 'Empate!', text: 'Disputa equilibrada até o fim.', icon: Handshake, tone: outcome.ok },
  lose: { title: 'Derrota', text: 'Faz parte. Revanche na próxima!', icon: Frown, tone: outcome.bad }
};

export default function PvpResultScreen({ vm }) {
  const {
    collectPvpResultRewards,
    pvpFinalScoreParts,
    pvpHideDefaultResultPanel,
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
    pvpResult,
    pvpResultReward,
    pvpRewardCollecting
  } = vm;

  if (pvpHideDefaultResultPanel) return <div className={game.game} />;

  const key = pvpResult === 'win' ? 'win' : (pvpResult === 'draw' ? 'draw' : 'lose');
  const view = OUTCOMES[key];
  const Icon = view.icon;
  const player1 = playerViewFromShop({
    nickname: pvpMatch?.player1_nickname || 'Jogador 1',
    avatar: pvpPlayer1Avatar,
    frameClass: pvpPlayer1FrameClass,
    frameStyle: pvpPlayer1FrameStyle,
    shop: pvpPlayer1Shop,
    backgroundMeta: pvpPlayer1BackgroundMeta
  });
  const player2 = playerViewFromShop({
    nickname: pvpMatch?.player2_nickname || 'Jogador 2',
    avatar: pvpPlayer2Avatar,
    frameClass: pvpPlayer2FrameClass,
    frameStyle: pvpPlayer2FrameStyle,
    shop: pvpPlayer2Shop,
    backgroundMeta: pvpPlayer2BackgroundMeta
  });
  const winnerSide = pvpFinalScoreParts?.winnerSide;
  const points = Number(pvpResultReward?.points || 0);

  return (
    <div className={game.game}>
      {key === 'win' ? <Confetti count={80} seed={7} /> : null}
      <main className={game.stage}>
        <section className={cx(outcome.hero, view.tone)}>
          <span className={outcome.heroIcon} aria-hidden="true"><Icon strokeWidth={2.4} /></span>
          <h1 className={outcome.heroTitle}>{view.title}</h1>
          <p className={outcome.heroText}>{view.text}</p>
        </section>

        <section className={arena.versus} aria-label="Placar final">
          <PlayerCard
            player={player1}
            meta={`${pvpFinalScoreParts?.player1 ?? 0} pontos`}
            badge={winnerSide === 'player1' ? { label: 'Vencedor', tone: 'gold' } : null}
            vertical
            avatarSize="lg"
          />
          <span className={arena.vs}><Swords size={22} strokeWidth={2.6} aria-hidden="true" /></span>
          <PlayerCard
            player={player2}
            meta={`${pvpFinalScoreParts?.player2 ?? 0} pontos`}
            badge={winnerSide === 'player2' ? { label: 'Vencedor', tone: 'gold' } : null}
            vertical
            avatarSize="lg"
          />
        </section>

        {pvpResultReward ? (
          <>
            <div className={outcome.rewards}>
              <StatTile icon={Swords} label="Pontos PvP" value={formatSignedPoints(points)} tone={points >= 0 ? 'violet' : 'red'} />
              <StatTile icon={XpIcon} label="XP" value={`+${Math.max(0, Number(pvpResultReward.xp || 0))}`} tone="blue" />
              <StatTile icon={CoinIcon} label="Moedas" value={`+${Math.max(0, Number(pvpResultReward.coins || 0))}`} tone="gold" />
            </div>
            <Button size="xl" variant="warning" block loading={pvpRewardCollecting} onClick={(event) => collectPvpResultRewards(event)}>
              Coletar recompensas
            </Button>
            <p className={cx(outcome.muted, outcome.centerText)}>Depois da coleta você volta para o início.</p>
          </>
        ) : (
          <p className={cx(outcome.muted, outcome.centerText)} role="status">Preparando recompensas...</p>
        )}
      </main>
    </div>
  );
}
