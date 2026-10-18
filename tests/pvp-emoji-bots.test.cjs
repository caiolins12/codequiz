const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const helpers = load('src/codequiz/app/helpers.js');
const engine = load('src/codequiz/app/pvpGroupMatch.js');

const ELITE_BOT = 'bot_sys_codequiz_thiagoara';
const COMPETITIVE_BOT = 'bot_sys_codequiz_prime';
const SWINGY_BOT = 'bot_sys_codequiz_lua9';
const QUESTION = { q: 'Qual alternativa está correta?', opts: ['A', 'B', 'C', 'D'], answer: 0 };

function sequence(values) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

function hitRate(botId, context, matches = 400) {
  let hits = 0;
  for (let index = 0; index < matches; index += 1) {
    const answer = helpers.pickBotAnswerIndex(QUESTION, 'forte', {
      matchId: `match-${index}`,
      botUserId: botId,
      roundNo: 3,
      totalRounds: 10,
      ...context
    });
    if (answer === QUESTION.answer) hits += 1;
  }
  return hits / matches;
}

test('emoji replay: a batch delivered together keeps the rhythm the sender used', () => {
  const sentAt = [10_000, 10_500, 11_200];
  let lane = null;
  const shownAt = sentAt.map((sentAtMs) => {
    const result = helpers.schedulePvpEmojiReplay(lane, sentAtMs, 50_000);
    assert.equal(result.drop, false);
    lane = result.lane;
    return result.showAtMs;
  });
  assert.deepEqual(shownAt, [50_000, 50_500, 51_200]);
});

test('emoji replay: rapid taps get a minimum gap and a long backlog is dropped', () => {
  let lane = null;
  const shownAt = [];
  let dropped = 0;
  for (let index = 0; index < 20; index += 1) {
    const result = helpers.schedulePvpEmojiReplay(lane, 10_000 + index * 50, 50_000);
    if (result.drop) {
      dropped += 1;
      continue;
    }
    lane = result.lane;
    shownAt.push(result.showAtMs);
  }
  shownAt.slice(1).forEach((value, index) => {
    assert.ok(value - shownAt[index] >= helpers.PVP_EMOJI_REPLAY_MIN_GAP_MS);
  });
  assert.ok(dropped > 0);
  assert.ok(shownAt[shownAt.length - 1] - 50_000 <= helpers.PVP_EMOJI_REPLAY_MAX_BACKLOG_MS);
});

test('emoji replay: an emoji after a pause appears immediately', () => {
  const first = helpers.schedulePvpEmojiReplay(null, 1_000, 5_000);
  const later = helpers.schedulePvpEmojiReplay(first.lane, 9_000, 13_000);
  assert.equal(later.showAtMs, 13_000);
});

test('emoji lanes: simultaneous emojis on one side never share a lane until all are taken', () => {
  const fx = [];
  for (let index = 0; index < helpers.PVP_EMOJI_FX_LANES.length; index += 1) {
    fx.push({ side: 'left', shownAtMs: 1_000 + index, ...helpers.pickPvpEmojiFxLane(fx, 'left') });
  }
  assert.deepEqual(fx.map((item) => item.lane), [0, 1, 2, 3]);
  // A emoji on the other side does not take a lane from this side.
  assert.equal(helpers.pickPvpEmojiFxLane(fx, 'right').lane, 0);
  // With every lane busy, the lane whose emoji is furthest along is reused.
  assert.equal(helpers.pickPvpEmojiFxLane(fx, 'left').lane, 0);
});

test('bot moods: a celebrating bot uses a celebration emoji', () => {
  const emoji = helpers.pickBotMoodEmoji(ELITE_BOT, 'celebrate', sequence([0.1, 0.2]));
  assert.ok(helpers.BOT_EMOJI_MOODS.celebrate.includes(emoji));
});

