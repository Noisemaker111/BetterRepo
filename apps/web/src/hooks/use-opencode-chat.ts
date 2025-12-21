import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RepositoryContext {
  owner: string;
  repo: string;
  path?: string;
}

export function useOpencodeChat(context?: RepositoryContext) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sendMessageAction = useAction(api.opencode.sendMessage);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessageAction({
        message: input,
        context: context ? {
          repository: `${context.owner}/${context.repo}`,
          currentPath: context.path || "",
        } : undefined,
      });
      const assistantMessage: Message = {
        role: "assistant",
        content: response.content || "Agent responded but with no content.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Failed to connect to Opencode server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sendMessageAction, context]);

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
