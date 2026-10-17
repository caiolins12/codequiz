// Junta classes CSS ignorando valores vazios.
export default function cx(...values) {
  return values
    .flat()
    .filter((value) => typeof value === 'string' && value.trim())
    .join(' ');
}
