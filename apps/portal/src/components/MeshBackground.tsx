/**
 * Animated gradient-mesh background — pure CSS, GPU-accelerated.
 * Drop into a parent with `relative overflow-hidden`.
 */
export default function MeshBackground({ variant = 'default' }: { variant?: 'default' | 'login' }) {
  return (
    <>
      <div className="mesh-bg" aria-hidden />
      {variant === 'login' && (
        <>
          {/* extra accent orb */}
          <div
            className="absolute pointer-events-none rounded-full blur-3xl opacity-30 animate-gradient-shift"
            style={{
              width: 420,
              height: 420,
              left: '40%',
              top: '40%',
              background: 'radial-gradient(circle, rgba(245,214,141,0.35), transparent 70%)'
            }}
            aria-hidden
          />
        </>
      )}
      <div className="noise-overlay absolute inset-0 pointer-events-none" aria-hidden />
    </>
  );
}
