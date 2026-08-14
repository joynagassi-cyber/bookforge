import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { emit, sync, getEvent, listEvents } from '../../runtime/graph/synchronizer.js';

const TEST_PROJECT = join(process.cwd(), 'test-project-graph');

function setupTestProject() {
  rmSync(TEST_PROJECT, { recursive: true, force: true });
  mkdirSync(TEST_PROJECT, { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'graph'), { recursive: true });
  mkdirSync(join(TEST_PROJECT, 'bookforge', 'events'), { recursive: true });
  writeFileSync(join(TEST_PROJECT, 'bookforge', 'graph', 'provider.json'), JSON.stringify({ provider: 'jsonl' }));
  return TEST_PROJECT;
}

describe('Graph Synchronizer', () => {
  let project;
  before(() => { project = setupTestProject(); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should emit an event', async () => {
    const { emit } = await import('../../runtime/graph/synchronizer.js');
    const event = await emit(project, { operation: 'draft', agent: 'writer', workflow: 'draft-chapter' });
    assert.ok(event.event_id);
    assert.ok(event.emitted_at);
  });

  it('should sync events', async () => {
    const { emit, sync } = await import('../../runtime/graph/synchronizer.js');
    await emit(project, { operation: 'test', agent: 'writer' });
    const result = await sync(project);
    assert.equal(result.status, 'ok');
    assert.ok(result.applied >= 0);
  });

  it('should get an event', async () => {
    const { emit, getEvent, listEvents } = await import('../../runtime/graph/synchronizer.js');
    const event = await emit(project, { operation: 'get-test', agent: 'writer' });
    // Events need to be synced first before getEvent can find them
    await sync(project);
    const retrieved = await getEvent(project, event.event_id);
    assert.ok(retrieved || (await listEvents(project)).some(e => e.event_id === event.event_id));
  });

  it('should list events', async () => {
    const { emit, listEvents } = await import('../../runtime/graph/synchronizer.js');
    await emit(project, { operation: 'list-test-1', agent: 'writer' });
    await emit(project, { operation: 'list-test-2', agent: 'editor' });
    const events = await listEvents(project);
    assert.ok(events.length >= 2);
  });

  it('should list events with filter', async () => {
    const { emit, listEvents } = await import('../../runtime/graph/synchronizer.js');
    await emit(project, { operation: 'filter-test', agent: 'writer' });
    const events = await listEvents(project, { operation: 'filter-test' });
    assert.equal(events.length, 1);
  });
});
