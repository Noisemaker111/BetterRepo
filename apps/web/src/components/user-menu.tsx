import { api } from "@BetterRepo/backend/convex/_generated/api";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Settings, LogOut, User } from "lucide-react";

export default function UserMenu() {
  const navigate = useNavigate();
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-white/10 hover:border-primary/50 transition-colors"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
          </Button>
        }
      />
      <DropdownMenuContent
        className="w-56 bg-card/95 backdrop-blur-xl border-white/10 rounded-2xl p-2"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1 p-2 text-left">
              <p className="text-sm font-bold leading-none">{user?.name || "User"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuGroup className="space-y-1">
          <DropdownMenuItem
            className="rounded-xl focus:bg-primary/10 transition-colors cursor-pointer"
          >
            <Link
              to="/settings"
              className="flex items-center gap-2 w-full"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="rounded-xl focus:bg-destructive/10 text-destructive transition-colors cursor-pointer flex items-center gap-2"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({
                      to: "/auth",
                    });
                  },
                },
              });
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
