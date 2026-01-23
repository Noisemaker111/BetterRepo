# BetterRepo

> **Contributions Welcome!** You are heavily encouraged to push changes or fixes. Almost all PRs and commits will be accepted after review. Feel free to submit your improvements!

**GitHub:** [https://github.com/Noisemaker111/BetterRepo](https://github.com/Noisemaker111/BetterRepo)

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Convex, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service platform
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system
- **Virtual Repos** - Browse any GitHub repo without cloning

## Virtual Repos

No more cloning every repo into your favorite source folder. `@betterrepo/virtual-repo` gives you a virtual filesystem over any GitHub repository - read files, list directories, and explore code on-demand without touching your disk.

### Usage

```typescript
import { VirtualRepo } from "@betterrepo/virtual-repo";

// Point at any public repo (or private with a token)
const repo = new VirtualRepo("facebook/react", { branch: "main" });

// List root directory
const files = await repo.listdir("");
// → ["packages/", "scripts/", "README.md", "package.json", ...]

// Read any file directly
const readme = await repo.readFile("README.md");

// Check if paths exist
await repo.exists("packages/react");        // true
await repo.isDirectory("packages/react");   // true

// Find files by extension
const tsFiles = await repo.findFiles([".ts", ".tsx"]);

// Get repo metadata
const info = await repo.getRepoInfo();
// → { owner, name, defaultBranch, description, lastCommitSha }
```

### Options

```typescript
new VirtualRepo("owner/repo", {
  branch: "main",           // branch, tag, or commit SHA (default: "main")
  token: "ghp_xxx"          // GitHub token for private repos or higher rate limits
});
```

### API

| Method | Description |
|--------|-------------|
| `listdir(path?)` | List directory contents (files and subdirs) |
| `readFile(path)` | Read file contents as UTF-8 string |
| `exists(path)` | Check if path exists |
| `isDirectory(path)` | Check if path is a directory |
| `findFiles(exts)` | Find all files matching extension(s) |
| `getRepoInfo()` | Get repository metadata |

### How It Works

VirtualRepo uses the GitHub Git Trees API to fetch the entire file tree in a single request, then lazily fetches blob contents on-demand. Results are cached in memory, so repeated reads are instant.

Perfect for AI agents, code analysis tools, or any workflow where you need to explore repos without the overhead of git clone.

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Contributing / Workflow

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the reproducible branch + PR workflow.
Before pushing or requesting review, run:

```bash
bun run check-types
```

## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
bun run dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application.

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Your app will connect to the Convex cloud backend automatically.







## Project Structure

```
BetterRepo/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
├── packages/
│   ├── backend/     # Convex backend functions and schema
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:setup`: Setup and configure your Convex project
- `bun run check-types`: Check TypeScript types across all apps
