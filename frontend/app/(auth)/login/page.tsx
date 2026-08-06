export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Mentor AI</h1>
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none">Email</label>
            <input type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium leading-none">Password</label>
            <input type="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground h-10 rounded-md font-medium mt-4">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
