import { spawn } from 'node:child_process';
import { once } from 'node:events';

const preview = spawn(process.execPath, ['scripts/preview.mjs'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'inherit']
});

try {
  await Promise.race([
    new Promise((resolve, reject) => {
      preview.stdout.setEncoding('utf8');
      preview.stdout.on('data', chunk => {
        process.stdout.write(`[Preview] ${chunk}`);
        if (chunk.includes('http://127.0.0.1:4173')) resolve();
      });
      preview.once('error', reject);
      preview.once('exit', code => reject(new Error(`Preview exited before tests started (${code ?? 'unknown'}).`)));
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out starting the production preview.')), 15000))
  ]);

  const runner = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_SKIP_SERVER: '1' }
  });
  const [code] = await once(runner, 'exit');
  process.exitCode = typeof code === 'number' ? code : 1;
} finally {
  preview.kill();
  await Promise.race([once(preview, 'exit'), new Promise(resolve => setTimeout(resolve, 3000))]);
}
