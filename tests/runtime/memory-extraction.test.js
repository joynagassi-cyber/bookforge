import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TEST_PROJECT = join(process.cwd(), 'test-project-mem');

describe('Memory Extraction L0/L1/L2', () => {
  before(() => {
    rmSync(TEST_PROJECT, { recursive: true, force: true });
    mkdirSync(TEST_PROJECT, { recursive: true });
    mkdirSync(join(TEST_PROJECT, 'bookforge', 'memory'), { recursive: true });
  });

  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should extract L0 deterministic facts', async () => {
    const { extractL0 } = await import('../../runtime/memory/extractor.js');
    const result = extractL0(TEST_PROJECT, {
      id: 'test-doc',
      content: 'Sarah was born in 1990-05-15. She lives in New York City.'
    });
    assert.equal(result.level, 0);
    assert.ok(result.facts.length > 0);
    assert.ok(result.facts.some(f => f.type === 'date'));
    assert.ok(result.facts.some(f => f.type === 'proper-noun'));
  });

  it('should extract L1 structural facts', async () => {
    const { extractL1 } = await import('../../runtime/memory/extractor.js');
    const content = `# Introduction\n\n## Chapter 1\n\n- Point 1\n- Point 2\n\n1. First\n2. Second`;
    const result = extractL1(TEST_PROJECT, { id: 'test-doc', content });
    assert.equal(result.level, 1);
    assert.ok(result.facts.some(f => f.type === 'heading'));
    assert.ok(result.facts.some(f => f.type === 'bullet'));
    assert.ok(result.facts.some(f => f.type === 'numbered-list'));
  });

  it('should extract L2 semantic facts', async () => {
    const { extractL2 } = await import('../../runtime/memory/extractor.js');
    const result = extractL2(TEST_PROJECT, {
      id: 'test-doc',
      content: 'Sarah is a writer. John has a dog. Paris is in France.'
    });
    assert.equal(result.level, 2);
    assert.ok(result.facts.length > 0);
    assert.ok(result.facts.some(f => f.type === 'relation'));
  });

  it('should extract all levels', async () => {
    const { extractAll } = await import('../../runtime/memory/extractor.js');
    const result = extractAll(TEST_PROJECT, {
      id: 'test-doc',
      content: '# Introduction\n\nSarah is a writer born in 1990-05-15. She lives in New York City.'
    });
    assert.ok(result.levels);
    assert.ok(result.levels.deterministic);
    assert.ok(result.levels.structural);
    assert.ok(result.levels.semantic);
    assert.ok(result.summary.total_facts > 0);
  });

  it('should save extracted facts', async () => {
    const { saveExtracted, extractAll } = await import('../../runtime/memory/extractor.js');
    const extraction = extractAll(TEST_PROJECT, { id: 'test-doc', content: 'Test content' });
    const saved = saveExtracted(TEST_PROJECT, extraction, 'test-extract');
    assert.ok(saved.id);
    assert.ok(saved.path);
  });
});
