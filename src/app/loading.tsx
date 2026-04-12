export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface" aria-label="Chargement en cours">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" aria-hidden="true" />
        <p className="text-on-surface-variant text-sm font-medium">Chargement…</p>
      </div>
    </div>
  )
}
