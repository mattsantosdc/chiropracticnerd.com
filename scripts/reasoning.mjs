import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localPython = resolve(root, process.platform === 'win32' ? '.venv-reasoning/Scripts/python.exe' : '.venv-reasoning/bin/python');
const python = process.env.REASONING_PYTHON || (existsSync(localPython) ? localPython : 'python3');
const mode = process.argv[2];
if (!['test', 'pilot'].includes(mode) || process.argv.length !== 3) throw new Error('Usage: node scripts/reasoning.mjs test|pilot');
const args = mode === 'test' ? ['-m', 'unittest', 'discover', '-s', 'reasoning', '-p', 'test_*.py', '-v'] : ['reasoning/run.py', '--output', 'reasoning/output'];
const result = spawnSync(python, args, { cwd: root, stdio: 'inherit', timeout: 60000 });
if (result.error || result.signal) {
	console.error(`Reasoning did not complete: ${result.error?.message || result.signal}. See docs/aspic-foundation.md for setup. No exact result is certified.`);
}
process.exitCode = result.status === 0 && !result.error && !result.signal ? 0 : 1;
