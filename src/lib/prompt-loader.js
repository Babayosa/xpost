import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT } from './store.js';

const PROMPTS_DIR = join(ROOT, 'prompts');
const VOICE_DIR = join(ROOT, 'voice-reference');

export async function loadPrompt(name) {
  const filepath = join(PROMPTS_DIR, name);
  return readFile(filepath, 'utf-8');
}

export async function loadTypePrompt(type) {
  return loadPrompt(join('types', `${type}.md`));
}

export async function loadVoiceReference() {
  try {
    const files = await readdir(VOICE_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    if (mdFiles.length === 0) return '';
    const contents = await Promise.all(
      mdFiles.map(f => readFile(join(VOICE_DIR, f), 'utf-8'))
    );
    return '\n\n## Voice Reference (real posts for tone matching)\n\n' + contents.join('\n\n---\n\n');
  } catch {
    return '';
  }
}

export async function composeSystemPrompt(contentType) {
  const base = await loadPrompt('system.md');
  const voice = await loadVoiceReference();
  let typePrompt = '';
  if (contentType) {
    try {
      typePrompt = '\n\n## Content Type Instructions\n\n' + await loadTypePrompt(contentType);
    } catch { /* no type-specific prompt */ }
  }
  return base + typePrompt + voice;
}

export const CONTENT_TYPES = [
  'build-log',
  'lesson-learned',
  'behind-the-scenes',
  'hot-take',
  'question',
  'milestone',
  'thread',
];