test('bot styles: elite bots keep the fixed 90% run', () => {
  assert.equal(helpers.getBotAdaptiveAccuracy(ELITE_BOT, { botScore: 9, opponentScore: 0 }), null);
  let hits = 0;
  for (let roundNo = 1; roundNo <= 10; roundNo += 1) {
    const answer = helpers.pickBotAnswerIndex(QUESTION, 'forte', {
      matchId: 'elite-run',
      botUserId: ELITE_BOT,
      roundNo,
      totalRounds: 10,
      botScore: roundNo,
      opponentScore: 0
    });
    if (answer === QUESTION.answer) hits += 1;
  }
  assert.equal(hits, 9);
});

test('bot styles: elite misses fall on different rounds from match to match', () => {
  const missesByRound = new Array(11).fill(0);
  for (let matchNo = 0; matchNo < 300; matchNo += 1) {
    for (let roundNo = 1; roundNo <= 10; roundNo += 1) {
      const answer = helpers.pickBotAnswerIndex(QUESTION, 'forte', {
        matchId: `elite-spread-${matchNo}`,
        botUserId: ELITE_BOT,
        roundNo,
        totalRounds: 10
      });
      if (answer !== QUESTION.answer) missesByRound[roundNo] += 1;
    }
  }
  // 300 misses in total, none of the rounds concentrates them.
  assert.equal(missesByRound.reduce((sum, value) => sum + value, 0), 300);
  missesByRound.slice(1).forEach((misses) => assert.ok(misses < 60, `round misses ${missesByRound.join(',')}`));
});

test('bot styles: competitive bots ease off when ahead and push when behind', () => {
  const ahead = helpers.getBotAdaptiveAccuracy(COMPETITIVE_BOT, { matchId: 'm', roundNo: 3, totalRounds: 10, botScore: 4, opponentScore: 0 });
  const level = helpers.getBotAdaptiveAccuracy(COMPETITIVE_BOT, { matchId: 'm', roundNo: 3, totalRounds: 10, botScore: 2, opponentScore: 2 });
  const behind = helpers.getBotAdaptiveAccuracy(COMPETITIVE_BOT, { matchId: 'm', roundNo: 3, totalRounds: 10, botScore: 0, opponentScore: 4 });
  assert.ok(ahead < level && level < behind);
  assert.ok(ahead >= helpers.BOT_PLAY_STYLES.competitivo.min);
  assert.ok(behind <= helpers.BOT_PLAY_STYLES.competitivo.max);

  const aheadRate = hitRate(COMPETITIVE_BOT, { botScore: 4, opponentScore: 0 });
  const behindRate = hitRate(COMPETITIVE_BOT, { botScore: 0, opponentScore: 4 });
  assert.ok(behindRate - aheadRate > 0.15, `ahead ${aheadRate} vs behind ${behindRate}`);
});

test('bot styles: the swingy bot gives more room for comebacks than the competitive one', () => {
  const context = { matchId: 'm', roundNo: 3, totalRounds: 10, botScore: 3, opponentScore: 0 };
  assert.ok(helpers.getBotAdaptiveAccuracy(SWINGY_BOT, context) < helpers.getBotAdaptiveAccuracy(COMPETITIVE_BOT, context));
});

test('bot styles: bot against bot plays its base level regardless of the score', () => {
  const base = { matchId: 'm', roundNo: 3, totalRounds: 10, opponentIsBot: true };
  assert.equal(
    helpers.getBotAdaptiveAccuracy(COMPETITIVE_BOT, { ...base, botScore: 5, opponentScore: 0 }),
    helpers.getBotAdaptiveAccuracy(COMPETITIVE_BOT, { ...base, botScore: 0, opponentScore: 5 })
  );
});

