import { Gamepad2, House, ShoppingBag, Ticket, Trophy } from 'lucide-react';

// Abas principais (barra inferior no mobile, menu lateral no desktop).
export const NAV_TABS = [
  { key: 'home', label: 'Início', icon: House, screen: 'home' },
  { key: 'play', label: 'Jogar', icon: Gamepad2, screen: 'play-mode' },
  { key: 'ranking', label: 'Ranking', icon: Trophy, screen: 'rankings' },
  { key: 'shop', label: 'Loja', icon: ShoppingBag, screen: 'shop' },
  { key: 'pass', label: 'Passe', icon: Ticket, screen: 'achievements' }
];

const SCREEN_TAB = {
  home: 'home',
  'play-mode': 'play',
  'knowledge-area': 'play',
  select: 'play',
  topic: 'play',
  difficulty: 'play',
  challenge: 'play',
  rankings: 'ranking',
  shop: 'shop',
  achievements: 'pass',
  settings: 'settings',
  'admin-monitor': 'settings',
  'admin-live': 'settings',
  'admin-history': 'settings'
};

// Telas em modo foco: sem menus, ocupam a tela inteira.
const FOCUS_SCREENS = new Set([
  'login',
  'nickname-setup',
  'quiz',
  'feedback',
  'result',
  'pvp',
  'pvp-result',
  'pvp-team',
  'pvp-team-result',
  'pvp-elimination',
  'pvp-elimination-result'
]);

// Raízes das abas: no mobile mostram a barra superior com o perfil.
export const TAB_ROOT_SCREENS = new Set(['home', 'play-mode', 'rankings', 'shop', 'achievements']);

export function getTabForScreen(screen) {
  return SCREEN_TAB[screen] || null;
}

export function getShellMode(screen, { pvpLobbyBusy = false } = {}) {
  if (FOCUS_SCREENS.has(screen)) return 'focus';
  if (screen === 'challenge' && pvpLobbyBusy) return 'focus';
  return 'tabs';
}

export function getTabScreen(tabKey) {
  if (tabKey === 'settings') return 'settings';
  return NAV_TABS.find((tab) => tab.key === tabKey)?.screen || 'home';
}
