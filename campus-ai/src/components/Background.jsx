export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base dark */}
      <div className="absolute inset-0 bg-night-950" />

      {/* Mesh blobs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(67,56,202,0.35) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-15%] right-[-5%] w-[55%] h-[55%] rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full blur-2xl opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(129,140,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,22,0.8) 100%)',
        }}
      />
    </div>
  )
}
