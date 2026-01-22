import { Octokit } from "@octokit/rest";

export type RepoInfo = {
  owner: string;
  name: string;
  defaultBranch: string;
  description?: string;
  lastCommitSha?: string;
};

export type TreeEntry = { path: string; type: "blob" | "tree"; sha: string };

type RawTreeEntry = {
  path?: string;
  type?: string;
  sha?: string;
};

function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

function decodeBase64ToUtf8(base64: string): string {
  // Node.js
  const maybeBuffer = (globalThis as unknown as { Buffer?: typeof Buffer }).Buffer;
  if (typeof maybeBuffer !== "undefined") {
    return maybeBuffer.from(base64, "base64").toString("utf-8");
  }

  // Browser
  if (typeof atob !== "undefined" && typeof TextDecoder !== "undefined") {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  }

  throw new Error("No base64 decoder available in this environment");
}

export class VirtualRepo {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private ref: string; // branch or commit sha
  private treeCache: Map<string, TreeEntry[]> = new Map(); // owner/repo/ref → entries
  private blobCache: Map<string, string> = new Map(); // sha → content

  constructor(
    repoSlug: string, // "owner/repo"
    options: { branch?: string; token?: string } = {},
  ) {
    const [owner, repo] = repoSlug.split("/");
    if (!owner || !repo) throw new Error("Invalid repo slug: use 'owner/repo'");

    this.owner = owner;
    this.repo = repo;
    this.ref = options.branch ?? "main";

    const auth = options.token ? { auth: options.token } : undefined;
    this.octokit = new Octokit(auth);
  }

  private async getFullTree(): Promise<TreeEntry[]> {
    const key = `${this.owner}/${this.repo}/${this.ref}`;
    const cached = this.treeCache.get(key);
    if (cached) return cached;

    const { data } = await this.octokit.rest.git.getTree({
      owner: this.owner,
      repo: this.repo,
      tree_sha: this.ref,
      recursive: "true",
    });

    if (data.truncated) {
      // Fallback to what GitHub returned; callers can still use listdir/readFile.
      // Future improvement: fetch subtrees to complete the tree.
    }

    const entries = (data.tree ?? [])
      .filter((e): e is RawTreeEntry => typeof e === "object" && e !== null)
      .filter(
        (e): e is { path: string; type: "blob" | "tree"; sha: string } =>
          (e.type === "blob" || e.type === "tree") && typeof e.path === "string" && typeof e.sha === "string",
      )
      .map((e) => ({ path: e.path, type: e.type, sha: e.sha }));

    this.treeCache.set(key, entries);
    return entries;
  }

  async listdir(path: string = ""): Promise<string[]> {
    const normalized = normalizePath(path);
    const prefix = normalized ? `${normalized}/` : "";

    const tree = await this.getFullTree();
    const set = new Set<string>();

    for (const entry of tree) {
      if (entry.path.startsWith(prefix)) {
        const relative = entry.path.slice(prefix.length);
        const slashIndex = relative.indexOf("/");
        if (slashIndex === -1) {
          // direct child
          set.add(relative);
        } else {
          // subdirectory
          set.add(`${relative.slice(0, slashIndex)}/`);
        }
      }
    }

    return Array.from(set);
  }

  async readFile(path: string): Promise<string> {
    const normalized = path.replace(/^\/+/, "");
    const tree = await this.getFullTree();
    const entry = tree.find((e) => e.path === normalized && e.type === "blob");

    if (!entry) throw new Error(`File not found: ${path}`);
    const cached = this.blobCache.get(entry.sha);
    if (cached) return cached;

    const { data } = await this.octokit.rest.git.getBlob({
      owner: this.owner,
      repo: this.repo,
      file_sha: entry.sha,
    });

    const content = decodeBase64ToUtf8(data.content);
    this.blobCache.set(entry.sha, content);
    return content;
  }

  async exists(path: string): Promise<boolean> {
    const normalized = normalizePath(path);
    if (normalized === "") return true;

    const tree = await this.getFullTree();
    return tree.some((e) => e.path === normalized || e.path.startsWith(`${normalized}/`));
  }

  async isDirectory(path: string): Promise<boolean> {
    const normalized = normalizePath(path);
    if (normalized === "") return true;

    const tree = await this.getFullTree();
    return tree.some((e) => e.path.startsWith(`${normalized}/`));
  }

  async getRepoInfo(): Promise<RepoInfo> {
    const { data } = await this.octokit.rest.repos.get({
      owner: this.owner,
      repo: this.repo,
    });

    let lastCommitSha: string | undefined;
    try {
      const { data: ref } = await this.octokit.rest.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${data.default_branch}`,
      });
      lastCommitSha = ref.object.sha;
    } catch {
      // Best-effort.
    }

    return {
      owner: this.owner,
      name: this.repo,
      defaultBranch: data.default_branch,
      description: data.description ?? undefined,
      lastCommitSha,
    };
  }

  // Bonus agent helpers
  async findFiles(exts: string | string[]): Promise<string[]> {
    const extensions = Array.isArray(exts) ? exts : [exts];
    const tree = await this.getFullTree();
    return tree
      .filter((e) => e.type === "blob" && extensions.some((ext) => e.path.endsWith(ext)))
      .map((e) => e.path);
  }
}
