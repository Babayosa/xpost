import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA_DIR = join(ROOT, 'data');

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

export async function load(filename) {
  const filepath = join(DATA_DIR, filename);
  try {
    const raw = await readFile(filepath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function save(filename, data) {
  await ensureDir(DATA_DIR);
  const filepath = join(DATA_DIR, filename);
  const tmp = filepath + '.tmp';
  await writeFile(tmp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  const { rename } = await import('node:fs/promises');
  await rename(tmp, filepath);
}

export function nextId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map(i => i.id)) + 1;
}

export { ROOT, DATA_DIR };
