import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { loadFixture } from '../../harness/loader.js';
import { route } from '../../runtime/context/router.js';

const TEST_PROJECT = join(process.cwd(), 'test-project-golden-routing');

function setupTestProject() {
  rmSync(TEST_PROJECT, { recursive: true, force: true });
  mkdirSync(TEST_PROJECT, { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'manifests'), { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes'), { recursive: true });
  const workflows = [
    { id: 'revision-loop', version: '1.0.0', phase: 'execution', purpose: 'Revise bounded section' },
    { id: 'chapter-plan', version: '1.0.0', phase: 'execution', purpose: 'Plan a chapter' },
    { id: 'correct-course', version: '1.0.0', phase: 'upstream', purpose: 'Handle structural changes' },
    { id: 'release-gate', version: '1.0.0', phase: 'execution', purpose: 'Final release validation' }
  ];
  writeFileSync(join(TEST_PROJECT, 'bookforge', 'manifests', 'workflows.json'), JSON.stringify(workflows));
  writeFileSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes', 'workflow-catalog-map.json'), JSON.stringify({}));
  return TEST_PROJECT;
}

describe('Golden Tests — Routing', () => {
  let project;
  before(() => { project = setupTestProject(); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('route-001: typo correction routes with tiny or small scale', async () => {
    const fixture = loadFixture('route-001');
    const decision = route(project, { task: fixture.fixtures.task });
    assert.ok(['tiny', 'small'].includes(decision.scale));
    assert.ok(decision.task_type);
  });

  it('route-002: rewrite conclusion routes with small scale', async () => {
    const fixture = loadFixture('route-002');
    const decision = route(project, { task: fixture.fixtures.task });
    assert.equal(decision.scale, 'small');
  });

  it('route-003: new chapter routes with medium scale', async () => {
    const fixture = loadFixture('route-003');
    const decision = route(project, { task: fixture.fixtures.task });
    assert.equal(decision.scale, 'medium');
  });

  it('route-004: structural change routes with large scale', async () => {
    const fixture = loadFixture('route-004');
    const decision = route(project, { task: fixture.fixtures.task });
    assert.equal(decision.scale, 'large');
  });

  it('route-005: publication routes with large scale', async () => {
    const fixture = loadFixture('route-005');
    const decision = route(project, { task: fixture.fixtures.task });
    assert.equal(decision.scale, 'large');
  });
});
