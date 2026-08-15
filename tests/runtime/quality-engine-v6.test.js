import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TEST_PROJECT = join(process.cwd(), 'test-project-qe');

describe('Quality Engine v0.6', () => {
  before(() => {
    rmSync(TEST_PROJECT, { recursive: true, force: true });
    mkdirSync(TEST_PROJECT, { recursive: true });
    mkdirSync(join(TEST_PROJECT, 'bookforge', 'quality', 'reports'), { recursive: true });
  });

  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should register a validator with dimension', async () => {
    const { registerValidator, getValidator } = await import('../../runtime/quality/engine.js');
    const v = registerValidator(TEST_PROJECT, 'test-validator', {
      severity: 'high',
      dimension: 'voice'
    });
    assert.equal(v.id, 'test-validator');
    assert.equal(v.dimension, 'voice');
    assert.equal(v.severity, 'high');
  });

  it('should run validator with dimension', async () => {
    const { registerValidator, runValidator } = await import('../../runtime/quality/engine.js');
    registerValidator(TEST_PROJECT, 'voice-check', { severity: 'critical', dimension: 'voice' });
    const finding = runValidator(TEST_PROJECT, 'voice-check', 'test-target', {
      status: 'FAIL',
      severity: 'critical',
      dimension: 'voice',
      findings: [{ message: 'AI slop detected' }]
    });
    assert.equal(finding.status, 'FAIL');
    assert.equal(finding.dimension, 'voice');
  });

  it('should check critical findings', async () => {
    const { registerValidator, runValidator, checkCriticalFindings } = await import('../../runtime/quality/engine.js');
    registerValidator(TEST_PROJECT, 'critical-validator', { severity: 'critical', dimension: 'facts' });
    runValidator(TEST_PROJECT, 'critical-validator', 'target', {
      status: 'FAIL',
      severity: 'critical',
      findings: [{ message: 'Critical fact error' }]
    });
    const result = checkCriticalFindings(TEST_PROJECT);
    assert.equal(result.has_critical, true);
    assert.ok(result.findings.length > 0);
    assert.ok(result.summary);
  });

  it('should get dimension status', async () => {
    const { registerValidator, runValidator, getDimensionStatus } = await import('../../runtime/quality/engine.js');
    registerValidator(TEST_PROJECT, 'dim-validator', { severity: 'high', dimension: 'structure' });
    runValidator(TEST_PROJECT, 'dim-validator', 'target', {
      status: 'CONCERNS',
      severity: 'high',
      dimension: 'structure'
    });
    const status = getDimensionStatus(TEST_PROJECT, 'structure');
    assert.equal(status.dimension, 'structure');
    assert.equal(status.status, 'CONCERNS');
  });

  it('should validate severity and dimension', async () => {
    const { registerValidator, runValidator } = await import('../../runtime/quality/engine.js');
    registerValidator(TEST_PROJECT, 'valid-validator', { severity: 'medium', dimension: 'continuity' });

    // Valid severity
    runValidator(TEST_PROJECT, 'valid-validator', 'target', {
      status: 'PASS',
      severity: 'medium'
    });

    // Invalid severity should throw
    assert.throws(
      () => runValidator(TEST_PROJECT, 'valid-validator', 'target', { severity: 'invalid' }),
      /Invalid severity/
    );

    // Invalid dimension should throw
    assert.throws(
      () => runValidator(TEST_PROJECT, 'valid-validator', 'target', { dimension: 'invalid' }),
      /Invalid dimension/
    );
  });
});
