import { askJson } from '../lib/claude.js';
import { composeSystemPrompt, loadPrompt } from '../lib/prompt-loader.js';
import { load, save, nextId } from '../lib/store.js';
import { fmt, postPreview, table } from '../lib/format.js';
import { multilineInput, confirm, choose, ask } from '../lib/interactive.js';

function getNextWeekDates() {
  const dates = [];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() + ((8 - today.getDay()) % 7 || 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function registerBatch(program) {
  program
    .command('batch')
    .description('Interactive weekly batch workflow: brain dump → 7-14 posts → review → queue')
    .action(async () => {
      const batchId = `batch-${Date.now()}`;

      // Step 1: Brain dump
      console.log(fmt.header('Step 1: Brain Dump'));
      console.log('What happened this week? Features shipped, bugs fixed, lessons, metrics, ideas...');
      const dump = await multilineInput('Brain dump');
      if (!dump) {
        console.log(fmt.error('No input. Aborting.'));
        return;
      }

      // Step 2: Plan
      console.log(fmt.header('Step 2: Content Plan'));
      console.log(fmt.dim('Asking Claude to break this into post ideas...'));

      const plannerPrompt = await loadPrompt('batch-planner.md');
      const systemPrompt = await composeSystemPrompt();

      let plan;
      try {
        plan = await askJson(
          systemPrompt + '\n\n' + plannerPrompt,
          `Here's my brain dump for the week:\n\n${dump}`
        );
      } catch (err) {
        console.log(fmt.error(`Failed to generate plan: ${err.message}`));
        return;
      }

      if (!Array.isArray(plan) || plan.length === 0) {
        console.log(fmt.error('Empty plan returned.'));
        return;
      }

      // Step 3: Review plan
      console.log(fmt.header(`Step 3: Review Plan (${plan.length} posts)`));
      const rows = plan.map((p, i) => [i + 1, `Day ${p.day}`, p.contentType, p.idea.slice(0, 50)]);
      table(rows, ['#', 'Day', 'Type', 'Idea']);

      if (!await confirm('\nLooks good? Proceed to generate?')) {
        console.log(fmt.dim('Aborted.'));
        return;
      }

      // Step 4: Generate variations for each idea
      console.log(fmt.header('Step 4: Generating Posts'));
      const generated = [];

      for (let i = 0; i < plan.length; i++) {
        const item = plan[i];
        console.log(fmt.dim(`\n[${i + 1}/${plan.length}] ${item.idea}`));

        const typePrompt = await composeSystemPrompt(item.contentType);
        const userPrompt = `Generate 2 variations of a build-in-public post.\n\nIdea: ${item.idea}\nSuggested hook: ${item.hook}\nContent type: ${item.contentType}`;

        try {
          const variations = await askJson(typePrompt, userPrompt);
          generated.push({ plan: item, variations: Array.isArray(variations) ? variations : [variations] });
          console.log(fmt.success(`${variations.length} variations generated`));
        } catch (err) {
          console.log(fmt.warn(`Skipped — generation failed: ${err.message}`));
          generated.push({ plan: item, variations: [] });
        }
      }

      // Step 5: Pick
      console.log(fmt.header('Step 5: Pick & Edit'));
      const approved = [];

      for (const { plan: item, variations } of generated) {
        if (variations.length === 0) continue;

        console.log(fmt.bold(`\n── ${item.idea} (${item.contentType}) ──`));
        for (let i = 0; i < variations.length; i++) {
          const v = variations[i];
          const display = v.threadParts ? v.threadParts.join('\n\n') : v.content;
          console.log(fmt.cyan(`\nVariation ${i + 1}:`));
          console.log(postPreview(display));
        }

        const action = await choose('Action:', ['Pick 1', 'Pick 2', 'Skip']);
        if (action === 0 || action === 1) {
          approved.push({ ...variations[action], day: item.day });
        }
      }

      if (approved.length === 0) {
        console.log(fmt.warn('No posts approved. Nothing queued.'));
        return;
      }

      // Step 6: Schedule
      console.log(fmt.header('Step 6: Schedule'));
      const dates = getNextWeekDates();
      const queue = await load('queue.json');
      const history = await load('history.json');

      for (const post of approved) {
        const scheduledFor = dates[Math.min(post.day - 1, dates.length - 1)];
        queue.push({
          id: nextId(queue),
          content: post.content || null,
          contentType: post.contentType,
          threadParts: post.threadParts || null,
          scheduledFor,
          status: 'queued',
          createdAt: new Date().toISOString(),
          batchId,
        });
      }

      await save('queue.json', queue);
      history.push({
        id: nextId(history),
        input: dump,
        contentType: 'batch',
        variations: approved.map(a => a.content || a.threadParts?.join('\n')),
        selectedIndex: null,
        createdAt: new Date().toISOString(),
        batchId,
      });
      await save('history.json', history);

      // Step 7: Summary
      console.log(fmt.header('Step 7: Week Ahead'));
      const weekRows = approved.map(p => {
        const date = dates[Math.min(p.day - 1, dates.length - 1)];
        const preview = (p.content || p.threadParts?.[0] || '').slice(0, 50);
        return [date, p.contentType, preview + '...'];
      });
      table(weekRows, ['Date', 'Type', 'Preview']);
      console.log(fmt.success(`${approved.length} posts queued for next week.`));
    });
}
