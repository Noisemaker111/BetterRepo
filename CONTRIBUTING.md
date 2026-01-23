# Contributing

This project uses a branch + PR workflow, but keeps it lightweight and reproducible.

## Golden rules

- Keep changes focused. Don’t mix unrelated edits.
- Commits should explain the change clearly (future-you should understand them).
- PRs should be concise and readable (the PR is the “story”; commits are the “steps”).
- Before pushing or requesting review, run: `bun run check`.

## Workflow (reproducible)

### 1) Start from an up-to-date `master`

```bash
git switch master
git pull --rebase
```

### 2) Create a branch

Branch name format:

```
<type>/<topic>
```

Examples:

```
feat/virtual-repo-sdk
fix/web-mode-toggle
docs/virtual-repos
chore/workflow-and-virtual-repos
```

```bash
git switch -c <type>/<topic>
```

### 3) Commit as you go (precise)

Prefer small commits that each represent a single logical step.

Suggested commit prefixes:

- `feat(scope): ...`
- `fix(scope): ...`
- `docs: ...`
- `chore: ...`

Examples:

- `feat(virtual-repo): add VirtualRepo SDK package`
- `docs: document virtual repos usage`

### 4) Stay up-to-date without merge commits

While on your branch:

```bash
git fetch origin
git rebase origin/master
```

If conflicts happen: fix → `git add -A` → `git rebase --continue`.

### 5) Check before you push / ask for review

```bash
bun run check
```

### 6) Push and open a PR

```bash
git push -u origin HEAD
gh pr create --fill
```

## PR guidelines (keep it neat)

PR description should be short and useful:

- **Summary**: 1–3 bullets (what changed + why)
- **Testing**: include what you ran (always `bun run check`)
- **Notes**: follow-ups, screenshots for UI changes

Suggested PR template:

```markdown
## Summary
-

## Testing
- [ ] bun run check

## Notes
-
```

## Merging

Prefer **Rebase and merge** (preserves commit-level story without a merge commit).
Avoid squash merges unless the branch history is noisy and you intentionally want a single commit.
