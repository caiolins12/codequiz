// Ícones de jogo desenhados em SVG (moeda e XP), com o mesmo contrato dos ícones
// do lucide-react: aceitam className, width/height e props extras.

export function CoinIcon({ className = '', title, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12.6" r="10" fill="#d99a12" />
      <circle cx="12" cy="11.4" r="10" fill="#ffd24a" />
      <circle cx="12" cy="11.4" r="7.3" fill="none" stroke="#f0b520" strokeWidth="1.6" />
      <path d="M12 6.9l1.45 2.95 3.25.47-2.35 2.29.56 3.24L12 14.32l-2.91 1.53.56-3.24-2.35-2.29 3.25-.47z" fill="#fff3c4" />
    </svg>
  );
}

export function XpIcon({ className = '', title, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 1.8l8.6 5v10.4L12 22.2l-8.6-5V6.8z" fill="#2c63d1" />
      <path d="M12 1.2l8.6 5v10.4L12 21.6l-8.6-5V6.2z" fill="#4c8dff" />
      <path d="M13.4 5.5L8.2 12.6h3.3l-1 5.9 5.3-7.4h-3.4z" fill="#eaf2ff" />
    </svg>
  );
}

export function GemIcon({ className = '', ...rest }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...rest}>
      <path d="M6 3.5h12l4 5.2L12 21 2 8.7z" fill="#a690ff" />
      <path d="M6 3.5L9 8.7h6l3-5.2zM2 8.7h7l3 12.3zM22 8.7h-7L12 21z" fill="#7b5cff" />
      <path d="M9 8.7h6L12 21z" fill="#c9bcff" />
    </svg>
  );
}
