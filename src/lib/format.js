const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const MAGENTA = '\x1b[35m';

export const fmt = {
  bold: (s) => `${BOLD}${s}${RESET}`,
  dim: (s) => `${DIM}${s}${RESET}`,
  green: (s) => `${GREEN}${s}${RESET}`,
  yellow: (s) => `${YELLOW}${s}${RESET}`,
  cyan: (s) => `${CYAN}${s}${RESET}`,
  red: (s) => `${RED}${s}${RESET}`,
  magenta: (s) => `${MAGENTA}${s}${RESET}`,
  success: (s) => `${GREEN}${BOLD}✓${RESET} ${s}`,
  warn: (s) => `${YELLOW}${BOLD}!${RESET} ${s}`,
  error: (s) => `${RED}${BOLD}✗${RESET} ${s}`,
  header: (s) => `\n${BOLD}${CYAN}── ${s} ──${RESET}\n`,
};

export function postPreview(content, maxLen = 280) {
  const charCount = content.length;
  const indicator = charCount > maxLen ? fmt.red(`[${charCount}c]`) : fmt.dim(`[${charCount}c]`);
  return `${content}\n${indicator}`;
}

export function table(rows, headers) {
  if (rows.length === 0) {
    console.log(fmt.dim('  (empty)'));
    return;
  }
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length))
  );
  const sep = widths.map(w => '─'.repeat(w + 2)).join('┼');
  const formatRow = (r) => r.map((c, i) => ` ${String(c ?? '').padEnd(widths[i])} `).join('│');
  console.log(fmt.bold(formatRow(headers)));
  console.log(sep);
  rows.forEach(r => console.log(formatRow(r)));
}
