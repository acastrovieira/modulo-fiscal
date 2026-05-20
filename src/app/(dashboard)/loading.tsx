export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="h-8 w-64 rounded bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 rounded-lg border bg-white p-4">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-6 h-8 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
