import { execFile } from 'node:child_process';

export async function ask(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const args = ['-p', '--output-format', 'json', '-s', systemPrompt];
    const child = execFile('claude', args, {
      maxBuffer: 1024 * 1024,
      timeout: 120_000,
    }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`Claude CLI failed: ${err.message}\n${stderr}`));
      try {
        const parsed = JSON.parse(stdout);
        const text = parsed.result ?? parsed.content ?? stdout;
        resolve(typeof text === 'string' ? text : JSON.stringify(text));
      } catch {
        resolve(stdout.trim());
      }
    });
    child.stdin.write(userPrompt);
    child.stdin.end();
  });
}

export async function askJson(systemPrompt, userPrompt) {
  const raw = await ask(systemPrompt, userPrompt);
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = match ? match[1].trim() : raw.trim();
  return JSON.parse(jsonStr);
}
