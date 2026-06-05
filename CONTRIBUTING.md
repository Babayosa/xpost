# Contributing to xpost

Thanks for your interest. Contributions are welcome — bug fixes, new content types, workflow improvements.

## Prerequisites

- Node.js 18 or later
- [Claude Code CLI](https://github.com/anthropics/claude-code) installed and authenticated (`claude --version` should work)
- `npm` (bundled with Node)

## Setup

```bash
git clone https://github.com/<your-org>/xpost.git
cd xpost
npm install
npm link          # makes `xpost` available globally on your machine
```

## Running the CLI locally

```bash
xpost generate "shipped dark mode today"
xpost batch
```

All generated content and queue state lives in `data/` (gitignored, stays local).

## Project layout

```
bin/xpost.js        entry point shim
src/cli.js          CLI bootstrap (Commander)
src/commands/       one file per command (generate, batch, queue, analytics, voice)
src/lib/            shared utilities (prompts, file I/O, scheduling)
prompts/            system + content-type prompt templates (editable by users)
voice-reference/    user-imported tone samples (gitignored)
data/               runtime state — queue, analytics, history (gitignored)
```

## Making changes

1. Fork the repo and create a branch: `git checkout -b fix/my-fix`
2. Make your change. Keep it focused — one concern per PR.
3. Test manually with a real `xpost` command before opening a PR.
4. Open a pull request against `main`. Describe what changed and why.

There are no automated tests yet. If you add a command or utility, a short manual test log in the PR description is enough for now.

## Code style

- ESM modules (`"type": "module"` in package.json) — use `import`/`export`, not `require`.
- No build step. The source in `src/` runs directly via Node.
- Keep prompt templates in `prompts/` — do not hard-code prompt text in JS files.
- Prefer clear, readable code over clever one-liners.

## Opening issues

- Bug reports: include the exact command you ran, what you expected, and what happened.
- Feature requests: describe the use case, not just the solution.
- Check existing issues before opening a duplicate.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be respectful.
