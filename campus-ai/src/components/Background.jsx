export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-base)' }} />

      {/* Blob 1 */}
      <div className="bg-blob absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(67,56,202,0.35) 0%, transparent 70%)', opacity: 0.4 }} />

      {/* Blob 2 */}
      <div className="bg-blob absolute bottom-[-15%] right-[-5%] w-[55%] h-[55%] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.30) 0%, transparent 70%)', opacity: 0.3 }} />

      {/* Blob 3 */}
      <div className="bg-blob absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.40) 0%, transparent 70%)', opacity: 0.2 }} />

      {/* Grid */}
      <div className="bg-grid absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(var(--bg-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.025,
        }} />

      {/* Vignette */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,22,0.6) 100%)' }} />
    </div>
  )
}