import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Book, FileCode, GitBranch, Star, Eye, ChevronRight, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$owner/$repo/")({
  component: RepoIndex,
});

function RepoIndex() {
  const { owner, repo: repoName } = Route.useParams();
  const repository = useQuery(api.repositories.queries.getByName, { owner, name: repoName });

  if (repository === undefined) return null;
  if (!repository) return <div>Not found</div>;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row gap-8">
          <main className="flex-1 space-y-6">
            {/* Repo Header - simplified since breadcrumb has info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-widest">
                  Public
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

            {/* File List Placeholder */}
            <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
              <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>main</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Updated 2 hours ago
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { name: "src", type: "dir", date: "2 days ago", msg: "feat: add repository layout" },
                  { name: "public", type: "dir", date: "5 days ago", msg: "chore: update assets" },
                  { name: "package.json", type: "file", date: "1 day ago", msg: "refactor: optimize dependencies" },
                  { name: "README.md", type: "file", date: "2 hours ago", msg: "docs: update breadcrumb documentation" },
                  { name: "tsconfig.json", type: "file", date: "1 week ago", msg: "init: project setup" },
                ].map((file) => (
                  <div key={file.name} className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.01] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      {file.type === "dir" ? (
                        <Book className="w-4 h-4 text-primary/60" />
                      ) : (
                        <File className="w-4 h-4 text-muted-foreground/60" />
                      )}
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="hidden md:block text-xs text-muted-foreground/60 truncate max-w-[200px]">{file.msg}</span>
                      <span className="text-xs text-muted-foreground/40 w-[80px] text-right">{file.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* README Placeholder */}
            <div className="glass-card rounded-2xl border-white/5 p-8 text-left space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground/60 border-b border-white/5 pb-4">
                <FileCode className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">README.md</span>
              </div>
              <article className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-display font-bold mb-4">{repository.name}</h1>
                <p className="text-muted-foreground leading-relaxed">
                  {repository.description || "A revolutionary project powered by BetterRepo. Built with precision and managed with excellence."}
                </p>
                <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/10">
                  <h3 className="text-lg font-bold text-primary mb-2">Getting Started</h3>
                  <code className="block bg-black/40 p-4 rounded-lg text-xs font-mono border border-white/5">
                    git clone https://betterrepo.com/{owner}/{repoName}.git
                  </code>
                </div>
              </article>
            </div>
          </main>

          <aside className="w-full md:w-80 space-y-6">
            <div className="glass-card rounded-2xl border-white/5 p-6 space-y-4 text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">About</h3>
              <p className="text-sm text-muted-foreground">
                {repository.description || "No description provided."}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="bg-white/5 border-none text-[10px] font-bold">typescript</Badge>
                <Badge variant="secondary" className="bg-white/5 border-none text-[10px] font-bold">react</Badge>
                <Badge variant="secondary" className="bg-white/5 border-none text-[10px] font-bold">convex</Badge>
              </div>
            </div>

            <div className="glass-card rounded-2xl border-white/5 p-6 space-y-4 text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Languages</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500 w-[70%]" />
                    <div className="h-full bg-yellow-500 w-[20%]" />
                    <div className="h-full bg-purple-500 w-[10%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> TypeScript 70%</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> JavaScript 20%</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> CSS 10%</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
