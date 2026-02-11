# xpost

CLI tool for generating build-in-public X (Twitter) content. Brain dump once, get a week of posts.

Powered by `claude -p` — uses your existing Claude Code subscription. No API key needed.

## Install

```bash
cd ~/xpost
npm install
npm link
```

## Commands

### Generate posts from an idea

```bash
xpost generate "shipped dark mode for caloura today"
xpost generate "hit 100 downloads" --type milestone --count 5
```

### Weekly batch workflow

```bash
xpost batch
```

Interactive 7-step flow:
1. Brain dump what happened this week
2. Claude creates a content plan (7-14 posts)
3. Review and approve the plan
4. Claude generates 2 variations per post
5. Pick your favorite for each
6. Posts auto-scheduled across the week
7. Calendar summary

### Queue management

```bash
xpost queue list          # see upcoming posts
xpost queue add           # manually add a post
xpost queue edit 3        # edit post #3 in $EDITOR
xpost queue delete 3      # remove post #3
```

### Analytics

```bash
xpost analytics log       # record engagement metrics for a post
xpost analytics report    # see what content types perform best
```

### Voice reference

```bash
xpost voice ingest trading-posts.txt
```

Import your existing posts so Claude matches your tone.

## Content Types

- `build-log` — what you shipped today
- `lesson-learned` — hard-won insight
- `behind-the-scenes` — pull back the curtain
- `hot-take` — strong opinion
- `question` — engagement driver
- `milestone` — celebrating a win
- `thread` — multi-part deep dive

## Project Structure

```
prompts/          — system + content type prompts (editable)
voice-reference/  — your imported posts for tone matching
data/             — queue, analytics, history (JSON)
```
