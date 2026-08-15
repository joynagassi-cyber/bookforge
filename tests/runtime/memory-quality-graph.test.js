import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const TEST_PROJECT = join(process.cwd(), 'test-project-mqg');

describe('Memory, Quality, Graph', () => {
  before(() => {
    mkdirSync(TEST_PROJECT, { recursive: true });
    mkdirSync(join(TEST_PROJECT, 'bookforge', 'memory'), { recursive: true });
    mkdirSync(join(TEST_PROJECT, 'bookforge', 'quality', 'reports'), { recursive: true });
  });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should manage memories', async () => {
    const { initMemory, addFact, getMemory } = await import('../../runtime/memory/manager.js');
    const mem = initMemory(TEST_PROJECT, 'test-mem');
    assert.ok(mem.id);
    
    const fact = addFact(TEST_PROJECT, 'test-mem', { text: 'Sarah lives in Paris', source: 'ch-01' });
    assert.ok(fact.id);
    assert.equal(fact.status, 'canonical');
    
    const retrieved = getMemory(TEST_PROJECT, 'test-mem');
    assert.equal(retrieved.facts.length, 1);
  });

  it('should run quality validators', async () => {
    const { runValidator, checkCriticalFindings, registerValidator } = await import('../../runtime/quality/engine.js');
    registerValidator(TEST_PROJECT, 'test-validator', { severity: 'critical' });
    const finding = runValidator(TEST_PROJECT, 'test-validator', 'test-target', {
      status: 'FAIL',
      severity: 'critical',
      findings: [{ message: 'Test finding' }]
    });
    assert.equal(finding.status, 'FAIL');

    const criticals = checkCriticalFindings(TEST_PROJECT);
    assert.equal(criticals.has_critical, true);
  });

  it('should register validators', async () => {
    const { registerValidator, listValidators } = await import('../../runtime/quality/engine.js');
    registerValidator(TEST_PROJECT, 'my-validator', { severity: 'high' });
    const validators = listValidators(TEST_PROJECT);
    assert.ok(validators.some(v => v.id === 'my-validator'));
  });
});
