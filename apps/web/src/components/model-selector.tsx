import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export const MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", label: "anthropic/claude-sonnet-4.5" },
  { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", label: "anthropic/claude-opus-4.5" },
  { id: "google/gemini-1.5-flash", name: "Gemini 1.5 Flash", label: "google/gemini-3-flash-preview" },
  { id: "openai/gpt-4o", name: "GPT-4o", label: "openai/gpt-5.1-codex" },
];

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);

  useEffect(() => {
    const saved = localStorage.getItem("selectedModel");
    if (saved) {
      const model = MODELS.find(m => m.id === saved);
      if (model) setSelectedModel(model);
    }
  }, []);

  const handleSelect = (model: typeof MODELS[0]) => {
    setSelectedModel(model);
    localStorage.setItem("selectedModel", model.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            {selectedModel.label}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-[240px]">
        {MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => handleSelect(model)}
            className="flex flex-col items-start gap-1"
          >
            <span className="font-medium">{model.label}</span>
            <span className="text-xs text-muted-foreground">{model.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
