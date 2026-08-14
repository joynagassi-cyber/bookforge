import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_PROJECT = join(__dirname, '..', 'test-project-context');

function setupTestProject() {
  rmSync(TEST_PROJECT, { recursive: true, force: true });
  mkdirSync(TEST_PROJECT, { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes'), { recursive: true });
  const maps = {
    agents: {},
    workflows: {
      'help': { required: ['routing-rules'], optional: [] },
      'chapter-plan': { required: ['outline', 'chapter-patterns'], optional: ['scenes'] }
    },
    catalogs: {},
    entries: {}
  };
  writeFileSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes', 'workflow-catalog-map.json'), JSON.stringify(maps.workflows));
  writeFileSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes', 'catalog-index.json'), JSON.stringify({}));
  return TEST_PROJECT;
}

describe('Context Router', () => {
  let project;
  before(() => { project = setupTestProject(); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should route a simple task', async () => {
    const { route } = await import('../../runtime/context/router.js');
    const decision = route(project, { task: 'Fix a typo' });
    assert.ok(decision.required.length >= 0);
    assert.ok(decision.task_type);
  });

  it('should detect task type', async () => {
    const { route } = await import('../../runtime/context/router.js');
    const tiny = route(project, { task: 'Fix a typo' });
    assert.equal(tiny.task_type, 'tiny');
    const small = route(project, { task: 'Rewrite conclusion' });
    assert.equal(small.task_type, 'small');
    const medium = route(project, { task: 'Add a new chapter' });
    assert.equal(medium.task_type, 'medium');
    const large = route(project, { task: 'Change the central promise' });
    assert.equal(large.task_type, 'large');
  });

  it('should extract hints from task', async () => {
    const { route } = await import('../../runtime/context/router.js');
    const withHints = route(project, { task: 'Write dialogue between characters' });
    assert.ok(withHints.hints.includes('dialogue'));
    const noHints = route(project, { task: 'Packaging for publication' });
    assert.ok(noHints.hints.includes('packaging'));
  });

  it('should return scale', async () => {
    const { route } = await import('../../runtime/context/router.js');
    const tiny = route(project, { task: 'Fix a typo' });
    assert.equal(tiny.scale, 'tiny');
    const bookScale = route(project, { task: 'Start a new book' });
    assert.equal(bookScale.scale, 'book-scale');
  });

  it('should pack context', async () => {
    const { pack } = await import('../../runtime/context/packer.js');
    const packet = await pack(project, { task: 'Write chapter 3', agent: 'writer' });
    assert.ok(packet.task_id);
    assert.equal(packet.version, '0.5.0');
    assert.ok(packet.entries);
  });

  it('should estimate tokens', async () => {
    const { pack, estimateTokens } = await import('../../runtime/context/packer.js');
    const packet = await pack(project, { task: 'Test' });
    const tokens = estimateTokens(packet);
    assert.ok(tokens >= 0);
  });

  it('should truncate packet', async () => {
    const { pack, truncatePacket } = await import('../../runtime/context/packer.js');
    const packet = await pack(project, { task: 'Test' });
    const truncated = truncatePacket(packet, 100);
    assert.ok(truncated.entries.length <= packet.entries.length);
  });
});
