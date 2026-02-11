import { readFile, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { ROOT } from '../lib/store.js';
import { fmt } from '../lib/format.js';

const VOICE_DIR = join(ROOT, 'voice-reference');

export function registerVoice(program) {
  const voice = program.command('voice').description('Voice reference management');

  voice
    .command('ingest <file>')
    .description('Import posts from a text file as voice reference')
    .action(async (file) => {
      try {
        const content = await readFile(file, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());

        if (lines.length === 0) {
          console.log(fmt.error('No content found in file.'));
          process.exit(1);
        }

        const name = basename(file, '.txt').replace(/[^a-z0-9-]/gi, '-');
        const outPath = join(VOICE_DIR, `${name}.md`);
        const md = `# Voice Reference — ${name}\n\n` +
          lines.map(l => `> ${l}`).join('\n\n');

        await writeFile(outPath, md + '\n', 'utf-8');
        console.log(fmt.success(`Ingested ${lines.length} posts → ${outPath}`));
      } catch (err) {
        console.log(fmt.error(`Failed to ingest: ${err.message}`));
        process.exit(1);
      }
    });
}
