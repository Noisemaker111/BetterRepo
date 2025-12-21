import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthContainer } from "@/components/auth-container";
import { OpencodeChat } from "@/components/opencode-chat";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="p-6">
      <Authenticated>
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Opencode Agent</h1>
            <p className="text-muted-foreground">Talk to the repository and get things done.</p>
          </div>
          <OpencodeChat />
        </div>
      </Authenticated>
      <Unauthenticated>
        <AuthContainer />
      </Unauthenticated>
    </div>
  );
}
