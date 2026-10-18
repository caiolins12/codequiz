import { Component } from 'react';
import styles from './AppShell.module.css';

// Troca de tela suave sem atrasar a lógica do app: o estado muda na hora, e só o visual
// faz a transição. Logo antes de o React trocar o conteúdo, uma cópia estática da tela
// antiga (o "fantasma") vai para uma camada por cima e some, enquanto a nova aparece.

const EXIT_MS = 200;
const ENTER_MS = 300;
const ENTER_DELAY_MS = 60;
const EXIT_EASING = 'cubic-bezier(0.4, 0, 1, 1)';
const ENTER_EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

// A cópia não pode repetir ids, grupos de rádio nem as âncoras do tour da tela real.
const STRIPPED_ATTRIBUTES = ['id', 'name', 'for', 'autofocus', 'data-tour-anchor'];

function canAnimate() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (document.hidden) return false;
  if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function') return false;
  return !(typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function cloneAsGhost(node) {
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  const clone = node.cloneNode(true);
  [clone, ...clone.querySelectorAll('*')].forEach((element) => {
    STRIPPED_ATTRIBUTES.forEach((attribute) => element.removeAttribute(attribute));
  });
  Object.assign(clone.style, {
    position: 'absolute',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
    boxSizing: 'border-box'
  });
  return clone;
}

export default class ScreenTransition extends Component {
  constructor(props) {
    super(props);
    this.layer = null;
    this.cleanupTimer = 0;
  }

  getSnapshotBeforeUpdate(prevProps) {
    const changed = prevProps.transitionKey !== this.props.transitionKey || prevProps.mode !== this.props.mode;
    if (!changed || !canAnimate()) return null;
    const shell = this.props.shellRef?.current;
    if (!shell) return null;

    const leavingTabs = prevProps.mode === 'tabs' && this.props.mode !== 'tabs';
    const main = shell.querySelector('#cq-main');
    const mainGhost = cloneAsGhost(main);
    if (!mainGhost) return null;

    // A barra superior vai junto sempre (cobre o conteúdo antigo que estava sob ela);
    // menu lateral e abas só quando vão sumir.
    const ghosts = [
      cloneAsGhost(shell.querySelector(`.${styles.topBar}`)),
      leavingTabs ? cloneAsGhost(shell.querySelector(`.${styles.sidebar}`)) : null,
      leavingTabs ? cloneAsGhost(shell.querySelector(`.${styles.tabBar}`)) : null
    ].filter(Boolean);

    return { mainGhost, ghosts, mode: prevProps.mode };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!snapshot) return;
    this.removeLayer();

    const layer = document.createElement('div');
    layer.className = styles.screenGhost;
    layer.dataset.shellMode = snapshot.mode;
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('inert', '');
    layer.append(snapshot.mainGhost, ...snapshot.ghosts);
    document.body.appendChild(layer);
    this.layer = layer;

    snapshot.mainGhost.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0.985)' }],
      { duration: EXIT_MS, easing: EXIT_EASING, fill: 'forwards' }
    );
    const exit = layer.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: EXIT_MS, easing: EXIT_EASING, fill: 'forwards' }
    );
    exit.onfinish = () => this.removeLayer(layer);
    // Garantia caso a animação não termine (aba em segundo plano, por exemplo).
    this.cleanupTimer = window.setTimeout(() => this.removeLayer(layer), EXIT_MS + 400);

    const main = this.props.shellRef?.current?.querySelector('#cq-main');
    main?.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: ENTER_MS, delay: ENTER_DELAY_MS, easing: ENTER_EASING, fill: 'backwards' }
    );
  }

  componentWillUnmount() {
    this.removeLayer();
  }

  removeLayer(target = this.layer) {
    if (!target) return;
    target.remove();
    if (target === this.layer) {
      this.layer = null;
      window.clearTimeout(this.cleanupTimer);
    }
  }

  render() {
    return null;
  }
}
