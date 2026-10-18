'use client';

import './lib/storageReset';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  firebaseAuth,
  googleProvider,
  isNativePromptUnavailableError,
  onAuthStateChanged,
  renderGoogleSignInButton,
  signInWithPopup,
  signOut
} from './lib/googleAuthClient';
import { firebaseDb, isCurrentUserAdmin, onValue, ref } from './lib/dbClient';
import { LANGUAGES, QUESTIONS, TOPICS } from './data/questions-data';
import { buildEvolutionPassSnapshot, EVOLUTION_PASS_STAGES } from './lib/achievements';
import { DIFFICULTY_LABELS, PVE_QUESTIONS_PER_ROUND, QUESTIONS_PER_ROUND } from './lib/constants';
import {
  cleanupStalePairLocks,
  cleanupDrawFinishedMatches,
  cleanupZeroScoreFinishedMatches,
  cleanupStalePendingBotUserMatches,
  checkNicknameAvailability,
  cleanupStaleQueueEntries,
  clearQueueMatch,
  createPvpEliminationMatch,
  createPvpEliminationRoom,
  createPvpMatch,
  createPvpTeamMatch,
  createPvpTeamRoom,
  ensureSystemBot,
  ensureQueueHeartbeat,
  ensureSystemBots,
  ensureUserProfile,
  findOpenPvpEliminationMatchForUser,
  findOpenMatchForUser,
  findOpenPvpTeamMatchForUser,
  findQueueOpponent,
  getArenaMetrics,
  getBotArenaDaemonControl,
  getBotArenaDaemonStatus,
  getBotArenaQuizState,
  getPvpMatch,
  getPvpMatchesSnapshot,
  getPvpBotConfig,
  getPvpEliminationBattleAnswers,
  getPvpEliminationMatch,
  getNextBotForUserMatch,
  getPvpRoundAnswers,
  getPvpTeamBattleAnswers,
  getPvpTeamMatch,
  isPvpGroupMatchStale,
  joinPvpEliminationRoom,
  joinPvpTeamRoom,
  publishPvpEliminationRoomNotice,
  publishPvpTeamRoomNotice,
  purgeBotLocalCacheForGlobalSync,
  pushPvpEmojiEvent,
  getQueueEntryByUser,
  getQuizRankings,
  getSystemBotFallbackProfile,
  getSystemBotSnapshot,
  clearBotBusy,
  isSystemBotUserId,
  rotateUserBotQueue,
  runBotArenaAutomationTick,
  setBotBusy,
  SYSTEM_BOT_ID,
  getUserProfile,
  getUserShop,
  getUserStats,
  getLegacyCloudSnapshot,
  leaveQueue,
  leavePvpEliminationRoom,
  leavePvpTeamRoom,
  markPresenceClosed,
  markPvpEliminationMatchParticipantOptOut,
  markQueueMatched,
  upsertPresence,
  releasePairLock,
  releaseRoundFinalizeLock,
  saveQuizResult,
  saveUserShop,
  setPvpEliminationRoomAcceptState,
  setPvpTeamRoomMemberReady,
  setBotArenaDaemonControl,
  subscribeBotArenaDaemonControl,
  subscribeBotArenaDaemonStatus,
  subscribeBotArenaQuizState,
  subscribePvpMatches,
  subscribeGlobalRankings,
  subscribeMatch,
  subscribePvpEmojiEvents,
  subscribePvpEliminationBattleAnswers,
  subscribePvpEliminationMatch,
  subscribePvpEliminationRoom,
  subscribePvpEliminationRooms,
  subscribeQueueEntry,
  subscribeRoundAnswers,
  subscribePvpTeamBattleAnswers,
  subscribePvpTeamMatch,
  subscribePvpTeamRoom,
  subscribePvpTeamRooms,
  tryAcquirePairLock,
  applyPvpOutcomeToUserStats,
  tryAcquireRoundFinalizeLock,
  updatePvpMatch,
  updatePvpEliminationMatch,
  updatePvpEliminationRoom,
  updatePvpTeamMatch,
  updatePvpTeamRoom,
  validateNicknameInput,
  updateUserProfile,
  upsertPvpEliminationAnswer,
  upsertPvpAnswer,
  upsertPvpTeamAnswer,
  upsertQueueEntry,
  upsertStatsFromProgress,
  isPvpGroupRoomAlive,
  reconcilePvpEliminationRoomPresence,
  reconcilePvpTeamRoomPresence,
  touchPvpEliminationRoomPresence,
  touchPvpTeamRoomPresence
} from './lib/repository';
import {
  PVP_GROUP_BOT_AMBIENT_TICK_MS,
  PVP_GROUP_BOT_FIRST_ANSWER_EMOJI_CHANCE,
  PVP_GROUP_MODE_ELIMINATION,
  PVP_GROUP_MODE_TEAM,
  PVP_GROUP_PRESENCE_HEARTBEAT_MS,
  PVP_GROUP_RESULT_BOT_EMOJI_WINDOW_MS,
  advancePvpGroupMatch,
  applyPvpGroupMatchBotRewards,
  finalizePvpGroupBattle,
  getPvpGroupBattlePairIds,
  getPvpGroupBattleQuestion,
  getPvpGroupBattleTiming,
  getPvpGroupEmojiDriverId,
  getPvpGroupForfeitOutcome,
  getPvpGroupMatchGoneIds,
  getPvpGroupMatchMemberIds,
  getPvpGroupMatchOutcomeForUser,
  getPvpGroupPendingBotAnswerPlans,
  getPvpTeamRoomBotFillDelayMs,
  isPvpEliminationBattleReadyToFinalize,
  isPvpTeamBattleReadyToFinalize,
  leavePvpGroupMatch,
  pickPvpGroupBotEmojiReplies,
  planPvpGroupBotAmbientEmoji,
  planPvpGroupBotEliminationEmojis,
  planPvpGroupBotFinalEmojis,
  planPvpGroupBotRoundEmojis,
  releasePvpGroupBots,
  removePvpGroupRoomMembers,
  submitPvpGroupBotAnswer,
  sweepStalePvpGroupState
} from './app/pvpGroupMatch';
import {
  applyEvolutionPassRewards,
  applyQuizOutcome,
  defaultProgress,
  loadProgress,
  mergeProgressWithRemoteStats,
  normalizeProgress,
  saveProgress
} from './lib/progress';
import { getTopicsByLanguage } from './lib/quizEngine';
import {
  canPurchaseItem,
  defaultShopData,
  equipItem,
  getAvatarFrameClass,
  getAvatarFrameStyle,
  getDisplayAvatar,
  getHeroBackgroundStyle,
  grantShopItems,
  getItemsByType,
  getShopItem,
  loadShopData,
  SHOP_RARITY_ORDER,
  mergeShopData,
  normalizeShopData,
  purchaseItem,
  saveShopData
} from './lib/shop';
import {
  buildMatchId,
  getCategoryByPoints,
  getPvpPointsDeltaAdvanced,
  getPvpResultForUser,
  getRoundDurationSeconds,
  isPvpAnswerCorrect,
  isPvpDuelMatchSnapshotObsolete,
  PVP_ROUNDS_PER_MATCH,
  resolvePvpCorrectIndex,
  resolveMatchWinner,
  resolveRoundOutcome
} from './lib/pvp';
import { getQuizKey, getXPForLevel, normalizeDifficulty } from './lib/utils';
import {
  ACTIVE_MATCH_RESUME_MAX_AGE_MS,
  ACTIVE_MATCH_STORAGE_KEY_PREFIX,
  AUDIO_DEFAULTS,
  AUDIO_STORAGE_KEY,
  AUTH_BOOTSTRAP_GUARD_MS,
  AUTH_OPERATION_TIMEOUT_MS,
  AUTH_POPUP_TIMEOUT_MS,
  BATTLE_MUSIC_TRACKS,
  BOT_CONFIG_DEFAULT,
  COOKIE_CONSENT_COOKIE_KEY,
  COOKIE_CONSENT_MAX_AGE_SECONDS,
  COOKIE_CONSENT_STORAGE_KEY,
  DATA_SUBSCRIBE_MAX_RETRIES,
  DATA_SUBSCRIBE_RETRY_DELAY_MS,
  DATA_SUBSCRIBE_RETRY_TIMEOUT_MS,
  DEFAULT_BATTLE_EMOJIS,
  ENABLE_CLIENT_BOT_AUTOMATION,
  KNOWLEDGE_AREAS,
  LANGUAGE_THEME_GROUPS,
  LAST_CONFIRMED_BUILD_SHA_STORAGE_KEY,
  LEAGUE_TRANSITION_VISIBLE_MS,
  MENU_MUSIC_TRACKS,
  MOBILE_SW_CLEANUP_STORAGE_KEY,
  MUSIC_AUTO_SKIP_INTERVAL_MS,
  MUSIC_SKIP_FADE_IN_MS,
  MUSIC_SKIP_FADE_OUT_MS,
  MUSIC_SKIP_SWITCH_DELAY_MS,
  NICKNAME_RULE_COPY,
  PASS_CLAIM_STAGE_FLASH_MS,
  PRELOAD_RUNTIME_CHALLENGE_INTERVAL_MS,
  PRELOAD_RUNTIME_MIN_INTERVAL_MS,
  PROGRESS_FORCED_RESET_GUARD_MS,
  PROGRESS_RECOVERY_RETRY_MS,
  PVP_BOT_DECISION_DELAY_MAX_MS,
  PVP_BOT_DECISION_DELAY_MIN_MS,
  PVP_BOT_DECISION_POST_TRANSITION_BUFFER_MS,
  PVP_ELIMINATION_ACCEPT_START_DELAY_MS,
  PVP_ELIMINATION_ACCEPT_TIMEOUT_MS,
  PVP_ELIMINATION_BATTLE_INTRO_MS,
  PVP_ELIMINATION_MAX_TOTAL_BATTLES,
  PVP_ELIMINATION_QUEUE_BOT_FILL_MIN_ELAPSED_MS,
  PVP_ELIMINATION_QUEUE_BOT_FILL_RETRY_MS,
  PVP_ELIMINATION_QUEUE_BOT_REFUSAL_CHANCE,
  PVP_ELIMINATION_QUEUE_RETRY_MS,
  PVP_ELIMINATION_REJECT_RESOLVE_DELAY_MS,
  PVP_ELIMINATION_ROOM_CAPACITY,
  PVP_TEAM_ROOM_SIDE_CAPACITY,
  PVP_ELIMINATION_ROUNDS_PER_CYCLE,
  PVP_EMOJI_PICKER_OPTIONS,
  PVP_EMOJI_SPAM_BURST_LIMIT,
  PVP_EMOJI_FX_DURATION_MS,
  PVP_EMOJI_SPAM_COOLDOWN_MS,
  PVP_EMOJI_SPAM_WINDOW_MS,
  PVP_EMOJI_STORAGE_PREFIX,
  PVP_MATCH_ACCEPT_TIMEOUT_MS,
  PVP_MATCH_FOUND_TRANSITION_MS,
  PVP_MATCH_REJECT_RESOLVE_DELAY_MS,
  PVP_MATCH_START_DELAY_MS,
  PVP_MODE_DUEL,
  PVP_MODE_ELIMINATION,
  PVP_MODE_TEAM_BATTLE,
  PVP_QUEUE_BOT_FIRST_DELAY_MAX_SECONDS,
  PVP_QUEUE_BOT_FIRST_DELAY_MIN_SECONDS,
  PVP_QUEUE_BOT_FIRST_THRESHOLD_MS,
  PVP_QUEUE_BOT_HARD_DEADLINE_MS,
  PVP_QUEUE_BOT_NEAR_DUE_PRIORITIZE_MS,
  PVP_QUEUE_BOT_REFUSAL_DELAY_MAX_SECONDS,
  PVP_QUEUE_BOT_REFUSAL_DELAY_MIN_SECONDS,
  PVP_QUEUE_DISCONNECT_RECOVERY_TIMEOUT_MS,
  PVP_QUEUE_RESUME_MODE_REFUSAL,
  PVP_ROUND_EXTRA_ANSWER_MS,
  PVP_ROUND_RESULT_DURATION_MS,
  PVP_SEQUENCE_RECENT_STARTS_MAX,
  PVP_TEAM_BATTLE_TOTAL_ROUNDS,
  QUICK_BOOT_CHECKS_MS,
  SHOP_CATEGORY_OPEN_DEFAULT,
  SHOP_UI_STATE_STORAGE_PREFIX,
  THEME_INTRO_PVE_DURATION_MS,
  THEME_INTRO_PVE_SELECTED_HOLD_MS,
  THEME_INTRO_PVP_DURATION_MS,
  THEME_INTRO_PVP_SELECTED_HOLD_MS,
  THEME_INTRO_ROULETTE_CHIP_CENTER_OFFSET_PX,
  UI_ACTION_WATCHDOG_MS,
  VERSION_CHECK_MS,
  appendPlayerQuizHistoryLocal,
  appendQueueDebugLogLine,
  applyEmojiToDraft,
  buildDefaultShopCategoryState,
  buildFallbackPvpConfig,
  buildLeagueSnapshot,
  buildProgressSnapshot,
  buildPveQuestionReviewEntry,
  buildPveRoundReviewList,
  buildPvpEliminationCycleRounds,
  buildPvpEliminationCycleScoreMap,
  buildPvpEliminationMatchId,
  buildPvpEliminationRoomId,
  buildPvpEliminationRoomStartBlockedNotice,
  buildPvpTeamBattleSchedule,
  buildPvpTeamMatchId,
  buildPvpTeamRoomId,
  buildPvpTeamRoomStartBlockedNotice,
  buildQueueSessionId,
  buildRewardParticleBurst,
  buildShopFallbackFromProfile,
  buildStatsFromLegacyProgress,
  buildThemeContextKey,
  buildThemeIntroRoulette,
  computeQueueBotMatchAtMs,
  doesAdminHistoryRowMatchFilter,
  ensureValidPvpConfig,
  extendPvpQuestionSetIfNeeded,
  formatBuildBadgeValue,
  formatSignedPoints,
  getAdminMatchStartMs,
  getBackgroundVisualMeta,
  getBotAnswerDelayMs,
  getBotDefaultStrengthById,
  getBotEmojiPool,
  getBotStrengthFromMatchRow,
  getDidacticExplainText,
  getEvolutionPassPreferredStage,
  getInvalidFinishedMatchReason,
  getKnowledgeAreaIndex,
  getLanguageNameById,
  getLeagueMetaByKey,
  getLeagueRankByKey,
  getLegacyGeneralKnowledgeQuizKey,
  getMatchBotUserId,
  getMatchHumanUserId,
  getMatchPlayerAcceptState,
  getMatchRefusalQueueFlow,
  getMatchRefusalQueueStatusText,
  getMissingEmojiSlotIndexes,
  getNextEmptyEmojiSlot,
  getPendingAcceptAutoCloseReason,
  getPreferredLanguageByKnowledgeArea,
  getPveRoundSeconds,
  getPvpAnswerTargetRoundNo,
  getPvpDifficultyFromPoints,
  getPvpEliminationActiveMemberIds,
  getPvpEliminationActivePair,
  getPvpEliminationMemberById,
  getPvpEliminationMembers,
  getPvpEliminationNextPlayablePair,
  getPvpEliminationPairFromRounds,
  getPvpEliminationPlacementForUser,
  getPvpEliminationPlacementLabel,
  getPvpEliminationResultKeyByPlacement,
  getPvpEliminationRewardScaleByPlacement,
  getPvpEliminationRoomAcceptBotDecisionAtMap,
  getPvpEliminationRoomAcceptBotWillRejectMap,
  getPvpEliminationRoomAcceptState,
  getPvpEliminationRoomAcceptStateMap,
  getPvpEliminationRoomHostUserId,
  getPvpEliminationRoomLaunchCheck,
  getPvpEliminationRoundEntry,
  getPvpEliminationRoundLabel,
  getPvpQueueDifficultyFromConfig,
  getPvpQueueDifficultyFromStats,
  getPvpRewardsByDifficulty,
  getPvpRoundAnswerFeedback,
  getPvpRoundAnswersForRound,
  getPvpSequenceCursorMapKey,
  getPvpSequenceRecentStartsStorageKey,
  getPvpSequenceStorageKey,
  getPvpTeamActivePairMembers,
  getPvpTeamBattleDisplayLabel,
  getPvpTeamBattleEntry,
  getPvpTeamCurrentBattleAnswers,
  getPvpTeamMatchBattleNo,
  getPvpTeamMembersBySide,
  getPvpTeamOpponentSide,
  getPvpTeamResultForUser,
  getPvpTeamRoomHostUserId,
  getPvpTeamRoomLaunchCheck,
  getPvpTeamRoomReadyMemberIds,
  getPvpTeamUserSide,
  getQueueDisconnectGraceMs,
  getTopicEmojiById,
  getTopicEmojiPool,
  getTopicNameById,
  hasMeaningfulProgress,
  hashPvpTeamRoomPassword,
  isAdminLiveMatchRow,
  isInvalidFinishedMatch,
  isLikelyMobileWeb,
  isPvpTeamRoomMemberReady,
  isQueueEntryFreshWaiting,
  isShopCategoryOpenStateEqual,
  normalizeAudioSettings,
  normalizeBattleEmojis,
  normalizeBotPersonality,
  normalizeBotStrength,
  normalizeEmojiDraftSlots,
  normalizeLegacyLanguageId,
  normalizePvpEliminationAcceptState,
  normalizePvpSequenceCursorEntry,
  normalizePvpSequenceCursorState,
  normalizePvpSequenceRecentStartsState,
  normalizePvpTeamRoomName,
  normalizePvpTeamRoomNameForCompare,
  normalizePvpTeamSide,
  normalizeQuestionForSequence,
  normalizeShopCategoryOpenState,
  normalizeShopOwnershipFilter,
  normalizeShopTab,
  nowIso,
  pickBotAnswerIndex,
  pickBotMoodEmoji,
  pickPveRoundQuestionsByTopicSequence,
  pickPvpEmojiFxLane,
  pickPvpQuestionSetBySequence,
  queueFlowLog,
  readHomeTourSeenLocal,
  readLeagueSnapshotLocal,
  readPlayerQuizHistoryLocal,
  readPvpKnowledgeAreaLocal,
  removeEmojiFromDraftByIndex,
  resolveKnowledgeAreaByLanguageId,
  resolveMatchQueueJoinedAtMs,
  resolveQuestionThemeContext,
  schedulePvpEmojiReplay,
  shouldResumeQueueAfterMatchRefused,
  toAdminDayKey,
  toMillis,
  withTimeout,
  writeHomeTourSeenLocal,
  writeLeagueSnapshotLocal,
  writePvpKnowledgeAreaLocal
} from './app/helpers';
import AppShell, { SplashScreen } from './layout/AppShell';
import { getShellMode, getTabForScreen, getTabScreen, TAB_ROOT_SCREENS } from './layout/nav';
import HomeScreen from './screens/HomeScreen';
import PlayModeScreen from './screens/PlayModeScreen';
import KnowledgeAreaScreen from './screens/KnowledgeAreaScreen';
import TrackSelectScreen from './screens/TrackSelectScreen';
import TopicScreen from './screens/TopicScreen';
import DifficultyScreen from './screens/DifficultyScreen';
import QuizScreen from './screens/QuizScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import ResultScreen from './screens/ResultScreen';
import PassScreen from './screens/PassScreen';
import RankingsScreen from './screens/RankingsScreen';
import AdminMonitorScreen from './screens/AdminMonitorScreen';
import AdminLiveScreen from './screens/AdminLiveScreen';
import AdminHistoryScreen from './screens/AdminHistoryScreen';
import LoginScreen from './screens/LoginScreen';
import NicknameSetupScreen from './screens/NicknameSetupScreen';
import SettingsScreen from './screens/SettingsScreen';
import ShopScreen from './screens/ShopScreen';
import PvpLobbyScreen from './screens/PvpLobbyScreen';
import PvpDuelScreen from './screens/PvpDuelScreen';
import PvpTeamScreen from './screens/PvpTeamScreen';
import PvpEliminationScreen from './screens/PvpEliminationScreen';
import PvpEliminationResultScreen from './screens/PvpEliminationResultScreen';
import PvpTeamResultScreen from './screens/PvpTeamResultScreen';
import PvpResultScreen from './screens/PvpResultScreen';
import TeamRoomCreateModal from './overlays/TeamRoomCreateModal';
import TeamJoinPromptModal from './overlays/TeamJoinPromptModal';
import TeamRoomNoticeModal from './overlays/TeamRoomNoticeModal';
import EliminationRoomNoticeModal from './overlays/EliminationRoomNoticeModal';
import EliminationExitPromptModal from './overlays/EliminationExitPromptModal';
import ShopItemPreviewModal from './overlays/ShopItemPreviewModal';
import PlayerHistoryModal from './overlays/PlayerHistoryModal';
import UpdateNoticeBar from './overlays/UpdateNoticeBar';
import CookieConsentBanner from './overlays/CookieConsentBanner';
import HomeTourOverlay from './overlays/HomeTourOverlay';
import SignOutConfirmModal from './overlays/SignOutConfirmModal';
import LeagueTransitionOverlay from './overlays/LeagueTransitionOverlay';
import AuthTransitionOverlay from './overlays/AuthTransitionOverlay';
import ThemeIntroOverlay from './overlays/ThemeIntroOverlay';
import QuizMenuModal from './overlays/QuizMenuModal';
import PvpEmojiPickerModal from './overlays/PvpEmojiPickerModal';
import RewardCollectModal from './overlays/RewardCollectModal';
import PvpOpponentLeftOverlay from './overlays/PvpOpponentLeftOverlay';
import PvpCompensationModal from './overlays/PvpCompensationModal';
import RewardParticles from './overlays/RewardParticles';

export default function CodeQuizApp() {
  const [screen, setScreen] = useState('login');
  const [booting, setBooting] = useState(true);
  const [toast, setToast] = useState('');

  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [googleSignInBusy, setGoogleSignInBusy] = useState(false);
  const [authTransition, setAuthTransition] = useState({
    visible: false,
    title: '',
    subtitle: '',
    mode: 'auth'
  });
  const [leagueTransition, setLeagueTransition] = useState({
    visible: false,
    title: '',
    subtitle: '',
    changes: []
  });
  const [settingsSignOutConfirmOpen, setSettingsSignOutConfirmOpen] = useState(false);
  const [themeIntro, setThemeIntro] = useState({
    visible: false,
    mode: 'pve',
    kicker: '',
    title: '',
    subtitle: '',
    icon: '🎯',
    phase: 'rolling',
    durationMs: THEME_INTRO_PVE_DURATION_MS,
    rollDurationMs: Math.max(520, THEME_INTRO_PVE_DURATION_MS - THEME_INTRO_PVE_SELECTED_HOLD_MS),
    rouletteItems: [],
    rouletteTargetIndex: 0,
    rouletteRailLeftPx: THEME_INTRO_ROULETTE_CHIP_CENTER_OFFSET_PX,
    rouletteStartOffsetPx: 260
  });
  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState({ nickname: '', full_name: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [nicknameAvailability, setNicknameAvailability] = useState({
    status: 'idle',
    available: false,
    message: NICKNAME_RULE_COPY
  });
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [homeTourOpen, setHomeTourOpen] = useState(false);
  const [homeTourStepIndex, setHomeTourStepIndex] = useState(0);
  const [homeTourHighlight, setHomeTourHighlight] = useState(null);
  const [audioSettings, setAudioSettings] = useState(AUDIO_DEFAULTS);
  const [musicMode, setMusicMode] = useState('menu');
  const [menuTrackIndex, setMenuTrackIndex] = useState(0);
  const [battleTrackIndex, setBattleTrackIndex] = useState(0);
  const [adminBusy, setAdminBusy] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [adminAccessBusy, setAdminAccessBusy] = useState(false);
  const [adminAuthorized, setAdminAuthorized] = useState(false);
  const [adminMatches, setAdminMatches] = useState([]);
  const [adminMatchesLoading, setAdminMatchesLoading] = useState(false);
  const [adminMatchesUpdatedAtMs, setAdminMatchesUpdatedAtMs] = useState(0);
  const [adminHistoryFilter, setAdminHistoryFilter] = useState('all');
  const [adminBotDaemonBusy, setAdminBotDaemonBusy] = useState(false);
  const [botArenaDaemonControl, setBotArenaDaemonControlState] = useState({
    arena_enabled: true,
    pvp_enabled: true,
    quiz_enabled: true,
    updated_at: '',
    updated_by: ''
  });
  const [botArenaDaemonStatus, setBotArenaDaemonStatusState] = useState({
    owner_id: '',
    status: 'unknown',
    last_state: '',
    ticks: 0,
    created_matches: 0,
    finalized_matches: 0,
    lock_ok: false,
    run_started_at: '',
    run_started_at_ms: 0,
    run_finished_at: '',
    run_finished_at_ms: 0,
    updated_at: '',
    updated_at_ms: 0
  });
  const [botArenaQuizState, setBotArenaQuizState] = useState({
    status: 'idle',
    batch_id: '',
    assignments: [],
    started_at_ms: 0,
    ends_at_ms: 0,
    cursor_difficulty: 'easy',
    cursor_index: 0,
    cursor_cycle_no: 0,
    updated_at: '',
    last_result: null
  });
  const [updateState, setUpdateState] = useState({
    available: false,
    latestSha: '',
    applying: false,
    reason: ''
  });
  const [buildBadgeValue, setBuildBadgeValue] = useState('desconhecido');
  const [cookieConsent, setCookieConsent] = useState('pending');

  const [progress, setProgress] = useState(defaultProgress());
  const [progressReady, setProgressReady] = useState(false);
  const [progressSyncEnabled, setProgressSyncEnabled] = useState(false);

  const [selectedKnowledgeArea, setSelectedKnowledgeArea] = useState('programming');
  const [kaCarouselIndex, setKaCarouselIndex] = useState(0);
  const [pvpKnowledgeArea, setPvpKnowledgeArea] = useState('programming');
  const [pvpAreaPreferenceReady, setPvpAreaPreferenceReady] = useState(false);
  const [arenaKaCarouselIndex, setArenaKaCarouselIndex] = useState(0);
  const [playerHistoryOpen, setPlayerHistoryOpen] = useState(false);
  const [playerHistoryFilter, setPlayerHistoryFilter] = useState('all');
  const [playerHistoryLoading, setPlayerHistoryLoading] = useState(false);
  const [playerHistoryError, setPlayerHistoryError] = useState('');
  const [playerPvpHistoryRows, setPlayerPvpHistoryRows] = useState([]);
  const [playerQuizHistoryEntries, setPlayerQuizHistoryEntries] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const [quizState, setQuizState] = useState(null);
  const [quizMenuOpen, setQuizMenuOpen] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null);
  const [resultState, setResultState] = useState(null);
  const [rewardFxParticles, setRewardFxParticles] = useState([]);
  const [rewardCollecting, setRewardCollecting] = useState(false);
  const [passClaimingStageId, setPassClaimingStageId] = useState('');
  const [passRecentClaimStageId, setPassRecentClaimStageId] = useState('');
  const [passFocusedStageId, setPassFocusedStageId] = useState('');

  const [rankingsMode, setRankingsMode] = useState('pve');
  const [rankingsRows, setRankingsRows] = useState([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);

  const [quizRankingRows, setQuizRankingRows] = useState([]);
  const [quizRankingLoading, setQuizRankingLoading] = useState(false);

  const [shopData, setShopData] = useState(defaultShopData());
  const [shopReady, setShopReady] = useState(false);
  const [shopTab, setShopTab] = useState('frame');
  const [shopOwnershipFilter, setShopOwnershipFilter] = useState('all');
  const [shopCategoryOpen, setShopCategoryOpen] = useState(() => buildDefaultShopCategoryState());
  const [shopItemPreview, setShopItemPreview] = useState(null);

  const [pvpConfig, setPvpConfig] = useState(buildFallbackPvpConfig());
  const [pvpMode, setPvpMode] = useState('');
  // Usuário para quem a retomada de partida (após recarregar) já rodou.
  const [matchResumeReadyUserId, setMatchResumeReadyUserId] = useState('');
  const [pvpState, setPvpState] = useState({
    status: 'idle',
    queueJoinedAtMs: 0,
    queueBotMatchAtMs: 0,
    queueResumeMode: '',
    matchId: '',
    match: null,
    answers: [],
    roundStartMs: 0,
    submitted: false,
    selectedIndex: null,
    error: '',
    result: null
  });
  const [pvpTeamRooms, setPvpTeamRooms] = useState([]);
  const [pvpTeamRoomsLoading, setPvpTeamRoomsLoading] = useState(false);
  const [pvpTeamRoomId, setPvpTeamRoomId] = useState('');
  const [pvpTeamRoom, setPvpTeamRoom] = useState(null);
  const [pvpTeamMatchId, setPvpTeamMatchId] = useState('');
  const [pvpTeamMatch, setPvpTeamMatch] = useState(null);
  const [pvpTeamAnswers, setPvpTeamAnswers] = useState([]);
  const [pvpTeamSelectedIndex, setPvpTeamSelectedIndex] = useState(null);
  const [pvpTeamSubmitted, setPvpTeamSubmitted] = useState(false);
  const [pvpTeamActionBusy, setPvpTeamActionBusy] = useState(false);
  const [pvpTeamCreateRoomOpen, setPvpTeamCreateRoomOpen] = useState(false);
  const [pvpTeamRoomDraft, setPvpTeamRoomDraft] = useState({
    name: '',
    visibility: 'open',
    password: ''
  });
  const [pvpTeamRoomDraftError, setPvpTeamRoomDraftError] = useState('');
  const [pvpTeamJoinPrompt, setPvpTeamJoinPrompt] = useState({
    roomId: '',
    roomName: '',
    requiresPassword: false,
    password: '',
    error: ''
  });
  const [pvpTeamRoomNoticeModal, setPvpTeamRoomNoticeModal] = useState(null);
  const [pvpTeamResult, setPvpTeamResult] = useState('');
  const [pvpTeamResultReward, setPvpTeamResultReward] = useState(null);
  const [pvpTeamRewardCollecting, setPvpTeamRewardCollecting] = useState(false);
  // Anfitrião pediu para iniciar com vaga aberta: a sala está sendo completada.
  const [pvpTeamAutoStartPending, setPvpTeamAutoStartPending] = useState(false);
  const [pvpEliminationRooms, setPvpEliminationRooms] = useState([]);
  const [pvpEliminationRoomsLoading, setPvpEliminationRoomsLoading] = useState(false);
  const [pvpEliminationRoomId, setPvpEliminationRoomId] = useState('');
  const [pvpEliminationRoom, setPvpEliminationRoom] = useState(null);
  const [pvpEliminationMatchId, setPvpEliminationMatchId] = useState('');
  const [pvpEliminationMatch, setPvpEliminationMatch] = useState(null);
  const [pvpEliminationAnswers, setPvpEliminationAnswers] = useState([]);
  const [pvpEliminationSelectedIndex, setPvpEliminationSelectedIndex] = useState(null);
  const [pvpEliminationSubmitted, setPvpEliminationSubmitted] = useState(false);
  const [pvpEliminationQueueState, setPvpEliminationQueueState] = useState({
    status: 'idle',
    joinedAtMs: 0,
    sessionId: '',
    message: ''
  });
  const [pvpEliminationActionBusy, setPvpEliminationActionBusy] = useState(false);
  const [pvpEliminationInviteBusy, setPvpEliminationInviteBusy] = useState(false);
  const [pvpEliminationRoomNoticeModal, setPvpEliminationRoomNoticeModal] = useState(null);
  const [pvpEliminationExitPrompt, setPvpEliminationExitPrompt] = useState(null);
  const [pvpEliminationResultReward, setPvpEliminationResultReward] = useState(null);
  const [pvpEliminationRewardCollecting, setPvpEliminationRewardCollecting] = useState(false);
  const [pvpCompensation, setPvpCompensation] = useState(null);
  const [pvpResultTransitionMode, setPvpResultTransitionMode] = useState('');
  const [pvpResultReward, setPvpResultReward] = useState(null);
  const [pvpRewardCollecting, setPvpRewardCollecting] = useState(false);
  const [queueActionBusy, setQueueActionBusy] = useState(false);
  const [queueActionPhase, setQueueActionPhase] = useState('');
  const [queueActionHint, setQueueActionHint] = useState('');
  const [pvpMatchFoundTransition, setPvpMatchFoundTransition] = useState({
    visible: false,
    matchId: '',
    visibleUntilMs: 0
  });
  const [browserOnline, setBrowserOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine !== false;
  });
  const [realtimeConnected, setRealtimeConnected] = useState(true);
  const [realtimeConnectionSeen, setRealtimeConnectionSeen] = useState(false);
  const [arenaOnlineDisplay, setArenaOnlineDisplay] = useState(0);
  const [pvpEmojiFx, setPvpEmojiFx] = useState([]);
  // Emojis voando nas partidas 2x2 / Um contra todos (com o nome de quem mandou).
  const [pvpGroupEmojiFx, setPvpGroupEmojiFx] = useState([]);
  const [pvpBattleEmojis, setPvpBattleEmojis] = useState(() => normalizeBattleEmojis(DEFAULT_BATTLE_EMOJIS));
  const [pvpEmojiPickerOpen, setPvpEmojiPickerOpen] = useState(false);
  const [pvpEmojiDraft, setPvpEmojiDraft] = useState(() => normalizeEmojiDraftSlots(DEFAULT_BATTLE_EMOJIS));
  const [pvpEmojiDraftWarning, setPvpEmojiDraftWarning] = useState('');
  const [pvpEmojiSlotFocus, setPvpEmojiSlotFocus] = useState(0);
  const [latestPvpEmojiEvent, setLatestPvpEmojiEvent] = useState(null);
  const [pvpEmojiCooldownUntilMs, setPvpEmojiCooldownUntilMs] = useState(0);
  const [quizQuestionHasOverflow, setQuizQuestionHasOverflow] = useState(false);
  const [pvpQuestionHasOverflow, setPvpQuestionHasOverflow] = useState(false);
  const [pvpClockMs, setPvpClockMs] = useState(Date.now());
  const [matchAcceptBusy, setMatchAcceptBusy] = useState(false);
  const [arenaMetrics, setArenaMetrics] = useState({
    online: 0,
    queue: 0
  });

  const matchmakingIntervalRef = useRef(null);
  const attachingMatchRef = useRef('');
  const themeIntroTimerRef = useRef(null);
  const themeIntroLockTimerRef = useRef(null);
  const themeIntroTokenRef = useRef(0);
  const pvpThemeIntroShownKeysRef = useRef(new Set());
  const pvpThemeIntroMatchRef = useRef('');
  const finalizeRoundBusyRef = useRef(false);
  const handledMatchIdsRef = useRef(new Set());
  const pvpStateRef = useRef(pvpState);
  const pvpEliminationQueueStateRef = useRef(pvpEliminationQueueState);
  const pvpTeamRoomAccessHashRef = useRef({});
  const pvpTeamFinalizeBusyRef = useRef(false);
  const pvpTeamAnswerBattleKeyRef = useRef('');
  const handledPvpTeamMatchIdsRef = useRef(new Set());
  const seenPvpTeamRoomNoticeIdsRef = useRef(new Set());
  const pvpEliminationQueueBusyRef = useRef(false);
  const pvpEliminationQueueLastAttemptMsRef = useRef(0);
  const pvpEliminationBotFillBusyRef = useRef(false);
  const pvpEliminationBotFillLastAttemptMsRef = useRef(0);
  const pvpEliminationQueueSyncLastRunMsRef = useRef(0);
  const pvpEliminationBotDecisionKeyRef = useRef('');
  const pvpEliminationBotDecisionRejectedIdsRef = useRef([]);
  const pvpEliminationFinalizeBusyRef = useRef(false);
  const pvpEliminationAnswerBattleKeyRef = useRef('');
  const handledPvpEliminationMatchIdsRef = useRef(new Set());
  const seenPvpEliminationRoomNoticeIdsRef = useRef(new Set());
  const dismissedPvpEliminationExitPromptIdsRef = useRef(new Set());
  const ignoredPvpEliminationMatchIdsRef = useRef(new Set());
  // Modos em grupo: estado local do anfitrião (bots completando a sala 2x2), presença,
  // salas recusadas na fila do Um contra todos e a partida mais recente para timers.
  const pvpTeamBotFillRef = useRef({ roomId: '', membershipKey: '', dueAtMs: 0, busy: false });
  const pvpTeamAutoStartRoomIdRef = useRef('');
  const pvpTeamLobbyTickBusyRef = useRef(false);
  const pvpTeamLobbyTickFnRef = useRef(null);
  const matchResumeStartedUserIdRef = useRef('');
  const matchResumeApplyFnRef = useRef(null);
  const pvpGroupPresenceTouchRef = useRef({ key: '', atMs: 0 });
  const pvpGroupReconcileAtMsRef = useRef(0);
  const pvpGroupAdvanceBusyRef = useRef(false);
  const pvpEliminationExcludedRoomIdsRef = useRef(new Map());
  const pvpGroupBotRewardAttemptsRef = useRef(new Set());
  const pvpTeamMatchRef = useRef(null);
  const pvpTeamRoomRef = useRef(null);
  const pvpEliminationMatchRef = useRef(null);
  const pvpSequenceCursorRef = useRef({});
  const pvpSequenceRecentStartsRef = useRef({});
  const leagueSnapshotRef = useRef({ userId: '', pveKey: '', pvpKey: '' });
  const leagueTransitionTimerRef = useRef(null);
  const pvpMatchFoundTransitionTimerRef = useRef(null);
  const pvpMatchFoundTransitionShownRef = useRef('');
  const progressRef = useRef(progress);
  const shopDataRef = useRef(shopData);
  const browserOnlineRef = useRef(browserOnline);
  const realtimeConnectedRef = useRef(realtimeConnected);
  const realtimeConnectionSeenRef = useRef(realtimeConnectionSeen);
  const pvpRoundActivatedAtRef = useRef({ key: '', ms: 0 });
  const pvpRoundRemainingGuardRef = useRef({ key: '', remainingMs: 0 });
  const pvpForcedFinalizeRef = useRef({ key: '', lastAtMs: 0 });
  const quizQuestionScrollRef = useRef(null);
  const pvpQuestionScrollRef = useRef(null);
  const pvpRealtimeMatchUpdateAtRef = useRef(0);
  const pvpRealtimeAnswersUpdateAtRef = useRef(0);
  const pvpSeenEmojiEventIdsRef = useRef(new Set());
  const pvpSeenEmojiEventOrderRef = useRef([]);
  // Ritmo de exibição por remetente, timers dos emojis na tela e, por partida, os ids
  // de emoji já lidos (o histórico não reaparece ao reabrir o canal).
  const pvpEmojiReplayLanesRef = useRef(new Map());
  const pvpEmojiFxTimersRef = useRef({ duel: [], group: [] });
  const pvpEmojiKnownIdsRef = useRef(new Map());
  const pvpEmojiSendQueueRef = useRef([]);
  const pvpEmojiSendBusyRef = useRef(false);
  const pvpEmojiSendCountRef = useRef(0);
  const pvpEmojiSpamWindowRef = useRef([]);

  const closeLeagueTransition = () => {
    if (leagueTransitionTimerRef.current) {
      clearTimeout(leagueTransitionTimerRef.current);
      leagueTransitionTimerRef.current = null;
    }
    setLeagueTransition((prev) => {
      if (!prev.visible) return prev;
      return {
        ...prev,
        visible: false
      };
    });
  };
  const closePvpMatchFoundTransition = (resetMatchId = false) => {
    if (pvpMatchFoundTransitionTimerRef.current) {
      clearTimeout(pvpMatchFoundTransitionTimerRef.current);
      pvpMatchFoundTransitionTimerRef.current = null;
    }
    setPvpMatchFoundTransition((prev) => {
      const currentMatchId = String(prev?.matchId || '').trim();
      const nextMatchId = resetMatchId ? '' : currentMatchId;
      if (!prev.visible && currentMatchId === nextMatchId && !Number(prev?.visibleUntilMs || 0)) return prev;
      return {
        visible: false,
        matchId: nextMatchId,
        visibleUntilMs: 0
      };
    });
    if (resetMatchId) {
      pvpMatchFoundTransitionShownRef.current = '';
    }
  };
  const startPvpMatchFoundTransition = (matchId = '') => {
    const safeMatchId = String(matchId || '').trim();
    if (!safeMatchId) {
      closePvpMatchFoundTransition(true);
      return 0;
    }
    if (pvpMatchFoundTransitionTimerRef.current) {
      clearTimeout(pvpMatchFoundTransitionTimerRef.current);
      pvpMatchFoundTransitionTimerRef.current = null;
    }
    const nowMs = Date.now();
    const visibleUntilMs = nowMs + PVP_MATCH_FOUND_TRANSITION_MS;
    pvpMatchFoundTransitionShownRef.current = safeMatchId;
    setPvpMatchFoundTransition({
      visible: true,
      matchId: safeMatchId,
      visibleUntilMs
    });
    pvpMatchFoundTransitionTimerRef.current = setTimeout(() => {
      setPvpMatchFoundTransition((prev) => {
        if (String(prev?.matchId || '').trim() !== safeMatchId) return prev;
        return {
          ...prev,
          visible: false
        };
      });
      pvpMatchFoundTransitionTimerRef.current = null;
    }, PVP_MATCH_FOUND_TRANSITION_MS);
    return visibleUntilMs;
  };
  const pvpEmojiCooldownUntilRef = useRef(0);
  const authBootstrapDoneRef = useRef(false);
  const audioSettingsRef = useRef(audioSettings);
  const menuTrackIndexRef = useRef(menuTrackIndex);
  const battleTrackIndexRef = useRef(battleTrackIndex);
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const musicGainRef = useRef(null);
  const sfxGainRef = useRef(null);
  const musicLoopTimerRef = useRef(null);
  const musicTransitionTimerRef = useRef(null);
  const musicAutoSkipTimerRef = useRef(null);
  const musicSkipSwitchTimerRef = useRef(null);
  const musicSkipBusyRef = useRef(false);
  const musicStepRef = useRef(0);
  const musicModeRef = useRef('menu');
  const musicBattleFlowRef = useRef(false);
  const audioUnlockedRef = useRef(false);
  const rewardFxTimeoutRef = useRef(null);
  const rewardSfxTimersRef = useRef([]);
  const passClaimStageFlashTimerRef = useRef(null);
  const pvpAreaPreferenceLoadedRef = useRef('');
  const botAnswerTimerRef = useRef(null);
  const botAnswerRoundKeyRef = useRef('');
  const pvpRoundResultFeedbackKeyRef = useRef('');
  const pvpRoundResultFeedbackTimerRef = useRef(null);
  const pvpResultAudioTimersRef = useRef([]);
  const pvpResultAudioKeyRef = useRef('');
  const pvpTimerSfxRef = useRef({
    roundKey: '',
    warningPlayed: false,
    criticalPlayed: false,
    timeoutPlayed: false,
    tickSecond: -1
  });
  const pvpRoundPhaseSfxKeyRef = useRef('');
  const pvpRoundResultSfxKeyRef = useRef('');
  const botReactionTimersRef = useRef([]);
  const botReactionUserEmojiEventRef = useRef('');
  const botReactionRoundResultRef = useRef('');
  const botReactionFirstAnswerRef = useRef('');
  const pvpGroupBotEmojiTimersRef = useRef([]);
  const pvpGroupBotEmojiKeysRef = useRef(new Set());
  const pvpGroupBotEmojiReplyAtRef = useRef(0);
  const pvpGroupBotEmojiChatAtRef = useRef(0);
  const pvpGroupBotEmojiLastAtRef = useRef(0);
  const pvpGroupResultScreenModeRef = useRef('');
  const pvpGroupAmbientAnswersRef = useRef({ team: [], elimination: [] });
  const swRegRef = useRef(null);
  const waitingWorkerRef = useRef(null);
  const updateCheckBusyRef = useRef(false);
  const runningBuildShaRef = useRef('');
  const latestBuildShaRef = useRef('');
  const mobileSwCleanupDoneRef = useRef(false);
  const googleSignInRef = useRef(false);
  const googleButtonContainerRef = useRef(null);
  const pvpQueueResumeRef = useRef({
    available: false,
    joinedAtMs: 0,
    botRemainingMs: 0,
    elapsedAtPauseMs: 0
  });
  const queueBotExclusionRef = useRef({
    botId: '',
    untilMs: 0
  });
  const queueSessionStartMsRef = useRef(0);
  const queueSessionIdRef = useRef('');
  const queueCancelRequestedRef = useRef(false);
  const preparedBotRef = useRef({
    userId: '',
    category: '',
    botId: '',
    snapshot: null,
    config: null,
    preparedAtMs: 0
  });
  const preparedBotInFlightRef = useRef(null);
  const preparedBotKickAtRef = useRef(0);
  const queueFlowLogThrottleRef = useRef({});
  const queueActionBusyStartedAtRef = useRef(0);
  const queueDisconnectCancelTimerRef = useRef(null);
  const queueDisconnectStartedAtRef = useRef(0);
  const matchAcceptBusyStartedAtRef = useRef(0);
  const leavePvpFlowBusyRef = useRef(false);
  const preloadRuntimeRef = useRef({
    userId: '',
    lastAtMs: 0,
    challengeLastAtMs: 0
  });
  const progressRecoveryBusyRef = useRef(false);
  const progressSyncGuardRef = useRef({
    remoteHasMeaningful: false,
    remoteUpdatedAtMs: 0,
    remoteSignalScore: 0
  });
  const activeAuthUser = authUser || firebaseAuth.currentUser || null;

  const queueFlowLogThrottled = (key, intervalMs, step, meta = {}) => {
    const safeKey = String(key || '').trim();
    const nowMs = Date.now();
    const safeInterval = Math.max(500, Number(intervalMs || 2000));
    const lastMs = Math.max(0, Number(queueFlowLogThrottleRef.current?.[safeKey] || 0));
    if (safeKey && nowMs - lastMs < safeInterval) return;
    if (safeKey) {
      queueFlowLogThrottleRef.current = {
        ...(queueFlowLogThrottleRef.current || {}),
        [safeKey]: nowMs
      };
    }
    queueFlowLog(step, meta);
  };

  const clearPvpQueueResumeSnapshot = () => {
    pvpQueueResumeRef.current = {
      available: false,
      joinedAtMs: 0,
      botRemainingMs: 0,
      elapsedAtPauseMs: 0
    };
  };
  const setQueueBotExclusion = (botId = '', ttlMs = 45000) => {
    const safeBotId = String(botId || '').trim();
    if (!safeBotId) {
      queueBotExclusionRef.current = { botId: '', untilMs: 0 };
      return;
    }
    const safeTtlMs = Math.max(1000, Number(ttlMs || 45000));
    queueBotExclusionRef.current = {
      botId: safeBotId,
      untilMs: Date.now() + safeTtlMs
    };
  };
  const getQueueBotExclusionId = () => {
    const entry = queueBotExclusionRef.current && typeof queueBotExclusionRef.current === 'object'
      ? queueBotExclusionRef.current
      : { botId: '', untilMs: 0 };
    const safeBotId = String(entry.botId || '').trim();
    const safeUntilMs = Math.max(0, Number(entry.untilMs || 0));
    if (!safeBotId || safeUntilMs <= Date.now()) {
      if (safeBotId) {
        queueBotExclusionRef.current = { botId: '', untilMs: 0 };
      }
      return '';
    }
    return safeBotId;
  };
  const clearPreparedBot = () => {
    preparedBotRef.current = {
      userId: '',
      category: '',
      botId: '',
      snapshot: null,
      config: null,
      preparedAtMs: 0
    };
    preparedBotInFlightRef.current = null;
    preparedBotKickAtRef.current = 0;
  };
  const prepareBotForQueue = async (targetDifficulty, reason = 'queue_join', force = false) => {
    const currentUserId = String(authUser?.uid || '').trim();
    if (!currentUserId) return null;
    const safeDifficulty = normalizeDifficulty(targetDifficulty || 'easy');
    const excludedBotId = getQueueBotExclusionId();
    const nowMs = Date.now();
    const current = preparedBotRef.current && typeof preparedBotRef.current === 'object'
      ? preparedBotRef.current
      : {};
    if (
      !force
      &&
      current.userId === currentUserId
      && current.category === safeDifficulty
      && isSystemBotUserId(current.botId)
      && (nowMs - Math.max(0, Number(current.preparedAtMs || 0))) < 12000
    ) {
      return current;
    }
    const inFlight = preparedBotInFlightRef.current;
    if (
      !force
      && inFlight
      && typeof inFlight === 'object'
      && inFlight.userId === currentUserId
      && inFlight.category === safeDifficulty
      && (nowMs - Math.max(0, Number(inFlight.startedAtMs || 0))) < 4000
      && inFlight.promise
    ) {
      return inFlight.promise;
    }

    const promise = (async () => {
      const startedAtMs = Date.now();
      const pickedBot = await withTimeout(
        getNextBotForUserMatch(safeDifficulty, {
          excludeBotIds: excludedBotId ? [excludedBotId] : [],
          waitForEnsure: false,
          preferLocal: true
        }).catch(() => null),
        2200,
        'prepare_pick_bot'
      ).catch(() => null);
      const preferredBotId = String(
        pickedBot?.bot_id
        || pickedBot?.profile?.id
        || ''
      ).trim();
      let safeBotId = '';
      if (isSystemBotUserId(preferredBotId) && preferredBotId !== excludedBotId) {
        safeBotId = preferredBotId;
      } else if (
        String(current.userId || '').trim() === currentUserId
        && normalizeDifficulty(current.category || 'easy') === safeDifficulty
        && isSystemBotUserId(current.botId)
        && String(current.botId || '').trim() !== excludedBotId
      ) {
        safeBotId = String(current.botId || '').trim();
      }
      if (!safeBotId) return null;

      const [snapshot, config] = await Promise.all([
        withTimeout(
          getSystemBotSnapshot(safeBotId, {
            preferLocal: true
          }).catch(() => null),
          900,
          'prepare_bot_snapshot'
        ).catch(() => (
          String(current.botId || '').trim() === safeBotId ? (current.snapshot || null) : null
        )),
        withTimeout(
          getPvpBotConfig(safeBotId, {
            preferLocal: true
          }).catch(() => BOT_CONFIG_DEFAULT),
          900,
          'prepare_bot_config'
        ).catch(() => (
          String(current.botId || '').trim() === safeBotId ? (current.config || BOT_CONFIG_DEFAULT) : BOT_CONFIG_DEFAULT
        ))
      ]);

      const prepared = {
        userId: currentUserId,
        category: safeDifficulty,
        botId: safeBotId,
        snapshot: snapshot || null,
        config: config || BOT_CONFIG_DEFAULT,
        preparedAtMs: Date.now()
      };
      preparedBotRef.current = prepared;
      queueFlowLog('matchmaking_tick:bot_prepared', {
        userId: currentUserId,
        botId: safeBotId,
        difficulty: safeDifficulty,
        reason,
        elapsedMs: Math.max(0, Date.now() - startedAtMs)
      });
      return prepared;
    })();

    preparedBotInFlightRef.current = {
      userId: currentUserId,
      category: safeDifficulty,
      startedAtMs: nowMs,
      promise
    };
    try {
      return await promise;
    } finally {
      if (preparedBotInFlightRef.current?.promise === promise) {
        preparedBotInFlightRef.current = null;
      }
    }
  };
  const getQueueSessionStartMs = () => {
    return Math.max(
      0,
      Number(
        queueSessionStartMsRef.current
        || pvpStateRef.current?.queueJoinedAtMs
        || 0
      )
    );
  };
  const resolveBackendQueueJoinMs = (queueEntry, fallbackNowMs = Date.now()) => {
    const safeNowMs = Math.max(0, Number(fallbackNowMs || Date.now()));
    const explicitJoinedAtMs = Math.max(
      0,
      Number(queueEntry?.joined_at_ms || 0)
    );
    const candidateFromRow = Math.max(
      0,
      toMillis(queueEntry?.updated_at || queueEntry?.created_at)
    );
    const joinedAtCandidate = explicitJoinedAtMs > 0
      ? Math.min(explicitJoinedAtMs, safeNowMs)
      : 0;
    const resolvedBaseMs = joinedAtCandidate > 0 ? joinedAtCandidate : candidateFromRow;
    const resolvedMs = resolvedBaseMs > 0 ? Math.min(resolvedBaseMs, safeNowMs) : safeNowMs;
    return Math.max(0, resolvedMs);
  };
  const applyBackendQueueJoinConfirmation = (
    queueEntry,
    {
      preferredJoinedAtMs = 0,
      force = false,
      reason = 'queue_backend_confirmed'
    } = {}
  ) => {
    const safeQueue = queueEntry && typeof queueEntry === 'object' ? queueEntry : null;
    const safeStatus = String(safeQueue?.status || '').trim().toLowerCase();
    if (safeStatus !== 'waiting') {
      return { applied: false, joinedAtMs: 0, botMatchAtMs: 0 };
    }

    const currentState = pvpStateRef.current && typeof pvpStateRef.current === 'object'
      ? pvpStateRef.current
      : {};
    const currentStatus = String(currentState?.status || '').trim().toLowerCase();
    if (currentStatus !== 'queueing') {
      return { applied: false, joinedAtMs: 0, botMatchAtMs: 0 };
    }

    const currentJoinedAtMs = Math.max(0, Number(currentState?.queueJoinedAtMs || 0));
    if (!force && currentJoinedAtMs > 0) {
      return {
        applied: false,
        joinedAtMs: currentJoinedAtMs,
        botMatchAtMs: Math.max(0, Number(currentState?.queueBotMatchAtMs || 0))
      };
    }

    const nowMs = Date.now();
    const backendJoinedAtMs = resolveBackendQueueJoinMs(safeQueue, nowMs);
    const preferredMs = Math.max(0, Number(preferredJoinedAtMs || 0));
    const joinedAtMs = preferredMs > 0
      ? Math.min(preferredMs, backendJoinedAtMs || nowMs)
      : backendJoinedAtMs;
    const resumeMode = String(currentState?.queueResumeMode || '').trim().toLowerCase();
    const minSeconds = resumeMode === PVP_QUEUE_RESUME_MODE_REFUSAL
      ? PVP_QUEUE_BOT_REFUSAL_DELAY_MIN_SECONDS
      : PVP_QUEUE_BOT_FIRST_DELAY_MIN_SECONDS;
    const maxSeconds = resumeMode === PVP_QUEUE_RESUME_MODE_REFUSAL
      ? PVP_QUEUE_BOT_REFUSAL_DELAY_MAX_SECONDS
      : PVP_QUEUE_BOT_FIRST_DELAY_MAX_SECONDS;
    const botMatchAtMs = computeQueueBotMatchAtMs({
      nowMs,
      queueJoinedAtMs: joinedAtMs,
      queueResumeMode: resumeMode,
      currentBotMatchAtMs: Math.max(0, Number(currentState?.queueBotMatchAtMs || 0)),
      minSeconds,
      maxSeconds
    });

    queueSessionStartMsRef.current = joinedAtMs;
    setPvpState((prev) => {
      if (String(prev?.status || '').trim().toLowerCase() !== 'queueing') return prev;
      return {
        ...prev,
        queueJoinedAtMs: joinedAtMs,
        queueBotMatchAtMs: botMatchAtMs
      };
    });
    queueFlowLog(reason, {
      userId: authUser?.uid || '',
      joinedAtMs,
      botMatchAtMs,
      sourceStatus: safeStatus
    });

    return { applied: true, joinedAtMs, botMatchAtMs };
  };

  const persistPvpSequenceCursorState = (nextState) => {
    const normalizedState = normalizePvpSequenceCursorState(nextState);
    pvpSequenceCursorRef.current = normalizedState;
    if (typeof window === 'undefined') return;
    try {
      const storageKey = getPvpSequenceStorageKey(authUser?.uid || 'guest');
      window.localStorage.setItem(storageKey, JSON.stringify(normalizedState));
    } catch {
      // ignore storage failures
    }
  };

  const getPvpSequenceCursorEntry = (areaId = '', difficulty = 'easy') => {
    const mapKey = getPvpSequenceCursorMapKey(areaId, difficulty);
    const current = pvpSequenceCursorRef.current && typeof pvpSequenceCursorRef.current === 'object'
      ? pvpSequenceCursorRef.current
      : {};
    return normalizePvpSequenceCursorEntry(current[mapKey]);
  };

  const setPvpSequenceCursorEntry = (areaId = '', difficulty = 'easy', cursor = {}) => {
    const mapKey = getPvpSequenceCursorMapKey(areaId, difficulty);
    const current = pvpSequenceCursorRef.current && typeof pvpSequenceCursorRef.current === 'object'
      ? pvpSequenceCursorRef.current
      : {};
    persistPvpSequenceCursorState({
      ...current,
      [mapKey]: normalizePvpSequenceCursorEntry(cursor)
    });
  };

  const persistPvpSequenceRecentStartsState = (nextState) => {
    const normalizedState = normalizePvpSequenceRecentStartsState(nextState);
    pvpSequenceRecentStartsRef.current = normalizedState;
    if (typeof window === 'undefined') return;
    try {
      const storageKey = getPvpSequenceRecentStartsStorageKey(authUser?.uid || 'guest');
      window.localStorage.setItem(storageKey, JSON.stringify(normalizedState));
    } catch {
      // ignore storage failures
    }
  };

  const getPvpSequenceRecentStartTopicKeys = (areaId = '', difficulty = 'easy') => {
    const mapKey = getPvpSequenceCursorMapKey(areaId, difficulty);
    const current = pvpSequenceRecentStartsRef.current && typeof pvpSequenceRecentStartsRef.current === 'object'
      ? pvpSequenceRecentStartsRef.current
      : {};
    return Array.isArray(current[mapKey]) ? current[mapKey] : [];
  };

  const rememberPvpSequenceStartTopic = (areaId = '', difficulty = 'easy', topicKey = '') => {
    const safeTopicKey = String(topicKey || '').trim();
    if (!safeTopicKey) return;
    const mapKey = getPvpSequenceCursorMapKey(areaId, difficulty);
    const current = pvpSequenceRecentStartsRef.current && typeof pvpSequenceRecentStartsRef.current === 'object'
      ? pvpSequenceRecentStartsRef.current
      : {};
    const previousList = Array.isArray(current[mapKey]) ? current[mapKey] : [];
    const nextList = [
      safeTopicKey,
      ...previousList.filter((entry) => String(entry || '').trim() !== safeTopicKey)
    ].slice(0, PVP_SEQUENCE_RECENT_STARTS_MAX);
    persistPvpSequenceRecentStartsState({
      ...current,
      [mapKey]: nextList
    });
  };

  const resolvePvpMatchQuestionSequence = ({
    areaId = '',
    difficulty = 'easy',
    language = '',
    topic = '',
    rounds = PVP_ROUNDS_PER_MATCH,
    sequenceSeed = ''
  } = {}) => {
    const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
    const safeArea = String(
      areaId
      || resolveKnowledgeAreaByLanguageId(language || '')
      || 'programming'
    ).trim();
    const safeLanguage = String(language || '').trim();
    const safeTopic = String(topic || '').trim();
    const safeRounds = Math.max(1, Math.trunc(Number(rounds || PVP_ROUNDS_PER_MATCH)));
    const cursor = getPvpSequenceCursorEntry(safeArea, safeDifficulty);
    const recentStartTopicKeys = getPvpSequenceRecentStartTopicKeys(safeArea, safeDifficulty);
    return pickPvpQuestionSetBySequence(QUESTIONS, {
      difficulty: safeDifficulty,
      count: safeRounds,
      areaId: safeArea,
      preferredLanguage: safeLanguage,
      preferredTopic: safeTopic,
      sequenceSeed,
      ensureMatchWindow: true,
      cursor,
      recentStartTopicKeys
    });
  };

  const closePlayerHistoryPanel = () => {
    setPlayerHistoryOpen(false);
    setPlayerHistoryFilter('all');
  };

  const openPlayerHistoryPanel = async () => {
    const safeUserId = String(authUser?.uid || '').trim();
    setPlayerHistoryOpen(true);
    setPlayerHistoryFilter('all');
    setPlayerHistoryError('');
    setPlayerHistoryLoading(true);
    try {
      if (!safeUserId) {
        setPlayerPvpHistoryRows([]);
        return;
      }
      const rows = await getPvpMatchesSnapshot();
      const filtered = (Array.isArray(rows) ? rows : [])
        .filter((row) => {
          if (!row || typeof row !== 'object') return false;
          const status = String(row.status || '').trim().toLowerCase();
          if (status !== 'finished') return false;
          if (row.result_void === true || row.history_hidden === true) return false;
          if (isInvalidFinishedMatch(row)) return false;
          const player1Id = String(row.player1_user_id || '').trim();
          const player2Id = String(row.player2_user_id || '').trim();
          return player1Id === safeUserId || player2Id === safeUserId;
        })
        .sort((a, b) => (
          toMillis(b?.ended_at || b?.updated_at || b?.created_at)
          - toMillis(a?.ended_at || a?.updated_at || a?.created_at)
        ))
        .slice(0, 50);
      setPlayerPvpHistoryRows(filtered);
    } catch (error) {
      console.error('player history load failed:', error);
      setPlayerHistoryError('Não foi possível atualizar o histórico PvP agora.');
    } finally {
      setPlayerHistoryLoading(false);
    }
  };

  useEffect(() => {
    pvpStateRef.current = pvpState;
  }, [pvpState]);

  useEffect(() => {
    pvpEliminationQueueStateRef.current = pvpEliminationQueueState;
  }, [pvpEliminationQueueState]);

  useEffect(() => {
    pvpTeamMatchRef.current = pvpTeamMatch;
  }, [pvpTeamMatch]);

  useEffect(() => {
    pvpTeamRoomRef.current = pvpTeamRoom;
  }, [pvpTeamRoom]);

  // Sinal de presença enquanto espero no lobby (2x2) ou na fila/aceite (Um contra
  // todos). Sem ele, a sala me considera desconectado em ~30s e libera a vaga.
  useEffect(() => {
    const myUserId = String(authUser?.uid || '').trim();
    const teamRoomStatus = String(pvpTeamRoom?.status || '').trim().toLowerCase();
    const eliminationRoomStatus = String(pvpEliminationRoom?.status || '').trim().toLowerCase();
    const teamRoomId = pvpMode === PVP_MODE_TEAM_BATTLE && teamRoomStatus === 'lobby'
      ? String(pvpTeamRoomId || '').trim()
      : '';
    const eliminationRoomId = pvpMode === PVP_MODE_ELIMINATION
      && (eliminationRoomStatus === 'lobby' || eliminationRoomStatus === 'pending_accept')
      ? String(pvpEliminationRoomId || '').trim()
      : '';
    if (!myUserId || (!teamRoomId && !eliminationRoomId) || typeof window === 'undefined') return undefined;
    const touch = () => {
      if (teamRoomId) touchPvpTeamRoomPresence(teamRoomId, myUserId).catch(() => null);
      if (eliminationRoomId) touchPvpEliminationRoomPresence(eliminationRoomId, myUserId).catch(() => null);
    };
    const touchKey = `${teamRoomId}|${eliminationRoomId}`;
    if (pvpGroupPresenceTouchRef.current.key !== touchKey
      || (Date.now() - pvpGroupPresenceTouchRef.current.atMs) >= PVP_GROUP_PRESENCE_HEARTBEAT_MS) {
      pvpGroupPresenceTouchRef.current = { key: touchKey, atMs: Date.now() };
      touch();
    }
    const timer = window.setInterval(() => {
      pvpGroupPresenceTouchRef.current = { key: touchKey, atMs: Date.now() };
      touch();
    }, PVP_GROUP_PRESENCE_HEARTBEAT_MS);
    return () => window.clearInterval(timer);
  }, [pvpMode, pvpTeamRoomId, pvpTeamRoom?.status, pvpEliminationRoomId, pvpEliminationRoom?.status, authUser?.uid]);

  // Lobby 2x2: presença/liderança e, no líder, vagas sendo completadas.
  useEffect(() => {
    if (pvpMode !== PVP_MODE_TEAM_BATTLE || !authUser?.uid) return undefined;
    if (!String(pvpTeamRoomId || '').trim()) return undefined;
    if (String(pvpTeamRoom?.status || '').trim().toLowerCase() !== 'lobby') return undefined;
    if (typeof window === 'undefined') return undefined;
    // Sempre a versão mais recente do tick (o intervalo não fica preso a um render antigo).
    const tick = () => Promise.resolve(pvpTeamLobbyTickFnRef.current?.()).catch(() => null);
    tick();
    const timer = window.setInterval(tick, 700);
    return () => window.clearInterval(timer);
  }, [pvpMode, pvpTeamRoomId, pvpTeamRoom?.status, authUser?.uid]);

  useEffect(() => {
    pvpEliminationMatchRef.current = pvpEliminationMatch;
  }, [pvpEliminationMatch]);

  useEffect(() => {
    if (pvpMode !== PVP_MODE_TEAM_BATTLE || pvpTeamRoomId || pvpTeamMatchId) return;
    setPvpTeamRoomsLoading(true);
    sweepStalePvpGroupState().catch(() => null);
    const unsubscribe = subscribePvpTeamRooms(
      (rows) => {
        const safeUserId = String(authUser?.uid || '').trim();
        const nowMs = Date.now();
        // Só salas com alguém conectado; sala encerrada some da lista.
        const visibleRooms = (Array.isArray(rows) ? rows : []).filter((row) => {
          const status = String(row?.status || '').trim().toLowerCase();
          if (status === 'finished') return false;
          const mine = !!getPvpTeamUserSide(row, safeUserId);
          if (status === 'lobby') return mine || isPvpGroupRoomAlive(row, nowMs);
          return mine;
        });
        setPvpTeamRooms(visibleRooms);
        setPvpTeamRoomsLoading(false);
      },
      (error) => {
        console.error('team room list subscription failed:', error);
        setPvpTeamRoomsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [pvpMode, pvpTeamRoomId, pvpTeamMatchId, authUser?.uid]);

  useEffect(() => {
    if (pvpMode !== PVP_MODE_TEAM_BATTLE || !authUser?.uid || pvpTeamRoomId || pvpTeamMatchId) return;
    let cancelled = false;
    findOpenPvpTeamMatchForUser(authUser.uid)
      .then((row) => {
        if (cancelled || !row?.id) return;
        if (String(row?.room_id || '').trim()) {
          setPvpTeamRoomId(String(row.room_id).trim());
        }
        setPvpTeamMatchId(String(row.id));
        setPvpTeamMatch(row);
        setScreen('pvp-team');
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [pvpMode, authUser?.uid, pvpTeamRoomId, pvpTeamMatchId]);

  useEffect(() => {
    const roomId = String(pvpTeamRoomId || '').trim();
    if (pvpMode !== PVP_MODE_TEAM_BATTLE || !roomId) return;
    const unsubscribe = subscribePvpTeamRoom(
      roomId,
      (row) => {
        const myUserId = String(authUser?.uid || '').trim();
        const inMatchFlow = !!String(pvpTeamMatchRef.current?.id || '').trim();
        if (!row) {
          setPvpTeamRoom(null);
          setPvpTeamRoomId('');
          if (!inMatchFlow) {
            setPvpTeamAutoStartPending(false);
            showToast('A sala foi encerrada.');
          }
          return;
        }
        const status = String(row.status || '').trim().toLowerCase();
        if (status === 'lobby' && myUserId && !getPvpTeamUserSide(row, myUserId) && !inMatchFlow) {
          // Fui removido da sala (ex.: fiquei sem conexão e perdi a vaga).
          const removedReason = String(row?.removed_member_notices?.[myUserId]?.reason || '').trim();
          setPvpTeamRoom(null);
          setPvpTeamRoomId('');
          setPvpTeamAutoStartPending(false);
          showToast(removedReason === 'inactive'
            ? 'Você saiu da sala por inatividade.'
            : 'Você não está mais nesta sala.');
          return;
        }
        setPvpTeamRoom(row);
        const matchId = String(row.match_id || '').trim();
        const knownMatchFinished = String(pvpTeamMatchRef.current?.id || '') === matchId
          && String(pvpTeamMatchRef.current?.status || '').trim().toLowerCase() === 'finished';
        if (matchId && status === 'active' && !knownMatchFinished) {
          setPvpTeamAutoStartPending(false);
          setPvpTeamMatchId(matchId);
          setScreen('pvp-team');
        }
      },
      (error) => {
        console.error('team room subscription failed:', error);
      }
    );
    return () => unsubscribe();
  }, [pvpMode, pvpTeamRoomId]);

  useEffect(() => {
    const notice = pvpTeamRoom?.lobby_notice && typeof pvpTeamRoom.lobby_notice === 'object'
      ? pvpTeamRoom.lobby_notice
      : null;
    const noticeId = String(notice?.id || '').trim();
    if (!noticeId) return;
    if (seenPvpTeamRoomNoticeIdsRef.current.has(noticeId)) return;
    seenPvpTeamRoomNoticeIdsRef.current.add(noticeId);
    setPvpTeamRoomNoticeModal(notice);
  }, [pvpTeamRoom?.lobby_notice]);

  useEffect(() => {
    const matchId = String(pvpTeamMatchId || '').trim();
    if (pvpMode !== PVP_MODE_TEAM_BATTLE || !matchId) return;
    const unsubscribe = subscribePvpTeamMatch(
      matchId,
      (row) => {
        if (!row) {
          setPvpTeamMatch(null);
          return;
        }
        if (isPvpGroupMatchSnapshotObsolete(pvpTeamMatchRef.current, row)) return;
        pvpTeamMatchRef.current = row;
        if (String(row?.room_id || '').trim()) {
          setPvpTeamRoomId(String(row.room_id).trim());
        }
        setPvpTeamMatch(row);
        const status = String(row.status || '').trim().toLowerCase();
        if (status === 'active' || status === 'round_result') {
          if (screen !== 'pvp-team') setScreen('pvp-team');
        } else if (status === 'finished') {
          handlePvpTeamMatchFinished(row).catch(() => null);
        }
      },
      (error) => {
        console.error('team match subscription failed:', error);
      }
    );
    return () => unsubscribe();
  }, [pvpMode, pvpTeamMatchId, screen]);

  useEffect(() => {
    const match = pvpTeamMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    if (status !== 'active' && status !== 'round_result') return;
    const matchId = String(match?.id || pvpTeamMatchId || '').trim();
    const battleNo = getPvpTeamMatchBattleNo(match, status);
    if (!matchId || !battleNo) return;
    const answerBattleKey = JSON.stringify([matchId, battleNo, authUser?.uid || '']);
    if (status === 'active' && pvpTeamAnswerBattleKeyRef.current !== answerBattleKey) {
      pvpTeamAnswerBattleKeyRef.current = answerBattleKey;
      setPvpTeamAnswers([]);
      setPvpTeamSubmitted(false);
      setPvpTeamSelectedIndex(null);
    }

    const unsubscribe = subscribePvpTeamBattleAnswers(
      matchId,
      battleNo,
      (rows) => {
        const live = pvpTeamMatchRef.current;
        const liveStatus = String(live?.status || '').trim().toLowerCase();
        if (String(live?.id || '') !== matchId || liveStatus !== status
          || getPvpTeamMatchBattleNo(live, liveStatus) !== battleNo) return;
        const safeRows = getPvpTeamCurrentBattleAnswers(rows, battleNo);
        const myAnswer = safeRows.find((row) => String(row?.user_id || '').trim() === String(authUser?.uid || '').trim());
        const answerIdx = Number(myAnswer?.answer_idx ?? -1);
        const hasCommittedAnswer = !!myAnswer && Number.isFinite(answerIdx) && answerIdx >= 0;
        setPvpTeamAnswers(safeRows);
        // O snapshot também chega quando só o adversário responde. A escolha local
        // e o bloqueio de um envio pendente pertencem a esta rodada até confirmá-la.
        if (hasCommittedAnswer) {
          setPvpTeamSubmitted(true);
          setPvpTeamSelectedIndex(answerIdx);
        }
      },
      (error) => {
        console.error('team answers subscription failed:', error);
      }
    );
    return () => unsubscribe();
  }, [pvpTeamMatch?.id, pvpTeamMatch?.battle_no, pvpTeamMatch?.result_battle_no, pvpTeamMatch?.status, pvpTeamMatchId, authUser?.uid]);

  // Respostas dos bots da dupla atual. Todo humano presente agenda o mesmo instante e a
  // mesma resposta (sorteio fixo por partida/bot/confronto); o banco grava só a primeira.
  useEffect(() => {
    const match = pvpTeamMatch;
    if (String(match?.status || '').trim().toLowerCase() !== 'active' || !match?.id) return undefined;
    const myUserId = String(authUser?.uid || '').trim();
    if (!myUserId || getPvpGroupMatchGoneIds(match, PVP_GROUP_MODE_TEAM).includes(myUserId)) return undefined;
    const plans = getPvpGroupPendingBotAnswerPlans(match, PVP_GROUP_MODE_TEAM, pvpTeamAnswers);
    if (!plans.length || typeof window === 'undefined') return undefined;
    const timers = plans.map((plan) => window.setTimeout(() => {
      const live = pvpTeamMatchRef.current;
      if (String(live?.id || '') !== String(match.id)) return;
      if (String(live?.status || '').trim().toLowerCase() !== 'active') return;
      if (Math.max(1, Number(live?.battle_no || 1)) !== plan.battleNo) return;
      submitPvpGroupBotAnswer(PVP_GROUP_MODE_TEAM, live, plan).catch(() => null);
    }, Math.max(60, plan.dueAtMs - Date.now())));
    return () => timers.forEach((timerId) => window.clearTimeout(timerId));
  }, [pvpTeamMatch?.id, pvpTeamMatch?.battle_no, pvpTeamMatch?.status, pvpTeamAnswers, authUser?.uid]);

  useEffect(() => {
    const match = pvpTeamMatch;
    if (String(match?.status || '').trim().toLowerCase() !== 'active') return;
    if (!match?.id || pvpTeamFinalizeBusyRef.current) return;
    if (!isPvpTeamBattleReadyToFinalize(match, pvpTeamAnswers, pvpClockMs)) return;
    pvpTeamFinalizeBusyRef.current = true;
    finalizePvpGroupBattle(PVP_GROUP_MODE_TEAM, match, pvpTeamAnswers)
      .catch((error) => console.error('finalize team battle failed:', error))
      .finally(() => {
        pvpTeamFinalizeBusyRef.current = false;
      });
  }, [pvpTeamMatch?.id, pvpTeamMatch?.updated_at, pvpTeamAnswers, pvpClockMs]);

  useEffect(() => {
    const match = pvpTeamMatch;
    if (String(match?.status || '').trim().toLowerCase() !== 'round_result' || !match?.id) return;
    const roundUntilMs = Math.max(0, Number(match?.round_result_until_ms || 0));
    if (roundUntilMs && pvpClockMs < roundUntilMs) return;
    if (pvpGroupAdvanceBusyRef.current) return;
    pvpGroupAdvanceBusyRef.current = true;
    advancePvpGroupMatch(PVP_GROUP_MODE_TEAM, match)
      .catch((error) => console.error('advance team battle failed:', error))
      .finally(() => {
        pvpGroupAdvanceBusyRef.current = false;
      });
  }, [pvpTeamMatch?.id, pvpTeamMatch?.updated_at, pvpTeamMatch?.status, pvpClockMs]);

  useEffect(() => {
    if (
      pvpMode !== PVP_MODE_ELIMINATION
      || (
        String(pvpEliminationQueueState.status || '').trim().toLowerCase() !== 'queueing'
        && !pvpEliminationRoomId
        && !pvpEliminationMatchId
      )
    ) {
      return;
    }
    setPvpEliminationRoomsLoading(true);
    const unsubscribe = subscribePvpEliminationRooms(
      (rows) => {
        const safeUserId = String(authUser?.uid || '').trim();
        const nowMs = Date.now();
        const visibleRooms = (Array.isArray(rows) ? rows : []).filter((row) => {
          const status = String(row?.status || '').trim().toLowerCase();
          if (status === 'finished') return false;
          const mine = !!getPvpEliminationMemberById(row, safeUserId);
          if (status === 'lobby') return mine || isPvpGroupRoomAlive(row, nowMs);
          return mine;
        });
        setPvpEliminationRooms(visibleRooms);
        setPvpEliminationRoomsLoading(false);
      },
      (error) => {
        console.error('elimination room list subscription failed:', error);
        setPvpEliminationRoomsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [pvpMode, pvpEliminationQueueState.status, pvpEliminationRoomId, pvpEliminationMatchId, authUser?.uid]);

  useEffect(() => {
    if (pvpMode !== PVP_MODE_ELIMINATION || !authUser?.uid || pvpEliminationRoomId || pvpEliminationMatchId) return;
    let cancelled = false;
    findOpenPvpEliminationMatchForUser(authUser.uid)
      .then((row) => {
        const safeMatchId = String(row?.id || '').trim();
        if (cancelled || !safeMatchId) return;
        if (ignoredPvpEliminationMatchIdsRef.current.has(safeMatchId)) return;
        // Vale também para quem já foi eliminado e ainda assiste (não saiu da partida).
        const myUserId = String(authUser?.uid || '').trim();
        if (!myUserId || !getPvpEliminationMemberById(row, myUserId)) return;
        if (String(row?.room_id || '').trim()) {
          setPvpEliminationRoomId(String(row.room_id).trim());
        }
        setPvpEliminationMatchId(safeMatchId);
        setPvpEliminationMatch(row);
        setPvpEliminationQueueState({
          status: 'idle',
          joinedAtMs: 0,
          sessionId: '',
          message: ''
        });
        setScreen('pvp-elimination');
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [pvpMode, authUser?.uid, pvpEliminationRoomId, pvpEliminationMatchId]);

  useEffect(() => {
    const roomId = String(pvpEliminationRoomId || '').trim();
    if (pvpMode !== PVP_MODE_ELIMINATION || !roomId) return;
    const unsubscribe = subscribePvpEliminationRoom(
      roomId,
      (row) => {
        const myUserId = String(authUser?.uid || '').trim();
        const queueing = String(pvpEliminationQueueStateRef.current?.status || '').trim().toLowerCase() === 'queueing';
        const inMatchFlow = !!String(pvpEliminationMatchRef.current?.id || '').trim();
        if (!row) {
          // Sala desfeita: quem ainda está na fila volta a procurar outro grupo.
          setPvpEliminationRoom(null);
          setPvpEliminationRoomId('');
          return;
        }
        const rowStatus = String(row.status || '').trim().toLowerCase();
        if (
          queueing
          && !inMatchFlow
          && myUserId
          && (rowStatus === 'lobby' || rowStatus === 'pending_accept')
          && !getPvpEliminationMemberById(row, myUserId)
        ) {
          const removedReason = String(row?.removed_member_notices?.[myUserId]?.reason || '').trim();
          pvpEliminationExcludedRoomIdsRef.current.set(String(row.id || roomId), Date.now() + 60000);
          setPvpEliminationRoom(null);
          setPvpEliminationRoomId('');
          if (removedReason === 'accept_timeout') {
            setPvpEliminationQueueState({
              status: 'idle',
              joinedAtMs: 0,
              sessionId: '',
              message: ''
            });
            showToast('Você não confirmou a partida a tempo e saiu da fila.');
            playSfx('notify');
          } else {
            setPvpEliminationQueueState((prev) => (
              String(prev?.status || '').trim().toLowerCase() === 'queueing'
                ? { ...prev, message: 'Procurando outro grupo...' }
                : prev
            ));
          }
          return;
        }
        setPvpEliminationRoom(row);
        const matchId = String(row.match_id || '').trim();
        const knownMatchFinished = String(pvpEliminationMatchRef.current?.id || '') === matchId
          && String(pvpEliminationMatchRef.current?.status || '').trim().toLowerCase() === 'finished';
        if (matchId && String(row.status || '').trim().toLowerCase() === 'active' && !knownMatchFinished) {
          const roomMemberIds = getPvpEliminationMembers(row).map((member) => String(member?.user_id || '').trim()).filter(Boolean);
          const myUserId = String(authUser?.uid || '').trim();
          if (myUserId && !roomMemberIds.includes(myUserId)) return;
          if (ignoredPvpEliminationMatchIdsRef.current.has(matchId)) return;
          setPvpEliminationMatchId(matchId);
          if (screen !== 'pvp-elimination-result') setScreen('pvp-elimination');
        }
      },
      (error) => {
        console.error('elimination room subscription failed:', error);
      }
    );
    return () => unsubscribe();
  }, [pvpMode, pvpEliminationRoomId, screen, authUser?.uid]);

  useEffect(() => {
    if (pvpMode !== PVP_MODE_ELIMINATION) return;
    if (String(pvpEliminationQueueState.status || '').trim().toLowerCase() !== 'queueing') return;
    if (pvpEliminationRoomId || pvpEliminationMatchId) return;
    if (pvpEliminationRoomsLoading) return;
    ensurePvpEliminationQueueRoom().catch(() => null);
  }, [
    pvpMode,
    pvpEliminationQueueState.status,
    pvpEliminationQueueState.sessionId,
    pvpEliminationRoomId,
    pvpEliminationMatchId,
    pvpEliminationRoomsLoading,
    pvpEliminationRooms,
    pvpConfig.difficulty,
    pvpConfig.language,
    pvpConfig.topic,
    pvpKnowledgeArea,
    progress.level,
    progress.pvpPoints,
    profile?.id,
    profile?.nickname,
    profile?.avatar,
    shopData?.equipped?.frame,
    shopData?.equipped?.background,
    shopData?.equipped?.emoji,
    authUser?.uid
  ]);

  useEffect(() => {
    if (pvpMode !== PVP_MODE_ELIMINATION) return;
    if (String(pvpEliminationQueueState.status || '').trim().toLowerCase() !== 'queueing') return;
    if (!pvpEliminationRoom?.id) return;
    syncPvpEliminationQueueLobbyState().catch(() => null);
  }, [
    pvpMode,
    pvpEliminationQueueState.status,
    pvpEliminationRoom?.id,
    pvpEliminationRoom?.updated_at,
    pvpEliminationRoom?.status,
    pvpEliminationRoom?.accept_member_states,
    pvpEliminationRoom?.accept_deadline_ms,
    pvpEliminationRoom?.accept_start_countdown_ms,
    pvpEliminationActionBusy,
    pvpClockMs,
    authUser?.uid
  ]);

  useEffect(() => {
    const notice = pvpEliminationRoom?.lobby_notice && typeof pvpEliminationRoom.lobby_notice === 'object'
      ? pvpEliminationRoom.lobby_notice
      : null;
    const noticeId = String(notice?.id || '').trim();
    if (!noticeId) return;
    if (seenPvpEliminationRoomNoticeIdsRef.current.has(noticeId)) return;
    seenPvpEliminationRoomNoticeIdsRef.current.add(noticeId);
    setPvpEliminationRoomNoticeModal(notice);
  }, [pvpEliminationRoom?.lobby_notice]);

  useEffect(() => {
    const matchId = String(pvpEliminationMatchId || '').trim();
    if (pvpMode !== PVP_MODE_ELIMINATION || !matchId) return;
    const unsubscribe = subscribePvpEliminationMatch(
      matchId,
      (row) => {
        if (!row) {
          setPvpEliminationMatch(null);
          return;
        }
        const rowMatchId = String(row?.id || matchId || '').trim();
        const optedOutIds = Array.isArray(row?.opt_out_member_ids)
          ? row.opt_out_member_ids.map((entry) => String(entry || '').trim()).filter(Boolean)
          : [];
        const myUserId = String(authUser?.uid || '').trim();
        const blockedByIgnore = rowMatchId && ignoredPvpEliminationMatchIdsRef.current.has(rowMatchId);
        const blockedByOptOut = !!myUserId && optedOutIds.includes(myUserId);
        // Eliminado continua recebendo a partida para assistir até sair.
        const blockedByNotMember = !!myUserId && !getPvpEliminationMemberById(row, myUserId);
        if (blockedByIgnore || blockedByOptOut || blockedByNotMember) {
          // Na tela de resultado (saí recebendo a colocação) a partida fica congelada.
          if (screen === 'pvp-elimination-result') return;
          setPvpEliminationMatch(null);
          setPvpEliminationMatchId('');
          return;
        }
        if (isPvpGroupMatchSnapshotObsolete(pvpEliminationMatchRef.current, row)) return;
        pvpEliminationMatchRef.current = row;
        if (String(row?.room_id || '').trim()) {
          setPvpEliminationRoomId(String(row.room_id).trim());
        }
        setPvpEliminationMatch(row);
        const status = String(row.status || '').trim().toLowerCase();
        if (status === 'active' || status === 'round_result' || status === 'elimination_result') {
          if (screen !== 'pvp-elimination-result') setScreen('pvp-elimination');
        } else if (status === 'finished') {
          handlePvpEliminationMatchFinished(row).catch(() => null);
        }
      },
      (error) => {
        console.error('elimination match subscription failed:', error);
      }
    );
    return () => unsubscribe();
  }, [pvpMode, pvpEliminationMatchId, screen, authUser?.uid]);

  useEffect(() => {
    if (pvpMode !== PVP_MODE_ELIMINATION) return;
    const matchId = String(pvpEliminationMatchId || '').trim();
    if (!matchId) return;
    pvpEliminationQueueBusyRef.current = false;
    pvpEliminationBotFillBusyRef.current = false;
    pvpEliminationBotFillLastAttemptMsRef.current = 0;
    pvpEliminationBotDecisionKeyRef.current = '';
    pvpEliminationBotDecisionRejectedIdsRef.current = [];
    setPvpEliminationQueueState((prev) => (
      String(prev?.status || '').trim().toLowerCase() === 'queueing'
        ? {
          status: 'idle',
          joinedAtMs: 0,
          sessionId: '',
          message: ''
        }
        : prev
    ));
  }, [pvpMode, pvpEliminationMatchId]);

  useEffect(() => {
    if (pvpMode !== PVP_MODE_ELIMINATION) return;
    const matchId = String(pvpEliminationMatch?.id || pvpEliminationMatchId || '').trim();
    if (!matchId) return;
    const myUserId = String(authUser?.uid || '').trim();
    const optedOutIds = Array.isArray(pvpEliminationMatch?.opt_out_member_ids)
      ? pvpEliminationMatch.opt_out_member_ids.map((entry) => String(entry || '').trim()).filter(Boolean)
      : [];
    if (!ignoredPvpEliminationMatchIdsRef.current.has(matchId) && (!myUserId || !optedOutIds.includes(myUserId))) return;
    if (screen === 'pvp-elimination-result') return;
    setPvpEliminationMatchId('');
    setPvpEliminationMatch(null);
  }, [pvpMode, pvpEliminationMatch?.id, pvpEliminationMatch?.opt_out_member_ids, pvpEliminationMatchId, authUser?.uid, screen]);

  useEffect(() => {
    const match = pvpEliminationMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    if (status !== 'active' && status !== 'round_result' && status !== 'elimination_result') return;
    const matchId = String(match?.id || pvpEliminationMatchId || '').trim();
    const battleNo = Math.max(
      1,
      Number(status === 'active' ? match?.battle_no : (match?.result_battle_no || match?.battle_no || 1))
    );
    if (!matchId || !battleNo) return;
    const answerBattleKey = JSON.stringify([matchId, battleNo, authUser?.uid || '']);
    if (status === 'active' && pvpEliminationAnswerBattleKeyRef.current !== answerBattleKey) {
      pvpEliminationAnswerBattleKeyRef.current = answerBattleKey;
      setPvpEliminationAnswers([]);
      setPvpEliminationSubmitted(false);
      setPvpEliminationSelectedIndex(null);
    }

    const unsubscribe = subscribePvpEliminationBattleAnswers(
      matchId,
      battleNo,
      (rows) => {
        const live = pvpEliminationMatchRef.current;
        const liveStatus = String(live?.status || '').trim().toLowerCase();
        const liveBattleNo = Math.max(1, Number(liveStatus === 'active'
          ? live?.battle_no
          : (live?.result_battle_no || live?.battle_no || 1)));
        if (String(live?.id || '') !== matchId || liveStatus !== status || liveBattleNo !== battleNo) return;
        const safeRows = (Array.isArray(rows) ? rows : [])
          .filter((row) => row && typeof row === 'object')
          .map((row) => ({
            ...row,
            battle_no: Math.max(1, Number(row?.battle_no || battleNo)),
            user_id: String(row?.user_id || '').trim()
          }))
          .filter((row) => !!row.user_id && row.battle_no === battleNo);
        const myUserId = String(authUser?.uid || '').trim();
        const myAnswer = safeRows.find((row) => row.user_id === myUserId);
        const answerIdx = Number(myAnswer?.answer_idx ?? -1);
        const hasCommittedAnswer = !!myAnswer && Number.isFinite(answerIdx) && answerIdx >= 0;
        setPvpEliminationAnswers(safeRows);
        if (status === 'active') {
          if (hasCommittedAnswer) {
            setPvpEliminationSubmitted(true);
            setPvpEliminationSelectedIndex(answerIdx);
          }
        } else {
          setPvpEliminationSubmitted(false);
          setPvpEliminationSelectedIndex(null);
        }
      },
      (error) => {
        console.error('elimination answers subscription failed:', error);
      }
    );
    return () => unsubscribe();
  }, [
    pvpEliminationMatch?.id,
    pvpEliminationMatch?.battle_no,
    pvpEliminationMatch?.result_battle_no,
    pvpEliminationMatch?.status,
    pvpEliminationMatchId,
    authUser?.uid
  ]);

  // Respostas dos bots da dupla em duelo (mesma lógica da Batalha 2x2). Espectadores
  // humanos também agendam, então a partida segue mesmo com só bots duelando.
  useEffect(() => {
    const match = pvpEliminationMatch;
    if (String(match?.status || '').trim().toLowerCase() !== 'active' || !match?.id) return undefined;
    const myUserId = String(authUser?.uid || '').trim();
    if (!myUserId || getPvpGroupMatchGoneIds(match, PVP_GROUP_MODE_ELIMINATION).includes(myUserId)) return undefined;
    const plans = getPvpGroupPendingBotAnswerPlans(match, PVP_GROUP_MODE_ELIMINATION, pvpEliminationAnswers);
    if (!plans.length || typeof window === 'undefined') return undefined;
    const timers = plans.map((plan) => window.setTimeout(() => {
      const live = pvpEliminationMatchRef.current;
      if (String(live?.id || '') !== String(match.id)) return;
      if (String(live?.status || '').trim().toLowerCase() !== 'active') return;
      if (Math.max(1, Number(live?.battle_no || 1)) !== plan.battleNo) return;
      submitPvpGroupBotAnswer(PVP_GROUP_MODE_ELIMINATION, live, plan).catch(() => null);
    }, Math.max(60, plan.dueAtMs - Date.now())));
    return () => timers.forEach((timerId) => window.clearTimeout(timerId));
  }, [pvpEliminationMatch?.id, pvpEliminationMatch?.battle_no, pvpEliminationMatch?.status, pvpEliminationAnswers, authUser?.uid]);

  useEffect(() => {
    const match = pvpEliminationMatch;
    if (String(match?.status || '').trim().toLowerCase() !== 'active') return;
    if (!match?.id || pvpEliminationFinalizeBusyRef.current) return;
    if (!isPvpEliminationBattleReadyToFinalize(match, pvpEliminationAnswers, pvpClockMs)) return;
    pvpEliminationFinalizeBusyRef.current = true;
    finalizePvpGroupBattle(PVP_GROUP_MODE_ELIMINATION, match, pvpEliminationAnswers)
      .catch((error) => console.error('finalize elimination battle failed:', error))
      .finally(() => {
        pvpEliminationFinalizeBusyRef.current = false;
      });
  }, [pvpEliminationMatch?.id, pvpEliminationMatch?.updated_at, pvpEliminationAnswers, pvpClockMs]);

  useEffect(() => {
    const match = pvpEliminationMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    if ((status !== 'round_result' && status !== 'elimination_result') || !match?.id) return;
    const untilMs = Math.max(0, Number(
      status === 'round_result' ? match?.round_result_until_ms : match?.elimination_until_ms
    ) || 0);
    if (untilMs && pvpClockMs < untilMs) return;
    if (pvpGroupAdvanceBusyRef.current) return;
    pvpGroupAdvanceBusyRef.current = true;
    advancePvpGroupMatch(PVP_GROUP_MODE_ELIMINATION, match)
      .catch((error) => console.error('advance elimination failed:', error))
      .finally(() => {
        pvpGroupAdvanceBusyRef.current = false;
      });
  }, [pvpEliminationMatch?.id, pvpEliminationMatch?.updated_at, pvpEliminationMatch?.status, pvpClockMs]);

  // Emojis nas partidas 2x2 e Um contra todos: canal aberto enquanto há confronto ou
  // resultado na tela, inclusive na tela de resultado final da partida.
  const pvpGroupResultScreenMode = screen === 'pvp-team-result'
    ? PVP_GROUP_MODE_TEAM
    : (screen === 'pvp-elimination-result' ? PVP_GROUP_MODE_ELIMINATION : '');
  pvpGroupResultScreenModeRef.current = pvpGroupResultScreenMode;
  pvpGroupAmbientAnswersRef.current = { team: pvpTeamAnswers, elimination: pvpEliminationAnswers };
  const pvpTeamMatchStatus = String(pvpTeamMatch?.status || '').trim().toLowerCase();
  const pvpEliminationMatchStatus = String(pvpEliminationMatch?.status || '').trim().toLowerCase();
  const pvpTeamEmojiChannelOpen = ['active', 'round_result'].includes(pvpTeamMatchStatus)
    || (pvpTeamMatchStatus === 'finished' && pvpGroupResultScreenMode === PVP_GROUP_MODE_TEAM);
  const pvpEliminationEmojiChannelOpen = ['active', 'round_result', 'elimination_result'].includes(pvpEliminationMatchStatus)
    || (pvpEliminationMatchStatus === 'finished' && pvpGroupResultScreenMode === PVP_GROUP_MODE_ELIMINATION);

  useEffect(() => {
    const matchId = String(pvpTeamMatch?.id || '').trim();
    if (!matchId || !pvpTeamEmojiChannelOpen) return undefined;
    return subscribePvpGroupEmojis(PVP_GROUP_MODE_TEAM, matchId);
  }, [pvpTeamMatch?.id, pvpTeamEmojiChannelOpen]);

  useEffect(() => {
    const matchId = String(pvpEliminationMatch?.id || '').trim();
    if (!matchId || !pvpEliminationEmojiChannelOpen) return undefined;
    return subscribePvpGroupEmojis(PVP_GROUP_MODE_ELIMINATION, matchId);
  }, [pvpEliminationMatch?.id, pvpEliminationEmojiChannelOpen]);

  // Trocou de partida (ou saiu): limpa os emojis na tela e as reações agendadas dos bots.
  useEffect(() => {
    setPvpGroupEmojiFx([]);
    clearPvpEmojiFxTimers('group');
    clearPvpGroupBotEmojiTimers();
    pvpGroupBotEmojiKeysRef.current = new Set();
    pvpGroupBotEmojiReplyAtRef.current = 0;
    pvpGroupBotEmojiChatAtRef.current = 0;
    pvpGroupBotEmojiLastAtRef.current = 0;
    return () => clearPvpGroupBotEmojiTimers();
  }, [pvpTeamMatch?.id, pvpEliminationMatch?.id]);

  // Bots reagem ao fim de cada confronto (só o aparelho que conduz os bots agenda).
  useEffect(() => {
    const match = pvpTeamMatch;
    if (String(match?.status || '').trim().toLowerCase() !== 'round_result' || !match?.id) return;
    if (!isPvpGroupEmojiDriver(PVP_GROUP_MODE_TEAM, match)) return;
    if (!rememberPvpGroupBotEmojiKey(`${match.id}_round_${match.result_battle_no || match.battle_no}`)) return;
    queuePvpGroupBotEmojiPlan(PVP_GROUP_MODE_TEAM, match.id, planPvpGroupBotRoundEmojis(match, PVP_GROUP_MODE_TEAM));
  }, [pvpTeamMatch?.id, pvpTeamMatch?.status, pvpTeamMatch?.result_battle_no, authUser?.uid]);

  useEffect(() => {
    const match = pvpEliminationMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    if ((status !== 'round_result' && status !== 'elimination_result') || !match?.id) return;
    if (!isPvpGroupEmojiDriver(PVP_GROUP_MODE_ELIMINATION, match)) return;
    if (!rememberPvpGroupBotEmojiKey(`${match.id}_${status}_${match.result_battle_no || match.battle_no}`)) return;
    const plan = status === 'elimination_result'
      ? planPvpGroupBotEliminationEmojis(match)
      : planPvpGroupBotRoundEmojis(match, PVP_GROUP_MODE_ELIMINATION);
    queuePvpGroupBotEmojiPlan(PVP_GROUP_MODE_ELIMINATION, match.id, plan);
  }, [pvpEliminationMatch?.id, pvpEliminationMatch?.status, pvpEliminationMatch?.result_battle_no, authUser?.uid]);

  // Tela de resultado final: os bots comemoram ou cumprimentam assim que ela abre.
  useEffect(() => {
    const mode = pvpGroupResultScreenMode;
    if (!mode) return;
    const match = mode === PVP_GROUP_MODE_TEAM ? pvpTeamMatch : pvpEliminationMatch;
    if (String(match?.status || '').trim().toLowerCase() !== 'finished' || !match?.id) return;
    if (!isPvpGroupEmojiDriver(mode, match)) return;
    if (!rememberPvpGroupBotEmojiKey(`${match.id}_final`)) return;
    queuePvpGroupBotEmojiPlan(mode, match.id, planPvpGroupBotFinalEmojis(match, mode));
  }, [
    pvpGroupResultScreenMode,
    pvpTeamMatch?.id,
    pvpTeamMatch?.status,
    pvpEliminationMatch?.id,
    pvpEliminationMatch?.status,
    authUser?.uid
  ]);

  // Conversa de fundo dos bots enquanto o canal de emojis está aberto.
  useEffect(() => {
    const matchId = String(pvpTeamMatch?.id || '').trim();
    if (!matchId || !pvpTeamEmojiChannelOpen || typeof window === 'undefined') return undefined;
    const intervalId = window.setInterval(() => {
      tickPvpGroupBotAmbientEmoji(PVP_GROUP_MODE_TEAM, pvpGroupAmbientAnswersRef.current.team);
    }, PVP_GROUP_BOT_AMBIENT_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [pvpTeamMatch?.id, pvpTeamEmojiChannelOpen, authUser?.uid]);

  useEffect(() => {
    const matchId = String(pvpEliminationMatch?.id || '').trim();
    if (!matchId || !pvpEliminationEmojiChannelOpen || typeof window === 'undefined') return undefined;
    const intervalId = window.setInterval(() => {
      tickPvpGroupBotAmbientEmoji(PVP_GROUP_MODE_ELIMINATION, pvpGroupAmbientAnswersRef.current.elimination);
    }, PVP_GROUP_BOT_AMBIENT_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [pvpEliminationMatch?.id, pvpEliminationEmojiChannelOpen, authUser?.uid]);

  useEffect(() => {
    schedulePvpGroupFirstAnswerEmojis(PVP_GROUP_MODE_TEAM, pvpTeamMatch, pvpTeamAnswers);
  }, [pvpTeamMatch?.id, pvpTeamMatch?.status, pvpTeamMatch?.battle_no, pvpTeamAnswers, authUser?.uid]);

  useEffect(() => {
    schedulePvpGroupFirstAnswerEmojis(PVP_GROUP_MODE_ELIMINATION, pvpEliminationMatch, pvpEliminationAnswers);
  }, [pvpEliminationMatch?.id, pvpEliminationMatch?.status, pvpEliminationMatch?.battle_no, pvpEliminationAnswers, authUser?.uid]);

  useEffect(() => {
    const match = pvpEliminationMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    const matchId = String(match?.id || '').trim();
    const myUserId = String(authUser?.uid || '').trim();
    const eliminatedUserId = String(match?.eliminated_user_id || '').trim();
    if (status !== 'elimination_result' || !matchId || !myUserId || eliminatedUserId !== myUserId) return;
    // Eliminação final (vice): a tela de resultado já abre em instantes.
    if (String(match?.next_status || '').trim().toLowerCase() === 'finished') return;
    if (String(match?.eliminated_reason || '').trim().toLowerCase() === 'exit') return;
    if (pvpEliminationResultReward) return;
    if (dismissedPvpEliminationExitPromptIdsRef.current.has(matchId)) return;
    const placement = getPvpEliminationPlacementForUser(match, myUserId);
    if (placement <= 0) return;
    const placementLabel = getPvpEliminationPlacementLabel(placement);
    const eliminatedMember = getPvpEliminationMemberById(match, myUserId);
    setPvpEliminationExitPrompt({
      matchId,
      placement,
      placementLabel,
      nickname: eliminatedMember?.nickname || profile?.nickname || 'Jogador'
    });
  }, [pvpEliminationMatch?.id, pvpEliminationMatch?.updated_at, pvpEliminationMatch?.status, authUser?.uid, pvpEliminationResultReward, profile?.nickname]);

  useEffect(() => {
    if (screen === 'home') return;
    setPlayerHistoryOpen(false);
  }, [screen]);

  useEffect(() => {
    const storageUserId = String(authUser?.uid || 'guest').trim() || 'guest';
    setPvpAreaPreferenceReady(false);
    setPlayerQuizHistoryEntries(readPlayerQuizHistoryLocal(storageUserId));
  }, [authUser?.uid]);

  useEffect(() => {
    const storageUserId = String(authUser?.uid || 'guest').trim() || 'guest';
    if (pvpAreaPreferenceLoadedRef.current === storageUserId) return;
    pvpAreaPreferenceLoadedRef.current = storageUserId;

    const storedArea = readPvpKnowledgeAreaLocal(storageUserId);
    if (storedArea && KNOWLEDGE_AREAS.some((area) => area.id === storedArea)) {
      setPvpKnowledgeArea(storedArea);
      setArenaKaCarouselIndex(getKnowledgeAreaIndex(storedArea));
      setPvpConfig((prev) => {
        const preferredLanguage = getPreferredLanguageByKnowledgeArea(storedArea, prev?.language || '');
        const preferredTopics = getTopicsByLanguage(TOPICS, preferredLanguage);
        return ensureValidPvpConfig({
          ...prev,
          language: preferredLanguage || prev?.language || '',
          topic: preferredTopics[0]?.id || prev?.topic || '',
          difficulty: getPvpQueueDifficultyFromConfig(prev, progressRef.current),
          area: storedArea
        });
      });
    }
    setPvpAreaPreferenceReady(true);
  }, [authUser?.uid]);

  useEffect(() => {
    const storageUserId = String(authUser?.uid || 'guest').trim() || 'guest';
    if (!pvpAreaPreferenceReady) return;
    if (!KNOWLEDGE_AREAS.some((area) => area.id === pvpKnowledgeArea)) return;
    writePvpKnowledgeAreaLocal(storageUserId, pvpKnowledgeArea);
  }, [authUser?.uid, pvpAreaPreferenceReady, pvpKnowledgeArea]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    shopDataRef.current = shopData;
  }, [shopData]);

  useEffect(() => {
    browserOnlineRef.current = browserOnline;
  }, [browserOnline]);

  useEffect(() => {
    realtimeConnectedRef.current = realtimeConnected;
  }, [realtimeConnected]);

  useEffect(() => {
    realtimeConnectionSeenRef.current = realtimeConnectionSeen;
  }, [realtimeConnectionSeen]);

  useEffect(() => {
    pvpEmojiCooldownUntilRef.current = Math.max(0, Number(pvpEmojiCooldownUntilMs || 0));
  }, [pvpEmojiCooldownUntilMs]);

  // Na tela de resultado o relógio do PvP está parado: durante a pausa anti-spam dos
  // emojis ele anda para a contagem da pausa nos botões aparecer e terminar.
  useEffect(() => {
    const untilMs = Math.max(0, Number(pvpEmojiCooldownUntilMs || 0));
    if (!untilMs || untilMs <= Date.now()) return undefined;
    const timer = setInterval(() => {
      setPvpClockMs(Date.now());
      if (Date.now() >= untilMs) clearInterval(timer);
    }, 150);
    return () => clearInterval(timer);
  }, [pvpEmojiCooldownUntilMs]);

  useEffect(() => {
    return () => {
      clearPvpRoundResultFeedbackTimer(true);
    };
  }, []);

  useEffect(() => {
    if (pvpState.status !== 'queueing') return;
    if (!authUser?.uid) return;
    let cancelled = false;

    const runWarmup = (force = false, reason = 'queue_keepalive') => {
      if (cancelled) return;
      const safeDifficulty = getPvpQueueDifficultyFromConfig(pvpConfig, progress);
      prepareBotForQueue(safeDifficulty, reason, force).catch(() => null);
    };

    runWarmup(true, 'queue_effect_start');
    const timer = setInterval(() => {
      runWarmup(false, 'queue_effect_keepalive');
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pvpState.status, authUser?.uid, pvpConfig?.difficulty, progress?.pvpPoints]);

  useEffect(() => {
    const matchId = String(pvpState.matchId || pvpState.match?.id || '').trim();
    if (!matchId) {
      setLatestPvpEmojiEvent(null);
      setPvpEmojiCooldownUntilMs(0);
      pvpSeenEmojiEventIdsRef.current = new Set();
      pvpSeenEmojiEventOrderRef.current = [];
      pvpEmojiSendQueueRef.current = [];
      pvpEmojiSendBusyRef.current = false;
      pvpEmojiSendCountRef.current = 0;
      pvpEmojiSpamWindowRef.current = [];
      pvpEmojiCooldownUntilRef.current = 0;
      pvpRealtimeMatchUpdateAtRef.current = 0;
      pvpRealtimeAnswersUpdateAtRef.current = 0;
      return;
    }
    setLatestPvpEmojiEvent(null);
    setPvpEmojiCooldownUntilMs(0);
    pvpSeenEmojiEventIdsRef.current = new Set();
    pvpSeenEmojiEventOrderRef.current = [];
    pvpEmojiSendQueueRef.current = [];
    pvpEmojiSendBusyRef.current = false;
    pvpEmojiSendCountRef.current = 0;
    pvpEmojiSpamWindowRef.current = [];
    pvpEmojiCooldownUntilRef.current = 0;
    pvpRealtimeMatchUpdateAtRef.current = Date.now();
    pvpRealtimeAnswersUpdateAtRef.current = Date.now();
  }, [pvpState.matchId, pvpState.match?.id]);

  useEffect(() => {
    return () => {
      if (pvpMatchFoundTransitionTimerRef.current) {
        clearTimeout(pvpMatchFoundTransitionTimerRef.current);
        pvpMatchFoundTransitionTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    const matchId = String(pvpState.matchId || pvpState.match?.id || '').trim();
    if (!matchId) {
      closePvpMatchFoundTransition(true);
      return;
    }
    if (safeStatus !== 'pending_accept') {
      closePvpMatchFoundTransition(false);
      return;
    }
    if (pvpMatchFoundTransitionShownRef.current === matchId) return;
    startPvpMatchFoundTransition(matchId);
  }, [pvpState.status, pvpState.matchId, pvpState.match?.id]);

  useEffect(() => {
    audioSettingsRef.current = audioSettings;
  }, [audioSettings]);

  useEffect(() => {
    menuTrackIndexRef.current = menuTrackIndex;
  }, [menuTrackIndex]);

  useEffect(() => {
    battleTrackIndexRef.current = battleTrackIndex;
  }, [battleTrackIndex]);

  useEffect(() => {
    const menuTotal = Math.max(1, MENU_MUSIC_TRACKS.length);
    const battleTotal = Math.max(1, BATTLE_MUSIC_TRACKS.length);
    const randomMenuIndex = Math.floor(Math.random() * menuTotal);
    const randomBattleIndex = Math.floor(Math.random() * battleTotal);
    menuTrackIndexRef.current = randomMenuIndex;
    battleTrackIndexRef.current = randomBattleIndex;
    setMenuTrackIndex(randomMenuIndex);
    setBattleTrackIndex(randomBattleIndex);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => {
    if (leagueTransitionTimerRef.current) {
      clearTimeout(leagueTransitionTimerRef.current);
      leagueTransitionTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const uid = String(authUser?.uid || '').trim();
    if (!uid) {
      leagueSnapshotRef.current = { userId: '', pveKey: '', pvpKey: '' };
      setLeagueTransition((prev) => (
        prev.visible
          ? { ...prev, visible: false, changes: [] }
          : prev
      ));
      return;
    }
    if (!progressReady) return;

    const currentSnapshot = buildLeagueSnapshot(progress, uid);
    const cachedSnapshot = leagueSnapshotRef.current && typeof leagueSnapshotRef.current === 'object'
      ? leagueSnapshotRef.current
      : { userId: '', pveKey: '', pvpKey: '' };
    const needsStoredBaseline = String(cachedSnapshot.userId || '') !== uid
      || !String(cachedSnapshot.pveKey || '').trim()
      || !String(cachedSnapshot.pvpKey || '').trim();
    const previousSnapshot = needsStoredBaseline
      ? (readLeagueSnapshotLocal(uid) || null)
      : cachedSnapshot;

    if (!previousSnapshot || !String(previousSnapshot.userId || '').trim()) {
      writeLeagueSnapshotLocal(uid, currentSnapshot);
      leagueSnapshotRef.current = currentSnapshot;
      return;
    }

    const changes = [];
    const previousPveLeague = getLeagueMetaByKey(previousSnapshot.pveKey);
    const currentPveLeague = getLeagueMetaByKey(currentSnapshot.pveKey);
    if (previousPveLeague.key !== currentPveLeague.key) {
      changes.push({
        mode: 'pve',
        modeLabel: 'PvE',
        from: previousPveLeague,
        to: currentPveLeague,
        direction: getLeagueRankByKey(currentPveLeague.key) > getLeagueRankByKey(previousPveLeague.key) ? 'up' : 'down'
      });
    }

    const previousPvpLeague = getLeagueMetaByKey(previousSnapshot.pvpKey);
    const currentPvpLeague = getLeagueMetaByKey(currentSnapshot.pvpKey);
    if (previousPvpLeague.key !== currentPvpLeague.key) {
      changes.push({
        mode: 'pvp',
        modeLabel: 'PvP',
        from: previousPvpLeague,
        to: currentPvpLeague,
        direction: getLeagueRankByKey(currentPvpLeague.key) > getLeagueRankByKey(previousPvpLeague.key) ? 'up' : 'down'
      });
    }

    writeLeagueSnapshotLocal(uid, currentSnapshot);
    leagueSnapshotRef.current = currentSnapshot;

    if (!changes.length) return;

    const promotionCount = changes.filter((change) => change.direction === 'up').length;
    const downgradeCount = changes.filter((change) => change.direction === 'down').length;
    const title = promotionCount === changes.length
      ? 'Nova liga alcançada'
      : (downgradeCount === changes.length ? 'Liga reclassificada' : 'Classificação atualizada');
    const subtitle = promotionCount === changes.length
      ? 'Seu desempenho acaba de elevar seu patamar no CodeQuiz.'
      : (downgradeCount === changes.length
        ? 'Sua classificação foi atualizada de acordo com a pontuação atual.'
        : 'Seu perfil foi recalculado e as ligas já estão sincronizadas.');

    setLeagueTransition({
      visible: true,
      title,
      subtitle,
      changes
    });
  }, [authUser?.uid, progressReady, progress?.rankingPoints, progress?.pvpPoints]);

  useEffect(() => {
    if (!leagueTransition.visible) {
      if (leagueTransitionTimerRef.current) {
        clearTimeout(leagueTransitionTimerRef.current);
        leagueTransitionTimerRef.current = null;
      }
      return;
    }
    if (leagueTransitionTimerRef.current) {
      clearTimeout(leagueTransitionTimerRef.current);
    }
    leagueTransitionTimerRef.current = setTimeout(() => {
      setLeagueTransition((prev) => ({ ...prev, visible: false }));
      leagueTransitionTimerRef.current = null;
    }, LEAGUE_TRANSITION_VISIBLE_MS);
    return () => {
      if (leagueTransitionTimerRef.current) {
        clearTimeout(leagueTransitionTimerRef.current);
        leagueTransitionTimerRef.current = null;
      }
    };
  }, [leagueTransition.visible, leagueTransition.changes]);

  useEffect(() => {
    if (!queueActionBusy) {
      queueActionBusyStartedAtRef.current = 0;
      if (queueActionPhase) {
        setQueueActionPhase('');
      }
      return;
    }
    if (!queueActionBusyStartedAtRef.current) {
      queueActionBusyStartedAtRef.current = Date.now();
    }
    const watchdogTimer = setTimeout(() => {
      if (!queueActionBusy) return;
      const elapsedMs = Math.max(0, Date.now() - Math.max(0, Number(queueActionBusyStartedAtRef.current || 0)));
      queueFlowLog('queue_action_busy:watchdog_reset', {
        userId: authUser?.uid || '',
        status: pvpStateRef.current?.status || '',
        elapsedMs
      });
      setQueueActionBusy(false);
      setQueueActionHint('');
    }, UI_ACTION_WATCHDOG_MS);
    return () => {
      clearTimeout(watchdogTimer);
    };
  }, [queueActionBusy, authUser?.uid, queueActionPhase]);

  useEffect(() => {
    if (queueActionBusy) return;
    if (!queueActionHint) return;
    const timer = setTimeout(() => {
      setQueueActionHint('');
    }, 4200);
    return () => clearTimeout(timer);
  }, [queueActionBusy, queueActionHint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncBrowserConnection = () => {
      setBrowserOnline(window.navigator?.onLine !== false);
    };
    syncBrowserConnection();
    window.addEventListener('online', syncBrowserConnection);
    window.addEventListener('offline', syncBrowserConnection);
    return () => {
      window.removeEventListener('online', syncBrowserConnection);
      window.removeEventListener('offline', syncBrowserConnection);
    };
  }, []);

  useEffect(() => {
    const connectionRef = ref(firebaseDb, '.info/connected');
    const unsubscribe = onValue(
      connectionRef,
      (snap) => {
        setRealtimeConnectionSeen(true);
        setRealtimeConnected(snap.val() === true);
      },
      () => {
        setRealtimeConnectionSeen(true);
        setRealtimeConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const queueing = String(pvpState.status || '').trim().toLowerCase() === 'queueing';
    const disconnected = !browserOnline || (realtimeConnectionSeen && !realtimeConnected);
    const disconnectGraceMs = getQueueDisconnectGraceMs();
    const disconnectGraceSec = Math.max(2, Math.round(disconnectGraceMs / 1000));

    if (!queueing) {
      if (queueDisconnectCancelTimerRef.current) {
        clearTimeout(queueDisconnectCancelTimerRef.current);
        queueDisconnectCancelTimerRef.current = null;
      }
      queueDisconnectStartedAtRef.current = 0;
      return;
    }

    if (!disconnected) {
      if (queueDisconnectCancelTimerRef.current) {
        clearTimeout(queueDisconnectCancelTimerRef.current);
        queueDisconnectCancelTimerRef.current = null;
        queueFlowLog('queue_connection_watch:restored', {
          userId: authUser?.uid || ''
        });
      }
      queueDisconnectStartedAtRef.current = 0;
      return;
    }

    if (queueDisconnectCancelTimerRef.current) return;
    queueDisconnectStartedAtRef.current = Date.now();
    setQueueActionHint('');
    queueFlowLog('queue_connection_watch:lost', {
      userId: authUser?.uid || ''
    });

    queueDisconnectCancelTimerRef.current = setTimeout(() => {
      queueDisconnectCancelTimerRef.current = null;
      const runDisconnectFallback = async () => {
        const stillQueueing = String(pvpStateRef.current?.status || '').trim().toLowerCase() === 'queueing';
        const stillDisconnected = (
          browserOnlineRef.current === false
          || (realtimeConnectionSeenRef.current && !realtimeConnectedRef.current)
        );
        if (!stillQueueing || !stillDisconnected) return;

        const safeUid = String(authUser?.uid || '').trim();
        if (safeUid) {
          const liveMatch = await withTimeout(
            findOpenMatchForUser(safeUid).catch(() => null),
            PVP_QUEUE_DISCONNECT_RECOVERY_TIMEOUT_MS,
            'queue_disconnect_recover_match'
          ).catch(() => null);
          if (liveMatch?.id) {
            queueFlowLog('queue_connection_watch:recover_match', {
              userId: safeUid,
              matchId: liveMatch.id
            });
            setQueueActionHint('');
            await attachToMatch(liveMatch.id).catch(() => null);
            return;
          }
        }

        if (safeUid) {
          const queueEntry = await withTimeout(
            getQueueEntryByUser(safeUid).catch(() => null),
            PVP_QUEUE_DISCONNECT_RECOVERY_TIMEOUT_MS,
            'queue_disconnect_recover_queue'
          ).catch(() => null);
          if (queueEntry && String(queueEntry.status || '').trim().toLowerCase() === 'waiting') {
            applyBackendQueueJoinConfirmation(queueEntry, {
              force: true,
              reason: 'queue_connection_watch:queue_kept'
            });
            queueFlowLog('queue_connection_watch:queue_kept', {
              userId: safeUid
            });
            setQueueActionHint('');
            return;
          }
        }

        const elapsedMs = Math.max(0, Date.now() - Math.max(0, Number(queueDisconnectStartedAtRef.current || 0)));
        queueFlowLog('queue_connection_watch:auto_cancel', {
          userId: authUser?.uid || '',
          elapsedMs
        });
        setQueueActionHint('');
        cancelPvpQueue({ reason: 'connection_lost' }).catch(() => null);
      };

      void runDisconnectFallback();
    }, disconnectGraceMs);

    return () => {
      if (queueDisconnectCancelTimerRef.current) {
        clearTimeout(queueDisconnectCancelTimerRef.current);
        queueDisconnectCancelTimerRef.current = null;
      }
    };
  }, [pvpState.status, browserOnline, realtimeConnected, realtimeConnectionSeen, authUser?.uid]);

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    const tick = () => {
      if (cancelled) return;
      const baseOnline = Math.max(1, Number(arenaMetrics.online || 1));
      const variance = Math.max(2, Math.round(baseOnline * 0.14));
      const delta = Math.floor(Math.random() * ((variance * 2) + 1)) - variance;
      setArenaOnlineDisplay(Math.max(1, baseOnline + delta));
      const delayMs = 1400 + Math.floor(Math.random() * 2600);
      timer = setTimeout(tick, delayMs);
    };
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [arenaMetrics.online]);

  useEffect(() => {
    if (!matchAcceptBusy) {
      matchAcceptBusyStartedAtRef.current = 0;
      return;
    }
    if (!matchAcceptBusyStartedAtRef.current) {
      matchAcceptBusyStartedAtRef.current = Date.now();
    }
    const timer = setTimeout(() => {
      if (!matchAcceptBusy) return;
      const elapsedMs = Math.max(0, Date.now() - Math.max(0, Number(matchAcceptBusyStartedAtRef.current || 0)));
      queueFlowLog('match_accept_busy:watchdog_reset', {
        userId: authUser?.uid || '',
        matchId: pvpStateRef.current?.matchId || '',
        elapsedMs
      });
      setMatchAcceptBusy(false);
    }, UI_ACTION_WATCHDOG_MS);
    return () => clearTimeout(timer);
  }, [matchAcceptBusy, authUser?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onWindowError = (event) => {
      const message = String(event?.message || event?.error?.message || 'window_error').trim();
      const filename = String(event?.filename || '').trim();
      const line = Math.max(0, Number(event?.lineno || 0));
      const sourceTail = filename ? filename.slice(-80) : 'unknown_source';
      appendQueueDebugLogLine(
        `[ERR ${new Date().toISOString()}] ${message || 'window_error'} | src=${sourceTail}:${line}`
      );
    };

    const onUnhandledRejection = (event) => {
      const reasonRaw = event?.reason;
      const reasonText = typeof reasonRaw === 'string'
        ? reasonRaw
        : (reasonRaw?.message || JSON.stringify(reasonRaw || 'unhandled_rejection'));
      const safeReason = String(reasonText || 'unhandled_rejection').slice(0, 220);
      appendQueueDebugLogLine(
        `[REJ ${new Date().toISOString()}] ${safeReason}`
      );
    };

    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(AUDIO_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setAudioSettings(normalizeAudioSettings(parsed));
    } catch {
      // ignore invalid local storage payload
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audioSettings));
    } catch {
      // ignore local storage write failure
    }
  }, [audioSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = String(authUser?.uid || 'guest').trim() || 'guest';
    const key = `${SHOP_UI_STATE_STORAGE_PREFIX}_${uid}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        setShopTab('frame');
        setShopOwnershipFilter('all');
        setShopCategoryOpen(buildDefaultShopCategoryState());
        return;
      }
      const parsed = JSON.parse(raw);
      setShopTab(normalizeShopTab(parsed?.tab));
      setShopOwnershipFilter(normalizeShopOwnershipFilter(parsed?.ownershipFilter));
      setShopCategoryOpen(normalizeShopCategoryOpenState(parsed?.categoryOpen));
    } catch {
      setShopTab('frame');
      setShopOwnershipFilter('all');
      setShopCategoryOpen(buildDefaultShopCategoryState());
    }
  }, [authUser?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = String(authUser?.uid || 'guest').trim() || 'guest';
    const key = `${SHOP_UI_STATE_STORAGE_PREFIX}_${uid}`;
    const payload = {
      tab: normalizeShopTab(shopTab),
      ownershipFilter: normalizeShopOwnershipFilter(shopOwnershipFilter),
      categoryOpen: normalizeShopCategoryOpenState(shopCategoryOpen),
      updatedAt: nowIso()
    };
    try {
      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // ignore storage write failure
    }
  }, [shopTab, shopOwnershipFilter, shopCategoryOpen, authUser?.uid]);

  useEffect(() => {
    const normalizedTab = normalizeShopTab(shopTab);
    const normalizedOwnershipFilter = normalizeShopOwnershipFilter(shopOwnershipFilter);
    const normalizedState = normalizeShopCategoryOpenState(shopCategoryOpen);
    if (normalizedTab !== shopTab) {
      setShopTab(normalizedTab);
      return;
    }
    if (normalizedOwnershipFilter !== shopOwnershipFilter) {
      setShopOwnershipFilter(normalizedOwnershipFilter);
      return;
    }
    if (!isShopCategoryOpenStateEqual(shopCategoryOpen, normalizedState)) {
      setShopCategoryOpen(normalizedState);
    }
  }, [shopTab, shopOwnershipFilter, shopCategoryOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    let changed = false;
    ['swv', 'v', 'app_update'].forEach((param) => {
      if (!url.searchParams.has(param)) return;
      url.searchParams.delete(param);
      changed = true;
    });
    if (!changed) return;
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, '', next || '/');
  }, []);

  useEffect(() => {
    if (authUser) return;
    const immediateUser = firebaseAuth.currentUser;
    if (immediateUser) setAuthUser(immediateUser);
  }, [authUser]);

  useEffect(() => {
    // O container so existe depois do preload (as telas nao renderizam durante o boot).
    if (screen !== 'login' || booting || authLoading || !progressReady || !shopReady) return undefined;
    const container = googleButtonContainerRef.current;
    if (!container) return undefined;
    return renderGoogleSignInButton(container, {
      onStart: () => {
        googleSignInRef.current = true;
        setGoogleSignInBusy(true);
        setAuthTransition({
          visible: true,
          title: 'Entrando na sua conta',
          subtitle: 'Estamos preparando o seu perfil...'
        });
      },
      onError: (error) => {
        console.error('sign in error:', error);
        googleSignInRef.current = false;
        setGoogleSignInBusy(false);
        setAuthTransition({ visible: false, title: '', subtitle: '' });
        showToast(String(error?.code || '').includes('popup-blocked')
          ? 'Permita popups deste site para entrar com o Google.'
          : 'Não foi possível entrar com Google.');
        playSfx('error');
      },
      onFallback: () => {
        showToast('Toque de novo em "Continuar com o Google" para entrar.');
      }
    });
  }, [screen, booting, authLoading, progressReady, shopReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let persisted = '';
    try {
      persisted = String(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) || '').trim();
    } catch {
      persisted = '';
    }

    if (persisted === 'accepted' || persisted === 'essential') {
      setCookieConsent(persisted);
      return;
    }

    const fromCookie = readCookieConsentFromDocument();
    if (fromCookie) {
      setCookieConsent(fromCookie);
      try {
        window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, fromCookie);
      } catch {
        // ignore local storage write failure
      }
      return;
    }

    setCookieConsent('pending');
  }, []);

  useEffect(() => {
    const onPress = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest('button')) return;
      playSfx('click');
    };
    document.addEventListener('pointerdown', onPress, true);
    return () => document.removeEventListener('pointerdown', onPress, true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let googleFlowTimer = null;
    let bootstrapGuardTimer = null;

    if (typeof window !== 'undefined') {
      bootstrapGuardTimer = window.setTimeout(() => {
        if (cancelled || authBootstrapDoneRef.current) return;
        authBootstrapDoneRef.current = true;
        setProgressReady(true);
        setShopReady(true);
        setAuthLoading(false);
        setBooting(false);
        if (!firebaseAuth.currentUser) {
          setScreen('login');
          if (googleSignInRef.current) {
            googleSignInRef.current = false;
            setGoogleSignInBusy(false);
            setAuthTransition({ visible: false, title: '', subtitle: '' });
          }
        }
      }, AUTH_BOOTSTRAP_GUARD_MS);
    }

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (cancelled) return;
      const isInitialPass = !authBootstrapDoneRef.current;
      const isGoogleFlow = googleSignInRef.current;
      let nextBootScreen = 'home';

      setAuthUser(user);
      setProgressSyncEnabled(false);
      if (isInitialPass) {
        setProgressReady(false);
        setShopReady(false);
      }

      if (!user) {
        setProfile(null);
        setOnboardingRequired(false);
        setProgress(defaultProgress());
        setShopData(defaultShopData());
        if (isGoogleFlow) {
          googleSignInRef.current = false;
          setGoogleSignInBusy(false);
          setAuthTransition({ visible: false, title: '', subtitle: '' });
        }
        setScreen('login');
        setProgressReady(true);
        setShopReady(true);
        if (isInitialPass) {
          authBootstrapDoneRef.current = true;
          if (bootstrapGuardTimer && typeof window !== 'undefined') {
            window.clearTimeout(bootstrapGuardTimer);
            bootstrapGuardTimer = null;
          }
          setAuthLoading(false);
          setBooting(false);
        }
        return;
      }

      if (isGoogleFlow) {
        setAuthTransition({
          visible: true,
          title: 'Validando sua conta',
          subtitle: 'Sincronizando perfil e progresso...'
        });
      }

      try {
        await withTimeout(
          purgeBotLocalCacheForGlobalSync(user.uid).catch(() => false),
          1200,
          'purge_bot_local_cache'
        ).catch(() => false);
        const ensured = await withTimeout(ensureUserProfile(user), AUTH_OPERATION_TIMEOUT_MS, 'ensureUserProfile');
        if (cancelled) return;
        const requiresProfileSetup = Boolean(
          ensured?.onboarding_required === true
          || !validateNicknameInput(String(ensured?.nickname || '').trim()).ok
        );
        nextBootScreen = requiresProfileSetup ? 'nickname-setup' : 'home';
        setOnboardingRequired(requiresProfileSetup);

        setProfile(ensured);
        setProfileDraft({
          nickname: ensured.nickname || (requiresProfileSetup ? '' : 'Jogador'),
          full_name: ensured.full_name || ''
        });

        const [stats, remoteShop, legacySnapshot] = await Promise.all([
          withTimeout(getUserStats(user.uid), AUTH_OPERATION_TIMEOUT_MS, 'getUserStats').catch(() => null),
          withTimeout(getUserShop(user.uid), AUTH_OPERATION_TIMEOUT_MS, 'getUserShop').catch(() => null),
          withTimeout(
            getLegacyCloudSnapshot(user.uid),
            AUTH_OPERATION_TIMEOUT_MS,
            'getLegacyCloudSnapshot'
          ).catch(() => null)
        ]);

        if (cancelled) return;

        const remoteProgressBaseline = mergeProgressWithRemoteStats(defaultProgress(), stats || null);
        const remoteSnapshot = buildProgressSnapshot(remoteProgressBaseline);
        progressSyncGuardRef.current = {
          remoteHasMeaningful: remoteSnapshot.meaningful,
          remoteUpdatedAtMs: Math.max(
            remoteSnapshot.updatedAtMs,
            Math.max(0, Number(stats?.progress_updated_at_ms || 0)),
            Math.max(0, Number(stats?.pvp_recalculated_at_ms || 0))
          ),
          remoteSignalScore: remoteSnapshot.signalScore
        };

        const localProgress = loadProgress(user.uid);
        if (!hasMeaningfulProgress(localProgress) && remoteSnapshot.meaningful) {
          queueFlowLog('progress_validator:local_cache_missing_remote_available', {
            userId: user.uid
          });
        }
        const localUpdatedMs = Math.max(0, Number(localProgress?.updatedAt || 0));
        const remoteUpdatedMs = Math.max(0, Number(stats?.progress_updated_at_ms || 0));
        const remotePvpRecalcMs = Math.max(0, Number(stats?.pvp_recalculated_at_ms || 0));
        const hasServerForcedReset = remotePvpRecalcMs > (localUpdatedMs + PROGRESS_FORCED_RESET_GUARD_MS);
        const shouldOverwriteCloudWithLocal = localUpdatedMs > remoteUpdatedMs && localUpdatedMs > remotePvpRecalcMs;
        let mergedProgress = shouldOverwriteCloudWithLocal
          ? normalizeProgress(localProgress)
          : mergeProgressWithRemoteStats(localProgress, stats);
        if (hasServerForcedReset) {
          mergedProgress = mergeProgressWithRemoteStats(defaultProgress(), stats);
          queueFlowLog('progress_forced_reset:adopt_remote', {
            userId: user.uid,
            localUpdatedMs,
            remotePvpRecalcMs
          });
        }
        const legacyProgress = legacySnapshot?.progress && typeof legacySnapshot.progress === 'object'
          ? normalizeProgress(legacySnapshot.progress)
          : null;
        const shouldMigrateLegacyProgress = (
          legacyProgress
          && hasMeaningfulProgress(legacyProgress)
          && !hasMeaningfulProgress(mergedProgress)
        );
        if (shouldMigrateLegacyProgress) {
          const legacyStats = buildStatsFromLegacyProgress(legacyProgress, mergedProgress.coins);
          mergedProgress = mergeProgressWithRemoteStats(mergedProgress, legacyStats);
        }
        setProgress(mergedProgress);
        try {
          saveProgress(user.uid, mergedProgress);
        } catch {
          // ignore local storage write failures
        }

        const localShop = loadShopData(user.uid);
        const profileShopFallback = buildShopFallbackFromProfile(ensured);
        let mergedShop = mergeShopData(localShop || {}, remoteShop || {});
        mergedShop = mergeShopData(mergedShop, profileShopFallback);
        if (legacySnapshot?.shop && typeof legacySnapshot.shop === 'object') {
          mergedShop = mergeShopData(mergedShop, legacySnapshot.shop);
        }
        mergedShop = saveShopData(user.uid, mergedShop);
        setShopData(mergedShop);

        setProgressSyncEnabled(true);
        setProgressReady(true);
        setShopReady(true);

        withTimeout(saveUserShop(user.uid, mergedShop), AUTH_OPERATION_TIMEOUT_MS, 'saveUserShop')
          .catch((error) => {
            console.error('bootstrap shop sync failed:', error);
          });
        withTimeout(
          upsertStatsFromProgress(user.uid, mergedProgress),
          AUTH_OPERATION_TIMEOUT_MS,
          'upsertStatsFromProgress'
        ).catch((error) => {
          console.error('bootstrap stats sync failed:', error);
        });
      } catch (error) {
        console.error('auth bootstrap failed:', error);

        const recoveredProfile = user?.uid
          ? await withTimeout(
            getUserProfile(user.uid),
            2500,
            'getUserProfileRecovery'
          ).catch(() => null)
          : null;
        const recoveryStats = user?.uid
          ? await withTimeout(
            getUserStats(user.uid).catch(() => null),
            2400,
            'getUserStatsRecovery'
          ).catch(() => null)
          : null;

        if (recoveryStats && typeof recoveryStats === 'object') {
          const remoteProgressBaseline = mergeProgressWithRemoteStats(defaultProgress(), recoveryStats);
          const remoteSnapshot = buildProgressSnapshot(remoteProgressBaseline);
          progressSyncGuardRef.current = {
            remoteHasMeaningful: remoteSnapshot.meaningful,
            remoteUpdatedAtMs: Math.max(
              remoteSnapshot.updatedAtMs,
              Math.max(0, Number(recoveryStats?.progress_updated_at_ms || 0)),
              Math.max(0, Number(recoveryStats?.pvp_recalculated_at_ms || 0))
            ),
            remoteSignalScore: remoteSnapshot.signalScore
          };
        }

        if (recoveredProfile) {
          const requiresProfileSetup = Boolean(
            recoveredProfile?.onboarding_required === true
            || !validateNicknameInput(String(recoveredProfile?.nickname || '').trim()).ok
          );
          nextBootScreen = requiresProfileSetup ? 'nickname-setup' : 'home';
          setOnboardingRequired(requiresProfileSetup);
          setProfile(recoveredProfile);
          setProfileDraft({
            nickname: recoveredProfile.nickname || (requiresProfileSetup ? '' : 'Jogador'),
            full_name: recoveredProfile.full_name || ''
          });
        } else {
          const code = String(error?.code || '').trim().toLowerCase();
          const label = String(error?.label || '').trim().toLowerCase();
          const message = String(error?.message || '').trim().toLowerCase();
          const isTransient =
            code === 'app/timeout'
            || code.includes('network')
            || label.includes('timeout')
            || message.includes('timeout')
            || message.includes('network');
          if (!isTransient) {
            setToast('Falha ao carregar perfil.');
          }
          setOnboardingRequired(false);
        }

        const fallbackLocalProgress = user?.uid
          ? normalizeProgress(loadProgress(user.uid))
          : defaultProgress();
        const fallbackLocalShop = user?.uid
          ? loadShopData(user.uid)
          : defaultShopData();
        setProgress(fallbackLocalProgress);
        setShopData(fallbackLocalShop);
        setProgressSyncEnabled(hasMeaningfulProgress(fallbackLocalProgress));
        setProgressReady(true);
        setShopReady(true);
      } finally {
        if (!cancelled) {
          setScreen(nextBootScreen);
          if (googleSignInRef.current) {
            setAuthTransition({
              visible: true,
              title: 'Login concluído',
              subtitle: 'Entrando na sua área...'
            });

            const finishGoogleFlow = () => {
              if (cancelled) return;
              googleSignInRef.current = false;
              setGoogleSignInBusy(false);
              setAuthTransition({ visible: false, title: '', subtitle: '' });
              playSfx('success');
            };

            if (typeof window !== 'undefined') {
              if (googleFlowTimer) window.clearTimeout(googleFlowTimer);
              googleFlowTimer = window.setTimeout(finishGoogleFlow, 280);
            } else {
              finishGoogleFlow();
            }
          }
        }

        if (isInitialPass) {
          authBootstrapDoneRef.current = true;
          if (bootstrapGuardTimer && typeof window !== 'undefined') {
            window.clearTimeout(bootstrapGuardTimer);
            bootstrapGuardTimer = null;
          }
          setAuthLoading(false);
          setBooting(false);
        }
      }
    });

    return () => {
      cancelled = true;
      if (googleFlowTimer && typeof window !== 'undefined') {
        window.clearTimeout(googleFlowTimer);
      }
      if (bootstrapGuardTimer && typeof window !== 'undefined') {
        window.clearTimeout(bootstrapGuardTimer);
      }
      unsub();
    };
  }, []);

  useEffect(() => {
    const candidate = String(profileDraft.nickname || '').trim();
    const validation = validateNicknameInput(candidate);

    if (!candidate) {
      setNicknameAvailability({
        status: 'idle',
        available: false,
        message: onboardingRequired ? 'Defina seu apelido para continuar.' : NICKNAME_RULE_COPY
      });
      return;
    }

    if (!validation.ok) {
      setNicknameAvailability({
        status: 'invalid',
        available: false,
        message: validation.errorMessage
      });
      return;
    }

    const currentNickname = String(profile?.nickname || '').trim();
    if (validation.nickname === currentNickname) {
      setNicknameAvailability({
        status: 'current',
        available: true,
        message: onboardingRequired
          ? 'Apelido pronto para concluir seu perfil.'
          : 'Este é o apelido atual da sua conta.'
      });
      return;
    }

    if (!activeAuthUser?.uid) {
      setNicknameAvailability({
        status: 'idle',
        available: false,
        message: NICKNAME_RULE_COPY
      });
      return;
    }

    let cancelled = false;
    setNicknameAvailability({
      status: 'checking',
      available: false,
      message: 'Verificando disponibilidade...'
    });

    const timer = setTimeout(async () => {
      const result = await checkNicknameAvailability(validation.nickname, activeAuthUser.uid).catch(() => null);
      if (cancelled) return;

      if (!result?.ok) {
        setNicknameAvailability({
          status: 'invalid',
          available: false,
          message: result?.errorMessage || validation.errorMessage
        });
        return;
      }

      if (result.available) {
        setNicknameAvailability({
          status: 'available',
          available: true,
          message: 'Apelido disponível.'
        });
        return;
      }

      setNicknameAvailability({
        status: 'taken',
        available: false,
        message: result.errorMessage || 'Este apelido já está em uso.'
      });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeAuthUser?.uid, onboardingRequired, profile?.nickname, profileDraft.nickname]);

  useEffect(() => {
    if (!shopReady || !authUser?.uid) return;
    const timer = setTimeout(() => {
      saveShopData(authUser.uid, shopData);
      saveUserShop(authUser.uid, shopData).catch(() => null);
    }, 400);
    return () => clearTimeout(timer);
  }, [shopData, shopReady, authUser?.uid]);

  useEffect(() => {
    if (!shopReady || !authUser?.uid) return;
    const localShop = normalizeShopData(shopData);
    const localOwnedCount = Array.isArray(localShop.owned) ? localShop.owned.length : 0;
    if (localOwnedCount > 3) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const remoteShop = await withTimeout(
        getUserShop(authUser.uid).catch(() => null),
        2400,
        'shop_recovery_fetch'
      ).catch(() => null);
      if (cancelled || !remoteShop || typeof remoteShop !== 'object') return;

      const remoteNormalized = normalizeShopData(remoteShop);
      const merged = normalizeShopData(mergeShopData(localShop, remoteShop));
      const remoteOwnedCount = Array.isArray(remoteNormalized.owned) ? remoteNormalized.owned.length : 0;
      const mergedOwnedCount = Array.isArray(merged.owned) ? merged.owned.length : 0;
      const equippedChanged = (
        String(merged?.equipped?.frame || '') !== String(localShop?.equipped?.frame || '')
        || String(merged?.equipped?.background || '') !== String(localShop?.equipped?.background || '')
        || String(merged?.equipped?.emoji || '') !== String(localShop?.equipped?.emoji || '')
      );
      if (mergedOwnedCount <= localOwnedCount && !equippedChanged) return;

      queueFlowLogThrottled(
        'shop_recovery',
        6000,
        'shop_recovery:restored_remote',
        {
          userId: authUser.uid,
          localOwned: localOwnedCount,
          remoteOwned: remoteOwnedCount
        }
      );
      setShopData(merged);
      try {
        saveShopData(authUser.uid, merged);
      } catch {
        // ignore local storage write failures
      }
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [shopData, shopReady, authUser?.uid]);

  useEffect(() => {
    if (!shopReady || !progressReady || !authUser?.uid) return;
    let cancelled = false;
    let timer = null;

    const reconcile = async (reason = 'interval') => {
      const [remoteStats, remoteShop] = await Promise.all([
        withTimeout(getUserStats(authUser.uid), 2600, 'progress_reconcile_stats').catch(() => null),
        withTimeout(getUserShop(authUser.uid), 2600, 'shop_reconcile_fetch').catch(() => null)
      ]);
      if (cancelled) return;

      const localProgress = normalizeProgress(progressRef.current);
      if (remoteStats && typeof remoteStats === 'object') {
        const remoteResetAtMs = Math.max(0, Number(remoteStats?.pvp_recalculated_at_ms || 0));
        let mergedProgress = mergeProgressWithRemoteStats(localProgress, remoteStats);
        const localSnapshot = buildProgressSnapshot(localProgress);
        const localUpdatedAtMs = Math.max(0, Number(localProgress?.updatedAt || 0));
        const forcedReset = remoteResetAtMs > (localUpdatedAtMs + PROGRESS_FORCED_RESET_GUARD_MS);
        if (forcedReset) {
          mergedProgress = mergeProgressWithRemoteStats(defaultProgress(), remoteStats);
        }
        const mergedSnapshot = buildProgressSnapshot(mergedProgress);
        const remoteUpdatedAtMs = Math.max(
          0,
          Number(remoteStats?.progress_updated_at_ms || 0),
          Number(remoteStats?.pvp_recalculated_at_ms || 0)
        );
        const shouldAdoptBySignalOnly = (
          !localSnapshot.meaningful
          && mergedSnapshot.signalScore > (localSnapshot.signalScore + 1)
        );
        const shouldAdoptProgress = (
          forcedReset
          || (
          remoteUpdatedAtMs > (localUpdatedAtMs + 1200)
          || shouldAdoptBySignalOnly
          )
        );
        if (shouldAdoptProgress) {
          queueFlowLogThrottled(
            'progress_reconcile',
            8000,
            'progress_reconcile:adopt_remote',
            {
              userId: authUser.uid,
              reason,
              localUpdatedAtMs,
              remoteUpdatedAtMs,
              forcedReset
            }
          );
          setProgress(mergedProgress);
          try {
            saveProgress(authUser.uid, mergedProgress);
          } catch {
            // ignore local storage write failures
          }
        }
      }

      if (remoteShop && typeof remoteShop === 'object') {
        const localShop = normalizeShopData(shopDataRef.current);
        const mergedShop = normalizeShopData(mergeShopData(localShop, remoteShop));
        const localOwnedCount = Array.isArray(localShop.owned) ? localShop.owned.length : 0;
        const mergedOwnedCount = Array.isArray(mergedShop.owned) ? mergedShop.owned.length : 0;
        const equippedChanged = (
          String(localShop?.equipped?.frame || '') !== String(mergedShop?.equipped?.frame || '')
          || String(localShop?.equipped?.background || '') !== String(mergedShop?.equipped?.background || '')
          || String(localShop?.equipped?.emoji || '') !== String(mergedShop?.equipped?.emoji || '')
        );
        if (mergedOwnedCount > localOwnedCount || equippedChanged) {
          queueFlowLogThrottled(
            'shop_reconcile',
            8000,
            'shop_reconcile:adopt_remote',
            {
              userId: authUser.uid,
              reason,
              localOwned: localOwnedCount,
              mergedOwned: mergedOwnedCount
            }
          );
          setShopData(mergedShop);
          try {
            saveShopData(authUser.uid, mergedShop);
          } catch {
            // ignore local storage write failures
          }
        }
      }
    };

    reconcile('bootstrap');
    timer = setInterval(() => {
      reconcile('interval');
    }, 15000);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [authUser?.uid, progressReady, shopReady]);

  useEffect(() => {
    if (!shopReady || !progressReady) return;
    const claimedStageSet = new Set(
      (Array.isArray(progress?.achievements) ? progress.achievements : [])
        .map((stageId) => String(stageId || '').trim())
        .filter(Boolean)
    );
    if (!claimedStageSet.size) return;

    const rewardShopItems = [...new Set(
      EVOLUTION_PASS_STAGES.flatMap((stage) => {
        if (!claimedStageSet.has(String(stage?.id || '').trim())) return [];
        const reward = stage?.reward && typeof stage.reward === 'object' ? stage.reward : {};
        return Array.isArray(reward.shopItems) ? reward.shopItems : [];
      })
        .map((itemId) => String(itemId || '').trim())
        .filter(Boolean)
    )];

    if (!rewardShopItems.length) return;
    const ownedSet = new Set(Array.isArray(shopData?.owned) ? shopData.owned : []);
    const missingRewardItems = rewardShopItems.filter((itemId) => !ownedSet.has(itemId));
    if (!missingRewardItems.length) return;

    setShopData((prev) => grantShopItems(prev, missingRewardItems));
  }, [shopReady, progressReady, progress?.achievements, shopData?.owned]);

  useEffect(() => {
    if (!progressReady || !authUser?.uid || !progressSyncEnabled) return;
    const timer = setTimeout(() => {
      const localSnapshot = buildProgressSnapshot(progress);
      const guard = progressSyncGuardRef.current && typeof progressSyncGuardRef.current === 'object'
        ? progressSyncGuardRef.current
        : { remoteHasMeaningful: false, remoteUpdatedAtMs: 0, remoteSignalScore: 0 };
      const remoteClearlyAhead = (
        guard.remoteHasMeaningful
        && Math.max(0, Number(guard.remoteUpdatedAtMs || 0)) > (Math.max(0, Number(localSnapshot.updatedAtMs || 0)) + 1500)
        && Math.max(0, Number(guard.remoteSignalScore || 0)) > (Math.max(0, Number(localSnapshot.signalScore || 0)) + 20)
      );
      if (remoteClearlyAhead) {
        queueFlowLogThrottled(
          'progress_sync_guard',
          6000,
          'progress_sync:blocked_rollback_guard',
          {
            userId: authUser.uid,
            localUpdatedAtMs: localSnapshot.updatedAtMs,
            remoteUpdatedAtMs: guard.remoteUpdatedAtMs
          }
        );
        return;
      }
      try {
        saveProgress(authUser.uid, progress);
      } catch {
        // ignore local storage write failures
      }
      upsertStatsFromProgress(authUser.uid, progress).catch(() => null);
    }, 320);
    return () => clearTimeout(timer);
  }, [progress, progressReady, authUser?.uid, progressSyncEnabled]);

  useEffect(() => {
    if (!progressReady || !authUser?.uid) return;
    const currentSnapshot = buildProgressSnapshot(progress);
    if (currentSnapshot.meaningful) return;

    let cancelled = false;
    const recoverFromRemoteStats = async (reason = 'poll') => {
      if (cancelled || progressRecoveryBusyRef.current) return;
      progressRecoveryBusyRef.current = true;
      try {
        const stats = await withTimeout(
          getUserStats(authUser.uid).catch(() => null),
          2800,
          'progress_recovery_stats'
        ).catch(() => null);
        if (cancelled || !stats || typeof stats !== 'object') return;
        const recoveredProgress = mergeProgressWithRemoteStats(defaultProgress(), stats);
        const remoteSnapshot = buildProgressSnapshot(recoveredProgress);
        progressSyncGuardRef.current = {
          remoteHasMeaningful: remoteSnapshot.meaningful,
          remoteUpdatedAtMs: Math.max(
            remoteSnapshot.updatedAtMs,
            Math.max(0, Number(stats?.progress_updated_at_ms || 0)),
            Math.max(0, Number(stats?.pvp_recalculated_at_ms || 0))
          ),
          remoteSignalScore: remoteSnapshot.signalScore
        };
        if (!remoteSnapshot.meaningful) return;

        setProgress((prev) => {
          const prevSafe = normalizeProgress(prev);
          const prevSnapshot = buildProgressSnapshot(prevSafe);
          if (
            prevSnapshot.meaningful
            && prevSnapshot.updatedAtMs >= remoteSnapshot.updatedAtMs
            && prevSnapshot.signalScore >= remoteSnapshot.signalScore
          ) {
            return prevSafe;
          }
          return recoveredProgress;
        });
        try {
          saveProgress(authUser.uid, recoveredProgress);
        } catch {
          // ignore local storage write failures
        }
        setProgressSyncEnabled(true);
        queueFlowLogThrottled(
          'progress_recovery_restored',
          6000,
          'progress_recovery:restored_remote',
          {
            userId: authUser.uid,
            reason
          }
        );
      } finally {
        progressRecoveryBusyRef.current = false;
      }
    };

    recoverFromRemoteStats('boot').catch(() => null);
    const timer = setInterval(() => {
      recoverFromRemoteStats('poll').catch(() => null);
    }, PROGRESS_RECOVERY_RETRY_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid, progressReady, progress?.updatedAt, progress?.totalCorrect, progress?.pvpPoints]);

  useEffect(() => {
    if (!authUser?.uid || !profile?.id) return;
    let cancelled = false;

    async function heartbeat() {
      try {
        await upsertPresence({
          id: authUser.uid,
          auth_id: authUser.uid,
          nickname: profile.nickname || 'Jogador',
          avatar: profile.avatar || '🤓'
        });
      } catch (error) {
        if (!cancelled) console.error('presence heartbeat failed:', error);
      }
    }

    heartbeat();
    const timer = setInterval(heartbeat, 12000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid, profile?.id, profile?.nickname, profile?.avatar]);

  useEffect(() => {
    const isAdminScreen = screen === 'admin-monitor' || screen === 'admin-live' || screen === 'admin-history';
    const shouldPoll = screen === 'challenge' || pvpState.status === 'queueing' || (adminAuthorized && isAdminScreen);
    if (!shouldPoll) return;
    let cancelled = false;

    async function loadArenaMetrics() {
      try {
        const data = await getArenaMetrics(35);
        if (!cancelled) {
          setArenaMetrics({
            online: Math.max(0, Number(data?.online || 0)),
            queue: Math.max(0, Number(data?.queue || 0))
          });
        }
      } catch (error) {
        if (!cancelled) console.error('arena metrics load failed:', error);
      }
    }

    loadArenaMetrics();
    const timer = setInterval(loadArenaMetrics, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [screen, pvpState.status]);

  useEffect(() => {
    if (screen !== 'rankings' && screen !== 'home') return;
    let cancelled = false;
    let retryCount = 0;
    let watchdogTimer = null;
    let retryTimer = null;
    let unsubscribe = () => { };

    const clearTimers = () => {
      if (watchdogTimer) {
        clearTimeout(watchdogTimer);
        watchdogTimer = null;
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const scheduleRetry = (reason = 'timeout') => {
      clearTimers();
      if (retryCount >= DATA_SUBSCRIBE_MAX_RETRIES) {
        console.error(`rankings subscribe ${reason} after ${DATA_SUBSCRIBE_MAX_RETRIES} retries`);
        setRankingsRows([]);
        setRankingsLoading(false);
        return;
      }
      retryCount += 1;
      retryTimer = setTimeout(() => {
        if (cancelled) return;
        unsubscribe();
        startSubscribe(`retry_${reason}_${retryCount}`);
      }, DATA_SUBSCRIBE_RETRY_DELAY_MS);
    };

    const startSubscribe = (reason = 'initial') => {
      if (cancelled) return;
      setRankingsLoading(true);
      unsubscribe = subscribeGlobalRankings(
        rankingsMode,
        50,
        (rows) => {
          if (cancelled) return;
          clearTimers();
          setRankingsRows(Array.isArray(rows) ? rows : []);
          setRankingsLoading(false);
        },
        (error) => {
          if (cancelled) return;
          console.error(`rankings subscribe error (${reason}):`, error);
          scheduleRetry('error');
        }
      );
      watchdogTimer = setTimeout(() => {
        if (cancelled) return;
        console.warn(`rankings subscribe timeout > ${DATA_SUBSCRIBE_RETRY_TIMEOUT_MS}ms (${reason})`);
        scheduleRetry('timeout');
      }, DATA_SUBSCRIBE_RETRY_TIMEOUT_MS);
    };

    startSubscribe('initial');

    return () => {
      cancelled = true;
      clearTimers();
      unsubscribe();
      setRankingsLoading(false);
    };
  }, [screen, rankingsMode]);

  useEffect(() => {
    if (!authUser?.uid) return;
    ensureSystemBot().catch(() => null);
  }, [authUser?.uid]);

  useEffect(() => {
    if (!authUser?.uid || !profile?.id) return;
    const shouldWarm =
      screen === 'home'
      || screen === 'challenge'
      || screen === 'play-mode'
      || screen === 'rankings';
    if (!shouldWarm) return;

    let cancelled = false;
    const safeDifficulty = getPvpQueueDifficultyFromConfig(pvpConfig, progress);
    const runRuntimePreload = async (reason = 'interval') => {
      if (cancelled) return;
      const nowMs = Date.now();
      const cache = preloadRuntimeRef.current && typeof preloadRuntimeRef.current === 'object'
        ? preloadRuntimeRef.current
        : { userId: '', lastAtMs: 0, challengeLastAtMs: 0 };
      const sameUser = String(cache.userId || '') === String(authUser.uid || '');
      const minGapMs = screen === 'challenge'
        ? PRELOAD_RUNTIME_CHALLENGE_INTERVAL_MS
        : PRELOAD_RUNTIME_MIN_INTERVAL_MS;
      const lastAtMs = screen === 'challenge'
        ? Math.max(0, Number(cache.challengeLastAtMs || 0))
        : Math.max(0, Number(cache.lastAtMs || 0));
      if (sameUser && (nowMs - lastAtMs) < minGapMs) return;

      preloadRuntimeRef.current = {
        userId: authUser.uid,
        lastAtMs: nowMs,
        challengeLastAtMs: screen === 'challenge'
          ? nowMs
          : Math.max(0, Number(cache.challengeLastAtMs || 0))
      };
      queueFlowLogThrottled(
        'runtime_preload_start',
        10000,
        'runtime_preload:start',
        {
          userId: authUser.uid,
          screen,
          reason
        }
      );
      const startedAtMs = Date.now();
      await Promise.all([
        withTimeout(ensureSystemBots().catch(() => null), 2400, 'preload_system_bots').catch(() => null),
        withTimeout(getArenaMetrics(35).catch(() => null), 1800, 'preload_arena_metrics').catch(() => null),
        withTimeout(getQueueEntryByUser(authUser.uid).catch(() => null), 1600, 'preload_self_queue').catch(() => null),
        withTimeout(findOpenMatchForUser(authUser.uid).catch(() => null), 1600, 'preload_self_open_match').catch(() => null),
        withTimeout(getUserStats(authUser.uid).catch(() => null), 1600, 'preload_self_stats').catch(() => null),
        prepareBotForQueue(safeDifficulty, `runtime_preload_${reason}`, false).catch(() => null)
      ]);
      if (cancelled) return;
      queueFlowLogThrottled(
        'runtime_preload_done',
        10000,
        'runtime_preload:done',
        {
          userId: authUser.uid,
          screen,
          reason,
          elapsedMs: Math.max(0, Date.now() - startedAtMs)
        }
      );
    };

    runRuntimePreload('boot').catch(() => null);
    const timer = setInterval(() => {
      runRuntimePreload('poll').catch(() => null);
    }, screen === 'challenge' ? PRELOAD_RUNTIME_CHALLENGE_INTERVAL_MS : PRELOAD_RUNTIME_MIN_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid, profile?.id, screen, pvpConfig?.difficulty, progress?.pvpPoints, progress?.updatedAt]);

  useEffect(() => {
    const isAdminScreen = screen === 'admin-monitor' || screen === 'admin-live' || screen === 'admin-history';
    if (!isAdminScreen) return;
    if (adminAuthorized) return;
    setScreen('home');
  }, [screen, adminAuthorized]);

  useEffect(() => {
    // O papel de admin é do servidor (private.db_admins); trocar de conta fecha o painel.
    setIsAdminUser(false);
    setAdminAuthorized(false);
    if (!authUser?.uid) return;
    let cancelled = false;
    isCurrentUserAdmin()
      .then((isAdmin) => {
        if (!cancelled) setIsAdminUser(isAdmin);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [authUser?.uid]);

  useEffect(() => {
    const shouldLoad = adminAuthorized && (screen === 'admin-monitor' || screen === 'admin-live' || screen === 'admin-history');
    if (!shouldLoad) return;
    cleanupDrawFinishedMatches(300).catch(() => null);
    cleanupZeroScoreFinishedMatches(300).catch(() => null);
    cleanupStalePendingBotUserMatches({
      maxBatch: 60,
      staleMs: 14000,
      actorUserId: authUser?.uid || ''
    }).catch(() => null);

    let cancelled = false;
    let retryCount = 0;
    let watchdogTimer = null;
    let retryTimer = null;
    let unsubscribe = () => { };

    const clearTimers = () => {
      if (watchdogTimer) {
        clearTimeout(watchdogTimer);
        watchdogTimer = null;
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const scheduleRetry = (reason = 'timeout') => {
      clearTimers();
      if (retryCount >= DATA_SUBSCRIBE_MAX_RETRIES) {
        console.error(`admin matches subscribe ${reason} after ${DATA_SUBSCRIBE_MAX_RETRIES} retries`);
        setAdminMatchesLoading(false);
        return;
      }
      retryCount += 1;
      retryTimer = setTimeout(() => {
        if (cancelled) return;
        unsubscribe();
        startSubscribe(`retry_${reason}_${retryCount}`);
      }, DATA_SUBSCRIBE_RETRY_DELAY_MS);
    };

    const startSubscribe = (reason = 'initial') => {
      if (cancelled) return;
      setAdminMatchesLoading(true);
      unsubscribe = subscribePvpMatches(
        (rows) => {
          if (cancelled) return;
          clearTimers();
          const list = Array.isArray(rows) ? rows : [];
          setAdminMatches(list);
          setAdminMatchesUpdatedAtMs(Date.now());
          setAdminMatchesLoading(false);
        },
        (error) => {
          if (cancelled) return;
          console.error(`admin matches subscribe error (${reason}):`, error);
          scheduleRetry('error');
        }
      );
      watchdogTimer = setTimeout(() => {
        if (cancelled) return;
        console.warn(`admin matches subscribe timeout > ${DATA_SUBSCRIBE_RETRY_TIMEOUT_MS}ms (${reason})`);
        scheduleRetry('timeout');
      }, DATA_SUBSCRIBE_RETRY_TIMEOUT_MS);
    };

    startSubscribe('initial');

    return () => {
      cancelled = true;
      clearTimers();
      unsubscribe();
      setAdminMatchesLoading(false);
    };
  }, [adminAuthorized, screen, authUser?.uid]);

  useEffect(() => {
    if (!adminAuthorized) return;
    let cancelled = false;

    const unsubscribeControl = subscribeBotArenaDaemonControl(
      (row) => {
        if (cancelled) return;
        setBotArenaDaemonControlState(row && typeof row === 'object' ? row : {
          arena_enabled: true,
          pvp_enabled: true,
          quiz_enabled: true,
          updated_at: '',
          updated_by: ''
        });
      },
      (error) => {
        if (!cancelled) console.error('bot daemon control subscribe error:', error);
      }
    );

    const unsubscribeStatus = subscribeBotArenaDaemonStatus(
      (row) => {
        if (cancelled) return;
        setBotArenaDaemonStatusState(row && typeof row === 'object' ? row : {
          owner_id: '',
          status: 'unknown',
          last_state: '',
          ticks: 0,
          created_matches: 0,
          finalized_matches: 0,
          lock_ok: false,
          run_started_at: '',
          run_started_at_ms: 0,
          run_finished_at: '',
          run_finished_at_ms: 0,
          updated_at: '',
          updated_at_ms: 0
        });
      },
      (error) => {
        if (!cancelled) console.error('bot daemon status subscribe error:', error);
      }
    );

    const unsubscribeQuiz = subscribeBotArenaQuizState(
      (row) => {
        if (cancelled) return;
        setAdminMatchesUpdatedAtMs(Date.now());
        setAdminMatchesLoading(false);
        setBotArenaQuizState(row && typeof row === 'object' ? row : {
          status: 'idle',
          batch_id: '',
          assignments: [],
          started_at_ms: 0,
          ends_at_ms: 0,
          cursor_difficulty: 'easy',
          cursor_index: 0,
          cursor_cycle_no: 0,
          updated_at: '',
          last_result: null
        });
      },
      (error) => {
        if (!cancelled) console.error('bot quiz state subscribe error:', error);
      }
    );

    return () => {
      cancelled = true;
      unsubscribeControl();
      unsubscribeStatus();
      unsubscribeQuiz();
    };
  }, [adminAuthorized]);

  useEffect(() => {
    if (!ENABLE_CLIENT_BOT_AUTOMATION) return;
    if (!authUser?.uid) return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await runBotArenaAutomationTick(authUser.uid).catch(() => null);
    };

    tick();
    const timer = setInterval(tick, 2600);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = String(authUser?.uid || 'guest').trim() || 'guest';
    const key = `${PVP_EMOJI_STORAGE_PREFIX}_${uid}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        const defaults = normalizeBattleEmojis(DEFAULT_BATTLE_EMOJIS);
        setPvpBattleEmojis(defaults);
        setPvpEmojiDraft(defaults);
        return;
      }
      const parsed = JSON.parse(raw);
      const normalized = normalizeBattleEmojis(parsed);
      setPvpBattleEmojis(normalized);
      setPvpEmojiDraft(normalized);
    } catch {
      const defaults = normalizeBattleEmojis(DEFAULT_BATTLE_EMOJIS);
      setPvpBattleEmojis(defaults);
      setPvpEmojiDraft(defaults);
    }
  }, [authUser?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = String(authUser?.uid || 'guest').trim() || 'guest';
    const key = `${PVP_EMOJI_STORAGE_PREFIX}_${uid}`;
    try {
      window.localStorage.setItem(key, JSON.stringify(normalizeBattleEmojis(pvpBattleEmojis)));
    } catch {
      // ignore storage failures
    }
  }, [pvpBattleEmojis, authUser?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cursorKey = getPvpSequenceStorageKey(authUser?.uid || 'guest');
    const recentStartsKey = getPvpSequenceRecentStartsStorageKey(authUser?.uid || 'guest');
    try {
      const raw = window.localStorage.getItem(cursorKey);
      if (!raw) {
        pvpSequenceCursorRef.current = {};
      } else {
        const parsed = JSON.parse(raw);
        pvpSequenceCursorRef.current = normalizePvpSequenceCursorState(parsed);
      }
    } catch {
      pvpSequenceCursorRef.current = {};
    }
    try {
      const raw = window.localStorage.getItem(recentStartsKey);
      if (!raw) {
        pvpSequenceRecentStartsRef.current = {};
      } else {
        const parsed = JSON.parse(raw);
        pvpSequenceRecentStartsRef.current = normalizePvpSequenceRecentStartsState(parsed);
      }
    } catch {
      pvpSequenceRecentStartsRef.current = {};
    }
  }, [authUser?.uid]);

  useEffect(() => {
    if (screen !== 'quiz' || !quizState || quizState.answered) return;
    const roundSeconds = getPveRoundSeconds();
    const startedAtMs = Math.max(0, Number(quizState.questionStartedAtMs || 0)) || Date.now();
    const elapsedMs = Math.max(0, Date.now() - startedAtMs);
    const remainingMs = Math.max(0, roundSeconds * 1000 - elapsedMs);

    if (remainingMs <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => handleTimeout(), remainingMs + 16);
    return () => clearTimeout(timer);
  }, [screen, quizState?.index, quizState?.answered, quizState?.questionStartedAtMs, quizState?.difficulty]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    const teamStatus = String(pvpTeamMatch?.status || '').trim().toLowerCase();
    const eliminationStatus = String(pvpEliminationMatch?.status || '').trim().toLowerCase();
    const eliminationQueueing = String(pvpEliminationQueueState.status || '').trim().toLowerCase() === 'queueing';
    const duelClockActive = (
      safeStatus === 'queueing'
      || safeStatus === 'active'
      || safeStatus === 'pending_accept'
      || safeStatus === 'round_result'
    );
    const teamClockActive = teamStatus === 'active' || teamStatus === 'round_result';
    const eliminationClockActive = (
      eliminationQueueing
      || eliminationStatus === 'active'
      || eliminationStatus === 'round_result'
      || eliminationStatus === 'elimination_result'
    );
    if (
      !duelClockActive
      && !teamClockActive
      && !eliminationClockActive
    ) {
      return;
    }
    setPvpClockMs(Date.now());
    const timer = setInterval(
      () => setPvpClockMs(Date.now()),
      safeStatus === 'active' || teamStatus === 'active' || eliminationStatus === 'active' ? 80 : 150
    );
    return () => clearInterval(timer);
  }, [
    pvpState.status,
    pvpState.matchId,
    pvpTeamMatch?.id,
    pvpTeamMatch?.status,
    pvpEliminationMatch?.id,
    pvpEliminationMatch?.status,
    pvpEliminationQueueState.status
  ]);

  const selectedTopics = useMemo(
    () => getTopicsByLanguage(TOPICS, selectedLanguage),
    [selectedLanguage]
  );

  const quizRoundSeconds = getPveRoundSeconds();
  const quizQuestionStartMs = Math.max(0, Number(quizState?.questionStartedAtMs || 0));

  const currentQuestion = quizState ? quizState.questions[quizState.index] : null;

  const safeLevel = Math.max(1, Number(progress?.level || 1));
  const safeXp = Math.max(0, Number(progress?.xp || 0));
  const safeCoins = Math.max(0, Number(progress?.coins || 0));
  const xpForNextLevel = Math.max(1, getXPForLevel(safeLevel));
  const xpPercent = Math.max(0, Math.min(100, Math.round((safeXp / xpForNextLevel) * 100)));
  const heroNickname = String(
    profile?.nickname
    || profileDraft?.nickname
    || activeAuthUser?.displayName
    || activeAuthUser?.email
    || 'Jogador'
  ).trim() || 'Jogador';

  const displayAvatar = getDisplayAvatar(profile?.avatar || '🤓', shopData);
  const avatarFrameStyle = getAvatarFrameStyle(shopData);
  const avatarFrameClass = getAvatarFrameClass(shopData);
  const heroBackground = getHeroBackgroundStyle(shopData);
  const heroBackgroundMeta = getBackgroundVisualMeta(shopData);

  const pvpMatch = pvpState.match;
  const pvpRoundNo = Math.max(1, Number(pvpMatch?.round_no || 1));
  const pvpTotalRounds = Math.max(1, Number(pvpMatch?.total_rounds || PVP_ROUNDS_PER_MATCH));
  const pvpBaseFinalRoundNo = Math.min(PVP_ROUNDS_PER_MATCH, pvpTotalRounds);
  const pvpQuestion = pvpMatch?.question_set?.[pvpRoundNo - 1] || null;
  const pvpRoundDuration = Math.max(
    1000,
    Number(getRoundDurationSeconds(pvpMatch?.difficulty || pvpConfig.difficulty) || 20) * 1000
    + PVP_ROUND_EXTRA_ANSWER_MS
  );
  const pvpRoundActivatedKey = `${pvpState.matchId || pvpMatch?.id || ''}_${pvpMatch?.round_no || 1}`;
  const pvpRoundServerStartMs = Math.max(
    0,
    Number(pvpMatch?.round_started_at_ms || toMillis(pvpMatch?.round_started_at) || 0)
  );
  if (pvpState.status === 'active') {
    if (pvpRoundActivatedAtRef.current.key !== pvpRoundActivatedKey) {
      pvpRoundActivatedAtRef.current = {
        key: pvpRoundActivatedKey,
        ms: pvpRoundServerStartMs > 0 ? pvpRoundServerStartMs : Date.now()
      };
    }
  }
  const pvpRoundStartMs = Math.max(
    0,
    Number(pvpState.status === 'active' ? pvpRoundActivatedAtRef.current.ms : pvpRoundServerStartMs)
  );
  const pvpRoundElapsedMsRaw = pvpRoundStartMs > 0
    ? Math.max(0, pvpClockMs - pvpRoundStartMs)
    : 0;
  const pvpRoundElapsedMs = Number.isFinite(pvpRoundElapsedMsRaw) ? pvpRoundElapsedMsRaw : 0;
  const pvpRoundRemainingMsRaw = Math.max(0, pvpRoundDuration - pvpRoundElapsedMs);
  const safePvpRoundRemainingMsRaw = Number.isFinite(pvpRoundRemainingMsRaw) ? pvpRoundRemainingMsRaw : pvpRoundDuration;
  if (pvpState.status === 'active') {
    if (pvpRoundRemainingGuardRef.current.key !== pvpRoundActivatedKey) {
      pvpRoundRemainingGuardRef.current = {
        key: pvpRoundActivatedKey,
        remainingMs: safePvpRoundRemainingMsRaw
      };
    } else {
      pvpRoundRemainingGuardRef.current = {
        key: pvpRoundActivatedKey,
        remainingMs: Math.max(
          0,
          Math.min(
            Number(pvpRoundRemainingGuardRef.current.remainingMs || safePvpRoundRemainingMsRaw),
            safePvpRoundRemainingMsRaw
          )
        )
      };
    }
  }
  const pvpRoundRemainingMs = pvpState.status === 'active'
    ? Math.max(
      0,
      Number(
        pvpRoundRemainingGuardRef.current.key === pvpRoundActivatedKey
          ? pvpRoundRemainingGuardRef.current.remainingMs
          : safePvpRoundRemainingMsRaw
      )
    )
    : safePvpRoundRemainingMsRaw;
  const pvpRoundRemainingSec = Math.max(0, Math.ceil(pvpRoundRemainingMs / 1000));

  useEffect(() => {
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (pvpThemeIntroMatchRef.current === matchId) return;
    pvpThemeIntroMatchRef.current = matchId;
    pvpThemeIntroShownKeysRef.current = new Set();
  }, [pvpState.match?.id, pvpState.matchId]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    if (safeStatus !== 'active') return;

    const matchId = String(pvpMatch?.id || pvpState.matchId || '').trim();
    if (!matchId) return;

    const fallbackLanguage = String(pvpMatch?.language || '').trim();
    const fallbackTopic = String(pvpMatch?.topic || '').trim();
    const currentTheme = resolveQuestionThemeContext(pvpQuestion, fallbackLanguage, fallbackTopic);
    const prevQuestion = pvpMatch?.question_set?.[pvpRoundNo - 2] || null;
    const previousTheme = resolveQuestionThemeContext(prevQuestion, fallbackLanguage, fallbackTopic);
    const currentThemeKey = buildThemeContextKey(currentTheme.languageId, currentTheme.topicId);
    const previousThemeKey = buildThemeContextKey(previousTheme.languageId, previousTheme.topicId);
    const shouldShowIntro = pvpRoundNo === 1 || (currentThemeKey && currentThemeKey !== previousThemeKey);
    if (!shouldShowIntro) return;

    const introKey = `${matchId}_${pvpRoundNo}_${currentThemeKey || 'general'}`;
    if (pvpThemeIntroShownKeysRef.current.has(introKey)) return;
    pvpThemeIntroShownKeysRef.current.add(introKey);

    runThemeIntroOverlay(
      {
        mode: 'pvp',
        roundNo: pvpRoundNo,
        languageId: currentTheme.languageId || fallbackLanguage,
        topicId: currentTheme.topicId || fallbackTopic,
        difficulty: pvpMatch?.difficulty || pvpConfig?.difficulty || 'easy'
      },
      {
        durationMs: THEME_INTRO_PVP_DURATION_MS
      }
    );
  }, [
    pvpState.status,
    pvpState.matchId,
    pvpMatch?.id,
    pvpMatch?.updated_at,
    pvpMatch?.difficulty,
    pvpMatch?.language,
    pvpMatch?.topic,
    pvpRoundNo,
    pvpQuestion?.q,
    pvpQuestion?.code,
    pvpQuestion?.topic,
    pvpQuestion?.language,
    pvpConfig?.difficulty
  ]);

  useEffect(() => {
    const element = quizQuestionScrollRef.current;
    if (screen !== 'quiz' || !element) {
      setQuizQuestionHasOverflow(false);
      return;
    }

    let rafId = 0;
    const measureOverflow = () => {
      const hasOverflow = (element.scrollHeight - element.clientHeight) > 6;
      setQuizQuestionHasOverflow((prev) => (prev === hasOverflow ? prev : hasOverflow));
    };
    const scheduleMeasure = () => {
      if (rafId && typeof window !== 'undefined') window.cancelAnimationFrame(rafId);
      if (typeof window !== 'undefined') {
        rafId = window.requestAnimationFrame(measureOverflow);
      } else {
        measureOverflow();
      }
    };

    scheduleMeasure();
    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => scheduleMeasure());
      observer.observe(element);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', scheduleMeasure);
    }

    return () => {
      if (observer) observer.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', scheduleMeasure);
        if (rafId) window.cancelAnimationFrame(rafId);
      }
    };
  }, [screen, quizState?.index, currentQuestion?.q, currentQuestion?.code]);

  useEffect(() => {
    const element = pvpQuestionScrollRef.current;
    if (screen !== 'pvp' || pvpState.status !== 'active' || !element) {
      setPvpQuestionHasOverflow(false);
      return;
    }

    let rafId = 0;
    const measureOverflow = () => {
      const hasOverflow = (element.scrollHeight - element.clientHeight) > 6;
      setPvpQuestionHasOverflow((prev) => (prev === hasOverflow ? prev : hasOverflow));
    };
    const scheduleMeasure = () => {
      if (rafId && typeof window !== 'undefined') window.cancelAnimationFrame(rafId);
      if (typeof window !== 'undefined') {
        rafId = window.requestAnimationFrame(measureOverflow);
      } else {
        measureOverflow();
      }
    };

    scheduleMeasure();
    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => scheduleMeasure());
      observer.observe(element);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', scheduleMeasure);
    }

    return () => {
      if (observer) observer.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', scheduleMeasure);
        if (rafId) window.cancelAnimationFrame(rafId);
      }
    };
  }, [screen, pvpState.status, pvpState.match?.id, pvpState.match?.round_no, pvpQuestion?.q, pvpQuestion?.code]);

  const isBattleMusicFlow = (
    screen === 'quiz'
    || screen === 'feedback'
    || screen === 'pvp-result'
    || screen === 'pvp-team-result'
    || screen === 'pvp-elimination-result'
    || (screen === 'pvp' && (pvpState.status === 'active' || pvpState.status === 'round_result'))
    || (screen === 'pvp-team' && (pvpTeamMatch?.status === 'active' || pvpTeamMatch?.status === 'round_result'))
    || (screen === 'pvp-elimination' && (
      pvpEliminationMatch?.status === 'active'
      || pvpEliminationMatch?.status === 'round_result'
      || pvpEliminationMatch?.status === 'elimination_result'
    ))
  );

  // Fila, partida ou tela de recompensa em andamento: o aviso de nova versão espera o
  // jogador sair, para o "Atualizar" (que recarrega a página) não tirá-lo do jogo.
  const isMatchFlowInProgress = (
    screen === 'quiz'
    || screen === 'feedback'
    || screen === 'result'
    || screen === 'pvp'
    || screen === 'pvp-result'
    || screen === 'pvp-team'
    || screen === 'pvp-team-result'
    || screen === 'pvp-elimination'
    || screen === 'pvp-elimination-result'
    || themeIntro.visible
    || ['queueing', 'pending_accept', 'active', 'round_result'].includes(String(pvpState.status || '').trim().toLowerCase())
    || String(pvpEliminationQueueState.status || '').trim().toLowerCase() === 'queueing'
  );

  const activeMusicTrack = musicMode === 'battle'
    ? BATTLE_MUSIC_TRACKS[battleTrackIndex % BATTLE_MUSIC_TRACKS.length]
    : MENU_MUSIC_TRACKS[menuTrackIndex % MENU_MUSIC_TRACKS.length];

  function ensureAudioContext() {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const hasUserActivation = Boolean(window.navigator?.userActivation?.hasBeenActive);
    if (!audioUnlockedRef.current && !hasUserActivation) return null;

    let ctx = audioContextRef.current;
    if (!ctx) {
      ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const master = ctx.createGain();
      const music = ctx.createGain();
      const sfx = ctx.createGain();

      master.gain.value = 0.9;
      music.gain.value = 0;
      sfx.gain.value = Math.max(
        0,
        Math.min(1, Number(audioSettingsRef.current.sfxVolume ?? AUDIO_DEFAULTS.sfxVolume))
      );

      music.connect(master);
      sfx.connect(master);
      master.connect(ctx.destination);

      masterGainRef.current = master;
      musicGainRef.current = music;
      sfxGainRef.current = sfx;
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => null);
    }

    return ctx;
  }

  function clearMusicLoop() {
    if (musicLoopTimerRef.current) {
      clearInterval(musicLoopTimerRef.current);
      musicLoopTimerRef.current = null;
    }
    if (musicAutoSkipTimerRef.current) {
      clearTimeout(musicAutoSkipTimerRef.current);
      musicAutoSkipTimerRef.current = null;
    }
    if (musicTransitionTimerRef.current) {
      clearTimeout(musicTransitionTimerRef.current);
      musicTransitionTimerRef.current = null;
    }
    if (musicSkipSwitchTimerRef.current) {
      clearTimeout(musicSkipSwitchTimerRef.current);
      musicSkipSwitchTimerRef.current = null;
    }
    musicSkipBusyRef.current = false;
  }

  function getMusicVolumeLevel(raw = audioSettingsRef.current?.musicVolume) {
    const safe = Math.max(0, Math.min(1, Number(raw ?? AUDIO_DEFAULTS.musicVolume)));
    return safe * 0.55;
  }

  function getSfxVolumeLevel(raw = audioSettingsRef.current?.sfxVolume) {
    return Math.max(0, Math.min(1, Number(raw ?? AUDIO_DEFAULTS.sfxVolume)));
  }

  function pickRandomTrackIndex(total, currentIndex = -1) {
    const safeTotal = Math.max(1, Math.trunc(Number(total || 0)));
    const safeCurrent = Math.max(0, Math.trunc(Number(currentIndex || 0)));
    if (safeTotal <= 1) return 0;
    let nextIndex = safeCurrent;
    let attempts = 0;
    while (nextIndex === safeCurrent && attempts < 8) {
      nextIndex = Math.floor(Math.random() * safeTotal);
      attempts += 1;
    }
    if (nextIndex === safeCurrent) {
      nextIndex = (safeCurrent + 1) % safeTotal;
    }
    return nextIndex;
  }

  function setMusicGain(target, durationMs = 450) {
    const ctx = audioContextRef.current;
    const musicGain = musicGainRef.current;
    if (!ctx || !musicGain) return;
    const now = ctx.currentTime;
    const safeTarget = Math.max(0, Math.min(1, Number(target ?? 0)));
    const durationSec = Math.max(0.06, Number(durationMs || 0) / 1000);
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(safeTarget, now + durationSec);
  }

  function scheduleMusicAutoSkip(mode) {
    if (musicAutoSkipTimerRef.current) {
      clearTimeout(musicAutoSkipTimerRef.current);
      musicAutoSkipTimerRef.current = null;
    }
    if (typeof window === 'undefined') return;
    if (!audioSettingsRef.current.musicEnabled) return;
    const safeMode = mode === 'battle' ? 'battle' : 'menu';
    musicAutoSkipTimerRef.current = window.setTimeout(() => {
      musicAutoSkipTimerRef.current = null;
      if (!audioSettingsRef.current.musicEnabled) return;
      if (musicModeRef.current !== safeMode) return;
      triggerMusicTrackSkip({ mode: safeMode, auto: true });
    }, MUSIC_AUTO_SKIP_INTERVAL_MS);
  }

  function advanceMusicTrackIndex(mode) {
    if (mode === 'battle') {
      const total = Math.max(1, BATTLE_MUSIC_TRACKS.length);
      const nextIndex = pickRandomTrackIndex(total, battleTrackIndexRef.current);
      battleTrackIndexRef.current = nextIndex;
      setBattleTrackIndex(nextIndex);
      return nextIndex;
    }
    const total = Math.max(1, MENU_MUSIC_TRACKS.length);
    const nextIndex = pickRandomTrackIndex(total, menuTrackIndexRef.current);
    menuTrackIndexRef.current = nextIndex;
    setMenuTrackIndex(nextIndex);
    return nextIndex;
  }

  function triggerMusicTrackSkip({ mode = null, auto = false } = {}) {
    if (!audioSettingsRef.current.musicEnabled) return;
    if (musicSkipBusyRef.current) return;
    if (typeof window === 'undefined') return;
    const safeMode = mode === 'battle' || mode === 'menu'
      ? mode
      : (musicModeRef.current === 'battle' ? 'battle' : 'menu');

    if (musicAutoSkipTimerRef.current) {
      clearTimeout(musicAutoSkipTimerRef.current);
      musicAutoSkipTimerRef.current = null;
    }
    if (musicSkipSwitchTimerRef.current) {
      clearTimeout(musicSkipSwitchTimerRef.current);
      musicSkipSwitchTimerRef.current = null;
    }

    musicSkipBusyRef.current = true;
    setMusicGain(0, MUSIC_SKIP_FADE_OUT_MS);
    musicSkipSwitchTimerRef.current = window.setTimeout(() => {
      musicSkipSwitchTimerRef.current = null;
      musicSkipBusyRef.current = false;
      if (!audioSettingsRef.current.musicEnabled) return;
      if (musicModeRef.current !== safeMode) return;

      advanceMusicTrackIndex(safeMode);
      startMusicLoop(safeMode);
      setMusicGain(getMusicVolumeLevel(audioSettingsRef.current?.musicVolume), MUSIC_SKIP_FADE_IN_MS);
      if (!auto) {
        playSfx('notify');
      }
    }, MUSIC_SKIP_SWITCH_DELAY_MS);
  }

  function emitMusicTone({
    frequency,
    durationSec,
    wave = 'sine',
    volume = 0.1,
    attackSec = 0.02,
    releaseSec = 0.26,
    whenOffsetSec = 0
  }) {
    const ctx = audioContextRef.current;
    const musicGain = musicGainRef.current;
    if (!ctx || !musicGain) return;

    const startAt = ctx.currentTime + Math.max(0, Number(whenOffsetSec || 0));
    const dur = Math.max(0.05, Number(durationSec || 0.2));
    const attack = Math.max(0.005, Number(attackSec || 0.02));
    const release = Math.max(0.03, Number(releaseSec || 0.2));

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(Math.max(30, Number(frequency || 220)), startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, Number(volume || 0.1)), startAt + attack);
    gain.gain.setValueAtTime(Math.max(0.001, Number(volume || 0.1)), startAt + Math.max(attack, dur - release));
    gain.gain.linearRampToValueAtTime(0.0001, startAt + dur);

    osc.connect(gain);
    gain.connect(musicGain);
    osc.start(startAt);
    osc.stop(startAt + dur + 0.01);
  }

  function getSequenceNoteAt(sequence, step) {
    const list = Array.isArray(sequence) ? sequence : [];
    if (!list.length) return null;
    const raw = list[step % list.length];
    if (raw === null || raw === undefined) return null;
    const safe = Number(raw);
    if (!Number.isFinite(safe) || safe <= 0) return null;
    return safe;
  }

  function transposeFrequency(base, semitones = 0) {
    const safeBase = Math.max(20, Number(base || 220));
    return safeBase * (2 ** (Number(semitones || 0) / 12));
  }

  function playMenuMusicStep(track) {
    const melodySequence = track?.melody || track?.notes || [];
    if (!Array.isArray(melodySequence) || !melodySequence.length) return;
    const step = musicStepRef.current;
    const stepDurSec = Math.max(0.2, Number(track?.tempoMs || 320) / 1000);
    const engine = String(track?.engine || '').trim().toLowerCase();
    const accent = (step % 4) === 0;
    const melodyFreq = getSequenceNoteAt(melodySequence, step);
    const bassFreq = getSequenceNoteAt(track?.bass, step);
    const chordRoot = getSequenceNoteAt(track?.chords, Math.floor(step / 2)) || bassFreq || (melodyFreq ? melodyFreq / 2 : null);

    if (bassFreq) {
      emitMusicTone({
        frequency: bassFreq,
        durationSec: Math.min(0.24, stepDurSec * 0.86),
        wave: engine === 'menu_title_inspired' ? 'square' : 'triangle',
        volume: accent ? 0.1 : 0.084,
        attackSec: 0.006,
        releaseSec: 0.1
      });
    }

    if (melodyFreq) {
      emitMusicTone({
        frequency: melodyFreq,
        durationSec: Math.min(0.2, stepDurSec * 0.8),
        wave: 'square',
        volume: accent ? 0.126 : 0.104,
        attackSec: 0.004,
        releaseSec: 0.09,
        whenOffsetSec: 0.01
      });
    }

    if (chordRoot && step % 4 === 0) {
      const majorThird = transposeFrequency(chordRoot, 4);
      const fifth = transposeFrequency(chordRoot, 7);
      [chordRoot, majorThird, fifth].forEach((freq, index) => {
        emitMusicTone({
          frequency: freq,
          durationSec: Math.min(0.34, stepDurSec * 1.34),
          wave: 'sine',
          volume: Math.max(0.022, 0.044 - index * 0.008),
          attackSec: 0.02,
          releaseSec: 0.2,
          whenOffsetSec: 0.02
        });
      });
    }

    if (engine === 'menu_title_inspired' && melodyFreq && (step % 8 === 6)) {
      emitMusicTone({
        frequency: melodyFreq * 2,
        durationSec: Math.min(0.12, stepDurSec * 0.42),
        wave: 'triangle',
        volume: 0.05,
        attackSec: 0.003,
        releaseSec: 0.06,
        whenOffsetSec: 0.08
      });
    }

    musicStepRef.current += 1;
  }

  function playBattleMusicStep(track) {
    const melodySequence = track?.melody || track?.notes || [];
    if (!Array.isArray(melodySequence) || !melodySequence.length) return;
    const step = musicStepRef.current;
    const engine = String(track?.engine || '').trim().toLowerCase();
    const accent = (step % 4) === 0;
    const melodyFreq = getSequenceNoteAt(melodySequence, step);
    const bassFreq = getSequenceNoteAt(track?.bass, step);
    const kickFreq = getSequenceNoteAt(track?.kick, step);

    if (kickFreq) {
      emitMusicTone({
        frequency: kickFreq,
        durationSec: 0.09,
        wave: 'sine',
        volume: accent ? 0.22 : 0.16,
        attackSec: 0.002,
        releaseSec: 0.04
      });
    }

    if (bassFreq) {
      emitMusicTone({
        frequency: bassFreq,
        durationSec: 0.15,
        wave: engine === 'battle_chase' ? 'triangle' : 'square',
        volume: accent ? 0.12 : 0.1,
        attackSec: 0.003,
        releaseSec: 0.06,
        whenOffsetSec: 0.02
      });
    }

    if (melodyFreq) {
      emitMusicTone({
        frequency: melodyFreq,
        durationSec: 0.14,
        wave: 'square',
        volume: accent ? 0.142 : 0.118,
        attackSec: 0.003,
        releaseSec: 0.06,
        whenOffsetSec: 0.05
      });
    }

    if (melodyFreq && (step % 8 === 7)) {
      emitMusicTone({
        frequency: melodyFreq * 2,
        durationSec: 0.08,
        wave: 'triangle',
        volume: 0.058,
        attackSec: 0.002,
        releaseSec: 0.04,
        whenOffsetSec: 0.13
      });
    }

    musicStepRef.current += 1;
  }

  function startMusicLoop(mode) {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    clearMusicLoop();
    musicStepRef.current = 0;

    if (mode === 'battle') {
      const track = BATTLE_MUSIC_TRACKS[battleTrackIndexRef.current % BATTLE_MUSIC_TRACKS.length];
      setMusicMode('battle');
      musicModeRef.current = 'battle';
      playBattleMusicStep(track);
      musicLoopTimerRef.current = setInterval(() => playBattleMusicStep(track), Math.max(180, Number(track.tempoMs || 360)));
      scheduleMusicAutoSkip('battle');
      return;
    }

    const track = MENU_MUSIC_TRACKS[menuTrackIndexRef.current % MENU_MUSIC_TRACKS.length];
    setMusicMode('menu');
    musicModeRef.current = 'menu';
    playMenuMusicStep(track);
    musicLoopTimerRef.current = setInterval(() => playMenuMusicStep(track), Math.max(420, Number(track.tempoMs || 620)));
    scheduleMusicAutoSkip('menu');
  }

  function bootstrapMusicIfNeeded(preferredMode) {
    if (!audioSettingsRef.current.musicEnabled) return;
    if (musicLoopTimerRef.current) return;
    const mode = preferredMode === 'battle' ? 'battle' : 'menu';
    startMusicLoop(mode);
    const nextVolume = getMusicVolumeLevel(audioSettingsRef.current?.musicVolume);
    setMusicGain(nextVolume, 320);
  }

  function applyMusicMode(mode) {
    const safeMode = mode === 'battle' ? 'battle' : 'menu';
    ensureAudioContext();

    if (!audioSettingsRef.current.musicEnabled) {
      clearMusicLoop();
      setMusicGain(0, 220);
      return;
    }

    const nextVolume = getMusicVolumeLevel(audioSettingsRef.current?.musicVolume);
    if (musicModeRef.current === safeMode && musicLoopTimerRef.current) {
      setMusicGain(nextVolume, 240);
      return;
    }

    // On each mode entry, jump to a different random track of that mode.
    advanceMusicTrackIndex(safeMode);
    setMusicGain(0, 420);
    musicTransitionTimerRef.current = setTimeout(() => {
      startMusicLoop(safeMode);
      setMusicGain(nextVolume, 650);
    }, 430);
  }

  function playSfx(type = 'click', retryCount = 0) {
    if (!audioSettingsRef.current.sfxEnabled) return;
    const ctx = ensureAudioContext();
    const sfxBus = sfxGainRef.current;
    if (!ctx || !sfxBus) return;
    if (ctx.state !== 'running') {
      if (retryCount >= 2) return;
      ctx.resume()
        .then(() => {
          if (typeof window !== 'undefined') {
            window.setTimeout(() => playSfx(type, retryCount + 1), 24);
          } else {
            playSfx(type, retryCount + 1);
          }
        })
        .catch(() => null);
      return;
    }
    bootstrapMusicIfNeeded(isBattleMusicFlow ? 'battle' : 'menu');

    const sfxVolume = getSfxVolumeLevel(audioSettingsRef.current?.sfxVolume);
    sfxBus.gain.setValueAtTime(sfxVolume, ctx.currentTime);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(sfxBus);
    let secondaryOsc = null;
    let secondaryGain = null;
    let secondaryDuration = 0;
    let secondaryStartOffset = 0;

    const now = ctx.currentTime;
    let duration = 0.12;

    if (type === 'pvp_transition') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.linearRampToValueAtTime(430, now + 0.16);
      duration = 0.26;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.17, now + 0.026);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_result_reveal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);
      duration = 0.2;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_confirm') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.linearRampToValueAtTime(860, now + 0.06);
      duration = 0.09;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.17);
      duration = 0.22;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      secondaryOsc = ctx.createOscillator();
      secondaryGain = ctx.createGain();
      secondaryOsc.connect(secondaryGain);
      secondaryGain.connect(sfxBus);
      secondaryStartOffset = 0.06;
      const secondaryNow = now + secondaryStartOffset;
      secondaryDuration = 0.12;
      secondaryOsc.type = 'triangle';
      secondaryOsc.frequency.setValueAtTime(940, secondaryNow);
      secondaryOsc.frequency.exponentialRampToValueAtTime(1680, secondaryNow + 0.1);
      secondaryGain.gain.setValueAtTime(0.0001, secondaryNow);
      secondaryGain.gain.linearRampToValueAtTime(0.16, secondaryNow + 0.012);
      secondaryGain.gain.exponentialRampToValueAtTime(0.0001, secondaryNow + secondaryDuration);
    } else if (type === 'pvp_wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.24);
      duration = 0.28;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      secondaryOsc = ctx.createOscillator();
      secondaryGain = ctx.createGain();
      secondaryOsc.connect(secondaryGain);
      secondaryGain.connect(sfxBus);
      secondaryStartOffset = 0.025;
      const secondaryNow = now + secondaryStartOffset;
      secondaryDuration = 0.2;
      secondaryOsc.type = 'square';
      secondaryOsc.frequency.setValueAtTime(190, secondaryNow);
      secondaryOsc.frequency.exponentialRampToValueAtTime(92, secondaryNow + 0.19);
      secondaryGain.gain.setValueAtTime(0.0001, secondaryNow);
      secondaryGain.gain.linearRampToValueAtTime(0.12, secondaryNow + 0.018);
      secondaryGain.gain.exponentialRampToValueAtTime(0.0001, secondaryNow + secondaryDuration);
    } else if (type === 'pvp_tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(990, now);
      osc.frequency.linearRampToValueAtTime(930, now + 0.05);
      duration = 0.07;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_time_warning') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.08);
      duration = 0.12;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.016);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_time_critical') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.linearRampToValueAtTime(430, now + 0.07);
      duration = 0.11;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_timeout') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      duration = 0.24;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_round_final') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(470, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.17);
      duration = 0.22;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.024);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_round_elimination') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.17);
      duration = 0.23;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_round_result') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.linearRampToValueAtTime(730, now + 0.09);
      duration = 0.14;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_result_win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.2);
      duration = 0.24;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.028);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_result_draw') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(560, now + 0.11);
      duration = 0.19;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_result_loss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(270, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.21);
      duration = 0.24;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'theme_intro') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.18);
      duration = 0.25;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      secondaryOsc = ctx.createOscillator();
      secondaryGain = ctx.createGain();
      secondaryOsc.connect(secondaryGain);
      secondaryGain.connect(sfxBus);
      secondaryStartOffset = 0.065;
      const secondaryNow = now + secondaryStartOffset;
      secondaryDuration = 0.14;
      secondaryOsc.type = 'sine';
      secondaryOsc.frequency.setValueAtTime(920, secondaryNow);
      secondaryOsc.frequency.exponentialRampToValueAtTime(1420, secondaryNow + 0.1);
      secondaryGain.gain.setValueAtTime(0.0001, secondaryNow);
      secondaryGain.gain.linearRampToValueAtTime(0.11, secondaryNow + 0.016);
      secondaryGain.gain.exponentialRampToValueAtTime(0.0001, secondaryNow + secondaryDuration);
    } else if (type === 'pass_claim') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.22);
      duration = 0.3;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.23, now + 0.024);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      secondaryOsc = ctx.createOscillator();
      secondaryGain = ctx.createGain();
      secondaryOsc.connect(secondaryGain);
      secondaryGain.connect(sfxBus);
      secondaryStartOffset = 0.09;
      const secondaryNow = now + secondaryStartOffset;
      secondaryDuration = 0.17;
      secondaryOsc.type = 'sine';
      secondaryOsc.frequency.setValueAtTime(980, secondaryNow);
      secondaryOsc.frequency.exponentialRampToValueAtTime(1650, secondaryNow + 0.11);
      secondaryGain.gain.setValueAtTime(0.0001, secondaryNow);
      secondaryGain.gain.linearRampToValueAtTime(0.13, secondaryNow + 0.015);
      secondaryGain.gain.exponentialRampToValueAtTime(0.0001, secondaryNow + secondaryDuration);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.14);
      duration = 0.2;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
      duration = 0.2;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'notify') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(580, now + 0.06);
      duration = 0.14;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'coin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.linearRampToValueAtTime(1120, now + 0.07);
      duration = 0.1;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'xp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.linearRampToValueAtTime(720, now + 0.08);
      duration = 0.12;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.08);
      duration = 0.11;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    osc.start(now);
    osc.stop(now + duration + 0.02);
    if (secondaryOsc && secondaryGain && secondaryDuration > 0) {
      const secondaryStartAt = now + Math.max(0, secondaryStartOffset);
      secondaryOsc.start(secondaryStartAt);
      secondaryOsc.stop(secondaryStartAt + secondaryDuration + 0.02);
    }
  }

  function updateAudioSetting(key, value) {
    setAudioSettings((prev) => {
      const next = normalizeAudioSettings({
        ...prev,
        [key]: value
      });
      audioSettingsRef.current = next;

      const ctx = audioContextRef.current;
      if (ctx) {
        if (key === 'sfxVolume' || key === 'sfxEnabled') {
          const sfxBus = sfxGainRef.current;
          if (sfxBus) {
            const nextSfx = next.sfxEnabled ? getSfxVolumeLevel(next.sfxVolume) : 0;
            sfxBus.gain.setTargetAtTime(nextSfx, ctx.currentTime, 0.02);
          }
        }

        if (key === 'musicVolume') {
          const nextMusic = next.musicEnabled ? getMusicVolumeLevel(next.musicVolume) : 0;
          setMusicGain(nextMusic, 140);
        }

        if (key === 'musicEnabled' && !next.musicEnabled) {
          setMusicGain(0, 180);
        }
      }

      return next;
    });
  }

  function handleMusicSkip() {
    triggerMusicTrackSkip();
  }

  function clearRewardSfxTimers() {
    rewardSfxTimersRef.current.forEach((timerId) => {
      if (typeof window !== 'undefined') window.clearTimeout(timerId);
    });
    rewardSfxTimersRef.current = [];
  }

  function getRewardEffectOrigin(eventOrElement = null) {
    if (typeof window === 'undefined') {
      return { x: 240, y: 520 };
    }

    const target = eventOrElement?.currentTarget || eventOrElement?.target || eventOrElement;
    if (target instanceof HTMLElement) {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.5
        };
      }
    }

    return {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.78
    };
  }

  function playRewardCascadeSound({ xp = 0, coins = 0, durationMs = 2600 }) {
    if (typeof window === 'undefined') return;
    clearRewardSfxTimers();
    ensureAudioContext();

    const rewardXp = Math.max(0, Number(xp || 0));
    const rewardCoins = Math.max(0, Number(coins || 0));
    const coinHits = rewardCoins > 0 ? Math.max(22, Math.min(180, Math.round(rewardCoins * 2.4 + rewardXp * 0.25))) : 0;
    const xpHits = rewardXp > 0 ? Math.max(18, Math.min(150, Math.round(rewardXp * 1.55 + rewardCoins * 0.3))) : 0;
    const totalWindow = Math.max(1900, Number(durationMs || 0));

    for (let index = 0; index < coinHits; index += 1) {
      const step = coinHits <= 1 ? 0 : index / (coinHits - 1);
      const eased = Math.pow(step, 0.84);
      const timeMs = Math.round(eased * totalWindow * 0.9 + Math.random() * 28);
      const timerId = window.setTimeout(() => playSfx('coin'), timeMs);
      rewardSfxTimersRef.current.push(timerId);
    }

    for (let index = 0; index < xpHits; index += 1) {
      const step = xpHits <= 1 ? 0 : index / (xpHits - 1);
      const eased = Math.pow(step, 0.9);
      const timeMs = Math.round(eased * totalWindow * 0.94 + 120 + Math.random() * 34);
      const timerId = window.setTimeout(() => playSfx('xp'), timeMs);
      rewardSfxTimersRef.current.push(timerId);
    }

    const notifyHits = Math.max(2, Math.min(8, Math.round((coinHits + xpHits) / 65)));
    for (let index = 0; index < notifyHits; index += 1) {
      const step = notifyHits <= 1 ? 0 : index / (notifyHits - 1);
      const timeMs = Math.round(totalWindow * (0.35 + step * 0.5));
      const timerId = window.setTimeout(() => playSfx('notify'), timeMs);
      rewardSfxTimersRef.current.push(timerId);
    }

    const tailTimer = window.setTimeout(() => playSfx('success'), Math.round(totalWindow + 140));
    rewardSfxTimersRef.current.push(tailTimer);
  }

  function runRewardParticleSequence({ xp = 0, coins = 0, origin = null, onDone = null }) {
    const rewardXp = Math.max(0, Number(xp || 0));
    const rewardCoins = Math.max(0, Number(coins || 0));
    const burstStrength = Math.max(1, (rewardXp / 110) + (rewardCoins / 82));
    const durationMs = Math.max(2800, Math.min(6400, Math.round(2200 + burstStrength * 1100)));
    const hasRewards = rewardXp > 0 || rewardCoins > 0;
    if (!hasRewards) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    const particles = buildRewardParticleBurst({
      xp: rewardXp,
      coins: rewardCoins,
      origin
    });
    setRewardFxParticles(particles);
    playRewardCascadeSound({ xp: rewardXp, coins: rewardCoins, durationMs });

    if (rewardFxTimeoutRef.current && typeof window !== 'undefined') {
      window.clearTimeout(rewardFxTimeoutRef.current);
      rewardFxTimeoutRef.current = null;
    }

    if (typeof window !== 'undefined') {
      rewardFxTimeoutRef.current = window.setTimeout(() => {
        setRewardFxParticles([]);
      }, durationMs + 240);

      window.setTimeout(() => {
        if (typeof onDone === 'function') onDone();
      }, durationMs + 180);
    } else if (typeof onDone === 'function') {
      onDone();
    }
  }

  function highlightClaimedPassStage(stageId = '') {
    if (passClaimStageFlashTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(passClaimStageFlashTimerRef.current);
    }
    passClaimStageFlashTimerRef.current = null;
    const safeStageId = String(stageId || '').trim();
    if (safeStageId) {
      setPassRecentClaimStageId(safeStageId);
    }

    if (typeof window !== 'undefined') {
      passClaimStageFlashTimerRef.current = window.setTimeout(() => {
        setPassRecentClaimStageId('');
        passClaimStageFlashTimerRef.current = null;
      }, PASS_CLAIM_STAGE_FLASH_MS);
    }
  }

  function handleCollectResultRewards(event) {
    const rewardXp = Math.max(0, Number(resultState?.awardedXp || 0));
    const rewardCoins = Math.max(0, Number(resultState?.awardedCoins || 0));
    const hasRewards = rewardXp > 0 || rewardCoins > 0;
    if (!resultState || resultState.rewardsCollected || rewardCollecting || !hasRewards) return;

    setRewardCollecting(true);
    runRewardParticleSequence({
      xp: rewardXp,
      coins: rewardCoins,
      origin: getRewardEffectOrigin(event),
      onDone: () => {
        setResultState((prev) => (prev ? { ...prev, rewardsCollected: true } : prev));
        setRewardCollecting(false);
        playSfx('success');
      }
    });
  }

  function collectPvpResultRewards(event) {
    if (!pvpResultReward || pvpRewardCollecting) return;
    const rewardXp = Math.max(0, Number(pvpResultReward.xp || 0));
    const rewardCoins = Math.max(0, Number(pvpResultReward.coins || 0));
    setPvpRewardCollecting(true);
    runRewardParticleSequence({
      xp: rewardXp,
      coins: rewardCoins,
      origin: getRewardEffectOrigin(event),
      onDone: () => {
        setPvpResultReward(null);
        setPvpResultTransitionMode('');
        setPvpCompensation(null);
        resetPvpState();
        setScreen('home');
        playSfx('success');
      }
    });
  }

  function collectPvpCompensation(event) {
    if (!pvpCompensation || pvpRewardCollecting) return;
    const rewardXp = Math.max(0, Number(pvpCompensation.xp || 0));
    const rewardCoins = Math.max(0, Number(pvpCompensation.coins || 0));
    setPvpRewardCollecting(true);
    runRewardParticleSequence({
      xp: rewardXp,
      coins: rewardCoins,
      origin: getRewardEffectOrigin(event),
      onDone: () => {
        setPvpCompensation(null);
        setPvpRewardCollecting(false);
        resetPvpState();
        setScreen('home');
        playSfx('success');
      }
    });
  }

  function collectPvpTeamResultRewards(event) {
    if (!pvpTeamResultReward || pvpTeamRewardCollecting) return;
    const rewardXp = Math.max(0, Number(pvpTeamResultReward.xp || 0));
    const rewardCoins = Math.max(0, Number(pvpTeamResultReward.coins || 0));
    const roomId = String(pvpTeamRoomId || pvpTeamRoom?.id || '').trim();
    const userId = String(authUser?.uid || '').trim();
    setPvpTeamRewardCollecting(true);
    runRewardParticleSequence({
      xp: rewardXp,
      coins: rewardCoins,
      origin: getRewardEffectOrigin(event),
      onDone: () => {
        setPvpTeamResultReward(null);
        setPvpTeamRewardCollecting(false);
        resetPvpTeamState();
        setPvpMode('');
        setScreen('home');
        if (roomId && userId) {
          // Os bots já foram liberados ao aplicar o resultado da partida.
          removePvpGroupRoomMembers(PVP_GROUP_MODE_TEAM, roomId, [userId], { releaseBots: false }).catch(() => null);
        }
        playSfx('success');
      }
    });
  }

  function collectPvpEliminationResultRewards(event) {
    if (!pvpEliminationResultReward || pvpEliminationRewardCollecting) return;
    const rewardXp = Math.max(0, Number(pvpEliminationResultReward.xp || 0));
    const rewardCoins = Math.max(0, Number(pvpEliminationResultReward.coins || 0));
    const matchId = String(
      pvpEliminationResultReward?.matchId
      || pvpEliminationMatchId
      || pvpEliminationMatch?.id
      || ''
    ).trim();
    const roomId = String(pvpEliminationRoomId || pvpEliminationRoom?.id || '').trim();
    const userId = String(authUser?.uid || '').trim();
    if (matchId) {
      rememberIgnoredPvpEliminationMatch(matchId);
    }
    setPvpEliminationRewardCollecting(true);
    runRewardParticleSequence({
      xp: rewardXp,
      coins: rewardCoins,
      origin: getRewardEffectOrigin(event),
      onDone: () => {
        setPvpEliminationResultReward(null);
        setPvpEliminationRewardCollecting(false);
        resetPvpEliminationState();
        setPvpMode('');
        setScreen('home');
        if (matchId && userId) {
          leavePvpGroupMatch(PVP_GROUP_MODE_ELIMINATION, matchId, userId)
            .then((result) => {
              if (String(result?.row?.status || '').trim().toLowerCase() === 'finished') {
                return applyPvpGroupMatchBotRewards(PVP_GROUP_MODE_ELIMINATION, result.row);
              }
              return null;
            })
            .catch(() => null);
        }
        if (roomId && userId) {
          removePvpGroupRoomMembers(PVP_GROUP_MODE_ELIMINATION, roomId, [userId], { releaseBots: false }).catch(() => null);
        }
        playSfx('success');
      }
    });
  }

  async function acceptPvpMatchInvite() {
    const current = pvpStateRef.current;
    const match = current?.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (String(match.status || '').toLowerCase() !== 'pending_accept') return;
    if (matchAcceptBusy) return;

    const player1Id = String(match.player1_user_id || '').trim();
    const player2Id = String(match.player2_user_id || '').trim();
    if (userId !== player1Id && userId !== player2Id) return;

    const previousMatch = match && typeof match === 'object'
      ? { ...match }
      : null;
    const nowMs = Date.now();
    const patch = userId === player1Id
      ? { player1_accept_state: 'accepted' }
      : { player2_accept_state: 'accepted' };
    const nextPlayer1State = userId === player1Id
      ? 'accepted'
      : String(match.player1_accept_state || 'pending');
    const nextPlayer2State = userId === player2Id
      ? 'accepted'
      : String(match.player2_accept_state || 'pending');
    const bothAccepted = nextPlayer1State === 'accepted' && nextPlayer2State === 'accepted';
    if (bothAccepted && !Number(match.start_countdown_ms || 0)) {
      patch.start_countdown_ms = nowMs + PVP_MATCH_START_DELAY_MS;
      patch.both_accepted_at_ms = nowMs;
      patch.accept_deadline_ms = 0;
    }

    setMatchAcceptBusy(true);
    setPvpState((prev) => {
      if (!prev?.match || String(prev.match.id || '') !== String(match.id)) return prev;
      return {
        ...prev,
        match: {
          ...prev.match,
          ...patch
        }
      };
    });
    try {
      await updatePvpMatch(match.id, patch);
      playSfx('success');
    } catch (error) {
      if (previousMatch) {
        setPvpState((prev) => {
          if (!prev?.match || String(prev.match.id || '') !== String(match.id)) return prev;
          if (String(prev.status || '').trim().toLowerCase() !== 'pending_accept') return prev;
          return {
            ...prev,
            match: previousMatch
          };
        });
      }
      console.error('accept invite failed:', error);
      showToast('Não foi possível aceitar o confronto.');
      playSfx('error');
    } finally {
      setMatchAcceptBusy(false);
    }
  }

  async function rejectPvpMatchInvite() {
    const current = pvpStateRef.current;
    const match = current?.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (String(match.status || '').toLowerCase() !== 'pending_accept') return;
    if (matchAcceptBusy) return;

    const player1Id = String(match.player1_user_id || '').trim();
    const player2Id = String(match.player2_user_id || '').trim();
    if (userId !== player1Id && userId !== player2Id) return;

    const previousMatch = match && typeof match === 'object'
      ? { ...match }
      : null;
    const rejectAtMs = Date.now();
    const patch = userId === player1Id
      ? {
        player1_accept_state: 'rejected',
        reject_at_ms: rejectAtMs
      }
      : {
        player2_accept_state: 'rejected',
        reject_at_ms: rejectAtMs
      };

    setMatchAcceptBusy(true);
    setPvpState((prev) => {
      if (!prev?.match || String(prev.match.id || '') !== String(match.id)) return prev;
      return {
        ...prev,
        match: {
          ...prev.match,
          ...patch
        }
      };
    });
    try {
      await updatePvpMatch(match.id, patch);
      await leaveQueue(userId).catch(() => null);
      playSfx('error');
    } catch (error) {
      if (previousMatch) {
        setPvpState((prev) => {
          if (!prev?.match || String(prev.match.id || '') !== String(match.id)) return prev;
          if (String(prev.status || '').trim().toLowerCase() !== 'pending_accept') return prev;
          return {
            ...prev,
            match: previousMatch
          };
        });
      }
      console.error('reject invite failed:', error);
      showToast('Não foi possível recusar o confronto.');
      playSfx('error');
    } finally {
      setMatchAcceptBusy(false);
    }
  }

  async function refreshAdminMetrics() {
    const [metrics, daemonControl, daemonStatus, quizState] = await Promise.all([
      getArenaMetrics(35),
      getBotArenaDaemonControl().catch(() => null),
      getBotArenaDaemonStatus().catch(() => null),
      getBotArenaQuizState().catch(() => null)
    ]);
    setArenaMetrics({
      online: Math.max(0, Number(metrics?.online || 0)),
      queue: Math.max(0, Number(metrics?.queue || 0))
    });
    if (daemonControl && typeof daemonControl === 'object') {
      setBotArenaDaemonControlState(daemonControl);
    }
    if (daemonStatus && typeof daemonStatus === 'object') {
      setBotArenaDaemonStatusState(daemonStatus);
    }
    if (quizState && typeof quizState === 'object') {
      setBotArenaQuizState(quizState);
    }
  }

  async function setAdminBotArenaAutomationEnabled(mode, nextEnabled) {
    if (adminBotDaemonBusy) return;
    const safeMode = String(mode || '').trim().toLowerCase() === 'quiz' ? 'quiz' : 'pvp';
    const safeEnabled = nextEnabled === true;
    setAdminBotDaemonBusy(true);
    try {
      const actorId = String(authUser?.uid || '').trim() || 'admin';
      const patch = safeMode === 'quiz'
        ? { quiz_enabled: safeEnabled }
        : { pvp_enabled: safeEnabled };
      const updated = await setBotArenaDaemonControl(patch, actorId);
      if (updated && typeof updated === 'object') {
        setBotArenaDaemonControlState(updated);
      }
      playSfx('success');
    } catch (error) {
      console.error('set bot arena control failed:', error);
      showToast('Falha ao atualizar a automação dos bots.');
      playSfx('error');
    } finally {
      setAdminBotDaemonBusy(false);
    }
  }

  async function runAdminCleanupQueue() {
    setAdminBusy(true);
    try {
      await cleanupStaleQueueEntries(8, authUser?.uid || '');
      await cleanupDrawFinishedMatches(300).catch(() => null);
      await cleanupZeroScoreFinishedMatches(300).catch(() => null);
      await cleanupStalePendingBotUserMatches({
        maxBatch: 80,
        staleMs: 14000,
        actorUserId: String(authUser?.uid || '').trim()
      }).catch(() => null);
      await refreshAdminMetrics();
      playSfx('success');
    } catch (error) {
      console.error('admin cleanup failed:', error);
      showToast('Falha na operação admin.');
      playSfx('error');
    } finally {
      setAdminBusy(false);
    }
  }

  async function openAdminScreen() {
    if (adminAccessBusy) return;
    setAdminAccessBusy(true);
    try {
      const isAdmin = await isCurrentUserAdmin().catch(() => false);
      setIsAdminUser(isAdmin);
      if (!isAdmin) {
        setAdminAuthorized(false);
        showToast('Acesso restrito ao administrador.');
        playSfx('error');
        return;
      }
      setAdminAuthorized(true);
      setScreen('admin-monitor');
      refreshAdminMetrics().catch(() => null);
      playSfx('success');
    } finally {
      setAdminAccessBusy(false);
    }
  }

  function readCookieConsentFromDocument() {
    if (typeof document === 'undefined') return '';
    const cookieParts = String(document.cookie || '').split(';');
    for (const part of cookieParts) {
      const trimmed = part.trim();
      if (!trimmed.startsWith(`${COOKIE_CONSENT_COOKIE_KEY}=`)) continue;
      const rawValue = trimmed.slice(COOKIE_CONSENT_COOKIE_KEY.length + 1);
      const decoded = decodeURIComponent(rawValue);
      if (decoded === 'accepted' || decoded === 'essential') return decoded;
    }
    return '';
  }

  function saveCookieConsent(choice) {
    const safeChoice = choice === 'accepted' ? 'accepted' : 'essential';
    setCookieConsent(safeChoice);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, safeChoice);
      } catch {
        // ignore local storage write failure
      }
    }

    if (typeof document !== 'undefined') {
      const encoded = encodeURIComponent(safeChoice);
      document.cookie = `${COOKIE_CONSENT_COOKIE_KEY}=${encoded}; Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
    }

    if (safeChoice === 'accepted') {
      playSfx('success');
      return;
    }

    playSfx('notify');
  }

  function publishUpdateAvailability(latestSha, reason = 'version') {
    const safeLatest = String(latestSha || latestBuildShaRef.current || '').trim();
    const knownRunningSha = getKnownRunningBuildSha();
    if (safeLatest && knownRunningSha && safeLatest === knownRunningSha) {
      clearUpdateAvailability();
      return;
    }
    setUpdateState((prev) => {
      if (prev.applying) return prev;
      return {
        available: true,
        latestSha: safeLatest || prev.latestSha || '',
        applying: false,
        reason
      };
    });
  }

  function clearUpdateAvailability() {
    setUpdateState((prev) => {
      if (!prev.available && !prev.applying && !prev.latestSha && !prev.reason) return prev;
      return {
        available: false,
        latestSha: '',
        applying: false,
        reason: ''
      };
    });
  }

  function readBuildStorageValue(key) {
    if (typeof window === 'undefined') return '';
    try {
      return String(window.localStorage.getItem(key) || '').trim();
    } catch {
      return '';
    }
  }

  function writeBuildStorageValue(key, value) {
    if (typeof window === 'undefined') return;
    const safeValue = String(value || '').trim();
    try {
      if (!safeValue) {
        window.localStorage.removeItem(key);
        return;
      }
      window.localStorage.setItem(key, safeValue);
    } catch {
      // ignore local storage write failure
    }
  }

  function getKnownRunningBuildSha() {
    const runtimeSha = String(runningBuildShaRef.current || '').trim();
    if (runtimeSha) return runtimeSha;
    return readBuildStorageValue(LAST_CONFIRMED_BUILD_SHA_STORAGE_KEY);
  }

  function rememberRunningBuildSha(buildSha) {
    const safeBuildSha = String(buildSha || '').trim();
    if (!safeBuildSha) return;
    runningBuildShaRef.current = safeBuildSha;
    writeBuildStorageValue(LAST_CONFIRMED_BUILD_SHA_STORAGE_KEY, safeBuildSha);
  }

  async function ensureSwRegistration() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
    if (swRegRef.current) return swRegRef.current;
    const existing = await navigator.serviceWorker.getRegistration('/sw.js').catch(() => null);
    if (existing) swRegRef.current = existing;
    return existing;
  }

  async function cleanupLegacyServiceWorkersForMobile() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (!isLikelyMobileWeb()) return;
    if (mobileSwCleanupDoneRef.current) return;

    const runningSha = String(runningBuildShaRef.current || '').trim();
    const cleanupBuildKey = runningSha || 'unknown';
    let cleanupMarker = '';
    try {
      cleanupMarker = String(window.localStorage.getItem(MOBILE_SW_CLEANUP_STORAGE_KEY) || '').trim();
    } catch {
      cleanupMarker = '';
    }

    if (cleanupMarker && cleanupMarker === cleanupBuildKey) {
      mobileSwCleanupDoneRef.current = true;
      return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
    await Promise.all(registrations.map((registration) => registration.unregister().catch(() => null)));
    swRegRef.current = null;
    waitingWorkerRef.current = null;

    if ('caches' in window) {
      const keys = await caches.keys().catch(() => []);
      await Promise.all(keys.map((key) => caches.delete(key).catch(() => null)));
    }

    mobileSwCleanupDoneRef.current = true;
    try {
      window.localStorage.setItem(MOBILE_SW_CLEANUP_STORAGE_KEY, cleanupBuildKey);
    } catch {
      // ignore local storage write failure
    }
  }

  async function fetchLatestBuildVersion() {
    try {
      const response = await fetch(`/version.json?ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return null;
      const data = await response.json();
      const sha = String(data?.sha || '').trim();
      return sha || null;
    } catch {
      return null;
    }
  }

  async function checkForDeployUpdate() {
    if (updateCheckBusyRef.current) return;
    updateCheckBusyRef.current = true;
    try {
      const registration = await ensureSwRegistration();
      let hasWaitingWorker = false;

      if (registration) {
        swRegRef.current = registration;
        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          hasWaitingWorker = true;
        } else {
          waitingWorkerRef.current = null;
        }

        registration.update().catch(() => null);

        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          hasWaitingWorker = true;
        }
      }

      const latestSha = await fetchLatestBuildVersion();
      if (latestSha) latestBuildShaRef.current = latestSha;
      const effectiveLatestSha = String(latestSha || latestBuildShaRef.current || '').trim();
      const knownRunningSha = getKnownRunningBuildSha();

      if (effectiveLatestSha && knownRunningSha && effectiveLatestSha === knownRunningSha) {
        waitingWorkerRef.current = null;
        clearUpdateAvailability();
        return;
      }

      if (hasWaitingWorker) {
        publishUpdateAvailability(effectiveLatestSha, 'worker');
        return;
      }

      if (!effectiveLatestSha) return;

      if (!knownRunningSha) {
        publishUpdateAvailability(effectiveLatestSha, 'version_recovery');
        return;
      }

      publishUpdateAvailability(effectiveLatestSha, 'version');
    } finally {
      updateCheckBusyRef.current = false;
    }
  }

  async function applyPendingUpdate() {
    if (updateState.applying) return;
    const targetSha = String(updateState.latestSha || latestBuildShaRef.current || '').trim();
    setUpdateState((prev) => ({
      ...prev,
      available: false,
      latestSha: targetSha || prev.latestSha || '',
      applying: true,
      reason: prev.reason || 'manual'
    }));

    try {
      const registration = await ensureSwRegistration();
      if (registration) {
        swRegRef.current = registration;
        registration.update().catch(() => null);

        const waiting = registration.waiting || waitingWorkerRef.current;
        if (waiting) {
          waitingWorkerRef.current = waiting;
          try {
            waiting.postMessage({ type: 'SKIP_WAITING' });
          } catch {
            // ignore stale waiting worker message failures
          }
        } else if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((reg) => {
              if (!reg.waiting) return;
              try {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
              } catch {
                // ignore stale waiting worker message failures
              }
            });
          }).catch(() => null);
        }
      }

      const stampSource = String(targetSha || Date.now());
      const stamp = stampSource.slice(0, 12);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('swv', `${stamp}-${Date.now()}`);
      nextUrl.searchParams.set('v', stamp);
      nextUrl.searchParams.set('app_update', `${stamp}-${Date.now()}`);
      window.location.replace(nextUrl.toString());
    } catch (error) {
      console.error('update apply failed:', error);
      showToast('Não foi possível aplicar a atualização agora.');
      setUpdateState((prev) => ({ ...prev, available: true, applying: false }));
    }
  }

  useEffect(() => {
    const runningFromMeta = typeof window !== 'undefined'
      ? String(window.__CODEQUIZ_BUILD_SHA || '').trim()
      : '';
    if (runningFromMeta) {
      rememberRunningBuildSha(runningFromMeta);
      latestBuildShaRef.current = latestBuildShaRef.current || runningFromMeta;
      clearUpdateAvailability();
    }
    const runningBuiltAt = typeof window !== 'undefined'
      ? String(window.__CODEQUIZ_BUILT_AT || '').trim()
      : '';
    setBuildBadgeValue(formatBuildBadgeValue(runningFromMeta, runningBuiltAt));

    let cancelled = false;
    const bootTimers = [];
    let periodicTimer = null;

    function inspectWaitingWorker(registration) {
      if (!registration?.waiting) return false;
      waitingWorkerRef.current = registration.waiting;
      publishUpdateAvailability(latestBuildShaRef.current, 'worker');
      return true;
    }

    function bindRegistrationEvents(registration) {
      if (!registration) return;
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            inspectWaitingWorker(registration);
            checkForDeployUpdate().catch(() => null);
          }
        });
      });
    }

    async function startUpdater() {
      const isMobileWeb = isLikelyMobileWeb();
      const canUseServiceWorker = typeof window !== 'undefined' && 'serviceWorker' in navigator;
      if (isMobileWeb) {
        await cleanupLegacyServiceWorkersForMobile().catch(() => null);
      }

      if (canUseServiceWorker) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
          if (!cancelled) {
            swRegRef.current = registration;
            bindRegistrationEvents(registration);
            inspectWaitingWorker(registration);
          }
        } catch {
          // ignore sw registration failures
        }
      }

      checkForDeployUpdate().catch(() => null);
      QUICK_BOOT_CHECKS_MS.forEach((delay) => {
        const timer = setTimeout(() => checkForDeployUpdate().catch(() => null), delay);
        bootTimers.push(timer);
      });
      periodicTimer = setInterval(() => checkForDeployUpdate().catch(() => null), VERSION_CHECK_MS);
    }

    const onFocus = () => checkForDeployUpdate().catch(() => null);
    const onOnline = () => checkForDeployUpdate().catch(() => null);
    const onPageShow = () => checkForDeployUpdate().catch(() => null);
    const onControllerChange = () => checkForDeployUpdate().catch(() => null);
    const onWorkerMessage = (event) => {
      if (event?.data?.type === 'SW_ACTIVATED') {
        checkForDeployUpdate().catch(() => null);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkForDeployUpdate().catch(() => null);
      }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibility);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.addEventListener('message', onWorkerMessage);
    }

    startUpdater().catch(() => null);

    return () => {
      cancelled = true;
      bootTimers.forEach((timer) => clearTimeout(timer));
      if (periodicTimer) clearInterval(periodicTimer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibility);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        navigator.serviceWorker.removeEventListener('message', onWorkerMessage);
      }
    };
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      const ctx = ensureAudioContext();
      if (!ctx) return;
      bootstrapMusicIfNeeded(isBattleMusicFlow ? 'battle' : 'menu');
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [isBattleMusicFlow]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const state = {
      tracking: false,
      blocked: false,
      startX: 0,
      startY: 0,
      startAtMs: 0,
      movedX: 0,
      movedY: 0
    };

    const EDGE_PX = 45;
    const MIN_SWIPE_X = 60;
    const MAX_SWIPE_Y = 72;
    const MAX_DURATION_MS = 720;

    const isIgnoredTarget = (target) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
      if (target.closest('.vol-slider, .pvp-emoji-editor-list, .shop-grid, .topic-list, .difficulty-list')) return true;
      return false;
    };

    const onTouchStart = (event) => {
      if (!event.touches || event.touches.length !== 1) return;
      const touch = event.touches[0];
      state.tracking = touch.clientX <= EDGE_PX && !isIgnoredTarget(event.target);
      state.blocked = false;
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.startAtMs = Date.now();
      state.movedX = 0;
      state.movedY = 0;
    };

    const onTouchMove = (event) => {
      if (!state.tracking || !event.touches || !event.touches.length) return;
      const touch = event.touches[0];
      state.movedX = touch.clientX - state.startX;
      state.movedY = touch.clientY - state.startY;

      const absY = Math.abs(state.movedY);
      if (absY > MAX_SWIPE_Y) {
        state.tracking = false;
        return;
      }
      if (state.movedX > 8 && absY < MAX_SWIPE_Y) {
        state.blocked = true;
        event.preventDefault();
      }
    };

    const finishGesture = (isCancel = false) => {
      const durationMs = Date.now() - state.startAtMs;
      const absY = Math.abs(state.movedY);
      const shouldTrigger = !isCancel
        && state.tracking
        && state.movedX >= MIN_SWIPE_X
        && absY <= MAX_SWIPE_Y
        && durationMs <= MAX_DURATION_MS;
      state.tracking = false;
      if (!shouldTrigger) return;
      triggerAppBackNavigation('gesture');
      playSfx('click');
    };

    const onTouchEnd = (event) => {
      if (state.blocked) event.preventDefault();
      finishGesture(false);
    };
    const onTouchCancel = () => finishGesture(true);

    const historyMarker = '__codequiz_internal_nav__';
    if (!window.history.state || !window.history.state[historyMarker]) {
      window.history.replaceState({ ...(window.history.state || {}), [historyMarker]: Date.now() }, '');
    }

    const onPopState = () => {
      const handled = triggerAppBackNavigation('browser');
      if (handled) {
        window.history.pushState({ ...(window.history.state || {}), [historyMarker]: Date.now() }, '');
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchCancel, { passive: true });
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
      window.removeEventListener('popstate', onPopState);
    };
  }, [screen, pvpEmojiPickerOpen, quizMenuOpen]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const teamStatus = String(pvpTeamMatch?.status || '').trim().toLowerCase();
      const eliminationStatus = String(pvpEliminationMatch?.status || '').trim().toLowerCase();
      const eliminationQueueing = String(pvpEliminationQueueState.status || '').trim().toLowerCase() === 'queueing';
      const isMatchStartingOrActive = screen === 'pve'
        || screen === 'pvp'
        || screen === 'pvp-team'
        || screen === 'pvp-elimination'
        || pvpState.status === 'queueing'
        || eliminationQueueing
        || pvpState.status === 'active'
        || pvpState.status === 'pending_accept'
        || teamStatus === 'active'
        || teamStatus === 'round_result'
        || eliminationStatus === 'active'
        || eliminationStatus === 'round_result'
        || eliminationStatus === 'elimination_result';

      if (isMatchStartingOrActive) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [screen, pvpState.status, pvpTeamMatch?.status, pvpEliminationMatch?.status, pvpEliminationQueueState.status]);

  function getActiveMatchStorageKey(userId) {
    return `${ACTIVE_MATCH_STORAGE_KEY_PREFIX}${String(userId || '').trim()}`;
  }

  function readActiveMatchMarker(userId) {
    const safeUserId = String(userId || '').trim();
    if (!safeUserId || typeof window === 'undefined') return null;
    try {
      const marker = JSON.parse(window.localStorage.getItem(getActiveMatchStorageKey(safeUserId)) || 'null');
      if (!marker || typeof marker !== 'object' || !String(marker.matchId || '').trim()) return null;
      const ageMs = Date.now() - Math.max(0, Number(marker.savedAtMs || 0));
      return ageMs <= ACTIVE_MATCH_RESUME_MAX_AGE_MS ? marker : null;
    } catch {
      return null;
    }
  }

  function writeActiveMatchMarker(userId, marker) {
    const safeUserId = String(userId || '').trim();
    if (!safeUserId || typeof window === 'undefined') return;
    try {
      if (!marker) {
        window.localStorage.removeItem(getActiveMatchStorageKey(safeUserId));
        return;
      }
      window.localStorage.setItem(getActiveMatchStorageKey(safeUserId), JSON.stringify(marker));
    } catch {
      // ignore local storage write failure
    }
  }

  // O que precisa ser retomado se a página fechar agora: partida em andamento ou tela de
  // resultado com recompensa ainda não coletada (o resultado já entrou no progresso).
  function buildActiveMatchMarker() {
    const duelStatus = String(pvpState.status || '').trim().toLowerCase();
    const duelMatchId = String(pvpState.matchId || pvpState.match?.id || '').trim();
    if (
      duelMatchId
      && (duelStatus === 'active' || duelStatus === 'round_result' || (duelStatus === 'finished' && screen === 'pvp-result'))
    ) {
      return {
        mode: PVP_MODE_DUEL,
        matchId: duelMatchId,
        reward: pvpResultReward || null,
        compensation: pvpCompensation || null
      };
    }
    const teamStatus = String(pvpTeamMatch?.status || '').trim().toLowerCase();
    const teamMatchId = String(pvpTeamMatch?.id || pvpTeamMatchId || '').trim();
    if (teamMatchId && (teamStatus === 'active' || teamStatus === 'round_result' || screen === 'pvp-team-result')) {
      return { mode: PVP_MODE_TEAM_BATTLE, matchId: teamMatchId, reward: pvpTeamResultReward || null };
    }
    const eliminationStatus = String(pvpEliminationMatch?.status || '').trim().toLowerCase();
    const eliminationMatchId = String(pvpEliminationMatch?.id || pvpEliminationMatchId || '').trim();
    if (
      eliminationMatchId
      && (['active', 'round_result', 'elimination_result'].includes(eliminationStatus) || screen === 'pvp-elimination-result')
    ) {
      return { mode: PVP_MODE_ELIMINATION, matchId: eliminationMatchId, reward: pvpEliminationResultReward || null };
    }
    return null;
  }

  const activeMatchMarker = buildActiveMatchMarker();
  const activeMatchMarkerKey = activeMatchMarker ? JSON.stringify(activeMatchMarker) : '';

  useEffect(() => {
    const userId = String(authUser?.uid || '').trim();
    // Antes da retomada o estado ainda está vazio do recarregamento: não apaga a partida salva.
    if (!userId || matchResumeReadyUserId !== userId) return;
    const marker = activeMatchMarkerKey ? JSON.parse(activeMatchMarkerKey) : null;
    writeActiveMatchMarker(userId, marker ? { ...marker, savedAtMs: Date.now() } : null);
  }, [authUser?.uid, matchResumeReadyUserId, activeMatchMarkerKey]);

  // Ao abrir o app: volta para a partida salva neste aparelho se ela ainda está rolando,
  // ou mostra o resultado e a recompensa se ela terminou enquanto o jogador estava fora.
  async function resumeInterruptedMatch(userId) {
    const marker = readActiveMatchMarker(userId);
    if (!marker) return;
    const matchId = String(marker.matchId || '').trim();
    const fetchMatchByMode = {
      [PVP_MODE_DUEL]: getPvpMatch,
      [PVP_MODE_TEAM_BATTLE]: getPvpTeamMatch,
      [PVP_MODE_ELIMINATION]: getPvpEliminationMatch
    };
    const fetchMatch = fetchMatchByMode[marker.mode];
    if (!fetchMatch) return;
    const [row, openDuel] = await Promise.all([
      withTimeout(fetchMatch(matchId).catch(() => null), 4000, 'resume_match_fetch').catch(() => null),
      // A busca de partidas abertas já descarta duelo com bot parado há muito tempo.
      marker.mode === PVP_MODE_DUEL
        ? withTimeout(findOpenMatchForUser(userId).catch(() => null), 4000, 'resume_open_duel').catch(() => null)
        : null
    ]);
    if (!row) return;
    // Função da renderização mais recente: o progresso usado no resultado precisa estar atual.
    await matchResumeApplyFnRef.current?.(userId, marker, row, {
      duelStillOpen: String(openDuel?.id || '').trim() === matchId
    });
  }

  async function applyInterruptedMatchResume(userId, marker, row, options = {}) {
    // O jogador já saiu da tela inicial (ou trocou de conta) enquanto a partida era buscada.
    if (String(authUser?.uid || '').trim() !== userId || screen !== 'home') return;
    const matchId = String(row?.id || '').trim();
    const status = String(row?.status || '').trim().toLowerCase();
    const savedReward = marker?.reward && typeof marker.reward === 'object' ? marker.reward : null;
    const processed = !!progress?.pvpProcessedMatches?.[matchId];

    if (marker.mode === PVP_MODE_DUEL) {
      if (status === 'active' || status === 'round_result') {
        if (!options.duelStillOpen) return;
        await attachToMatch(matchId);
        return;
      }
      if (status !== 'finished' || isPvpMatchWithoutResultScreen(row)) return;
      if (!processed) {
        openFinishedPvpMatch(row);
        return;
      }
      // Resultado já aplicado antes de a página fechar: só reabre a recompensa a coletar.
      const savedCompensation = marker?.compensation && typeof marker.compensation === 'object'
        ? marker.compensation
        : null;
      if (!savedReward && !savedCompensation) return;
      handledMatchIdsRef.current.add(matchId);
      setPvpState((prev) => ({
        ...prev,
        status: 'finished',
        matchId,
        match: row,
        result: getPvpResultForUser(row, userId)
      }));
      setPvpResultTransitionMode('');
      setPvpResultReward(savedCompensation ? null : savedReward);
      setPvpCompensation(savedCompensation);
      setScreen('pvp-result');
      return;
    }

    if (marker.mode === PVP_MODE_TEAM_BATTLE) {
      // Quem abandonou já levou o W.O.: não há partida nem recompensa para retomar.
      if (getPvpGroupMatchGoneIds(row, PVP_GROUP_MODE_TEAM).includes(userId)) return;
      if (status === 'active' || status === 'round_result') {
        if (isPvpGroupMatchStale(row)) return;
        setPvpMode(PVP_MODE_TEAM_BATTLE);
        if (String(row?.room_id || '').trim()) {
          setPvpTeamRoomId(String(row.room_id).trim());
        }
        setPvpTeamMatchId(matchId);
        setPvpTeamMatch(row);
        setScreen('pvp-team');
        return;
      }
      if (status !== 'finished' || (processed && !savedReward)) return;
      await handlePvpTeamMatchFinished(row);
      if (processed) setPvpTeamResultReward(savedReward);
      return;
    }

    if (marker.mode === PVP_MODE_ELIMINATION) {
      if (getPvpGroupMatchGoneIds(row, PVP_GROUP_MODE_ELIMINATION).includes(userId)) {
        // Saiu recebendo a colocação: o resultado já foi aplicado, falta só coletar.
        const placement = Math.max(0, Number(savedReward?.placement || 0));
        if (!savedReward || !placement) return;
        rememberIgnoredPvpEliminationMatch(matchId);
        await handlePvpEliminationMatchFinished(row, { allowEarly: true, forcePlacement: placement });
        setPvpEliminationResultReward(savedReward);
        return;
      }
      if (status === 'active' || status === 'round_result' || status === 'elimination_result') {
        if (isPvpGroupMatchStale(row)) return;
        setPvpMode(PVP_MODE_ELIMINATION);
        if (String(row?.room_id || '').trim()) {
          setPvpEliminationRoomId(String(row.room_id).trim());
        }
        setPvpEliminationMatchId(matchId);
        setPvpEliminationMatch(row);
        setPvpEliminationQueueState({
          status: 'idle',
          joinedAtMs: 0,
          sessionId: '',
          message: ''
        });
        setScreen('pvp-elimination');
        return;
      }
      if (status !== 'finished' || (processed && !savedReward)) return;
      await handlePvpEliminationMatchFinished(row);
      if (processed) setPvpEliminationResultReward(savedReward);
    }
  }

  matchResumeApplyFnRef.current = applyInterruptedMatchResume;

  useEffect(() => {
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !profile?.id || !progressReady || !shopReady || booting || screen !== 'home') return;
    if (matchResumeStartedUserIdRef.current === userId) return;
    matchResumeStartedUserIdRef.current = userId;
    resumeInterruptedMatch(userId)
      .catch((error) => console.error('match resume failed:', error))
      .finally(() => setMatchResumeReadyUserId(userId));
  }, [authUser?.uid, profile?.id, progressReady, shopReady, booting, screen]);

  useEffect(() => {
    const sfxBus = sfxGainRef.current;
    if (sfxBus && audioContextRef.current) {
      sfxBus.gain.setValueAtTime(
        audioSettings.sfxEnabled ? getSfxVolumeLevel(audioSettings.sfxVolume) : 0,
        audioContextRef.current.currentTime
      );
    }

    const nextBattleFlow = isBattleMusicFlow;
    const prevBattleFlow = musicBattleFlowRef.current;
    const switchedBattleFlow = prevBattleFlow !== nextBattleFlow;
    musicBattleFlowRef.current = nextBattleFlow;
    const nextMode = nextBattleFlow ? 'battle' : 'menu';

    if (!audioSettings.musicEnabled) {
      clearMusicLoop();
      setMusicGain(0, 220);
      return;
    }

    if (!musicLoopTimerRef.current) {
      startMusicLoop(nextMode);
      setMusicGain(getMusicVolumeLevel(audioSettings.musicVolume), 320);
      return;
    }

    if (switchedBattleFlow) {
      applyMusicMode(nextMode);
      return;
    }

    setMusicGain(getMusicVolumeLevel(audioSettings.musicVolume), 240);
  }, [
    audioSettings.musicEnabled,
    audioSettings.musicVolume,
    audioSettings.sfxEnabled,
    audioSettings.sfxVolume,
    isBattleMusicFlow
  ]);

  useEffect(() => {
    return () => {
      themeIntroTokenRef.current += 1;
      if (themeIntroTimerRef.current && typeof window !== 'undefined') {
        window.clearTimeout(themeIntroTimerRef.current);
        themeIntroTimerRef.current = null;
      }
      if (themeIntroLockTimerRef.current && typeof window !== 'undefined') {
        window.clearTimeout(themeIntroLockTimerRef.current);
        themeIntroLockTimerRef.current = null;
      }
      clearBotAnswerTimer();
      clearBotReactionTimers();
      clearMusicLoop();
      clearRewardSfxTimers();
      if (passClaimStageFlashTimerRef.current && typeof window !== 'undefined') {
        window.clearTimeout(passClaimStageFlashTimerRef.current);
        passClaimStageFlashTimerRef.current = null;
      }
      if (rewardFxTimeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(rewardFxTimeoutRef.current);
        rewardFxTimeoutRef.current = null;
      }
      const ctx = audioContextRef.current;
      if (ctx) {
        ctx.close().catch(() => null);
      }
    };
  }, []);

  function showToast(message) {
    if (!message) return;
    setToast(String(message));
  }

  function clearThemeIntroTimer() {
    if (themeIntroTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(themeIntroTimerRef.current);
    }
    themeIntroTimerRef.current = null;
    if (themeIntroLockTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(themeIntroLockTimerRef.current);
    }
    themeIntroLockTimerRef.current = null;
  }

  function buildThemeIntroViewModel(payload = {}) {
    const safeMode = String(payload?.mode || 'pve').trim().toLowerCase() === 'pvp' ? 'pvp' : 'pve';
    const safeRoundNo = Math.max(1, Math.trunc(Number(payload?.roundNo || 1)));
    const safeLanguageId = String(payload?.languageId || '').trim();
    const safeTopicId = String(payload?.topicId || '').trim();
    const safeDifficulty = normalizeDifficulty(payload?.difficulty || 'easy');
    const safeLanguageLabel = safeLanguageId ? getLanguageNameById(safeLanguageId) : 'Conteúdo geral';
    const safeTopicLabel = safeTopicId
      ? getTopicNameById(safeLanguageId, safeTopicId)
      : 'Tema geral';
    const safeTopicIcon = getTopicEmojiById(safeLanguageId, safeTopicId);
    const roulette = buildThemeIntroRoulette(safeTopicIcon, getTopicEmojiPool(safeLanguageId, safeTopicIcon));
    const difficultyLabel = DIFFICULTY_LABELS[safeDifficulty] || DIFFICULTY_LABELS.easy;
    return {
      mode: safeMode,
      kicker: safeMode === 'pvp' ? `PvP · Rodada ${safeRoundNo}` : 'Quiz PvE',
      title: safeTopicLabel,
      subtitle: `${safeLanguageLabel} · ${difficultyLabel}`,
      icon: safeTopicIcon,
      rouletteItems: roulette.items,
      rouletteTargetIndex: roulette.targetIndex,
      rouletteRailLeftPx: roulette.railLeftPx,
      rouletteStartOffsetPx: roulette.rollStartOffsetPx
    };
  }

  function runThemeIntroOverlay(payload = {}, options = {}) {
    const model = buildThemeIntroViewModel(payload);
    const durationDefault = model.mode === 'pvp'
      ? THEME_INTRO_PVP_DURATION_MS
      : THEME_INTRO_PVE_DURATION_MS;
    const durationMs = Math.max(280, Math.trunc(Number(options?.durationMs || durationDefault)));
    const holdDurationDefault = model.mode === 'pvp'
      ? THEME_INTRO_PVP_SELECTED_HOLD_MS
      : THEME_INTRO_PVE_SELECTED_HOLD_MS;
    const holdDurationMs = Math.max(360, Math.trunc(Number(options?.holdDurationMs || holdDurationDefault)));
    let rollDurationMs = durationMs - holdDurationMs;
    rollDurationMs = Math.max(520, rollDurationMs);
    rollDurationMs = Math.min(durationMs - 120, rollDurationMs);
    if (rollDurationMs < 180) {
      rollDurationMs = Math.max(120, durationMs - 80);
    }
    const onComplete = typeof options?.onComplete === 'function' ? options.onComplete : null;
    const token = themeIntroTokenRef.current + 1;
    themeIntroTokenRef.current = token;
    clearThemeIntroTimer();

    setThemeIntro({
      visible: true,
      mode: model.mode,
      kicker: model.kicker,
      title: model.title,
      subtitle: model.subtitle,
      icon: model.icon,
      phase: 'rolling',
      durationMs,
      rollDurationMs,
      rouletteItems: model.rouletteItems,
      rouletteTargetIndex: model.rouletteTargetIndex,
      rouletteRailLeftPx: model.rouletteRailLeftPx,
      rouletteStartOffsetPx: model.rouletteStartOffsetPx
    });
    playSfx('theme_intro');

    if (typeof window === 'undefined') {
      setThemeIntro((prev) => ({ ...prev, visible: false }));
      if (onComplete) onComplete();
      return;
    }

    themeIntroLockTimerRef.current = window.setTimeout(() => {
      if (themeIntroTokenRef.current !== token) return;
      themeIntroLockTimerRef.current = null;
      setThemeIntro((prev) => ({ ...prev, phase: 'locked' }));
      playSfx('pvp_confirm');
    }, rollDurationMs);

    themeIntroTimerRef.current = window.setTimeout(() => {
      if (themeIntroTokenRef.current !== token) return;
      themeIntroTimerRef.current = null;
      if (themeIntroLockTimerRef.current && typeof window !== 'undefined') {
        window.clearTimeout(themeIntroLockTimerRef.current);
      }
      themeIntroLockTimerRef.current = null;
      setThemeIntro((prev) => ({ ...prev, visible: false }));
      if (onComplete) onComplete();
    }, durationMs);
  }

  function openPvpEmojiPicker() {
    const nextDraft = normalizeEmojiDraftSlots(pvpBattleEmojis);
    setPvpEmojiDraft(nextDraft);
    setPvpEmojiDraftWarning('');
    setPvpEmojiSlotFocus(getNextEmptyEmojiSlot(nextDraft));
    setPvpEmojiPickerOpen(true);
  }

  function closePvpEmojiPicker() {
    setPvpEmojiDraftWarning('');
    setPvpEmojiPickerOpen(false);
  }

  function togglePvpEmojiDraft(emoji) {
    const safe = String(emoji || '').trim();
    if (!safe) return;
    setPvpEmojiDraftWarning('');
    const current = normalizeEmojiDraftSlots(pvpEmojiDraft);
    const next = applyEmojiToDraft(current, safe, pvpEmojiSlotFocus);
    setPvpEmojiDraft(next);
    setPvpEmojiSlotFocus(Math.min(5, getNextEmptyEmojiSlot(next)));
  }

  function selectPvpEmojiSlot(index) {
    const safeIndex = Math.max(0, Math.min(5, Number(index || 0)));
    setPvpEmojiSlotFocus(safeIndex);
  }

  function removePvpEmojiAt(index) {
    setPvpEmojiDraftWarning('');
    const next = removeEmojiFromDraftByIndex(pvpEmojiDraft, index);
    setPvpEmojiDraft(next);
    setPvpEmojiSlotFocus(Math.max(0, Math.min(5, Number(index || 0))));
  }

  function savePvpEmojiDraft() {
    const draftSlots = normalizeEmojiDraftSlots(pvpEmojiDraft);
    const missingSlots = getMissingEmojiSlotIndexes(draftSlots);
    if (missingSlots.length) {
      const slotsLabel = missingSlots.join(', ');
      const warning = missingSlots.length === 1
        ? `Selecione o emoji do slot ${slotsLabel} para salvar.`
        : `Selecione os emojis dos slots ${slotsLabel} para salvar.`;
      setPvpEmojiDraftWarning(warning);
      showToast(`Preencha os 6 emojis antes de salvar. Faltando: ${slotsLabel}.`);
      playSfx('error');
      return;
    }
    const next = draftSlots.map((emoji) => String(emoji || '').trim()).filter((emoji) => !!emoji);
    setPvpBattleEmojis(next);
    setPvpEmojiPickerOpen(false);
    setPvpEmojiDraftWarning('');
    playSfx('success');
  }

  function clearBotAnswerTimer() {
    if (botAnswerTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(botAnswerTimerRef.current);
    }
    botAnswerTimerRef.current = null;
    botAnswerRoundKeyRef.current = '';
  }

  function clearPvpRoundResultFeedbackTimer(resetKey = false) {
    if (pvpRoundResultFeedbackTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(pvpRoundResultFeedbackTimerRef.current);
    }
    pvpRoundResultFeedbackTimerRef.current = null;
    if (resetKey) {
      pvpRoundResultFeedbackKeyRef.current = '';
    }
  }

  function clearPvpResultAudioTimers(resetKey = false) {
    if (typeof window !== 'undefined') {
      pvpResultAudioTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    }
    pvpResultAudioTimersRef.current = [];
    if (resetKey) {
      pvpResultAudioKeyRef.current = '';
    }
  }

  function clearBotReactionTimers() {
    if (typeof window !== 'undefined') {
      botReactionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    }
    botReactionTimersRef.current = [];
  }

  function rememberPvpEmojiEventId(eventId) {
    const safeEventId = String(eventId || '').trim();
    if (!safeEventId) return false;
    if (pvpSeenEmojiEventIdsRef.current.has(safeEventId)) return false;
    pvpSeenEmojiEventIdsRef.current.add(safeEventId);
    pvpSeenEmojiEventOrderRef.current.push(safeEventId);
    if (pvpSeenEmojiEventOrderRef.current.length > 320) {
      const overflow = pvpSeenEmojiEventOrderRef.current.splice(0, pvpSeenEmojiEventOrderRef.current.length - 240);
      overflow.forEach((id) => pvpSeenEmojiEventIdsRef.current.delete(id));
    }
    return true;
  }

  // Emojis na tela de dois canais: o duelo 1x1 e as partidas em grupo. Cada canal tem
  // os próprios timers, para limpar um sem deixar emojis do outro presos na tela.
  function getPvpEmojiFxSetter(channel) {
    return channel === 'group' ? setPvpGroupEmojiFx : setPvpEmojiFx;
  }

  function trackPvpEmojiFxTimer(channel, callback, delayMs) {
    const timers = pvpEmojiFxTimersRef.current;
    const timerId = window.setTimeout(() => {
      timers[channel] = (timers[channel] || []).filter((id) => id !== timerId);
      callback();
    }, Math.max(0, delayMs));
    timers[channel] = [...(timers[channel] || []), timerId];
  }

  function clearPvpEmojiFxTimers(channel) {
    const timers = pvpEmojiFxTimersRef.current;
    if (typeof window !== 'undefined') {
      (timers[channel] || []).forEach((timerId) => window.clearTimeout(timerId));
    }
    timers[channel] = [];
    Array.from(pvpEmojiReplayLanesRef.current.keys())
      .filter((key) => key.startsWith(`${channel}|`))
      .forEach((key) => pvpEmojiReplayLanesRef.current.delete(key));
  }

  // Mostra um emoji no ritmo em que o remetente mandou: um lote que chega junto pelo
  // polling sai espaçado como foi enviado, cada emoji numa faixa livre do seu lado,
  // e só sai da tela depois da animação completa.
  function showPvpEmojiFx(channel, { fxId, emoji, side, label = '', senderKey = '', sentAtMs = 0 }) {
    if (typeof window === 'undefined') return;
    const setFx = getPvpEmojiFxSetter(channel);
    const nowMs = Date.now();
    const laneKey = `${channel}|${String(senderKey || side || '')}`;
    const replay = schedulePvpEmojiReplay(pvpEmojiReplayLanesRef.current.get(laneKey), sentAtMs, nowMs);
    if (replay.drop) return;
    pvpEmojiReplayLanesRef.current.set(laneKey, replay.lane);
    const safeSide = side === 'left' ? 'left' : 'right';
    const appear = () => {
      setFx((prev) => {
        if (prev.some((item) => item.id === fxId)) return prev;
        return [
          ...prev,
          { id: fxId, emoji, side: safeSide, label, shownAtMs: Date.now(), ...pickPvpEmojiFxLane(prev, safeSide) }
        ];
      });
      trackPvpEmojiFxTimer(channel, () => {
        setFx((prev) => prev.filter((item) => item.id !== fxId));
      }, PVP_EMOJI_FX_DURATION_MS + 120);
    };
    const waitMs = replay.showAtMs - nowMs;
    if (waitMs < 16) {
      appear();
      return;
    }
    trackPvpEmojiFxTimer(channel, appear, waitMs);
  }

  function addPvpEmojiFxFromEvent(event) {
    const safeEvent = event && typeof event === 'object' ? event : {};
    const eventId = String(safeEvent.id || '').trim();
    if (!rememberPvpEmojiEventId(eventId)) return;
    const senderId = String(safeEvent.sender_user_id || '').trim();
    const emoji = String(safeEvent.emoji || '').trim() || '💬';
    const match = pvpStateRef.current?.match;
    const side = senderId && senderId === String(match?.player1_user_id || '').trim()
      ? 'left'
      : 'right';
    showPvpEmojiFx('duel', {
      fxId: `pvp_emoji_${eventId}`,
      emoji,
      side,
      senderKey: `${String(match?.id || '')}:${senderId}`,
      sentAtMs: safeEvent.sent_at_ms
    });
    setLatestPvpEmojiEvent({
      id: eventId,
      sender_user_id: senderId,
      emoji,
      sent_at_ms: Math.max(0, Number(safeEvent.sent_at_ms || Date.now()))
    });
  }

  async function processPvpEmojiSendQueue() {
    if (pvpEmojiSendBusyRef.current) return;
    pvpEmojiSendBusyRef.current = true;
    try {
      while (pvpEmojiSendQueueRef.current.length) {
        const nextEvent = pvpEmojiSendQueueRef.current.shift();
        if (!nextEvent || typeof nextEvent !== 'object') continue;
        const safeMatchId = String(nextEvent.matchId || '').trim();
        const safeSenderId = String(nextEvent.senderUserId || '').trim();
        const safeEmoji = String(nextEvent.emoji || '').trim();
        if (!safeMatchId || !safeSenderId || !safeEmoji) continue;
        if (!isPvpEmojiChannelOpen(nextEvent.mode, safeMatchId)) continue;

        const nowMs = Math.max(1, Number(nextEvent.sentAtMs || Date.now()));
        await pushPvpEmojiEvent(safeMatchId, {
          id: String(nextEvent.eventId || '').trim(),
          sender_user_id: safeSenderId,
          emoji: safeEmoji,
          sent_at_ms: nowMs,
          sent_at: new Date(nowMs).toISOString(),
          created_at: new Date(nowMs).toISOString()
        }).catch((error) => {
          console.error('push emoji event failed:', error);
        });

        pvpEmojiSendCountRef.current += 1;
        if (pvpEmojiSendCountRef.current % 2 === 0 && typeof window !== 'undefined') {
          await new Promise((resolve) => window.setTimeout(resolve, 180));
        }
      }
    } finally {
      pvpEmojiSendBusyRef.current = false;
    }
  }

  // A partida (duelo, 2x2 ou eliminatória) ainda aceita emojis?
  function isPvpEmojiChannelOpen(mode, matchId) {
    const safeMatchId = String(matchId || '').trim();
    if (mode === PVP_GROUP_MODE_TEAM || mode === PVP_GROUP_MODE_ELIMINATION) {
      const match = mode === PVP_GROUP_MODE_TEAM ? pvpTeamMatchRef.current : pvpEliminationMatchRef.current;
      const status = String(match?.status || '').trim().toLowerCase();
      const openStatuses = mode === PVP_GROUP_MODE_TEAM
        ? ['active', 'round_result']
        : ['active', 'round_result', 'elimination_result'];
      // Na tela de resultado final o canal continua aberto para comemorar e cumprimentar.
      const onResultScreen = status === 'finished' && pvpGroupResultScreenModeRef.current === mode;
      return String(match?.id || '').trim() === safeMatchId && (openStatuses.includes(status) || onResultScreen);
    }
    const current = pvpStateRef.current;
    const currentMatchId = String(current?.match?.id || current?.matchId || '').trim();
    const currentStatus = String(current?.status || '').trim().toLowerCase();
    return currentMatchId === safeMatchId
      && (currentStatus === 'active' || currentStatus === 'round_result' || currentStatus === 'pending_accept');
  }

  function queuePvpEmojiSend(matchId, senderUserId, emoji, eventId = '', mode = '') {
    const safeMatchId = String(matchId || '').trim();
    const safeSenderId = String(senderUserId || '').trim();
    const safeEmoji = String(emoji || '').trim();
    if (!safeMatchId || !safeSenderId || !safeEmoji) return;
    pvpEmojiSendQueueRef.current.push({
      mode,
      matchId: safeMatchId,
      senderUserId: safeSenderId,
      emoji: safeEmoji,
      eventId: String(eventId || '').trim() || `${safeSenderId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      sentAtMs: Date.now()
    });
    processPvpEmojiSendQueue().catch(() => null);
  }

  function queueBotEmojiBurst({
    matchId = '',
    botUserId = '',
    personality = 'provocador',
    countMin = 1,
    countMax = 2,
    intervalMinMs = 1000,
    intervalMaxMs = 2000,
    initialDelayMs = 0
  }) {
    const safeMatchId = String(matchId || '').trim();
    const safeBotUserId = String(botUserId || '').trim();
    if (!safeMatchId || typeof window === 'undefined') return;
    const pool = getBotEmojiPool(personality, safeBotUserId);
    if (!pool.length) return;

    const total = Math.max(1, Math.floor(countMin + Math.random() * (Math.max(countMin, countMax) - countMin + 1)));
    let delay = Math.max(0, Number(initialDelayMs || 0));

    for (let index = 0; index < total; index += 1) {
      const timerId = window.setTimeout(async () => {
        const current = pvpStateRef.current;
        const currentMatch = current?.match;
        if (!currentMatch || String(currentMatch.id || '') !== safeMatchId) return;
        const status = String(currentMatch.status || '').toLowerCase();
        if (status !== 'active' && status !== 'round_result') return;
        const botIdFromMatch = getMatchBotUserId(currentMatch);
        const eventBotUserId = safeBotUserId || botIdFromMatch || SYSTEM_BOT_ID;
        if (!isSystemBotUserId(eventBotUserId)) return;

        const emoji = pool[Math.floor(Math.random() * pool.length)];
        const eventId = `${eventBotUserId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        queuePvpEmojiSend(safeMatchId, eventBotUserId, emoji, eventId);
      }, delay);
      botReactionTimersRef.current.push(timerId);
      const stepMin = Math.max(200, Number(intervalMinMs || 1000));
      const stepMax = Math.max(stepMin, Number(intervalMaxMs || 2000));
      delay += Math.round(stepMin + Math.random() * (stepMax - stepMin));
    }
  }

  // Anti-spam compartilhado por todos os modos: muitos emojis seguidos liberam uma pausa.
  function isPvpEmojiOnCooldown(nowMs) {
    return Math.max(0, Number(pvpEmojiCooldownUntilRef.current || 0)) > nowMs;
  }

  function registerPvpEmojiSend(nowMs) {
    const spamWindowStartMs = nowMs - PVP_EMOJI_SPAM_WINDOW_MS;
    const recentSends = Array.isArray(pvpEmojiSpamWindowRef.current)
      ? pvpEmojiSpamWindowRef.current.filter((stampMs) => Number(stampMs) >= spamWindowStartMs)
      : [];
    recentSends.push(nowMs);
    const triggerCooldown = recentSends.length >= PVP_EMOJI_SPAM_BURST_LIMIT;
    pvpEmojiSpamWindowRef.current = triggerCooldown ? [] : recentSends;
    if (triggerCooldown) {
      const nextCooldownUntilMs = nowMs + PVP_EMOJI_SPAM_COOLDOWN_MS;
      pvpEmojiCooldownUntilRef.current = nextCooldownUntilMs;
      setPvpEmojiCooldownUntilMs(nextCooldownUntilMs);
    }
  }

  // ---------------------------------------------------------------------------
  // Emojis nas partidas 2x2 e Um contra todos
  // ---------------------------------------------------------------------------

  function getPvpGroupEmojiMatch(mode) {
    return mode === PVP_GROUP_MODE_TEAM ? pvpTeamMatchRef.current : pvpEliminationMatchRef.current;
  }

  // Lado da tela e nome de quem mandou: no 2x2 cada time tem o seu lado; na eliminatória
  // quem duela fica do seu lado do placar e quem assiste alterna entre os dois.
  function getPvpGroupEmojiPlacement(match, mode, senderId) {
    const myUserId = String(authUser?.uid || '').trim();
    const members = mode === PVP_GROUP_MODE_TEAM
      ? [...getPvpTeamMembersBySide(match, 'red'), ...getPvpTeamMembersBySide(match, 'blue')]
      : getPvpEliminationMembers(match);
    const member = members.find((entry) => String(entry?.user_id || '').trim() === senderId) || null;
    const label = senderId === myUserId ? 'Você' : (String(member?.nickname || '').trim() || 'Jogador');
    if (mode === PVP_GROUP_MODE_TEAM) {
      return { label, side: getPvpTeamUserSide(match, senderId) === 'blue' ? 'right' : 'left' };
    }
    const [user1, user2] = getPvpGroupBattlePairIds(match, mode);
    if (senderId === user1) return { label, side: 'left' };
    if (senderId === user2) return { label, side: 'right' };
    const memberIndex = getPvpGroupMatchMemberIds(match, mode).indexOf(senderId);
    return { label, side: memberIndex % 2 === 0 ? 'left' : 'right' };
  }

  function showPvpGroupEmojiFx(fxId, emoji, placement, senderKey = '', sentAtMs = 0) {
    showPvpEmojiFx('group', {
      fxId,
      emoji,
      side: placement.side,
      label: placement.label,
      senderKey,
      sentAtMs
    });
  }

  function isPvpGroupEmojiDriver(mode, match) {
    const myUserId = String(authUser?.uid || '').trim();
    if (!myUserId) return false;
    const driverId = getPvpGroupEmojiDriverId(match, mode);
    if (driverId) return driverId === myUserId;
    // Ninguém mais conta como presente (ex.: saíram com a colocação na eliminatória):
    // quem ainda está vendo a partida conduz os bots.
    return getPvpGroupMatchMemberIds(match, mode).includes(myUserId);
  }

  function rememberPvpGroupBotEmojiKey(key) {
    if (pvpGroupBotEmojiKeysRef.current.has(key)) return false;
    pvpGroupBotEmojiKeysRef.current.add(key);
    return true;
  }

  function clearPvpGroupBotEmojiTimers() {
    if (typeof window !== 'undefined') {
      pvpGroupBotEmojiTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    }
    pvpGroupBotEmojiTimersRef.current = [];
  }

  // Agenda os emojis de um bot. O emoji combina com o clima do momento (comemorar,
  // lamentar, provocar, torcer, pensar, cumprimentar) ou repete o emoji indicado.
  function queuePvpGroupBotEmojis(mode, matchId, botId, count = 1, initialDelayMs = 0, mood = '', fixedEmoji = '') {
    const safeMatchId = String(matchId || '').trim();
    const safeBotId = String(botId || '').trim();
    if (!safeMatchId || !isSystemBotUserId(safeBotId) || typeof window === 'undefined') return;
    let delayMs = Math.max(0, Number(initialDelayMs || 0));
    const total = Math.max(1, Math.min(3, Number(count || 1)));
    for (let index = 0; index < total; index += 1) {
      const timerId = window.setTimeout(() => {
        pvpGroupBotEmojiTimersRef.current = pvpGroupBotEmojiTimersRef.current.filter((id) => id !== timerId);
        if (!isPvpEmojiChannelOpen(mode, safeMatchId)) return;
        const emoji = (index === 0 && String(fixedEmoji || '').trim())
          || pickBotMoodEmoji(safeBotId, mood, Math.random, BOT_CONFIG_DEFAULT.personality);
        const eventId = `${safeBotId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        queuePvpEmojiSend(safeMatchId, safeBotId, emoji, eventId, mode);
      }, delayMs);
      pvpGroupBotEmojiTimersRef.current.push(timerId);
      // A conversa de fundo espera os emojis já agendados saírem.
      pvpGroupBotEmojiLastAtRef.current = Math.max(pvpGroupBotEmojiLastAtRef.current, Date.now() + delayMs);
      delayMs += Math.round(900 + Math.random() * 900);
    }
  }

  function queuePvpGroupBotEmojiPlan(mode, matchId, plan) {
    (Array.isArray(plan) ? plan : []).forEach((entry) => {
      queuePvpGroupBotEmojis(mode, matchId, entry?.botId, entry?.count, entry?.delayMs, entry?.mood, entry?.emoji);
    });
  }

  // Alguém mandou emoji e os bots respondem. Emoji de pessoa: quem agenda a resposta é o
  // aparelho de quem mandou (sempre presente, e cada emoji puxa uma única rodada de
  // respostas). Emoji de bot: o aparelho que conduz os bots, bem de vez em quando.
  function queuePvpGroupBotEmojiReplies(mode, senderId, emoji = '') {
    const match = getPvpGroupEmojiMatch(mode);
    if (!match?.id || !isPvpEmojiChannelOpen(mode, match.id)) return;
    const fromBot = isSystemBotUserId(senderId);
    if (fromBot && !isPvpGroupEmojiDriver(mode, match)) return;
    const nowMs = Date.now();
    const throttleRef = fromBot ? pvpGroupBotEmojiChatAtRef : pvpGroupBotEmojiReplyAtRef;
    if (nowMs - throttleRef.current < (fromBot ? 8000 : 2500)) return;
    const replies = pickPvpGroupBotEmojiReplies(match, mode, senderId, { emoji });
    if (!replies.length) return;
    throttleRef.current = nowMs;
    queuePvpGroupBotEmojiPlan(mode, match.id, replies);
  }

  function sendPvpGroupEmoji(mode, emoji) {
    const safeEmoji = String(emoji || '').trim();
    const match = getPvpGroupEmojiMatch(mode);
    const userId = String(authUser?.uid || '').trim();
    if (!safeEmoji || !userId || !match?.id || !isPvpEmojiChannelOpen(mode, match.id)) return;
    if (!getPvpGroupMatchMemberIds(match, mode).includes(userId)) return;
    if (getPvpGroupMatchGoneIds(match, mode).includes(userId)) return;
    const nowMs = Date.now();
    if (isPvpEmojiOnCooldown(nowMs)) {
      playSfx('error');
      return;
    }
    registerPvpEmojiSend(nowMs);
    const eventId = `${userId}_${nowMs}_${Math.floor(Math.random() * 10000)}`;
    rememberPvpEmojiEventId(eventId);
    showPvpGroupEmojiFx(
      `pvp_group_emoji_local_${eventId}`,
      safeEmoji,
      getPvpGroupEmojiPlacement(match, mode, userId),
      `${match.id}:${userId}`,
      nowMs
    );
    queuePvpEmojiSend(String(match.id), userId, safeEmoji, eventId, mode);
    queuePvpGroupBotEmojiReplies(mode, userId, safeEmoji);
    playSfx('notify');
  }

  // Separa, numa leitura da lista de emojis da partida, só os que chegaram desde a
  // leitura anterior. A primeira leitura de cada partida traz o histórico, que só é
  // marcado como visto: não reaparece de uma vez ao entrar, recarregar a página ou
  // reabrir o canal (na tela de resultado, por exemplo).
  function takeNewPvpEmojiEvents(channelKey, events) {
    const knownByChannel = pvpEmojiKnownIdsRef.current;
    const safeEvents = Array.isArray(events) ? events : [];
    const known = knownByChannel.get(channelKey);
    if (!known) {
      knownByChannel.set(channelKey, new Set(safeEvents.map((event) => String(event?.id || '').trim()).filter(Boolean)));
      if (knownByChannel.size > 8) knownByChannel.delete(knownByChannel.keys().next().value);
      return [];
    }
    return safeEvents.filter((event) => {
      const eventId = String(event?.id || '').trim();
      if (!eventId || known.has(eventId)) return false;
      known.add(eventId);
      return true;
    });
  }

  function subscribePvpGroupEmojis(mode, matchId) {
    return subscribePvpEmojiEvents(
      matchId,
      (events) => {
        takeNewPvpEmojiEvents(`${mode}:${matchId}`, events).forEach((event) => {
          const eventId = String(event?.id || '').trim();
          if (!rememberPvpEmojiEventId(eventId)) return;
          const match = getPvpGroupEmojiMatch(mode);
          const senderId = String(event?.sender_user_id || '').trim();
          if (!senderId || String(match?.id || '').trim() !== String(matchId)) return;
          const emoji = String(event?.emoji || '').trim() || '💬';
          showPvpGroupEmojiFx(
            `pvp_group_emoji_${eventId}`,
            emoji,
            getPvpGroupEmojiPlacement(match, mode, senderId),
            `${matchId}:${senderId}`,
            event?.sent_at_ms
          );
          if (isSystemBotUserId(senderId)) queuePvpGroupBotEmojiReplies(mode, senderId, emoji);
        });
      },
      (error) => {
        console.error('group emoji events subscription error:', error);
      }
    );
  }

  // Bot da dupla respondeu antes do adversário: às vezes provoca enquanto espera.
  function schedulePvpGroupFirstAnswerEmojis(mode, match, answerRows) {
    if (String(match?.status || '').trim().toLowerCase() !== 'active' || !match?.id) return;
    if (!isPvpGroupEmojiDriver(mode, match)) return;
    const battleNo = Math.max(1, Number(match.battle_no || 1));
    const answeredIds = (Array.isArray(answerRows) ? answerRows : [])
      .filter((row) => Math.max(1, Number(row?.battle_no || battleNo)) === battleNo && Number(row?.answer_idx ?? -1) >= 0)
      .map((row) => String(row?.user_id || '').trim());
    const pairIds = getPvpGroupBattlePairIds(match, mode);
    pairIds.forEach((botId) => {
      if (!isSystemBotUserId(botId) || !answeredIds.includes(botId)) return;
      const rivalId = pairIds.find((userId) => userId !== botId);
      if (answeredIds.includes(rivalId)) return;
      if (!rememberPvpGroupBotEmojiKey(`${match.id}_first_${battleNo}_${botId}`)) return;
      if (Math.random() < PVP_GROUP_BOT_FIRST_ANSWER_EMOJI_CHANCE) {
        queuePvpGroupBotEmojis(mode, match.id, botId, 1, 1200 + Math.round(Math.random() * 1300), 'tease');
      }
    });
  }

  // Conversa de fundo dos bots: a cada tique, quem conduz os bots sorteia se algum deles
  // manda um emoji agora (durante o confronto, no resultado e na tela final).
  function tickPvpGroupBotAmbientEmoji(mode, answers = []) {
    const match = getPvpGroupEmojiMatch(mode);
    if (!match?.id || !isPvpEmojiChannelOpen(mode, match.id) || !isPvpGroupEmojiDriver(mode, match)) return;
    const nowMs = Date.now();
    if (nowMs - pvpGroupBotEmojiLastAtRef.current < 2500) return;
    const phase = String(match.status || '').trim().toLowerCase();
    if (phase === 'finished') {
      const endedAtMs = Math.max(0, Number(match.ended_at_ms || toMillis(match.ended_at) || 0));
      if (endedAtMs && nowMs - endedAtMs > PVP_GROUP_RESULT_BOT_EMOJI_WINDOW_MS) return;
    }
    const battleNo = Math.max(1, Number(match.battle_no || 1));
    const answeredIds = (Array.isArray(answers) ? answers : [])
      .filter((row) => Math.max(1, Number(row?.battle_no || battleNo)) === battleNo && Number(row?.answer_idx ?? -1) >= 0)
      .map((row) => String(row?.user_id || '').trim());
    const entry = planPvpGroupBotAmbientEmoji(match, mode, { phase, answeredIds });
    if (entry) queuePvpGroupBotEmojiPlan(mode, match.id, [entry]);
  }

  function resetQuizFlow() {
    setQuizState(null);
    setQuizMenuOpen(false);
    setFeedbackState(null);
    setResultState(null);
    setRewardCollecting(false);
    setRewardFxParticles([]);
    setQuizRankingRows([]);
    setQuizRankingLoading(false);
  }

  function resetPvpState() {
    clearBotAnswerTimer();
    clearBotReactionTimers();
    clearPvpResultAudioTimers(true);
    botReactionUserEmojiEventRef.current = '';
    botReactionRoundResultRef.current = '';
    botReactionFirstAnswerRef.current = '';
    pvpRoundPhaseSfxKeyRef.current = '';
    pvpRoundResultSfxKeyRef.current = '';
    pvpTimerSfxRef.current = {
      roundKey: '',
      warningPlayed: false,
      criticalPlayed: false,
      timeoutPlayed: false,
      tickSecond: -1
    };
    setQueueActionBusy(false);
    setMatchAcceptBusy(false);
    setPvpCompensation(null);
    setPvpResultTransitionMode('');
    setPvpResultReward(null);
    setPvpRewardCollecting(false);
    setRewardFxParticles([]);
    clearPvpEmojiFxTimers('duel');
    setPvpEmojiFx([]);
    setLatestPvpEmojiEvent(null);
    setPvpEmojiCooldownUntilMs(0);
    pvpSeenEmojiEventIdsRef.current = new Set();
    pvpSeenEmojiEventOrderRef.current = [];
    pvpEmojiSendQueueRef.current = [];
    pvpEmojiSendBusyRef.current = false;
    pvpEmojiSendCountRef.current = 0;
    pvpEmojiSpamWindowRef.current = [];
    pvpEmojiCooldownUntilRef.current = 0;
    pvpRealtimeMatchUpdateAtRef.current = 0;
    pvpRealtimeAnswersUpdateAtRef.current = 0;
    closePvpMatchFoundTransition(true);
    setQueueBotExclusion('', 0);
    queueSessionStartMsRef.current = 0;
    queueSessionIdRef.current = '';
    clearPreparedBot();
    clearPvpQueueResumeSnapshot();
    setPvpState({
      status: 'idle',
      queueJoinedAtMs: 0,
      queueBotMatchAtMs: 0,
      queueResumeMode: '',
      matchId: '',
      match: null,
      answers: [],
      roundStartMs: 0,
      submitted: false,
      selectedIndex: null,
      error: '',
      result: null
    });
  }

  function resetPvpTeamState() {
    pvpTeamRoomAccessHashRef.current = {};
    pvpTeamFinalizeBusyRef.current = false;
    pvpTeamAnswerBattleKeyRef.current = '';
    pvpTeamBotFillRef.current = { roomId: '', membershipKey: '', dueAtMs: 0, busy: false };
    pvpTeamAutoStartRoomIdRef.current = '';
    setPvpTeamAutoStartPending(false);
    handledPvpTeamMatchIdsRef.current = new Set();
    seenPvpTeamRoomNoticeIdsRef.current = new Set();
    setPvpTeamRooms([]);
    setPvpTeamRoomsLoading(false);
    setPvpTeamRoomId('');
    setPvpTeamRoom(null);
    setPvpTeamMatchId('');
    setPvpTeamMatch(null);
    setPvpTeamAnswers([]);
    setPvpTeamSelectedIndex(null);
    setPvpTeamSubmitted(false);
    setPvpTeamActionBusy(false);
    setPvpTeamCreateRoomOpen(false);
    setPvpTeamRoomDraft({
      name: '',
      visibility: 'open',
      password: ''
    });
    setPvpTeamRoomDraftError('');
    setPvpTeamJoinPrompt({
      roomId: '',
      roomName: '',
      requiresPassword: false,
      password: '',
      error: ''
    });
    setPvpTeamRoomNoticeModal(null);
    setPvpTeamResult('');
    setPvpTeamResultReward(null);
    setPvpTeamRewardCollecting(false);
  }

  function resetPvpEliminationState() {
    pvpEliminationQueueBusyRef.current = false;
    pvpEliminationQueueLastAttemptMsRef.current = 0;
    pvpEliminationQueueSyncLastRunMsRef.current = 0;
    pvpEliminationBotFillBusyRef.current = false;
    pvpEliminationBotFillLastAttemptMsRef.current = 0;
    pvpEliminationBotDecisionKeyRef.current = '';
    pvpEliminationBotDecisionRejectedIdsRef.current = [];
    pvpEliminationFinalizeBusyRef.current = false;
    pvpEliminationAnswerBattleKeyRef.current = '';
    handledPvpEliminationMatchIdsRef.current = new Set();
    seenPvpEliminationRoomNoticeIdsRef.current = new Set();
    dismissedPvpEliminationExitPromptIdsRef.current = new Set();
    setPvpEliminationRooms([]);
    setPvpEliminationRoomsLoading(false);
    setPvpEliminationRoomId('');
    setPvpEliminationRoom(null);
    setPvpEliminationMatchId('');
    setPvpEliminationMatch(null);
    setPvpEliminationAnswers([]);
    setPvpEliminationSelectedIndex(null);
    setPvpEliminationSubmitted(false);
    setPvpEliminationQueueState({
      status: 'idle',
      joinedAtMs: 0,
      sessionId: '',
      message: ''
    });
    setPvpEliminationActionBusy(false);
    setPvpEliminationInviteBusy(false);
    setPvpEliminationRoomNoticeModal(null);
    setPvpEliminationExitPrompt(null);
    setPvpEliminationResultReward(null);
    setPvpEliminationRewardCollecting(false);
  }

  function chooseKnowledgeAreaForPve(areaId = '') {
    const safeAreaId = String(areaId || '').trim();
    if (!KNOWLEDGE_AREAS.some((area) => area.id === safeAreaId)) return;
    setSelectedKnowledgeArea(safeAreaId);
    setKaCarouselIndex(getKnowledgeAreaIndex(safeAreaId));
    playSfx('success');
    setScreen('select');
  }

  function chooseKnowledgeAreaForPvp(areaId = '') {
    const safeAreaId = String(areaId || '').trim();
    if (!KNOWLEDGE_AREAS.some((area) => area.id === safeAreaId)) return;

    const currentStatus = String(pvpStateRef.current?.status || '').trim().toLowerCase();
    const eliminationStatus = String(pvpEliminationMatch?.status || '').trim().toLowerCase();
    const areaLocked = (
      currentStatus === 'queueing'
      || currentStatus === 'pending_accept'
      || currentStatus === 'active'
      || currentStatus === 'round_result'
      || queueActionBusy
      || matchAcceptBusy
    );
    const eliminationLocked = pvpMode === PVP_MODE_ELIMINATION && (
      pvpEliminationQueueStateRef.current?.status === 'queueing'
      || pvpEliminationActionBusy
      || !!String(pvpEliminationMatchId || '').trim()
      || eliminationStatus === 'active'
      || eliminationStatus === 'round_result'
      || eliminationStatus === 'elimination_result'
    );
    if (areaLocked || eliminationLocked) {
      playSfx('error');
      return;
    }

    const preferredLanguage = getPreferredLanguageByKnowledgeArea(safeAreaId, pvpConfig?.language || '');
    const preferredTopics = getTopicsByLanguage(TOPICS, preferredLanguage);
    const forcedDifficulty = getPvpQueueDifficultyFromConfig(pvpConfig, progress);
    const nextConfig = ensureValidPvpConfig({
      ...pvpConfig,
      language: preferredLanguage,
      topic: preferredTopics[0]?.id || pvpConfig?.topic || '',
      difficulty: forcedDifficulty,
      area: safeAreaId
    });
    setPvpConfig(nextConfig);
    setPvpKnowledgeArea(safeAreaId);
    setArenaKaCarouselIndex(getKnowledgeAreaIndex(safeAreaId));
    playSfx('success');
  }

  function choosePvpDifficulty(difficulty = 'easy') {
    const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
    const currentStatus = String(pvpStateRef.current?.status || '').trim().toLowerCase();
    const eliminationStatus = String(pvpEliminationMatch?.status || '').trim().toLowerCase();
    const difficultyLocked = (
      currentStatus === 'queueing'
      || currentStatus === 'pending_accept'
      || currentStatus === 'active'
      || currentStatus === 'round_result'
      || queueActionBusy
      || matchAcceptBusy
    );
    const eliminationLocked = pvpMode === PVP_MODE_ELIMINATION && (
      pvpEliminationQueueStateRef.current?.status === 'queueing'
      || pvpEliminationActionBusy
      || !!String(pvpEliminationMatchId || '').trim()
      || eliminationStatus === 'active'
      || eliminationStatus === 'round_result'
      || eliminationStatus === 'elimination_result'
    );
    if (difficultyLocked || eliminationLocked) {
      playSfx('error');
      return;
    }

    const preferredLanguage = getPreferredLanguageByKnowledgeArea(
      pvpKnowledgeArea,
      pvpConfig?.language || ''
    );
    const preferredTopics = getTopicsByLanguage(TOPICS, preferredLanguage);
    const nextConfig = ensureValidPvpConfig({
      ...pvpConfig,
      language: preferredLanguage || pvpConfig?.language || '',
      topic: preferredTopics[0]?.id || pvpConfig?.topic || '',
      difficulty: safeDifficulty,
      area: pvpKnowledgeArea
    });
    setPvpConfig(nextConfig);
    playSfx('success');
  }

  function buildPvpTeamMemberSnapshot() {
    return {
      user_id: String(authUser?.uid || '').trim(),
      nickname: profile?.nickname || 'Jogador',
      avatar: profile?.avatar || '\uD83D\uDE42',
      level: Math.max(1, Number(progress.level || 1)),
      pvp_points: Math.max(0, Number(progress.pvpPoints || 0)),
      equipped_frame: shopData?.equipped?.frame || 'frame_default',
      equipped_background: shopData?.equipped?.background || 'bg_default',
      equipped_emoji: shopData?.equipped?.emoji || 'emoji_profile'
    };
  }

  function buildPvpEliminationBotMemberSnapshot(botId = '', snapshot = null) {
    const safeBotId = String(botId || snapshot?.bot_id || snapshot?.profile?.id || '').trim();
    if (!safeBotId || !isSystemBotUserId(safeBotId)) return null;
    const safeSnapshot = snapshot && typeof snapshot === 'object' ? snapshot : {};
    const botProfile = safeSnapshot.profile && typeof safeSnapshot.profile === 'object'
      ? safeSnapshot.profile
      : {};
    const botStats = safeSnapshot.stats && typeof safeSnapshot.stats === 'object'
      ? safeSnapshot.stats
      : {};
    // Campo ausente usa o fallback do próprio bot (igual em todo aparelho),
    // e não o apelido/visual do bot principal.
    const fallbackProfile = getSystemBotFallbackProfile(safeBotId);
    return {
      user_id: safeBotId,
      nickname: String(botProfile.nickname || fallbackProfile.nickname).trim() || fallbackProfile.nickname,
      avatar: String(botProfile.avatar || fallbackProfile.avatar),
      level: Math.max(1, Number(botStats.level || 1)),
      pvp_points: Math.max(0, Number(botStats.pvp_points || 0)),
      equipped_frame: String(botProfile.equipped_frame || fallbackProfile.equipped_frame),
      equipped_background: String(botProfile.equipped_background || fallbackProfile.equipped_background),
      equipped_emoji: String(botProfile.equipped_emoji || fallbackProfile.equipped_emoji)
    };
  }

  function openPvpMode(mode = '') {
    let safeMode = PVP_MODE_DUEL;
    if (mode === PVP_MODE_TEAM_BATTLE) safeMode = PVP_MODE_TEAM_BATTLE;
    if (mode === PVP_MODE_ELIMINATION) safeMode = PVP_MODE_ELIMINATION;
    setPvpMode(safeMode);
    playSfx('click');
  }

  function returnToPvpModeMenu() {
    if (
      pvpTeamRoomId
      || pvpTeamMatchId
      || pvpEliminationRoomId
      || pvpEliminationMatchId
      || String(pvpEliminationQueueStateRef.current?.status || '').trim().toLowerCase() === 'queueing'
    ) {
      return;
    }
    setPvpMode('');
    setPvpTeamRooms([]);
    setPvpTeamRoom(null);
    setPvpTeamRoomId('');
    setPvpTeamMatch(null);
    setPvpTeamMatchId('');
    setPvpEliminationRooms([]);
    setPvpEliminationRoom(null);
    setPvpEliminationRoomId('');
    setPvpEliminationMatch(null);
    setPvpEliminationMatchId('');
    setPvpEliminationQueueState({
      status: 'idle',
      joinedAtMs: 0,
      sessionId: '',
      message: ''
    });
    playSfx('click');
  }

  function openPvpTeamRoomCreate() {
    setPvpTeamRoomDraftError('');
    setPvpTeamCreateRoomOpen(true);
  }

  function closePvpTeamRoomCreate() {
    setPvpTeamRoomDraftError('');
    setPvpTeamCreateRoomOpen(false);
  }

  function closePvpTeamJoinPrompt() {
    setPvpTeamJoinPrompt({
      roomId: '',
      roomName: '',
      requiresPassword: false,
      password: '',
      error: ''
    });
  }

  function closePvpTeamRoomNoticeModal() {
    setPvpTeamRoomNoticeModal(null);
  }

  function closePvpEliminationRoomNoticeModal() {
    setPvpEliminationRoomNoticeModal(null);
  }

  function rememberIgnoredPvpEliminationMatch(matchId = '') {
    const safeMatchId = String(matchId || '').trim();
    if (!safeMatchId) return;
    ignoredPvpEliminationMatchIdsRef.current.add(safeMatchId);
    while (ignoredPvpEliminationMatchIdsRef.current.size > 32) {
      const oldest = ignoredPvpEliminationMatchIdsRef.current.values().next().value;
      if (!oldest) break;
      ignoredPvpEliminationMatchIdsRef.current.delete(oldest);
    }
  }

  async function markPvpEliminationMatchOptOut(matchInput = null, userIdInput = '') {
    const match = matchInput && typeof matchInput === 'object'
      ? matchInput
      : (pvpEliminationMatch && typeof pvpEliminationMatch === 'object' ? pvpEliminationMatch : null);
    const matchId = String(match?.id || pvpEliminationMatchId || '').trim();
    const userId = String(userIdInput || authUser?.uid || '').trim();
    if (!matchId || !userId) return null;
    rememberIgnoredPvpEliminationMatch(matchId);
    return markPvpEliminationMatchParticipantOptOut(matchId, userId).catch(() => null);
  }

  function keepWatchingPvpElimination() {
    const matchId = String(pvpEliminationExitPrompt?.matchId || pvpEliminationMatch?.id || '').trim();
    if (matchId) {
      dismissedPvpEliminationExitPromptIdsRef.current.add(matchId);
    }
    setPvpEliminationExitPrompt(null);
    playSfx('click');
  }

  async function exitPvpEliminationWithPlacement() {
    const match = pvpEliminationMatchRef.current || pvpEliminationMatch || null;
    const matchId = String(match?.id || '').trim();
    const myUserId = String(authUser?.uid || '').trim();
    if (!matchId || !myUserId) return;
    const placement = getPvpEliminationPlacementForUser(match, myUserId);
    if (!placement) return;
    rememberIgnoredPvpEliminationMatch(matchId);
    dismissedPvpEliminationExitPromptIdsRef.current.add(matchId);
    setPvpEliminationExitPrompt(null);
    // Registra a saída; se eu era o último humano acompanhando, a partida termina aqui
    // pela classificação atual (os bots não ficam jogando sozinhos).
    const exitResult = await leavePvpGroupMatch(PVP_GROUP_MODE_ELIMINATION, matchId, myUserId).catch(() => null);
    const latestMatch = exitResult?.row || match;
    if (String(latestMatch?.status || '').trim().toLowerCase() === 'finished') {
      applyPvpGroupMatchBotRewards(PVP_GROUP_MODE_ELIMINATION, latestMatch).catch(() => null);
    }
    await handlePvpEliminationMatchFinished(latestMatch, {
      forcePlacement: placement,
      allowEarly: true
    });
  }

  function isPvpEliminationQueueSessionActive(sessionId = '') {
    const safeSessionId = String(sessionId || '').trim();
    if (!safeSessionId) return false;
    const queueState = pvpEliminationQueueStateRef.current && typeof pvpEliminationQueueStateRef.current === 'object'
      ? pvpEliminationQueueStateRef.current
      : {};
    return (
      String(queueState?.status || '').trim().toLowerCase() === 'queueing'
      && String(queueState?.sessionId || '').trim() === safeSessionId
    );
  }

  function beginPvpEliminationQueue() {
    if (!authUser?.uid || !profile?.id) {
      showToast('Entre com sua conta para entrar na fila.');
      playSfx('error');
      return;
    }
    const matchId = String(pvpEliminationMatch?.id || pvpEliminationMatchId || '').trim();
    const myUserId = String(authUser?.uid || '').trim();
    const optedOutIds = Array.isArray(pvpEliminationMatch?.opt_out_member_ids)
      ? pvpEliminationMatch.opt_out_member_ids.map((entry) => String(entry || '').trim()).filter(Boolean)
      : [];
    const blockedLiveMatch = (
      !!matchId
      && (
        ignoredPvpEliminationMatchIdsRef.current.has(matchId)
        || (!!myUserId && optedOutIds.includes(myUserId))
      )
    );
    const activeIds = getPvpEliminationActiveMemberIds(pvpEliminationMatch || null);
    const isCurrentUserActiveInLiveMatch = !!myUserId && activeIds.includes(myUserId);
    if (blockedLiveMatch) {
      setPvpEliminationMatchId('');
      setPvpEliminationMatch(null);
    }
    const matchStatus = String(pvpEliminationMatch?.status || '').trim().toLowerCase();
    const hasLiveMatch = !blockedLiveMatch && (
      isCurrentUserActiveInLiveMatch
      && (
        !!String(pvpEliminationMatchId || '').trim()
        || matchStatus === 'active'
        || matchStatus === 'round_result'
        || matchStatus === 'elimination_result'
      )
    );
    if (hasLiveMatch) {
      setScreen('pvp-elimination');
      playSfx('click');
      return;
    }
    if (String(pvpEliminationQueueStateRef.current?.status || '').trim().toLowerCase() === 'queueing') {
      return;
    }
    const queueNowMs = Date.now();
    const queueSessionId = buildQueueSessionId(authUser.uid, queueNowMs);
    pvpEliminationQueueBusyRef.current = false;
    pvpEliminationQueueLastAttemptMsRef.current = 0;
    pvpEliminationQueueSyncLastRunMsRef.current = 0;
    pvpEliminationBotFillBusyRef.current = false;
    pvpEliminationBotFillLastAttemptMsRef.current = 0;
    pvpEliminationBotDecisionKeyRef.current = '';
    pvpEliminationBotDecisionRejectedIdsRef.current = [];
    setPvpEliminationQueueState({
      status: 'queueing',
      joinedAtMs: queueNowMs,
      sessionId: queueSessionId,
      message: 'Buscando jogadores...'
    });
    setPvpEliminationRooms([]);
    setPvpEliminationRoomsLoading(true);
    setPvpEliminationRoomId('');
    setPvpEliminationRoom(null);
    setPvpEliminationMatchId('');
    setPvpEliminationMatch(null);
    setPvpEliminationAnswers([]);
    setPvpEliminationSelectedIndex(null);
    setPvpEliminationSubmitted(false);
    setPvpEliminationInviteBusy(false);
    setScreen('challenge');
    playSfx('click');
  }

  async function cancelPvpEliminationQueue(options = {}) {
    const silent = options?.silent === true;
    const room = pvpEliminationRoom && typeof pvpEliminationRoom === 'object'
      ? pvpEliminationRoom
      : null;
    const roomId = String(pvpEliminationRoomId || pvpEliminationRoom?.id || '').trim();
    const queueStatus = String(pvpEliminationQueueStateRef.current?.status || '').trim().toLowerCase();
    if (queueStatus !== 'queueing' && !roomId) return;
    if (pvpEliminationActionBusy) return;

    setPvpEliminationActionBusy(true);
    pvpEliminationQueueBusyRef.current = false;
    pvpEliminationQueueLastAttemptMsRef.current = 0;
    pvpEliminationQueueSyncLastRunMsRef.current = 0;
    pvpEliminationBotFillBusyRef.current = false;
    pvpEliminationBotFillLastAttemptMsRef.current = 0;
    pvpEliminationBotDecisionKeyRef.current = '';
    pvpEliminationBotDecisionRejectedIdsRef.current = [];
    setPvpEliminationQueueState({
      status: 'idle',
      joinedAtMs: 0,
      sessionId: '',
      message: ''
    });
    setPvpEliminationInviteBusy(false);
    try {
      // Os bots continuam com os outros humanos da sala (a liderança passa para um
      // deles); se ninguém sobrar, a sala é desfeita e os bots liberados.
      if (roomId && authUser?.uid) {
        await removePvpGroupRoomMembers(PVP_GROUP_MODE_ELIMINATION, roomId, [authUser.uid], {
          reason: 'queue_cancelled'
        }).catch(() => null);
      }
      setPvpEliminationRoomId('');
      setPvpEliminationRoom(null);
      setPvpEliminationRooms([]);
      setPvpEliminationRoomsLoading(false);
      if (!silent) {
        playSfx('notify');
      }
    } finally {
      setPvpEliminationActionBusy(false);
    }
  }

  function enterPvpEliminationRoom(roomRow) {
    const safeRoom = roomRow && typeof roomRow === 'object' ? roomRow : null;
    const roomId = String(safeRoom?.id || '').trim();
    if (!safeRoom || !roomId) return;
    setPvpMode(PVP_MODE_ELIMINATION);
    setPvpEliminationRoomId(roomId);
    setPvpEliminationRoom(safeRoom);
    pvpEliminationBotDecisionKeyRef.current = '';
    pvpEliminationBotDecisionRejectedIdsRef.current = [];
  }

  function getPvpEliminationRoomBotIds(source = null) {
    return getPvpEliminationMembers(source)
      .map((member) => String(member?.user_id || '').trim())
      .filter((memberId) => isSystemBotUserId(memberId));
  }

  function buildPvpEliminationPendingAcceptStateMap(members = []) {
    const next = {};
    (Array.isArray(members) ? members : []).forEach((member) => {
      const memberId = String(member?.user_id || '').trim();
      if (!memberId) return;
      next[memberId] = 'pending';
    });
    return next;
  }

  function buildPvpEliminationPendingAcceptBotDecisionAtMap(members = [], baseNowMs = Date.now()) {
    const nowMs = Math.max(0, Number(baseNowMs || Date.now()));
    const next = {};
    (Array.isArray(members) ? members : []).forEach((member) => {
      const memberId = String(member?.user_id || '').trim();
      if (!memberId || !isSystemBotUserId(memberId)) return;
      const delayMs = PVP_MATCH_FOUND_TRANSITION_MS
        + PVP_BOT_DECISION_DELAY_MIN_MS
        + Math.floor(Math.random() * (PVP_BOT_DECISION_DELAY_MAX_MS - PVP_BOT_DECISION_DELAY_MIN_MS + 1));
      next[memberId] = nowMs + delayMs;
    });
    return next;
  }

  function buildPvpEliminationPendingAcceptBotWillRejectMap(members = []) {
    const next = {};
    (Array.isArray(members) ? members : []).forEach((member) => {
      const memberId = String(member?.user_id || '').trim();
      if (!memberId || !isSystemBotUserId(memberId)) return;
      next[memberId] = Math.random() < PVP_ELIMINATION_QUEUE_BOT_REFUSAL_CHANCE;
    });
    return next;
  }

  async function resetPvpEliminationRoomAfterDecline(roomRow = null, reason = 'match_refused') {
    const safeRoom = roomRow && typeof roomRow === 'object' ? roomRow : null;
    const roomId = String(safeRoom?.id || pvpEliminationRoomId || '').trim();
    if (!roomId) return null;
    const updated = await updatePvpEliminationRoom(roomId, {
      status: 'lobby',
      accept_member_states: {},
      accept_started_at_ms: 0,
      accept_deadline_ms: 0,
      accept_start_countdown_ms: 0,
      accept_reject_at_ms: 0,
      accept_bot_decision_at_ms: {},
      accept_bot_will_reject: {},
      ready_member_ids: [],
      lobby_notice: null
    }).catch(() => null);
    if (updated?.id) {
      setPvpEliminationRoom(updated);
    }
    setPvpEliminationQueueState((prev) => (
      String(prev?.status || '').trim().toLowerCase() === 'queueing'
        ? {
          ...prev,
          message: reason === 'accept_timeout'
            ? 'Tempo de aceite esgotado. Procurando novo grupo...'
            : 'Um jogador recusou. Buscando novo grupo...'
        }
        : prev
    ));
    return updated;
  }

  async function acceptPvpEliminationRoomInvite() {
    const room = pvpEliminationRoom && typeof pvpEliminationRoom === 'object' ? pvpEliminationRoom : null;
    const roomId = String(room?.id || pvpEliminationRoomId || '').trim();
    const userId = String(authUser?.uid || '').trim();
    if (!roomId || !userId || pvpEliminationInviteBusy) return;
    if (String(room?.status || '').trim().toLowerCase() !== 'pending_accept') return;
    if (normalizePvpEliminationAcceptState(getPvpEliminationRoomAcceptState(room, userId)) === 'accepted') return;
    setPvpEliminationInviteBusy(true);
    try {
      const updated = await setPvpEliminationRoomAcceptState(roomId, userId, 'accepted');
      if (updated?.id) {
        setPvpEliminationRoom(updated);
      }
      playSfx('success');
    } catch (error) {
      console.error('accept elimination invite failed:', error);
      playSfx('error');
    } finally {
      setPvpEliminationInviteBusy(false);
    }
  }

  async function rejectPvpEliminationRoomInvite() {
    const room = pvpEliminationRoom && typeof pvpEliminationRoom === 'object' ? pvpEliminationRoom : null;
    const roomId = String(room?.id || pvpEliminationRoomId || '').trim();
    const userId = String(authUser?.uid || '').trim();
    if (!roomId || !userId || pvpEliminationInviteBusy) return;
    if (String(room?.status || '').trim().toLowerCase() !== 'pending_accept') return;
    setPvpEliminationInviteBusy(true);
    try {
      // Quem recusa sai deste grupo (que volta a procurar jogadores) e entra na fila de
      // novo, sem cair neste mesmo grupo no próximo minuto.
      await setPvpEliminationRoomAcceptState(roomId, userId, 'rejected').catch(() => null);
      pvpEliminationExcludedRoomIdsRef.current.set(roomId, Date.now() + 60000);
      setPvpEliminationRoomId('');
      setPvpEliminationRoom(null);
      setPvpEliminationQueueState((prev) => (
        String(prev?.status || '').trim().toLowerCase() === 'queueing'
          ? { ...prev, joinedAtMs: Date.now(), message: 'Partida recusada. Procurando outro grupo...' }
          : prev
      ));
      await removePvpGroupRoomMembers(PVP_GROUP_MODE_ELIMINATION, roomId, [userId], {
        reason: 'match_refused'
      }).catch(() => null);
      playSfx('notify');
    } catch (error) {
      console.error('reject elimination invite failed:', error);
      playSfx('error');
    } finally {
      setPvpEliminationInviteBusy(false);
    }
  }

  async function removePvpEliminationBotsFromLobbyRoom(roomRow = null, options = {}) {
    const safeRoom = roomRow && typeof roomRow === 'object' ? roomRow : null;
    const roomId = String(safeRoom?.id || '').trim();
    if (!roomId) return safeRoom;
    if (String(safeRoom?.status || '').trim().toLowerCase() !== 'lobby') return safeRoom;
    const reason = String(options?.reason || '').trim() || 'elimination_lobby_cleanup';
    const botIds = getPvpEliminationRoomBotIds(safeRoom);
    if (!botIds.length) return safeRoom;

    let latestRoom = safeRoom;
    for (const botId of botIds) {
      const safeBotId = String(botId || '').trim();
      if (!safeBotId) continue;
      latestRoom = await leavePvpEliminationRoom(roomId, safeBotId).catch(() => latestRoom);
      await clearBotBusy(safeBotId, roomId).catch(() => null);
      await rotateUserBotQueue(safeBotId, reason).catch(() => null);
    }
    if (latestRoom?.id) {
      setPvpEliminationRoom(latestRoom);
    }
    return latestRoom;
  }

  async function fillPvpEliminationRoomWithBots(roomRow = null) {
    const safeRoom = roomRow && typeof roomRow === 'object' ? roomRow : null;
    const roomId = String(safeRoom?.id || '').trim();
    if (!roomId) return safeRoom;
    if (String(safeRoom?.status || '').trim().toLowerCase() !== 'lobby') return safeRoom;
    const currentMembers = getPvpEliminationMembers(safeRoom);
    const missingSlots = Math.max(0, PVP_ELIMINATION_ROOM_CAPACITY - currentMembers.length);
    if (missingSlots <= 0) return safeRoom;

    const safeDifficulty = normalizeDifficulty(safeRoom?.difficulty || pvpConfig?.difficulty || 'easy');
    const excludedBotIds = new Set([
      ...currentMembers
        .map((member) => String(member?.user_id || '').trim())
        .filter((memberId) => isSystemBotUserId(memberId))
    ]);

    let latestRoom = safeRoom;
    let addedBots = 0;
    for (let slot = 0; slot < missingSlots; slot += 1) {
      const pickedBotLocal = await getNextBotForUserMatch(safeDifficulty, {
        excludeBotIds: Array.from(excludedBotIds),
        waitForEnsure: false,
        preferLocal: true
      }).catch(() => null);
      const pickedBotRemote = pickedBotLocal
        ? null
        : await getNextBotForUserMatch(safeDifficulty, {
          excludeBotIds: Array.from(excludedBotIds),
          waitForEnsure: false,
          preferLocal: false
        }).catch(() => null);
      const pickedBot = pickedBotLocal || pickedBotRemote;
      const selectedBotId = String(
        pickedBot?.bot_id
        || pickedBot?.profile?.id
        || ''
      ).trim();
      if (!selectedBotId || !isSystemBotUserId(selectedBotId) || excludedBotIds.has(selectedBotId)) break;

      const busyMarked = await setBotBusy(selectedBotId, {
        reason: 'elimination_queue_lobby',
        source: 'user',
        match_id: roomId
      }).catch(() => null);
      if (!busyMarked) {
        excludedBotIds.add(selectedBotId);
        continue;
      }

      const freshSnapshot = await getSystemBotSnapshot(selectedBotId, {
        preferLocal: false
      }).catch(() => null);
      const botSnapshot = freshSnapshot?.profile ? freshSnapshot : pickedBot;
      const botMember = buildPvpEliminationBotMemberSnapshot(selectedBotId, botSnapshot);
      if (!botMember?.user_id) {
        await clearBotBusy(selectedBotId, roomId).catch(() => null);
        excludedBotIds.add(selectedBotId);
        continue;
      }

      const joinedRoom = await joinPvpEliminationRoom(roomId, botMember, { asBot: true }).catch(() => null);
      const botEntry = getPvpEliminationMemberById(joinedRoom, selectedBotId);
      if (!joinedRoom?.id || !botEntry?.user_id) {
        await clearBotBusy(selectedBotId, roomId).catch(() => null);
        excludedBotIds.add(selectedBotId);
        continue;
      }

      excludedBotIds.add(selectedBotId);
      latestRoom = joinedRoom;
      addedBots += 1;
    }

    if (addedBots > 0 && latestRoom?.id) {
      setPvpEliminationRoom(latestRoom);
    }
    return latestRoom;
  }

  // Reserva o próximo bot livre da fila para a sala (marcado como ocupado pelo id da
  // sala). Devolve o bot e o snapshot de membro, ou null se nenhum estiver livre.
  async function reservePvpGroupBotMember(roomId = '', difficulty = 'easy', excludeIds = [], reason = 'group_room_lobby') {
    const safeRoomId = String(roomId || '').trim();
    if (!safeRoomId) return null;
    const excludedBotIds = new Set(
      (Array.isArray(excludeIds) ? excludeIds : [])
        .map((entry) => String(entry || '').trim())
        .filter((entry) => isSystemBotUserId(entry))
    );
    const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const pickedBot = await getNextBotForUserMatch(safeDifficulty, {
        excludeBotIds: Array.from(excludedBotIds),
        waitForEnsure: false,
        preferLocal: attempt === 0
      }).catch(() => null);
      const botId = String(pickedBot?.bot_id || pickedBot?.profile?.id || '').trim();
      if (!botId || !isSystemBotUserId(botId) || excludedBotIds.has(botId)) {
        if (attempt === 0) continue;
        return null;
      }
      excludedBotIds.add(botId);
      const busyMarked = await setBotBusy(botId, {
        reason,
        source: 'user',
        match_id: safeRoomId
      }).catch(() => null);
      if (!busyMarked) continue;
      // Visual atual do bot no banco (o que ele comprou/equipou), não o do cache local.
      const freshSnapshot = await getSystemBotSnapshot(botId, { preferLocal: false }).catch(() => null);
      const botSnapshot = freshSnapshot?.profile ? freshSnapshot : pickedBot;
      const member = buildPvpEliminationBotMemberSnapshot(botId, botSnapshot);
      if (!member?.user_id) {
        await clearBotBusy(botId, safeRoomId).catch(() => null);
        continue;
      }
      return { botId, member };
    }
    return null;
  }

  // Um bot entra na vaga aberta de uma sala 2x2 (no time com menos gente).
  async function addBotToPvpTeamRoom(roomRow = null) {
    const room = roomRow && typeof roomRow === 'object' ? roomRow : null;
    const roomId = String(room?.id || '').trim();
    if (!roomId || String(room?.status || '').trim().toLowerCase() !== 'lobby') return null;
    const redMembers = getPvpTeamMembersBySide(room, 'red');
    const blueMembers = getPvpTeamMembersBySide(room, 'blue');
    const redOpen = PVP_TEAM_ROOM_SIDE_CAPACITY - redMembers.length;
    const blueOpen = PVP_TEAM_ROOM_SIDE_CAPACITY - blueMembers.length;
    if (redOpen <= 0 && blueOpen <= 0) return null;
    let side = 'red';
    if (redOpen <= 0) side = 'blue';
    else if (blueOpen > 0 && (blueOpen > redOpen || (blueOpen === redOpen && Math.random() < 0.5))) side = 'blue';
    const memberIds = [...redMembers, ...blueMembers].map((member) => String(member?.user_id || '').trim());
    const reserved = await reservePvpGroupBotMember(roomId, room?.difficulty || pvpConfig?.difficulty, memberIds, 'team_room_lobby');
    if (!reserved) return null;
    const joined = await joinPvpTeamRoom(roomId, reserved.member, { side, asBot: true }).catch(() => null);
    if (!joined?.id || !getPvpTeamUserSide(joined, reserved.botId)) {
      await clearBotBusy(reserved.botId, roomId).catch(() => null);
      return null;
    }
    setPvpTeamRoom(joined);
    return joined;
  }

  async function resolvePvpEliminationRoomBotRefusals(roomRow = null) {
    const safeRoom = roomRow && typeof roomRow === 'object' ? roomRow : null;
    const roomId = String(safeRoom?.id || '').trim();
    if (!roomId) return { room: safeRoom, rejectedIds: [] };
    const members = getPvpEliminationMembers(safeRoom);
    if (members.length < PVP_ELIMINATION_ROOM_CAPACITY) {
      pvpEliminationBotDecisionKeyRef.current = '';
      pvpEliminationBotDecisionRejectedIdsRef.current = [];
      return { room: safeRoom, rejectedIds: [] };
    }

    const botIds = members
      .map((member) => String(member?.user_id || '').trim())
      .filter((memberId) => isSystemBotUserId(memberId));
    if (!botIds.length) {
      pvpEliminationBotDecisionKeyRef.current = '';
      pvpEliminationBotDecisionRejectedIdsRef.current = [];
      return { room: safeRoom, rejectedIds: [] };
    }

    const memberKey = members
      .map((member) => String(member?.user_id || '').trim())
      .filter(Boolean)
      .sort()
      .join('|');
    const decisionKey = `${roomId}:${memberKey}`;
    let rejectedIds = [];
    if (pvpEliminationBotDecisionKeyRef.current === decisionKey) {
      rejectedIds = Array.isArray(pvpEliminationBotDecisionRejectedIdsRef.current)
        ? pvpEliminationBotDecisionRejectedIdsRef.current
        : [];
    } else {
      rejectedIds = botIds.filter(() => Math.random() < PVP_ELIMINATION_QUEUE_BOT_REFUSAL_CHANCE);
      pvpEliminationBotDecisionKeyRef.current = decisionKey;
      pvpEliminationBotDecisionRejectedIdsRef.current = rejectedIds;
    }

    if (!rejectedIds.length) {
      return { room: safeRoom, rejectedIds: [] };
    }

    let latestRoom = safeRoom;
    for (const botId of rejectedIds) {
      const safeBotId = String(botId || '').trim();
      if (!safeBotId) continue;
      latestRoom = await leavePvpEliminationRoom(roomId, safeBotId).catch(() => latestRoom);
      await clearBotBusy(safeBotId, roomId).catch(() => null);
      await rotateUserBotQueue(safeBotId, 'elimination_queue_refused').catch(() => null);
    }

    pvpEliminationBotDecisionKeyRef.current = '';
    pvpEliminationBotDecisionRejectedIdsRef.current = [];
    if (latestRoom?.id) {
      setPvpEliminationRoom(latestRoom);
    }
    return {
      room: latestRoom,
      rejectedIds
    };
  }

  async function ensurePvpEliminationQueueRoom() {
    const queueState = pvpEliminationQueueStateRef.current && typeof pvpEliminationQueueStateRef.current === 'object'
      ? pvpEliminationQueueStateRef.current
      : {};
    const queueStatus = String(queueState?.status || '').trim().toLowerCase();
    const sessionId = String(queueState?.sessionId || '').trim();
    if (queueStatus !== 'queueing' || !sessionId) return;
    if (!authUser?.uid || !profile?.id) return;
    if (pvpEliminationQueueBusyRef.current) return;
    if (pvpEliminationRoomId || pvpEliminationMatchId) return;
    const nowMs = Date.now();
    if ((nowMs - pvpEliminationQueueLastAttemptMsRef.current) < PVP_ELIMINATION_QUEUE_RETRY_MS) return;

    pvpEliminationQueueBusyRef.current = true;
    pvpEliminationQueueLastAttemptMsRef.current = nowMs;
    setPvpEliminationActionBusy(true);

    try {
      const forcedDifficulty = getPvpQueueDifficultyFromConfig(pvpConfig, progress);
      const safeConfig = ensureValidPvpConfig({
        ...pvpConfig,
        difficulty: forcedDifficulty,
        area: pvpKnowledgeArea
      });
      const safeKnowledgeArea = String(
        pvpKnowledgeArea
        || resolveKnowledgeAreaByLanguageId(safeConfig.language || '')
        || 'programming'
      ).trim();
      const excludedRoomIds = pvpEliminationExcludedRoomIdsRef.current;
      excludedRoomIds.forEach((untilMs, excludedRoomId) => {
        if (untilMs <= nowMs) excludedRoomIds.delete(excludedRoomId);
      });
      const openRooms = (Array.isArray(pvpEliminationRooms) ? pvpEliminationRooms : [])
        .filter((room) => {
          if (!room || typeof room !== 'object') return false;
          if (String(room?.status || '').trim().toLowerCase() !== 'lobby') return false;
          if (room?.has_password) return false;
          if (excludedRoomIds.has(String(room?.id || '').trim())) return false;
          if (!isPvpGroupRoomAlive(room, nowMs)) return false;
          const members = getPvpEliminationMembers(room);
          return members.length < PVP_ELIMINATION_ROOM_CAPACITY;
        });
      const preferredRooms = openRooms.filter((room) => (
        normalizeDifficulty(room?.difficulty || 'easy') === forcedDifficulty
        && String(room?.knowledge_area || '').trim() === safeKnowledgeArea
      ));
      const candidateRooms = preferredRooms.length ? preferredRooms : openRooms;
      const candidate = [...candidateRooms].sort((a, b) => {
        const countDiff = getPvpEliminationMembers(b).length - getPvpEliminationMembers(a).length;
        if (countDiff !== 0) return countDiff;
        return toMillis(b?.updated_at || b?.created_at) - toMillis(a?.updated_at || a?.created_at);
      })[0] || null;

      let room = null;
      if (candidate?.id) {
        const joined = await joinPvpEliminationRoom(String(candidate.id), buildPvpTeamMemberSnapshot()).catch(() => null);
        const myEntry = getPvpEliminationMemberById(joined, authUser.uid);
        if (joined?.id && myEntry?.user_id) {
          room = joined;
        }
      }

      if (!room) {
        const created = await createPvpEliminationRoom({
          id: buildPvpEliminationRoomId(authUser.uid),
          name: `UCT #${String(Date.now()).slice(-6)}`,
          visibility: 'open',
          has_password: false,
          created_by_user_id: authUser.uid,
          difficulty: forcedDifficulty,
          category: forcedDifficulty,
          language: safeConfig.language,
          topic: safeConfig.topic,
          knowledge_area: safeKnowledgeArea,
          members: [buildPvpTeamMemberSnapshot()],
          ready_member_ids: [],
          lobby_notice: null
        }).catch(() => null);
        const myEntry = getPvpEliminationMemberById(created, authUser.uid);
        if (created?.id && myEntry?.user_id) {
          room = created;
        }
      }

      if (!room?.id) {
        if (isPvpEliminationQueueSessionActive(sessionId)) {
          setPvpEliminationQueueState((prev) => (
            String(prev?.status || '').trim().toLowerCase() === 'queueing'
            ? { ...prev, message: 'Tentando novamente encontrar jogadores...' }
            : prev
          ));
        }
        return;
      }

      if (!isPvpEliminationQueueSessionActive(sessionId)) {
        await leavePvpEliminationRoom(String(room.id), authUser.uid).catch(() => null);
        return;
      }

      enterPvpEliminationRoom(room);
      setPvpEliminationQueueState((prev) => (
        String(prev?.status || '').trim().toLowerCase() === 'queueing'
        ? { ...prev, message: 'Fila ativa. Aguardando completar 4 jogadores...' }
        : prev
      ));
    } catch (error) {
      console.error('ensure elimination queue room failed:', error);
      if (isPvpEliminationQueueSessionActive(sessionId)) {
        setPvpEliminationQueueState((prev) => (
          String(prev?.status || '').trim().toLowerCase() === 'queueing'
          ? { ...prev, message: 'Reconectando com a fila...' }
          : prev
        ));
      }
    } finally {
      pvpEliminationQueueBusyRef.current = false;
      setPvpEliminationActionBusy(false);
    }
  }

  async function syncPvpEliminationQueueLobbyState() {
    const queueStatus = String(pvpEliminationQueueStateRef.current?.status || '').trim().toLowerCase();
    if (queueStatus !== 'queueing') return;
    const room = pvpEliminationRoom && typeof pvpEliminationRoom === 'object' ? pvpEliminationRoom : null;
    const roomId = String(room?.id || pvpEliminationRoomId || '').trim();
    const userId = String(authUser?.uid || '').trim();
    if (!roomId || !userId || pvpEliminationActionBusy) return;
    const roomStatus = String(room?.status || '').trim().toLowerCase();
    if (roomStatus !== 'lobby' && roomStatus !== 'pending_accept') return;
    if (!getPvpEliminationMemberById(room, userId)?.user_id) return;

    const nowMs = Date.now();
    if ((nowMs - pvpEliminationQueueSyncLastRunMsRef.current) < 280) return;
    pvpEliminationQueueSyncLastRunMsRef.current = nowMs;
    const queueJoinedAtMs = Math.max(0, Number(pvpEliminationQueueStateRef.current?.joinedAtMs || 0));
    const queueElapsedMs = queueJoinedAtMs > 0
      ? Math.max(0, nowMs - queueJoinedAtMs)
      : 0;
    let liveRoom = room;
    // A cada 5s: tira da sala quem perdeu a conexão e, se o líder sumiu, assume a liderança.
    if ((nowMs - pvpGroupReconcileAtMsRef.current) >= 5000) {
      pvpGroupReconcileAtMsRef.current = nowMs;
      const reconciled = await reconcilePvpEliminationRoomPresence(roomId, userId).catch(() => null);
      if (reconciled?.room?.id) {
        liveRoom = reconciled.room;
        setPvpEliminationRoom(reconciled.room);
      }
      sweepStalePvpGroupState().catch(() => null);
    }
    const roomHostUserId = String(getPvpEliminationRoomHostUserId(liveRoom) || '').trim();
    const isHost = !!roomHostUserId && roomHostUserId === userId;
    const setQueueMessage = (message = '') => {
      const safeMessage = String(message || '').trim();
      setPvpEliminationQueueState((prev) => {
        if (String(prev?.status || '').trim().toLowerCase() !== 'queueing') return prev;
        if (String(prev?.message || '').trim() === safeMessage) return prev;
        return {
          ...prev,
          message: safeMessage
        };
      });
    };

    let roomState = liveRoom;
    if (roomStatus === 'lobby') {
      const members = getPvpEliminationMembers(roomState);
      const memberCount = members.length;

      if (memberCount < PVP_ELIMINATION_ROOM_CAPACITY) {
        if (!isHost || queueElapsedMs < PVP_ELIMINATION_QUEUE_BOT_FILL_MIN_ELAPSED_MS) {
          setQueueMessage(
            memberCount > 1
              ? 'Grupo em montagem. Aguardando fechar 4 jogadores...'
              : 'Fila ativa. Procurando jogadores...'
          );
          return;
        }
        if (pvpEliminationBotFillBusyRef.current) return;
        if ((nowMs - pvpEliminationBotFillLastAttemptMsRef.current) < PVP_ELIMINATION_QUEUE_BOT_FILL_RETRY_MS) return;
        pvpEliminationBotFillBusyRef.current = true;
        pvpEliminationBotFillLastAttemptMsRef.current = nowMs;
        setPvpEliminationActionBusy(true);
        try {
          const filledRoom = await fillPvpEliminationRoomWithBots(roomState);
          if (filledRoom?.id) {
            roomState = filledRoom;
          }
        } catch (error) {
          console.error('auto-fill elimination room with bots failed:', error);
        } finally {
          pvpEliminationBotFillBusyRef.current = false;
          setPvpEliminationActionBusy(false);
        }

        const nextCount = getPvpEliminationMembers(roomState).length;
        if (nextCount < PVP_ELIMINATION_ROOM_CAPACITY) {
          setQueueMessage('Fila ativa. Procurando jogadores...');
          return;
        }
      }

      if (!isHost) {
        setQueueMessage('Grupo encontrado. Preparando tela de aceite...');
        return;
      }

      const fullMembers = getPvpEliminationMembers(roomState);
      if (fullMembers.length < PVP_ELIMINATION_ROOM_CAPACITY) return;
      const acceptStateMap = buildPvpEliminationPendingAcceptStateMap(fullMembers);
      const acceptBotDecisionAtMs = buildPvpEliminationPendingAcceptBotDecisionAtMap(fullMembers, Date.now());
      const acceptBotWillReject = buildPvpEliminationPendingAcceptBotWillRejectMap(fullMembers);
      const acceptStartedAtMs = Date.now();

      setPvpEliminationActionBusy(true);
      try {
        const updated = await updatePvpEliminationRoom(roomId, {
          status: 'pending_accept',
          accept_member_states: acceptStateMap,
          accept_started_at_ms: acceptStartedAtMs,
          accept_deadline_ms: acceptStartedAtMs + PVP_ELIMINATION_ACCEPT_TIMEOUT_MS,
          accept_start_countdown_ms: 0,
          accept_reject_at_ms: 0,
          accept_bot_decision_at_ms: acceptBotDecisionAtMs,
          accept_bot_will_reject: acceptBotWillReject,
          ready_member_ids: [],
          lobby_notice: null
        }).catch(() => null);
        if (updated?.id) {
          roomState = updated;
          setPvpEliminationRoom(updated);
        }
      } catch (error) {
        console.error('start elimination pending accept failed:', error);
      } finally {
        setPvpEliminationActionBusy(false);
      }

      setQueueMessage('Partida encontrada. Confirmando aceite do grupo...');
      return;
    }

    // pending_accept
    let members = getPvpEliminationMembers(roomState);
    if (members.length < PVP_ELIMINATION_ROOM_CAPACITY) {
      if (isHost) {
        setPvpEliminationActionBusy(true);
        try {
          const updated = await resetPvpEliminationRoomAfterDecline(roomState, 'match_refused');
          if (updated?.id) {
            roomState = updated;
          }
        } finally {
          setPvpEliminationActionBusy(false);
        }
      }
      return;
    }

    if (isHost) {
      const acceptStates = getPvpEliminationRoomAcceptStateMap(roomState);
      const botDecisionAtMap = getPvpEliminationRoomAcceptBotDecisionAtMap(roomState);
      const botWillRejectMap = getPvpEliminationRoomAcceptBotWillRejectMap(roomState);
      const dueBots = members.filter((member) => {
        const memberId = String(member?.user_id || '').trim();
        if (!memberId || !isSystemBotUserId(memberId)) return false;
        if (normalizePvpEliminationAcceptState(acceptStates[memberId]) !== 'pending') return false;
        const decisionAtMs = Math.max(0, Number(botDecisionAtMap[memberId] || 0));
        return decisionAtMs > 0 && nowMs >= decisionAtMs;
      });
      if (dueBots.length) {
        setPvpEliminationActionBusy(true);
        try {
          for (const botMember of dueBots) {
            const botId = String(botMember?.user_id || '').trim();
            if (!botId) continue;
            const willReject = botWillRejectMap[botId] === true;
            const updated = await setPvpEliminationRoomAcceptState(
              roomId,
              botId,
              willReject ? 'rejected' : 'accepted'
            ).catch(() => null);
            if (updated?.id) {
              roomState = updated;
              setPvpEliminationRoom(updated);
            }
          }
        } catch (error) {
          console.error('resolve elimination pending bot decisions failed:', error);
        } finally {
          setPvpEliminationActionBusy(false);
        }
      }
    }

    members = getPvpEliminationMembers(roomState);
    const acceptStateMap = getPvpEliminationRoomAcceptStateMap(roomState);
    const rejectedIds = members
      .map((member) => String(member?.user_id || '').trim())
      .filter((memberId) => normalizePvpEliminationAcceptState(acceptStateMap[memberId]) === 'rejected');
    const acceptRejectAtMs = Math.max(0, Number(roomState?.accept_reject_at_ms || 0));
    const rejectResolveAtMs = acceptRejectAtMs > 0 ? acceptRejectAtMs : nowMs;

    if (rejectedIds.length > 0) {
      if (isHost) {
        if (acceptRejectAtMs <= 0) {
          const updated = await updatePvpEliminationRoom(roomId, {
            accept_reject_at_ms: nowMs
          }).catch(() => null);
          if (updated?.id) {
            roomState = updated;
            setPvpEliminationRoom(updated);
          }
        }
        const effectiveRejectAtMs = Math.max(
          0,
          Number((roomState?.accept_reject_at_ms || nowMs))
        );
        if (nowMs >= (effectiveRejectAtMs + PVP_ELIMINATION_REJECT_RESOLVE_DELAY_MS)) {
          // Quem recusou sai do grupo (bots voltam para a fila) e a sala volta a
          // procurar jogadores com quem aceitou.
          setPvpEliminationActionBusy(true);
          try {
            const removal = await removePvpGroupRoomMembers(PVP_GROUP_MODE_ELIMINATION, roomId, rejectedIds, {
              reason: 'match_refused'
            }).catch(() => null);
            if (removal?.room?.id) {
              roomState = removal.room;
              setPvpEliminationRoom(removal.room);
            }
          } finally {
            setPvpEliminationActionBusy(false);
          }
        }
      }
      setQueueMessage(
        nowMs >= (rejectResolveAtMs + PVP_ELIMINATION_REJECT_RESOLVE_DELAY_MS)
          ? 'Um jogador recusou. Buscando novo grupo...'
          : 'Um jogador recusou. Retornando para a fila...'
      );
      return;
    }

    const everyoneAccepted = members.length === PVP_ELIMINATION_ROOM_CAPACITY
      && members.every((member) => {
        const memberId = String(member?.user_id || '').trim();
        return normalizePvpEliminationAcceptState(acceptStateMap[memberId]) === 'accepted';
      });
    if (everyoneAccepted) {
      const startCountdownMs = Math.max(0, Number(roomState?.accept_start_countdown_ms || 0));
      if (isHost && !startCountdownMs) {
        setPvpEliminationActionBusy(true);
        try {
          const updated = await updatePvpEliminationRoom(roomId, {
            accept_start_countdown_ms: nowMs + PVP_ELIMINATION_ACCEPT_START_DELAY_MS,
            accept_deadline_ms: 0
          }).catch(() => null);
          if (updated?.id) {
            roomState = updated;
            setPvpEliminationRoom(updated);
          }
        } finally {
          setPvpEliminationActionBusy(false);
        }
        return;
      }
      const effectiveStartCountdownMs = Math.max(0, Number(roomState?.accept_start_countdown_ms || 0));
      if (effectiveStartCountdownMs > 0) {
        setQueueMessage(`Todos aceitaram. Iniciando em ${Math.max(0, Math.ceil((effectiveStartCountdownMs - nowMs) / 1000))}s...`);
      }
      if (isHost && effectiveStartCountdownMs > 0 && nowMs >= effectiveStartCountdownMs) {
        await startPvpEliminationBattle();
      }
      return;
    }

    const acceptDeadlineMs = Math.max(0, Number(roomState?.accept_deadline_ms || 0));
    if (acceptDeadlineMs > 0 && nowMs >= acceptDeadlineMs) {
      if (isHost) {
        const pendingMembers = members
          .map((member) => String(member?.user_id || '').trim())
          .filter((memberId) => normalizePvpEliminationAcceptState(acceptStateMap[memberId]) === 'pending');
        if (pendingMembers.length) {
          // Quem não confirmou a tempo sai do grupo e da fila; os demais seguem buscando.
          setPvpEliminationActionBusy(true);
          try {
            const removal = await removePvpGroupRoomMembers(PVP_GROUP_MODE_ELIMINATION, roomId, pendingMembers, {
              reason: 'accept_timeout'
            }).catch(() => null);
            if (removal?.room?.id) {
              roomState = removal.room;
              setPvpEliminationRoom(removal.room);
            }
          } catch (error) {
            console.error('resolve elimination pending timeout failed:', error);
          } finally {
            setPvpEliminationActionBusy(false);
          }
        } else {
          setPvpEliminationActionBusy(true);
          try {
            const updated = await resetPvpEliminationRoomAfterDecline(roomState, 'accept_timeout');
            if (updated?.id) {
              roomState = updated;
            }
          } finally {
            setPvpEliminationActionBusy(false);
          }
        }
      }
      setQueueMessage('Tempo de aceite esgotado. Buscando novo grupo...');
      return;
    }

    const myAcceptState = normalizePvpEliminationAcceptState(
      getPvpEliminationRoomAcceptState(roomState, userId)
    );
    setQueueMessage(
      myAcceptState === 'accepted'
        ? `Você aceitou. Aguardando os demais (${Math.max(0, Math.ceil((acceptDeadlineMs - nowMs) / 1000))}s).`
        : `Partida encontrada. Confirme seu aceite (${Math.max(0, Math.ceil((acceptDeadlineMs - nowMs) / 1000))}s).`
    );
  }

  function enterPvpTeamRoom(roomRow, passwordHash = '') {
    const safeRoom = roomRow && typeof roomRow === 'object' ? roomRow : null;
    const roomId = String(safeRoom?.id || '').trim();
    if (!safeRoom || !roomId) return;
    if (passwordHash) {
      pvpTeamRoomAccessHashRef.current = {
        ...pvpTeamRoomAccessHashRef.current,
        [roomId]: passwordHash
      };
    }
    setPvpMode(PVP_MODE_TEAM_BATTLE);
    setPvpTeamRoomId(roomId);
    setPvpTeamRoom(safeRoom);
    closePvpTeamJoinPrompt();
    playSfx('click');
  }

  function openPvpTeamRoomLobby(roomRow) {
    const safeRoom = roomRow && typeof roomRow === 'object' ? roomRow : null;
    if (!safeRoom?.id) return;
    const mySide = getPvpTeamUserSide(safeRoom, authUser?.uid || '');
    if (mySide) {
      enterPvpTeamRoom(safeRoom, pvpTeamRoomAccessHashRef.current[String(safeRoom.id)] || '');
      return;
    }
    setPvpTeamJoinPrompt({
      roomId: String(safeRoom.id),
      roomName: String(safeRoom.name || (safeRoom.has_password ? 'Sala privada' : 'Sala de equipe')),
      requiresPassword: Boolean(safeRoom.has_password),
      password: '',
      error: ''
    });
  }

  function submitPvpTeamJoinPrompt() {
    const roomId = String(pvpTeamJoinPrompt.roomId || '').trim();
    if (!roomId) return;
    const room = pvpTeamRooms.find((entry) => String(entry?.id || '').trim() === roomId);
    if (!room) {
      setPvpTeamJoinPrompt((prev) => ({ ...prev, error: 'Sala não encontrada.' }));
      return;
    }
    if (!pvpTeamJoinPrompt.requiresPassword) {
      confirmPvpTeamRoomEntry(room).catch(() => null);
      return;
    }
    const passwordHash = hashPvpTeamRoomPassword(pvpTeamJoinPrompt.password);
    if (!passwordHash) {
      setPvpTeamJoinPrompt((prev) => ({ ...prev, error: 'Informe a senha da sala.' }));
      return;
    }
    confirmPvpTeamRoomEntry(room, passwordHash).catch(() => null);
  }

  async function confirmPvpTeamRoomEntry(roomRow, passwordHash = '') {
    const room = roomRow && typeof roomRow === 'object' ? roomRow : null;
    const roomId = String(room?.id || '').trim();
    if (!roomId || !authUser?.uid || !profile?.id || pvpTeamActionBusy) return;
    const currentSide = getPvpTeamUserSide(room, authUser.uid);
    if (currentSide) {
      enterPvpTeamRoom(room, passwordHash || pvpTeamRoomAccessHashRef.current[roomId] || '');
      return;
    }

    setPvpTeamActionBusy(true);
    try {
      const joined = await joinPvpTeamRoom(
        roomId,
        buildPvpTeamMemberSnapshot(),
        {
          side: 'auto',
          passwordHash
        }
      );
      const nextSide = getPvpTeamUserSide(joined, authUser.uid);
      if (!joined?.id || !nextSide) {
        throw new Error('team_room_auto_join_failed');
      }
      enterPvpTeamRoom(joined, passwordHash);
      setPvpTeamRoom(joined);
      playSfx('success');
    } catch (error) {
      console.error('confirm team room entry failed:', error);
      setPvpTeamJoinPrompt((prev) => ({
        ...prev,
        error: room?.has_password
          ? 'Senha inválida ou sala indisponível.'
          : 'Não foi possível entrar nesta sala agora.'
      }));
      playSfx('error');
    } finally {
      setPvpTeamActionBusy(false);
    }
  }

  async function togglePvpTeamReadyState() {
    const room = pvpTeamRoom && typeof pvpTeamRoom === 'object' ? pvpTeamRoom : null;
    const roomId = String(room?.id || pvpTeamRoomId || '').trim();
    const safeUserId = String(authUser?.uid || '').trim();
    if (!roomId || !safeUserId || pvpTeamActionBusy) return;
    if (String(getPvpTeamRoomHostUserId(room) || '') === safeUserId) return;
    const nextReady = !isPvpTeamRoomMemberReady(room, safeUserId);
    setPvpTeamActionBusy(true);
    try {
      const updated = await setPvpTeamRoomMemberReady(roomId, safeUserId, nextReady);
      if (!updated?.id) {
        throw new Error('team_room_ready_update_failed');
      }
      setPvpTeamRoom(updated);
      playSfx(nextReady ? 'success' : 'click');
    } catch (error) {
      console.error('toggle team ready failed:', error);
      showToast('Não foi possível atualizar seu status agora.');
      playSfx('error');
    } finally {
      setPvpTeamActionBusy(false);
    }
  }

  async function createPvpTeamRoomFromDraft() {
    if (!authUser?.uid || !profile?.id) {
      showToast('Entre com sua conta para criar uma sala.');
      return;
    }
    const roomName = normalizePvpTeamRoomName(pvpTeamRoomDraft.name);
    if (!roomName) {
      setPvpTeamRoomDraftError('Escolha um nome para a sala.');
      return;
    }
    const roomNameKey = normalizePvpTeamRoomNameForCompare(roomName);
    const hasDuplicateRoomName = (Array.isArray(pvpTeamRooms) ? pvpTeamRooms : []).some((room) => {
      if (!room || typeof room !== 'object') return false;
      const existingNameKey = normalizePvpTeamRoomNameForCompare(String(room.name || ''));
      return !!existingNameKey && existingNameKey === roomNameKey;
    });
    if (hasDuplicateRoomName) {
      setPvpTeamRoomDraftError('Já existe uma sala com esse nome. Escolha outro.');
      return;
    }
    const visibility = String(pvpTeamRoomDraft.visibility || 'open').trim().toLowerCase() === 'password'
      ? 'password'
      : 'open';
    const passwordValue = String(pvpTeamRoomDraft.password || '').trim();
    if (visibility === 'password' && passwordValue.length < 2) {
      setPvpTeamRoomDraftError('Defina uma senha curta para a sala.');
      return;
    }

    setPvpTeamActionBusy(true);
    setPvpTeamRoomDraftError('');
    try {
      const forcedDifficulty = getPvpQueueDifficultyFromConfig(pvpConfig, progress);
      const safeConfig = ensureValidPvpConfig({
        ...pvpConfig,
        difficulty: forcedDifficulty,
        area: pvpKnowledgeArea
      });
      const safeKnowledgeArea = String(
        pvpKnowledgeArea
        || resolveKnowledgeAreaByLanguageId(safeConfig.language || '')
        || 'programming'
      ).trim();
      const roomId = buildPvpTeamRoomId(authUser.uid);
      const passwordHash = visibility === 'password'
        ? hashPvpTeamRoomPassword(passwordValue)
        : '';
      const created = await createPvpTeamRoom({
        id: roomId,
        name: roomName,
        visibility,
        password_hash: passwordHash,
        has_password: Boolean(passwordHash),
        created_by_user_id: authUser.uid,
        difficulty: forcedDifficulty,
        category: forcedDifficulty,
        language: safeConfig.language,
        topic: safeConfig.topic,
        knowledge_area: safeKnowledgeArea,
        red_members: [buildPvpTeamMemberSnapshot()],
        blue_members: [],
        ready_member_ids: [],
        lobby_notice: null
      });
      if (!created?.id) {
        throw new Error('team_room_create_failed');
      }
      if (passwordHash) {
        pvpTeamRoomAccessHashRef.current = {
          ...pvpTeamRoomAccessHashRef.current,
          [String(created.id)]: passwordHash
        };
      }
      setPvpTeamRoomDraft({
        name: '',
        visibility: 'open',
        password: ''
      });
      setPvpTeamCreateRoomOpen(false);
      setPvpTeamRoomId(String(created.id));
      setPvpTeamRoom(created);
      playSfx('success');
    } catch (error) {
      console.error('create team room failed:', error);
      const errorCode = String(error?.code || '').trim().toLowerCase();
      if (errorCode === 'pvp_team_room/name-already-exists') {
        setPvpTeamRoomDraftError('Já existe uma sala com esse nome. Escolha outro.');
      } else {
        setPvpTeamRoomDraftError('Não foi possível criar a sala agora.');
      }
      playSfx('error');
    } finally {
      setPvpTeamActionBusy(false);
    }
  }

  async function joinPvpTeamRoomSide(side = 'red') {
    const roomId = String(pvpTeamRoomId || pvpTeamRoom?.id || '').trim();
    if (!roomId || !authUser?.uid || !profile?.id || pvpTeamActionBusy) return;
    setPvpTeamActionBusy(true);
    try {
      const joined = await joinPvpTeamRoom(
        roomId,
        buildPvpTeamMemberSnapshot(),
        {
          side,
          passwordHash: pvpTeamRoomAccessHashRef.current[roomId] || ''
        }
      );
      const nextSide = getPvpTeamUserSide(joined, authUser.uid);
      if (!joined?.id || nextSide !== normalizePvpTeamSide(side)) {
        throw new Error('team_room_join_side_failed');
      }
      setPvpTeamRoom(joined);
      playSfx('success');
    } catch (error) {
      console.error('join team room side failed:', error);
      const room = pvpTeamRoom && typeof pvpTeamRoom === 'object' ? pvpTeamRoom : null;
      if (room?.has_password && !getPvpTeamUserSide(room, authUser.uid)) {
        setPvpTeamJoinPrompt({
          roomId,
          roomName: String(room?.name || 'Sala privada'),
          requiresPassword: true,
          password: '',
          error: 'Senha inválida ou vaga indisponível.'
        });
      } else {
        showToast('Não foi possível entrar neste lado agora.');
      }
      playSfx('error');
    } finally {
      setPvpTeamActionBusy(false);
    }
  }

  async function leaveSelectedPvpTeamRoom() {
    const roomId = String(pvpTeamRoomId || pvpTeamRoom?.id || '').trim();
    if (!roomId || !authUser?.uid || pvpTeamActionBusy) return;
    setPvpTeamActionBusy(true);
    try {
      // Sem humano sobrando a sala é desfeita e os bots voltam para a fila.
      await removePvpGroupRoomMembers(PVP_GROUP_MODE_TEAM, roomId, [authUser.uid], {
        reason: 'left_room'
      }).catch(() => null);
      pvpTeamAutoStartRoomIdRef.current = '';
      setPvpTeamAutoStartPending(false);
      setPvpTeamRoomId('');
      setPvpTeamRoom(null);
      delete pvpTeamRoomAccessHashRef.current[roomId];
      playSfx('notify');
    } finally {
      setPvpTeamActionBusy(false);
    }
  }

  // Tick do lobby 2x2 (roda em todo humano da sala): presença, troca de líder e, no
  // líder, jogadores completando as vagas abertas e o início automático pedido.
  async function runPvpTeamLobbyTick() {
    if (pvpTeamLobbyTickBusyRef.current) return;
    const myUserId = String(authUser?.uid || '').trim();
    const room = pvpTeamRoomRef.current;
    if (!myUserId || !room?.id) return;
    if (String(room?.status || '').trim().toLowerCase() !== 'lobby') return;
    if (!getPvpTeamUserSide(room, myUserId)) return;
    pvpTeamLobbyTickBusyRef.current = true;
    try {
      const nowMs = Date.now();
      let latest = room;
      if ((nowMs - pvpGroupReconcileAtMsRef.current) >= 5000) {
        pvpGroupReconcileAtMsRef.current = nowMs;
        const reconciled = await reconcilePvpTeamRoomPresence(room.id, myUserId).catch(() => null);
        if (reconciled?.room?.id) {
          latest = reconciled.room;
          setPvpTeamRoom(reconciled.room);
        }
        sweepStalePvpGroupState().catch(() => null);
      }
      if (String(getPvpTeamRoomHostUserId(latest) || '').trim() !== myUserId) return;
      if (String(latest?.status || '').trim().toLowerCase() !== 'lobby') return;

      const launchCheck = getPvpTeamRoomLaunchCheck(latest);
      if (launchCheck.isFull) {
        if (pvpTeamAutoStartRoomIdRef.current === String(latest.id)) {
          pvpTeamAutoStartRoomIdRef.current = '';
          setPvpTeamAutoStartPending(false);
          await startPvpTeamBattle({ roomOverride: latest, fromAutoStart: true });
        }
        return;
      }

      const memberIds = [
        ...getPvpTeamMembersBySide(latest, 'red'),
        ...getPvpTeamMembersBySide(latest, 'blue')
      ].map((member) => String(member?.user_id || '').trim());
      const membershipKey = `${[...memberIds].sort().join('|')}:${Number(latest?.membership_changed_at_ms || 0)}`;
      const autoStartRequested = pvpTeamAutoStartRoomIdRef.current === String(latest.id);
      const fill = pvpTeamBotFillRef.current;
      if (fill.roomId !== String(latest.id) || fill.membershipKey !== membershipKey) {
        const newestMember = [...getPvpTeamMembersBySide(latest, 'red'), ...getPvpTeamMembersBySide(latest, 'blue')]
          .sort((a, b) => Number(b?.joined_at_ms || 0) - Number(a?.joined_at_ms || 0))[0] || null;
        const lastJoinWasBot = isSystemBotUserId(String(newestMember?.user_id || '').trim());
        const changedAtMs = Math.max(0, Number(latest?.membership_changed_at_ms || 0)) || nowMs;
        const dueAtMs = (autoStartRequested || lastJoinWasBot)
          ? nowMs + getPvpTeamRoomBotFillDelayMs(latest, true)
          : Math.max(nowMs + 800, changedAtMs + getPvpTeamRoomBotFillDelayMs(latest, false));
        pvpTeamBotFillRef.current = { roomId: String(latest.id), membershipKey, dueAtMs, busy: false };
        return;
      }
      if (nowMs < fill.dueAtMs) return;
      pvpTeamBotFillRef.current = { ...fill, dueAtMs: nowMs + getPvpTeamRoomBotFillDelayMs(latest, true) };
      await addBotToPvpTeamRoom(latest);
    } catch (error) {
      console.error('team lobby tick failed:', error);
    } finally {
      pvpTeamLobbyTickBusyRef.current = false;
    }
  }

  pvpTeamLobbyTickFnRef.current = runPvpTeamLobbyTick;

  async function startPvpTeamBattle(options = {}) {
    const room = options?.roomOverride && typeof options.roomOverride === 'object'
      ? options.roomOverride
      : (pvpTeamRoom && typeof pvpTeamRoom === 'object' ? pvpTeamRoom : null);
    if (!room?.id || pvpTeamActionBusy) return;
    if (String(getPvpTeamRoomHostUserId(room) || '') !== String(authUser?.uid || '')) {
      showToast('Somente o criador da sala pode iniciar.');
      playSfx('error');
      return;
    }
    const launchCheck = getPvpTeamRoomLaunchCheck(room);
    if (!launchCheck.isFull && !options?.fromAutoStart) {
      // Vaga aberta: outros jogadores entram para completar e a batalha começa sozinha.
      pvpTeamAutoStartRoomIdRef.current = String(room.id);
      pvpTeamBotFillRef.current = { ...pvpTeamBotFillRef.current, roomId: '', membershipKey: '' };
      setPvpTeamAutoStartPending(true);
      playSfx('click');
      return;
    }
    if (!launchCheck.canStart) {
      const notice = buildPvpTeamRoomStartBlockedNotice(room);
      publishPvpTeamRoomNotice(room.id, notice).catch(() => null);
      setPvpTeamRoomNoticeModal(notice);
      showToast('Ainda não é possível iniciar a sala.');
      playSfx('error');
      return;
    }

    setPvpTeamActionBusy(true);
    try {
      const matchId = buildPvpTeamMatchId(room.id);
      const schedule = buildPvpTeamBattleSchedule(room);
      const questionSequence = resolvePvpMatchQuestionSequence({
        areaId: room.knowledge_area || pvpKnowledgeArea,
        difficulty: room.difficulty || pvpConfig.difficulty,
        language: room.language || pvpConfig.language,
        topic: room.topic || pvpConfig.topic,
        rounds: PVP_TEAM_BATTLE_TOTAL_ROUNDS,
        sequenceSeed: matchId
      });
      const questionSet = Array.isArray(questionSequence?.questions)
        ? questionSequence.questions.slice(0, PVP_TEAM_BATTLE_TOTAL_ROUNDS)
        : [];
      if (schedule.length !== PVP_TEAM_BATTLE_TOTAL_ROUNDS || questionSet.length !== PVP_TEAM_BATTLE_TOTAL_ROUNDS) {
        throw new Error('team_room_not_enough_questions');
      }
      const memberScores = {};
      [...getPvpTeamMembersBySide(room, 'red'), ...getPvpTeamMembersBySide(room, 'blue')].forEach((member) => {
        const userId = String(member?.user_id || '').trim();
        if (userId) memberScores[userId] = 0;
      });

      const created = await createPvpTeamMatch({
        id: matchId,
        mode: PVP_MODE_TEAM_BATTLE,
        room_id: room.id,
        difficulty: room.difficulty || pvpConfig.difficulty,
        category: room.category || room.difficulty || pvpConfig.difficulty,
        language: questionSequence?.resolvedLanguage || room.language || pvpConfig.language,
        topic: questionSequence?.resolvedTopic || room.topic || pvpConfig.topic,
        knowledge_area: room.knowledge_area || pvpKnowledgeArea,
        total_rounds: PVP_TEAM_BATTLE_TOTAL_ROUNDS,
        battle_no: 1,
        question_set: questionSet,
        battle_schedule: schedule,
        red_members: getPvpTeamMembersBySide(room, 'red'),
        blue_members: getPvpTeamMembersBySide(room, 'blue'),
        red_score: 0,
        blue_score: 0,
        member_scores: memberScores,
        battle_started_at_ms: Date.now(),
        battle_started_at: nowIso()
      });
      if (!created?.id) {
        throw new Error('team_match_create_failed');
      }
      await updatePvpTeamRoom(room.id, {
        status: 'active',
        match_id: created.id
      });
      setPvpTeamMatchId(String(created.id));
      setPvpTeamMatch(created);
      setPvpTeamSubmitted(false);
      setPvpTeamSelectedIndex(null);
      setScreen('pvp-team');
      playSfx('success');
    } catch (error) {
      console.error('start team battle failed:', error);
      showToast('Não foi possível iniciar a partida de equipes.');
      playSfx('error');
    } finally {
      setPvpTeamActionBusy(false);
    }
  }

  async function startPvpEliminationBattle() {
    const room = pvpEliminationRoom && typeof pvpEliminationRoom === 'object' ? pvpEliminationRoom : null;
    if (!room?.id || pvpEliminationActionBusy) return;
    const roomStatus = String(room?.status || '').trim().toLowerCase();
    if (roomStatus !== 'lobby' && roomStatus !== 'pending_accept') return;
    if (String(getPvpEliminationRoomHostUserId(room) || '') !== String(authUser?.uid || '')) {
      showToast('Somente o criador da sala pode iniciar.');
      playSfx('error');
      return;
    }
    if (roomStatus === 'pending_accept') {
      const acceptStates = getPvpEliminationRoomAcceptStateMap(room);
      const members = getPvpEliminationMembers(room);
      const everyoneAccepted = members.length === PVP_ELIMINATION_ROOM_CAPACITY
        && members.every((member) => {
          const memberId = String(member?.user_id || '').trim();
          if (!memberId) return false;
          return normalizePvpEliminationAcceptState(acceptStates[memberId]) === 'accepted';
        });
      if (!everyoneAccepted) return;
    } else {
      const launchCheck = getPvpEliminationRoomLaunchCheck(room);
      if (!launchCheck.canStart) {
        const notice = buildPvpEliminationRoomStartBlockedNotice(room);
        publishPvpEliminationRoomNotice(room.id, notice).catch(() => null);
        setPvpEliminationRoomNoticeModal(notice);
        showToast('Ainda não é possível iniciar a sala.');
        playSfx('error');
        return;
      }
    }

    setPvpEliminationActionBusy(true);
    try {
      const members = getPvpEliminationMembers(room);
      const activeIds = members.map((member) => String(member?.user_id || '').trim()).filter(Boolean);
      const matchId = buildPvpEliminationMatchId(room.id);
      const cycleRounds = buildPvpEliminationCycleRounds(activeIds, `${matchId}:1`);
      const firstPair = getPvpEliminationNextPlayablePair(cycleRounds, 1, 1);
      if (
        members.length !== PVP_ELIMINATION_ROOM_CAPACITY
        || activeIds.length !== PVP_ELIMINATION_ROOM_CAPACITY
        || !firstPair?.player1_user_id
        || !firstPair?.player2_user_id
      ) {
        throw new Error('elimination_room_invalid_setup');
      }

      const questionSequence = resolvePvpMatchQuestionSequence({
        areaId: room.knowledge_area || pvpKnowledgeArea,
        difficulty: room.difficulty || pvpConfig.difficulty,
        language: room.language || pvpConfig.language,
        topic: room.topic || pvpConfig.topic,
        rounds: PVP_ELIMINATION_MAX_TOTAL_BATTLES,
        sequenceSeed: matchId
      });
      const questionSet = Array.isArray(questionSequence?.questions)
        ? questionSequence.questions.slice(0, PVP_ELIMINATION_MAX_TOTAL_BATTLES)
        : [];
      if (questionSet.length !== PVP_ELIMINATION_MAX_TOTAL_BATTLES) {
        throw new Error('elimination_room_not_enough_questions');
      }

      const memberScores = {};
      activeIds.forEach((userId) => {
        if (!userId) return;
        memberScores[userId] = 0;
      });
      const cycleScores = buildPvpEliminationCycleScoreMap(activeIds);
      const created = await createPvpEliminationMatch({
        id: matchId,
        mode: PVP_MODE_ELIMINATION,
        room_id: room.id,
        difficulty: room.difficulty || pvpConfig.difficulty,
        category: room.category || room.difficulty || pvpConfig.difficulty,
        language: questionSequence?.resolvedLanguage || room.language || pvpConfig.language,
        topic: questionSequence?.resolvedTopic || room.topic || pvpConfig.topic,
        knowledge_area: room.knowledge_area || pvpKnowledgeArea,
        battle_no: 1,
        cycle_no: 1,
        round_in_cycle: Number(firstPair.round_in_cycle || 1),
        pair_no: Number(firstPair.pair_no || 1),
        total_rounds_per_cycle: PVP_ELIMINATION_ROUNDS_PER_CYCLE,
        question_set: questionSet,
        members,
        active_member_ids: activeIds,
        spectator_member_ids: [],
        elimination_order: [],
        opt_out_member_ids: [],
        cycle_rounds: cycleRounds,
        active_pair_user_ids: [firstPair.player1_user_id, firstPair.player2_user_id],
        member_scores: memberScores,
        cycle_member_scores: cycleScores,
        battle_started_at_ms: Date.now(),
        battle_started_at: nowIso()
      });
      if (!created?.id) {
        throw new Error('elimination_match_create_failed');
      }
      await updatePvpEliminationRoom(room.id, {
        status: 'active',
        match_id: created.id
      });
      setPvpEliminationMatchId(String(created.id));
      setPvpEliminationMatch(created);
      setPvpEliminationSubmitted(false);
      setPvpEliminationSelectedIndex(null);
      setPvpEliminationExitPrompt(null);
      setScreen('pvp-elimination');
      playSfx('success');
    } catch (error) {
      console.error('start elimination battle failed:', error);
      showToast('Não foi possível iniciar a eliminatória.');
      playSfx('error');
    } finally {
      setPvpEliminationActionBusy(false);
    }
  }

  function focusEvolutionPassStage(stageId = '') {
    const safeStageId = String(stageId || '').trim();
    if (!safeStageId) return;
    const nextStage = evolutionPassStages.find((stage) => String(stage?.id || '').trim() === safeStageId);
    if (!nextStage) return;
    setPassFocusedStageId(safeStageId);
  }

  function focusAdjacentEvolutionPassStage(direction = 1) {
    if (!evolutionPassStages.length) return;
    const step = direction < 0 ? -1 : 1;
    const baseIndex = evolutionPassFocusedStageIndex >= 0 ? evolutionPassFocusedStageIndex : 0;
    const nextIndex = Math.max(0, Math.min(evolutionPassStages.length - 1, baseIndex + step));
    if (nextIndex === baseIndex) return;
    focusEvolutionPassStage(evolutionPassStages[nextIndex]?.id || '');
  }

  function triggerAppBackNavigation(source = 'button') {
    const safeSource = String(source || 'button').toLowerCase();

    if (playerHistoryOpen) {
      closePlayerHistoryPanel();
      return true;
    }
    if (pvpEmojiPickerOpen) {
      closePvpEmojiPicker();
      return true;
    }
    if (quizMenuOpen) {
      closeQuizMenu();
      return true;
    }
    if (pvpEliminationExitPrompt?.matchId) {
      keepWatchingPvpElimination();
      return true;
    }

    if (screen === 'pvp-team') {
      leavePvpTeamFlow();
      return true;
    }
    if (screen === 'pvp-elimination') {
      leavePvpEliminationFlow();
      return true;
    }
    if (screen === 'challenge') {
      const duelStatus = String(pvpState.status || '').trim().toLowerCase();
      if (pvpMode === PVP_MODE_TEAM_BATTLE) {
        if (pvpTeamRoomId) {
          const mySide = getPvpTeamUserSide(pvpTeamRoom, authUser?.uid || '');
          if (mySide) {
            leaveSelectedPvpTeamRoom().catch(() => null);
          } else {
            setPvpTeamRoomId('');
            setPvpTeamRoom(null);
          }
          return true;
        }
        if (pvpMode) {
          returnToPvpModeMenu();
          return true;
        }
        setScreen('play-mode');
        return true;
      }
      if (pvpMode === PVP_MODE_ELIMINATION) {
        const eliminationMatchId = String(pvpEliminationMatch?.id || pvpEliminationMatchId || '').trim();
        const eliminationOptOutIds = Array.isArray(pvpEliminationMatch?.opt_out_member_ids)
          ? pvpEliminationMatch.opt_out_member_ids.map((entry) => String(entry || '').trim()).filter(Boolean)
          : [];
        const eliminationActiveIds = getPvpEliminationActiveMemberIds(pvpEliminationMatch || null);
        const eliminationIsActiveForUser = !!authUser?.uid && eliminationActiveIds.includes(String(authUser.uid));
        const eliminationBlocked = !!eliminationMatchId && (
          ignoredPvpEliminationMatchIdsRef.current.has(eliminationMatchId)
          || (!!authUser?.uid && eliminationOptOutIds.includes(String(authUser.uid)))
        );
        if (eliminationBlocked) {
          setPvpEliminationMatchId('');
          setPvpEliminationMatch(null);
        }
        if (eliminationMatchId && !eliminationBlocked && eliminationIsActiveForUser) {
          setScreen('pvp-elimination');
          return true;
        }
        if (
          String(pvpEliminationQueueStateRef.current?.status || '').trim().toLowerCase() === 'queueing'
          || pvpEliminationRoomId
        ) {
          cancelPvpEliminationQueue({ silent: true }).catch(() => null);
          return true;
        }
        if (pvpMode) {
          returnToPvpModeMenu();
          return true;
        }
        setScreen('play-mode');
        return true;
      }
      if (
        duelStatus === 'queueing'
        || duelStatus === 'pending_accept'
        || duelStatus === 'active'
        || duelStatus === 'round_result'
      ) {
        leavePvpFlow();
        return true;
      }
      if (pvpMode === PVP_MODE_DUEL) {
        returnToPvpModeMenu();
        return true;
      }
      setScreen('play-mode');
      return true;
    }
    if (screen === 'pvp') {
      leavePvpFlow();
      return true;
    }
    if (screen === 'pvp-result') {
      if (pvpResultReward || pvpCompensation || pvpRewardCollecting || pvpResultTransitionMode === 'opponent_left') {
        showToast('Colete as recompensas para encerrar a partida.');
        return true;
      }
      setScreen('home');
      return true;
    }
    if (screen === 'pvp-team-result') {
      if (!pvpTeamResultReward && !pvpTeamRewardCollecting && !pvpTeamResultProcessed) {
        return true;
      }
      if (pvpTeamResultReward || pvpTeamRewardCollecting) {
        showToast('Colete as recompensas da equipe para encerrar.');
        return true;
      }
      resetPvpTeamState();
      setPvpMode('');
      setScreen('home');
      return true;
    }
    if (screen === 'pvp-elimination-result') {
      if (!pvpEliminationResultReward && !pvpEliminationRewardCollecting && !pvpEliminationResultProcessed) {
        return true;
      }
      if (pvpEliminationResultReward || pvpEliminationRewardCollecting) {
        showToast('Colete as recompensas da eliminatória para encerrar.');
        return true;
      }
      resetPvpEliminationState();
      setPvpMode('');
      setScreen('home');
      return true;
    }

    if (screen === 'quiz') {
      openQuizMenu();
      return true;
    }

    if (screen === 'nickname-setup') {
      showToast('Defina um apelido válido para continuar.');
      return true;
    }

    if (screen === 'settings') {
      setScreen('home');
      return true;
    }
    if (screen === 'rankings' || screen === 'achievements' || screen === 'shop') {
      setScreen('home');
      return true;
    }
    if (screen === 'play-mode') {
      setScreen('home');
      return true;
    }
    if (screen === 'knowledge-area') {
      setScreen('play-mode');
      return true;
    }
    if (screen === 'select') {
      setScreen('knowledge-area');
      return true;
    }
    if (screen === 'topic') {
      setScreen('select');
      return true;
    }
    if (screen === 'difficulty') {
      setScreen('topic');
      return true;
    }
    if (screen === 'result' || screen === 'feedback') {
      setScreen('home');
      return true;
    }
    if (screen === 'admin-live' || screen === 'admin-history') {
      setScreen('admin-monitor');
      return true;
    }
    if (screen === 'admin-monitor') {
      setScreen('home');
      return true;
    }

    if (safeSource === 'gesture' || safeSource === 'browser') {
      return false;
    }
    return false;
  }

  function beginPveRound(difficulty) {
    if (!selectedLanguage || !selectedTopic) {
      showToast('Escolha tema e topico primeiro.');
      return;
    }

    const safeDifficulty = normalizeDifficulty(difficulty);
    const questions = pickPveRoundQuestionsByTopicSequence(
      QUESTIONS,
      selectedLanguage,
      selectedTopic,
      safeDifficulty,
      PVE_QUESTIONS_PER_ROUND
    );

    if (!questions.length) {
      showToast('Não há perguntas para essa combinação.');
      return;
    }

    const firstTheme = resolveQuestionThemeContext(questions[0], selectedLanguage, selectedTopic);
    const nextQuizState = {
      language: selectedLanguage,
      topic: selectedTopic,
      difficulty: safeDifficulty,
      questions,
      index: 0,
      score: 0,
      correctCount: 0,
      streak: 0,
      bestRunStreak: 0,
      lives: 3,
      answered: false,
      selectedIndex: null,
      answerLog: [],
      questionStartedAtMs: 0,
      timeLeft: getPveRoundSeconds()
    };
    setQuizState(null);
    setFeedbackState(null);
    setQuizMenuOpen(false);
    runThemeIntroOverlay(
      {
        mode: 'pve',
        languageId: firstTheme.languageId || selectedLanguage,
        topicId: firstTheme.topicId || selectedTopic,
        difficulty: safeDifficulty,
        roundNo: 1
      },
      {
        durationMs: THEME_INTRO_PVE_DURATION_MS,
        onComplete: () => {
          setQuizState({
            ...nextQuizState,
            questionStartedAtMs: Date.now(),
            timeLeft: getPveRoundSeconds()
          });
          setFeedbackState(null);
          setResultState(null);
          setRewardCollecting(false);
          setRewardFxParticles([]);
          setQuizRankingRows([]);
          setQuizMenuOpen(false);
          setScreen('quiz');
        }
      }
    );
  }

  function openQuizMenu() {
    if (!quizState || screen !== 'quiz') return;
    setQuizMenuOpen(true);
  }

  function closeQuizMenu() {
    setQuizMenuOpen(false);
  }

  function restartCurrentQuiz() {
    if (!quizState) return;
    setQuizMenuOpen(false);
    beginPveRound(quizState.difficulty || 'easy');
  }

  function chooseAnotherQuiz() {
    setQuizMenuOpen(false);
    resetQuizFlow();
    setScreen('select');
  }

  function returnQuizToHome() {
    setQuizMenuOpen(false);
    resetQuizFlow();
    setScreen('home');
  }

  function handleAnswer(index) {
    setQuizState((prev) => {
      if (!prev || prev.answered) return prev;
      return {
        ...prev,
        selectedIndex: Number(index)
      };
    });
    playSfx('notify');
  }

  function confirmQuizAnswer() {
    if (!quizState || quizState.answered) return;
    const selected = Number(quizState.selectedIndex ?? -1);
    if (!Number.isFinite(selected) || selected < 0) {
      showToast('Selecione uma opção para confirmar.');
      playSfx('error');
      return;
    }

    setQuizState((prev) => {
      if (!prev || prev.answered) return prev;
      const question = prev.questions[prev.index];
      if (!question) return prev;
      const pickedIndex = Number(prev.selectedIndex ?? -1);
      if (!Number.isFinite(pickedIndex) || pickedIndex < 0) return prev;

      const correct = Number(pickedIndex) === Number(question.answer);
      const streak = correct ? prev.streak + 1 : 0;
      const lives = correct ? prev.lives : Math.max(0, prev.lives - 1);
      const answerEntry = buildPveQuestionReviewEntry(question, {
        questionIndex: prev.index,
        selectedIndex: pickedIndex,
        isCorrect: correct,
        isTimeout: false,
        wasAnswered: true
      });
      const answerLog = Array.isArray(prev.answerLog) ? [...prev.answerLog, answerEntry] : [answerEntry];

      const next = {
        ...prev,
        answered: true,
        selectedIndex: pickedIndex,
        streak,
        bestRunStreak: Math.max(prev.bestRunStreak, streak),
        correctCount: correct ? prev.correctCount + 1 : prev.correctCount,
        score: correct ? prev.score + 1 : prev.score,
        lives,
        answerLog
      };

      setFeedbackState({
        isCorrect: correct,
        isTimeout: false,
        selectedIndex: pickedIndex,
        question: {
          ...normalizeQuestionForSequence(question),
          explain: getDidacticExplainText(question)
        }
      });
      playSfx(correct ? 'success' : 'error');
      setScreen('feedback');
      return next;
    });
  }

  function handleTimeout() {
    setQuizState((prev) => {
      if (!prev || prev.answered) return prev;
      const question = prev.questions[prev.index];
      if (!question) return prev;
      const answerEntry = buildPveQuestionReviewEntry(question, {
        questionIndex: prev.index,
        selectedIndex: -1,
        isCorrect: false,
        isTimeout: true,
        wasAnswered: true
      });
      const answerLog = Array.isArray(prev.answerLog) ? [...prev.answerLog, answerEntry] : [answerEntry];

      const next = {
        ...prev,
        answered: true,
        selectedIndex: -1,
        streak: 0,
        lives: Math.max(0, prev.lives - 1),
        answerLog
      };

      setFeedbackState({
        isCorrect: false,
        isTimeout: true,
        selectedIndex: -1,
        question: {
          ...normalizeQuestionForSequence(question),
          explain: getDidacticExplainText(question)
        }
      });
      playSfx('error');
      setScreen('feedback');
      return next;
    });
  }

  async function finishRound(stateToFinish) {
    const totalQuestions = stateToFinish.questions.length;
    const questionReview = buildPveRoundReviewList(
      stateToFinish.questions,
      stateToFinish.answerLog
    );

    const outcome = applyQuizOutcome(progress, {
      language: stateToFinish.language,
      topic: stateToFinish.topic,
      difficulty: stateToFinish.difficulty,
      correctCount: stateToFinish.correctCount,
      totalQuestions,
      bestRunStreak: stateToFinish.bestRunStreak
    });

    const nextProgress = outcome.progress;
    setProgress(nextProgress);

    const result = {
      language: stateToFinish.language,
      topic: stateToFinish.topic,
      difficulty: stateToFinish.difficulty,
      correctCount: stateToFinish.correctCount,
      totalQuestions,
      score: stateToFinish.score,
      scorePct: outcome.summary.scorePct,
      awardedXp: outcome.summary.awardedXp,
      awardedCoins: outcome.summary.awardedCoins,
      rankingGain: outcome.summary.rankingGain,
      leveledUp: outcome.summary.leveledUp,
      newLevel: outcome.summary.newLevel,
      unlockedAchievements: outcome.unlockedAchievements,
      questionReview,
      rewardsCollected: false
    };

    setRewardCollecting(false);
    setRewardFxParticles([]);
    setResultState(result);
    setScreen('result');

    const localHistoryUserId = String(authUser?.uid || 'guest').trim() || 'guest';
    const nextQuizHistoryEntries = appendPlayerQuizHistoryLocal(localHistoryUserId, {
      id: `pve_${Date.now()}_${result.language}_${result.topic}_${result.difficulty}`,
      language: result.language,
      topic: result.topic,
      difficulty: result.difficulty,
      scorePct: result.scorePct,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      awardedXp: result.awardedXp,
      awardedCoins: result.awardedCoins,
      rankingGain: result.rankingGain,
      createdAt: new Date().toISOString(),
      timestampMs: Date.now()
    });
    setPlayerQuizHistoryEntries(nextQuizHistoryEntries);

    if (authUser?.uid) {
      try {
        await Promise.all([
          upsertStatsFromProgress(authUser.uid, nextProgress),
          saveQuizResult(authUser.uid, {
            language: result.language,
            topic: result.topic,
            difficulty: result.difficulty,
            score_pct: result.scorePct,
            xp_earned: result.awardedXp,
            correct_count: result.correctCount,
            total_questions: result.totalQuestions,
            best_streak: stateToFinish.bestRunStreak
          })
        ]);

      } catch (error) {
        console.error('quiz sync failed:', error);
        showToast('Falha ao sincronizar resultado no servidor.');
      }
    }

    setQuizRankingLoading(true);
    try {
      const rows = await getQuizRankings(result.language, result.topic, result.difficulty, 20);
      setQuizRankingRows(rows);
    } catch {
      setQuizRankingRows([]);
    } finally {
      setQuizRankingLoading(false);
    }
  }

  async function nextQuestion() {
    if (!quizState) return;
    const nextIndex = quizState.index + 1;
    if (quizState.lives <= 0 || nextIndex >= quizState.questions.length) {
      await finishRound(quizState);
      return;
    }

    setQuizState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        index: prev.index + 1,
        answered: false,
        selectedIndex: null,
        questionStartedAtMs: Date.now(),
        timeLeft: getPveRoundSeconds()
      };
    });

    setFeedbackState(null);
    setScreen('quiz');
  }

  function openSettingsSignOutConfirm() {
    if (googleSignInBusy) return;
    setSettingsSignOutConfirmOpen(true);
  }

  function closeSettingsSignOutConfirm() {
    if (googleSignInBusy) return;
    setSettingsSignOutConfirmOpen(false);
  }

  async function confirmSettingsSignOut() {
    if (googleSignInBusy) return;
    setSettingsSignOutConfirmOpen(false);
    await handleSignOut({
      withTransition: true,
      transitionTitle: 'Saindo da sua conta',
      transitionSubtitle: 'Encerrando a sessão com segurança e voltando para o login.'
    });
  }

  function finishHomeTour(markSeen = true) {
    if (markSeen && activeAuthUser?.uid) {
      writeHomeTourSeenLocal(activeAuthUser.uid, true);
    }
    setHomeTourOpen(false);
    setHomeTourHighlight(null);
    setHomeTourStepIndex(0);
  }

  function skipHomeTour() {
    finishHomeTour(true);
  }

  function advanceHomeTour() {
    if (isHomeTourLastStep) {
      finishHomeTour(true);
      return;
    }
    setHomeTourStepIndex((prev) => Math.min(homeTourSteps.length - 1, prev + 1));
  }

  async function resetGoogleSessionState() {
    if (activeAuthUser?.uid) {
      await markPresenceClosed(activeAuthUser.uid).catch(() => null);
      await leaveQueue(activeAuthUser.uid).catch(() => null);
    }
    await signOut(firebaseAuth);
    resetQuizFlow();
    resetPvpState();
    setAdminAuthorized(false);
    setIsAdminUser(false);
    setOnboardingRequired(false);
    googleSignInRef.current = false;
    setGoogleSignInBusy(false);
    setAuthTransition({ visible: false, title: '', subtitle: '' });
    setScreen('login');
  }

  async function handleSignIn(mode = 'signin') {
    if (googleSignInBusy) return;
    const signInMode = mode === 'switch' ? 'switch' : 'signin';

    googleSignInRef.current = true;
    setGoogleSignInBusy(true);
    setAuthTransition({
      visible: true,
      title: signInMode === 'switch' ? 'Abrindo seleção de conta' : 'Conectando ao Google',
      subtitle: 'Escolha a conta Google que deseja usar para continuar dentro do app.'
    });

    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account',
        flowMode: signInMode,
        preferNativePrompt: true
      });
      await withTimeout(signInWithPopup(firebaseAuth, googleProvider), AUTH_POPUP_TIMEOUT_MS, 'signInWithPopup');
      setAuthTransition({
        visible: true,
        title: signInMode === 'switch' ? 'Trocando de conta' : 'Entrando na sua conta',
        subtitle: 'Estamos preparando o seu perfil...'
      });
    } catch (error) {
      const code = String(error?.code || '').trim().toLowerCase();
      const label = String(error?.label || '').trim().toLowerCase();
      const userClosedPopup = code.includes('popup-closed-by-user');
      console.error('sign in error:', error);

      googleSignInRef.current = false;
      setGoogleSignInBusy(false);
      setAuthTransition({ visible: false, title: '', subtitle: '' });
      if (isNativePromptUnavailableError(error)) {
        showToast('Toque em "Continuar com Google" para escolher a conta.');
        return;
      }
      if (!userClosedPopup) {
        if (code.includes('popup-blocked')) {
          showToast('Não foi possível abrir a seleção da conta Google. Permita popups para continuar.');
        } else if (code === 'app/timeout' && label === 'signinwithpopup') {
          showToast('A seleção da conta Google demorou mais do que o esperado.');
        } else {
          showToast('Não foi possível entrar com Google.');
        }
      }
      playSfx('error');
    } finally {
      googleProvider.setCustomParameters({
        prompt: 'select_account',
        flowMode: 'signin',
        preferNativePrompt: true
      });
    }
  }

  async function handleSignOut(options = {}) {
    if (googleSignInBusy) return;
    const showTransition = options?.withTransition === true;
    const transitionTitle = String(options?.transitionTitle || 'Saindo da conta').trim() || 'Saindo da conta';
    const transitionSubtitle = String(
      options?.transitionSubtitle || 'Encerrando a sessão com segurança para voltar ao login.'
    ).trim() || 'Encerrando a sessão com segurança para voltar ao login.';
    try {
      setGoogleSignInBusy(true);
      if (showTransition) {
        setAuthTransition({
          visible: true,
          title: transitionTitle,
          subtitle: transitionSubtitle,
          mode: 'logout'
        });
        await new Promise((resolve) => {
          if (typeof window !== 'undefined') {
            window.setTimeout(resolve, 220);
            return;
          }
          setTimeout(resolve, 220);
        });
      }
      await resetGoogleSessionState();
      playSfx('notify');
    } catch (error) {
      console.error('sign out error:', error);
      setGoogleSignInBusy(false);
      setAuthTransition({ visible: false, title: '', subtitle: '', mode: 'auth' });
      showToast('Não foi possível sair.');
      playSfx('error');
    }
  }

  async function handleSwitchGoogleAccount() {
    if (googleSignInBusy) return;

    try {
      await resetGoogleSessionState();
      showToast('Escolha a conta Google para continuar.');
      await handleSignIn('switch');
    } catch (error) {
      console.error('switch account error:', error);
      showToast('Não foi possível trocar de conta.');
      playSfx('error');
    }
  }

  async function saveProfile() {
    if (!activeAuthUser?.uid) return;

    const nickname = String(profileDraft.nickname || '').trim();
    const validation = validateNicknameInput(nickname);
    if (!validation.ok) {
      showToast(validation.errorMessage);
      return;
    }
    if (!nicknameAvailability.available && validation.nickname !== String(profile?.nickname || '').trim()) {
      showToast('Aguarde a verificação do apelido.');
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await updateUserProfile(activeAuthUser.uid, {
        nickname: validation.nickname,
        equipped_frame: shopData?.equipped?.frame,
        equipped_background: shopData?.equipped?.background,
        equipped_emoji: shopData?.equipped?.emoji
      });
      setProfile(updated);
      setProfileDraft({
        nickname: updated.nickname || validation.nickname,
        full_name: updated.full_name || ''
      });
      const completedOnboarding = onboardingRequired === true;
      if (completedOnboarding) {
        setOnboardingRequired(false);
        setScreen('home');
      }
      playSfx('success');
    } catch (error) {
      console.error('save profile error:', error);
      if (error?.code === 'nickname/taken') {
        showToast('Este apelido já está em uso.');
      } else if (String(error?.code || '').startsWith('nickname/')) {
        showToast(error?.message || NICKNAME_RULE_COPY);
      } else {
        showToast('Falha ao atualizar perfil.');
      }
      playSfx('error');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleClaimEvolutionPassStage(stageId, triggerEvent = null) {
    const safeStageId = String(stageId || '').trim();
    if (!safeStageId || passClaimingStageId) return;

    const snapshot = buildEvolutionPassSnapshot(progress);
    const stage = Array.isArray(snapshot?.stages)
      ? snapshot.stages.find((row) => String(row?.id || '').trim() === safeStageId)
      : null;

    if (!stage) return;
    if (stage.claimed) {
      showToast('Essa recompensa já foi coletada.');
      playSfx('notify');
      return;
    }
    if (!stage.completed) {
      showToast('Complete os objetivos da etapa para coletar.');
      playSfx('notify');
      return;
    }

    setPassClaimingStageId(safeStageId);
    try {
      const claimResult = applyEvolutionPassRewards(progress, [safeStageId]);
      const claimedStage = Array.isArray(claimResult?.claimedAchievements)
        ? claimResult.claimedAchievements[0]
        : null;
      if (!claimedStage) {
        showToast('Recompensa indisponível no momento. Tente novamente.');
        playSfx('notify');
        return;
      }

      const nextProgress = claimResult.progress;
      const nextPassSnapshot = buildEvolutionPassSnapshot(nextProgress);
      const nextPassStages = Array.isArray(nextPassSnapshot?.stages) ? nextPassSnapshot.stages : [];
      const nextFocusStage = getEvolutionPassPreferredStage(nextPassStages);
      const rewardXp = Math.max(0, Number(claimResult.rewardXp || 0));
      const rewardCoins = Math.max(0, Number(claimResult.rewardCoins || 0));
      const rewardShopItems = [...new Set(
        (Array.isArray(claimResult?.rewardShopItems) ? claimResult.rewardShopItems : [])
          .map((itemId) => String(itemId || '').trim())
          .filter(Boolean)
      )];
      const rewardOrigin = getRewardEffectOrigin(triggerEvent);

      setProgress(nextProgress);
      if (nextFocusStage?.id) {
        setPassFocusedStageId(String(nextFocusStage.id));
      }
      if (rewardShopItems.length > 0) {
        const nextShop = grantShopItems(shopData, rewardShopItems);
        setShopData(nextShop);
        if (authUser?.uid) {
          try {
            saveShopData(authUser.uid, nextShop);
          } catch {
            // ignore local storage write failures
          }
          saveUserShop(authUser.uid, nextShop).catch(() => null);
        }
      }

      if (authUser?.uid) {
        try {
          saveProgress(authUser.uid, nextProgress);
        } catch {
          // ignore local storage write failures
        }
        await upsertStatsFromProgress(authUser.uid, nextProgress).catch(() => null);
      }

      playSfx('pass_claim');
      runRewardParticleSequence({
        xp: rewardXp,
        coins: rewardCoins,
        origin: rewardOrigin
      });
      highlightClaimedPassStage(safeStageId);
    } catch (error) {
      console.error('claim evolution pass stage failed:', error);
      showToast('Falha ao coletar recompensa.');
      playSfx('error');
    } finally {
      setPassClaimingStageId('');
    }
  }

  async function handleBuyShopItem(itemId) {
    let sourceShop = normalizeShopData(shopData);
    let sourceProgress = normalizeProgress(progress);
    if (activeAuthUser?.uid) {
      const [remoteShop, remoteStats] = await Promise.all([
        getUserShop(activeAuthUser.uid).catch(() => null),
        getUserStats(activeAuthUser.uid).catch(() => null)
      ]);
      if (remoteShop && typeof remoteShop === 'object') {
        const mergedWithRemote = normalizeShopData(mergeShopData(sourceShop, remoteShop));
        const sourceOwnedCount = Array.isArray(sourceShop.owned) ? sourceShop.owned.length : 0;
        const mergedOwnedCount = Array.isArray(mergedWithRemote.owned) ? mergedWithRemote.owned.length : 0;
        const equippedChanged = (
          String(mergedWithRemote?.equipped?.frame || '') !== String(sourceShop?.equipped?.frame || '')
          || String(mergedWithRemote?.equipped?.background || '') !== String(sourceShop?.equipped?.background || '')
          || String(mergedWithRemote?.equipped?.emoji || '') !== String(sourceShop?.equipped?.emoji || '')
        );
        if (mergedOwnedCount > sourceOwnedCount || equippedChanged) {
          sourceShop = mergedWithRemote;
          setShopData(mergedWithRemote);
          try {
            saveShopData(activeAuthUser.uid, mergedWithRemote);
          } catch {
            // ignore local storage write failures
          }
        } else {
          sourceShop = mergedWithRemote;
        }
      }
      if (remoteStats && typeof remoteStats === 'object') {
        sourceProgress = mergeProgressWithRemoteStats(sourceProgress, remoteStats);
        const currentSnapshot = buildProgressSnapshot(progress);
        const mergedSnapshot = buildProgressSnapshot(sourceProgress);
        if (mergedSnapshot.signalScore > currentSnapshot.signalScore + 1) {
          setProgress(sourceProgress);
          try {
            saveProgress(activeAuthUser.uid, sourceProgress);
          } catch {
            // ignore local storage write failures
          }
        }
      }
    }

    const check = canPurchaseItem(sourceShop, itemId, sourceProgress.coins);
    if (!check.ok) {
      if (check.reason === 'already_owned') showToast('Você já possui esse item.');
      else if (check.reason === 'insufficient_coins') showToast('Moedas insuficientes.');
      else if (check.reason === 'pass_reward_only') showToast('Item exclusivo de recompensa do Passe de Evolução.');
      else showToast('Não foi possível comprar o item.');
      playSfx('error');
      return;
    }

    const nextShop = purchaseItem(sourceShop, itemId);
    setShopData(nextShop);

    const price = Number(check.item?.price || 0);
    const nextProgress = normalizeProgress({
      ...sourceProgress,
      coins: Math.max(0, Number(sourceProgress.coins || 0) - price),
      updatedAt: Date.now()
    });
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    if (activeAuthUser?.uid) {
      try {
        saveShopData(activeAuthUser.uid, nextShop);
      } catch {
        // ignore local storage write failures
      }
      saveUserShop(activeAuthUser.uid, nextShop).catch(() => null);
      try {
        saveProgress(activeAuthUser.uid, nextProgress);
      } catch {
        // ignore local storage write failures
      }
      upsertStatsFromProgress(activeAuthUser.uid, nextProgress).catch(() => null);
    }
    playSfx('success');
  }

  async function handleEquipShopItem(itemId) {
    const item = getShopItem(itemId);
    if (!item) return;

    const nextShop = equipItem(shopData, itemId);
    setShopData(nextShop);

    if (!activeAuthUser?.uid) {
      playSfx('notify');
      return;
    }

    try {
      const updatedProfile = await updateUserProfile(activeAuthUser.uid, {
        equipped_frame: nextShop.equipped.frame,
        equipped_background: nextShop.equipped.background,
        equipped_emoji: nextShop.equipped.emoji
      });
      setProfile(updatedProfile);
      saveShopData(activeAuthUser.uid, nextShop);
      saveUserShop(activeAuthUser.uid, nextShop).catch(() => null);
      playSfx('success');
    } catch (error) {
      console.error('equip sync failed:', error);
      showToast('Falha ao sincronizar equipamento.');
      playSfx('notify');
    }
  }

  function handleToggleOwnedShopItem(item) {
    const safeItem = item && typeof item === 'object' ? item : null;
    if (!safeItem?.id || !safeItem?.type) return;
    const defaultByType = {
      frame: 'frame_default',
      background: 'bg_default',
      emoji: 'emoji_profile'
    };
    const currentEquippedId = String(shopData?.equipped?.[safeItem.type] || defaultByType[safeItem.type] || '');
    const isEquipped = currentEquippedId === safeItem.id;
    if (isEquipped && safeItem.isDefault) return;
    if (isEquipped) {
      const fallbackId = defaultByType[safeItem.type] || safeItem.id;
      handleEquipShopItem(fallbackId);
      return;
    }
    handleEquipShopItem(safeItem.id);
  }

  function openShopItemPreview(item) {
    const safeItem = item && typeof item === 'object' ? item : null;
    if (!safeItem?.id) return;
    setShopItemPreview(safeItem);
  }

  function closeShopItemPreview() {
    setShopItemPreview(null);
  }

  function toggleShopCategory(tab, rarity) {
    const safeTab = normalizeShopTab(tab);
    const safeRarity = String(rarity || '').trim();
    if (!safeRarity || !SHOP_RARITY_ORDER.includes(safeRarity)) return;
    setShopCategoryOpen((prev) => {
      const next = normalizeShopCategoryOpenState(prev);
      const tabState = next[safeTab] && typeof next[safeTab] === 'object'
        ? { ...next[safeTab] }
        : { ...SHOP_CATEGORY_OPEN_DEFAULT };
      tabState[safeRarity] = !Boolean(tabState[safeRarity]);
      next[safeTab] = tabState;
      return next;
    });
  }

  function buildQueueReentryPayloadFromMatch(matchRow, userId) {
    const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
    const safeUserId = String(userId || '').trim();
    if (!safeUserId || isSystemBotUserId(safeUserId)) return null;

    const player1Id = String(row.player1_user_id || '').trim();
    const player2Id = String(row.player2_user_id || '').trim();
    const isPlayer1 = safeUserId === player1Id;
    const isPlayer2 = safeUserId === player2Id;
    if (!isPlayer1 && !isPlayer2) return null;

    const prefix = isPlayer1 ? 'player1' : 'player2';
    const difficulty = normalizeDifficulty(row.difficulty || row.category || 'easy');
    const category = normalizeDifficulty(row.category || difficulty);
    const language = String(
      row.pvp_sequence_pref_language
      || row.language
      || ''
    ).trim();
    const topic = String(
      row.pvp_sequence_pref_topic
      || row.topic
      || ''
    ).trim();
    const knowledgeArea = String(
      row.pvp_sequence_area
      || row.knowledge_area
      || resolveKnowledgeAreaByLanguageId(language)
      || 'programming'
    ).trim();
    const joinedAtMs = resolveMatchQueueJoinedAtMs(row, 0, safeUserId);

    return {
      user_id: safeUserId,
      nickname: String(row[`${prefix}_nickname`] || 'Jogador').trim() || 'Jogador',
      avatar: String(row[`${prefix}_avatar`] || '🤓').trim() || '🤓',
      level: Math.max(1, Number(row[`${prefix}_level`] || 1)),
      pvp_points: Math.max(0, Number(row[`${prefix}_pvp_points`] || 0)),
      equipped_frame: String(row[`${prefix}_frame`] || 'frame_default').trim() || 'frame_default',
      equipped_background: String(row[`${prefix}_background`] || 'bg_default').trim() || 'bg_default',
      equipped_emoji: String(row[`${prefix}_emoji`] || 'emoji_profile').trim() || 'emoji_profile',
      language,
      topic,
      knowledge_area: knowledgeArea,
      joined_at_ms: joinedAtMs,
      difficulty,
      category
    };
  }

  async function syncQueueStateAfterMatchRefusal(matchRow, endedReason = '') {
    const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
    const safeEndedReason = String(endedReason || row.ended_reason || '').trim().toLowerCase();
    if (safeEndedReason !== 'match_refused' && safeEndedReason !== 'accept_timeout') return;

    const participantIds = [
      String(row.player1_user_id || '').trim(),
      String(row.player2_user_id || '').trim()
    ]
      .filter(Boolean)
      .filter((userId, index, list) => list.indexOf(userId) === index)
      .filter((userId) => !isSystemBotUserId(userId));

    if (!participantIds.length) return;

    await Promise.all(
      participantIds.map(async (participantId) => {
        const flow = getMatchRefusalQueueFlow(
          {
            ...row,
            ended_reason: safeEndedReason
          },
          participantId
        );

        if (!flow.shouldResume) {
          await leaveQueue(participantId).catch(() => null);
          return;
        }

        const cleared = await clearQueueMatch(participantId).catch(() => null);
        if (String(cleared?.status || '').trim().toLowerCase() === 'waiting') return;

        const payload = buildQueueReentryPayloadFromMatch(row, participantId);
        if (!payload) return;
        await upsertQueueEntry(payload).catch(() => null);
      })
    );
  }

  async function resumeQueueAfterMatchRefused(endedReason = 'match_refused', matchRow = null) {
    if (!authUser?.uid || !profile?.id) return false;
    if (queueActionBusy) return false;
    setQueueActionBusy(true);
    setQueueActionPhase('resume');
    setQueueActionHint('');
    queueFlowLog('resume_queue_after_refused:start', {
      userId: authUser?.uid || '',
      endedReason,
      matchId: matchRow?.id || ''
    });

    const forcedDifficulty = getPvpQueueDifficultyFromConfig(pvpConfig, progress);
    const safeConfig = ensureValidPvpConfig({
      ...pvpConfig,
      difficulty: forcedDifficulty,
      area: pvpKnowledgeArea
    });
    const safeKnowledgeArea = String(
      pvpKnowledgeArea
      || resolveKnowledgeAreaByLanguageId(safeConfig.language || '')
      || 'programming'
    ).trim();
    setPvpConfig(safeConfig);

    const nowMs = Date.now();
    const currentQueueState = pvpStateRef.current && typeof pvpStateRef.current === 'object'
      ? pvpStateRef.current
      : {};
    const preservedJoinedAtMs = resolveMatchQueueJoinedAtMs(
      matchRow,
      pvpQueueResumeRef.current?.joinedAtMs
      || currentQueueState?.queueJoinedAtMs
      || nowMs,
      authUser?.uid || ''
    );
    const initialQueueJoinedAtMs = preservedJoinedAtMs > 0 ? preservedJoinedAtMs : nowMs;
    const initialQueueBotMatchAtMs = computeQueueBotMatchAtMs({
      nowMs,
      queueJoinedAtMs: initialQueueJoinedAtMs,
      queueResumeMode: '',
      currentBotMatchAtMs: 0
    });
    queueCancelRequestedRef.current = false;
    const lastBotUserId = getMatchBotUserId(matchRow);
    if (lastBotUserId) {
      setQueueBotExclusion(lastBotUserId, 45000);
    }
    queueSessionStartMsRef.current = initialQueueJoinedAtMs;
    queueSessionIdRef.current = buildQueueSessionId(authUser?.uid || '', nowMs);
    clearPreparedBot();
    prepareBotForQueue(forcedDifficulty, 'resume_start', true).catch(() => null);

    setPvpState({
      status: 'queueing',
      queueJoinedAtMs: initialQueueJoinedAtMs,
      queueBotMatchAtMs: initialQueueBotMatchAtMs,
      queueResumeMode: '',
      matchId: '',
      match: null,
      answers: [],
      roundStartMs: 0,
      submitted: false,
      selectedIndex: null,
      error: '',
      result: null
    });

    try {
      const queueRow = await withTimeout(
        upsertQueueEntry({
          user_id: authUser.uid,
          nickname: profile.nickname || 'Jogador',
          avatar: profile.avatar || '🤓',
          level: Math.max(1, Number(progress.level || 1)),
          pvp_points: Math.max(0, Number(progress.pvpPoints || 0)),
          equipped_frame: shopData?.equipped?.frame || 'frame_default',
          equipped_background: shopData?.equipped?.background || 'bg_default',
          equipped_emoji: shopData?.equipped?.emoji || 'emoji_profile',
          language: safeConfig.language,
          topic: safeConfig.topic,
          knowledge_area: safeKnowledgeArea,
          joined_at_ms: initialQueueJoinedAtMs,
          difficulty: forcedDifficulty,
          category: forcedDifficulty
        }),
        3600,
        'resume_upsert_queue'
      );
      const queueConfirm = applyBackendQueueJoinConfirmation(
        queueRow,
        {
          preferredJoinedAtMs: initialQueueJoinedAtMs,
          force: true,
          reason: 'resume_queue_after_refused:backend_confirmed'
        }
      );
      const confirmedJoinedAtMs = Math.max(
        0,
        Number(queueConfirm?.joinedAtMs || nowMs || Date.now())
      );
      const confirmedBotMatchAtMs = Math.max(0, Number(queueConfirm?.botMatchAtMs || 0));
      setScreen('challenge');
      clearPvpQueueResumeSnapshot();

      const statusText = getMatchRefusalQueueStatusText(
        matchRow || { ended_reason: endedReason },
        authUser.uid,
        { resumed: true }
      );
      showToast(statusText);
      playSfx('notify');
      queueFlowLog('resume_queue_after_refused:success', {
        userId: authUser?.uid || '',
        joinedAtMs: confirmedJoinedAtMs,
        botMatchAtMs: confirmedBotMatchAtMs,
        forcedDifficulty,
        knowledgeArea: safeKnowledgeArea,
        queueElapsedMs: Math.max(0, nowMs - confirmedJoinedAtMs)
      });
      setQueueActionHint('');
      prepareBotForQueue(forcedDifficulty, 'resume_after_refused').catch(() => null);
      return true;
    } catch (error) {
      console.error('resume queue after refusal failed:', error);
      queueFlowLog('resume_queue_after_refused:error', {
        userId: authUser?.uid || '',
        message: String(error?.message || error || 'unknown_error')
      });
      setQueueActionHint('Falha ao voltar para a fila.');
      clearPvpQueueResumeSnapshot();
      return false;
    } finally {
      setQueueActionBusy(false);
      setQueueActionPhase('');
    }
  }

  async function joinPvpQueue() {
    if (queueActionBusy) return;
    setQueueActionBusy(true);
    setQueueActionPhase('join');
    setQueueActionHint('');
    queueFlowLog('join_queue:start', {
      userId: authUser?.uid || '',
      screen,
      currentStatus: pvpStateRef.current?.status || ''
    });
    if (!authUser?.uid || !profile?.id) {
      showToast('Entre com sua conta para jogar PvP.');
      setScreen('login');
      setQueueActionBusy(false);
      setQueueActionPhase('');
      setQueueActionHint('');
      return;
    }

    const forcedDifficulty = getPvpQueueDifficultyFromConfig(pvpConfig, progress);
    const safeConfig = ensureValidPvpConfig({
      ...pvpConfig,
      difficulty: forcedDifficulty,
      area: pvpKnowledgeArea
    });
    const safeKnowledgeArea = String(
      pvpKnowledgeArea
      || resolveKnowledgeAreaByLanguageId(safeConfig.language || '')
      || 'programming'
    ).trim();
    setPvpConfig(safeConfig);
    queueCancelRequestedRef.current = false;

    const nowMs = Date.now();
    setQueueBotExclusion('', 0);
    queueSessionStartMsRef.current = 0;
    queueSessionIdRef.current = buildQueueSessionId(authUser?.uid || '', nowMs);
    clearPreparedBot();
    prepareBotForQueue(forcedDifficulty, 'join_start', true).catch(() => null);
    setPvpState({
      status: 'queueing',
      queueJoinedAtMs: 0,
      queueBotMatchAtMs: 0,
      queueResumeMode: '',
      matchId: '',
      match: null,
      answers: [],
      roundStartMs: 0,
      submitted: false,
      selectedIndex: null,
      error: '',
      result: null
    });
    clearPvpQueueResumeSnapshot();

    try {
      const queueRow = await withTimeout(
        upsertQueueEntry({
          user_id: authUser.uid,
          nickname: profile.nickname || 'Jogador',
          avatar: profile.avatar || '🤓',
          level: Math.max(1, Number(progress.level || 1)),
          pvp_points: Math.max(0, Number(progress.pvpPoints || 0)),
          equipped_frame: shopData?.equipped?.frame || 'frame_default',
          equipped_background: shopData?.equipped?.background || 'bg_default',
          equipped_emoji: shopData?.equipped?.emoji || 'emoji_profile',
          language: safeConfig.language,
          topic: safeConfig.topic,
          knowledge_area: safeKnowledgeArea,
          joined_at_ms: nowMs,
          difficulty: forcedDifficulty,
          category: forcedDifficulty
        }),
        3600,
        'join_upsert_queue'
      );
      if (queueCancelRequestedRef.current) {
        queueFlowLog('join_queue:cancelled_after_upsert', {
          userId: authUser.uid
        });
        await withTimeout(
          leaveQueue(authUser.uid).catch(() => null),
          3200,
          'join_rollback_leave_queue'
        ).catch(() => null);
        setPvpState((prev) => {
          if (String(prev?.status || '').trim().toLowerCase() !== 'queueing') return prev;
          return {
            ...prev,
            status: 'idle',
            queueJoinedAtMs: 0,
            queueBotMatchAtMs: 0,
            queueResumeMode: '',
            matchId: '',
            match: null,
            answers: [],
            roundStartMs: 0,
            submitted: false,
            selectedIndex: null,
            error: '',
            result: null
          };
        });
        setQueueActionHint('Entrada cancelada.');
        return;
      }
      const queueConfirm = applyBackendQueueJoinConfirmation(
        queueRow,
        {
          force: true,
          reason: 'join_queue:backend_confirmed'
        }
      );
      const confirmedJoinedAtMs = Math.max(0, Number(queueConfirm?.joinedAtMs || Date.now()));
      const confirmedBotMatchAtMs = Math.max(0, Number(queueConfirm?.botMatchAtMs || 0));
      queueFlowLog('join_queue:upsert_success', {
        userId: authUser.uid,
        forcedDifficulty,
        language: safeConfig.language,
        topic: safeConfig.topic,
        knowledgeArea: safeKnowledgeArea,
        queueJoinedAtMs: confirmedJoinedAtMs,
        botMatchAtMs: confirmedBotMatchAtMs
      });
      prepareBotForQueue(forcedDifficulty, 'join_queue').catch(() => null);
      playSfx('success');
      setQueueActionHint('');
    } catch (error) {
      console.error('join queue failed:', error);
      queueFlowLog('join_queue:error', {
        userId: authUser?.uid || '',
        message: String(error?.message || error || 'unknown_error')
      });
      await leaveQueue(authUser.uid).catch(() => null);
      setPvpState((prev) => {
        if (String(prev?.status || '').trim().toLowerCase() !== 'queueing') return prev;
        return {
          ...prev,
          status: 'idle',
          queueJoinedAtMs: 0,
          queueBotMatchAtMs: 0,
          queueResumeMode: ''
        };
      });
      showToast('Não foi possível entrar na fila.');
      playSfx('error');
      setQueueActionHint('Falha ao entrar na fila.');
    } finally {
      setQueueActionBusy(false);
      setQueueActionPhase('');
    }
  }

  async function cancelPvpQueue(options = {}) {
    const reason = String(options?.reason || 'manual').trim().toLowerCase();
    const autoCancelledByConnection = reason === 'connection_lost';
    const wasBusy = queueActionBusy;
    setQueueActionBusy(true);
    setQueueActionPhase('cancel');
    setQueueActionHint('');
    queueCancelRequestedRef.current = true;
    if (wasBusy) {
      queueFlowLog('cancel_queue:override_busy', {
        userId: authUser?.uid || '',
        status: pvpStateRef.current?.status || ''
      });
    }
    queueSessionStartMsRef.current = 0;
    queueSessionIdRef.current = '';
    clearPreparedBot();
    clearPvpQueueResumeSnapshot();
    setPvpState((prev) => {
      const safeStatus = String(prev?.status || '').trim().toLowerCase();
      if (safeStatus !== 'queueing') return prev;
      return {
        ...prev,
        status: 'idle',
        queueJoinedAtMs: 0,
        queueBotMatchAtMs: 0,
        queueResumeMode: '',
        matchId: '',
        match: null,
        answers: [],
        roundStartMs: 0,
        submitted: false,
        selectedIndex: null,
        error: '',
        result: null
      };
    });
    queueFlowLog('cancel_queue:local_stop', {
      userId: authUser?.uid || ''
    });
    queueFlowLog('cancel_queue:start', {
      userId: authUser?.uid || '',
      status: pvpStateRef.current?.status || '',
      reason: reason || 'manual'
    });
    try {
      if (authUser?.uid) {
        await withTimeout(
          leaveQueue(authUser.uid).catch(() => null),
          3200,
          'cancel_leave_queue'
        ).catch(() => null);
      }
      if (autoCancelledByConnection) showToast('Fila encerrada por perda de conexão.');
      playSfx(autoCancelledByConnection ? 'error' : 'notify');
      queueFlowLog('cancel_queue:done', {
        userId: authUser?.uid || '',
        reason: reason || 'manual'
      });
      setQueueActionHint('');
    } finally {
      setQueueActionBusy(false);
      setQueueActionPhase('');
    }
  }

  async function attachToMatch(matchId) {
    const safeMatchId = String(matchId || '').trim();
    if (!safeMatchId) return;
    if (attachingMatchRef.current === safeMatchId) return;

    const current = pvpStateRef.current;
    const currentMatchId = String(current?.matchId || '').trim();
    const currentStatus = String(current?.status || '').trim().toLowerCase();
    if (currentStatus === 'queueing') {
      const nowMs = Date.now();
      const joinedAtMs = Math.max(0, Number(current?.queueJoinedAtMs || 0));
      const botMatchAtMs = Math.max(0, Number(current?.queueBotMatchAtMs || 0));
      const elapsedAtPauseMs = joinedAtMs > 0 ? Math.max(0, nowMs - joinedAtMs) : 0;
      pvpQueueResumeRef.current = {
        available: joinedAtMs > 0,
        joinedAtMs,
        botRemainingMs: botMatchAtMs > 0 ? Math.max(0, botMatchAtMs - nowMs) : 0,
        elapsedAtPauseMs
      };
    }
    const alreadyAttached = currentMatchId === safeMatchId
      && (currentStatus === 'pending_accept' || currentStatus === 'active' || currentStatus === 'round_result');
    if (alreadyAttached) return;

    attachingMatchRef.current = safeMatchId;
    queueFlowLog('attach_match:start', {
      userId: authUser?.uid || '',
      matchId: safeMatchId,
      prevStatus: currentStatus
    });

    try {
      let latest = await withTimeout(
        getPvpMatch(safeMatchId).catch(() => null),
        2200,
        'attach_get_match'
      ).catch(() => null);
      if (!latest && authUser?.uid) {
        latest = await withTimeout(
          findOpenMatchForUser(authUser.uid).catch(() => null),
          2200,
          'attach_find_open_match'
        ).catch(() => null);
      }

      const matchStatus = String(latest?.status || '').trim().toLowerCase();
      if (
        !latest
        || (matchStatus !== 'pending_accept' && matchStatus !== 'active' && matchStatus !== 'round_result')
      ) {
        queueFlowLog('attach_match:deferred_missing_match', {
          userId: authUser?.uid || '',
          matchId: safeMatchId,
          status: matchStatus || ''
        });
        return;
      }

      const resolvedMatchId = String(latest?.id || safeMatchId).trim() || safeMatchId;
      const nextStatus = matchStatus === 'pending_accept'
        ? 'pending_accept'
        : (matchStatus === 'round_result' ? 'round_result' : 'active');

      if (authUser?.uid) {
        await leaveQueue(authUser.uid).catch(() => null);
      }

      setPvpState((prev) => ({
        ...prev,
        status: nextStatus,
        matchId: resolvedMatchId,
        match: latest || prev.match,
        queueJoinedAtMs: currentStatus === 'queueing'
          ? Math.max(0, Number(current?.queueJoinedAtMs || prev?.queueJoinedAtMs || 0))
          : 0,
        queueBotMatchAtMs: currentStatus === 'queueing'
          ? Math.max(0, Number(current?.queueBotMatchAtMs || prev?.queueBotMatchAtMs || 0))
          : 0,
        queueResumeMode: currentStatus === 'queueing'
          ? String(current?.queueResumeMode || prev?.queueResumeMode || '')
          : '',
        error: ''
      }));
      if (currentStatus === 'queueing') {
        queueSessionStartMsRef.current = 0;
        queueSessionIdRef.current = '';
        clearPreparedBot();
      }

      if (nextStatus === 'pending_accept') {
        startPvpMatchFoundTransition(resolvedMatchId);
        setScreen('challenge');
      } else {
        setScreen('pvp');
      }
      queueFlowLog('attach_match:done', {
        userId: authUser?.uid || '',
        matchId: resolvedMatchId,
        nextStatus
      });
    } finally {
      if (attachingMatchRef.current === safeMatchId) {
        attachingMatchRef.current = '';
      }
    }
  }

  async function submitPvpAnswer(answerIndex) {
    const current = pvpStateRef.current;
    if (current.status !== 'active') return;
    if (!authUser?.uid) return;
    if (!current.match || String(current.match.status || '') !== 'active') return;
    if (current.submitted) return;

    const matchId = String(current.matchId || current.match?.id || '').trim();
    const roundNo = Math.max(1, Number(current.match.round_no || 1));
    const question = current.match.question_set?.[roundNo - 1];
    if (!question) return;

    const safeIndex = Number.isFinite(Number(answerIndex)) ? Number(answerIndex) : -1;
    const isCorrect = safeIndex >= 0 && safeIndex === Number(question.answer);
    const nowMs = Date.now();
    const previousAnswers = Array.isArray(current.answers) ? current.answers : [];
    const previousSelectedIndex = current.selectedIndex;
    const previousSubmitted = !!current.submitted;

    setPvpState((prev) => {
      const prevStatus = String(prev?.status || '').trim().toLowerCase();
      if (prevStatus !== 'active') return prev;
      const prevMatchId = String(prev?.match?.id || prev?.matchId || '').trim();
      if (prevMatchId && prevMatchId !== matchId) return prev;
      const currentRoundNo = Math.max(1, Number(prev?.match?.round_no || 1));
      if (currentRoundNo !== roundNo) return prev;
      return {
        ...prev,
        submitted: true,
        selectedIndex: safeIndex
      };
    });

    try {
      const persistedAnswer = await upsertPvpAnswer({
        match_id: matchId,
        round_no: roundNo,
        user_id: authUser.uid,
        answer_idx: safeIndex,
        is_correct: isCorrect,
        correct_answer_idx: Number(question.answer ?? -1),
        answered_at_ms: nowMs,
        answered_at: new Date(nowMs).toISOString(),
        created_at: new Date(nowMs).toISOString()
      });

      if (!persistedAnswer || typeof persistedAnswer !== 'object') {
        throw new Error('missing_persisted_answer');
      }

      pvpRealtimeAnswersUpdateAtRef.current = Date.now();
      setPvpState((prev) => {
        const prevStatus = String(prev?.status || '').trim().toLowerCase();
        if (prevStatus !== 'active' && prevStatus !== 'round_result') return prev;
        const prevMatchId = String(prev?.match?.id || prev?.matchId || '').trim();
        if (prevMatchId && prevMatchId !== matchId) return prev;
        const currentRoundNo = getPvpAnswerTargetRoundNo(prev?.match, prevStatus);
        if (currentRoundNo !== roundNo) return prev;

        const nextAnswers = [
          ...(Array.isArray(prev.answers) ? prev.answers.filter((row) => String(row?.user_id || '').trim() !== String(authUser.uid)) : []),
          persistedAnswer
        ];

        return {
          ...prev,
          answers: nextAnswers,
          submitted: true,
          selectedIndex: safeIndex
        };
      });
      playSfx(isCorrect ? 'pvp_correct' : 'pvp_wrong');
    } catch (error) {
      setPvpState((prev) => {
        const prevStatus = String(prev?.status || '').trim().toLowerCase();
        if (prevStatus !== 'active') return prev;
        const prevMatchId = String(prev?.match?.id || prev?.matchId || '').trim();
        if (prevMatchId && prevMatchId !== matchId) return prev;
        const currentRoundNo = Math.max(1, Number(prev?.match?.round_no || 1));
        if (currentRoundNo !== roundNo) return prev;
        return {
          ...prev,
          answers: previousAnswers,
          submitted: previousSubmitted,
          selectedIndex: previousSelectedIndex
        };
      });
      console.error('submit answer failed:', error);
      showToast('Falha ao enviar resposta.');
      playSfx('error');
    }
  }

  function pickPvpAnswer(index) {
    setPvpState((prev) => {
      if (!prev || prev.status !== 'active') return prev;
      if (prev.submitted) return prev;
      return {
        ...prev,
        selectedIndex: Number(index)
      };
    });
    playSfx('notify');
  }

  async function confirmPvpAnswer() {
    const current = pvpStateRef.current;
    if (!current || current.status !== 'active' || current.submitted) return;
    const selected = Number(current.selectedIndex ?? -1);
    if (!Number.isFinite(selected) || selected < 0) {
      showToast('Selecione uma opção para confirmar.');
      playSfx('error');
      return;
    }
    playSfx('pvp_confirm');
    await submitPvpAnswer(selected);
  }

  function pickPvpTeamAnswer(index) {
    const match = pvpTeamMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    if (status !== 'active' || pvpTeamSubmitted) return;
    if (Date.now() > getPvpGroupBattleTiming(match, PVP_GROUP_MODE_TEAM).closesAtMs) return;
    const activePair = getPvpTeamBattleEntry(match, match?.battle_no || 1);
    const myUserId = String(authUser?.uid || '').trim();
    if (myUserId !== String(activePair?.red_user_id || '').trim() && myUserId !== String(activePair?.blue_user_id || '').trim()) {
      playSfx('error');
      return;
    }
    setPvpTeamSelectedIndex(Number(index));
    playSfx('notify');
  }

  function isPvpGroupMatchSnapshotObsolete(current, incoming) {
    if (!current?.id || String(current.id) !== String(incoming?.id || '')) return false;
    const currentStatus = String(current.status || '').trim().toLowerCase();
    const incomingStatus = String(incoming.status || '').trim().toLowerCase();
    if (currentStatus === 'finished' && incomingStatus !== 'finished') return true;
    if (current.winner_user_id && (incomingStatus === 'active' || incomingStatus === 'round_result')) return true;
    const currentBattleNo = Number(current.battle_no || 1);
    const incomingBattleNo = Number(incoming.battle_no || 1);
    if (incomingBattleNo !== currentBattleNo) return incomingBattleNo < currentBattleNo;
    const phaseOrder = { active: 0, round_result: 1, elimination_result: 2, finished: 3 };
    return (phaseOrder[incomingStatus] ?? -1) < (phaseOrder[currentStatus] ?? -1);
  }

  function isPvpGroupAnswerBattleCurrent(mode, matchId, battleNo) {
    const current = mode === PVP_GROUP_MODE_TEAM ? pvpTeamMatchRef.current : pvpEliminationMatchRef.current;
    return String(current?.id || '') === String(matchId || '')
      && String(current?.status || '').trim().toLowerCase() === 'active'
      && Math.max(1, Number(current?.battle_no || 1)) === battleNo;
  }

  async function submitPvpTeamAnswer(selectedIndex) {
    const match = pvpTeamMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    const myUserId = String(authUser?.uid || '').trim();
    if (!match?.id || status !== 'active' || !myUserId) return;

    const battleNo = Math.max(1, Number(match?.battle_no || 1));
    const activePair = getPvpTeamBattleEntry(match, battleNo);
    const isActivePlayer = myUserId === String(activePair?.red_user_id || '').trim()
      || myUserId === String(activePair?.blue_user_id || '').trim();
    if (!isActivePlayer) {
      showToast('Aguarde o confronto da sua dupla.');
      playSfx('error');
      return;
    }

    const question = getPvpGroupBattleQuestion(match, battleNo);
    const safeIndex = Math.max(0, Number(selectedIndex || 0));
    const isCorrect = safeIndex >= 0 && safeIndex === Number(question?.answer ?? -1);
    const nowMs = Date.now();
    if (nowMs > getPvpGroupBattleTiming(match, PVP_GROUP_MODE_TEAM).finalizeAtMs) {
      showToast('Tempo esgotado para este confronto.');
      playSfx('error');
      return;
    }
    const previousAnswers = Array.isArray(pvpTeamAnswers) ? [...pvpTeamAnswers] : [];
    const previousSelectedIndex = pvpTeamSelectedIndex;
    const previousSubmitted = pvpTeamSubmitted;

    setPvpTeamSubmitted(true);
    setPvpTeamSelectedIndex(safeIndex);

    try {
      const persistedAnswer = await upsertPvpTeamAnswer({
        match_id: String(match.id),
        battle_no: battleNo,
        user_id: myUserId,
        answer_idx: safeIndex,
        is_correct: isCorrect,
        correct_answer_idx: Number(question?.answer ?? -1),
        answered_at_ms: nowMs,
        answered_at: new Date(nowMs).toISOString(),
        created_at: new Date(nowMs).toISOString()
      });
      if (!isPvpGroupAnswerBattleCurrent(PVP_GROUP_MODE_TEAM, match.id, battleNo)) return;
      if (!persistedAnswer || typeof persistedAnswer !== 'object') {
        throw new Error('missing_persisted_team_answer');
      }
      setPvpTeamAnswers((prev) => {
        const currentAnswers = Array.isArray(prev) ? prev : [];
        const filtered = currentAnswers.filter((row) => Number(row?.battle_no || battleNo) === battleNo
          && String(row?.user_id || '').trim() !== myUserId);
        return [...filtered, persistedAnswer];
      });
      setPvpTeamSubmitted(true);
      setPvpTeamSelectedIndex(Number(persistedAnswer.answer_idx));
    } catch (error) {
      console.error('submit team answer failed:', error);
      if (!isPvpGroupAnswerBattleCurrent(PVP_GROUP_MODE_TEAM, match.id, battleNo)) return;
      setPvpTeamAnswers(previousAnswers);
      setPvpTeamSubmitted(previousSubmitted);
      setPvpTeamSelectedIndex(previousSelectedIndex);
      showToast('Falha ao enviar resposta da equipe.');
      playSfx('error');
    }
  }

  async function confirmPvpTeamAnswer() {
    const match = pvpTeamMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    if (status !== 'active' || pvpTeamSubmitted) return;
    const selected = Number(pvpTeamSelectedIndex ?? -1);
    if (!Number.isFinite(selected) || selected < 0) {
      showToast('Selecione uma opção para confirmar.');
      playSfx('error');
      return;
    }
    playSfx('pvp_confirm');
    await submitPvpTeamAnswer(selected);
  }

  function pickPvpEliminationAnswer(index) {
    const match = pvpEliminationMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    if (status !== 'active' || pvpEliminationSubmitted) return;
    const timing = getPvpGroupBattleTiming(match, PVP_GROUP_MODE_ELIMINATION);
    if (Date.now() < timing.opensAtMs || Date.now() > timing.closesAtMs) return;
    const myUserId = String(authUser?.uid || '').trim();
    const activePair = getPvpEliminationActivePair(match);
    if (myUserId !== String(activePair?.user1 || '').trim() && myUserId !== String(activePair?.user2 || '').trim()) {
      playSfx('error');
      return;
    }
    setPvpEliminationSelectedIndex(Number(index));
    playSfx('notify');
  }

  async function submitPvpEliminationAnswer(selectedIndex) {
    const match = pvpEliminationMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    const myUserId = String(authUser?.uid || '').trim();
    if (!match?.id || status !== 'active' || !myUserId) return;

    const battleNo = Math.max(1, Number(match?.battle_no || 1));
    const activePair = getPvpEliminationActivePair(match);
    const isActivePlayer = myUserId === String(activePair?.user1 || '').trim()
      || myUserId === String(activePair?.user2 || '').trim();
    if (!isActivePlayer) {
      showToast('Aguarde o confronto em andamento.');
      playSfx('error');
      return;
    }

    const question = getPvpGroupBattleQuestion(match, battleNo);
    const safeIndex = Math.max(0, Number(selectedIndex || 0));
    const isCorrect = safeIndex >= 0 && safeIndex === Number(question?.answer ?? -1);
    const nowMs = Date.now();
    if (nowMs > getPvpGroupBattleTiming(match, PVP_GROUP_MODE_ELIMINATION).finalizeAtMs) {
      showToast('Tempo esgotado para este duelo.');
      playSfx('error');
      return;
    }
    const previousAnswers = Array.isArray(pvpEliminationAnswers) ? [...pvpEliminationAnswers] : [];
    const previousSelectedIndex = pvpEliminationSelectedIndex;
    const previousSubmitted = pvpEliminationSubmitted;

    setPvpEliminationSubmitted(true);
    setPvpEliminationSelectedIndex(safeIndex);

    try {
      const persistedAnswer = await upsertPvpEliminationAnswer({
        match_id: String(match.id),
        battle_no: battleNo,
        user_id: myUserId,
        answer_idx: safeIndex,
        is_correct: isCorrect,
        correct_answer_idx: Number(question?.answer ?? -1),
        answered_at_ms: nowMs,
        answered_at: new Date(nowMs).toISOString(),
        created_at: new Date(nowMs).toISOString()
      });
      if (!isPvpGroupAnswerBattleCurrent(PVP_GROUP_MODE_ELIMINATION, match.id, battleNo)) return;
      if (!persistedAnswer || typeof persistedAnswer !== 'object') {
        throw new Error('missing_persisted_elimination_answer');
      }
      setPvpEliminationAnswers((prev) => {
        const currentAnswers = Array.isArray(prev) ? prev : [];
        const filtered = currentAnswers.filter((row) => Number(row?.battle_no || battleNo) === battleNo
          && String(row?.user_id || '').trim() !== myUserId);
        return [...filtered, persistedAnswer];
      });
      setPvpEliminationSubmitted(true);
      setPvpEliminationSelectedIndex(Number(persistedAnswer.answer_idx));
    } catch (error) {
      console.error('submit elimination answer failed:', error);
      if (!isPvpGroupAnswerBattleCurrent(PVP_GROUP_MODE_ELIMINATION, match.id, battleNo)) return;
      setPvpEliminationAnswers(previousAnswers);
      setPvpEliminationSubmitted(previousSubmitted);
      setPvpEliminationSelectedIndex(previousSelectedIndex);
      showToast('Falha ao enviar resposta da eliminatória.');
      playSfx('error');
    }
  }

  async function confirmPvpEliminationAnswer() {
    const match = pvpEliminationMatch;
    const status = String(match?.status || '').trim().toLowerCase();
    if (status !== 'active' || pvpEliminationSubmitted) return;
    const selected = Number(pvpEliminationSelectedIndex ?? -1);
    if (!Number.isFinite(selected) || selected < 0) {
      showToast('Selecione uma opção para confirmar.');
      playSfx('error');
      return;
    }
    playSfx('pvp_confirm');
    await submitPvpEliminationAnswer(selected);
  }

  async function sendPvpEmoji(emoji) {
    const safeEmoji = String(emoji || '').trim();
    if (!safeEmoji) return;
    const nowMs = Date.now();
    if (isPvpEmojiOnCooldown(nowMs)) {
      playSfx('error');
      return;
    }
    const current = pvpStateRef.current;
    const match = current?.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (current.status !== 'active' && current.status !== 'round_result') return;
    registerPvpEmojiSend(nowMs);

    const eventId = `${userId}_${nowMs}_${Math.floor(Math.random() * 10000)}`;
    const side = userId === String(match.player1_user_id || '').trim() ? 'left' : 'right';
    showPvpEmojiFx('duel', {
      fxId: `pvp_emoji_local_${eventId}`,
      emoji: safeEmoji,
      side,
      senderKey: `${String(match.id)}:${userId}`,
      sentAtMs: nowMs
    });
    rememberPvpEmojiEventId(eventId);
    setLatestPvpEmojiEvent({
      id: eventId,
      sender_user_id: userId,
      emoji: safeEmoji,
      sent_at_ms: Date.now()
    });
    queuePvpEmojiSend(String(match.id), userId, safeEmoji, eventId);
    playSfx('notify');
  }

  async function finalizePvpRound(roundNoInput) {
    if (finalizeRoundBusyRef.current) return;
    if (!authUser?.uid) return;

    const current = pvpStateRef.current;
    const match = current.match;
    if (!match || String(match.status || '') !== 'active') return;

    const roundNo = Math.max(1, Number(roundNoInput || match.round_no || 1));
    if (Number(match.round_no || 0) !== roundNo) return;

    finalizeRoundBusyRef.current = true;
    const lockAcquired = await tryAcquireRoundFinalizeLock(match.id, roundNo, authUser.uid, 7000).catch(() => false);
    if (!lockAcquired) {
      finalizeRoundBusyRef.current = false;
      return;
    }

    try {
      const latestMatch = await getPvpMatch(match.id);
      if (!latestMatch || String(latestMatch.status || '') !== 'active') return;
      if (Number(latestMatch.round_no || 0) !== roundNo) return;

      const player1Id = String(latestMatch.player1_user_id || '');
      const player2Id = String(latestMatch.player2_user_id || '');
      const playerIds = [player1Id, player2Id].filter(Boolean);
      if (playerIds.length < 2) return;

      const liveRoundAnswers = getPvpRoundAnswersForRound(current.answers, roundNo);
      const liveAnswersByUser = new Map(liveRoundAnswers.map((answer) => [String(answer.user_id || ''), answer]));
      const hasLiveAnswersForBothPlayers = playerIds.every((playerId) => liveAnswersByUser.has(playerId));
      const answers = hasLiveAnswersForBothPlayers
        ? liveRoundAnswers
        : await getPvpRoundAnswers(match.id, roundNo);
      const answersByUser = new Map(
        (Array.isArray(answers) ? answers : []).map((answer) => [String(answer.user_id || ''), answer])
      );

      const question = latestMatch.question_set?.[roundNo - 1];
      if (!question) return;
      const fallbackAnsweredAt = Date.now();
      const answerPlayer1 = answersByUser.get(player1Id) || {
        user_id: player1Id,
        answer_idx: -1,
        is_correct: false,
        answered_at_ms: fallbackAnsweredAt
      };
      const answerPlayer2 = answersByUser.get(player2Id) || {
        user_id: player2Id,
        answer_idx: -1,
        is_correct: false,
        answered_at_ms: fallbackAnsweredAt
      };
      const roundCorrectIndex = resolvePvpCorrectIndex(
        [answerPlayer1, answerPlayer2],
        Number(question.answer ?? -1)
      );

      const suddenDeathRound = roundNo > PVP_ROUNDS_PER_MATCH;
      const outcome = resolveRoundOutcome({
        question,
        answerPlayer1,
        answerPlayer2,
        player1Id,
        player2Id,
        suddenDeath: suddenDeathRound
      });

      const nextPlayer1Score = Math.max(0, Number(latestMatch.player1_score || 0) + Number(outcome.player1_delta || 0));
      const nextPlayer2Score = Math.max(0, Number(latestMatch.player2_score || 0) + Number(outcome.player2_delta || 0));
      const winnerByScore = nextPlayer1Score > nextPlayer2Score
        ? player1Id
        : (nextPlayer2Score > nextPlayer1Score ? player2Id : '');
      const reachedBaseRounds = roundNo >= PVP_ROUNDS_PER_MATCH;
      const finished = reachedBaseRounds && !!winnerByScore;

      const basePatch = {
        player1_score: nextPlayer1Score,
        player2_score: nextPlayer2Score,
        last_round_winner_user_id: outcome.winner_user_id || null
      };

      if (finished) {
        await updatePvpMatch(match.id, {
          ...basePatch,
          status: 'finished',
          winner_user_id: winnerByScore || null,
          ended_round_no: roundNo,
          ended_at: nowIso()
        });
      } else {
        const nextRoundNo = roundNo + 1;
        const nextQuestionSet = extendPvpQuestionSetIfNeeded(latestMatch, nextRoundNo);
        if (nextRoundNo > nextQuestionSet.length) {
          const fallbackWinner = resolveMatchWinner({
            ...latestMatch,
            player1_score: nextPlayer1Score,
            player2_score: nextPlayer2Score
          });
          await updatePvpMatch(match.id, {
            ...basePatch,
            status: 'finished',
            winner_user_id: fallbackWinner || null,
            ended_reason: fallbackWinner ? null : 'question_pool_exhausted',
            ended_round_no: roundNo,
            ended_at: nowIso()
          });
          return;
        }
        const nowMs = Date.now();
        await updatePvpMatch(match.id, {
          ...basePatch,
          question_set: nextQuestionSet,
          total_rounds: nextQuestionSet.length,
          status: 'round_result',
          result_round_no: roundNo,
          result_round_correct_answer_idx: roundCorrectIndex,
          result_round_winner_user_id: outcome.winner_user_id || null,
          next_round_no: nextRoundNo,
          round_result_until_ms: nowMs + PVP_ROUND_RESULT_DURATION_MS
        });
      }
    } catch (error) {
      console.error('finalize round failed:', error);
    } finally {
      await releaseRoundFinalizeLock(match.id, roundNo, authUser.uid).catch(() => null);
      finalizeRoundBusyRef.current = false;
    }
  }

  // Cada aparelho tenta aplicar o resultado dos bots uma vez por partida (a limpeza
  // automática cobre o caso de quem encerrou ter fechado o app no meio).
  function applyPvpGroupBotRewardsOnce(mode, matchRow) {
    const matchId = String(matchRow?.id || '').trim();
    if (!matchId || String(matchRow?.status || '').trim().toLowerCase() !== 'finished') return;
    const key = `${mode}:${matchId}`;
    if (pvpGroupBotRewardAttemptsRef.current.has(key)) return;
    pvpGroupBotRewardAttemptsRef.current.add(key);
    applyPvpGroupMatchBotRewards(mode, matchRow).catch(() => {
      pvpGroupBotRewardAttemptsRef.current.delete(key);
    });
  }

  async function handlePvpTeamMatchFinished(matchRow) {
    const matchId = String(matchRow?.id || '').trim();
    if (!matchId) return;

    // A partida encerrada pode chegar várias vezes (atualizações posteriores da linha):
    // só a primeira limpa o estado da recompensa.
    if (!handledPvpTeamMatchIdsRef.current.has(matchId)) {
      setPvpTeamResultReward(null);
      setPvpTeamRewardCollecting(false);
    }
    const resultKey = getPvpTeamResultForUser(matchRow, authUser?.uid || '');
    setPvpMode(PVP_MODE_TEAM_BATTLE);
    if (String(matchRow?.room_id || '').trim()) {
      setPvpTeamRoomId(String(matchRow.room_id).trim());
    }
    setPvpTeamMatchId(matchId);
    setPvpTeamMatch(matchRow);
    setPvpTeamResult(resultKey);
    setPvpTeamSubmitted(false);
    setPvpTeamSelectedIndex(null);
    setScreen('pvp-team-result');

    // Qualquer humano que viu o fim aplica o resultado dos bots (uma vez só por bot).
    applyPvpGroupBotRewardsOnce(PVP_GROUP_MODE_TEAM, matchRow);

    if (matchRow.result_void === true) {
      handledPvpTeamMatchIdsRef.current.add(matchId);
      return;
    }
    if (!authUser?.uid) return;
    if (handledPvpTeamMatchIdsRef.current.has(matchId)) return;

    const alreadyProcessed = !!progress?.pvpProcessedMatches?.[matchId];
    if (alreadyProcessed) {
      handledPvpTeamMatchIdsRef.current.add(matchId);
      return;
    }
    handledPvpTeamMatchIdsRef.current.add(matchId);

    // Mesma conta aplicada aos bots (pontos, XP e moedas por resultado e dificuldade).
    const outcome = getPvpGroupMatchOutcomeForUser(matchRow, PVP_GROUP_MODE_TEAM, authUser.uid, {
      battleCountBefore: Math.max(0, Number(progress.pvpBattles || 0))
    });
    const pvpPointsGain = outcome.points;
    const rewards = { xp: outcome.xp, coins: outcome.coins };

    const postBattleProgress = normalizeProgress({
      ...progress,
      level: Math.max(1, Number(progress.level || 1)),
      xp: Math.max(0, Number(progress.xp || 0)) + Math.max(0, Number(rewards.xp || 0)),
      coins: Math.max(0, Number(progress.coins || 0) + Math.max(0, Number(rewards.coins || 0))),
      pvpBattles: Math.max(0, Number(progress.pvpBattles || 0) + 1),
      pvpWins: Math.max(0, Number(progress.pvpWins || 0) + (resultKey === 'win' ? 1 : 0)),
      pvpPoints: Math.max(0, Number(progress.pvpPoints || 0) + pvpPointsGain),
      pvpProcessedMatches: {
        ...(progress.pvpProcessedMatches || {}),
        [matchId]: true
      },
      updatedAt: Date.now()
    });
    const passResult = applyEvolutionPassRewards(postBattleProgress, []);
    const nextProgress = passResult.progress;
    const totalRewardXp = Math.max(0, Number(rewards.xp || 0));
    const totalRewardCoins = Math.max(0, Number(rewards.coins || 0));

    setProgress(nextProgress);

    try {
      await upsertStatsFromProgress(authUser.uid, nextProgress);
    } catch {
      // ignore sync errors for now
    }

    setPvpTeamResultReward({
      matchId,
      points: pvpPointsGain,
      xp: totalRewardXp,
      coins: totalRewardCoins
    });

  }

  async function handlePvpEliminationMatchFinished(matchRow, options = {}) {
    const safeOptions = options && typeof options === 'object' ? options : {};
    const allowEarly = safeOptions.allowEarly === true;
    const matchId = String(matchRow?.id || '').trim();
    const status = String(matchRow?.status || '').trim().toLowerCase();
    if (!matchId) return;
    if (!allowEarly && status !== 'finished') return;

    if (!handledPvpEliminationMatchIdsRef.current.has(matchId)) {
      setPvpEliminationResultReward(null);
      setPvpEliminationRewardCollecting(false);
    }
    setPvpMode(PVP_MODE_ELIMINATION);
    if (String(matchRow?.room_id || '').trim()) {
      setPvpEliminationRoomId(String(matchRow.room_id).trim());
    }
    setPvpEliminationMatchId(matchId);
    setPvpEliminationMatch(matchRow);
    setPvpEliminationSubmitted(false);
    setPvpEliminationSelectedIndex(null);
    setPvpEliminationExitPrompt(null);
    setScreen('pvp-elimination-result');

    if (status === 'finished') {
      // Resultado dos bots (pontos/XP/moedas pela colocação) e liberação para outras partidas.
      applyPvpGroupBotRewardsOnce(PVP_GROUP_MODE_ELIMINATION, matchRow);
    }

    const myUserId = String(authUser?.uid || '').trim();
    if (!myUserId) return;

    const forcedPlacement = Math.max(0, Number(safeOptions.forcePlacement || 0));
    const placement = forcedPlacement || getPvpEliminationPlacementForUser(matchRow, myUserId);
    if (!placement) return;
    const resultKey = getPvpEliminationResultKeyByPlacement(placement);

    if (handledPvpEliminationMatchIdsRef.current.has(matchId)) return;
    const alreadyProcessed = !!progress?.pvpProcessedMatches?.[matchId];
    if (alreadyProcessed) {
      handledPvpEliminationMatchIdsRef.current.add(matchId);
      return;
    }
    handledPvpEliminationMatchIdsRef.current.add(matchId);

    // Mesma conta aplicada aos bots: pontos pela colocação e recompensa proporcional.
    const outcome = getPvpGroupMatchOutcomeForUser(matchRow, PVP_GROUP_MODE_ELIMINATION, myUserId, {
      forcePlacement: placement,
      battleCountBefore: Math.max(0, Number(progress.pvpBattles || 0))
    });
    const pvpPointsGain = outcome.points;
    const scaledRewards = { xp: outcome.xp, coins: outcome.coins };

    const postBattleProgress = normalizeProgress({
      ...progress,
      level: Math.max(1, Number(progress.level || 1)),
      xp: Math.max(0, Number(progress.xp || 0)) + Math.max(0, Number(scaledRewards.xp || 0)),
      coins: Math.max(0, Number(progress.coins || 0) + Math.max(0, Number(scaledRewards.coins || 0))),
      pvpBattles: Math.max(0, Number(progress.pvpBattles || 0) + 1),
      pvpWins: Math.max(0, Number(progress.pvpWins || 0) + (placement === 1 ? 1 : 0)),
      pvpPoints: Math.max(0, Number(progress.pvpPoints || 0) + pvpPointsGain),
      pvpProcessedMatches: {
        ...(progress.pvpProcessedMatches || {}),
        [matchId]: true
      },
      updatedAt: Date.now()
    });
    const passResult = applyEvolutionPassRewards(postBattleProgress, []);
    const nextProgress = passResult.progress;
    const totalRewardXp = Math.max(0, Number(scaledRewards.xp || 0));
    const totalRewardCoins = Math.max(0, Number(scaledRewards.coins || 0));
    const placementLabel = getPvpEliminationPlacementLabel(placement);

    setProgress(nextProgress);

    try {
      await upsertStatsFromProgress(myUserId, nextProgress);
    } catch {
      // ignore sync errors for now
    }

    setPvpEliminationResultReward({
      matchId,
      points: pvpPointsGain,
      xp: totalRewardXp,
      coins: totalRewardCoins,
      placement,
      placementLabel
    });

  }

  async function handlePvpMatchFinished(matchRow) {
    const matchId = String(matchRow?.id || '');
    if (!matchId) return;
    setPvpResultReward(null);

    setPvpState((prev) => ({
      ...prev,
      status: 'finished',
      match: matchRow,
      result: getPvpResultForUser(matchRow, authUser?.uid || '')
    }));

    if (!authUser?.uid) return;
    if (handledMatchIdsRef.current.has(matchId)) return;

    const alreadyProcessed = !!progress?.pvpProcessedMatches?.[matchId];
    if (alreadyProcessed) {
      handledMatchIdsRef.current.add(matchId);
      const botUserId = getMatchBotUserId(matchRow);
      if (botUserId) {
        clearBotBusy(botUserId, matchId).catch(() => null);
      }
      return;
    }

    const endedReason = String(matchRow?.ended_reason || '').trim().toLowerCase();
    const botUserId = getMatchBotUserId(matchRow);
    const botQueueAlreadyRotated = String(matchRow?.bot_user_queue_rotated || '').trim().toLowerCase() === 'true';
    const invalidMatchReason = getInvalidFinishedMatchReason(matchRow);
    if (invalidMatchReason) {
      setPvpResultTransitionMode('');
      handledMatchIdsRef.current.add(matchId);
      setPvpCompensation(null);
      if (botUserId) {
        clearBotBusy(botUserId, matchId).catch(() => null);
        setQueueBotExclusion(botUserId, 45000);
        if (!botQueueAlreadyRotated) {
          await rotateUserBotQueue(botUserId, 'handle_finished_invalid').catch(() => null);
        }
        updatePvpMatch(matchId, {
          bot_user_queue_rotated: true,
          bot_user_stats_applied: true,
          bot_user_stats_applied_at: nowIso()
        }).catch(() => null);
      }
      cleanupZeroScoreFinishedMatches(60).catch(() => null);
      const shouldResumeInvalidRefusal = endedReason === 'match_refused' || endedReason === 'accept_timeout';
      if (shouldResumeInvalidRefusal) {
        await syncQueueStateAfterMatchRefusal(matchRow, endedReason).catch(() => null);
      }
      if (shouldResumeInvalidRefusal && shouldResumeQueueAfterMatchRefused(matchRow, authUser.uid)) {
        const resumed = await resumeQueueAfterMatchRefused(endedReason, matchRow);
        if (!resumed) {
          const fallbackText = getMatchRefusalQueueStatusText(matchRow, authUser.uid, { resumed: false });
          showToast(fallbackText);
          playSfx('notify');
        }
      }
      return;
    }
    const skipBattleRewards = endedReason === 'match_refused' || endedReason === 'accept_timeout';
    if (skipBattleRewards) {
      setPvpResultTransitionMode('');
      handledMatchIdsRef.current.add(matchId);
      setPvpCompensation(null);
      if (botUserId) {
        clearBotBusy(botUserId, matchId).catch(() => null);
        setQueueBotExclusion(botUserId, 45000);
        if (!botQueueAlreadyRotated) {
          await rotateUserBotQueue(botUserId, 'handle_finished_refused').catch(() => null);
        }
        updatePvpMatch(matchId, {
          bot_user_queue_rotated: true,
          bot_user_stats_applied: true,
          bot_user_stats_applied_at: nowIso()
        }).catch(() => null);
      }

      const shouldRequeue = shouldResumeQueueAfterMatchRefused(matchRow, authUser.uid);
      await syncQueueStateAfterMatchRefusal(matchRow, endedReason).catch(() => null);
      if (shouldRequeue) {
        const resumed = await resumeQueueAfterMatchRefused(endedReason, matchRow);
        if (!resumed) {
          const fallbackText = getMatchRefusalQueueStatusText(matchRow, authUser.uid, { resumed: false });
          showToast(fallbackText);
          playSfx('notify');
        }
      } else {
        const timeoutText = getMatchRefusalQueueStatusText(matchRow, authUser.uid, { resumed: false });
        showToast(timeoutText);
        playSfx('notify');
      }
      return;
    }

    clearPvpQueueResumeSnapshot();
    handledMatchIdsRef.current.add(matchId);

    const endedBy = String(matchRow?.ended_by_user_id || matchRow?.forfeit_by_user_id || '');
    const isOwnForfeit = endedReason === 'forfeit' && endedBy === authUser.uid;
    const isOpponentForfeit = endedReason === 'forfeit' && endedBy && endedBy !== authUser.uid;
    const resultRaw = getPvpResultForUser(matchRow, authUser.uid);
    const result = isOpponentForfeit ? 'win' : resultRaw;
    const decisiveRoundNo = Math.max(
      1,
      Number(matchRow?.ended_round_no || matchRow?.round_no || PVP_ROUNDS_PER_MATCH)
    );
    const nextBattleNo = Math.max(1, Number(progress.pvpBattles || 0) + 1);
    const pvpPointsGain = getPvpPointsDeltaAdvanced(result, {
      battleNo: nextBattleNo,
      roundNo: decisiveRoundNo,
      matchRow,
      userId: authUser.uid
    });
    const rewards = getPvpRewardsByDifficulty(matchRow?.difficulty || pvpConfig?.difficulty || 'easy', result);

    const postBattleProgress = normalizeProgress({
      ...progress,
      level: Math.max(1, Number(progress.level || 1)),
      xp: Math.max(0, Number(progress.xp || 0)) + rewards.xp,
      coins: Math.max(0, Number(progress.coins || 0) + rewards.coins),
      pvpBattles: Math.max(0, Number(progress.pvpBattles || 0) + 1),
      pvpWins: Math.max(0, Number(progress.pvpWins || 0) + (result === 'win' ? 1 : 0)),
      pvpPoints: Math.max(0, Number(progress.pvpPoints || 0) + pvpPointsGain),
      pvpProcessedMatches: {
        ...(progress.pvpProcessedMatches || {}),
        [matchId]: true
      },
      updatedAt: Date.now()
    });
    const passResult = applyEvolutionPassRewards(postBattleProgress, []);
    const nextProgress = passResult.progress;
    const totalRewardXp = Math.max(0, Number(rewards.xp || 0));
    const totalRewardCoins = Math.max(0, Number(rewards.coins || 0));

    setProgress(nextProgress);

    try {
      await upsertStatsFromProgress(authUser.uid, nextProgress);
    } catch {
      // ignore sync errors for now
    }

    if (botUserId) {
      const player1Id = String(matchRow?.player1_user_id || '').trim();
      const botResult = getPvpResultForUser(matchRow, botUserId);
      const botBattleNo = player1Id === botUserId
        ? Math.max(1, Number(matchRow?.player1_pvp_battles || 0) + 1)
        : Math.max(1, Number(matchRow?.player2_pvp_battles || 0) + 1);
      const botPointsDelta = getPvpPointsDeltaAdvanced(botResult, {
        battleNo: botBattleNo,
        roundNo: decisiveRoundNo,
        matchRow,
        userId: botUserId
      });
      const botRewards = getPvpRewardsByDifficulty(
        matchRow?.difficulty || pvpConfig?.difficulty || 'easy',
        botResult
      );
      await applyPvpOutcomeToUserStats(botUserId, {
        result: botResult,
        pointsDelta: botPointsDelta,
        xp: botRewards.xp,
        battlesDelta: 1
      }).catch(() => null);
      clearBotBusy(botUserId, matchId).catch(() => null);
      if (!botQueueAlreadyRotated) {
        await rotateUserBotQueue(botUserId, 'handle_finished_rewards_applied').catch(() => null);
      }
      updatePvpMatch(matchId, {
        bot_user_queue_rotated: true,
        bot_user_stats_applied: true,
        bot_user_stats_applied_at: nowIso()
      }).catch(() => null);
    }

    if (isOwnForfeit) {
      setPvpResultTransitionMode('');
      setPvpCompensation(null);
      showToast(`Você saiu da partida: ${formatSignedPoints(pvpPointsGain)} PvP · +${totalRewardXp} XP · +${totalRewardCoins} moedas`);
      return;
    }

    if (isOpponentForfeit) {
      setPvpResultTransitionMode('');
      setPvpResultReward(null);
      setPvpCompensation({
        matchId,
        title: 'Oponente saiu da partida',
        subtitle: 'Você recebeu compensação por abandono do adversário. Toque em coletar para sair da partida.',
        points: pvpPointsGain,
        xp: totalRewardXp,
        coins: totalRewardCoins
      });
      return;
    }

    setPvpResultTransitionMode('');
    setPvpCompensation(null);
    setPvpResultReward({
      matchId,
      points: pvpPointsGain,
      xp: totalRewardXp,
      coins: totalRewardCoins
    });

  }

  // Abandono no meio de uma partida em grupo: -2 PvP (W.O.), sem XP/moedas, uma vez só.
  function applyPvpGroupForfeitPenalty(matchId = '') {
    const safeMatchId = String(matchId || '').trim();
    const userId = String(authUser?.uid || '').trim();
    if (!safeMatchId || !userId) return null;
    if (progress?.pvpProcessedMatches?.[safeMatchId]) return null;
    const outcome = getPvpGroupForfeitOutcome();
    const penalizedProgress = normalizeProgress({
      ...progress,
      pvpBattles: Math.max(0, Number(progress.pvpBattles || 0) + 1),
      pvpPoints: Math.max(0, Number(progress.pvpPoints || 0) + outcome.points),
      pvpProcessedMatches: {
        ...(progress.pvpProcessedMatches || {}),
        [safeMatchId]: true
      },
      updatedAt: Date.now()
    });
    const nextProgress = applyEvolutionPassRewards(penalizedProgress, []).progress;
    setProgress(nextProgress);
    upsertStatsFromProgress(userId, nextProgress).catch(() => null);
    return outcome;
  }

  function leavePvpTeamFlow() {
    const activeMatch = pvpTeamMatch && typeof pvpTeamMatch === 'object' ? pvpTeamMatch : null;
    const activeRoom = pvpTeamRoom && typeof pvpTeamRoom === 'object' ? pvpTeamRoom : null;
    const myUserId = String(authUser?.uid || '').trim();
    const activeMatchId = String(activeMatch?.id || pvpTeamMatchId || '').trim();
    const activeMatchStatus = String(activeMatch?.status || '').trim().toLowerCase();
    const roomId = String(activeRoom?.id || activeMatch?.room_id || pvpTeamRoomId || '').trim();
    const leavingLiveMatch = Boolean(
      myUserId
      && activeMatchId
      && (activeMatchStatus === 'active' || activeMatchStatus === 'round_result')
      && !getPvpGroupMatchGoneIds(activeMatch, PVP_GROUP_MODE_TEAM).includes(myUserId)
    );

    if (leavingLiveMatch) {
      const outcome = applyPvpGroupForfeitPenalty(activeMatchId);
      if (outcome) showToast(`Você abandonou a batalha. ${formatSignedPoints(outcome.points)} PvP`);
    }
    pvpTeamAutoStartRoomIdRef.current = '';
    setPvpTeamAutoStartPending(false);
    resetPvpTeamState();
    setPvpMode('');
    setScreen('play-mode');

    (async () => {
      try {
        if (leavingLiveMatch) {
          // A partida continua para quem ficou: meus confrontos passam a valer como sem
          // resposta. Se eu era o último humano, ela termina como W.O. do meu time.
          const result = await leavePvpGroupMatch(PVP_GROUP_MODE_TEAM, activeMatchId, myUserId).catch(() => null);
          if (String(result?.row?.status || '').trim().toLowerCase() === 'finished') {
            await applyPvpGroupMatchBotRewards(PVP_GROUP_MODE_TEAM, result.row).catch(() => null);
          }
        }
        if (roomId && myUserId) {
          await removePvpGroupRoomMembers(PVP_GROUP_MODE_TEAM, roomId, [myUserId], {
            reason: 'left_room',
            releaseBots: !activeMatchId
          }).catch(() => null);
        }
      } catch (error) {
        console.error('leave team flow cleanup failed:', error);
      }
    })();
  }

  function leavePvpEliminationFlow() {
    const activeMatch = pvpEliminationMatchRef.current || pvpEliminationMatch || null;
    const activeRoom = pvpEliminationRoom && typeof pvpEliminationRoom === 'object' ? pvpEliminationRoom : null;
    const roomId = String(activeRoom?.id || activeMatch?.room_id || pvpEliminationRoomId || '').trim();
    const matchId = String(activeMatch?.id || pvpEliminationMatchId || '').trim();
    const matchStatus = String(activeMatch?.status || '').trim().toLowerCase();
    const myUserId = String(authUser?.uid || '').trim();
    const hasLiveMatch = !!matchId && (
      matchStatus === 'active'
      || matchStatus === 'round_result'
      || matchStatus === 'elimination_result'
    );
    const alreadyLeft = !!myUserId && getPvpGroupMatchGoneIds(activeMatch, PVP_GROUP_MODE_ELIMINATION).includes(myUserId);
    const stillAlive = !!myUserId && getPvpEliminationActiveMemberIds(activeMatch).includes(myUserId);
    const placementDecided = !!String(activeMatch?.winner_user_id || '').trim()
      || String(activeMatch?.next_status || '').trim().toLowerCase() === 'finished'
      || matchStatus === 'finished';

    // Já eliminado (assistindo) ou com a colocação decidida: sai recebendo a colocação.
    if (hasLiveMatch && !alreadyLeft && (!stillAlive || placementDecided) && getPvpEliminationMemberById(activeMatch, myUserId)) {
      exitPvpEliminationWithPlacement().catch(() => null);
      return;
    }

    const leavingAlive = hasLiveMatch && !alreadyLeft && stillAlive && !placementDecided;
    if (leavingAlive) {
      const outcome = applyPvpGroupForfeitPenalty(matchId);
      if (outcome) showToast(`Você abandonou a eliminatória. ${formatSignedPoints(outcome.points)} PvP`);
    }
    if (matchId) {
      rememberIgnoredPvpEliminationMatch(matchId);
    }

    resetPvpEliminationState();
    setPvpMode('');
    setScreen('play-mode');

    (async () => {
      try {
        if (leavingAlive) {
          // Saio como eliminado na hora; quem ficou começa um novo ciclo. Sem humano
          // acompanhando, a partida termina pela classificação atual.
          const result = await leavePvpGroupMatch(PVP_GROUP_MODE_ELIMINATION, matchId, myUserId).catch(() => null);
          if (String(result?.row?.status || '').trim().toLowerCase() === 'finished') {
            await applyPvpGroupMatchBotRewards(PVP_GROUP_MODE_ELIMINATION, result.row).catch(() => null);
          }
        }
        if (roomId && myUserId) {
          await removePvpGroupRoomMembers(PVP_GROUP_MODE_ELIMINATION, roomId, [myUserId], {
            reason: 'left_room',
            releaseBots: !matchId
          }).catch(() => null);
        }
      } catch (error) {
        console.error('leave elimination flow cleanup failed:', error);
      }
    })();
  }

  function leavePvpFlow() {
    if (leavePvpFlowBusyRef.current) {
      resetPvpState();
      setScreen('play-mode');
      return;
    }

    leavePvpFlowBusyRef.current = true;
    const current = pvpStateRef.current;
    const activeMatch = current?.match;
    const myUserId = String(authUser?.uid || '').trim();
    const activeMatchId = String(activeMatch?.id || '').trim();
    const activeMatchStatus = String(activeMatch?.status || '').trim().toLowerCase();
    const player1Id = String(activeMatch?.player1_user_id || '').trim();
    const player2Id = String(activeMatch?.player2_user_id || '').trim();
    const opponentId = player1Id === myUserId ? player2Id : player1Id;

    queueFlowLog('leave_pvp_flow:start', {
      userId: myUserId,
      matchId: activeMatchId,
      status: activeMatchStatus
    });

    // Always unblock the UI first; remote cleanup is best-effort in background.
    resetPvpState();
    setQueueActionBusy(false);
    setQueueActionPhase('');
    setQueueActionHint('');
    setMatchAcceptBusy(false);
    setScreen('play-mode');

    const releaseBusy = () => {
      leavePvpFlowBusyRef.current = false;
    };
    const watchdog = typeof window !== 'undefined'
      ? window.setTimeout(releaseBusy, UI_ACTION_WATCHDOG_MS + 1200)
      : null;

    (async () => {
      try {
        const canFinalizeMatch = Boolean(
          myUserId
          && activeMatchId
          && (activeMatchStatus === 'active' || activeMatchStatus === 'pending_accept' || activeMatchStatus === 'round_result')
        );

        if (canFinalizeMatch) {
          const latest = await withTimeout(
            getPvpMatch(activeMatchId).catch(() => null),
            2400,
            'leave_flow_get_match'
          ).catch(() => null);
          const latestStatus = String(latest?.status || '').trim().toLowerCase();

          if (latest) {
            const pendingAcceptState = latestStatus === 'pending_accept';
            const activeLikeState = latestStatus === 'active' || latestStatus === 'round_result';
            if (pendingAcceptState) {
              await withTimeout(
                updatePvpMatch(activeMatchId, {
                  status: 'finished',
                  ended_reason: 'match_refused',
                  ended_by_user_id: myUserId,
                  ended_at: nowIso(),
                  winner_user_id: null
                }).catch(() => null),
                2600,
                'leave_flow_finish_pending_accept'
              ).catch(() => null);
            } else if (activeLikeState) {
              const latestPlayer1Id = String(latest?.player1_user_id || activeMatch?.player1_user_id || '').trim();
              const latestPlayer2Id = String(latest?.player2_user_id || activeMatch?.player2_user_id || '').trim();
              const latestOpponentId = latestPlayer1Id === myUserId ? latestPlayer2Id : latestPlayer1Id;
              await withTimeout(
                updatePvpMatch(activeMatchId, {
                  status: 'finished',
                  winner_user_id: latestOpponentId || opponentId || null,
                  ended_reason: 'forfeit',
                  ended_by_user_id: myUserId,
                  forfeit_by_user_id: myUserId,
                  ended_round_no: Math.max(1, Number(latest?.round_no || activeMatch?.round_no || 1)),
                  ended_at: nowIso()
                }).catch(() => null),
                2600,
                'leave_flow_finish_active'
              ).catch(() => null);
            }
          }
        }

        if (myUserId) {
          await withTimeout(
            leaveQueue(myUserId).catch(() => null),
            2600,
            'leave_flow_leave_queue'
          ).catch(() => null);
        }

        queueFlowLog('leave_pvp_flow:cleanup_done', {
          userId: myUserId,
          matchId: activeMatchId
        });
      } catch (error) {
        queueFlowLog('leave_pvp_flow:cleanup_error', {
          userId: myUserId,
          matchId: activeMatchId,
          message: String(error?.message || error || 'unknown_error')
        });
      } finally {
        if (watchdog && typeof window !== 'undefined') {
          window.clearTimeout(watchdog);
        }
        releaseBusy();
      }
    })();
  }

  useEffect(() => {
    if (pvpState.status !== 'queueing') return;
    if (!authUser?.uid) return;
    let cancelled = false;

    const unsubscribe = subscribeQueueEntry(
      authUser.uid,
      (queueEntry) => {
        if (cancelled || !queueEntry) return;
        const status = String(queueEntry.status || '').trim().toLowerCase();
        if (status === 'waiting') {
          const queueStatus = String(pvpStateRef.current?.status || '').trim().toLowerCase();
          if (queueStatus === 'queueing') {
            applyBackendQueueJoinConfirmation(
              queueEntry,
              {
                force: false,
                reason: 'queue_subscribe:backend_confirmed'
              }
            );
          }
          return;
        }
        const matchId = String(queueEntry.match_id || '').trim();
        if (status !== 'matched' || !matchId) return;

        const queueJoinedAtMs = getQueueSessionStartMs();
        const queueSessionId = String(queueSessionIdRef.current || '').trim();
        const eventAtMs = Date.now();

        (async () => {
          const latest = await getPvpMatch(matchId).catch(() => null);
          if (cancelled) return;
          if (!latest || typeof latest !== 'object') {
            queueFlowLog('queue_subscribe:matched_but_missing_match', {
              userId: authUser?.uid || '',
              matchId
            });
            await clearQueueMatch(authUser.uid).catch(() => null);
            return;
          }

          const latestStatus = String(latest.status || '').trim().toLowerCase();
          if (latestStatus === 'finished') {
            queueFlowLog('queue_subscribe:matched_but_finished', {
              userId: authUser?.uid || '',
              matchId
            });
            await clearQueueMatch(authUser.uid).catch(() => null);
            return;
          }

          const isBotMatch = latest.is_bot_match === true && latest.is_bot_duel !== true;
          const matchQueueSessionId = String(latest.queue_session_id || '').trim();
          const matchQueueJoinedAtMs = Math.max(
            0,
            Number(
              latest.queue_joined_at_ms
              || latest.queue_started_at_ms
              || latest.queue_joined_ms
              || 0
            )
          );
          const matchCreatedAtMs = Math.max(
            0,
            toMillis(latest.created_at || latest.updated_at)
          );
          const queueElapsedMs = queueJoinedAtMs > 0
            ? Math.max(0, eventAtMs - queueJoinedAtMs)
            : 0;
          const queueSessionMismatch = isBotMatch
            && queueSessionId
            && matchQueueSessionId
            && queueSessionId !== matchQueueSessionId;
          const olderQueueMatch = isBotMatch
            && queueJoinedAtMs > 0
            && (
              (matchQueueJoinedAtMs > 0 && matchQueueJoinedAtMs < (queueJoinedAtMs - 1200))
              || (matchCreatedAtMs > 0 && matchCreatedAtMs < (queueJoinedAtMs - 1200))
            );
          const beforeMinWindow = isBotMatch
            && queueElapsedMs > 0
            && queueElapsedMs < PVP_QUEUE_BOT_FIRST_THRESHOLD_MS;

          if (queueSessionMismatch || olderQueueMatch || beforeMinWindow) {
            const reason = queueSessionMismatch
              ? 'session_mismatch'
              : (olderQueueMatch ? 'older_queue' : 'before_min_window');
            queueFlowLog('queue_subscribe:matched_ignored', {
              userId: authUser?.uid || '',
              matchId,
              reason,
              queueElapsedMs
            });
            await clearQueueMatch(authUser.uid).catch(() => null);
            return;
          }

          await attachToMatch(matchId).catch(() => null);
        })().catch(() => null);
      },
      (error) => {
        if (!cancelled) {
          console.error('queue subscription error:', error);
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [pvpState.status, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'queueing') return;
    if (!authUser?.uid) return;

    let cancelled = false;
    let busy = false;

    const tryAttachOpenMatch = async (reason = 'interval') => {
      if (cancelled || busy) return;
      busy = true;
      try {
        const openMatch = await withTimeout(
          findOpenMatchForUser(authUser.uid).catch(() => null),
          1800,
          'queue_watchdog_open_match'
        ).catch(() => null);
        if (cancelled || !openMatch?.id) return;
        const safeStatus = String(openMatch.status || '').trim().toLowerCase();
        if (safeStatus !== 'pending_accept' && safeStatus !== 'active' && safeStatus !== 'round_result') return;
        queueFlowLogThrottled(
          `queue_watchdog_open_${safeStatus}`,
          1200,
          'queue_watchdog:open_match_found',
          {
            userId: authUser.uid,
            matchId: openMatch.id,
            status: safeStatus,
            reason
          }
        );
        await attachToMatch(openMatch.id);
      } finally {
        busy = false;
      }
    };

    tryAttachOpenMatch('boot').catch(() => null);
    const timer = setInterval(() => {
      tryAttachOpenMatch('poll').catch(() => null);
    }, 1600);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pvpState.status, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'queueing') return;
    if (!authUser?.uid) return;

    let cancelled = false;
    let tickRunning = false;
    let tickStartedAtMs = 0;
    const effectQueueSessionId = String(queueSessionIdRef.current || '').trim()
      || buildQueueSessionId(authUser.uid, Date.now());
    if (!String(queueSessionIdRef.current || '').trim()) {
      queueSessionIdRef.current = effectQueueSessionId;
    }
    const isQueueTickStale = () => {
      if (cancelled) return true;
      if (queueCancelRequestedRef.current) return true;
      if (String(pvpStateRef.current?.status || '').trim().toLowerCase() !== 'queueing') return true;
      return String(queueSessionIdRef.current || '').trim() !== effectQueueSessionId;
    };
    const scheduleNextBotAttempt = (minSeconds = 1, maxSeconds = 12) => {
      if (isQueueTickStale()) return;
      const nowMs = Date.now();
      const queueJoinedAtMs = getQueueSessionStartMs();
      const queueResumeMode = String(pvpStateRef.current?.queueResumeMode || '').trim().toLowerCase();
      const currentBotMatchAtMs = Math.max(0, Number(pvpStateRef.current?.queueBotMatchAtMs || 0));
      const nextAt = computeQueueBotMatchAtMs({
        nowMs,
        queueJoinedAtMs,
        queueResumeMode,
        currentBotMatchAtMs,
        minSeconds,
        maxSeconds
      });
      setPvpState((prev) => {
        if (prev.status !== 'queueing') return prev;
        return {
          ...prev,
          queueBotMatchAtMs: nextAt
        };
      });
    };
    const pickFallbackBotId = async (targetDifficulty, _preferredId = '', excludedIds = []) => {
      void _preferredId;
      const safeDifficulty = normalizeDifficulty(targetDifficulty || 'easy');
      const excludedSet = new Set(
        (Array.isArray(excludedIds) ? excludedIds : [])
          .map((id) => String(id || '').trim())
          .filter((id) => !!id)
      );
      const repoPickModes = [true, false];
      for (const preferLocal of repoPickModes) {
        const repoPickedBot = await withTimeout(
          getNextBotForUserMatch(safeDifficulty, {
            excludeBotIds: Array.from(excludedSet),
            waitForEnsure: false,
            preferLocal
          }).catch(() => null),
          2200,
          preferLocal ? 'fallback_repo_pick_local' : 'fallback_repo_pick_remote'
        ).catch(() => null);
        const repoPickedBotId = String(
          repoPickedBot?.bot_id
          || repoPickedBot?.profile?.id
          || ''
        ).trim();
        if (
          isSystemBotUserId(repoPickedBotId)
          && !excludedSet.has(repoPickedBotId)
        ) {
          return repoPickedBotId;
        }
      }
      return '';
    };

    async function tickMatchmaking() {
      if (isQueueTickStale()) return;
      const nowMs = Date.now();
      const maxTickRunMs = isLikelyMobileWeb() ? 22000 : 14000;
      if (tickRunning) {
        if (tickStartedAtMs > 0 && (nowMs - tickStartedAtMs) >= maxTickRunMs) {
          queueFlowLog('matchmaking_tick:watchdog_unlock', {
            userId: authUser?.uid || '',
            stuckMs: Math.max(0, nowMs - tickStartedAtMs)
          });
          tickRunning = false;
          tickStartedAtMs = 0;
        } else {
          return;
        }
      }
      tickRunning = true;
      tickStartedAtMs = nowMs;
      try {
        queueFlowLogThrottled(
          'mm_tick',
          4000,
          'matchmaking_tick:start',
          {
            userId: authUser?.uid || '',
            status: pvpStateRef.current?.status || '',
            matchId: pvpStateRef.current?.matchId || ''
          }
        );
        await withTimeout(
          ensureQueueHeartbeat(authUser.uid).catch(() => null),
          1000,
          'queue_heartbeat'
        ).catch(() => null);
        if (isQueueTickStale()) return;
        let queueJoinedAtMs = getQueueSessionStartMs();
        if (queueJoinedAtMs <= 0) {
          const backendQueueEntry = await withTimeout(
            getQueueEntryByUser(authUser.uid).catch(() => null),
            1200,
            'matchmaking_wait_backend_queue_confirm'
          ).catch(() => null);
          if (isQueueTickStale()) return;
          if (backendQueueEntry && String(backendQueueEntry.status || '').trim().toLowerCase() === 'waiting') {
            const confirmResult = applyBackendQueueJoinConfirmation(
              backendQueueEntry,
              {
                force: false,
                reason: 'matchmaking_tick:backend_confirmed'
              }
            );
            queueJoinedAtMs = Math.max(0, Number(confirmResult?.joinedAtMs || 0));
          } else {
            queueFlowLogThrottled(
              'mm_wait_backend_queue_confirm',
              3000,
              'matchmaking_tick:awaiting_backend_queue_confirm',
              {
                userId: authUser?.uid || '',
                queueStatus: backendQueueEntry?.status || ''
              }
            );
            return;
          }
          if (queueJoinedAtMs <= 0) return;
        }
        // Run cleanup in background — don't block human matching
        cleanupStalePairLocks(25, 40).catch(() => null);
        cleanupStalePendingBotUserMatches({
          maxBatch: 8,
          staleMs: 14000,
          actorUserId: authUser.uid
        }).catch(() => null);

        const openMatch = await withTimeout(
          findOpenMatchForUser(authUser.uid).catch(() => null),
          1400,
          'find_open_match_self'
        ).catch(() => null);
        if (isQueueTickStale()) return;
        if (openMatch?.id) {
          queueFlowLog('matchmaking_tick:open_match_found', {
            userId: authUser?.uid || '',
            matchId: openMatch.id,
            status: openMatch.status || ''
          });
          const safeStatus = String(openMatch.status || '').trim().toLowerCase();
          const currentQueueStartMs = getQueueSessionStartMs();
          const openMatchQueueStartMs = Math.max(
            0,
            Number(
              openMatch.queue_joined_at_ms
              || openMatch.queue_started_at_ms
              || openMatch.queue_joined_ms
              || 0
            )
          );
          const openMatchCreatedAtMs = Math.max(
            0,
            toMillis(openMatch.created_at || openMatch.updated_at)
          );
          const openMatchIsBot = openMatch.is_bot_match === true && openMatch.is_bot_duel !== true;
          const openMatchQueueSessionId = String(openMatch.queue_session_id || '').trim();
          const queueSessionMismatch = openMatchQueueSessionId
            && effectQueueSessionId
            && openMatchQueueSessionId !== effectQueueSessionId;
          const isOlderQueueMatch = currentQueueStartMs > 0
            && (
              (openMatchQueueStartMs > 0 && openMatchQueueStartMs < (currentQueueStartMs - 1200))
              || (openMatchCreatedAtMs > 0 && openMatchCreatedAtMs < (currentQueueStartMs - 1200))
            );
          if (openMatchIsBot && (queueSessionMismatch || isOlderQueueMatch)) {
            queueFlowLog('matchmaking_tick:open_match_ignored_old_session', {
              userId: authUser?.uid || '',
              matchId: openMatch.id,
              message: queueSessionMismatch ? 'session_mismatch' : 'older_queue'
            });
            if (safeStatus === 'pending_accept') {
              await updatePvpMatch(openMatch.id, {
                status: 'finished',
                ended_reason: 'stale_queue_session',
                ended_by_user_id: null,
                ended_at: nowIso(),
                winner_user_id: null,
                result_void: true,
                result_void_reason: 'stale_queue_session',
                history_hidden: true,
                history_hidden_reason: 'stale_queue_session'
              }).catch(() => null);
            }
            return;
          }
          const queueElapsedMs = currentQueueStartMs > 0
            ? Math.max(0, Date.now() - currentQueueStartMs)
            : 0;
          if (openMatchIsBot && queueElapsedMs > 0 && queueElapsedMs < PVP_QUEUE_BOT_FIRST_THRESHOLD_MS) {
            queueFlowLog('matchmaking_tick:open_match_before_min_window', {
              userId: authUser?.uid || '',
              matchId: openMatch.id,
              elapsedMs: queueElapsedMs
            });
            return;
          }
          if (safeStatus === 'pending_accept') {
            const closeReason = getPendingAcceptAutoCloseReason(openMatch, Date.now());
            if (closeReason) {
              await updatePvpMatch(openMatch.id, {
                status: 'finished',
                ended_reason: closeReason,
                ended_by_user_id: null,
                ended_at: nowIso(),
                winner_user_id: null,
                result_void: true,
                result_void_reason: closeReason,
                history_hidden: true,
                history_hidden_reason: closeReason
              }).catch(() => null);
              queueFlowLog('matchmaking_tick:closed_stale_pending_accept', {
                userId: authUser?.uid || '',
                matchId: openMatch.id,
                reason: closeReason
              });
            } else {
              await attachToMatch(openMatch.id);
              return;
            }
          } else {
            await attachToMatch(openMatch.id);
            return;
          }
        }

        const queueCategory = getPvpQueueDifficultyFromConfig(pvpConfig, progress);
        const queueArea = String(
          pvpKnowledgeArea
          || resolveKnowledgeAreaByLanguageId(pvpConfig?.language || '')
          || ''
        ).trim();
        let selfQueue = await withTimeout(
          getQueueEntryByUser(authUser.uid).catch(() => null),
          1400,
          'get_self_queue'
        ).catch(() => null);
        if (isQueueTickStale()) return;
        if (!selfQueue || String(selfQueue.status || '').trim().toLowerCase() !== 'waiting') {
          queueFlowLog('matchmaking_tick:queue_missing_or_not_waiting', {
            userId: authUser?.uid || '',
            currentStatus: selfQueue?.status || ''
          });
          selfQueue = await withTimeout(upsertQueueEntry({
            user_id: authUser.uid,
            nickname: profile?.nickname || 'Jogador',
            avatar: profile?.avatar || '🤓',
            level: Math.max(1, Number(progress.level || 1)),
            pvp_points: Math.max(0, Number(progress.pvpPoints || 0)),
            equipped_frame: shopData?.equipped?.frame || 'frame_default',
            equipped_background: shopData?.equipped?.background || 'bg_default',
            equipped_emoji: shopData?.equipped?.emoji || 'emoji_profile',
            language: pvpConfig?.language || '',
            topic: pvpConfig?.topic || '',
            knowledge_area: queueArea,
            difficulty: queueCategory,
            category: queueCategory
          }).catch(() => null), 1500, 'upsert_self_queue').catch(() => null);
        }
        if (isQueueTickStale()) return;
        if (!selfQueue || String(selfQueue.status || '').trim().toLowerCase() !== 'waiting') return;
        const userQueueCategory = normalizeDifficulty(
          selfQueue.category || selfQueue.difficulty || queueCategory
        );
        const userQueueLanguage = String(selfQueue.language || pvpConfig?.language || '').trim();
        const userQueueArea = String(
          selfQueue.knowledge_area
          || resolveKnowledgeAreaByLanguageId(userQueueLanguage || pvpConfig?.language || '')
          || queueArea
          || ''
        ).trim();
        const preparedAgeMs = Math.max(
          0,
          Date.now() - Math.max(0, Number(preparedBotRef.current?.preparedAtMs || 0))
        );
        const hasPreparedBot = String(preparedBotRef.current?.userId || '').trim() === String(authUser?.uid || '').trim()
          && normalizeDifficulty(preparedBotRef.current?.category || 'easy') === normalizeDifficulty(userQueueCategory || 'easy')
          && isSystemBotUserId(preparedBotRef.current?.botId);
        if (!hasPreparedBot || preparedAgeMs > 9000) {
          const nowKick = Date.now();
          if ((nowKick - Math.max(0, Number(preparedBotKickAtRef.current || 0))) >= 2500) {
            preparedBotKickAtRef.current = nowKick;
            prepareBotForQueue(userQueueCategory, 'tick_warmup', false).catch(() => null);
          }
        }
        const queueSessionJoinedAtMs = Math.max(
          0,
          Number(getQueueSessionStartMs() || 0)
        );
        const currentQueue = pvpStateRef.current;
        const botMatchAtMs = Math.max(0, Number(currentQueue.queueBotMatchAtMs || 0));
        if (!botMatchAtMs) {
          queueFlowLog('matchmaking_tick:no_bot_match_at', {
            userId: authUser?.uid || '',
            queueStatus: selfQueue?.status || ''
          });
          scheduleNextBotAttempt(1, 3);
          return;
        }
        const nowBeforeHumanMatching = Date.now();
        const queueJoinedForPrioritize = getQueueSessionStartMs();
        const pastDeadlineForPrioritize = queueJoinedForPrioritize > 0
          && (nowBeforeHumanMatching - queueJoinedForPrioritize) >= PVP_QUEUE_BOT_HARD_DEADLINE_MS;
        const pastMinimumBotWindow = queueJoinedForPrioritize > 0
          && (nowBeforeHumanMatching - queueJoinedForPrioritize) >= PVP_QUEUE_BOT_FIRST_THRESHOLD_MS;
        const shouldPrioritizeBotAttempt = (
          pastDeadlineForPrioritize
          || (pastMinimumBotWindow && nowBeforeHumanMatching >= botMatchAtMs)
        );
        const msUntilBotDue = Math.max(0, botMatchAtMs - nowBeforeHumanMatching);
        if (msUntilBotDue <= PVP_QUEUE_BOT_NEAR_DUE_PRIORITIZE_MS) {
          const nowKick = Date.now();
          if ((nowKick - Math.max(0, Number(preparedBotKickAtRef.current || 0))) >= 1200) {
            preparedBotKickAtRef.current = nowKick;
            prepareBotForQueue(userQueueCategory, 'near_due', true).catch(() => null);
          }
        }
        const shouldSkipHumanMatchScan = msUntilBotDue <= PVP_QUEUE_BOT_NEAR_DUE_PRIORITIZE_MS;

        if (!shouldPrioritizeBotAttempt && !shouldSkipHumanMatchScan) {
          const opponents = await withTimeout(
            findQueueOpponent(authUser.uid, userQueueCategory, userQueueCategory, 12, userQueueLanguage).catch(() => []),
            1200,
            'find_queue_opponents'
          ).catch(() => []);
          if (isQueueTickStale()) return;
          let matchedWithHuman = false;
          for (const opponent of (Array.isArray(opponents) ? opponents.slice(0, 3) : [])) {
            const opponentId = String(opponent?.id || '').trim();
            if (!opponentId) continue;

            const lockAcquired = await tryAcquirePairLock(authUser.uid, opponentId, authUser.uid, 7000);
            if (!lockAcquired) continue;

            try {
              const [myQueue, oppQueue, myOpenMatch, opponentOpenMatch] = await Promise.all([
                withTimeout(
                  getQueueEntryByUser(authUser.uid).catch(() => null),
                  1000,
                  'my_queue_for_human'
                ).catch(() => null),
                withTimeout(
                  getQueueEntryByUser(opponentId).catch(() => null),
                  1000,
                  'opp_queue_for_human'
                ).catch(() => null),
                withTimeout(
                  findOpenMatchForUser(authUser.uid).catch(() => null),
                  1000,
                  'my_open_match_for_human'
                ).catch(() => null),
                withTimeout(
                  findOpenMatchForUser(opponentId).catch(() => null),
                  1000,
                  'opp_open_match_for_human'
                ).catch(() => null)
              ]);

              if (myOpenMatch?.id) {
                await attachToMatch(myOpenMatch.id);
                matchedWithHuman = true;
                break;
              }
              if (opponentOpenMatch?.id) continue;
              if (!myQueue || !oppQueue) continue;
              if (!isQueueEntryFreshWaiting(myQueue, 12000)) continue;
              if (!isQueueEntryFreshWaiting(oppQueue, 12000)) continue;
              const myQueueCategory = normalizeDifficulty(myQueue.category || myQueue.difficulty || userQueueCategory);
              const oppQueueCategory = normalizeDifficulty(oppQueue.category || oppQueue.difficulty || 'easy');
              if (myQueueCategory !== oppQueueCategory) continue;
              if (myQueueCategory !== userQueueCategory) continue;
              if (normalizeDifficulty(myQueue.difficulty || 'easy') !== myQueueCategory) continue;
              if (normalizeDifficulty(oppQueue.difficulty || 'easy') !== oppQueueCategory) continue;
              const myQueueLanguage = String(myQueue.language || userQueueLanguage || pvpConfig.language || '').trim();
              const oppQueueLanguage = String(oppQueue.language || '').trim();
              const myQueueArea = String(
                myQueue.knowledge_area
                || resolveKnowledgeAreaByLanguageId(myQueueLanguage || userQueueLanguage || pvpConfig.language || '')
                || userQueueArea
                || ''
              ).trim();
              const oppQueueArea = String(
                oppQueue.knowledge_area
                || resolveKnowledgeAreaByLanguageId(oppQueueLanguage)
                || ''
              ).trim();
              if (myQueueArea && oppQueueArea && myQueueArea !== oppQueueArea) {
                queueFlowLog('matchmaking_tick:human_area_mismatch', {
                  userId: authUser?.uid || '',
                  opponentId,
                  myArea: myQueueArea,
                  opponentArea: oppQueueArea
                });
                continue;
              }

              const safeConfig = ensureValidPvpConfig({
                language: myQueueLanguage || pvpConfig.language,
                topic: myQueue.topic || pvpConfig.topic,
                difficulty: myQueueCategory,
                area: myQueueArea || userQueueArea
              });
              const sequenceArea = String(
                myQueueArea
                || userQueueArea
                || resolveKnowledgeAreaByLanguageId(safeConfig.language || '')
                || 'programming'
              ).trim();
              const matchId = buildMatchId(authUser.uid, opponentId);
              const questionSequence = resolvePvpMatchQuestionSequence({
                areaId: sequenceArea,
                difficulty: myQueueCategory,
                language: safeConfig.language,
                topic: safeConfig.topic,
                rounds: PVP_ROUNDS_PER_MATCH,
                sequenceSeed: matchId
              });
              const questionSet = Array.isArray(questionSequence?.questions)
                ? questionSequence.questions
                : [];

              if (!questionSet.length) continue;
              const sequenceStartCursor = normalizePvpSequenceCursorEntry(questionSequence?.startCursor);
              const sequenceNextCursor = normalizePvpSequenceCursorEntry(questionSequence?.nextCursor);
              const sequenceLanguage = String(
                questionSequence?.resolvedLanguage
                || safeConfig.language
                || ''
              ).trim() || safeConfig.language;
              const sequenceTopic = String(
                questionSequence?.resolvedTopic
                || safeConfig.topic
                || ''
              ).trim() || safeConfig.topic;

              const created = await createPvpMatch({
                id: matchId,
                status: 'pending_accept',
                difficulty: myQueueCategory,
                category: myQueueCategory,
                language: sequenceLanguage,
                topic: sequenceTopic,
                knowledge_area: sequenceArea,
                pvp_sequence_area: sequenceArea,
                pvp_sequence_difficulty: myQueueCategory,
                pvp_sequence_pref_language: safeConfig.language,
                pvp_sequence_pref_topic: safeConfig.topic,
                pvp_sequence_seed: matchId,
                pvp_sequence_start_topic_index: sequenceStartCursor.topic_index,
                pvp_sequence_start_question_index: sequenceStartCursor.question_index,
                pvp_sequence_start_topic_key: sequenceStartCursor.topic_key,
                total_rounds: questionSet.length,
                round_no: 1,
                question_set: questionSet,
                player1_user_id: authUser.uid,
                player1_nickname: profile?.nickname || myQueue.nickname || 'Jogador',
                player1_avatar: profile?.avatar || myQueue.avatar || '🤓',
                player1_frame: myQueue.equipped_frame || shopData?.equipped?.frame || 'frame_default',
                player1_background: myQueue.equipped_background || shopData?.equipped?.background || 'bg_default',
                player1_emoji: myQueue.equipped_emoji || shopData?.equipped?.emoji || 'emoji_profile',
                player1_level: Math.max(1, Number(progress.level || myQueue.level || 1)),
                player1_pvp_points: Math.max(0, Number(progress.pvpPoints || myQueue.pvp_points || 0)),
                player1_pvp_battles: Math.max(0, Number(progress.pvpBattles || 0)),
                player1_queue_joined_at_ms: resolveBackendQueueJoinMs(myQueue, queueSessionJoinedAtMs || Date.now()),
                player1_accept_state: 'pending',
                player2_user_id: opponentId,
                player2_nickname: opponent.nickname || 'Jogador',
                player2_avatar: opponent.avatar || '🤓',
                player2_frame: opponent.equipped_frame || 'frame_default',
                player2_background: opponent.equipped_background || 'bg_default',
                player2_emoji: opponent.equipped_emoji || 'emoji_profile',
                player2_level: Math.max(1, Number(opponent.level || 1)),
                player2_pvp_points: Math.max(0, Number(opponent.pvp_points || 0)),
                player2_pvp_battles: Math.max(0, Number(opponent.pvp_battles || 0)),
                player2_queue_joined_at_ms: resolveBackendQueueJoinMs(opponent, Date.now()),
                player2_accept_state: 'pending',
                queue_joined_at_ms: resolveBackendQueueJoinMs(myQueue, queueSessionJoinedAtMs || Date.now()),
                accept_deadline_ms: Date.now() + PVP_MATCH_ACCEPT_TIMEOUT_MS,
                start_countdown_ms: 0,
                reject_at_ms: 0,
                player1_score: 0,
                player2_score: 0,
                host_user_id: authUser.uid,
                round_started_at_ms: Date.now(),
                round_started_at: nowIso(),
                created_at: nowIso(),
                updated_at: nowIso()
              }).catch((error) => {
                console.error('matchmaking human create failed:', error);
                return null;
              });

              if (!created?.id) continue;
              rememberPvpSequenceStartTopic(sequenceArea, myQueueCategory, sequenceStartCursor.topic_key);
              setPvpSequenceCursorEntry(sequenceArea, myQueueCategory, sequenceNextCursor);

              await Promise.all([
                markQueueMatched(authUser.uid, created.id).catch(() => null),
                markQueueMatched(opponentId, created.id).catch(() => null)
              ]);

              await attachToMatch(created.id);
              queueFlowLog('matchmaking_tick:human_match_created', {
                userId: authUser?.uid || '',
                matchId: created.id,
                opponentId
              });
              matchedWithHuman = true;
              break;
            } finally {
              await releasePairLock(authUser.uid, opponentId, authUser.uid).catch(() => null);
            }
          }
          if (matchedWithHuman) return;
        }

        const nowBeforeBotAttempt = Date.now();
        const queueJoinedForDeadline = getQueueSessionStartMs();
        const minBotStartAt = queueJoinedForDeadline > 0
          ? queueJoinedForDeadline + PVP_QUEUE_BOT_FIRST_THRESHOLD_MS
          : 0;
        if (minBotStartAt > 0 && nowBeforeBotAttempt < minBotStartAt) {
          const waitMinMs = Math.min(minBotStartAt - nowBeforeBotAttempt, 2500);
          if (waitMinMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, waitMinMs));
          }
          if (cancelled) return;
          const latestStatus = String(pvpStateRef.current?.status || '').trim().toLowerCase();
          if (latestStatus !== 'queueing') return;
        }
        if (isQueueTickStale()) return;
        const pastHardDeadline = queueJoinedForDeadline > 0
          && (nowBeforeBotAttempt - queueJoinedForDeadline) >= PVP_QUEUE_BOT_HARD_DEADLINE_MS;
        if (!pastHardDeadline && nowBeforeBotAttempt < botMatchAtMs) {
          const waitMs = Math.min(botMatchAtMs - nowBeforeBotAttempt, 4000);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          if (cancelled) return;
          const latestStatus = String(pvpStateRef.current?.status || '').trim().toLowerCase();
          if (latestStatus !== 'queueing') return;
        }

        const prepared = preparedBotRef.current && typeof preparedBotRef.current === 'object'
          ? preparedBotRef.current
          : {};
        const excludedBotId = getQueueBotExclusionId();
        let selectedBotId = '';
        if (
          String(prepared.userId || '').trim() === String(authUser?.uid || '').trim()
          && normalizeDifficulty(prepared.category || 'easy') === normalizeDifficulty(userQueueCategory || 'easy')
          && isSystemBotUserId(prepared.botId)
          && String(prepared.botId || '').trim() !== excludedBotId
        ) {
          selectedBotId = String(prepared.botId || '').trim();
        }
        if (!selectedBotId) {
          const pickedBot = await withTimeout(
            getNextBotForUserMatch(userQueueCategory, {
              excludeBotIds: excludedBotId ? [excludedBotId] : [],
              waitForEnsure: false,
              preferLocal: true
            }).catch(() => null),
            2200,
            'pick_bot_for_match'
          ).catch(() => null);
          if (isQueueTickStale()) return;
          selectedBotId = String(
            pickedBot?.bot_id
            || pickedBot?.profile?.id
          ).trim();
        }
        if (!isSystemBotUserId(selectedBotId)) {
          selectedBotId = await pickFallbackBotId(
            userQueueCategory,
            '',
            excludedBotId ? [excludedBotId] : []
          );
        }
        const queueWaitMs = Math.max(
          0,
          Date.now() - getQueueSessionStartMs()
        );
        const forceLockFallback = queueWaitMs >= Math.max(14000, PVP_QUEUE_BOT_HARD_DEADLINE_MS - 1500);
        const preparedBotId = String(preparedBotRef.current?.botId || '').trim();
        const initialCandidates = [
          String(selectedBotId || '').trim(),
          preparedBotId
        ]
          .filter((id, index, arr) => id && arr.indexOf(id) === index)
          .filter((id) => isSystemBotUserId(id))
          .filter((id) => id !== excludedBotId);
        const secondaryCandidate = initialCandidates.length >= 2
          ? ''
          : await pickFallbackBotId(
            userQueueCategory,
            '',
            [
              ...initialCandidates,
              ...(excludedBotId ? [excludedBotId] : [])
            ]
          );
        const lockCandidates = [
          ...initialCandidates,
          ...(secondaryCandidate && !initialCandidates.includes(secondaryCandidate) ? [secondaryCandidate] : [])
        ];

        if (!lockCandidates.length) {
          queueFlowLog('matchmaking_tick:no_bot_candidates', {
            userId: authUser?.uid || '',
            targetDifficulty: userQueueCategory
          });
          scheduleNextBotAttempt(1, 2);
          return;
        }
        if (forceLockFallback) {
          await cleanupStalePairLocks(25, 30).catch(() => null);
        }

        let lockedBotId = '';
        const lockTtlMs = forceLockFallback ? 1600 : 2800;
        for (const candidateBotId of lockCandidates) {
          const lockOk = await tryAcquirePairLock(authUser.uid, candidateBotId, authUser.uid, lockTtlMs);
          if (isQueueTickStale()) return;
          if (lockOk) {
            lockedBotId = candidateBotId;
            break;
          }
          if (forceLockFallback) {
            await cleanupStalePairLocks(25, 20).catch(() => null);
          }
        }
        if (!lockedBotId) {
          queueFlowLog('matchmaking_tick:bot_lock_failed', {
            userId: authUser?.uid || '',
            preferredBotId: selectedBotId || '',
            candidates: lockCandidates
          });
          await cleanupStalePairLocks(25, 40).catch(() => null);
          if (isSystemBotUserId(selectedBotId)) {
            await rotateUserBotQueue(selectedBotId, 'mm_lock_failed').catch(() => null);
            setQueueBotExclusion(selectedBotId, 15000);
          }
          scheduleNextBotAttempt(1, forceLockFallback ? 2 : 3);
          return;
        }
        selectedBotId = lockedBotId;
        queueFlowLog('matchmaking_tick:bot_lock_acquired', {
          userId: authUser?.uid || '',
          botId: selectedBotId
        });

        try {
          const contextFetchStartedAt = Date.now();
          queueFlowLog('matchmaking_tick:context_fetch_start', {
            userId: authUser?.uid || '',
            botId: selectedBotId
          });
          const queueSnapshotBeforeLock = selfQueue && typeof selfQueue === 'object'
            ? { ...selfQueue }
            : null;
          const [fetchedMyQueue, botSnapshot, remoteBotConfig, myOpenMatch, botOpenMatch] = await Promise.all([
            withTimeout(
              getQueueEntryByUser(authUser.uid).catch(() => null),
              1200,
              'queue_entry_after_lock'
            ).catch(() => null),
            withTimeout(
              getSystemBotSnapshot(selectedBotId, {
                preferLocal: true
              }).catch(() => null),
              1600,
              'bot_snapshot_after_lock'
            ).catch(() => (
              String(preparedBotRef.current?.botId || '').trim() === String(selectedBotId || '').trim()
                ? (preparedBotRef.current?.snapshot || null)
                : null
            )),
            withTimeout(
              getPvpBotConfig(selectedBotId, {
                preferLocal: true
              }).catch(() => BOT_CONFIG_DEFAULT),
              2200,
              'bot_config_after_lock'
            ).catch(() => (
              String(preparedBotRef.current?.botId || '').trim() === String(selectedBotId || '').trim()
                ? (preparedBotRef.current?.config || BOT_CONFIG_DEFAULT)
                : BOT_CONFIG_DEFAULT
            )),
            withTimeout(
              findOpenMatchForUser(authUser.uid).catch(() => null),
              1200,
              'my_open_match_after_lock'
            ).catch(() => null),
            withTimeout(
              findOpenMatchForUser(selectedBotId).catch(() => null),
              1200,
              'bot_open_match_after_lock'
            ).catch(() => null)
          ]);
          if (isQueueTickStale()) return;
          let myQueue = fetchedMyQueue;
          queueFlowLog('matchmaking_tick:context_fetch_done', {
            userId: authUser?.uid || '',
            botId: selectedBotId,
            elapsedMs: Math.max(0, Date.now() - contextFetchStartedAt),
            hasQueue: !!myQueue,
            hasMyOpenMatch: !!myOpenMatch?.id,
            hasBotOpenMatch: !!botOpenMatch?.id
          });

          if (myOpenMatch?.id) {
            queueFlowLog('matchmaking_tick:my_open_match_reused', {
              userId: authUser?.uid || '',
              matchId: myOpenMatch.id
            });
            await attachToMatch(myOpenMatch.id);
            return;
          }
          if (botOpenMatch?.id) {
            queueFlowLog('matchmaking_tick:bot_open_match_busy', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              botMatchId: botOpenMatch.id
            });
            await rotateUserBotQueue(selectedBotId, 'mm_bot_open_match_busy').catch(() => null);
            setQueueBotExclusion(selectedBotId, 15000);
            scheduleNextBotAttempt(1, 4);
            return;
          }

          if (!myQueue) {
            const localStatus = String(queueSnapshotBeforeLock?.status || '').trim().toLowerCase();
            if (localStatus === 'waiting') {
              myQueue = { ...queueSnapshotBeforeLock };
              queueFlowLog('matchmaking_tick:queue_recovered_from_local_snapshot', {
                userId: authUser?.uid || '',
                botId: selectedBotId
              });
            }
          }
          if (!myQueue) {
            const recreatedQueue = await upsertQueueEntry({
              user_id: authUser.uid,
              nickname: profile?.nickname || 'Jogador',
              avatar: profile?.avatar || '🤓',
              level: Math.max(1, Number(progress.level || 1)),
              pvp_points: Math.max(0, Number(progress.pvpPoints || 0)),
              equipped_frame: shopData?.equipped?.frame || 'frame_default',
              equipped_background: shopData?.equipped?.background || 'bg_default',
              equipped_emoji: shopData?.equipped?.emoji || 'emoji_profile',
              language: pvpConfig?.language || '',
              topic: pvpConfig?.topic || '',
              knowledge_area: queueArea,
              difficulty: userQueueCategory,
              category: userQueueCategory
            }).catch(() => null);
            if (recreatedQueue && String(recreatedQueue.status || '').trim().toLowerCase() === 'waiting') {
              myQueue = recreatedQueue;
              queueFlowLog('matchmaking_tick:queue_recreated_after_lock', {
                userId: authUser?.uid || '',
                botId: selectedBotId
              });
            }
          }
          if (!myQueue) {
            queueFlowLog('matchmaking_tick:queue_fetch_missing_after_lock', {
              userId: authUser?.uid || '',
              botId: selectedBotId
            });
            scheduleNextBotAttempt(1, 2);
            return;
          }
          if (String(myQueue.status || '') !== 'waiting') {
            queueFlowLog('matchmaking_tick:my_queue_not_waiting_after_lock', {
              userId: authUser?.uid || '',
              queueStatus: myQueue?.status || ''
            });
            scheduleNextBotAttempt(1, 12);
            return;
          }
          const myQueueCategory = normalizeDifficulty(myQueue.category || myQueue.difficulty || userQueueCategory);
          if (myQueueCategory !== userQueueCategory) {
            scheduleNextBotAttempt(1, 12);
            return;
          }
          const myQueueLanguage = String(myQueue.language || userQueueLanguage || pvpConfig.language || '').trim();
          const myQueueArea = String(
            myQueue.knowledge_area
            || resolveKnowledgeAreaByLanguageId(myQueueLanguage || userQueueLanguage || pvpConfig.language || '')
            || userQueueArea
            || ''
          ).trim();

          const safeConfig = ensureValidPvpConfig({
            language: myQueueLanguage || pvpConfig.language,
            topic: myQueue.topic || pvpConfig.topic,
            difficulty: myQueueCategory,
            area: myQueueArea || userQueueArea
          });
          const sequenceArea = String(
            myQueueArea
            || userQueueArea
            || resolveKnowledgeAreaByLanguageId(safeConfig.language || '')
            || 'programming'
          ).trim();
          const matchId = buildMatchId(authUser.uid, selectedBotId);
          const questionSequence = resolvePvpMatchQuestionSequence({
            areaId: sequenceArea,
            difficulty: myQueueCategory,
            language: safeConfig.language,
            topic: safeConfig.topic,
            rounds: PVP_ROUNDS_PER_MATCH,
            sequenceSeed: matchId
          });
          const questionSet = Array.isArray(questionSequence?.questions)
            ? questionSequence.questions
            : [];
          if (!questionSet.length) {
            queueFlowLog('matchmaking_tick:no_questions_for_bot_match', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              difficulty: myQueueCategory,
              area: sequenceArea,
              language: safeConfig.language,
              topic: safeConfig.topic
            });
            await rotateUserBotQueue(selectedBotId, 'mm_no_questions').catch(() => null);
            scheduleNextBotAttempt(1, 12);
            return;
          }
          const sequenceStartCursor = normalizePvpSequenceCursorEntry(questionSequence?.startCursor);
          const sequenceNextCursor = normalizePvpSequenceCursorEntry(questionSequence?.nextCursor);
          const sequenceLanguage = String(
            questionSequence?.resolvedLanguage
            || safeConfig.language
            || ''
          ).trim() || safeConfig.language;
          const sequenceTopic = String(
            questionSequence?.resolvedTopic
            || safeConfig.topic
            || ''
          ).trim() || safeConfig.topic;

          let resolvedBotSnapshot = botSnapshot && typeof botSnapshot === 'object'
            ? botSnapshot
            : null;
          let botProfile = resolvedBotSnapshot?.profile && typeof resolvedBotSnapshot.profile === 'object'
            ? resolvedBotSnapshot.profile
            : null;
          let botStats = resolvedBotSnapshot?.stats && typeof resolvedBotSnapshot.stats === 'object'
            ? resolvedBotSnapshot.stats
            : null;
          let botStatsFallback = resolvedBotSnapshot?.stats_is_fallback === true;

          if (!botProfile || !botStats || botStatsFallback) {
            const preparedSnapshot = String(preparedBotRef.current?.botId || '').trim() === String(selectedBotId || '').trim()
              ? (preparedBotRef.current?.snapshot || null)
              : null;
            if (preparedSnapshot && typeof preparedSnapshot === 'object') {
              resolvedBotSnapshot = preparedSnapshot;
              botProfile = resolvedBotSnapshot?.profile && typeof resolvedBotSnapshot.profile === 'object'
                ? resolvedBotSnapshot.profile
                : null;
              botStats = resolvedBotSnapshot?.stats && typeof resolvedBotSnapshot.stats === 'object'
                ? resolvedBotSnapshot.stats
                : null;
              botStatsFallback = resolvedBotSnapshot?.stats_is_fallback === true;
            }
          }

          if (!botProfile || !botStats || botStatsFallback) {
            queueFlowLog('matchmaking_tick:bot_snapshot_missing', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              message: botStatsFallback ? 'fallback_stats' : 'missing_snapshot'
            });
            await rotateUserBotQueue(selectedBotId, 'mm_snapshot_missing').catch(() => null);
            setQueueBotExclusion(selectedBotId, 10000);
            scheduleNextBotAttempt(1, 2);
            return;
          }
          const botQueueCategory = getPvpQueueDifficultyFromStats(botStats);
          if (normalizeDifficulty(botQueueCategory || 'easy') !== myQueueCategory) {
            const botPvpCategory = getPvpDifficultyFromPoints(botStats?.pvp_points || 0);
            queueFlowLog('matchmaking_tick:bot_category_override', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              botCategory: botQueueCategory,
              expectedCategory: myQueueCategory,
              botPvpCategory,
              botPvpPoints: Math.max(0, Number(botStats?.pvp_points || 0))
            });
          }
          const botPersonality = normalizeBotPersonality(
            remoteBotConfig?.personality
            || resolvedBotSnapshot?.config?.personality
            || BOT_CONFIG_DEFAULT.personality
          );
          const botStrength = normalizeBotStrength(
            remoteBotConfig?.strength
            || resolvedBotSnapshot?.config?.strength
            || BOT_CONFIG_DEFAULT.strength
          );
          const nowMs = Date.now();
          const queueElapsedBeforeCreateMs = queueSessionJoinedAtMs > 0
            ? Math.max(0, nowMs - queueSessionJoinedAtMs)
            : 0;
          if (
            queueElapsedBeforeCreateMs > 0
            && queueElapsedBeforeCreateMs < PVP_QUEUE_BOT_FIRST_THRESHOLD_MS
          ) {
            queueFlowLog('matchmaking_tick:bot_create_blocked_before_min_window', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              elapsedMs: queueElapsedBeforeCreateMs
            });
            scheduleNextBotAttempt(1, 2);
            return;
          }
          if (isQueueTickStale()) {
            queueFlowLog('matchmaking_tick:bot_create_cancelled_before_create', {
              userId: authUser?.uid || '',
              botId: selectedBotId
            });
            return;
          }
          const acceptDeadlineMs = nowMs + PVP_MATCH_ACCEPT_TIMEOUT_MS;
          const botDecisionDelayMs = PVP_MATCH_FOUND_TRANSITION_MS + PVP_BOT_DECISION_DELAY_MIN_MS
            + Math.floor(Math.random() * (PVP_BOT_DECISION_DELAY_MAX_MS - PVP_BOT_DECISION_DELAY_MIN_MS + 1));
          const botDecisionAtMs = nowMs + botDecisionDelayMs;
          const botWillReject = Math.random() < 0.6;
          const botFallbackProfile = getSystemBotFallbackProfile(selectedBotId);
          const created = await createPvpMatch({
            id: matchId,
            status: 'pending_accept',
            difficulty: myQueueCategory,
            category: myQueueCategory,
            language: sequenceLanguage,
            topic: sequenceTopic,
            knowledge_area: sequenceArea,
            pvp_sequence_area: sequenceArea,
            pvp_sequence_difficulty: myQueueCategory,
            pvp_sequence_pref_language: safeConfig.language,
            pvp_sequence_pref_topic: safeConfig.topic,
            pvp_sequence_seed: matchId,
            pvp_sequence_start_topic_index: sequenceStartCursor.topic_index,
            pvp_sequence_start_question_index: sequenceStartCursor.question_index,
            pvp_sequence_start_topic_key: sequenceStartCursor.topic_key,
            total_rounds: questionSet.length,
            round_no: 1,
            question_set: questionSet,
            player1_user_id: authUser.uid,
            player1_nickname: profile?.nickname || myQueue.nickname || 'Jogador',
            player1_avatar: profile?.avatar || myQueue.avatar || '🤓',
            player1_frame: myQueue.equipped_frame || shopData?.equipped?.frame || 'frame_default',
            player1_background: myQueue.equipped_background || shopData?.equipped?.background || 'bg_default',
            player1_emoji: myQueue.equipped_emoji || shopData?.equipped?.emoji || 'emoji_profile',
            player1_level: Math.max(1, Number(progress.level || myQueue.level || 1)),
            player1_pvp_points: Math.max(0, Number(progress.pvpPoints || myQueue.pvp_points || 0)),
            player1_pvp_battles: Math.max(0, Number(progress.pvpBattles || 0)),
            player1_queue_joined_at_ms: resolveBackendQueueJoinMs(myQueue, queueSessionJoinedAtMs || nowMs),
            player1_accept_state: 'pending',
            player2_user_id: selectedBotId,
            player2_nickname: botProfile.nickname || botFallbackProfile.nickname,
            player2_avatar: botProfile.avatar || botFallbackProfile.avatar,
            player2_frame: botProfile.equipped_frame || botFallbackProfile.equipped_frame,
            player2_background: botProfile.equipped_background || botFallbackProfile.equipped_background,
            player2_emoji: botProfile.equipped_emoji || botFallbackProfile.equipped_emoji,
            player2_level: Math.max(1, Number(botStats.level || 1)),
            player2_pvp_points: Math.max(0, Number(botStats.pvp_points || 0)),
            player2_pvp_battles: Math.max(0, Number(botStats.pvp_battles || 0)),
            player2_queue_joined_at_ms: 0,
            player2_bot_strength: botStrength,
            player2_accept_state: 'pending',
            bot_user_id: selectedBotId,
            bot_personality: botPersonality,
            bot_strength: botStrength,
            queue_joined_at_ms: resolveBackendQueueJoinMs(myQueue, queueSessionJoinedAtMs || nowMs),
            queue_session_id: effectQueueSessionId,
            bot_decision_at_ms: botDecisionAtMs,
            bot_decision_done: 'false',
            bot_will_reject: botWillReject ? 'true' : 'false',
            bot_user_queue_rotated: false,
            accept_deadline_ms: acceptDeadlineMs,
            start_countdown_ms: 0,
            both_accepted_at_ms: 0,
            reject_at_ms: 0,
            player1_score: 0,
            player2_score: 0,
            host_user_id: authUser.uid,
            is_bot_match: true,
            round_started_at_ms: 0,
            round_started_at: null,
            created_at: new Date(nowMs).toISOString(),
            updated_at: new Date(nowMs).toISOString()
          }).catch((error) => {
            console.error('matchmaking bot create failed:', error);
            return null;
          });

          if (!created?.id) {
            queueFlowLog('matchmaking_tick:bot_match_create_failed', {
              userId: authUser?.uid || '',
              botId: selectedBotId
            });
            await rotateUserBotQueue(selectedBotId, 'mm_create_failed').catch(() => null);
            scheduleNextBotAttempt(1, 3);
            return;
          }
          if (isQueueTickStale()) {
            queueFlowLog('matchmaking_tick:bot_match_voided_after_cancel', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              matchId: created.id
            });
            await updatePvpMatch(created.id, {
              status: 'finished',
              ended_reason: 'queue_cancelled_before_attach',
              ended_by_user_id: authUser?.uid || null,
              ended_at: nowIso(),
              winner_user_id: null,
              result_void: true,
              result_void_reason: 'queue_cancelled_before_attach',
              history_hidden: true,
              history_hidden_reason: 'queue_cancelled_before_attach'
            }).catch(() => null);
            await clearBotBusy(selectedBotId, created.id).catch(() => null);
            return;
          }
          const busyMarked = await setBotBusy(selectedBotId, {
            reason: 'user_match_pending',
            source: 'user',
            match_id: created.id
          }).catch((error) => {
            console.error('matchmaking bot busy mark failed:', error);
            return null;
          });
          if (!busyMarked) {
            console.warn('matchmaking bot busy mark unavailable, voiding created match');
            queueFlowLog('matchmaking_tick:bot_busy_mark_failed', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              matchId: created.id
            });
            await updatePvpMatch(created.id, {
              status: 'finished',
              ended_reason: 'bot_busy_conflict',
              ended_by_user_id: null,
              ended_at: nowIso(),
              winner_user_id: null,
              result_void: true,
              result_void_reason: 'bot_busy_conflict',
              history_hidden: true,
              history_hidden_reason: 'bot_busy_conflict'
            }).catch(() => null);
            await rotateUserBotQueue(selectedBotId, 'mm_busy_conflict').catch(() => null);
            setQueueBotExclusion(selectedBotId, 12000);
            scheduleNextBotAttempt(1, 3);
            return;
          }
          if (isQueueTickStale()) {
            queueFlowLog('matchmaking_tick:bot_match_voided_before_attach', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              matchId: created.id
            });
            await updatePvpMatch(created.id, {
              status: 'finished',
              ended_reason: 'queue_cancelled_before_attach',
              ended_by_user_id: authUser?.uid || null,
              ended_at: nowIso(),
              winner_user_id: null,
              result_void: true,
              result_void_reason: 'queue_cancelled_before_attach',
              history_hidden: true,
              history_hidden_reason: 'queue_cancelled_before_attach'
            }).catch(() => null);
            await clearBotBusy(selectedBotId, created.id).catch(() => null);
            return;
          }
          rememberPvpSequenceStartTopic(sequenceArea, myQueueCategory, sequenceStartCursor.topic_key);
          setPvpSequenceCursorEntry(sequenceArea, myQueueCategory, sequenceNextCursor);
          const queueElapsedMsAtMatch = queueSessionJoinedAtMs > 0
            ? Math.max(0, Date.now() - queueSessionJoinedAtMs)
            : 0;
          queueFlowLog('matchmaking_tick:bot_match_created', {
            userId: authUser?.uid || '',
            botId: selectedBotId,
            matchId: created.id,
            difficulty: myQueueCategory,
            queue_elapsed_ms: queueElapsedMsAtMatch,
            queue_elapsed_seconds: Number((queueElapsedMsAtMatch / 1000).toFixed(2)),
            sla_in_window_17_5_24s: queueElapsedMsAtMatch >= 17500 && queueElapsedMsAtMatch <= 24000
          });
          setQueueBotExclusion('', 0);
          await attachToMatch(created.id);
        } finally {
          clearPreparedBot();
          await releasePairLock(authUser.uid, selectedBotId, authUser.uid).catch(() => null);
        }
      } catch (error) {
        console.error('matchmaking tick failed:', error);
        queueFlowLog('matchmaking_tick:error', {
          userId: authUser?.uid || '',
          message: String(error?.message || error || 'unknown_error')
        });
        scheduleNextBotAttempt(1, 12);
      } finally {
        tickRunning = false;
        tickStartedAtMs = 0;
      }
    }

    tickMatchmaking().catch(() => null);
    matchmakingIntervalRef.current = setInterval(() => {
      tickMatchmaking().catch(() => null);
    }, 1000);
    const cleanupTimer = setInterval(() => {
      cleanupStaleQueueEntries(300, authUser.uid).catch(() => null);
      cleanupStalePairLocks(25, 80).catch(() => null);
    }, 12000);

    return () => {
      cancelled = true;
      if (matchmakingIntervalRef.current) {
        clearInterval(matchmakingIntervalRef.current);
        matchmakingIntervalRef.current = null;
      }
      clearInterval(cleanupTimer);
    };
  }, [pvpState.status, authUser?.uid, profile?.nickname, profile?.avatar, shopData?.equipped?.frame, shopData?.equipped?.background, shopData?.equipped?.emoji, pvpConfig, progress?.level, progress?.pvpPoints]);

  // Duelo encerrado sem valer resultado (inválido, recusado ou sem aceite a tempo).
  function isPvpMatchWithoutResultScreen(matchRow) {
    const endedReason = String(matchRow?.ended_reason || '').trim().toLowerCase();
    return isInvalidFinishedMatch(matchRow)
      || endedReason === 'match_refused'
      || endedReason === 'accept_timeout';
  }

  // Duelo encerrado: aplica o resultado e leva para a recompensa (ou para a compensação
  // quando o oponente abandonou); partida que não valeu volta para a arena.
  function openFinishedPvpMatch(matchRow) {
    handlePvpMatchFinished(matchRow).catch(() => null);
    const endedReason = String(matchRow?.ended_reason || '').trim().toLowerCase();
    const endedBy = String(matchRow?.ended_by_user_id || matchRow?.forfeit_by_user_id || '').trim();
    const currentUserId = String(authUser?.uid || '').trim();
    const isCompensationFlow = endedReason === 'forfeit' && endedBy && endedBy !== currentUserId;
    if (isPvpMatchWithoutResultScreen(matchRow)) {
      setPvpResultTransitionMode('');
      const shouldResume = shouldResumeQueueAfterMatchRefused(matchRow, currentUserId);
      if (!shouldResume) {
        if (currentUserId) leaveQueue(currentUserId).catch(() => null);
        resetPvpState();
      }
      setScreen('challenge');
    } else if (isCompensationFlow) {
      setPvpResultTransitionMode('opponent_left');
      setScreen('pvp-result');
    } else {
      setPvpResultTransitionMode('');
      setScreen('pvp-result');
    }
  }

  useEffect(() => {
    if (pvpState.status !== 'active' && pvpState.status !== 'pending_accept' && pvpState.status !== 'round_result') return;
    const matchId = String(pvpState.matchId || '').trim();
    if (!matchId) return;

    const unsubscribe = subscribeMatch(
      matchId,
      (matchRow) => {
        const live = pvpStateRef.current;
        const liveMatchId = String(live?.matchId || live?.match?.id || '').trim();
        if (liveMatchId !== matchId) return;
        if (!matchRow) {
          if (String(live?.status || '').trim().toLowerCase() === 'finished') return;
          setPvpState((prev) => ({
            ...prev,
            status: 'idle',
            match: null,
            matchId: '',
            answers: [],
            error: 'Partida não encontrada.'
          }));
          setScreen('challenge');
          return;
        }
        if (String(matchRow.id || matchId).trim() !== matchId
          || isPvpDuelMatchSnapshotObsolete(live?.match, matchRow)) return;
        pvpRealtimeMatchUpdateAtRef.current = Date.now();

        const status = String(matchRow.status || '');
        const roundNo = Math.max(1, Number(matchRow.round_no || 1));
        const roundStartMs = Math.max(
          0,
          Number(matchRow.round_started_at_ms || toMillis(matchRow.round_started_at) || 0)
        );

        const applySnapshot = (prev) => {
          const prevMatchId = String(prev?.matchId || prev?.match?.id || '').trim();
          if (prevMatchId !== matchId || isPvpDuelMatchSnapshotObsolete(prev?.match, matchRow)) return prev;
          const prevRound = Math.max(1, Number(prev.match?.round_no || 1));
          const roundChanged = prevRound !== roundNo;
          const nextStatus = status === 'finished'
            ? 'finished'
            : (status === 'pending_accept' ? 'pending_accept' : 'active');
          const resolvedStatus = status === 'round_result' ? 'round_result' : nextStatus;
          return {
            ...prev,
            match: matchRow,
            answers: roundChanged ? [] : prev.answers,
            roundStartMs,
            submitted: roundChanged ? false : prev.submitted,
            selectedIndex: roundChanged ? null : prev.selectedIndex,
            status: resolvedStatus,
            error: ''
          };
        };
        pvpStateRef.current = applySnapshot(pvpStateRef.current);
        setPvpState(applySnapshot);

        if (status === 'finished') {
          openFinishedPvpMatch(matchRow);
        } else if (status === 'pending_accept') {
          setScreen('challenge');
        } else if (status === 'round_result') {
          setScreen('pvp');
        } else {
          setScreen('pvp');
        }
      },
      (error) => {
        console.error('match subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pvpState.status, pvpState.matchId, authUser?.uid]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    if (safeStatus !== 'active' && safeStatus !== 'pending_accept' && safeStatus !== 'round_result') return;
    const matchId = String(pvpState.matchId || pvpState.match?.id || '').trim();
    if (!matchId) return;

    let cancelled = false;
    const intervalMs = 1300;

    const syncMatchFallback = async () => {
      if (cancelled) return;
      const sinceRealtimeMs = Date.now() - Math.max(0, Number(pvpRealtimeMatchUpdateAtRef.current || 0));
      if (sinceRealtimeMs < 2200) return;

      const latest = await getPvpMatch(matchId).catch(() => null);
      if (cancelled || !latest) return;
      const live = pvpStateRef.current;
      const liveMatchId = String(live?.matchId || live?.match?.id || '').trim();
      if (liveMatchId !== matchId || String(latest.id || matchId).trim() !== matchId
        || isPvpDuelMatchSnapshotObsolete(live?.match, latest)) return;
      pvpRealtimeMatchUpdateAtRef.current = Date.now();
      const latestStatus = String(latest.status || '').trim().toLowerCase();

      if (latestStatus === 'finished') {
        const applyFinishedSnapshot = (prev) => {
          const prevMatchId = String(prev?.matchId || prev?.match?.id || '').trim();
          if (prevMatchId !== matchId || isPvpDuelMatchSnapshotObsolete(prev?.match, latest)) return prev;
          return { ...prev, status: 'finished', match: latest };
        };
        pvpStateRef.current = applyFinishedSnapshot(pvpStateRef.current);
        setPvpState(applyFinishedSnapshot);

        openFinishedPvpMatch(latest);
        return;
      }

      if (latestStatus !== 'active' && latestStatus !== 'pending_accept' && latestStatus !== 'round_result') return;
      const nextRoundNo = Math.max(1, Number(latest.round_no || 1));
      const nextRoundStartMs = Math.max(
        0,
        Number(latest.round_started_at_ms || toMillis(latest.round_started_at) || 0)
      );

      const applySnapshot = (prev) => {
        const prevMatchId = String(prev.matchId || prev.match?.id || '').trim();
        if (prevMatchId !== matchId || isPvpDuelMatchSnapshotObsolete(prev?.match, latest)) return prev;

        const prevRow = prev.match && typeof prev.match === 'object' ? prev.match : {};
        const prevUpdatedMs = toMillis(prevRow.updated_at || prevRow.round_started_at || prevRow.created_at);
        const nextUpdatedMs = toMillis(latest.updated_at || latest.round_started_at || latest.created_at);
        const prevRoundNo = Math.max(1, Number(prevRow.round_no || 1));
        const roundChanged = prevRoundNo !== nextRoundNo;
        const nextStatus = latestStatus === 'pending_accept'
          ? 'pending_accept'
          : latestStatus === 'round_result'
            ? 'round_result'
            : 'active';

        const shouldUpdate = roundChanged
          || nextStatus !== String(prev.status || '').trim().toLowerCase()
          || nextUpdatedMs > prevUpdatedMs;
        if (!shouldUpdate) return prev;

        if (roundChanged) {
          pvpRealtimeAnswersUpdateAtRef.current = 0;
        }

        return {
          ...prev,
          status: nextStatus,
          matchId,
          match: latest,
          roundStartMs: nextRoundStartMs,
          answers: roundChanged ? [] : prev.answers,
          submitted: roundChanged ? false : prev.submitted,
          selectedIndex: roundChanged ? null : prev.selectedIndex,
          error: ''
        };
      };
      pvpStateRef.current = applySnapshot(pvpStateRef.current);
      setPvpState(applySnapshot);
    };

    syncMatchFallback().catch(() => null);
    const timer = setInterval(() => syncMatchFallback().catch(() => null), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pvpState.status, pvpState.matchId, pvpState.match?.id, authUser?.uid]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    if (safeStatus !== 'active' && safeStatus !== 'round_result') return;
    const match = pvpState.match;
    const matchId = String(match?.id || pvpState.matchId || '').trim();
    const roundNo = getPvpAnswerTargetRoundNo(match, safeStatus);
    if (!matchId) return;

    let cancelled = false;
    const intervalMs = 1200;

    const syncAnswersFallback = async () => {
      if (cancelled) return;
      const sinceRealtimeMs = Date.now() - Math.max(0, Number(pvpRealtimeAnswersUpdateAtRef.current || 0));
      if (sinceRealtimeMs < 1800) return;

      const rows = await getPvpRoundAnswers(matchId, roundNo).catch(() => []);
      if (cancelled) return;
      pvpRealtimeAnswersUpdateAtRef.current = Date.now();
      const safeRows = getPvpRoundAnswersForRound(rows, roundNo);

      setPvpState((prev) => {
        const prevStatus = String(prev.status || '').trim().toLowerCase();
        if (prevStatus !== 'active' && prevStatus !== 'round_result') return prev;
        const prevMatchId = String(prev.match?.id || prev.matchId || '').trim();
        if (prevMatchId && prevMatchId !== matchId) return prev;
        const currentRoundNo = getPvpAnswerTargetRoundNo(prev.match, prevStatus);
        if (currentRoundNo !== roundNo) return prev;

        const myAnswer = safeRows.find((row) => String(row.user_id || '') === String(authUser?.uid || ''));
        const answerIdx = Number(myAnswer?.answer_idx ?? -1);
        const hasCommittedAnswer = !!myAnswer && Number.isFinite(answerIdx) && answerIdx >= 0;
        const toSig = (list) => (Array.isArray(list) ? list : [])
          .map((row) => {
            const uid = String(row?.user_id || '').trim();
            const idx = Number(row?.answer_idx ?? -1);
            const correct = String(row?.is_correct ?? '').trim().toLowerCase();
            const correctIdx = Number(row?.correct_answer_idx ?? -1);
            const at = Math.max(0, Number(row?.answered_at_ms || 0));
            return `${uid}:${idx}:${correct}:${correctIdx}:${at}`;
          })
          .sort()
          .join('|');
        const prevSig = toSig(prev.answers);
        const nextSig = toSig(safeRows);
        if (prevSig === nextSig && (prev.submitted || !hasCommittedAnswer)) return prev;

        return {
          ...prev,
          answers: safeRows,
          submitted: prev.submitted || hasCommittedAnswer,
          selectedIndex: hasCommittedAnswer ? answerIdx : prev.selectedIndex
        };
      });
    };

    syncAnswersFallback().catch(() => null);
    const timer = setInterval(() => syncAnswersFallback().catch(() => null), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.round_no, pvpState.match?.result_round_no, pvpState.matchId, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'pending_accept') return;
    const match = pvpState.match;
    const currentUserId = String(authUser?.uid || '').trim();
    if (!currentUserId || !match?.id) return;
    if (String(match.status || '').trim().toLowerCase() !== 'pending_accept') return;
    if (matchAcceptBusy) return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || humanUserId !== currentUserId) return;

    const botIsPlayer1 = String(match.player1_user_id || '').trim() === botUserId;
    const botState = String(botIsPlayer1 ? match.player1_accept_state : match.player2_accept_state || 'pending')
      .trim()
      .toLowerCase();
    if (botState !== 'pending') return;

    const decisionAtMs = Math.max(0, Number(match.bot_decision_at_ms || 0));
    const transitionMatchId = String(pvpMatchFoundTransition.matchId || '').trim();
    const localTransitionReadyAtMs = transitionMatchId === String(match.id || '').trim()
      ? Math.max(
        0,
        Number(pvpMatchFoundTransition.visibleUntilMs || 0) + PVP_BOT_DECISION_POST_TRANSITION_BUFFER_MS
      )
      : 0;
    const effectiveDecisionAtMs = Math.max(decisionAtMs, localTransitionReadyAtMs);
    if (!effectiveDecisionAtMs || pvpClockMs < effectiveDecisionAtMs) return;
    if (String(match.bot_decision_done || '').trim().toLowerCase() === 'true') return;

    const forcedRejectRaw = String(match.bot_will_reject || '').trim().toLowerCase();
    const willReject = forcedRejectRaw === 'true'
      ? true
      : (forcedRejectRaw === 'false' ? false : (Math.random() < 0.6));
    const nowMs = Date.now();
    const patch = {
      bot_decision_done: 'true'
    };

    if (willReject) {
      if (botIsPlayer1) patch.player1_accept_state = 'rejected';
      else patch.player2_accept_state = 'rejected';
      patch.reject_at_ms = nowMs;
      patch.bot_user_queue_rotated = false;
      updatePvpMatch(match.id, patch).catch(() => null);
      clearBotBusy(botUserId, match.id).catch(() => null);
      return;
    }

    if (botIsPlayer1) patch.player1_accept_state = 'accepted';
    else patch.player2_accept_state = 'accepted';

    const p1State = String(
      botIsPlayer1 ? 'accepted' : (match.player1_accept_state || 'pending')
    ).trim().toLowerCase();
    const p2State = String(
      botIsPlayer1 ? (match.player2_accept_state || 'pending') : 'accepted'
    ).trim().toLowerCase();
    if (p1State === 'accepted' && p2State === 'accepted' && !Number(match.start_countdown_ms || 0)) {
      patch.start_countdown_ms = nowMs + PVP_MATCH_START_DELAY_MS;
      patch.both_accepted_at_ms = nowMs;
      patch.accept_deadline_ms = 0;
    }

    updatePvpMatch(match.id, patch).catch(() => null);
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.updated_at,
    pvpClockMs,
    authUser?.uid,
    matchAcceptBusy,
    pvpMatchFoundTransition.matchId,
    pvpMatchFoundTransition.visibleUntilMs
  ]);

  useEffect(() => {
    if (pvpState.status !== 'pending_accept') return;
    const match = pvpState.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (String(match.status || '').trim().toLowerCase() !== 'pending_accept') return;
    if (matchAcceptBusy) return;

    const player1Id = String(match.player1_user_id || '').trim();
    const player2Id = String(match.player2_user_id || '').trim();
    const p1State = String(match.player1_accept_state || 'pending').trim().toLowerCase();
    const p2State = String(match.player2_accept_state || 'pending').trim().toLowerCase();
    const nowMs = Date.now();

    if (p1State === 'rejected' || p2State === 'rejected') {
      const rejectAt = Math.max(0, Number(match.reject_at_ms || nowMs));
      if (nowMs >= rejectAt + PVP_MATCH_REJECT_RESOLVE_DELAY_MS) {
        const endedByUserId = p1State === 'rejected' ? player1Id : player2Id;
        const endedAtIso = nowIso();
        updatePvpMatch(match.id, {
          status: 'finished',
          ended_reason: 'match_refused',
          ended_by_user_id: endedByUserId,
          ended_at: endedAtIso,
          winner_user_id: null
        }).then((updatedMatch) => {
          syncQueueStateAfterMatchRefusal(
            updatedMatch || {
              ...match,
              status: 'finished',
              ended_reason: 'match_refused',
              ended_by_user_id: endedByUserId,
              ended_at: endedAtIso,
              winner_user_id: null
            },
            'match_refused'
          ).catch(() => null);
        }).catch(() => null);
      }
      return;
    }

    const bothAccepted = p1State === 'accepted' && p2State === 'accepted';
    if (bothAccepted) {
      const startCountdownMs = Math.max(0, Number(match.start_countdown_ms || 0));
      if (!startCountdownMs) {
        updatePvpMatch(match.id, {
          start_countdown_ms: nowMs + PVP_MATCH_START_DELAY_MS,
          both_accepted_at_ms: nowMs,
          accept_deadline_ms: 0
        }).catch(() => null);
        return;
      }
      if (nowMs >= startCountdownMs) {
        updatePvpMatch(match.id, {
          status: 'active',
          round_no: Math.max(1, Number(match.round_no || 1)),
          round_started_at_ms: nowMs,
          round_started_at: nowIso(),
          ended_reason: null,
          reject_at_ms: 0,
          start_countdown_ms: 0
        }).catch(() => null);
      }
      return;
    }

    const acceptDeadlineMs = Math.max(0, Number(match.accept_deadline_ms || 0));
    const isHost = String(match.host_user_id || match.player1_user_id || '').trim() === userId;
    if (isHost && acceptDeadlineMs > 0 && nowMs >= acceptDeadlineMs) {
      const endedAtIso = nowIso();
      updatePvpMatch(match.id, {
        status: 'finished',
        ended_reason: 'accept_timeout',
        ended_at: endedAtIso,
        winner_user_id: null
      }).then((updatedMatch) => {
        syncQueueStateAfterMatchRefusal(
          updatedMatch || {
            ...match,
            status: 'finished',
            ended_reason: 'accept_timeout',
            ended_at: endedAtIso,
            winner_user_id: null
          },
          'accept_timeout'
        ).catch(() => null);
      }).catch(() => null);
    }
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.updated_at, pvpClockMs, authUser?.uid, matchAcceptBusy]);

  useEffect(() => {
    if (pvpState.status !== 'round_result') return;
    const match = pvpState.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (String(match.status || '').trim().toLowerCase() !== 'round_result') return;

    const nextRoundNo = Math.max(1, Number(match.next_round_no || (Number(match.round_no || 1) + 1)));
    const roundUntilMs = Math.max(0, Number(match.round_result_until_ms || 0));
    if (!roundUntilMs) {
      updatePvpMatch(match.id, {
        round_result_until_ms: Date.now() + PVP_ROUND_RESULT_DURATION_MS
      }).catch(() => null);
      return;
    }
    if (pvpClockMs < roundUntilMs) return;

    updatePvpMatch(match.id, {
      status: 'active',
      round_no: nextRoundNo,
      round_started_at_ms: Date.now(),
      round_started_at: nowIso(),
      result_round_no: null,
      result_round_correct_answer_idx: null,
      result_round_winner_user_id: null,
      next_round_no: null,
      round_result_until_ms: null
    }).catch(() => null);
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.updated_at, pvpClockMs, authUser?.uid]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    if (safeStatus !== 'active' && safeStatus !== 'round_result') return;

    const match = pvpState.match;
    const matchId = String(match?.id || pvpState.matchId || '').trim();
    const roundNo = getPvpAnswerTargetRoundNo(match, safeStatus);
    if (!matchId) return;

    const unsubscribe = subscribeRoundAnswers(
      matchId,
      roundNo,
      (rows) => {
        pvpRealtimeAnswersUpdateAtRef.current = Date.now();
        const safeRows = getPvpRoundAnswersForRound(rows, roundNo);
        setPvpState((prev) => {
          const prevStatus = String(prev.status || '').trim().toLowerCase();
          if (prevStatus !== 'active' && prevStatus !== 'round_result') return prev;
          const prevMatchId = String(prev.match?.id || prev.matchId || '').trim();
          if (prevMatchId && prevMatchId !== matchId) return prev;
          const currentRoundNo = getPvpAnswerTargetRoundNo(prev.match, prevStatus);
          if (currentRoundNo !== roundNo) return prev;
          const myAnswer = safeRows.find((row) => String(row.user_id || '') === String(authUser?.uid || ''));
          const answerIdx = Number(myAnswer?.answer_idx ?? -1);
          const hasCommittedAnswer = !!myAnswer && Number.isFinite(answerIdx) && answerIdx >= 0;
          return {
            ...prev,
            answers: safeRows,
            submitted: prev.submitted || hasCommittedAnswer,
            selectedIndex: hasCommittedAnswer ? answerIdx : prev.selectedIndex
          };
        });
      },
      (error) => {
        console.error('answers subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.round_no, pvpState.match?.result_round_no, pvpState.matchId, authUser?.uid]);

  useEffect(() => {
    const match = pvpState.match;
    const status = String(match?.status || '').trim().toLowerCase();
    if (pvpState.status !== 'active' || status !== 'active') {
      clearBotAnswerTimer();
      return;
    }
    if (!match?.id || !authUser?.uid) return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) {
      clearBotAnswerTimer();
      return;
    }

    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || String(authUser.uid) !== humanUserId) return;

    const roundNo = Math.max(1, Number(match.round_no || 1));
    const question = match.question_set?.[roundNo - 1];
    if (!question) return;

    const liveAnswersBeforeSchedule = Array.isArray(pvpStateRef.current?.answers)
      ? pvpStateRef.current.answers
      : [];
    const botAlreadyAnswered = liveAnswersBeforeSchedule.some((row) => String(row.user_id || '') === botUserId);
    if (botAlreadyAnswered) {
      clearBotAnswerTimer();
      return;
    }

    const roundKey = `${match.id}_${roundNo}`;
    if (botAnswerRoundKeyRef.current === roundKey && botAnswerTimerRef.current) return;

    clearBotAnswerTimer();
    botAnswerRoundKeyRef.current = roundKey;

    const botStrength = getBotStrengthFromMatchRow(match, botUserId);
    const matchDifficulty = normalizeDifficulty(match.difficulty || match.category || 'easy');
    const totalRounds = Math.max(1, Number(match.total_rounds || PVP_ROUNDS_PER_MATCH));
    const player1Id = String(match.player1_user_id || '').trim();
    const botIsPlayer1 = player1Id === botUserId;
    const botScore = Math.max(0, Number(botIsPlayer1 ? match.player1_score : match.player2_score));
    const opponentScore = Math.max(0, Number(botIsPlayer1 ? match.player2_score : match.player1_score));
    const roundStartedAtMs = Math.max(
      0,
      Number(match.round_started_at_ms || toMillis(match.round_started_at) || 0)
    );
    const elapsedSinceRoundStartMs = roundStartedAtMs > 0
      ? Math.max(0, Date.now() - roundStartedAtMs)
      : 0;
    const plannedDelayMs = getBotAnswerDelayMs();
    const answerDelay = Math.max(90, plannedDelayMs - elapsedSinceRoundStartMs);

    botAnswerTimerRef.current = window.setTimeout(async () => {
      try {
        const live = pvpStateRef.current;
        const liveMatch = live?.match;
        const liveStatus = String(live?.status || '').trim().toLowerCase();
        const liveRoundNo = Math.max(1, Number(liveMatch?.round_no || 1));
        const liveMatchId = String(liveMatch?.id || live?.matchId || '').trim();
        if (liveStatus !== 'active' || liveRoundNo !== roundNo || liveMatchId !== String(match.id)) return;
        const liveAnswers = Array.isArray(live?.answers) ? live.answers : [];
        const hasBotAnswer = liveAnswers.some((row) => String(row.user_id || '') === botUserId);
        if (hasBotAnswer) return;

        const pickedIndex = pickBotAnswerIndex(question, botStrength, {
          matchId: String(match.id),
          botUserId,
          difficulty: matchDifficulty,
          roundNo,
          totalRounds,
          botScore,
          opponentScore
        });
        const nowMs = Date.now();
        const correctIndex = Number(question.answer ?? -1);

        await upsertPvpAnswer({
          match_id: String(match.id),
          round_no: roundNo,
          user_id: botUserId,
          answer_idx: pickedIndex,
          is_correct: pickedIndex >= 0 && pickedIndex === correctIndex,
          correct_answer_idx: correctIndex,
          answered_at_ms: nowMs,
          answered_at: new Date(nowMs).toISOString(),
          created_at: new Date(nowMs).toISOString()
        }).catch(() => null);
      } finally {
        if (botAnswerRoundKeyRef.current === roundKey) {
          botAnswerTimerRef.current = null;
        }
      }
    }, answerDelay);

    return () => {
      if (botAnswerRoundKeyRef.current !== roundKey) return;
      clearBotAnswerTimer();
    };
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.round_no,
    pvpState.match?.status,
    authUser?.uid
  ]);

  // Canal de emojis do duelo: uma assinatura só durante toda a partida (rodada e
  // resultado da rodada), sem reabrir a cada troca de fase.
  const pvpDuelEmojiStatus = String(pvpState.status || '').toLowerCase();
  const pvpDuelEmojiChannelOpen = pvpDuelEmojiStatus === 'active' || pvpDuelEmojiStatus === 'round_result';
  useEffect(() => {
    if (!pvpDuelEmojiChannelOpen) return;
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (!matchId) return;

    const unsubscribe = subscribePvpEmojiEvents(
      matchId,
      (events) => {
        takeNewPvpEmojiEvents(`duel:${matchId}`, events).forEach((event) => {
          addPvpEmojiFxFromEvent(event);
        });
      },
      (error) => {
        console.error('emoji events subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pvpDuelEmojiChannelOpen, pvpState.match?.id, pvpState.matchId]);

  useEffect(() => {
    const match = pvpState.match;
    const status = String(pvpState.status || '').toLowerCase();
    if (status !== 'active' && status !== 'round_result') return;
    if (!match?.id) return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || String(authUser?.uid || '').trim() !== humanUserId) return;

    const event = latestPvpEmojiEvent;
    const eventId = String(event?.id || '').trim();
    if (!eventId || botReactionUserEmojiEventRef.current === eventId) return;
    const senderId = String(event?.sender_user_id || '').trim();
    if (!senderId || senderId === botUserId) return;
    botReactionUserEmojiEventRef.current = eventId;

    queueBotEmojiBurst({
      matchId: String(match.id),
      botUserId,
      personality: normalizeBotPersonality(match.bot_personality || BOT_CONFIG_DEFAULT.personality),
      countMin: 1,
      countMax: 2,
      intervalMinMs: 1000,
      intervalMaxMs: 2000,
      initialDelayMs: 1000 + Math.floor(Math.random() * 900)
    });
  }, [pvpState.status, pvpState.match?.id, latestPvpEmojiEvent?.id, authUser?.uid]);

  useEffect(() => {
    const match = pvpState.match;
    if (String(pvpState.status || '').toLowerCase() !== 'active') return;
    if (!match?.id) return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || String(authUser?.uid || '').trim() !== humanUserId) return;

    const roundNo = Math.max(1, Number(match.round_no || 1));
    const roundKey = `${match.id}_first_${roundNo}`;
    if (botReactionFirstAnswerRef.current === roundKey) return;

    const roundAnswers = getPvpRoundAnswersForRound(pvpState.answers, roundNo);
    const answersByUser = new Map(roundAnswers.map((row) => [String(row.user_id || ''), row]));
    const botAnswer = answersByUser.get(botUserId);
    const userAnswer = answersByUser.get(humanUserId);
    if (!botAnswer || !userAnswer) return;

    const botAnsweredAt = Math.max(0, Number(botAnswer.answered_at_ms || 0));
    const userAnsweredAt = Math.max(0, Number(userAnswer.answered_at_ms || 0));
    if (!botAnsweredAt || !userAnsweredAt || botAnsweredAt >= userAnsweredAt) return;

    botReactionFirstAnswerRef.current = roundKey;
    queueBotEmojiBurst({
      matchId: String(match.id),
      botUserId,
      personality: normalizeBotPersonality(match.bot_personality || BOT_CONFIG_DEFAULT.personality),
      countMin: 1,
      countMax: 2,
      intervalMinMs: 1000,
      intervalMaxMs: 2000,
      initialDelayMs: 1000 + Math.floor(Math.random() * 1000)
    });
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.round_no, pvpState.answers, authUser?.uid]);

  useEffect(() => {
    const match = pvpState.match;
    if (String(pvpState.status || '').toLowerCase() !== 'round_result') return;
    if (!match?.id) return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || String(authUser?.uid || '').trim() !== humanUserId) return;

    const resultRoundNo = Math.max(1, Number(match.result_round_no || match.round_no || 1));
    const roundKey = `${match.id}_result_${resultRoundNo}`;
    if (botReactionRoundResultRef.current === roundKey) return;
    botReactionRoundResultRef.current = roundKey;

    const resultRoundAnswers = getPvpRoundAnswersForRound(pvpState.answers, resultRoundNo);
    const correctIndex = resolvePvpCorrectIndex(
      resultRoundAnswers,
      Number(match?.result_round_correct_answer_idx ?? match?.question_set?.[resultRoundNo - 1]?.answer ?? -1)
    );
    const answersByUser = new Map(resultRoundAnswers.map((row) => [String(row.user_id || ''), row]));
    const userAnswer = answersByUser.get(humanUserId);
    const userWrong = !userAnswer || !isPvpAnswerCorrect(userAnswer, correctIndex);

    queueBotEmojiBurst({
      matchId: String(match.id),
      botUserId,
      personality: normalizeBotPersonality(match.bot_personality || BOT_CONFIG_DEFAULT.personality),
      countMin: userWrong ? 2 : 1,
      countMax: userWrong ? 3 : 2,
      intervalMinMs: 1000,
      intervalMaxMs: 3000,
      initialDelayMs: 1000 + Math.floor(Math.random() * 1800)
    });
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.result_round_no, pvpState.answers, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;
    if (!pvpMatch) return;
    if (String(pvpMatch.status || '') !== 'active') return;
    if (pvpState.submitted) return;
    if (pvpRoundRemainingMs > 0) return;
    submitPvpAnswer(-1);
  }, [pvpState.status, pvpState.submitted, pvpRoundRemainingMs, pvpMatch?.status, pvpRoundNo]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;
    if (!authUser?.uid) return;
    const match = pvpState.match;
    if (!match || String(match.status || '') !== 'active') return;

    const roundNo = Math.max(1, Number(match.round_no || 1));
    const timedOut = pvpRoundRemainingMs <= 0;

    // Check if both players have already answered this round.
    const player1Id = String(match.player1_user_id || '');
    const player2Id = String(match.player2_user_id || '');
    const answersByUser = new Map(
      (pvpState.answers || []).map((row) => [String(row.user_id || ''), row])
    );
    const bothAnswered = player1Id && player2Id
      && answersByUser.has(player1Id)
      && answersByUser.has(player2Id);

    // Finalize when the timer expires OR when both players have answered.
    if (!timedOut && !bothAnswered) return;
    finalizePvpRound(roundNo);
  }, [pvpState.status, pvpState.match, pvpState.answers, pvpRoundRemainingMs, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;
    const match = pvpState.match;
    if (!match?.id || String(match.status || '').trim().toLowerCase() !== 'active') return;

    const roundNo = Math.max(1, Number(match.round_no || 1));
    const recoveryKey = `${match.id}_${roundNo}`;
    const nowMs = Date.now();
    const staleThresholdMs = pvpRoundDuration + 2400;
    if (pvpRoundElapsedMs <= staleThresholdMs) return;

    const previous = pvpForcedFinalizeRef.current && typeof pvpForcedFinalizeRef.current === 'object'
      ? pvpForcedFinalizeRef.current
      : { key: '', lastAtMs: 0 };
    if (previous.key === recoveryKey && (nowMs - Math.max(0, Number(previous.lastAtMs || 0))) < 2400) return;
    pvpForcedFinalizeRef.current = { key: recoveryKey, lastAtMs: nowMs };

    if (!pvpState.submitted) {
      submitPvpAnswer(-1).catch(() => null);
    }
    finalizePvpRound(roundNo).catch(() => null);
  }, [
    pvpState.status,
    pvpState.match,
    pvpState.submitted,
    pvpRoundElapsedMs,
    pvpRoundDuration
  ]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (safeStatus !== 'active' || !matchId) {
      pvpTimerSfxRef.current = {
        roundKey: '',
        warningPlayed: false,
        criticalPlayed: false,
        timeoutPlayed: false,
        tickSecond: -1
      };
      return;
    }

    const roundNo = Math.max(1, Number(pvpState.match?.round_no || 1));
    const roundKey = `${matchId}_${roundNo}`;
    if (pvpTimerSfxRef.current.roundKey !== roundKey) {
      pvpTimerSfxRef.current = {
        roundKey,
        warningPlayed: false,
        criticalPlayed: false,
        timeoutPlayed: false,
        tickSecond: -1
      };
    }

    if (pvpState.submitted) return;

    const remainingSec = Math.max(0, Number(pvpRoundRemainingSec || 0));
    if (remainingSec <= 10 && remainingSec > 5 && !pvpTimerSfxRef.current.warningPlayed) {
      pvpTimerSfxRef.current.warningPlayed = true;
      playSfx('pvp_time_warning');
    }
    if (remainingSec <= 5 && remainingSec > 0) {
      if (!pvpTimerSfxRef.current.criticalPlayed) {
        pvpTimerSfxRef.current.criticalPlayed = true;
        playSfx('pvp_time_critical');
      }
      if (pvpTimerSfxRef.current.tickSecond !== remainingSec) {
        pvpTimerSfxRef.current.tickSecond = remainingSec;
        playSfx('pvp_tick');
      }
    }
    if (remainingSec <= 0 && !pvpTimerSfxRef.current.timeoutPlayed) {
      pvpTimerSfxRef.current.timeoutPlayed = true;
      playSfx('pvp_timeout');
    }
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.round_no,
    pvpState.submitted,
    pvpState.matchId,
    pvpRoundRemainingSec
  ]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (safeStatus !== 'active' || !matchId) {
      if (safeStatus !== 'round_result') pvpRoundPhaseSfxKeyRef.current = '';
      return;
    }

    const roundNo = Math.max(1, Number(pvpState.match?.round_no || 1));
    const phase = roundNo > pvpBaseFinalRoundNo
      ? 'elimination'
      : (roundNo === pvpBaseFinalRoundNo ? 'final' : '');
    if (!phase) return;

    const phaseKey = `${matchId}_${roundNo}_${phase}`;
    if (pvpRoundPhaseSfxKeyRef.current === phaseKey) return;
    pvpRoundPhaseSfxKeyRef.current = phaseKey;
    playSfx(phase === 'elimination' ? 'pvp_round_elimination' : 'pvp_round_final');
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.round_no,
    pvpState.matchId,
    pvpBaseFinalRoundNo
  ]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (safeStatus !== 'round_result' || !matchId) {
      if (safeStatus !== 'active') pvpRoundResultSfxKeyRef.current = '';
      return;
    }
    const roundNo = Math.max(1, Number(pvpState.match?.result_round_no || pvpState.match?.round_no || 1));
    const cueKey = `${matchId}_${roundNo}`;
    if (pvpRoundResultSfxKeyRef.current === cueKey) return;
    pvpRoundResultSfxKeyRef.current = cueKey;
    playSfx('pvp_round_result');
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.result_round_no,
    pvpState.match?.round_no,
    pvpState.matchId
  ]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;
    const match = pvpState.match;
    const currentUserId = String(authUser?.uid || '').trim();
    if (!currentUserId || !match?.id) return;
    if (String(match.status || '').trim().toLowerCase() !== 'active') return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || humanUserId !== currentUserId) return;
    if (String(match.bot_forfeit_roll_done || '').trim().toLowerCase() === 'true') return;

    const botIsPlayer1 = String(match.player1_user_id || '').trim() === botUserId;
    const botScore = Math.max(0, Number(botIsPlayer1 ? match.player1_score : match.player2_score));
    const userScore = Math.max(0, Number(botIsPlayer1 ? match.player2_score : match.player1_score));
    const shouldCheckForfeit = userScore >= 4 && botScore >= 1 && botScore <= 2 && userScore > botScore;
    if (!shouldCheckForfeit) return;

    const nowMs = Date.now();
    const shouldForfeit = Math.random() < 0.8;
    if (!shouldForfeit) {
      updatePvpMatch(match.id, {
        bot_forfeit_roll_done: 'true',
        bot_forfeit_checked_at_ms: nowMs
      }).catch(() => null);
      return;
    }

    updatePvpMatch(match.id, {
      status: 'finished',
      winner_user_id: humanUserId,
      ended_reason: 'forfeit',
      ended_by_user_id: botUserId,
      forfeit_by_user_id: botUserId,
      ended_round_no: Math.max(1, Number(match.round_no || 1)),
      ended_at: nowIso(),
      bot_forfeit_roll_done: 'true',
      bot_forfeit_checked_at_ms: nowMs
    }).catch(() => null);
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.updated_at, authUser?.uid]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    if (safeStatus !== 'round_result') {
      clearPvpRoundResultFeedbackTimer(false);
      return;
    }
    const match = pvpState.match;
    const matchId = String(match?.id || '').trim();
    if (!matchId) return;
    const resultRoundNo = Math.max(1, Number(match?.result_round_no || match?.round_no || 1));
    const player1Id = String(match?.player1_user_id || '').trim();
    const player2Id = String(match?.player2_user_id || '').trim();
    const resultRoundAnswers = getPvpRoundAnswersForRound(pvpState.answers, resultRoundNo);
    const correctIndex = resolvePvpCorrectIndex(
      resultRoundAnswers,
      Number(match?.result_round_correct_answer_idx ?? match?.question_set?.[resultRoundNo - 1]?.answer ?? -1)
    );
    const answersByUser = new Map(resultRoundAnswers.map((row) => [String(row.user_id || ''), row]));
    if (!player1Id || !player2Id) return;
    if (!answersByUser.has(player1Id) || !answersByUser.has(player2Id)) return;
    const feedbackKey = `${matchId}_${resultRoundNo}`;
    if (pvpRoundResultFeedbackKeyRef.current === feedbackKey) return;
    pvpRoundResultFeedbackKeyRef.current = feedbackKey;
    clearPvpRoundResultFeedbackTimer(false);
    const player1Feedback = getPvpRoundAnswerFeedback(answersByUser.get(player1Id), correctIndex);
    const player2Feedback = getPvpRoundAnswerFeedback(answersByUser.get(player2Id), correctIndex);
    const currentUserId = String(authUser?.uid || '').trim();
    const amPlayer1 = currentUserId && currentUserId === player1Id;
    const myFeedback = amPlayer1 ? player1Feedback : player2Feedback;
    const opponentFeedback = amPlayer1 ? player2Feedback : player1Feedback;

    playSfx(myFeedback.isCorrect ? 'pvp_correct' : 'pvp_wrong');
    if (typeof window !== 'undefined') {
      pvpRoundResultFeedbackTimerRef.current = window.setTimeout(() => {
        playSfx(opponentFeedback.isCorrect ? 'pvp_correct' : 'pvp_wrong');
        pvpRoundResultFeedbackTimerRef.current = null;
      }, 240);
    }
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.result_round_no,
    pvpState.match?.updated_at,
    pvpState.answers,
    authUser?.uid
  ]);

  useEffect(() => {
    if (screen !== 'pvp-result') {
      clearPvpResultAudioTimers(true);
      return;
    }

    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (!matchId) return;
    const transitionActive = pvpResultTransitionMode === 'opponent_left' && !pvpCompensation;

    if (transitionActive) {
      const cueKey = `transition_${matchId}`;
      if (pvpResultAudioKeyRef.current === cueKey) return;
      clearPvpResultAudioTimers(false);
      pvpResultAudioKeyRef.current = cueKey;
      playSfx('pvp_transition');
      if (typeof window !== 'undefined') {
        const tensionTimer = window.setTimeout(() => {
          playSfx('pvp_time_critical');
        }, 460);
        pvpResultAudioTimersRef.current = [tensionTimer];
      }
      return;
    }

    if (pvpCompensation) {
      const compensationKey = String(pvpCompensation?.matchId || matchId).trim();
      const cueKey = `comp_${compensationKey}`;
      if (pvpResultAudioKeyRef.current === cueKey) return;
      clearPvpResultAudioTimers(false);
      pvpResultAudioKeyRef.current = cueKey;
      playSfx('pvp_result_reveal');
      if (typeof window !== 'undefined') {
        const winTimer = window.setTimeout(() => {
          playSfx('pvp_result_win');
        }, 320);
        const rewardTimer = window.setTimeout(() => {
          playSfx('coin');
        }, 820);
        pvpResultAudioTimersRef.current = [winTimer, rewardTimer];
      }
      return;
    }

    const currentResult = getPvpResultForUser(pvpState.match, authUser?.uid || '');
    const cueKey = `result_${matchId}_${currentResult}`;
    if (pvpResultAudioKeyRef.current === cueKey) return;
    clearPvpResultAudioTimers(false);
    pvpResultAudioKeyRef.current = cueKey;
    playSfx('pvp_result_reveal');
    if (typeof window !== 'undefined') {
      const outcomeTimer = window.setTimeout(() => {
        if (currentResult === 'win') playSfx('pvp_result_win');
        else if (currentResult === 'draw') playSfx('pvp_result_draw');
        else playSfx('pvp_result_loss');
      }, 300);
      const accentTimer = window.setTimeout(() => {
        if (currentResult === 'win') playSfx('coin');
        else if (currentResult === 'draw') playSfx('notify');
        else playSfx('error');
      }, 760);
      pvpResultAudioTimersRef.current = [outcomeTimer, accentTimer];
    }
  }, [
    screen,
    pvpState.match?.id,
    pvpState.matchId,
    pvpState.match?.winner_user_id,
    pvpState.match?.ended_reason,
    authUser?.uid,
    pvpCompensation,
    pvpResultTransitionMode
  ]);

  useEffect(() => {
    const eliminationQueueing = String(pvpEliminationQueueState.status || '').trim().toLowerCase() === 'queueing';
    if (pvpState.status === 'queueing' || eliminationQueueing) setScreen('challenge');
  }, [pvpState.status, pvpEliminationQueueState.status]);

  useEffect(() => {
    if (selectedLanguage) return;
    if (!LANGUAGES.length) return;
    setSelectedLanguage(LANGUAGES[0].id);
  }, [selectedLanguage]);

  useEffect(() => {
    const nextIndex = getKnowledgeAreaIndex(selectedKnowledgeArea);
    if (nextIndex !== kaCarouselIndex) {
      setKaCarouselIndex(nextIndex);
    }
  }, [selectedKnowledgeArea]);

  useEffect(() => {
    const nextArea = resolveKnowledgeAreaByLanguageId(pvpConfig?.language || '');
    if (nextArea !== pvpKnowledgeArea) {
      setPvpKnowledgeArea(nextArea);
    }
    const nextIndex = getKnowledgeAreaIndex(nextArea);
    if (nextIndex !== arenaKaCarouselIndex) {
      setArenaKaCarouselIndex(nextIndex);
    }
  }, [pvpConfig?.language]);

  useEffect(() => {
    if (screen === 'quiz') return;
    if (quizMenuOpen) setQuizMenuOpen(false);
  }, [screen, quizMenuOpen]);

  useEffect(() => {
    if (!selectedLanguage) return;
    const normalizedLanguage = normalizeLegacyLanguageId(selectedLanguage, selectedTopic);
    if (normalizedLanguage && normalizedLanguage !== selectedLanguage) {
      setSelectedLanguage(normalizedLanguage);
      return;
    }
    const topics = getTopicsByLanguage(TOPICS, selectedLanguage);
    if (!topics.length) {
      if (selectedTopic) setSelectedTopic('');
      return;
    }
    if (!topics.some((topic) => topic.id === selectedTopic)) {
      setSelectedTopic(topics[0].id);
    }
  }, [selectedLanguage, selectedTopic]);

  const languageById = useMemo(
    () => new Map(LANGUAGES.map((language) => [language.id, language])),
    []
  );

  const getQuizProgressPctByRoundRule = (quizKey) => {
    const safeQuizKey = String(quizKey || '').trim();
    if (!safeQuizKey) return 0;
    const bestCorrectRaw = Number(progress.quizBestScores?.[safeQuizKey] || 0);
    if (Number.isFinite(bestCorrectRaw) && bestCorrectRaw > 0) {
      const normalizedCorrect = Math.max(0, Math.min(PVE_QUESTIONS_PER_ROUND, Math.trunc(bestCorrectRaw)));
      return Math.round((normalizedCorrect / Math.max(1, PVE_QUESTIONS_PER_ROUND)) * 100);
    }
    // Legacy fallback for accounts that only persisted percentage.
    return Math.max(0, Math.min(100, Number(progress.topicProgress?.[safeQuizKey] || 0)));
  };

  const getTopicProgressPct = (languageId, topicId) => {
    const topicPack = QUESTIONS?.[languageId]?.[topicId] && typeof QUESTIONS[languageId][topicId] === 'object'
      ? QUESTIONS[languageId][topicId]
      : {};
    let progressTotal = 0;
    let progressSlots = 0;

    ['easy', 'medium', 'hard'].forEach((difficulty) => {
      const pool = Array.isArray(topicPack[difficulty]) ? topicPack[difficulty] : [];
      if (!pool.length) return;
      const quizKey = getQuizKey(languageId, topicId, difficulty);
      let pct = getQuizProgressPctByRoundRule(quizKey);
      if (!pct) {
        const legacyQuizKey = getLegacyGeneralKnowledgeQuizKey(languageId, topicId, difficulty);
        if (legacyQuizKey) {
          pct = getQuizProgressPctByRoundRule(legacyQuizKey);
        }
      }
      progressTotal += pct;
      progressSlots += 1;
    });

    return progressSlots ? Math.round(progressTotal / progressSlots) : 0;
  };

  const languageProgress = useMemo(() => {
    const result = new Map();
    LANGUAGES.forEach((language) => {
      const topics = getTopicsByLanguage(TOPICS, language.id);
      if (!topics.length) {
        result.set(language.id, 0);
        return;
      }

      const topicAvg = topics.reduce((acc, topic) => {
        return acc + getTopicProgressPct(language.id, topic.id);
      }, 0);

      result.set(language.id, Math.round(topicAvg / topics.length));
    });
    return result;
  }, [progress.topicProgress, progress.quizBestScores]);

  const languageThemeSections = useMemo(() => {
    const used = new Set();
    const filteredGroups = LANGUAGE_THEME_GROUPS.filter(
      (group) => group.area === selectedKnowledgeArea
    );
    const sections = filteredGroups.map((group) => {
      const items = group.languages
        .map((id) => languageById.get(id))
        .filter(Boolean);
      items.forEach((item) => used.add(item.id));
      return { ...group, items };
    }).filter((section) => section.items.length > 0);

    const areaLanguageIds = new Set(
      filteredGroups.flatMap((g) => g.languages)
    );
    const remaining = LANGUAGES.filter(
      (language) => areaLanguageIds.has(language.id) && !used.has(language.id)
    );
    if (remaining.length) {
      sections.push({
        id: 'more',
        label: 'Outros temas',
        desc: 'Demais trilhas disponíveis no app.',
        items: remaining
      });
    }

    return sections;
  }, [languageById, selectedKnowledgeArea]);

  const topicProgress = useMemo(() => {
    const result = new Map();
    selectedTopics.forEach((topic) => {
      result.set(topic.id, getTopicProgressPct(selectedLanguage, topic.id));
    });
    return result;
  }, [selectedLanguage, selectedTopics, progress.topicProgress, progress.quizBestScores]);

  const topicQuestionCountByDifficulty = useMemo(() => {
    const result = new Map();
    selectedTopics.forEach((topic) => {
      const totalEasy = pickPveRoundQuestionsByTopicSequence(
        QUESTIONS,
        selectedLanguage,
        topic.id,
        'easy',
        PVE_QUESTIONS_PER_ROUND
      ).length;
      const totalMedium = pickPveRoundQuestionsByTopicSequence(
        QUESTIONS,
        selectedLanguage,
        topic.id,
        'medium',
        PVE_QUESTIONS_PER_ROUND
      ).length;
      const totalHard = pickPveRoundQuestionsByTopicSequence(
        QUESTIONS,
        selectedLanguage,
        topic.id,
        'hard',
        PVE_QUESTIONS_PER_ROUND
      ).length;
      result.set(topic.id, {
        easy: totalEasy > 0 ? PVE_QUESTIONS_PER_ROUND : 0,
        medium: totalMedium > 0 ? PVE_QUESTIONS_PER_ROUND : 0,
        hard: totalHard > 0 ? PVE_QUESTIONS_PER_ROUND : 0
      });
    });

    return result;
  }, [selectedLanguage, selectedTopics]);

  const selectedTopicQuestionCountByDifficulty = useMemo(() => {
    return topicQuestionCountByDifficulty.get(selectedTopic) || {
      easy: 0,
      medium: 0,
      hard: 0
    };
  }, [topicQuestionCountByDifficulty, selectedTopic]);

  const selectedTopicDifficultyProgress = useMemo(() => {
    const byDifficulty = {};
    ['easy', 'medium', 'hard'].forEach((difficulty) => {
      const quizKey = getQuizKey(selectedLanguage, selectedTopic, difficulty);
      const bestPct = getQuizProgressPctByRoundRule(quizKey);
      const bestCorrect = Math.max(0, Number(progress.quizBestScores?.[quizKey] || 0));
      const hasQuestionsForDifficulty = Math.max(0, Number(selectedTopicQuestionCountByDifficulty[difficulty] || 0)) > 0;
      byDifficulty[difficulty] = {
        pct: bestPct,
        bestCorrect,
        total: hasQuestionsForDifficulty ? PVE_QUESTIONS_PER_ROUND : 0
      };
    });
    return byDifficulty;
  }, [
    selectedLanguage,
    selectedTopic,
    progress.topicProgress,
    progress.quizBestScores,
    selectedTopicQuestionCountByDifficulty
  ]);

  const selectedLanguageMeta = languageById.get(selectedLanguage) || null;
  const selectedTopicMeta = selectedTopics.find((topic) => topic.id === selectedTopic) || null;
  const nicknameValidation = useMemo(
    () => validateNicknameInput(String(profileDraft.nickname || '').trim()),
    [profileDraft.nickname]
  );
  const currentProfileNickname = String(profile?.nickname || '').trim();
  const nicknameChanged = String(profileDraft.nickname || '').trim() !== currentProfileNickname;
  const nicknameHintClass = (
    nicknameAvailability.status === 'invalid' || nicknameAvailability.status === 'taken'
      ? 'error'
      : (nicknameAvailability.available ? 'success' : (nicknameAvailability.status === 'checking' ? 'checking' : ''))
  );
  const nicknameHintText = nicknameAvailability.message || NICKNAME_RULE_COPY;
  const nicknameCanSave = nicknameValidation.ok
    && nicknameAvailability.available
    && (nicknameChanged || onboardingRequired);
  const googleAccountName = String(activeAuthUser?.displayName || profile?.full_name || '').trim()
    || 'Conta Google conectada';
  const googleAccountEmail = String(activeAuthUser?.email || '').trim();
  const googleAccountAvatar = String(activeAuthUser?.photoURL || profile?.avatar || '').trim();
  const googleAccountInitial = String(
    googleAccountName.charAt(0)
    || googleAccountEmail.charAt(0)
    || 'G'
  ).toUpperCase();
  const evolutionPass = useMemo(() => buildEvolutionPassSnapshot(progress), [progress]);
  const evolutionPassStages = useMemo(
    () => (Array.isArray(evolutionPass?.stages) ? evolutionPass.stages : []),
    [evolutionPass]
  );
  const evolutionPassFocusedStage = useMemo(() => {
    if (!evolutionPassStages.length) return null;
    const safeStageId = String(passFocusedStageId || '').trim();
    return evolutionPassStages.find((stage) => String(stage?.id || '').trim() === safeStageId)
      || getEvolutionPassPreferredStage(evolutionPassStages);
  }, [evolutionPassStages, passFocusedStageId]);
  const evolutionPassFocusedStageIndex = useMemo(
    () => evolutionPassStages.findIndex(
      (stage) => String(stage?.id || '').trim() === String(evolutionPassFocusedStage?.id || '').trim()
    ),
    [evolutionPassFocusedStage, evolutionPassStages]
  );
  useEffect(() => {
    if (!evolutionPassStages.length) {
      if (passFocusedStageId) setPassFocusedStageId('');
      return;
    }
    const focusedExists = evolutionPassStages.some(
      (stage) => String(stage?.id || '').trim() === String(passFocusedStageId || '').trim()
    );
    if (focusedExists) return;
    const preferredStage = getEvolutionPassPreferredStage(evolutionPassStages);
    if (preferredStage?.id) {
      setPassFocusedStageId(preferredStage.id);
    }
  }, [evolutionPassStages, passFocusedStageId]);
  const knowledgeAreaById = useMemo(
    () => new Map(KNOWLEDGE_AREAS.map((area) => [area.id, area])),
    []
  );
  const playerHistoryFilterOptions = useMemo(() => ([
    { id: 'all', label: 'Todos' },
    { id: 'pvp', label: 'PvP' },
    { id: 'pve', label: 'PvE' }
  ]), []);
  const playerHistoryItems = useMemo(() => {
    const formatStamp = (value) => {
      const safeMs = Math.max(0, Number(value || 0));
      if (!safeMs) return '--';
      try {
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(safeMs));
      } catch {
        return new Date(safeMs).toLocaleString('pt-BR');
      }
    };

    const pvpItems = (Array.isArray(playerPvpHistoryRows) ? playerPvpHistoryRows : []).map((row) => {
      const safeUserId = String(authUser?.uid || '').trim();
      const player1Id = String(row?.player1_user_id || '').trim();
      const player2Id = String(row?.player2_user_id || '').trim();
      const player1Name = String(row?.player1_nickname || 'Jogador 1').trim() || 'Jogador 1';
      const player2Name = String(row?.player2_nickname || 'Jogador 2').trim() || 'Jogador 2';
      const difficultyKey = normalizeDifficulty(row?.difficulty || 'easy');
      const difficultyLabel = DIFFICULTY_LABELS[difficultyKey] || DIFFICULTY_LABELS.easy;
      const resultKey = getPvpResultForUser(row, safeUserId) === 'win' ? 'win' : 'loss';
      const resultLabel = resultKey === 'win' ? 'Vitória' : 'Derrota';
      const areaId = String(
        row?.knowledge_area
        || row?.pvp_sequence_area
        || resolveKnowledgeAreaByLanguageId(row?.language || '')
        || 'programming'
      ).trim();
      const areaName = knowledgeAreaById.get(areaId)?.name || 'PvP';
      const timestampMs = Math.max(0, Number(toMillis(row?.ended_at || row?.updated_at || row?.created_at) || 0));
      const player1Score = Math.max(0, Number(row?.player1_score || 0));
      const player2Score = Math.max(0, Number(row?.player2_score || 0));
      const resolvedWinnerId = String(row?.winner_user_id || resolveMatchWinner(row) || '').trim();
      const winnerSide = resolvedWinnerId === player1Id
        ? 'player1'
        : (resolvedWinnerId === player2Id ? 'player2' : (player1Score >= player2Score ? 'player1' : 'player2'));
      return {
        id: `pvp_${row?.id || timestampMs}`,
        type: 'pvp',
        title: `${player1Name} x ${player2Name}`,
        titleParts: {
          player1: player1Name,
          player2: player2Name,
          winnerSide
        },
        subtitle: `${DIFFICULTY_LABELS[normalizeDifficulty(row?.difficulty || 'easy')] || 'Fácil'} · ${areaName}`,
        resultLabel: '',
        resultTone: resultKey,
        timestampMs,
        timestampLabel: formatStamp(timestampMs),
        scoreLabel: `${player1Score} x ${player2Score}`,
        scoreParts: {
          player1: player1Score,
          player2: player2Score,
          winnerSide
        },
        metaChips: [
          {
            label: `Rodadas ${Math.max(1, Number(row?.total_rounds || row?.round_no || PVP_ROUNDS_PER_MATCH))}`,
            tone: 'rounds'
          },
          {
            label: resultLabel,
            tone: resultKey
          },
          {
            label: difficultyLabel,
            tone: `difficulty-${difficultyKey}`
          },
          {
            label: areaName,
            tone: 'area'
          }
        ]
      };
    });

    const pveItems = (Array.isArray(playerQuizHistoryEntries) ? playerQuizHistoryEntries : []).map((entry) => {
      const normalizedLanguageId = normalizeLegacyLanguageId(entry?.language || '', entry?.topic || '');
      const languageMeta = languageById.get(normalizedLanguageId) || null;
      const topicMeta = getTopicsByLanguage(TOPICS, normalizedLanguageId).find((topic) => (
        String(topic?.id || '').trim() === String(entry?.topic || '').trim()
      )) || null;
      const timestampMs = Math.max(0, Number(entry?.timestampMs || 0));
      const difficultyKey = normalizeDifficulty(entry?.difficulty || 'easy');
      const difficultyLabel = DIFFICULTY_LABELS[difficultyKey] || DIFFICULTY_LABELS.easy;
      return {
        id: String(entry?.id || `pve_${timestampMs}`).trim() || `pve_${timestampMs}`,
        type: 'pve',
        title: topicMeta?.name || 'Quiz concluído',
        subtitle: `${languageMeta?.name || normalizedLanguageId || 'Quiz'} · ${DIFFICULTY_LABELS[normalizeDifficulty(entry?.difficulty || 'easy')] || 'Fácil'}`,
        resultLabel: `${Math.max(0, Number(entry?.scorePct || 0))}%`,
        resultTone: 'score',
        timestampMs,
        timestampLabel: formatStamp(timestampMs),
        scoreLabel: `${Math.max(0, Number(entry?.correctCount || 0))}/${Math.max(1, Number(entry?.totalQuestions || 1))} acertos`,
        metaChips: [
          {
            label: difficultyLabel,
            tone: `difficulty-${difficultyKey}`
          },
          {
            label: `+${Math.max(0, Number(entry?.awardedXp || 0))} XP`,
            tone: 'xp'
          },
          {
            label: `+${Math.max(0, Number(entry?.awardedCoins || 0))} moedas`,
            tone: 'coins'
          }
        ]
      };
    });

    return [...pvpItems, ...pveItems]
      .filter((item) => playerHistoryFilter === 'all' || item.type === playerHistoryFilter)
      .sort((a, b) => Math.max(0, Number(b.timestampMs || 0)) - Math.max(0, Number(a.timestampMs || 0)));
  }, [authUser?.uid, knowledgeAreaById, languageById, playerHistoryFilter, playerPvpHistoryRows, playerQuizHistoryEntries]);
  const playerHistoryCountByType = useMemo(() => ({
    all: playerPvpHistoryRows.length + playerQuizHistoryEntries.length,
    pvp: playerPvpHistoryRows.length,
    pve: playerQuizHistoryEntries.length
  }), [playerPvpHistoryRows.length, playerQuizHistoryEntries.length]);
  const playerHistoryEmptyText = playerHistoryFilter === 'pvp'
    ? 'Nenhuma partida PvP encontrada ainda.'
    : (playerHistoryFilter === 'pve'
      ? 'Nenhum quiz PvE registrado ainda.'
      : 'Ainda não há partidas registradas neste perfil.');

  const pvpQueueElapsedMs = pvpState.queueJoinedAtMs > 0
    ? Math.max(0, pvpClockMs - Number(pvpState.queueJoinedAtMs || 0))
    : 0;
  const pvpQueueSec = Math.floor(pvpQueueElapsedMs / 1000);
  const pvpQueueTimeLabel = `${String(Math.floor(pvpQueueSec / 60)).padStart(2, '0')}:${String(
    pvpQueueSec % 60
  ).padStart(2, '0')}`;
  const pvpPlayer1Id = String(pvpMatch?.player1_user_id || '');
  const pvpPlayer2Id = String(pvpMatch?.player2_user_id || '');
  const pvpAnswerDisplayRoundNo = getPvpAnswerTargetRoundNo(pvpMatch, pvpState.status);
  const pvpVisibleAnswers = getPvpRoundAnswersForRound(pvpState.answers, pvpAnswerDisplayRoundNo);
  const pvpAnswersByUser = new Map(
    pvpVisibleAnswers.map((answer) => [String(answer.user_id || ''), answer])
  );
  const pvpHasPlayer1Answer = pvpAnswersByUser.has(pvpPlayer1Id);
  const pvpHasPlayer2Answer = pvpAnswersByUser.has(pvpPlayer2Id);
  const pvpWaitingOpponent = pvpState.submitted && !(pvpHasPlayer1Answer && pvpHasPlayer2Answer);
  const pvpTimerPctRaw = (pvpRoundRemainingMs / Math.max(1, pvpRoundDuration)) * 100;
  const pvpTimerPct = Number.isFinite(pvpTimerPctRaw)
    ? Math.max(0, Math.min(100, pvpTimerPctRaw))
    : 100;
  const pvpTimerClass = pvpTimerPct <= 18 ? 'danger' : pvpTimerPct <= 40 ? 'warning' : '';
  const pvpIsEliminationRound = pvpRoundNo > pvpBaseFinalRoundNo;
  const pvpIsFinalRound = pvpRoundNo === pvpBaseFinalRoundNo;
  const pvpRoundPhaseLabel = pvpIsEliminationRound
    ? 'Eliminatória'
    : (pvpIsFinalRound ? 'Rodada final' : '');
  const pvpIsRoundResult = String(pvpState.status || '') === 'round_result';
  const pvpRoundResultUntilMs = Math.max(0, Number(pvpMatch?.round_result_until_ms || 0));
  const pvpRoundResultRemainingSec = Math.max(0, Math.ceil((pvpRoundResultUntilMs - pvpClockMs) / 1000));
  const pvpRoundResultNo = Math.max(1, Number(pvpMatch?.result_round_no || pvpMatch?.round_no || 1));
  const pvpRoundResultIsElimination = pvpRoundResultNo > pvpBaseFinalRoundNo;
  const pvpRoundResultIsFinal = pvpRoundResultNo === pvpBaseFinalRoundNo;
  const pvpRoundResultKicker = pvpRoundResultIsElimination
    ? 'Resultado da rodada eliminatória'
    : (pvpRoundResultIsFinal ? 'Resultado da rodada final' : 'Resultado da rodada');
  const pvpRoundResultCountdownClass = pvpRoundResultRemainingSec <= 2 ? 'is-urgent' : '';
  const pvpRoundResultQuestion = pvpMatch?.question_set?.[pvpRoundResultNo - 1] || null;
  const pvpRoundResultAnswers = getPvpRoundAnswersForRound(pvpState.answers, pvpRoundResultNo);
  const pvpRoundResultCorrectIndex = resolvePvpCorrectIndex(
    pvpRoundResultAnswers,
    Number(pvpMatch?.result_round_correct_answer_idx ?? pvpRoundResultQuestion?.answer ?? -1)
  );
  const pvpRoundResultAnswersByUser = new Map(
    pvpRoundResultAnswers.map((answer) => [String(answer.user_id || ''), answer])
  );
  const pvpRoundPlayer1Feedback = getPvpRoundAnswerFeedback(
    pvpRoundResultAnswersByUser.get(pvpPlayer1Id),
    pvpRoundResultCorrectIndex
  );
  const pvpRoundPlayer2Feedback = getPvpRoundAnswerFeedback(
    pvpRoundResultAnswersByUser.get(pvpPlayer2Id),
    pvpRoundResultCorrectIndex
  );
  const pvpRoundResultWinnerId = String(pvpMatch?.result_round_winner_user_id || '').trim();
  const pvpRoundResultLabel = pvpRoundResultWinnerId
    ? (pvpRoundResultWinnerId === pvpPlayer1Id
      ? `${pvpMatch?.player1_nickname || 'Jogador 1'} venceu a rodada`
      : `${pvpMatch?.player2_nickname || 'Jogador 2'} venceu a rodada`)
    : 'Rodada empatada';
  const matchMyAcceptState = getMatchPlayerAcceptState(pvpMatch, authUser?.uid || '');
  const matchPlayer1AcceptState = getMatchPlayerAcceptState(pvpMatch, pvpPlayer1Id);
  const matchPlayer2AcceptState = getMatchPlayerAcceptState(pvpMatch, pvpPlayer2Id);
  const matchAcceptDeadlineMs = Math.max(0, Number(pvpMatch?.accept_deadline_ms || 0));
  const matchAcceptRemainingSec = Math.max(0, Math.ceil((matchAcceptDeadlineMs - pvpClockMs) / 1000));
  const matchStartCountdownMs = Math.max(0, Number(pvpMatch?.start_countdown_ms || 0));
  const matchStartRemainingSec = Math.max(0, Math.ceil((matchStartCountdownMs - pvpClockMs) / 1000));
  const matchBothAccepted = matchPlayer1AcceptState === 'accepted' && matchPlayer2AcceptState === 'accepted';
  const matchHasRejection = matchPlayer1AcceptState === 'rejected' || matchPlayer2AcceptState === 'rejected';
  const shouldShowAcceptActions = pvpState.status === 'pending_accept'
    && matchMyAcceptState === 'pending'
    && !matchBothAccepted
    && !matchHasRejection;

  const matchAcceptCountdownLabel = matchBothAccepted
    ? `Começando a partida em ${Math.max(0, matchStartRemainingSec)}s.`
    : matchHasRejection
      ? 'Confronto recusado.'
      : matchMyAcceptState === 'accepted'
        ? 'Aguardando oponente aceitar.'
        : `Tempo para aceitar: ${Math.max(0, matchAcceptRemainingSec)}s`;
  const matchOpponentName = String(
    (String(authUser?.uid || '').trim() === pvpPlayer1Id
      ? pvpMatch?.player2_nickname
      : pvpMatch?.player1_nickname) || 'Oponente'
  );
  const pendingAcceptMatchId = String(pvpState.matchId || pvpMatch?.id || '').trim();
  const showMatchFoundTransition = pvpState.status === 'pending_accept'
    && Boolean(pvpMatch)
    && pvpMatchFoundTransition.visible
    && pvpMatchFoundTransition.matchId === pendingAcceptMatchId;
  const pvpTeamRosterSource = (pvpTeamRoom && typeof pvpTeamRoom === 'object')
    ? pvpTeamRoom
    : (pvpTeamMatch && typeof pvpTeamMatch === 'object' ? pvpTeamMatch : null);
  const pvpTeamRoomHostUserId = getPvpTeamRoomHostUserId(pvpTeamRoom);
  const pvpTeamRoomReadyMemberIds = getPvpTeamRoomReadyMemberIds(pvpTeamRoom);
  const pvpTeamCurrentUserReady = isPvpTeamRoomMemberReady(pvpTeamRoom, authUser?.uid || '');
  const pvpTeamMySide = getPvpTeamUserSide(pvpTeamMatch || pvpTeamRoom, authUser?.uid || '');
  const pvpTeamBattleStatus = String(pvpTeamMatch?.status || '').trim().toLowerCase();
  const pvpTeamBattleNo = getPvpTeamMatchBattleNo(pvpTeamMatch, pvpTeamBattleStatus);
  const pvpTeamBattleEntry = getPvpTeamBattleEntry(pvpTeamMatch, pvpTeamBattleNo);
  const pvpTeamActivePair = getPvpTeamActivePairMembers(pvpTeamMatch, pvpTeamBattleNo);
  const pvpTeamQuestion = getPvpGroupBattleQuestion(pvpTeamMatch, pvpTeamBattleNo);
  // Mesmo relógio que o motor usa para fechar o confronto.
  const pvpTeamBattleTiming = getPvpGroupBattleTiming(pvpTeamMatch, PVP_GROUP_MODE_TEAM);
  const pvpTeamBattleDuration = pvpTeamBattleTiming.answerMs;
  const pvpTeamBattleRemainingMs = pvpTeamBattleTiming.startedAtMs > 0
    ? Math.max(0, Math.min(pvpTeamBattleDuration, pvpTeamBattleTiming.closesAtMs - pvpClockMs))
    : pvpTeamBattleDuration;
  const pvpTeamAnswerWindowOpen = pvpTeamBattleStatus === 'active' && pvpTeamBattleRemainingMs > 0;
  // Quem da dupla atual já respondeu (só o "respondeu", nunca a alternativa).
  const pvpTeamAnsweredUserIds = pvpTeamBattleStatus === 'active'
    ? getPvpTeamCurrentBattleAnswers(pvpTeamAnswers, pvpTeamBattleNo)
      .filter((row) => Number(row?.answer_idx ?? -1) >= 0)
      .map((row) => String(row?.user_id || '').trim())
      .filter(Boolean)
    : [];
  const pvpTeamLeftMemberIds = getPvpGroupMatchGoneIds(pvpTeamMatch, PVP_GROUP_MODE_TEAM);
  const pvpTeamBattleRemainingSec = Math.max(0, Math.ceil(pvpTeamBattleRemainingMs / 1000));
  const pvpTeamTimerPctRaw = (pvpTeamBattleRemainingMs / Math.max(1, pvpTeamBattleDuration)) * 100;
  const pvpTeamTimerPct = Number.isFinite(pvpTeamTimerPctRaw)
    ? Math.max(0, Math.min(100, pvpTeamTimerPctRaw))
    : 100;
  const pvpTeamTimerClass = pvpTeamTimerPct <= 18 ? 'danger' : pvpTeamTimerPct <= 40 ? 'warning' : '';
  const pvpTeamRedMembers = getPvpTeamMembersBySide(pvpTeamRosterSource, 'red');
  const pvpTeamBlueMembers = getPvpTeamMembersBySide(pvpTeamRosterSource, 'blue');
  const pvpTeamIsActivePlayer = String(authUser?.uid || '').trim() === String(pvpTeamActivePair?.red?.user_id || '').trim()
    || String(authUser?.uid || '').trim() === String(pvpTeamActivePair?.blue?.user_id || '').trim();
  const pvpTeamCurrentBattleLabel = getPvpTeamBattleDisplayLabel(pvpTeamBattleEntry);
  const pvpTeamCurrentPairLabel = `${pvpTeamActivePair?.red?.nickname || 'Vermelho'} x ${pvpTeamActivePair?.blue?.nickname || 'Azul'}`;
  const pvpTeamResultBattleNo = Math.max(1, Number(pvpTeamMatch?.result_battle_no || pvpTeamBattleNo || 1));
  const pvpTeamResultEntry = getPvpTeamBattleEntry(pvpTeamMatch, pvpTeamResultBattleNo);
  const pvpTeamResultPair = getPvpTeamActivePairMembers(pvpTeamMatch, pvpTeamResultBattleNo);
  const pvpTeamResultQuestion = getPvpGroupBattleQuestion(pvpTeamMatch, pvpTeamResultBattleNo);
  const pvpTeamResultAnswers = getPvpTeamCurrentBattleAnswers(pvpTeamAnswers, pvpTeamResultBattleNo);
  const pvpTeamResultAnswersByUser = new Map(
    pvpTeamResultAnswers.map((answer) => [String(answer?.user_id || '').trim(), answer])
  );
  const pvpTeamResultCorrectIndex = resolvePvpCorrectIndex(
    pvpTeamResultAnswers,
    Number(
      pvpTeamMatch?.result_battle_correct_answer_idx
      ?? pvpTeamResultQuestion?.answer
      ?? -1
    )
  );
  const pvpTeamRedFeedback = getPvpRoundAnswerFeedback(
    pvpTeamResultAnswersByUser.get(String(pvpTeamResultEntry?.red_user_id || '').trim()),
    pvpTeamResultCorrectIndex
  );
  const pvpTeamBlueFeedback = getPvpRoundAnswerFeedback(
    pvpTeamResultAnswersByUser.get(String(pvpTeamResultEntry?.blue_user_id || '').trim()),
    pvpTeamResultCorrectIndex
  );
  const pvpTeamRoundResultUntilMs = Math.max(0, Number(pvpTeamMatch?.round_result_until_ms || 0));
  const pvpTeamRoundResultRemainingSec = Math.max(0, Math.ceil((pvpTeamRoundResultUntilMs - pvpClockMs) / 1000));
  const pvpTeamRoundResultCountdownClass = pvpTeamRoundResultRemainingSec <= 2 ? 'is-urgent' : '';
  const pvpTeamRoundWinnerId = String(pvpTeamMatch?.result_battle_winner_user_id || '').trim();
  const pvpTeamRoundResultLabel = pvpTeamRoundWinnerId
    ? (
      pvpTeamRoundWinnerId === String(pvpTeamResultPair?.red?.user_id || '').trim()
        ? `${pvpTeamResultPair?.red?.nickname || 'Time Vermelho'} venceu o confronto`
        : `${pvpTeamResultPair?.blue?.nickname || 'Time Azul'} venceu o confronto`
    )
    : 'Confronto empatado';
  const pvpTeamRoomAreaMeta = knowledgeAreaById.get(
    String(pvpTeamRoom?.knowledge_area || pvpTeamMatch?.knowledge_area || pvpKnowledgeArea || '').trim()
  ) || null;
  const pvpTeamDraftAreaIndex = Math.max(0, Math.min(KNOWLEDGE_AREAS.length - 1, Number(arenaKaCarouselIndex || 0)));
  const pvpTeamDraftAreaMeta = KNOWLEDGE_AREAS[pvpTeamDraftAreaIndex]
    || knowledgeAreaById.get(String(pvpKnowledgeArea || '').trim())
    || KNOWLEDGE_AREAS[0]
    || null;
  const pvpTeamResultKey = pvpTeamResult || getPvpTeamResultForUser(pvpTeamMatch, authUser?.uid || '');
  const pvpTeamResultMatchId = String(pvpTeamMatch?.id || '').trim();
  const pvpTeamResultProcessed = pvpTeamMatch?.result_void === true
    || !!(pvpTeamResultMatchId && progress?.pvpProcessedMatches?.[pvpTeamResultMatchId]);
  const pvpEliminationMatchMembers = getPvpEliminationMembers(pvpEliminationMatch);
  const pvpEliminationRoomMembers = getPvpEliminationMembers(pvpEliminationRoom);
  const pvpEliminationMemberMap = new Map();
  const pvpEliminationMembers = [];
  [...pvpEliminationMatchMembers, ...pvpEliminationRoomMembers].forEach((member) => {
    const memberId = String(member?.user_id || '').trim();
    if (!memberId) return;
    const existing = pvpEliminationMemberMap.get(memberId) || null;
    if (!existing) {
      const safeMember = {
        ...member,
        user_id: memberId
      };
      pvpEliminationMemberMap.set(memberId, safeMember);
      pvpEliminationMembers.push(safeMember);
      return;
    }
    const mergedMember = {
      ...member,
      ...existing,
      user_id: memberId,
      nickname: String(existing?.nickname || '').trim() || String(member?.nickname || '').trim() || 'Jogador',
      avatar: String(existing?.avatar || '').trim() || String(member?.avatar || '').trim() || '\uD83D\uDE42'
    };
    pvpEliminationMemberMap.set(memberId, mergedMember);
    const index = pvpEliminationMembers.findIndex((entry) => String(entry?.user_id || '').trim() === memberId);
    if (index >= 0) {
      pvpEliminationMembers[index] = mergedMember;
    }
  });
  const pvpEliminationBattleStatus = String(pvpEliminationMatch?.status || '').trim().toLowerCase();
  const pvpEliminationMyUserId = String(authUser?.uid || '').trim();
  const pvpEliminationActiveMemberIds = getPvpEliminationActiveMemberIds(pvpEliminationMatch || pvpEliminationRoom);
  const pvpEliminationActivePair = getPvpEliminationActivePair(pvpEliminationMatch);
  const pvpEliminationPairUser1Id = String(pvpEliminationActivePair?.user1 || '').trim();
  const pvpEliminationPairUser2Id = String(pvpEliminationActivePair?.user2 || '').trim();
  const pvpEliminationPairUser1 = pvpEliminationMemberMap.get(pvpEliminationPairUser1Id) || null;
  const pvpEliminationPairUser2 = pvpEliminationMemberMap.get(pvpEliminationPairUser2Id) || null;
  const pvpEliminationPairUser1Label = String(pvpEliminationPairUser1?.nickname || '').trim() || 'Jogador';
  const pvpEliminationPairUser2Label = String(pvpEliminationPairUser2?.nickname || '').trim() || 'Jogador';
  const pvpEliminationPairUser1Shop = buildCosmeticSnapshot(
    pvpEliminationPairUser1?.equipped_frame,
    pvpEliminationPairUser1?.equipped_background,
    pvpEliminationPairUser1?.equipped_emoji
  );
  const pvpEliminationPairUser2Shop = buildCosmeticSnapshot(
    pvpEliminationPairUser2?.equipped_frame,
    pvpEliminationPairUser2?.equipped_background,
    pvpEliminationPairUser2?.equipped_emoji
  );
  const pvpEliminationPairUser1Avatar = getDisplayAvatar(pvpEliminationPairUser1?.avatar || '\uD83D\uDE42', pvpEliminationPairUser1Shop);
  const pvpEliminationPairUser2Avatar = getDisplayAvatar(pvpEliminationPairUser2?.avatar || '\uD83D\uDE42', pvpEliminationPairUser2Shop);
  const pvpEliminationPairUser1FrameStyle = getAvatarFrameStyle(pvpEliminationPairUser1Shop);
  const pvpEliminationPairUser2FrameStyle = getAvatarFrameStyle(pvpEliminationPairUser2Shop);
  const pvpEliminationPairUser1FrameClass = getAvatarFrameClass(pvpEliminationPairUser1Shop);
  const pvpEliminationPairUser2FrameClass = getAvatarFrameClass(pvpEliminationPairUser2Shop);
  const pvpEliminationIsActivePairMember = pvpEliminationMyUserId === pvpEliminationPairUser1Id
    || pvpEliminationMyUserId === pvpEliminationPairUser2Id;
  const pvpEliminationQuestion = getPvpGroupBattleQuestion(pvpEliminationMatch);
  const pvpEliminationBattleTiming = getPvpGroupBattleTiming(pvpEliminationMatch, PVP_GROUP_MODE_ELIMINATION);
  const pvpEliminationBattleDuration = pvpEliminationBattleTiming.answerMs;
  const pvpEliminationBattleStartedAtMs = pvpEliminationBattleTiming.startedAtMs;
  const pvpEliminationBattleElapsedMs = pvpEliminationBattleStartedAtMs > 0
    ? Math.max(0, pvpClockMs - pvpEliminationBattleStartedAtMs)
    : 0;
  const pvpEliminationShowBattleIntro = (pvpEliminationBattleStatus === 'active' || pvpEliminationBattleStatus === 'round_result')
    && pvpEliminationBattleStartedAtMs > 0
    && pvpEliminationBattleElapsedMs < PVP_ELIMINATION_BATTLE_INTRO_MS
    && !!pvpEliminationPairUser1Id
    && !!pvpEliminationPairUser2Id;
  // O tempo de resposta só começa a contar depois da apresentação do confronto.
  const pvpEliminationBattleRemainingMs = pvpEliminationBattleStartedAtMs > 0
    ? Math.max(0, Math.min(pvpEliminationBattleDuration, pvpEliminationBattleTiming.closesAtMs - pvpClockMs))
    : pvpEliminationBattleDuration;
  const pvpEliminationAnswerWindowOpen = pvpEliminationBattleStatus === 'active'
    && !pvpEliminationShowBattleIntro
    && pvpEliminationBattleRemainingMs > 0;
  const pvpEliminationTimerPctRaw = (pvpEliminationBattleRemainingMs / Math.max(1, pvpEliminationBattleDuration)) * 100;
  const pvpEliminationTimerPct = Number.isFinite(pvpEliminationTimerPctRaw)
    ? Math.max(0, Math.min(100, pvpEliminationTimerPctRaw))
    : 100;
  const pvpEliminationTimerClass = pvpEliminationTimerPct <= 18 ? 'danger' : pvpEliminationTimerPct <= 40 ? 'warning' : '';
  const pvpEliminationAnswersByUser = new Map(
    (Array.isArray(pvpEliminationAnswers) ? pvpEliminationAnswers : [])
      .map((answer) => [String(answer?.user_id || '').trim(), answer])
  );
  const pvpEliminationHasPairUser1Answer = pvpEliminationAnswersByUser.has(pvpEliminationPairUser1Id);
  const pvpEliminationHasPairUser2Answer = pvpEliminationAnswersByUser.has(pvpEliminationPairUser2Id);
  const pvpEliminationWaitingPairAnswer = pvpEliminationSubmitted
    && pvpEliminationIsActivePairMember
    && !(pvpEliminationHasPairUser1Answer && pvpEliminationHasPairUser2Answer);
  const pvpEliminationRoundLabel = getPvpEliminationRoundLabel(pvpEliminationMatch);
  const pvpEliminationRoundResultUntilMs = Math.max(0, Number(pvpEliminationMatch?.round_result_until_ms || 0));
  const pvpEliminationRoundResultRemainingSec = Math.max(0, Math.ceil((pvpEliminationRoundResultUntilMs - pvpClockMs) / 1000));
  const pvpEliminationEliminationUntilMs = Math.max(0, Number(pvpEliminationMatch?.elimination_until_ms || 0));
  const pvpEliminationEliminationRemainingSec = Math.max(0, Math.ceil((pvpEliminationEliminationUntilMs - pvpClockMs) / 1000));
  const pvpEliminationCountdownSec = pvpEliminationBattleStatus === 'elimination_result'
    ? pvpEliminationEliminationRemainingSec
    : pvpEliminationRoundResultRemainingSec;
  const pvpEliminationCountdownClass = pvpEliminationCountdownSec <= 2 ? 'is-urgent' : '';
  const pvpEliminationRoundWinnerId = String(pvpEliminationMatch?.result_battle_winner_user_id || '').trim();
  const pvpEliminationRoundResultLabel = pvpEliminationRoundWinnerId
    ? (
      pvpEliminationRoundWinnerId === pvpEliminationPairUser1Id
        ? `${pvpEliminationPairUser1?.nickname || 'Jogador'} venceu o duelo`
        : `${pvpEliminationPairUser2?.nickname || 'Jogador'} venceu o duelo`
    )
    : 'Duelo empatado';
  const pvpEliminationEliminatedUserId = String(pvpEliminationMatch?.eliminated_user_id || '').trim();
  const pvpEliminationEliminatedMember = pvpEliminationMemberMap.get(pvpEliminationEliminatedUserId) || null;
  const pvpEliminationEliminationLabel = pvpEliminationEliminatedUserId
    ? (
      String(pvpEliminationMatch?.eliminated_reason || '').trim().toLowerCase() === 'exit'
        ? `${pvpEliminationEliminatedMember?.nickname || 'Jogador'} saiu da partida`
        : `${pvpEliminationEliminatedMember?.nickname || 'Jogador'} foi eliminado`
    )
    : pvpEliminationMatch?.cycle_tiebreak === true
      ? 'Empate no placar · ninguém foi eliminado'
      : 'Eliminação concluída';
  const pvpEliminationWinnerUserId = String(pvpEliminationMatch?.winner_user_id || '').trim();
  const pvpEliminationWinnerMember = pvpEliminationMemberMap.get(pvpEliminationWinnerUserId) || null;
  const pvpEliminationPlacement = getPvpEliminationPlacementForUser(pvpEliminationMatch, authUser?.uid || '');
  const pvpEliminationPlacementLabel = getPvpEliminationPlacementLabel(pvpEliminationPlacement || 0);
  const pvpEliminationResultKey = getPvpEliminationResultKeyByPlacement(pvpEliminationPlacement || 0);
  const pvpEliminationResultMatchId = String(pvpEliminationMatch?.id || '').trim();
  const pvpEliminationResultProcessed = !!(
    pvpEliminationResultMatchId
    && progress?.pvpProcessedMatches?.[pvpEliminationResultMatchId]
  );
  const pvpEliminationResultRows = pvpEliminationMembers
    .map((member) => {
      const userId = String(member?.user_id || '').trim();
      return {
        ...member,
        user_id: userId,
        score: Math.max(0, Number(pvpEliminationMatch?.member_scores?.[userId] || 0)),
        placement: getPvpEliminationPlacementForUser(pvpEliminationMatch, userId)
      };
    })
    .sort((a, b) => {
      const placementA = Math.max(1, Number(a?.placement || 99));
      const placementB = Math.max(1, Number(b?.placement || 99));
      if (placementA !== placementB) return placementA - placementB;
      const scoreA = Math.max(0, Number(a?.score || 0));
      const scoreB = Math.max(0, Number(b?.score || 0));
      if (scoreA !== scoreB) return scoreB - scoreA;
      return String(a?.nickname || '').localeCompare(String(b?.nickname || ''));
    });
  const pvpEliminationSpectatorMemberIds = Array.isArray(pvpEliminationMatch?.spectator_member_ids)
    ? pvpEliminationMatch.spectator_member_ids.map((entry) => String(entry || '').trim()).filter(Boolean)
    : [];
  const pvpEliminationIsSpectator = !!pvpEliminationMyUserId
    && (!pvpEliminationActiveMemberIds.includes(pvpEliminationMyUserId) || pvpEliminationSpectatorMemberIds.includes(pvpEliminationMyUserId));
  const pvpEliminationLivePairRows = [pvpEliminationPairUser1, pvpEliminationPairUser2]
    .map((member, index) => {
      const fallbackId = index === 0 ? pvpEliminationPairUser1Id : pvpEliminationPairUser2Id;
      const memberId = String(member?.user_id || fallbackId || '').trim();
      if (!memberId) return null;
      const memberShop = buildCosmeticSnapshot(
        member?.equipped_frame,
        member?.equipped_background,
        member?.equipped_emoji
      );
      const memberBgMeta = getBackgroundVisualMeta(memberShop);
      return {
        user_id: memberId,
        nickname: String(member?.nickname || '').trim() || 'Jogador',
        score: Math.max(0, Number(pvpEliminationMatch?.member_scores?.[memberId] || 0)),
        avatar: getDisplayAvatar(member?.avatar || '\uD83D\uDE42', memberShop),
        frameClass: getAvatarFrameClass(memberShop),
        frameStyle: getAvatarFrameStyle(memberShop),
        bgStyle: getHeroBackgroundStyle(memberShop),
        bgClassName: memberBgMeta.className,
        bgId: memberBgMeta.id,
        bgRarity: memberBgMeta.rarity,
        isSelf: memberId === pvpEliminationMyUserId,
        answered: Number(pvpEliminationAnswersByUser.get(memberId)?.answer_idx ?? -1) >= 0
      };
    })
    .filter(Boolean);
  const pvpEliminationMatchScoreRows = pvpEliminationMembers
    .map((member) => {
      const userId = String(member?.user_id || '').trim();
      return {
        ...member,
        user_id: userId,
        score: Math.max(0, Number(pvpEliminationMatch?.member_scores?.[userId] || 0))
      };
    })
    .sort((a, b) => {
      const scoreA = Math.max(0, Number(a?.score || 0));
      const scoreB = Math.max(0, Number(b?.score || 0));
      if (scoreA !== scoreB) return scoreB - scoreA;
      return String(a?.nickname || '').localeCompare(String(b?.nickname || ''));
    });
  const pvpEliminationQueueing = String(pvpEliminationQueueState.status || '').trim().toLowerCase() === 'queueing';
  const pvpEliminationRoomStatus = String(pvpEliminationRoom?.status || '').trim().toLowerCase();
  const pvpEliminationPendingAccept = pvpEliminationQueueing && pvpEliminationRoomStatus === 'pending_accept';
  const pvpEliminationAcceptMembers = getPvpEliminationMembers(pvpEliminationRoom);
  const pvpEliminationAcceptStateMap = getPvpEliminationRoomAcceptStateMap(pvpEliminationRoom);
  const pvpEliminationMyAcceptState = normalizePvpEliminationAcceptState(
    getPvpEliminationRoomAcceptState(pvpEliminationRoom, pvpEliminationMyUserId)
  );
  const pvpEliminationHasRejectedAccept = pvpEliminationAcceptMembers.some((member) => {
    const memberId = String(member?.user_id || '').trim();
    return normalizePvpEliminationAcceptState(pvpEliminationAcceptStateMap[memberId]) === 'rejected';
  });
  const pvpEliminationAllAccepted = pvpEliminationAcceptMembers.length === PVP_ELIMINATION_ROOM_CAPACITY
    && pvpEliminationAcceptMembers.every((member) => {
      const memberId = String(member?.user_id || '').trim();
      return normalizePvpEliminationAcceptState(pvpEliminationAcceptStateMap[memberId]) === 'accepted';
    });
  const pvpEliminationAcceptDeadlineMs = Math.max(0, Number(pvpEliminationRoom?.accept_deadline_ms || 0));
  const pvpEliminationAcceptStartCountdownMs = Math.max(0, Number(pvpEliminationRoom?.accept_start_countdown_ms || 0));
  const pvpEliminationAcceptRemainingSec = Math.max(0, Math.ceil((pvpEliminationAcceptDeadlineMs - pvpClockMs) / 1000));
  const pvpEliminationAcceptStartRemainingSec = Math.max(0, Math.ceil((pvpEliminationAcceptStartCountdownMs - pvpClockMs) / 1000));
  const pvpEliminationAcceptStartedAtMs = Math.max(0, Number(pvpEliminationRoom?.accept_started_at_ms || 0));
  const pvpEliminationShowMatchFoundTransition = pvpEliminationPendingAccept
    && pvpEliminationAcceptStartedAtMs > 0
    && pvpClockMs < (pvpEliminationAcceptStartedAtMs + PVP_MATCH_FOUND_TRANSITION_MS);
  const pvpEliminationShouldShowAcceptActions = pvpEliminationPendingAccept
    && !pvpEliminationShowMatchFoundTransition
    && pvpEliminationMyAcceptState === 'pending'
    && !pvpEliminationAllAccepted
    && !pvpEliminationHasRejectedAccept;
  const pvpEliminationAcceptCountdownLabel = pvpEliminationHasRejectedAccept
    ? 'Grupo recusado. Retornando para a fila...'
    : pvpEliminationAllAccepted
      ? `Partida iniciando em ${Math.max(0, pvpEliminationAcceptStartRemainingSec)}s.`
      : pvpEliminationMyAcceptState === 'accepted'
        ? `Você aceitou. Aguardando os demais (${Math.max(0, pvpEliminationAcceptRemainingSec)}s).`
        : `Tempo para aceitar: ${Math.max(0, pvpEliminationAcceptRemainingSec)}s`;
  const pvpEliminationQueueElapsedMs = pvpEliminationQueueState.joinedAtMs > 0
    ? Math.max(0, pvpClockMs - Number(pvpEliminationQueueState.joinedAtMs || 0))
    : 0;
  const pvpEliminationQueueSec = Math.floor(pvpEliminationQueueElapsedMs / 1000);
  const pvpEliminationQueueTimeLabel = `${String(Math.floor(pvpEliminationQueueSec / 60)).padStart(2, '0')}:${String(
    pvpEliminationQueueSec % 60
  ).padStart(2, '0')}`;
  const pvpEliminationLiveMatchId = String(pvpEliminationMatch?.id || pvpEliminationMatchId || '').trim();
  const pvpEliminationOptOutIds = Array.isArray(pvpEliminationMatch?.opt_out_member_ids)
    ? pvpEliminationMatch.opt_out_member_ids.map((entry) => String(entry || '').trim()).filter(Boolean)
    : [];
  const pvpEliminationLiveMatchBlocked = !!pvpEliminationLiveMatchId && (
    ignoredPvpEliminationMatchIdsRef.current.has(pvpEliminationLiveMatchId)
    || (!!pvpEliminationMyUserId && pvpEliminationOptOutIds.includes(pvpEliminationMyUserId))
  );
  const pvpEliminationIsCurrentUserActiveMember = !!pvpEliminationMyUserId
    && pvpEliminationActiveMemberIds.includes(pvpEliminationMyUserId);
  const pvpEliminationHasLiveMatch = !pvpEliminationLiveMatchBlocked && (
    pvpEliminationIsCurrentUserActiveMember
    && (
      !!String(pvpEliminationMatchId || '').trim()
      || pvpEliminationBattleStatus === 'active'
      || pvpEliminationBattleStatus === 'round_result'
      || pvpEliminationBattleStatus === 'elimination_result'
    )
  );
  const pvpEliminationAreaSelectionLocked = (
    pvpEliminationQueueing
    || pvpEliminationHasLiveMatch
    || pvpEliminationActionBusy
  );
  const pvpEliminationPrimaryAction = pvpEliminationHasLiveMatch
    ? {
      className: 'btn btn-primary challenge-queue-btn',
      label: 'Voltar para partida',
      disabled: false,
      onClick: () => setScreen('pvp-elimination')
    }
    : pvpEliminationActionBusy
      ? {
        className: pvpEliminationQueueing
          ? 'btn btn-primary challenge-queue-btn challenge-leave-btn-elimination'
          : 'btn btn-primary challenge-queue-btn',
        label: pvpEliminationQueueing ? 'Atualizando fila...' : 'Entrando...',
        disabled: true,
        onClick: () => {}
      }
      : pvpEliminationQueueing
        ? {
          className: 'btn btn-primary challenge-queue-btn challenge-leave-btn-elimination',
          label: 'Sair da fila',
          disabled: false,
          onClick: () => cancelPvpEliminationQueue()
        }
        : {
          className: 'btn btn-primary challenge-queue-btn',
          label: 'Entrar na fila',
          disabled: false,
          onClick: () => beginPvpEliminationQueue()
        };

  const adminBotQuizLiveRows = useMemo(() => {
    const state = botArenaQuizState && typeof botArenaQuizState === 'object'
      ? botArenaQuizState
      : null;
    if (!state) return [];
    if (String(state.status || '').trim().toLowerCase() !== 'active') return [];
    const assignments = Array.isArray(state.assignments)
      ? state.assignments.filter((entry) => entry && typeof entry === 'object' && entry.bot_id)
      : [];
    if (!assignments.length) return [];

    const normalizeBotLabel = (botId) => {
      const safe = String(botId || '').trim();
      if (!safe) return 'Bot';
      return safe.replace(/^bot_sys_codequiz_/, '');
    };

    const first = assignments[0] || {};
    const hasSecondAssignment = assignments.length > 1;
    const second = assignments[1] || null;
    const startedAtMs = Math.max(0, Number(state.started_at_ms || 0));
    const updatedAtMs = Math.max(startedAtMs, Number(toMillis(state.updated_at) || 0));
    const rowId = String(state.batch_id || '').trim() || `quiz_${startedAtMs || Date.now()}`;
    const difficulty = normalizeDifficulty(first.difficulty || state.cursor_difficulty || 'easy');

    return [{
      id: `bot_quiz_${rowId}`,
      status: 'active',
      is_bot_quiz: true,
      bot_quiz_batch_id: rowId,
      bot_quiz_difficulty: difficulty,
      bot_quiz_assignments: assignments,
      player1_user_id: String(first.bot_id || ''),
      player2_user_id: hasSecondAssignment ? String(second?.bot_id || '') : '',
      player1_nickname: normalizeBotLabel(first.bot_id),
      player2_nickname: hasSecondAssignment ? normalizeBotLabel(second?.bot_id) : 'Quiz solo',
      player1_bot_strength: normalizeBotStrength(first.bot_strength || getBotDefaultStrengthById(first.bot_id)),
      player2_bot_strength: hasSecondAssignment
        ? normalizeBotStrength(second?.bot_strength || getBotDefaultStrengthById(second?.bot_id))
        : '',
      player1_score: Math.max(0, Number(first.correct_count || 0)),
      player2_score: hasSecondAssignment ? Math.max(0, Number(second?.correct_count || 0)) : 0,
      total_rounds: Math.max(1, Number(first.total_questions || QUESTIONS_PER_ROUND)),
      round_no: 1,
      created_at: startedAtMs > 0 ? new Date(startedAtMs).toISOString() : '',
      updated_at: updatedAtMs > 0 ? new Date(updatedAtMs).toISOString() : ''
    }];
  }, [botArenaQuizState]);

  const adminLiveMatches = useMemo(() => {
    const nowMs = Date.now();
    const rows = [
      ...(Array.isArray(adminMatches) ? adminMatches : []),
      ...adminBotQuizLiveRows
    ];
    const sorted = rows
      .filter((row) => isAdminLiveMatchRow(row, nowMs))
      .sort((a, b) => (
        toMillis(b?.updated_at || b?.round_started_at || b?.created_at)
        - toMillis(a?.updated_at || a?.round_started_at || a?.created_at)
      ));
    const seenPendingPair = new Set();
    const deduped = [];
    sorted.forEach((row) => {
      const status = String(row?.status || '').trim().toLowerCase();
      if (status !== 'pending_accept') {
        deduped.push(row);
        return;
      }
      const p1 = String(row?.player1_user_id || '').trim();
      const p2 = String(row?.player2_user_id || '').trim();
      const pairKey = [p1, p2].filter(Boolean).sort().join('__');
      if (!pairKey) {
        deduped.push(row);
        return;
      }
      if (seenPendingPair.has(pairKey)) return;
      seenPendingPair.add(pairKey);
      deduped.push(row);
    });
    return deduped;
  }, [adminMatches, adminBotQuizLiveRows]);

  const adminHistoryTodayBaseMatches = useMemo(() => {
    const rows = Array.isArray(adminMatches) ? adminMatches : [];
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);
    return rows
      .filter((row) => {
        const status = String(row?.status || '').trim().toLowerCase();
        if (status !== 'finished') return false;
        if (row?.result_void === true || row?.history_hidden === true) return false;
        const hasWinner = !!String(row?.winner_user_id || '').trim();
        if (!hasWinner && row?.is_bot_quiz !== true) return false;
        if (isInvalidFinishedMatch(row)) return false;
        const endedMs = toMillis(row?.ended_at || row?.updated_at || row?.created_at);
        return endedMs >= dayStart && endedMs < dayEnd;
      })
      .sort((a, b) => (
        toMillis(b?.ended_at || b?.updated_at || b?.created_at)
        - toMillis(a?.ended_at || a?.updated_at || a?.created_at)
      ));
  }, [adminMatches]);

  const adminHistoryTodayMatches = useMemo(() => (
    adminHistoryTodayBaseMatches.filter((row) => doesAdminHistoryRowMatchFilter(row, adminHistoryFilter))
  ), [adminHistoryTodayBaseMatches, adminHistoryFilter]);

  const adminHistoryDateLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR');
  }, [pvpClockMs]);

  const botArenaDaemonMasterEnabled = botArenaDaemonControl?.arena_enabled !== false;
  const botArenaPvpEnabled = botArenaDaemonMasterEnabled && botArenaDaemonControl?.pvp_enabled !== false;
  const botArenaQuizEnabled = botArenaDaemonMasterEnabled && botArenaDaemonControl?.quiz_enabled !== false;
  const botArenaBattlesEnabled = botArenaPvpEnabled || botArenaQuizEnabled;
  const botArenaDaemonModeLabel = useMemo(() => {
    const status = String(botArenaDaemonStatus?.status || '').trim().toLowerCase();
    if (status === 'running') return 'Ativo';
    if (status === 'starting') return 'Inicializando';
    if (status === 'idle') return 'Em espera';
    return 'Indisponível';
  }, [botArenaDaemonStatus?.status]);
  const botArenaDaemonUpdatedAtLabel = useMemo(() => {
    const stamp = Math.max(
      0,
      Number(botArenaDaemonStatus?.updated_at_ms || toMillis(botArenaDaemonStatus?.updated_at))
    );
    if (!stamp) return '--:--:--';
    return new Date(stamp).toLocaleTimeString('pt-BR');
  }, [botArenaDaemonStatus?.updated_at_ms, botArenaDaemonStatus?.updated_at]);

  const adminMatchCodeById = useMemo(() => {
    const map = new Map();
    const rows = Array.isArray(adminMatches)
      ? adminMatches.filter((row) => {
        if (!row || typeof row !== 'object' || !row.id) return false;
        if (row.result_void === true || row.history_hidden === true) return false;
        if (isInvalidFinishedMatch(row)) return false;
        return true;
      })
      : [];
    const sorted = [...rows].sort((a, b) => (
      toMillis(a?.created_at || a?.round_started_at || a?.updated_at)
      - toMillis(b?.created_at || b?.round_started_at || b?.updated_at)
    ));
    const dayCounters = new Map();
    sorted.forEach((row) => {
      const startedMs = getAdminMatchStartMs(row) || Date.now();
      const dayKey = toAdminDayKey(startedMs);
      const seq = Math.max(1, Number(dayCounters.get(dayKey) || 0) + 1);
      dayCounters.set(dayKey, seq);
      map.set(String(row.id), `PVP${dayKey}-${seq}`);
    });
    return map;
  }, [adminMatches]);

  const shouldKeepQueueButtonPressed = pvpState.status === 'queueing'
    || (
      pvpState.status === 'finished'
      && shouldResumeQueueAfterMatchRefused(pvpState.match, authUser?.uid || '')
    );
  const queueButtonAutoResuming = pvpState.status !== 'queueing' && shouldKeepQueueButtonPressed;
  const queueBusyLabel = queueActionPhase === 'cancel'
    ? 'Saindo...'
    : (queueActionPhase === 'resume'
      ? 'Atualizando fila...'
      : (queueActionPhase === 'join' ? 'Entrando...' : 'Sincronizando...'));
  const queueBusyJoining = queueActionBusy && (queueActionPhase === 'join' || queueActionPhase === 'resume');
  const queueBusyCancelling = queueActionBusy && queueActionPhase === 'cancel';
  const arenaPrimaryAction = queueBusyJoining
    ? {
      className: 'btn btn-primary challenge-queue-btn',
      label: queueBusyLabel,
      disabled: true,
      onClick: () => {}
    }
    : queueBusyCancelling
      ? {
        className: 'btn btn-secondary challenge-leave-btn',
        label: 'Saindo...',
        disabled: true,
        onClick: () => {}
      }
      : shouldKeepQueueButtonPressed
        ? {
          className: 'btn btn-secondary challenge-leave-btn',
          label: queueButtonAutoResuming ? 'Atualizando fila...' : 'Sair da fila',
          disabled: false,
          onClick: () => cancelPvpQueue()
        }
        : pvpState.status === 'pending_accept'
      ? {
        className: 'btn btn-secondary challenge-leave-btn',
        label: 'Cancelar confronto',
        disabled: queueActionBusy,
        onClick: () => leavePvpFlow()
      }
      : pvpState.status === 'active'
        ? {
          className: 'btn btn-primary challenge-queue-btn',
          label: 'Voltar para partida',
          disabled: false,
          onClick: () => setScreen('pvp')
        }
        : {
          className: 'btn btn-primary challenge-queue-btn',
          label: queueActionBusy ? queueBusyLabel : 'Entrar na fila',
          disabled: false,
          onClick: () => joinPvpQueue()
        };

  function buildCosmeticSnapshot(frameId, backgroundId, emojiId) {
    return normalizeShopData({
      owned: ['frame_default', 'bg_default', 'emoji_profile', frameId, backgroundId, emojiId].filter(Boolean),
      equipped: {
        frame: String(frameId || 'frame_default'),
        background: String(backgroundId || 'bg_default'),
        emoji: String(emojiId || 'emoji_profile')
      }
    });
  }

  function getShopPreviewState(item) {
    const type = String(item?.type || '');
    if (!type || !item?.id) return shopData;
    const prevEquipped = shopData?.equipped || {};
    return buildCosmeticSnapshot(
      type === 'frame' ? item.id : prevEquipped.frame,
      type === 'background' ? item.id : prevEquipped.background,
      type === 'emoji' ? item.id : prevEquipped.emoji
    );
  }

  const activeShopItemPreview = shopItemPreview && typeof shopItemPreview === 'object'
    ? shopItemPreview
    : null;

  const pvpPlayer1Shop = buildCosmeticSnapshot(
    pvpMatch?.player1_frame,
    pvpMatch?.player1_background,
    pvpMatch?.player1_emoji
  );
  const pvpPlayer2Shop = buildCosmeticSnapshot(
    pvpMatch?.player2_frame,
    pvpMatch?.player2_background,
    pvpMatch?.player2_emoji
  );

  const pvpPlayer1Avatar = getDisplayAvatar(pvpMatch?.player1_avatar || '🤓', pvpPlayer1Shop);
  const pvpPlayer2Avatar = getDisplayAvatar(pvpMatch?.player2_avatar || '🤓', pvpPlayer2Shop);
  const pvpPlayer1FrameStyle = getAvatarFrameStyle(pvpPlayer1Shop);
  const pvpPlayer2FrameStyle = getAvatarFrameStyle(pvpPlayer2Shop);
  const pvpPlayer1FrameClass = getAvatarFrameClass(pvpPlayer1Shop);
  const pvpPlayer2FrameClass = getAvatarFrameClass(pvpPlayer2Shop);
  const pvpPlayer1BackgroundMeta = getBackgroundVisualMeta(pvpPlayer1Shop);
  const pvpPlayer2BackgroundMeta = getBackgroundVisualMeta(pvpPlayer2Shop);
  const pveCategory = getCategoryByPoints(progress?.rankingPoints || 0);
  const pvpCategory = getCategoryByPoints(progress?.pvpPoints || 0);
  const pvpSelectedDifficulty = getPvpQueueDifficultyFromConfig(pvpConfig, progress);
  const homeAuthUser = activeAuthUser;

  const safeShopTab = normalizeShopTab(shopTab);
  const safeShopOwnershipFilter = normalizeShopOwnershipFilter(shopOwnershipFilter);
  const safeShopCategoryOpenState = normalizeShopCategoryOpenState(shopCategoryOpen);
  const allActiveShopItems = useMemo(() => getItemsByType(safeShopTab), [safeShopTab]);
  const ownedShopIds = Array.isArray(shopData?.owned) ? shopData.owned : [];
  const ownedShopSet = useMemo(() => new Set(ownedShopIds), [ownedShopIds]);
  const activeShopItems = useMemo(() => {
    const ownedSet = new Set(ownedShopIds);
    return allActiveShopItems.filter((item) => {
      const owned = ownedSet.has(item.id);
      if (safeShopOwnershipFilter === 'owned') return owned;
      if (safeShopOwnershipFilter === 'unowned') return !owned;
      return true;
    });
  }, [allActiveShopItems, safeShopOwnershipFilter, ownedShopIds]);
  const activeShopCategoryOpen = safeShopCategoryOpenState?.[safeShopTab] || SHOP_CATEGORY_OPEN_DEFAULT;
  const groupedShopItems = useMemo(() => {
    const groups = SHOP_RARITY_ORDER.map((rarity) => ({ rarity, items: [] }));
    const lookup = groups.reduce((acc, group) => {
      acc[group.rarity] = group;
      return acc;
    }, {});
    activeShopItems.forEach((item) => {
      const rarity = SHOP_RARITY_ORDER.includes(item?.rarity) ? item.rarity : 'common';
      lookup[rarity].items.push(item);
    });
    return groups;
  }, [activeShopItems]);

  const pvpResult = pvpState.result || getPvpResultForUser(pvpMatch, authUser?.uid || '');
  const pvpFinalScoreParts = useMemo(() => {
    const player1Id = String(pvpMatch?.player1_user_id || '').trim();
    const player2Id = String(pvpMatch?.player2_user_id || '').trim();
    const player1Score = Math.max(0, Number(pvpMatch?.player1_score || 0));
    const player2Score = Math.max(0, Number(pvpMatch?.player2_score || 0));
    const resolvedWinnerId = String(pvpMatch?.winner_user_id || resolveMatchWinner(pvpMatch) || '').trim();
    const winnerSide = resolvedWinnerId === player1Id
      ? 'player1'
      : (resolvedWinnerId === player2Id ? 'player2' : (player1Score >= player2Score ? 'player1' : 'player2'));
    return {
      player1: player1Score,
      player2: player2Score,
      winnerSide
    };
  }, [pvpMatch]);
  const pvpOpponentLeftTransitionActive = pvpResultTransitionMode === 'opponent_left' && !pvpCompensation;
  const pvpHideDefaultResultPanel = pvpOpponentLeftTransitionActive || Boolean(pvpCompensation);
  const activePvpEmojiOptions = PVP_EMOJI_PICKER_OPTIONS;
  const pvpEmojiCooldownRemainingMs = Math.max(
    0,
    Math.max(0, Number(pvpEmojiCooldownUntilMs || 0)) - pvpClockMs
  );
  const pvpEmojiCooldownActive = pvpEmojiCooldownRemainingMs > 0;
  const pvpEmojiCooldownFillPct = pvpEmojiCooldownActive
    ? Math.max(0, Math.min(100, (pvpEmojiCooldownRemainingMs / PVP_EMOJI_SPAM_COOLDOWN_MS) * 100))
    : 0;
  const pvpEmojiCooldownLabel = pvpEmojiCooldownActive
    ? `${(pvpEmojiCooldownRemainingMs / 1000).toFixed(1)}s`
    : '';
  // Tela de resultado final: todos veem as reações; só quem ainda está na partida manda.
  const buildPvpGroupResultEmojis = (mode, match, channelOpen) => {
    const myUserId = String(authUser?.uid || '').trim();
    const canSend = channelOpen && !!myUserId
      && getPvpGroupMatchMemberIds(match, mode).includes(myUserId)
      && !getPvpGroupMatchGoneIds(match, mode).includes(myUserId);
    return {
      list: pvpBattleEmojis,
      onSend: canSend ? (emoji) => sendPvpGroupEmoji(mode, emoji) : null,
      cooldownActive: pvpEmojiCooldownActive,
      cooldownPct: pvpEmojiCooldownFillPct,
      cooldownLabel: pvpEmojiCooldownLabel,
      fx: pvpGroupEmojiFx
    };
  };
  const pvpAreaSelectionLocked = (
    pvpState.status === 'queueing'
    || pvpState.status === 'pending_accept'
    || pvpState.status === 'active'
    || pvpState.status === 'round_result'
    || queueActionBusy
    || matchAcceptBusy
  );
  const homeTourSteps = useMemo(() => ([
    {
      anchor: 'home-hero',
      kicker: 'Seu perfil',
      title: 'Aqui você acompanha sua conta',
      description: 'Veja apelido, nível, moedas e progresso de XP sem precisar sair da tela inicial.'
    },
    {
      anchor: 'home-play',
      kicker: 'Hora de jogar',
      title: 'Treine sozinho ou desafie outros jogadores',
      description: 'Comece um quiz pelas trilhas ou entre na arena PvP para subir de liga.'
    },
    {
      anchor: 'app-nav',
      kicker: 'Navegação',
      title: 'Tudo a um toque de distância',
      description: 'Use o menu para abrir Jogar, Ranking, Loja e o Passe de Evolução quando quiser.'
    }
  ]), []);
  const currentHomeTourStep = homeTourSteps[homeTourStepIndex] || null;
  const homeTourProgressLabel = homeTourSteps.length
    ? `${Math.min(homeTourSteps.length, homeTourStepIndex + 1)} / ${homeTourSteps.length}`
    : '';
  const isHomeTourLastStep = homeTourStepIndex >= (homeTourSteps.length - 1);
  const settingsSignOutAccountLabel = googleAccountName || 'Conta Google';

  useEffect(() => {
    if (screen !== 'home') {
      setHomeTourOpen(false);
      setHomeTourHighlight(null);
      return;
    }
    if (onboardingRequired || !activeAuthUser?.uid || homeTourOpen || readHomeTourSeenLocal(activeAuthUser.uid)) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setHomeTourStepIndex(0);
      setHomeTourOpen(true);
    }, 520);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeAuthUser?.uid, homeTourOpen, onboardingRequired, screen]);

  useEffect(() => {
    if (!homeTourOpen || screen !== 'home' || !currentHomeTourStep?.anchor) {
      setHomeTourHighlight(null);
      return;
    }

    let frameId = 0;
    let timerId = 0;
    const selector = `[data-tour-anchor="${currentHomeTourStep.anchor}"]`;

    // A âncora pode existir no menu lateral e na barra de abas: usa a que está visível.
    const findTarget = () => Array.from(document.querySelectorAll(selector))
      .find((node) => node instanceof HTMLElement && node.getClientRects().length > 0) || null;

    const refreshHighlight = () => {
      const target = findTarget();
      if (!(target instanceof HTMLElement)) {
        setHomeTourHighlight(null);
        return;
      }
      const rect = target.getBoundingClientRect();
      const padding = 12;
      setHomeTourHighlight({
        top: Math.max(8, rect.top - padding),
        left: Math.max(8, rect.left - padding),
        width: Math.max(44, rect.width + (padding * 2)),
        height: Math.max(44, rect.height + (padding * 2))
      });
    };

    const target = findTarget();
    if (target instanceof HTMLElement) {
      target.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: 'smooth'
      });
    }

    timerId = window.setTimeout(() => {
      refreshHighlight();
    }, 140);

    const scheduleRefresh = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(refreshHighlight);
    };

    window.addEventListener('resize', scheduleRefresh);
    window.addEventListener('scroll', scheduleRefresh, true);

    return () => {
      if (timerId) window.clearTimeout(timerId);
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', scheduleRefresh);
      window.removeEventListener('scroll', scheduleRefresh, true);
    };
  }, [currentHomeTourStep, homeTourOpen, screen]);

  const showPreload = booting || authLoading || !progressReady || !shopReady;
  if (showPreload) {
    return <SplashScreen />;
  }

  const pvpDuelStatus = String(pvpState.status || '').trim().toLowerCase();
  const pvpLobbyBusy = Boolean(
    ['queueing', 'pending_accept', 'active', 'round_result'].includes(pvpDuelStatus)
    || pvpTeamRoomId
    || pvpEliminationRoomId
    || String(pvpEliminationQueueState?.status || '').trim().toLowerCase() === 'queueing'
  );
  const shellMode = getShellMode(screen, { pvpLobbyBusy });
  // Cada troca de tela (e de etapa dentro da arena) ganha uma transição suave no shell.
  const screenTransitionKey = screen === 'challenge'
    ? `challenge:${pvpMode || 'menu'}:${pvpTeamRoomId ? 'room' : 'lobby'}`
    : screen;
  const shellProfile = activeAuthUser ? {
    avatar: displayAvatar,
    frameClass: avatarFrameClass,
    frameStyle: avatarFrameStyle,
    nickname: heroNickname,
    level: safeLevel,
    xp: safeXp,
    xpNext: xpForNextLevel,
    xpPercent,
    coins: safeCoins,
    pveTier: pveCategory,
    pvpTier: pvpCategory
  } : null;
  const shellMusic = {
    enabled: audioSettings.musicEnabled === true,
    mode: musicMode,
    trackName: activeMusicTrack?.name || '',
    onToggle: (enabled) => updateAudioSetting('musicEnabled', enabled === true),
    onSkip: handleMusicSkip
  };

  const homeContinueTrack = (() => {
    const candidates = LANGUAGES.map((language) => ({
      language,
      progress: Math.max(0, Math.min(100, Number(languageProgress.get(language.id) || 0)))
    }));
    const inProgress = candidates
      .filter((entry) => entry.progress > 0 && entry.progress < 100)
      .sort((a, b) => b.progress - a.progress)[0];
    const areaGroup = LANGUAGE_THEME_GROUPS.find((group) => group.area === selectedKnowledgeArea) || LANGUAGE_THEME_GROUPS[0];
    const fallbackId = areaGroup?.languages?.[0] || LANGUAGES[0]?.id;
    const picked = inProgress || candidates.find((entry) => entry.language.id === fallbackId) || candidates[0];
    if (!picked) return null;
    return {
      id: picked.language.id,
      name: picked.language.name,
      desc: picked.language.desc,
      icon: picked.language.icon,
      color: picked.language.color,
      progress: Math.round(picked.progress),
      started: picked.progress > 0
    };
  })();

  function startPveFlow() {
    setScreen('knowledge-area');
  }

  function startPvpFlow() {
    resetPvpTeamState();
    setPvpMode('');
    setScreen('challenge');
  }

  function openPveTrack(languageId) {
    const safeId = String(languageId || '').trim();
    if (!safeId) return;
    const group = LANGUAGE_THEME_GROUPS.find((entry) => entry.languages.includes(safeId));
    if (group?.area) setSelectedKnowledgeArea(group.area);
    setSelectedLanguage(safeId);
    const topics = getTopicsByLanguage(TOPICS, safeId);
    setSelectedTopic(topics[0]?.id || '');
    setScreen('topic');
  }

  function navigateToTab(tabKey) {
    const target = getTabScreen(tabKey);
    if (target !== screen) setScreen(target);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }

  return (
    <>
      <AppShell
        mode={shellMode}
        transitionKey={screenTransitionKey}
        activeTab={getTabForScreen(screen)}
        showTopBar={TAB_ROOT_SCREENS.has(screen)}
        onNavigate={navigateToTab}
        onOpenHistory={openPlayerHistoryPanel}
        profile={shellProfile}
        music={shellMusic}
        toast={toast}
      >
        {screen === 'home' ? (
          <HomeScreen vm={{
            authUser,
            avatarFrameClass,
            avatarFrameStyle,
            buildCosmeticSnapshot,
            continueTrack: homeContinueTrack,
            displayAvatar,
            evolutionPass,
            heroBackground,
            heroBackgroundMeta,
            heroNickname,
            openPlayerHistoryPanel,
            openPveTrack,
            progress,
            pveCategory,
            pvpCategory,
            rankingsLoading,
            rankingsMode,
            rankingsRows,
            safeCoins,
            safeLevel,
            safeXp,
            setRankingsMode,
            setScreen,
            startPveFlow,
            startPvpFlow,
            xpForNextLevel,
            xpPercent
          }} />
        ) : null}

        {screen === 'play-mode' ? (
          <PlayModeScreen vm={{
            startPveFlow,
            startPvpFlow
          }} />
        ) : null}

        {screen === 'knowledge-area' ? (
          <KnowledgeAreaScreen vm={{
            chooseKnowledgeAreaForPve,
            languageProgress,
            triggerAppBackNavigation
          }} />
        ) : null}

        {screen === 'select' ? (
          <TrackSelectScreen vm={{
            languageProgress,
            languageThemeSections,
            selectedKnowledgeArea,
            selectedLanguage,
            setScreen,
            setSelectedLanguage,
            setSelectedTopic,
            triggerAppBackNavigation
          }} />
        ) : null}

        {screen === 'topic' ? (
          <TopicScreen vm={{
            beginPveRound,
            languageProgress,
            selectedLanguage,
            selectedLanguageMeta,
            selectedTopic,
            selectedTopicDifficultyProgress,
            selectedTopicMeta,
            selectedTopicQuestionCountByDifficulty,
            selectedTopics,
            setSelectedTopic,
            topicProgress,
            topicQuestionCountByDifficulty,
            triggerAppBackNavigation
          }} />
        ) : null}

        {screen === 'difficulty' ? (
          <DifficultyScreen vm={{
            beginPveRound,
            selectedLanguageMeta,
            selectedTopicDifficultyProgress,
            selectedTopicMeta,
            selectedTopicQuestionCountByDifficulty,
            triggerAppBackNavigation
          }} />
        ) : null}

        {screen === 'quiz' ? (
          <QuizScreen vm={{
            confirmQuizAnswer,
            currentQuestion,
            handleAnswer,
            music: shellMusic,
            openQuizMenu,
            quizMenuOpen,
            quizQuestionHasOverflow,
            quizQuestionScrollRef,
            quizQuestionStartMs,
            quizRoundSeconds,
            quizState,
            selectedLanguageMeta,
            selectedTopicMeta
          }} />
        ) : null}

        {screen === 'feedback' ? (
          <FeedbackScreen vm={{
            feedbackState,
            nextQuestion
          }} />
        ) : null}

        {screen === 'result' ? (
          <ResultScreen vm={{
            buildCosmeticSnapshot,
            progress,
            quizRankingLoading,
            quizRankingRows,
            resetQuizFlow,
            resultState,
            selectedLanguageMeta,
            selectedTopicMeta,
            setScreen,
            xpForNextLevel,
            xpPercent
          }} />
        ) : null}

        {screen === 'achievements' ? (
          <PassScreen vm={{
            evolutionPass,
            evolutionPassFocusedStage,
            evolutionPassFocusedStageIndex,
            evolutionPassStages,
            focusAdjacentEvolutionPassStage,
            focusEvolutionPassStage,
            handleClaimEvolutionPassStage,
            openShopItemPreview,
            passClaimingStageId,
            passRecentClaimStageId
          }} />
        ) : null}

        {screen === 'rankings' ? (
          <RankingsScreen vm={{
            authUser,
            avatarFrameClass,
            avatarFrameStyle,
            buildCosmeticSnapshot,
            displayAvatar,
            heroNickname,
            progress,
            rankingsLoading,
            rankingsMode,
            rankingsRows,
            setRankingsMode
          }} />
        ) : null}

        {screen === 'admin-monitor' && adminAuthorized ? (
          <AdminMonitorScreen vm={{
            adminBotDaemonBusy,
            adminBusy,
            adminHistoryTodayBaseMatches,
            adminLiveMatches,
            adminMatchesUpdatedAtMs,
            arenaMetrics,
            botArenaBattlesEnabled,
            botArenaDaemonModeLabel,
            botArenaDaemonUpdatedAtLabel,
            botArenaPvpEnabled,
            botArenaQuizEnabled,
            refreshAdminMetrics,
            setAdminBotArenaAutomationEnabled,
            setScreen,
            triggerAppBackNavigation
          }} />
        ) : null}

        {screen === 'admin-live' && adminAuthorized ? (
          <AdminLiveScreen vm={{
            adminLiveMatches,
            adminMatchCodeById,
            adminMatchesLoading,
            triggerAppBackNavigation
          }} />
        ) : null}

        {screen === 'admin-history' && adminAuthorized ? (
          <AdminHistoryScreen vm={{
            adminHistoryDateLabel,
            adminHistoryFilter,
            adminHistoryTodayBaseMatches,
            adminHistoryTodayMatches,
            adminMatchCodeById,
            adminMatchesLoading,
            setAdminHistoryFilter,
            triggerAppBackNavigation
          }} />
        ) : null}

        {screen === 'login' ? (
          <LoginScreen vm={{
            googleButtonContainerRef,
            googleSignInBusy
          }} />
        ) : null}

        {screen === 'nickname-setup' ? (
          <NicknameSetupScreen vm={{
            googleAccountAvatar,
            googleAccountEmail,
            googleAccountInitial,
            googleAccountName,
            googleSignInBusy,
            handleSignOut,
            handleSwitchGoogleAccount,
            homeAuthUser,
            nicknameCanSave,
            nicknameHintClass,
            nicknameHintText,
            profileDraft,
            profileSaving,
            saveProfile,
            setProfileDraft,
            setScreen
          }} />
        ) : null}

        {screen === 'settings' ? (
          <SettingsScreen vm={{
            adminAccessBusy,
            audioSettings,
            buildBadgeValue,
            googleAccountAvatar,
            googleAccountEmail,
            googleAccountInitial,
            googleAccountName,
            googleSignInBusy,
            handleSwitchGoogleAccount,
            homeAuthUser,
            isAdminUser,
            nicknameCanSave,
            nicknameHintClass,
            nicknameHintText,
            onboardingRequired,
            openAdminScreen,
            openSettingsSignOutConfirm,
            playSfx,
            profileDraft,
            profileSaving,
            saveProfile,
            setProfileDraft,
            setScreen,
            triggerAppBackNavigation,
            updateAudioSetting
          }} />
        ) : null}

        {screen === 'shop' ? (
          <ShopScreen vm={{
            activeShopCategoryOpen,
            getShopPreviewState,
            groupedShopItems,
            handleBuyShopItem,
            handleToggleOwnedShopItem,
            heroNickname,
            openShopItemPreview,
            ownedShopSet,
            profile,
            progress,
            pveCategory,
            pvpCategory,
            safeLevel,
            safeShopOwnershipFilter,
            setScreen,
            setShopOwnershipFilter,
            setShopTab,
            shopData,
            shopTab: safeShopTab,
            toggleShopCategory
          }} />
        ) : null}

        {screen === 'challenge' ? (
          <PvpLobbyScreen vm={{
            acceptPvpEliminationRoomInvite,
            acceptPvpMatchInvite,
            arenaPrimaryAction,
            authUser,
            buildCosmeticSnapshot,
            chooseKnowledgeAreaForPvp,
            choosePvpDifficulty,
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
            pvpTeamAutoStartPending,
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
            shouldKeepQueueButtonPressed,
            shouldShowAcceptActions,
            showMatchFoundTransition,
            startPvpTeamBattle,
            togglePvpTeamReadyState,
            triggerAppBackNavigation
          }} />
        ) : null}

        {screen === 'pvp' ? (
          <PvpDuelScreen vm={{
            authUser,
            confirmPvpAnswer,
            leavePvpFlow,
            music: shellMusic,
            pickPvpAnswer,
            pvpBattleEmojis,
            pvpEmojiCooldownActive,
            pvpEmojiCooldownFillPct,
            pvpEmojiCooldownLabel,
            pvpEmojiFx,
            pvpHasPlayer1Answer,
            pvpHasPlayer2Answer,
            pvpIsRoundResult,
            pvpMatch,
            pvpPlayer1Avatar,
            pvpPlayer1BackgroundMeta,
            pvpPlayer1FrameClass,
            pvpPlayer1FrameStyle,
            pvpPlayer1Id,
            pvpPlayer1Shop,
            pvpPlayer2Avatar,
            pvpPlayer2BackgroundMeta,
            pvpPlayer2FrameClass,
            pvpPlayer2FrameStyle,
            pvpPlayer2Shop,
            pvpQuestion,
            pvpQuestionHasOverflow,
            pvpQuestionScrollRef,
            pvpRoundNo,
            pvpRoundPhaseLabel,
            pvpRoundPlayer1Feedback,
            pvpRoundPlayer2Feedback,
            pvpRoundRemainingSec: Math.ceil(Math.max(0, pvpRoundRemainingMs) / 1000),
            pvpRoundResultCountdownClass,
            pvpRoundResultKicker,
            pvpRoundResultLabel,
            pvpRoundResultRemainingSec,
            pvpState,
            pvpTimerClass,
            pvpTimerPct,
            pvpTotalRounds,
            pvpWaitingOpponent,
            sendPvpEmoji
          }} />
        ) : null}

        {screen === 'pvp-team' ? (
          <PvpTeamScreen vm={{
            buildCosmeticSnapshot,
            confirmPvpTeamAnswer,
            emojis: {
              list: pvpBattleEmojis,
              onSend: (emoji) => sendPvpGroupEmoji(PVP_GROUP_MODE_TEAM, emoji),
              cooldownActive: pvpEmojiCooldownActive,
              cooldownPct: pvpEmojiCooldownFillPct,
              cooldownLabel: pvpEmojiCooldownLabel,
              fx: pvpGroupEmojiFx
            },
            leavePvpTeamFlow,
            music: shellMusic,
            pickPvpTeamAnswer,
            pvpTeamBattleEntry,
            pvpTeamBattleNo,
            pvpTeamBattleRemainingSec,
            pvpTeamBattleStatus,
            pvpTeamBlueFeedback,
            pvpTeamBlueMembers,
            pvpTeamCurrentBattleLabel,
            pvpTeamCurrentPairLabel,
            pvpTeamAnswerWindowOpen,
            pvpTeamAnsweredUserIds,
            pvpTeamIsActivePlayer,
            pvpTeamLeftMemberIds,
            pvpTeamMatch,
            pvpTeamMySide,
            pvpTeamQuestion,
            pvpTeamRedFeedback,
            pvpTeamRedMembers,
            pvpTeamResultEntry,
            pvpTeamResultPair,
            pvpTeamRoundResultCountdownClass,
            pvpTeamRoundResultLabel,
            pvpTeamRoundResultRemainingSec,
            pvpTeamSelectedIndex,
            pvpTeamSubmitted,
            pvpTeamTimerClass,
            pvpTeamTimerPct
          }} />
        ) : null}

        {screen === 'pvp-elimination' ? (
          <PvpEliminationScreen vm={{
            confirmPvpEliminationAnswer,
            emojis: {
              list: pvpBattleEmojis,
              onSend: (emoji) => sendPvpGroupEmoji(PVP_GROUP_MODE_ELIMINATION, emoji),
              cooldownActive: pvpEmojiCooldownActive,
              cooldownPct: pvpEmojiCooldownFillPct,
              cooldownLabel: pvpEmojiCooldownLabel,
              fx: pvpGroupEmojiFx
            },
            leavePvpEliminationFlow,
            music: shellMusic,
            pickPvpEliminationAnswer,
            pvpEliminationAnswerWindowOpen,
            pvpEliminationBattleRemainingSec: Math.ceil(Math.max(0, pvpEliminationBattleRemainingMs) / 1000),
            pvpEliminationBattleStatus,
            pvpEliminationCountdownClass,
            pvpEliminationCountdownSec,
            pvpEliminationEliminatedUserId,
            pvpEliminationEliminationLabel,
            pvpEliminationIsActivePairMember,
            pvpEliminationIsSpectator,
            pvpEliminationLivePairRows,
            pvpEliminationMatch,
            pvpEliminationMatchScoreRows,
            pvpEliminationMyUserId,
            pvpEliminationPairUser1Avatar,
            pvpEliminationPairUser1FrameClass,
            pvpEliminationPairUser1FrameStyle,
            pvpEliminationPairUser1Label,
            pvpEliminationPairUser2Avatar,
            pvpEliminationPairUser2FrameClass,
            pvpEliminationPairUser2FrameStyle,
            pvpEliminationPairUser2Label,
            pvpEliminationQuestion,
            pvpEliminationResultRows,
            pvpEliminationRoundLabel,
            pvpEliminationRoundResultLabel,
            pvpEliminationSelectedIndex,
            pvpEliminationShowBattleIntro,
            pvpEliminationSubmitted,
            pvpEliminationTimerClass,
            pvpEliminationTimerPct,
            pvpEliminationWaitingPairAnswer,
            pvpEliminationWinnerMember,
            pvpEliminationWinnerUserId
          }} />
        ) : null}

        {screen === 'pvp-elimination-result' ? (
          <PvpEliminationResultScreen vm={{
            buildCosmeticSnapshot,
            collectPvpEliminationResultRewards,
            emojis: buildPvpGroupResultEmojis(PVP_GROUP_MODE_ELIMINATION, pvpEliminationMatch, pvpEliminationEmojiChannelOpen),
            pvpEliminationMyUserId,
            pvpEliminationPlacementLabel,
            pvpEliminationResultKey,
            pvpEliminationResultProcessed,
            pvpEliminationResultReward,
            pvpEliminationResultRows,
            pvpEliminationRewardCollecting,
            pvpEliminationWinnerMember,
            pvpEliminationWinnerUserId,
            resetPvpEliminationState,
            setPvpMode,
            setScreen
          }} />
        ) : null}

        {screen === 'pvp-team-result' ? (
          <PvpTeamResultScreen vm={{
            buildCosmeticSnapshot,
            collectPvpTeamResultRewards,
            emojis: buildPvpGroupResultEmojis(PVP_GROUP_MODE_TEAM, pvpTeamMatch, pvpTeamEmojiChannelOpen),
            pvpTeamBlueMembers,
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
          }} />
        ) : null}

        {screen === 'pvp-result' ? (
          <PvpResultScreen vm={{
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
          }} />
        ) : null}

      </AppShell>

      {pvpTeamCreateRoomOpen ? (
        <TeamRoomCreateModal vm={{
          chooseKnowledgeAreaForPvp,
          choosePvpDifficulty,
          closePvpTeamRoomCreate,
          createPvpTeamRoomFromDraft,
          pvpSelectedDifficulty,
          pvpTeamActionBusy,
          pvpTeamDraftAreaMeta,
          pvpTeamRoomDraft,
          pvpTeamRoomDraftError,
          setPvpTeamRoomDraft
        }} />
      ) : null}

      {pvpTeamJoinPrompt.roomId ? (
        <TeamJoinPromptModal vm={{
          closePvpTeamJoinPrompt,
          pvpTeamActionBusy,
          pvpTeamJoinPrompt,
          setPvpTeamJoinPrompt,
          submitPvpTeamJoinPrompt
        }} />
      ) : null}

      {pvpTeamRoomNoticeModal?.id ? (
        <TeamRoomNoticeModal vm={{
          closePvpTeamRoomNoticeModal,
          pvpTeamRoomNoticeModal
        }} />
      ) : null}

      {pvpEliminationRoomNoticeModal?.id ? (
        <EliminationRoomNoticeModal vm={{
          closePvpEliminationRoomNoticeModal,
          pvpEliminationRoomNoticeModal
        }} />
      ) : null}

      {pvpEliminationExitPrompt?.matchId ? (
        <EliminationExitPromptModal vm={{
          exitPvpEliminationWithPlacement,
          keepWatchingPvpElimination,
          pvpEliminationExitPrompt
        }} />
      ) : null}

      {activeShopItemPreview ? (
        <ShopItemPreviewModal vm={{
          activeShopItemPreview,
          closeShopItemPreview,
          getShopPreviewState,
          handleBuyShopItem,
          handleToggleOwnedShopItem,
          heroNickname,
          ownedShopSet,
          profile,
          progress,
          pveCategory,
          pvpCategory,
          safeLevel,
          setScreen,
          shopData
        }} />
      ) : null}

      {playerHistoryOpen ? (
        <PlayerHistoryModal vm={{
          closePlayerHistoryPanel,
          playerHistoryCountByType,
          playerHistoryEmptyText,
          playerHistoryError,
          playerHistoryFilter,
          playerHistoryFilterOptions,
          playerHistoryItems,
          playerHistoryLoading,
          setPlayerHistoryFilter
        }} />
      ) : null}

      {updateState.available && !isMatchFlowInProgress ? (
        <UpdateNoticeBar vm={{
          applyPendingUpdate,
          updateState
        }} />
      ) : null}

      {cookieConsent === 'pending' ? (
        <CookieConsentBanner vm={{
          saveCookieConsent
        }} />
      ) : null}

      {screen === 'home' && homeTourOpen && currentHomeTourStep ? (
        <HomeTourOverlay vm={{
          advanceHomeTour,
          currentHomeTourStep,
          homeTourHighlight,
          homeTourProgressLabel,
          isHomeTourLastStep,
          skipHomeTour
        }} />
      ) : null}

      {settingsSignOutConfirmOpen ? (
        <SignOutConfirmModal vm={{
          closeSettingsSignOutConfirm,
          confirmSettingsSignOut,
          googleAccountAvatar,
          googleAccountEmail,
          googleAccountInitial,
          googleSignInBusy,
          settingsSignOutAccountLabel
        }} />
      ) : null}

      {leagueTransition.visible ? (
        <LeagueTransitionOverlay vm={{
          closeLeagueTransition,
          leagueTransition
        }} />
      ) : null}

      {authTransition.visible ? (
        <AuthTransitionOverlay vm={{
          authTransition
        }} />
      ) : null}

      {themeIntro.visible ? (
        <ThemeIntroOverlay vm={{
          themeIntro
        }} />
      ) : null}

      {screen === 'quiz' && quizMenuOpen ? (
        <QuizMenuModal vm={{
          closeQuizMenu,
          restartCurrentQuiz,
          returnQuizToHome
        }} />
      ) : null}

      {pvpEmojiPickerOpen ? (
        <PvpEmojiPickerModal vm={{
          activePvpEmojiOptions,
          closePvpEmojiPicker,
          pvpEmojiDraft,
          pvpEmojiDraftWarning,
          pvpEmojiSlotFocus,
          removePvpEmojiAt,
          savePvpEmojiDraft,
          selectPvpEmojiSlot,
          togglePvpEmojiDraft
        }} />
      ) : null}

      {screen === 'result' && resultState && !resultState.rewardsCollected ? (
        <RewardCollectModal vm={{
          handleCollectResultRewards,
          resultState,
          rewardCollecting
        }} />
      ) : null}

      {screen === 'pvp-result' && pvpOpponentLeftTransitionActive ? (
        <PvpOpponentLeftOverlay />
      ) : null}

      {pvpCompensation ? (
        <PvpCompensationModal vm={{
          collectPvpCompensation,
          pvpCompensation,
          pvpRewardCollecting
        }} />
      ) : null}

      {rewardFxParticles.length ? (
        <RewardParticles vm={{
          rewardFxParticles
        }} />
      ) : null}


    </>
  );
}

