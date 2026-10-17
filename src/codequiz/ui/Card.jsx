import cx from './cx';
import styles from './Card.module.css';

const PADDING = { none: styles.padNone, sm: styles.padSm, md: styles.padMd, lg: styles.padLg };

// Card genérico. `interactive` renderiza um <button> (ou passe `as`).
export default function Card({
  as,
  variant = 'surface',
  padding = 'md',
  interactive = false,
  selected = false,
  tone = '',
  className = '',
  style,
  children,
  ...rest
}) {
  const Component = as || (interactive ? 'button' : 'div');
  const toneStyle = tone ? { '--card-tone': tone, ...style } : style;
  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      className={cx(
        styles.card,
        variant !== 'surface' ? styles[variant] : '',
        PADDING[padding] || '',
        interactive ? styles.interactive : '',
        selected ? styles.selected : '',
        tone ? styles.toned : '',
        className
      )}
      style={toneStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}
