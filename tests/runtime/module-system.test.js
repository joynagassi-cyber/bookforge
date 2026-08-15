import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';

const TEST_PROJECT = join(process.cwd(), 'test-project-module');

function setupTestProject() {
  rmSync(TEST_PROJECT, { recursive: true, force: true });
  mkdirSync(TEST_PROJECT, { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'modules'), { recursive: true });
  return TEST_PROJECT;
}

describe('Module System', () => {
  let project;
  before(() => { project = setupTestProject(); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should load empty registry', async () => {
    const { loadRegistry } = await import('../../runtime/module/registry.js');
    const reg = loadRegistry(project);
    assert.equal(reg.schema_version, '1.0.0');
    assert.equal(reg.modules.length, 0);
  });

  it('should register a module', async () => {
    const { register } = await import('../../runtime/module/registry.js');
    const manifest = {
      id: 'test-module',
      version: '1.0.0',
      type: 'module',
      name: 'Test Module',
      provides: ['test.agent', 'test.workflow']
    };
    const entry = register(project, manifest);
    assert.equal(entry.id, 'test-module');
    assert.equal(entry.enabled, true);
  });

  it('should list modules', async () => {
    const { list } = await import('../../runtime/module/registry.js');
    const modules = list(project);
    assert.ok(modules.some(m => m.id === 'test-module'));
  });

  it('should get a module', async () => {
    const { get } = await import('../../runtime/module/registry.js');
    const module = get(project, 'test-module');
    assert.ok(module);
    assert.equal(module.id, 'test-module');
  });

  it('should disable/enable a module', async () => {
    const { enable, get, list } = await import('../../runtime/module/registry.js');
    enable(project, 'test-module', false);
    let module = get(project, 'test-module');
    assert.equal(module, null); // disabled modules are filtered by get()
    let modules = list(project, { enabledOnly: false });
    module = modules.find(m => m.id === 'test-module');
    assert.equal(module.enabled, false);
    enable(project, 'test-module', true);
    modules = list(project, { enabledOnly: false });
    module = modules.find(m => m.id === 'test-module');
    assert.equal(module.enabled, true);
  });

  it('should remove a module', async () => {
    const { remove, get } = await import('../../runtime/module/registry.js');
    remove(project, 'test-module');
    assert.equal(get(project, 'test-module'), null);
  });

  it('should validate module manifest', async () => {
    const { register } = await import('../../runtime/module/registry.js');
    assert.throws(() => register(project, { id: 'INVALID!' }), /invalid id/);
    assert.throws(() => register(project, { id: 'valid', version: '1.0.0' }), /type/);
  });

  it('should create lockfile on register', async () => {
    const { register, loadLockfile } = await import('../../runtime/module/registry.js');
    const manifest = { id: 'lock-test', version: '1.0.0', type: 'module', provides: [] };
    register(project, manifest);
    const lockfile = loadLockfile(project);
    assert.ok(lockfile.modules['lock-test']);
  });

  it('should list capabilities', async () => {
    const { register, listCapabilities } = await import('../../runtime/module/registry.js');
    const manifest = {
      id: 'cap-test',
      version: '1.0.0',
      type: 'module',
      provides: ['cap.agent', 'cap.workflow'],
      entrypoints: {
        agents: ['cap-agent'],
        workflows: ['cap-workflow'],
        skills: ['cap-skill']
      }
    };
    register(project, manifest);
    const caps = listCapabilities(project);
    assert.ok(caps.agents.includes('cap-agent'));
    assert.ok(caps.workflows.includes('cap-workflow'));
    assert.ok(caps.skills.includes('cap-skill'));
  });
});
