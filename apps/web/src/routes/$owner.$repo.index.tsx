import { useEffect, useState, useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import type { Id } from "@BetterRepo/backend/convex/_generated/dataModel";
import { Book, FileCode, GitBranch, Star, File, Loader2, AlertCircle, ChevronDown, ChevronRight, Folder, MoreVertical, Download, Copy, ExternalLink, X, FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    java: "java",
    go: "go",
    rs: "rust",
    rb: "ruby",
    php: "php",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    swift: "swift",
    kt: "kotlin",
    scala: "scala",
    html: "html",
    css: "css",
    scss: "scss",
    vue: "vue",
    svelte: "svelte",
    sh: "bash",
    bash: "bash",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    markdown: "markdown",
    sql: "sql",
    dockerfile: "dockerfile",
  };
  return languageMap[ext] || "";
}

interface FileItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  sha: string;
  lastCommit: { message: string; date: string; authorName: string } | null;
}

function RepoIndex() {
  const { owner, repo: repoName } = Route.useParams();
  const navigate = useNavigate();
  const repository = useQuery(api.repositories.queries.getByNameWithStats, { owner, name: repoName });
  const recordVisit = useMutation(api.repositories.mutations.recordVisit);
  const getRepoViewData = useAction(api.github.actions.getRepoViewData);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [repoData, setRepoData] = useState<{
    error: string | null;
    contents: FileItem[] | null;
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

  const pathParts = currentPath ? currentPath.split("/") : [];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRepoViewData({ owner, repo: repoName, path: currentPath || undefined, ref: selectedBranch || undefined });
      setRepoData(data as typeof repoData);
      if (data.branches && data.branches.length > 0 && !selectedBranch) {
        const defaultBranch = data.branches.find(b => b.isDefault);
        setSelectedBranch(defaultBranch?.name || data.branches[0].name);
      }
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
  }, [owner, repoName, currentPath, selectedBranch, getRepoViewData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (repository?._id) {
      recordVisit({ repositoryId: repository._id });
    }
  }, [repository?._id, recordVisit]);

  const handleFolderClick = (folderName: string, folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentPath("");
    } else {
      setCurrentPath(pathParts.slice(0, index + 1).join("/"));
    }
  };

  const handleFileClick = async (file: FileItem) => {
    setSelectedFile(file);
    setIsLoadingFile(true);
    setFileContent(null);

    try {
      const data = await getRepoViewData({ owner, repo: repoName, path: file.path });
      if (data && data.content) {
        setFileContent(data.content);
      } else {
        setFileContent(null);
      }
    } catch (err) {
      console.error("Failed to fetch file content:", err);
      setFileContent(null);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  const handleDownload = (file: FileItem) => {
    if (fileContent) {
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleViewOnGitHub = (file: FileItem) => {
    window.open(`${repository?.githubUrl}/blob/${repository?.githubDefaultBranch ?? "main"}/${file.path}`, "_blank");
  };

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
            </div>

            {/* Breadcrumb */}
            {currentPath && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <button onClick={() => handleBreadcrumbClick(-1)} className="hover:text-foreground transition-colors flex items-center gap-1">
                  <Folder className="w-4 h-4" />
                  <span className="font-medium">{repoName}</span>
                </button>
                {pathParts.map((part, index) => (
                  <div key={part} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className={`hover:text-foreground transition-colors ${index === pathParts.length - 1 ? "text-foreground font-medium" : ""}`}
                    >
                      {part}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search code..."
                className="pl-10 rounded-lg glass border-white/5 bg-white/5 h-9"
              />
            </div>

            {/* File List */}
            <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
              <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <GitBranch className="w-3.5 h-3.5" />
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <GitBranch className="w-3.5 h-3.5" />
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <span>{selectedBranch || (repository.githubDefaultBranch ?? "main")}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-auto">
                        {repoData?.branches?.map((branch) => (
                          <DropdownMenuItem
                            key={branch.name}
                            onClick={() => setSelectedBranch(branch.name)}
                            className="cursor-pointer"
                          >
                            <GitBranch className="w-4 h-4 mr-2" />
                            {branch.name}
                            {branch.isDefault && <span className="ml-auto text-[9px] text-muted-foreground">default</span>}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
                    <div
                      key={file.sha}
                      className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => file.type === "dir" ? handleFolderClick(file.name, file.path) : handleFileClick(file)}
                    >
                      <div className="flex items-center gap-3">
                        {file.type === "dir" ? (
                          <Folder className="w-4 h-4 text-primary/60" />
                        ) : (
                          <File className="w-4 h-4 text-muted-foreground/60" />
                        )}
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="hidden md:block text-xs text-muted-foreground/60 truncate max-w-[200px]">
                          {file.lastCommit?.message ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground/40 w-[80px] text-right">
                          {file.lastCommit ? formatDate(file.lastCommit.date) : "—"}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 hover:bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyPath(file.path); }}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy path
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewOnGitHub(file); }}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on GitHub
                            </DropdownMenuItem>
                            {file.type === "file" && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(file); }}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                <article className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-primary prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/5">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code(props) {
                        const { inline, className, children, ...rest } = props as { inline?: boolean; className?: string; children?: React.ReactNode; [key: string]: unknown };
                        const match = /language-(\w+)/.exec(className || "");
                        if (!inline && match) {
                          return (
                            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "13px" }} {...rest}>
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          );
                        }
                        return <code className={className} {...rest}>{children}</code>;
                      },
                    }}
                  >
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
              <Button variant="outline" size="sm" className="rounded-full glass border-white/5 h-8 text-[10px] font-bold uppercase tracking-wider">
                <Star className="w-3 h-3 mr-1.5 text-yellow-500" /> {repository.starCount || 0}
              </Button>
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

      {/* File Preview Modal */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          {selectedFile && (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{selectedFile.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedFile.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleCopyPath(selectedFile.path)}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy path
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleViewOnGitHub(selectedFile)}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    GitHub
                  </Button>
                  {fileContent && (
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(selectedFile)}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {isLoadingFile ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading file content...</span>
                  </div>
                ) : fileContent ? (
                  <SyntaxHighlighter
                    language={getLanguageFromFilename(selectedFile.name)}
                    style={vscDarkPlus}
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      background: "transparent",
                      fontSize: "13px",
                    }}
                  >
                    {fileContent}
                  </SyntaxHighlighter>
                ) : (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <span className="text-sm">Unable to load file content</span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
