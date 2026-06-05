# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities **privately** — do not open a public issue.

Use GitHub's private vulnerability reporting: open this repository's **Security**
tab and click **Report a vulnerability**. If that is unavailable, contact the
maintainer through their GitHub profile: https://github.com/Babayosa

When reporting, please include:
- A description of the vulnerability and its impact
- Steps to reproduce, or a proof of concept
- The affected version or commit

You can expect an initial response within a few days. Once a fix is ready, it
will be released on the latest `main`.

## A note on credentials

xpost intentionally does **not** handle X/Twitter API keys or OAuth tokens — it
generates content by routing through the authenticated Claude Code CLI. Your
generated drafts and queue live in the gitignored `data/` directory and never
leave your machine. If you find a code path that writes credentials or local
content into tracked files, please report it.

## Supported Versions

This project is maintained on a best-effort basis. Security fixes are applied to
the latest `main`.
