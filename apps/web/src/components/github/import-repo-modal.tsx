/**
 * Import GitHub Repository Modal
 * Allows users to browse and import their GitHub repositories
 */

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Github,
    Search,
    Lock,
    Globe,
    RefreshCw,
    CheckCircle2,
    Loader2,
    ExternalLink,
    Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GitHubRepo } from "@/hooks/use-github-integration";

interface ImportGitHubRepoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableRepos: GitHubRepo[];
    syncedRepoIds: number[];
    isLoading: boolean;
    onRefresh: () => void;
    onImport: (fullName: string) => Promise<{ repositoryId: string; hasWebhook: boolean }>;
}

export function ImportGitHubRepoModal({
    open,
    onOpenChange,
    availableRepos,
    syncedRepoIds,
    isLoading,
    onRefresh,
    onImport,
}: ImportGitHubRepoModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [importingRepo, setImportingRepo] = useState<string | null>(null);

    // Fetch repos when modal opens
    useEffect(() => {
        if (open && availableRepos.length === 0) {
            onRefresh();
        }
    }, [open, availableRepos.length, onRefresh]);

    const filteredRepos = availableRepos.filter(
        (repo) =>
            repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleImport = async (repo: GitHubRepo) => {
        setImportingRepo(repo.fullName);
        try {
            const result = await onImport(repo.fullName);
            toast.success(`Successfully imported ${repo.name}!`, {
                description: result.hasWebhook
                    ? "Webhook configured for real-time sync"
                    : "Manual sync available",
            });
        } catch (error) {
            toast.error(`Failed to import ${repo.name}`, {
                description: error instanceof Error ? error.message : "Unknown error",
            });
        } finally {
            setImportingRepo(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        Import from GitHub
                    </DialogTitle>
                    <DialogDescription>
                        Select a repository to import. Issues and pull requests will be synced automatically.
                    </DialogDescription>
                </DialogHeader>

                {/* Search and Refresh */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search repositories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </Button>
                </div>

                {/* Repository List */}
                <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredRepos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Github className="w-12 h-12 mb-4 opacity-50" />
                            <p>No repositories found</p>
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-2"
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredRepos.map((repo) => {
                            const isSynced = syncedRepoIds.includes(repo.id);
                            const isImporting = importingRepo === repo.fullName;

                            return (
                                <div
                                    key={repo.id}
                                    className={cn(
                                        "p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all",
                                        isSynced && "border-green-500/30 bg-green-500/5"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {repo.private ? (
                                                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                                ) : (
                                                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                                                )}
                                                <span className="font-semibold truncate">{repo.name}</span>
                                                <span className="text-muted-foreground text-sm truncate">
                                                    {repo.owner}
                                                </span>
                                                {repo.permissions?.admin && (
                                                    <Badge variant="outline" className="text-xs shrink-0">
                                                        Admin
                                                    </Badge>
                                                )}
                                            </div>
                                            {repo.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {repo.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0">
                                            {isSynced ? (
                                                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Synced
                                                </Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleImport(repo)}
                                                    disabled={isImporting}
                                                    className="gap-2"
                                                >
                                                    {isImporting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Importing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-4 h-4" />
                                                            Import
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span>Branch: {repo.defaultBranch}</span>
                                        <span>•</span>
                                        <span>Updated: {new Date(repo.updatedAt).toLocaleDateString()}</span>
                                        <a
                                            href={repo.htmlUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                                        >
                                            View on GitHub
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
