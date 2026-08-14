import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

export function loadFixture(id) {
  const fp = path.join(FIXTURES_DIR, `${id}.json`);
  if (!fs.existsSync(fp)) {
    throw new Error(`Fixture not found: ${id}. Available: ${listFixtures()}`);
  }
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

export function listFixtures() {
  if (!fs.existsSync(FIXTURES_DIR)) return [];
  return fs.readdirSync(FIXTURES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

export function loadAllFixtures() {
  return listFixtures().map(id => loadFixture(id));
}

export function generateTaskPacket(fixture) {
  return {
    task_id: `task-${fixture.id}`,
    intent: 'execute',
    scope: {},
    task: fixture.fixtures.task || fixture.input,
    agent: fixture.fixtures.agent || null,
    workflow: fixture.fixtures.workflow || null,
    constraints: { max_words: 5000 },
    quality_targets: fixture.expected?.validators_run || []
  };
}

export function gradeResult(result, expected) {
  const pass = [];
  const fail = [];
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actual = result[key];
    if (typeof expectedValue === 'number' && expectedValue.toString().includes('>=')) {
      const min = parseInt(expectedValue.replace('>=', ''));
      if (actual >= min) {
        pass.push({ key, expected: `>=${min}`, actual });
      } else {
        fail.push({ key, expected: `>=${min}`, actual });
      }
    } else if (typeof expectedValue === 'number' && expectedValue.toString().includes('==')) {
      const target = parseInt(expectedValue.replace('==', ''));
      if (actual === target) {
        pass.push({ key, expected, actual });
      } else {
        fail.push({ key, expected, actual });
      }
    } else if (typeof expectedValue === 'string') {
      if (actual === expectedValue) {
        pass.push({ key, expected, actual });
      } else {
        fail.push({ key, expected, actual });
      }
    } else if (Array.isArray(expectedValue)) {
      const actualArr = Array.isArray(actual) ? actual : [actual];
      const allPresent = expectedValue.every(v => actualArr.includes(v));
      if (allPresent) {
        pass.push({ key, expected: expectedValue, actual });
      } else {
        fail.push({ key, expected: expectedValue, actual });
      }
    } else {
      if (actual === expectedValue) {
        pass.push({ key, expected, actual });
      } else {
        fail.push({ key, expected, actual });
      }
    }
  }
  return {
    passed: pass,
    failed: fail,
    total: pass.length + fail.length,
    pass_rate: fail.length === 0 ? 1.0 : pass.length / (pass.length + fail.length)
  };
}

export function createRunLog(fixture, result, grade) {
  return {
    fixture_id: fixture.id,
    timestamp: new Date().toISOString(),
    grade,
    result
  };
}

export function saveRunLog(log) {
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const fp = path.join(logsDir, `${log.fixture_id}-${Date.now()}.json`);
  fs.writeFileSync(fp, JSON.stringify(log, null, 2));
  return fp;
}
