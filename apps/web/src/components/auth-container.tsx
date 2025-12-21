import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function AuthContainer() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 glass-card rounded-2xl max-w-md mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Sign in required</h2>
        <p className="text-muted-foreground">
          Please sign in to access this content.
        </p>
      </div>
      <div className="flex gap-4">
        <Link to="/auth">
          <Button className="rounded-full px-6">Sign In</Button>
        </Link>
      </div>
    </div>
  );
}
