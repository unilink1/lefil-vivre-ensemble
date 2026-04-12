export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface" aria-label="Chargement du tableau de bord">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" aria-hidden="true" />
        <p className="text-on-surface-variant text-sm font-medium">Chargement…</p>
      </div>
    </div>
  )
}
