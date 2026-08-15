import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Host Bridge', () => {
  it('should export functions', async () => {
    const { loadHostSpecs, resolveCapabilities, findBestHost, generateHostBridge, mapCapabilityToHost } = await import('../../runtime/host/bridge.js');
    assert.equal(typeof loadHostSpecs, 'function');
    assert.equal(typeof resolveCapabilities, 'function');
    assert.equal(typeof findBestHost, 'function');
    assert.equal(typeof generateHostBridge, 'function');
    assert.equal(typeof mapCapabilityToHost, 'function');
  });
});

describe('Skill Generator', () => {
  it('should export functions', async () => {
    const { generateSkills, generateCustomSkill, listGeneratedSkills } = await import('../../runtime/host/skill-generator.js');
    assert.equal(typeof generateSkills, 'function');
    assert.equal(typeof generateCustomSkill, 'function');
    assert.equal(typeof listGeneratedSkills, 'function');
  });
});

describe('Graph Enhancements', () => {
  it('should export functions and constants', async () => {
    const { createEvent, GRAPH_TYPES, validateEventType, standardizeEvent, EXAMPLE_EVENTS, normalizeEvent } = await import('../../runtime/graph/enhancements.js');
    assert.equal(typeof createEvent, 'function');
    assert.ok(GRAPH_TYPES);
    assert.equal(typeof validateEventType, 'function');
    assert.equal(typeof standardizeEvent, 'function');
    assert.ok(EXAMPLE_EVENTS);
    assert.equal(typeof normalizeEvent, 'function');
  });

  it('should validate event types', async () => {
    const { validateEventType } = await import('../../runtime/graph/enhancements.js');
    const errors = validateEventType('upsert_node', { entity: { id: 'test', type: 'chapter' } });
    assert.equal(errors.length, 0);

    const errors2 = validateEventType('upsert_node', { entity: {} });
    assert.ok(errors2.length > 0);
  });

  it('should create standardized events', async () => {
    const { createEvent, standardizeEvent, normalizeEvent } = await import('../../runtime/graph/enhancements.js');
    const event = createEvent('test', 'upsert_node', { id: 'ch-01', type: 'chapter', properties: { title: 'Test' } });
    assert.ok(event.event_id);
    assert.equal(event.operation, 'upsert_node');
    assert.equal(event.entity.id, 'ch-01');

    const normalized = normalizeEvent(event);
    assert.equal(normalized.valid, true);
  });
});
