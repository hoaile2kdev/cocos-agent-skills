#!/usr/bin/env node

/**
 * Automated test runner for cocos_serialization_tools.js
 * Run: node tests/run-tests.js
 */

const { spawnSync } = require('child_process');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const SCRIPT = path.join(SKILL_DIR, 'scripts', 'cocos_serialization_tools.js');
const FIXTURES = path.join(SKILL_DIR, 'tests', 'fixtures');

let passed = 0;
let failed = 0;

function run(label, fn) {
  try {
    fn();
    console.log(`  PASS ${label}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL ${label}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runTool(args) {
  const result = spawnSync('node', [SCRIPT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 10000,
  });
  return result;
}

function exec(args) {
  const result = runTool(args);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Command failed: ${args.join(' ')}`);
  }
  return result.stdout;
}

function execFail(args) {
  const result = runTool(args);
  if (result.status === 0) {
    throw new Error('Expected command to fail but it succeeded');
  }
  return result.stderr || result.stdout || '';
}

// ── Validate command ────────────────────────────────────────────────────

console.log('\nValidate command:');

run('valid-sample.prefab passes', () => {
  const out = exec(['validate', path.join(FIXTURES, 'valid-sample.prefab')]);
  assert(out.includes('OK'), `Expected OK, got: ${out}`);
});

run('valid-sample.fire passes', () => {
  const out = exec(['validate', path.join(FIXTURES, 'valid-sample.fire')]);
  assert(out.includes('OK'), `Expected OK, got: ${out}`);
});

run('broken-sample.prefab catches errors', () => {
  const out = execFail(['validate', path.join(FIXTURES, 'broken-sample.prefab')]);
  assert(out.includes('Duplicate non-empty _id'), 'Missing: duplicate _id');
  assert(out.includes('Invalid __id__ 99'), 'Missing: invalid __id__');
  assert(out.includes('missing __type__'), 'Missing: missing __type__');
  assert(out.includes('missing node reference'), 'Missing: missing node ref');
});

run('broken-sample.fire catches errors', () => {
  const out = execFail(['validate', path.join(FIXTURES, 'broken-sample.fire')]);
  assert(out.includes('Duplicate non-empty _id'), 'Missing: duplicate _id');
  assert(out.includes('Invalid __id__ 50'), 'Missing: invalid __id__');
  assert(out.includes('missing __type__'), 'Missing: missing __type__');
  assert(out.includes('missing node reference'), 'Missing: missing node ref');
});

// ── UUID command ────────────────────────────────────────────────────────

console.log('\nUUID command:');

run('generates valid v4 UUID', () => {
  const uuid = exec(['uuid']).trim();
  assert(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid),
    `Invalid UUID format: ${uuid}`);
});

run('generates compressed UUID', () => {
  const compressed = exec(['uuid', '--compressed']).trim();
  assert(compressed.length > 0, 'Empty compressed UUID');
  assert(compressed.length < 36, `Compressed UUID should be shorter than full: ${compressed}`);
});

run('generates min compressed UUID', () => {
  const min = exec(['uuid', '--compressed', '--min']).trim();
  assert(min.length > 0, 'Empty min compressed UUID');
  assert(min.length < 36, `Min compressed UUID should be shorter: ${min}`);
});

// ── Compress UUID command ───────────────────────────────────────────────

console.log('\nCompress UUID command:');

run('compresses known UUID deterministically', () => {
  const result = exec(['compress-uuid', 'eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432']).trim();
  assert(result.length > 0, 'Empty result');
  assert(result.length < 36, `Should be shorter than full UUID: ${result}`);
});

run('rejects invalid UUID', () => {
  execFail(['compress-uuid', 'not-a-uuid']);
});

run('accepts --min flag', () => {
  const result = exec(['compress-uuid', 'eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432', '--min']).trim();
  assert(result.length > 0, 'Empty result');
});

// ── Syntax check ────────────────────────────────────────────────────────

console.log('\nScript integrity:');

run('cocos_serialization_tools.js has valid syntax', () => {
  const result = spawnSync('node', ['--check', SCRIPT], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 5000,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'node --check failed');
  }
});

// ── Summary ─────────────────────────────────────────────────────────────

console.log(`\n${'-'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
  process.exit(1);
}
