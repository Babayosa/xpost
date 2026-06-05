# xpost

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg) ![Node](https://img.shields.io/badge/node-%E2%89%A518-339933) ![Powered by Claude Code](https://img.shields.io/badge/powered%20by-Claude%20Code-7c3aed)

> Brain-dump once, get a week of build-in-public X/Twitter posts — drafted in your own voice, scheduled across the week.

`xpost` turns "here's what I shipped" into a content calendar. It generates posts by routing through the [Claude Code](https://github.com/anthropics/claude-code) CLI (`claude -p`), so it uses your existing Claude subscription — **no API key, no separate billing** — and your drafts never leave your machine.

## Why

Consistent build-in-public posting is a grind: you ship all week, then stare at a blank compose box. `xpost` flips it — dump what happened, it drafts a week of posts in your tone, you pick your favorites, and they're scheduled.

## Requirements

- [Node.js](https://nodejs.org) 18 or later
- [Claude Code](https://github.com/anthropics/claude-code) CLI installed and authenticated (`claude --version` should work)

## Install

```bash
git clone https://github.com/Babayosa/xpost.git
cd xpost
npm install
npm link          # makes `xpost` available globally
```

## Quick start

```bash
# one-off post from an idea
xpost generate "shipped dark mode today"

# a full week, interactively
xpost batch
```

### `xpost batch` — the weekly workflow

1. Brain-dump what happened this week
2. Claude drafts a content plan (7–14 posts)
3. Review and approve the plan
4. Claude generates 2 variations per post
5. Pick your favorite for each
6. Posts are scheduled across the week
7. You get a calendar summary

### Other commands

```bash
xpost queue list             # see upcoming posts
xpost queue edit 3           # edit post #3 in $EDITOR
xpost queue delete 3         # remove post #3
xpost analytics log          # record engagement for a post
xpost analytics report       # see which content types perform best
xpost voice ingest posts.txt # import your past posts so Claude matches your tone
```

## Content types

`build-log` · `lesson-learned` · `behind-the-scenes` · `hot-take` · `question` · `milestone` · `thread`

## How it works

`xpost` never calls the X/Twitter API and never stores credentials. It builds prompts from editable templates in `prompts/`, runs them through `claude -p`, and saves drafts, the queue, and analytics as JSON in `data/` (gitignored — local only).

```
bin/xpost.js        entry point
src/cli.js          CLI bootstrap (Commander)
src/commands/       one file per command
src/lib/            shared utilities
prompts/            editable system + content-type prompts
voice-reference/    tone samples for voice matching
data/               local queue / analytics / history (gitignored)
```

## Contributing

PRs welcome — new content types, workflow improvements, bug fixes. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © Babayosa
