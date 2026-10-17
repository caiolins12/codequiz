import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import cx from './cx';
import IconButton from './IconButton';
import styles from './Modal.module.css';

let openModalCount = 0;

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  openModalCount += 1;
  if (openModalCount === 1) {
    document.body.dataset.cqScrollLock = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
  }
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.body.style.overflow = document.body.dataset.cqScrollLock || '';
    delete document.body.dataset.cqScrollLock;
  }
}

// Diálogo centralizado (>= 768px) ou bottom sheet (mobile). O componente pai
// controla a abertura renderizando-o ou não.
export default function Modal({
  onClose = null,
  title = '',
  subtitle = '',
  icon = null,
  tone = 'violet',
  size = 'md',
  centered = false,
  closeOnBackdrop = true,
  showClose = true,
  footer = null,
  className = '',
  bodyClassName = '',
  ariaLabel = '',
  children
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);
  const dismissible = typeof onClose === 'function';

  useEffect(() => {
    if (!portalTarget) return undefined;
    lockBodyScroll();
    const previousFocus = typeof document !== 'undefined' ? document.activeElement : null;
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      unlockBodyScroll();
      if (previousFocus && typeof previousFocus.focus === 'function') {
        try {
          previousFocus.focus({ preventScroll: true });
        } catch {
          // elemento pode ter saído da tela
        }
      }
    };
  }, [portalTarget]);

  useEffect(() => {
    if (!dismissible) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dismissible, onClose]);

  // `icon` aceita emoji (string), elemento JSX ou componente de ícone (lucide).
  let iconNode = null;
  if (typeof icon === 'string') {
    iconNode = <span aria-hidden="true">{icon}</span>;
  } else if (icon && typeof icon === 'object' && 'props' in icon) {
    iconNode = icon;
  } else if (icon) {
    const IconComponent = icon;
    iconNode = <IconComponent aria-hidden="true" strokeWidth={2.4} />;
  }

  if (!portalTarget) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible && closeOnBackdrop) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={cx(styles.panel, styles[size] || '', styles[tone] || '', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? (ariaLabel || undefined) : undefined}
        tabIndex={-1}
      >
        <span className={styles.handle} aria-hidden="true" />
        {title || iconNode ? (
          <div className={cx(styles.header, centered ? styles.headerCentered : '')}>
            {iconNode ? <span className={styles.iconBubble}>{iconNode}</span> : null}
            <div className={styles.headings}>
              {title ? <h2 id={titleId} className={styles.title}>{title}</h2> : null}
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </div>
            {dismissible && showClose && !centered ? (
              <IconButton icon={X} label="Fechar" size="md" className={styles.close} onClick={onClose} />
            ) : null}
          </div>
        ) : null}
        {children ? <div className={cx(styles.body, bodyClassName)}>{children}</div> : null}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    portalTarget
  );
}

export function Toast({ message, icon: Icon = Info }) {
  if (!message) return null;
  return (
    <div className={styles.toastRegion} role="status" aria-live="polite">
      <div key={message} className={styles.toast}>
        <span className={styles.toastIcon} aria-hidden="true">
          <Icon strokeWidth={2.5} />
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}
