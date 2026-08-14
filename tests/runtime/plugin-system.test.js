import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_PROJECT = join(__dirname, '..', 'test-project-plugin');

function setupTestProject() {
  rmSync(TEST_PROJECT, { recursive: true, force: true });
  mkdirSync(TEST_PROJECT, { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'plugins'), { recursive: true });
  return TEST_PROJECT;
}

describe('Plugin System', () => {
  let project;
  before(() => { project = setupTestProject(); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should load empty registry', async () => {
    const { loadRegistry } = await import('../../runtime/plugin/registry.js');
    const reg = loadRegistry(project);
    assert.equal(reg.schema_version, '1.0.0');
    assert.equal(reg.plugins.length, 0);
  });

  it('should register a plugin', async () => {
    const { register } = await import('../../runtime/plugin/registry.js');
    const manifest = {
      id: 'test-plugin',
      version: '1.0.0',
      kind: 'skill',
      entrypoints: { agents: [], workflows: [], skills: ['test-skill'] }
    };
    const entry = register(project, manifest);
    assert.equal(entry.id, 'test-plugin');
    assert.equal(entry.enabled, true);
  });

  it('should list plugins', async () => {
    const { list } = await import('../../runtime/plugin/registry.js');
    const plugins = list(project);
    assert.ok(plugins.some(p => p.id === 'test-plugin'));
  });

  it('should get a plugin', async () => {
    const { get } = await import('../../runtime/plugin/registry.js');
    const plugin = get(project, 'test-plugin');
    assert.ok(plugin);
    assert.equal(plugin.id, 'test-plugin');
  });

  it('should enable/disable plugins', async () => {
    const { enable, get } = await import('../../runtime/plugin/registry.js');
    enable(project, 'test-plugin', false);
    let plugin = get(project, 'test-plugin');
    if (plugin) assert.equal(plugin.enabled, false);
    enable(project, 'test-plugin', true);
    plugin = get(project, 'test-plugin');
    if (plugin) assert.equal(plugin.enabled, true);
  });

  it('should remove a plugin', async () => {
    const { remove, get } = await import('../../runtime/plugin/registry.js');
    remove(project, 'test-plugin');
    assert.equal(get(project, 'test-plugin'), null);
  });

  it('should validate manifest', async () => {
    const { register } = await import('../../runtime/plugin/registry.js');
    assert.throws(() => register(project, { id: 'INVALID!' }), /invalid id/);
    assert.throws(() => register(project, { id: 'valid', version: '1.0.0' }), /kind/);
  });
});
