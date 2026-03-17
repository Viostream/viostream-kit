/**
 * test-pack-react.mjs
 *
 * Builds player-core and player-react, packs them into tarballs,
 * then installs and smoke-tests them in an isolated directory
 * (outside the npm workspace) to verify the published package
 * works correctly for real consumers.
 *
 * Cross-platform: works on Windows (PowerShell/CMD), macOS, and Linux.
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CORE_DIR = resolve(REPO_ROOT, 'packages', 'viostream-player-core');
const REACT_DIR = resolve(REPO_ROOT, 'packages', 'viostream-player-react');
const TEST_DIR = resolve(REPO_ROOT, 'test', 'pack-react');

/** Run a command synchronously, inheriting stdio so output streams to the terminal. */
function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

/** Run a command and return its trimmed stdout. */
function runCapture(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: 'utf-8' }).trim();
}

// -- 1. Build both packages ---------------------------------------------------

console.log('==> Building player-core...');
run('npm run build', CORE_DIR);

console.log('==> Building player-react...');
run('npm run build', REACT_DIR);

// -- 2. Pack into tarballs ----------------------------------------------------

console.log('==> Packing player-core...');
const coreTgz = runCapture(`npm pack --pack-destination "${TEST_DIR}"`, CORE_DIR)
  .split('\n').pop();
console.log(`    -> ${coreTgz}`);

console.log('==> Packing player-react...');
const reactTgz = runCapture(`npm pack --pack-destination "${TEST_DIR}"`, REACT_DIR)
  .split('\n').pop();
console.log(`    -> ${reactTgz}`);

// -- 3. Update test package.json with tarball paths ---------------------------

console.log('==> Updating test/pack-react/package.json with tarball paths...');
const pkgPath = resolve(TEST_DIR, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
pkg.dependencies['@viostream/viostream-player-core'] = `file:./${coreTgz}`;
pkg.dependencies['@viostream/viostream-player-react'] = `file:./${reactTgz}`;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// -- 4. Clean and install from tarballs ---------------------------------------

console.log('==> Cleaning old node_modules...');
const nmDir = resolve(TEST_DIR, 'node_modules');
const lockFile = resolve(TEST_DIR, 'package-lock.json');
if (existsSync(nmDir)) rmSync(nmDir, { recursive: true, force: true });
if (existsSync(lockFile)) rmSync(lockFile, { force: true });

console.log('==> Installing from tarballs (no workspace resolution)...');
run('npm install --install-links', TEST_DIR);

// -- 5. Run smoke tests -------------------------------------------------------

console.log('==> Running smoke tests...');
run('npx vitest run', TEST_DIR);

console.log('');
console.log('==> All pack smoke tests passed!');
