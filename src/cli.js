import { Command } from 'commander';
import { registerGenerate } from './commands/generate.js';
import { registerBatch } from './commands/batch.js';
import { registerQueue } from './commands/queue.js';
import { registerAnalytics } from './commands/analytics.js';
import { registerVoice } from './commands/voice.js';

const program = new Command();

program
  .name('xpost')
  .description('Build-in-public X content generator powered by Claude')
  .version('1.0.0');

registerGenerate(program);
registerBatch(program);
registerQueue(program);
registerAnalytics(program);
registerVoice(program);

program.parse();
