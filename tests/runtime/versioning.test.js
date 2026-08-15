import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('Versioning', () => {
  it('should have consistent runtime contract version', () => {
    const contractSchema = JSON.parse(fs.readFileSync('specs/runtime/runtime-contract.schema.json', 'utf8'));
    assert.equal(contractSchema.schema_version, '0.6.0');
  });

  it('should have consistent workflow schema version', () => {
    const workflowSchema = JSON.parse(fs.readFileSync('specs/workflows/workflow.schema.json', 'utf8'));
    assert.equal(workflowSchema.version, '1.0.0');
  });

  it('should have VERSIONING.md documentation', () => {
    assert.ok(fs.existsSync('docs/VERSIONING.md'), 'VERSIONING.md should exist');
  });

  it('should have runtime contract schema with components', () => {
    const contract = JSON.parse(fs.readFileSync('specs/runtime/runtime-contract.schema.json', 'utf8'));
    assert.ok(contract.components, 'Should have components');
    assert.ok(contract.components.plugin, 'Should have plugin component');
    assert.ok(contract.components.workflow, 'Should have workflow component');
    assert.ok(contract.components.context, 'Should have context component');
    assert.ok(contract.components.graph, 'Should have graph component');
    assert.ok(contract.components.host, 'Should have host component');
    assert.ok(contract.components.quality, 'Should have quality component');
  });

  it('should validate workflow schema has required fields', () => {
    const schema = JSON.parse(fs.readFileSync('specs/workflows/workflow.schema.json', 'utf8'));
    assert.ok(schema.required.includes('id'), 'Workflow schema should require id');
    assert.ok(schema.required.includes('version'), 'Workflow schema should require version');
    assert.ok(schema.required.includes('phase'), 'Workflow schema should require phase');
    assert.ok(schema.required.includes('purpose'), 'Workflow schema should require purpose');
    assert.ok(schema.required.includes('entry'), 'Workflow schema should require entry');
  });

  it('should have package.json with version', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    assert.ok(pkg.version, 'package.json should have version');
    assert.ok(pkg.name === 'bookforge-framework', 'Package name should be bookforge-framework');
  });

  it('should have bookforge.yaml with version', () => {
    const content = fs.readFileSync('bookforge.yaml', 'utf8');
    assert.ok(content.includes('version:'), 'bookforge.yaml should have version');
  });

  it('should have MANIFEST.json with framework version', () => {
    const manifest = JSON.parse(fs.readFileSync('MANIFEST.json', 'utf8'));
    assert.ok(manifest.version, 'MANIFEST.json should have version');
  });
});
