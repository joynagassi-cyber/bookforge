import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { loadFixture } from '../../harness/loader.js';
import { pack } from '../../runtime/context/packer.js';

const TEST_PROJECT = join(process.cwd(), 'test-project-continuity');

function setupTestProject() {
  rmSync(TEST_PROJECT, { recursive: true, force: true });
  mkdirSync(TEST_PROJECT, { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes'), { recursive: true });
  writeFileSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes', 'catalog-index.json'), JSON.stringify({}));
  return TEST_PROJECT;
}

describe('Golden Tests — Continuity', () => {
  let project;
  before(() => { project = setupTestProject(); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('continuity-001: should generate context for continuity validation', async () => {
    const fixture = loadFixture('continuity-001');
    const packet = await pack(project, { task: 'Check continuity: John Smith vs John Smythe', budget: 5000 });
    assert.ok(packet);
    assert.ok(packet.entries);
  });
});