test('group bots: the 2x2 answer plan reads the team score of the bot', () => {
  const members = {
    red_members: [{ user_id: 'human-1' }, { user_id: COMPETITIVE_BOT }],
    blue_members: [{ user_id: SWINGY_BOT }, { user_id: ELITE_BOT }]
  };
  const schedule = helpers.buildPvpTeamBattleSchedule(members);
  const battleNo = schedule.find((entry) => entry.red_user_id === COMPETITIVE_BOT || entry.blue_user_id === COMPETITIVE_BOT).battle_no;
  const rate = (redScore, blueScore) => {
    let hits = 0;
    for (let index = 0; index < 300; index += 1) {
      const plan = engine.getPvpGroupBotAnswerPlan({
        id: `team-${index}`,
        status: 'active',
        difficulty: 'easy',
        ...members,
        battle_schedule: schedule,
        question_set: Array.from({ length: 12 }, () => QUESTION),
        total_rounds: 12,
        battle_no: battleNo,
        battle_started_at_ms: 1000,
        red_score: redScore,
        blue_score: blueScore
      }, engine.PVP_GROUP_MODE_TEAM, COMPETITIVE_BOT, battleNo);
      if (plan.isCorrect) hits += 1;
    }
    return hits / 300;
  };
  assert.ok(rate(0, 4) - rate(4, 0) > 0.15);
});

test('group bots: no emojis on the final result screen, where nobody can send them', () => {
  const match = {
    id: 'final',
    status: 'finished',
    winner_side: 'blue',
    red_members: [{ user_id: 'human-1' }, { user_id: COMPETITIVE_BOT }],
    blue_members: [{ user_id: SWINGY_BOT }, { user_id: ELITE_BOT }]
  };
  assert.equal(engine.planPvpGroupBotAmbientEmoji(match, engine.PVP_GROUP_MODE_TEAM, { phase: 'finished', random: () => 0 }), null);
  assert.equal(
    engine.planPvpGroupBotAmbientEmoji(match, engine.PVP_GROUP_MODE_ELIMINATION, { phase: 'finished', random: () => 0 }),
    null
  );
});

test('group bots: a person sending an emoji almost always gets a bot reply', () => {
  const match = {
    id: 'reply',
    status: 'active',
    red_members: [{ user_id: 'human-1' }, { user_id: COMPETITIVE_BOT }],
    blue_members: [{ user_id: SWINGY_BOT }, { user_id: ELITE_BOT }],
    battle_schedule: helpers.buildPvpTeamBattleSchedule({
      red_members: [{ user_id: 'human-1' }, { user_id: COMPETITIVE_BOT }],
      blue_members: [{ user_id: SWINGY_BOT }, { user_id: ELITE_BOT }]
    }),
    battle_no: 1
  };
  let replied = 0;
  for (let index = 0; index < 200; index += 1) {
    const replies = engine.pickPvpGroupBotEmojiReplies(match, engine.PVP_GROUP_MODE_TEAM, 'human-1', { emoji: '🔥' });
    if (replies.length) replied += 1;
    replies.forEach((reply) => {
      assert.notEqual(reply.botId, 'human-1');
      assert.ok(['tease', 'cheer'].includes(reply.mood));
    });
  }
  assert.ok(replied / 200 > 0.7);
});

test('group bots: ambient chatter only happens in open phases and picks a match bot', () => {
  const match = {
    id: 'ambient',
    status: 'active',
    red_members: [{ user_id: 'human-1' }, { user_id: COMPETITIVE_BOT }],
    blue_members: [{ user_id: SWINGY_BOT }, { user_id: ELITE_BOT }],
    battle_no: 1
  };
  assert.equal(engine.planPvpGroupBotAmbientEmoji(match, engine.PVP_GROUP_MODE_TEAM, { phase: 'lobby', random: () => 0 }), null);
  const entry = engine.planPvpGroupBotAmbientEmoji(match, engine.PVP_GROUP_MODE_TEAM, { phase: 'active', random: () => 0 });
  assert.ok([COMPETITIVE_BOT, SWINGY_BOT, ELITE_BOT].includes(entry.botId));
  assert.ok(helpers.BOT_EMOJI_MOODS[entry.mood]);
});
