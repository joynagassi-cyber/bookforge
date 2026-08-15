import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_PROJECT = join(__dirname, '..', 'test-project');

function setupTestProject() {
  rmSync(TEST_PROJECT, { recursive: true, force: true });
  mkdirSync(TEST_PROJECT, { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'manifests'), { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes'), { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'plugins'), { recursive: true });
  const workflows = [
    { id: 'help', version: '1.0.0', phase: 'upstream', purpose: 'Help and routing', entry: null, requires: [], steps: [{ id: 'route', action: 'route' }, { id: 'pack', action: 'pack' }] },
    { id: 'chapter-plan', version: '1.0.0', phase: 'execution', purpose: 'Plan a chapter', entry: null, requires: ['outline'], steps: [{ id: 'plan', action: 'plan' }] }
  ];
  writeFileSync(join(TEST_PROJECT, 'bookforge', 'manifests', 'workflows.json'), JSON.stringify(workflows));
  const maps = {
    agents: {},
    workflows: { 'help': { required: [], optional: [] }, 'chapter-plan': { required: ['outline'], optional: [] } },
    catalogs: {},
    entries: {}
  };
  writeFileSync(join(TEST_PROJECT, 'bookforge', 'knowledge', 'indexes', 'workflow-catalog-map.json'), JSON.stringify(maps.workflows));
  return TEST_PROJECT;
}

describe('Workflow Engine', () => {
  let project;
  before(() => { project = setupTestProject(); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should plan a workflow', async () => {
    const { plan } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'help', { task: 'Show me the help' });
    assert.equal(planData.state, 'READY');
    assert.equal(planData.workflow.id, 'help');
  });

  it('should start a workflow run', async () => {
    const { plan, start } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'help', { task: 'Test task' });
    const run = start(project, planData);
    assert.ok(run.run_id);
    assert.equal(run.state, 'CONTEXT_BUILT');
  });

  it('should transition between valid states', async () => {
    const { plan, start, transition } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'help', { task: 'Test' });
    const run = start(project, planData);
    const updated = transition(project, run.run_id, 'EXECUTING');
    assert.equal(updated.state, 'EXECUTING');
  });

  it('should reject invalid transitions', async () => {
    const { plan, start, transition } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'help', { task: 'Test' });
    const run = start(project, planData);
    assert.throws(() => transition(project, run.run_id, 'COMMITTED'), /Invalid transition/);
  });

  it('should list runs', async () => {
    const { plan, start, listRuns } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'help', { task: 'List test' });
    start(project, planData);
    const runs = listRuns(project);
    assert.ok(runs.length >= 1);
  });

  it('should execute steps', async () => {
    const { plan, start, executeStep, loadWorkflow } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'help', { task: 'Step test' });
    const run = start(project, planData);
    const wf = loadWorkflow(project, 'help');
    const result = await executeStep(project, run.run_id, 'route', { output: 'routed' });
    assert.equal(result.status, 'completed');
  });

  it('should abort a run', async () => {
    const { plan, start, abortRun } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'help', { task: 'Abort test' });
    const run = start(project, planData);
    const aborted = abortRun(project, run.run_id, 'User requested');
    assert.equal(aborted.state, 'ABORTED');
  });
});
