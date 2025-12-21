import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Book, FileCode, GitBranch, Star, Eye, File, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/$owner/$repo/")({
  component: RepoIndex,
});

// Language colors for the language bar
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Scala: "#c22d40",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  Markdown: "#083fa1",
};

function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || "#6e7681";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
  return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
}

function RepoIndex() {
  const { owner, repo: repoName } = Route.useParams();
  const repository = useQuery(api.repositories.queries.getByName, { owner, name: repoName });
  const recordVisit = useMutation(api.repositories.mutations.recordVisit);
  const getRepoViewData = useAction(api.github.actions.getRepoViewData);

  const [isLoading, setIsLoading] = useState(true);
  const [repoData, setRepoData] = useState<{
    error: string | null;
    contents: Array<{
      name: string;
      path: string;
      type: "file" | "dir";
      size: number;
      sha: string;
      lastCommit: { message: string; date: string; authorName: string } | null;
    }> | null;
    readme: { content: string; name: string } | null;
    languages: { [lang: string]: number } | null;
    branches: Array<{ name: string; isDefault: boolean }> | null;
    lastCommit: {
      sha: string;
      message: string;
      date: string;
      authorName: string;
      authorAvatar: string | null;
    } | null;
  } | null>(null);

  useEffect(() => {
    if (repository?._id) {
      recordVisit({ repositoryId: repository._id });
    }
  }, [repository?._id, recordVisit]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await getRepoViewData({ owner, repo: repoName });
        setRepoData(data);
      } catch (err) {
        console.error("Failed to fetch repo data:", err);
        setRepoData({
          error: err instanceof Error ? err.message : "Failed to fetch repository data",
          contents: null,
          readme: null,
          languages: null,
          branches: null,
          lastCommit: null,
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [owner, repoName, getRepoViewData]);

  if (repository === undefined) return null;
  if (!repository) return <div className="p-8 text-center text-muted-foreground">Repository not found</div>;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row gap-8">
          <main className="flex-1 space-y-6">
            {/* Repo Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-widest">
                  {repository.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-full glass border-white/5 h-8 text-[10px] font-bold uppercase tracking-wider">
                  <Star className="w-3 h-3 mr-1.5 text-yellow-500" /> Star
                </Button>
                <Button variant="outline" size="sm" className="rounded-full glass border-white/5 h-8 text-[10px] font-bold uppercase tracking-wider">
                  <Eye className="w-3 h-3 mr-1.5 text-primary" /> Watch
                </Button>
              </div>
            </div>

            {/* File List */}
            <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
              <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <GitBranch className="w-3.5 h-3.5" />
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>{repository.githubDefaultBranch ?? "main"}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                {repoData?.lastCommit && (
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="font-mono text-primary/80">{repoData.lastCommit.sha}</span>
                    <span className="truncate max-w-[200px]">{repoData.lastCommit.message}</span>
                    <span>•</span>
                    <span>{formatDate(repoData.lastCommit.date)}</span>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading repository contents...</span>
                </div>
              ) : repoData?.error ? (
                <div className="flex items-center justify-center py-16 text-amber-500">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">{repoData.error}</span>
                </div>
              ) : repoData?.contents && repoData.contents.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {repoData.contents.map((file) => (
                    <div key={file.sha} className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.01] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        {file.type === "dir" ? (
                          <Book className="w-4 h-4 text-primary/60" />
                        ) : (
                          <File className="w-4 h-4 text-muted-foreground/60" />
                        )}
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="hidden md:block text-xs text-muted-foreground/60 truncate max-w-[200px]">
                          {file.lastCommit?.message ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground/40 w-[80px] text-right">
                          {file.lastCommit ? formatDate(file.lastCommit.date) : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <span className="text-sm">No files found in this repository</span>
                </div>
              )}
            </div>

            {/* README */}
            {repoData?.readme ? (
              <div className="glass-card rounded-2xl border-white/5 p-8 text-left space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground/60 border-b border-white/5 pb-4">
                  <FileCode className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{repoData.readme.name}</span>
                </div>
                <article className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-primary prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {repoData.readme.content}
                  </ReactMarkdown>
                </article>
              </div>
            ) : !isLoading && (
              <div className="glass-card rounded-2xl border-white/5 p-8 text-left space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground/60 border-b border-white/5 pb-4">
                  <FileCode className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">README.md</span>
                </div>
                <article className="prose prose-invert max-w-none">
                  <h1 className="text-3xl font-display font-bold mb-4">{repository.name}</h1>
                  <p className="text-muted-foreground leading-relaxed">
                    {repository.description || "No README found for this repository."}
                  </p>
                </article>
              </div>
            )}
          </main>

          <aside className="w-full md:w-80 space-y-6">
            <div className="glass-card rounded-2xl border-white/5 p-6 space-y-4 text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">About</h3>
              <p className="text-sm text-muted-foreground">
                {repository.description || "No description provided."}
              </p>
              {repository.githubUrl && (
                <a
                  href={repository.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  View on GitHub →
                </a>
              )}
            </div>

            {/* Languages */}
            {repoData?.languages && Object.keys(repoData.languages).length > 0 && (
              <div className="glass-card rounded-2xl border-white/5 p-6 space-y-4 text-left">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Languages</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                      {Object.entries(repoData.languages)
                        .sort(([, a], [, b]) => b - a)
                        .map(([lang, percent]) => (
                          <div
                            key={lang}
                            className="h-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: getLanguageColor(lang)
                            }}
                          />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-medium">
                      {Object.entries(repoData.languages)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([lang, percent]) => (
                          <span key={lang} className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getLanguageColor(lang) }}
                            />
                            {lang} {percent}%
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Branches */}
            {repoData?.branches && repoData.branches.length > 0 && (
              <div className="glass-card rounded-2xl border-white/5 p-6 space-y-4 text-left">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Branches</h3>
                <div className="flex flex-wrap gap-2">
                  {repoData.branches.slice(0, 8).map((branch) => (
                    <Badge
                      key={branch.name}
                      variant="secondary"
                      className={`bg-white/5 border-none text-[10px] font-bold ${branch.name === repository.githubDefaultBranch ? "ring-1 ring-primary/30" : ""
                        }`}
                    >
                      {branch.name}
                    </Badge>
                  ))}
                  {repoData.branches.length > 8 && (
                    <Badge variant="secondary" className="bg-white/5 border-none text-[10px] font-bold">
                      +{repoData.branches.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
