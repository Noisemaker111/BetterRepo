
# BetterRepo

TypeScript monorepo for a GitHub-like task manager with AI chat features powered by Convex.

## Commands
- `bun run dev` - Start development environment (Turbo: web + backend)
- `bun run build` - Build all workspaces
- `bun run check-types` - Type check all workspaces
- `bun run dev:web` - Start only the web frontend
- `bun run dev:server` - Start only the Convex backend

## Development Workflow
- **Monitor terminal**: Always watch for Convex build errors - they prevent functions from working.
- **Schema**: Define tables and indexes in `packages/backend/convex/schema.ts`.
- **Type Generation**: If you see "Could not resolve './_generated/server'" errors, run `npx convex dev --once` in the backend package.

## Devin Review (PR review workflow)

**Source of truth**: When Devin Review is available for a PR, use it as the primary guide for review work.

### Required workflow
1. Open the PR in Devin Review (web or URL shortcut).
2. In the Analysis sidebar, enumerate:
   - **Bugs (Severe / Non-severe)**
   - **Flags (Investigate / Informational)**
3. Convert the items into a TODO list where each TODO maps to a specific file + change.
4. Implement fixes **only** for items that are explicitly present in the Devin Review output.
5. Re-run the relevant build/tests.
6. Re-check Devin Review and ensure issues are resolved (or mark items resolved with justification).

### Hard rule: no guessing
- Do **not** implement “likely” fixes based on intuition when Devin Review is the requested guide.
- If Devin Review details are inaccessible (login wall, CLI limitations), request the user to paste the exact findings text or screenshots.

### Access notes
- Web: replace `github.com` with `devinreview.com` in a PR URL.
- CLI: `npx devin-review <pr-url>` must be run from within a local clone and may require a real TTY.
- Browser automation: use Playwright MCP for navigation/snapshots (but do not attempt credential entry unless the user is present to complete login).

## Agent ergonomics (reduce back-and-forth)

Default to forward progress with safe assumptions. Only ask clarifying questions when the choice materially changes scope/risk.

### Commit / push defaults
- If the user asks to **commit local changes**, assume **all current modified files** are intended *unless* they look unrelated (different subsystem) or sensitive.
- When multiple files are modified, prefer **splitting into 1–3 logical commits** without asking (docs vs code, etc.).
- If the user says “commit this to the PR/branch”, assume they also want a **push** to update the PR unless they explicitly say “local only / don’t push”.

### What still requires explicit confirmation
- Committing or pushing changes that include secrets (`.env`, credential files, tokens).
- Any destructive git operation (reset/force-push/rewrite history).
- Ambiguity with >2x effort difference or high chance of doing the wrong thing.

## Environment URLs
- Dev frontend: `http://localhost:3001`
- Dev backend (Convex deployment): `https://flippant-whale-959.convex.cloud`
- Opencode Server: Configured via `OPENCODE_SERVER_URL` in Convex environment.

## Code Style
- Strict TypeScript; use `Id<"table">` for database references.
- `verbatimModuleSyntax` enabled; use `import type` for types.
- NO `useMemo`/`useCallback`/`memo` - React Compiler handles memoization.
- Max 300 lines per file; keep complexity low.
- Prefer `.withIndex()` over `.filter()` in Convex queries for scalability.
- Use Zod for runtime validation where necessary.

## The Zen of Convex
- **Sync Engine**: Queries are reactive and automatically cached. Use them for almost every read.
- **Stay Fast**: Keep mutations and queries light (<100ms) and working with <100 records.
- **Actions**: Use actions for external APIs (like the Opencode chat). Trigger them via mutations if persistence is needed.
- **Client State**: Let Convex handle caching. Don't over-complicate local state; bind components directly.
- **"Just Code"**: Use standard TypeScript for composition and encapsulation.
- **Dashboard**: Keep the Convex dashboard open for logs, data exploration, and debugging.

## Convex Guidelines

### Core Rules
- Use new function constructors: `query`, `mutation`, `action` from `./_generated/server`.
- All public functions must have `args` validators (`v.*`) and enforce access control.
- Never use `undefined` as a value or return type - use `null` or omit return.
- Don't use `.filter()` on large queries - prefer indexes.
- Actions cannot access `ctx.db` directly - use `ctx.runQuery`/`ctx.runMutation`.

### Function Syntax
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getIssue = query({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Auth & Access Control
- The project uses **Better Auth** with Convex integration.
- Always check `await authComponent.getAuthUser(ctx)` before accessing restricted data.
- Use `api.auth.getCurrentUser` to get the current session on the client.

## Anti-Patterns: Client-Side Caching

**CRITICAL**: Do not implement manual client-side caching or persistence for Convex data (e.g., via `localStorage` or `Zustand` persistence). 

### What to Avoid
- **localStorage caching** of issues, todos, or chat history.
- **Redundant stores** for data already managed by Convex.
- **Serving stale data** while Convex queries are loading.

### Why This Breaks Convex
1. **Fights the sync engine** - Convex queries are already reactive and cached.
2. **Creates stale state** - Users see outdated task statuses or comments.
3. **Adds complexity** - Synchronization between local storage and server becomes a nightmare.

## Convex-First UI Patterns

### Auth Waterfall Resolution
Use the integrated auth hook to avoid loading flickers:

```typescript
import { useSession } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";

export function useCurrentUser() {
  const { data: session, isPending } = useSession();
  const user = useQuery(api.auth.getCurrentUser, session ? {} : "skip");
  
  return {
    isLoading: isPending || (session && user === null),
    isAuthenticated: !!session && user !== null,
    user,
    session,
  };
}
```

### Query Hoisting
Mount critical queries (like the list of issues or todos) high in the component tree to keep them warm during navigation.

### Refined Skeletons
Show honest loading states (Skeletons) instead of falling back to empty lists or old cached data.

### Optimistic Updates
Use Convex's optimistic updates for instant UI feedback on actions like toggling a todo or updating an issue status.

## Single-Focus Files & Component Design

### Core Principle
**Every file should have a single, obvious reason to exist.** Avoid "monolith" files that combine logic, types, and UI.

#### Structural Rules
- **Components**: UI only. Extract complex logic into custom hooks.
- **Hooks**: Logic and data fetching only. One hook per file if it exceeds 50 lines.
- **Convex**: Organize by entity (e.g., `issues/`). If a file grows, split into `queries.ts`, `mutations.ts`, and `actions.ts`.
- **Types**: Define shared types in dedicated `.types.ts` or `schema.ts` files, not inside components.

#### Good Examples
- `kanban/board.tsx` → Main Kanban UI.
- `kanban/use-kanban-drag.ts` → Drag and drop logic.
- `issues/mutations.ts` (Convex) → Mutations for issue state.
- `issues/actions.ts` (Convex) → AI/External actions for issues.

#### Avoid
- `utils.ts` (God files) - use specific utility files like `date-utils.ts`.
- `OpencodeChat.tsx` containing 200 lines of message processing logic.
- `issues.ts` containing queries, mutations, and 5 different AI actions.
- Defining `interface` inside a component file if it's used elsewhere.

### Incremental Cleanup
- Improve structure **as you touch code**.
- If a file grows beyond 300 lines, identify the distinct concepts and extract them.
- Leave the file better than you found it.
