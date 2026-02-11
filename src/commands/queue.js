import { load, save, nextId } from '../lib/store.js';
import { fmt, table, postPreview } from '../lib/format.js';
import { ask as askUser, multilineInput } from '../lib/interactive.js';
import { spawn } from 'node:child_process';
import { writeFile, readFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function registerQueue(program) {
  const queue = program.command('queue').description('Queue management');

  queue
    .command('list')
    .description('Show upcoming scheduled posts')
    .action(async () => {
      const items = await load('queue.json');
      const queued = items.filter(i => i.status === 'queued');

      console.log(fmt.header(`Queue (${queued.length} posts)`));

      if (queued.length === 0) {
        console.log(fmt.dim('  Queue is empty. Use "xpost generate" or "xpost batch" to add posts.'));
        return;
      }

      const rows = queued.map(i => [
        i.id,
        i.contentType,
        i.scheduledFor || 'unscheduled',
        (i.content || i.threadParts?.[0] || '').slice(0, 50) + '...',
      ]);
      table(rows, ['ID', 'Type', 'Scheduled', 'Preview']);
    });

  queue
    .command('add')
    .description('Manually add a post to queue')
    .action(async () => {
      console.log(fmt.header('Add Post to Queue'));
      const content = await multilineInput('Post content');
      if (!content) {
        console.log(fmt.error('No content provided.'));
        return;
      }

      const type = await askUser('Content type (build-log/lesson-learned/behind-the-scenes/hot-take/question/milestone/thread): ');
      const date = await askUser('Schedule date (YYYY-MM-DD, or blank for unscheduled): ');

      const items = await load('queue.json');
      items.push({
        id: nextId(items),
        content,
        contentType: type || 'build-log',
        threadParts: null,
        scheduledFor: date || null,
        status: 'queued',
        createdAt: new Date().toISOString(),
        batchId: null,
      });
      await save('queue.json', items);
      console.log(fmt.success('Post added to queue.'));
    });

  queue
    .command('edit <id>')
    .description('Edit a queued post in $EDITOR')
    .action(async (id) => {
      const items = await load('queue.json');
      const idx = items.findIndex(i => i.id === parseInt(id, 10));
      if (idx === -1) {
        console.log(fmt.error(`Post #${id} not found.`));
        process.exit(1);
      }

      const item = items[idx];
      const text = item.threadParts ? item.threadParts.join('\n\n---\n\n') : item.content;
      const tmpFile = join(tmpdir(), `xpost-edit-${id}.md`);
      await writeFile(tmpFile, text, 'utf-8');

      const editor = process.env.EDITOR || 'vim';
      await new Promise((resolve, reject) => {
        const child = spawn(editor, [tmpFile], { stdio: 'inherit' });
        child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Editor exited with ${code}`)));
        child.on('error', reject);
      });

      const edited = await readFile(tmpFile, 'utf-8');
      await unlink(tmpFile);

      if (item.threadParts) {
        item.threadParts = edited.split(/\n---\n/).map(p => p.trim()).filter(Boolean);
      } else {
        item.content = edited.trim();
      }
      items[idx] = item;
      await save('queue.json', items);
      console.log(fmt.success(`Post #${id} updated.`));
    });

  queue
    .command('delete <id>')
    .description('Remove a post from queue')
    .action(async (id) => {
      const items = await load('queue.json');
      const idx = items.findIndex(i => i.id === parseInt(id, 10));
      if (idx === -1) {
        console.log(fmt.error(`Post #${id} not found.`));
        process.exit(1);
      }
      items.splice(idx, 1);
      await save('queue.json', items);
      console.log(fmt.success(`Post #${id} removed.`));
    });
}
