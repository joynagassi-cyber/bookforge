import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

function getTestProject() {
  return join(process.cwd(), 'test-project-wf-v6-' + randomUUID());
}

describe('Workflow Engine v0.6', () => {
  let project;
  before(() => {
    project = getTestProject();
    rmSync(project, { recursive: true, force: true });
    mkdirSync(project, { recursive: true });
    mkdirSync(join(project, 'bookforge', 'manifests'), { recursive: true });

    writeFileSync(
      join(project, 'bookforge', 'manifests', 'workflows.json'),
      JSON.stringify([
        {
          id: 'test-workflow',
          version: '1.0.0',
          phase: 'execution',
          purpose: 'Test workflow with dependencies',
          steps: [
            { id: 'step-1', action: 'analyze', agent: 'analyst', dependencies: [] },
            { id: 'step-2', action: 'draft', agent: 'writer', dependencies: ['step-1'] },
            { id: 'step-3', action: 'validate', agent: 'reviewer', dependencies: ['step-2'], outputs: ['validated'] },
            { id: 'step-4', action: 'skip-if-done', agent: 'auto', dependencies: ['step-3'], condition: { equals: { variable: 'validated', value: true } } }
          ],
          human_approval: false
        }
      ])
    );
  });

  after(() => { rmSync(project, { recursive: true, force: true }); });

  it('should resolve step order with dependencies', async () => {
    const { resolveStepOrder, loadWorkflow } = await import('../../runtime/workflow/engine.js');
    const wf = loadWorkflow(project, 'test-workflow');
    const ordered = resolveStepOrder(wf);
    const ids = ordered.map(s => s.id);
    assert.ok(ids.indexOf('step-1') < ids.indexOf('step-2'));
    assert.ok(ids.indexOf('step-2') < ids.indexOf('step-3'));
  });

  it('should validate dependencies and throw for unknown deps', async () => {
    const { validateStepDependencies } = await import('../../runtime/workflow/engine.js');
    const wf = { steps: [{ id: 'step-1', action: 'test', dependencies: ['unknown-step'] }] };
    const errors = validateStepDependencies(wf);
    assert.ok(errors.length > 0);
    assert.ok(errors[0].includes('unknown-step'));
  });

  it('should detect circular dependencies', async () => {
    const { resolveStepOrder } = await import('../../runtime/workflow/engine.js');
    const wf = {
      steps: [
        { id: 'a', action: 'test', dependencies: ['b'] },
        { id: 'b', action: 'test', dependencies: ['a'] }
      ]
    };
    assert.throws(() => resolveStepOrder(wf), /Circular/);
  });

  it('should execute steps with dependency checking', async () => {
    const { plan, start, executeStep } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'test-workflow');
    const run = start(project, planData);

    // Step 1 should work
    const step1 = await executeStep(project, run.run_id, 'step-1', { output: { analysis: 'done' } });
    assert.equal(step1.status, 'completed');

    // Step 2 should work (depends on step-1)
    const step2 = await executeStep(project, run.run_id, 'step-2', { output: { draft: 'done' } });
    assert.equal(step2.status, 'completed');

    // Step 1 again should still work
    const step1again = await executeStep(project, run.run_id, 'step-1', { output: { analysis: 'done' } });
    assert.equal(step1again.status, 'completed');
  });

  it('should skip step when condition is false', async () => {
    const { plan, start, executeStep, getRun } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'test-workflow');
    const run = start(project, planData);

    // Execute steps 1-3
    await executeStep(project, run.run_id, 'step-1', { output: {} });
    await executeStep(project, run.run_id, 'step-2', { output: {} });
    await executeStep(project, run.run_id, 'step-3', { output: {} });

    // Step 4 has condition that checks for validated = true
    const step4 = await executeStep(project, run.run_id, 'step-4', { output: {} });
    assert.equal(step4.status, 'skipped');

    const runState = getRun(project, run.run_id);
    assert.ok(runState.steps_skipped.some(s => s.step_id === 'step-4'));
  });

  it('should pass condition when met', async () => {
    const { plan, start, executeStep, getRun, transition } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'test-workflow');
    const run = start(project, planData);

    // Execute steps 1-3
    await executeStep(project, run.run_id, 'step-1', { output: {} });
    await executeStep(project, run.run_id, 'step-2', { output: {} });
    const step3 = await executeStep(project, run.run_id, 'step-3', { output: { validated: true } });
    assert.equal(step3.status, 'completed');

    // Verify outputs were saved
    const runState = getRun(project, run.run_id);
    assert.equal(runState.outputs.validated, true, 'Output should be saved: ' + JSON.stringify(runState.outputs));

    // Step 4 should pass now
    const step4 = await executeStep(project, run.run_id, 'step-4', { output: {} });
    assert.equal(step4.status, 'completed');

    // Transition and commit
    await transition(project, run.run_id, 'EXECUTING');
    await transition(project, run.run_id, 'VALIDATING');
    await transition(project, run.run_id, 'GATED');
    transition(project, run.run_id, 'COMMITTED');
  });

  it('should throw when dependency not completed', async () => {
    const { plan, start, executeStep } = await import('../../runtime/workflow/engine.js');
    const planData = plan(project, 'test-workflow');
    const run = start(project, planData);

    // Try to execute step-2 without step-1
    await assert.rejects(
      executeStep(project, run.run_id, 'step-2', { output: {} }),
      /Dependency step-1/
    );
  });
});
