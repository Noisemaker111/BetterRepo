import { Link } from "@tanstack/react-router";

export function RouterNotFound() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="container py-14">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">404</p>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            That route does not exist. If you followed a link, it might be stale.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full px-4 h-9 text-xs font-bold bg-primary text-primary-foreground"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
