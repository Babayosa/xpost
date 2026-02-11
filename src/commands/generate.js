import { ask, askJson } from '../lib/claude.js';
import { composeSystemPrompt, CONTENT_TYPES } from '../lib/prompt-loader.js';
import { load, save, nextId } from '../lib/store.js';
import { fmt, postPreview } from '../lib/format.js';
import { choose, confirm } from '../lib/interactive.js';

export function registerGenerate(program) {
  program
    .command('generate <text>')
    .description('Generate post variations from raw input')
    .option('-t, --type <type>', `Content type (${CONTENT_TYPES.join(', ')})`)
    .option('-c, --count <n>', 'Number of variations', '3')
    .action(async (text, opts) => {
      const contentType = opts.type || null;
      const count = parseInt(opts.count, 10);

      if (contentType && !CONTENT_TYPES.includes(contentType)) {
        console.log(fmt.error(`Unknown type: ${contentType}. Valid: ${CONTENT_TYPES.join(', ')}`));
        process.exit(1);
      }

      console.log(fmt.header('Generating Posts'));
      console.log(fmt.dim(`Input: ${text}`));
      console.log(fmt.dim(`Type: ${contentType || 'auto'} | Count: ${count}`));

      const systemPrompt = await composeSystemPrompt(contentType);
      const userPrompt = `Generate ${count} variations of a build-in-public post based on this input:\n\n${text}` +
        (contentType ? `\n\nContent type: ${contentType}` : '\n\nChoose the best content type for each variation. Vary the types.');

      let variations;
      try {
        variations = await askJson(systemPrompt, userPrompt);
      } catch (err) {
        console.log(fmt.error(`Failed to parse Claude response: ${err.message}`));
        process.exit(1);
      }

      if (!Array.isArray(variations)) {
        console.log(fmt.error('Unexpected response format.'));
        process.exit(1);
      }

      console.log(fmt.header(`${variations.length} Variations`));

      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        const display = v.threadParts ? v.threadParts.join('\n\n') : v.content;
        console.log(fmt.bold(`\n--- Variation ${i + 1} (${v.contentType}) ---`));
        console.log(postPreview(display));
      }

      const history = await load('history.json');
      history.push({
        id: nextId(history),
        input: text,
        contentType: contentType || 'auto',
        variations: variations.map(v => v.threadParts ? v.threadParts.join('\n\n') : v.content),
        selectedIndex: null,
        createdAt: new Date().toISOString(),
        batchId: null,
      });
      await save('history.json', history);

      if (await confirm('\nQueue one of these?')) {
        const idx = await choose('Which variation?', variations.map((v, i) =>
          `[${v.contentType}] ${(v.content || v.threadParts[0]).slice(0, 60)}...`
        ));
        if (idx >= 0) {
          const selected = variations[idx];
          const queue = await load('queue.json');
          queue.push({
            id: nextId(queue),
            content: selected.content || null,
            contentType: selected.contentType,
            threadParts: selected.threadParts || null,
            scheduledFor: null,
            status: 'queued',
            createdAt: new Date().toISOString(),
            batchId: null,
          });
          await save('queue.json', queue);
          console.log(fmt.success('Added to queue.'));
        }
      }
    });
}
