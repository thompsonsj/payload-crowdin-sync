/**
 * Publish the package in cwd if that name@version is not already on npm.
 * Used so a half-finished release job can be retried without failing on
 * versions that already landed.
 */
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const spec = `${pkg.name}@${pkg.version}`;

let published;
try {
  published = execFileSync('npm', ['view', spec, 'version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
} catch (error) {
  const stderr = String(error.stderr ?? '');
  if (error.status !== 1 || !stderr.includes('E404')) {
    throw error;
  }
  published = '';
}

if (published === pkg.version) {
  console.log(`${spec} is already on npm; skipping publish`);
  process.exit(0);
}

execFileSync('npm', ['publish', '--access', 'public'], { stdio: 'inherit' });
