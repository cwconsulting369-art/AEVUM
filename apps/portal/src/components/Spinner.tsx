/** Premium orbit-spinner — 3 gold dots in orbit. */
export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const px = size === 'sm' ? 36 : size === 'lg' ? 96 : 72;
  return (
    <div className="orbit-spinner" style={{ width: px, height: px }} aria-label="Lade…" role="status">
      <span className="orbit-dot" />
      <span className="orbit-dot" />
      <span className="orbit-dot" />
    </div>
  );
}
