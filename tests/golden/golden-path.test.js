import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TEST_PROJECT = join(process.cwd(), 'test-project-golden-e2e');

describe('Golden Path E2E', () => {
  before(() => {
    rmSync(TEST_PROJECT, { recursive: true, force: true });
    mkdirSync(TEST_PROJECT, { recursive: true });
    mkdirSync(join(TEST_PROJECT, 'bookforge', 'manifests'), { recursive: true });
    mkdirSync(join(TEST_PROJECT, 'bookforge', 'modules'), { recursive: true });
    mkdirSync(join(TEST_PROJECT, 'bookforge', 'workflows'), { recursive: true });
    mkdirSync(join(TEST_PROJECT, 'bookforge', 'state'), { recursive: true });
    mkdirSync(join(TEST_PROJECT, 'bookforge', 'artifacts'), { recursive: true });

    writeFileSync(
      join(TEST_PROJECT, 'bookforge', 'project.json'),
      JSON.stringify({ version: '0.6.0', template: 'book', host: 'generic', graph: 'none' })
    );
    writeFileSync(
      join(TEST_PROJECT, 'bookforge', 'PROJECT-CONSTITUTION.md'),
      '# BookForge Project\n\nThis is a test project.\n'
    );
    writeFileSync(
      join(TEST_PROJECT, 'bookforge', 'state', 'bookforge-state.md'),
      '# BookForge State\n\n## Current Phase\n\nDrafting\n'
    );
    writeFileSync(
      join(TEST_PROJECT, 'bookforge', 'manifests', 'workflows.json'),
      JSON.stringify([
        {
          id: 'test-workflow',
          version: '1.0.0',
          phase: 'execution',
          purpose: 'Test workflow',
          steps: [
            { id: 'step-1', action: 'analyze', agent: 'analyst', dependencies: [] },
            { id: 'step-2', action: 'draft', agent: 'writer', dependencies: ['step-1'] },
            { id: 'step-3', action: 'validate', agent: 'reviewer', dependencies: ['step-2'] }
          ],
          human_approval: false
        }
      ])
    );
    writeFileSync(
      join(TEST_PROJECT, 'bookforge', 'modules', 'registry.json'),
      JSON.stringify({ schema_version: '1.0.0', modules: [] })
    );
  });

  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should complete the full golden path', async () => {
    // Phase 1: Init project - already done in before()

    // Phase 2: Route task
    const { route } = await import('../../runtime/context/router.js');
    const decision = route(TEST_PROJECT, {
      task: 'Draft chapter 1 about Sarah',
      agent: 'writer',
      scope: { chapter: 1 }
    });
    assert.equal(decision.task_type, 'small');
    assert.ok(decision.required.length >= 0);

    // Phase 3: Pack context
    const { pack } = await import('../../runtime/context/packer.js');
    const packet = await pack(TEST_PROJECT, {
      task: 'Draft chapter 1 about Sarah',
      agent: 'writer',
      budget: 3000
    });
    assert.ok(packet.task_id);
    assert.ok(Array.isArray(packet.entries));

    // Phase 4: Plan workflow
    const { plan } = await import('../../runtime/workflow/engine.js');
    const planData = plan(TEST_PROJECT, 'test-workflow', {
      task: 'Draft chapter 1',
      agent: 'writer'
    });
    assert.equal(planData.version, '0.6.0');
    assert.equal(planData.workflow.steps.length, 3);

    // Phase 5: Start run
    const { start } = await import('../../runtime/workflow/engine.js');
    const run = start(TEST_PROJECT, planData);
    assert.ok(run.run_id);
    assert.equal(run.state, 'CONTEXT_BUILT');

    // Phase 6: Execute steps
    const { executeStep, getRun } = await import('../../runtime/workflow/engine.js');
    const step1 = await executeStep(TEST_PROJECT, run.run_id, 'step-1', {
      output: { analysis: 'Chapter 1 analysis complete' }
    });
    assert.equal(step1.status, 'completed');

    const step2 = await executeStep(TEST_PROJECT, run.run_id, 'step-2', {
      output: { draft: 'Chapter 1 draft content' }
    });
    assert.equal(step2.status, 'completed');

    const step3 = await executeStep(TEST_PROJECT, run.run_id, 'step-3', {
      output: { validated: true }
    });
    assert.equal(step3.status, 'completed');

    // Phase 7: Commit (VALIDATING -> GATED -> COMMITTED)
    const { transition } = await import('../../runtime/workflow/engine.js');
    await transition(TEST_PROJECT, run.run_id, 'EXECUTING');
    await transition(TEST_PROJECT, run.run_id, 'VALIDATING');
    await transition(TEST_PROJECT, run.run_id, 'GATED');
    const committed = transition(TEST_PROJECT, run.run_id, 'COMMITTED', {
      completed_at: new Date().toISOString()
    });
    assert.equal(committed.state, 'COMMITTED');

    // Phase 8: Quality check
    const { checkCriticalFindings } = await import('../../runtime/quality/engine.js');
    const quality = checkCriticalFindings(TEST_PROJECT);
    assert.equal(quality.has_critical, false);

    // Phase 9: Memory extraction
    const { extractAll } = await import('../../runtime/memory/extractor.js');
    const extraction = extractAll(TEST_PROJECT, {
      id: 'ch-01',
      content: 'Sarah lives in Paris. She works as a writer.'
    });
    assert.ok(extraction.levels);
    assert.ok(extraction.levels.deterministic);

    // Phase 10: Graph sync
    const { emit, listEvents } = await import('../../runtime/graph/synchronizer.js');
    const event = await emit(TEST_PROJECT, {
      event_id: 'test-event-1',
      operation: 'upsert_node',
      entity: { id: 'char-sarah', type: 'character', properties: { name: 'Sarah' } },
      timestamp: new Date().toISOString()
    });
    // Emit returns void/null, check events list instead
    const events = await listEvents(TEST_PROJECT);
    assert.ok(events.length > 0);

    console.log('Golden path complete: Init -> Route -> Pack -> Plan -> Execute -> Quality -> Memory -> Graph');
  });
});
