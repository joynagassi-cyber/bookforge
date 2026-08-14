import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { loadFixture } from '../../harness/loader.js';
import { gradeResult } from '../../harness/grader.js';
import { pack } from '../../runtime/context/packer.js';

const TEST_PROJECT = join(process.cwd(), 'test-project-quality');

function setupTestProject() {
  rmSync(TEST_PROJECT, { recursive: true, force: true });
  mkdirSync(TEST_PROJECT, { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes'), { recursive: true });
  writeFileSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes', 'catalog-index.json'), JSON.stringify({}));
  return TEST_PROJECT;
}

describe('Golden Tests — Quality', () => {
  let project;
  before(() => { project = setupTestProject(); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('quality-001: should generate context packet with quality targets', async () => {
    const fixture = loadFixture('quality-001');
    const packet = await pack(project, { task: fixture.fixtures.task, budget: 3000 });
    assert.ok(packet.entries);
    assert.ok(packet.token_budget);
    assert.equal(packet.version, '0.5.0');
  });
});

describe('Golden Tests — Continuity', () => {
  let project;
  before(() => { project = setupTestProject(); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('continuity-001: should generate context for continuity checking', async () => {
    const fixture = loadFixture('continuity-001');
    const packet = await pack(project, { task: 'Check continuity across chapters', budget: 4000 });
    assert.ok(packet);
    assert.equal(packet.version, '0.5.0');
  });
});
