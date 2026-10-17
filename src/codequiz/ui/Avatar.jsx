import { AvatarImage, isImageAvatarValue } from '../app/helpers';
import cx from './cx';
import styles from './Avatar.module.css';

// Avatar com cosméticos da loja: `frameClass` (cos-frame-*) e `frameStyle`
// vêm de getAvatarFrameClass/getAvatarFrameStyle (lib/shop.js).
export default function Avatar({
  avatar = '🙂',
  frameClass = 'cos-frame-default',
  frameStyle,
  size = 'md',
  badge = null,
  alt = '',
  className = '',
  ...rest
}) {
  const value = String(avatar || '').trim() || '🙂';
  const fallback = <span className={styles.emoji} aria-hidden="true">🙂</span>;
  return (
    <span
      className={cx('cq-avatar', styles.avatar, styles[size] || '', frameClass, className)}
      style={frameStyle}
      {...rest}
    >
      <span className={styles.content}>
        {isImageAvatarValue(value) ? (
          <AvatarImage className={styles.image} src={value} alt={alt} fallback={fallback} />
        ) : (
          <span className={styles.emoji} role={alt ? 'img' : undefined} aria-label={alt || undefined}>{value}</span>
        )}
      </span>
      {badge !== null && badge !== undefined && badge !== '' ? <span className={styles.badge}>{badge}</span> : null}
    </span>
  );
}
