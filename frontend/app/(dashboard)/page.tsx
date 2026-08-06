export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Mentor AI dashboard.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="font-semibold leading-none tracking-tight">Statistic {i}</h3>
            <p className="text-2xl font-bold mt-2">1,234</p>
          </div>
        ))}
      </div>
    </div>
  );
}
