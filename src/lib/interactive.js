import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

export async function ask(question) {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await rl.question(question);
    return answer.trim();
  } finally {
    rl.close();
  }
}

export async function confirm(question) {
  const answer = await ask(`${question} (y/n) `);
  return answer.toLowerCase().startsWith('y');
}

export async function choose(prompt, options) {
  console.log(`\n${prompt}`);
  options.forEach((opt, i) => console.log(`  ${i + 1}) ${opt}`));
  const answer = await ask('\nChoice: ');
  const idx = parseInt(answer, 10) - 1;
  if (idx >= 0 && idx < options.length) return idx;
  return -1;
}

export async function multilineInput(prompt) {
  console.log(`${prompt} (enter empty line to finish):`);
  const rl = createInterface({ input: stdin, output: stdout });
  const lines = [];
  try {
    for await (const line of rl) {
      if (line.trim() === '') break;
      lines.push(line);
    }
  } finally {
    rl.close();
  }
  return lines.join('\n');
}
