import { readJson, exists } from '../core/io.js';
import path from 'node:path';

export async function find(project, query, options = {}) {
  const events = await listEvents(project, options);
  return events.filter(e =>
    e.entity?.id?.toLowerCase().includes(query.toLowerCase()) ||
    e.entity?.type?.toLowerCase().includes(query.toLowerCase())
  );
}

export async function get(project, entityId) {
  const events = await listEvents(project);
  return events.find(e => e.entity?.id === entityId) || null;
}

export async function neighborhood(project, entityId, depth = 1) {
  const events = await listEvents(project);
  const related = events.filter(e =>
    e.edge?.from === entityId || e.edge?.to === entityId
  );
  return related.slice(0, depth * 10);
}

export async function related(project, entityId, relationType) {
  const events = await listEvents(project);
  return events.filter(e =>
    e.edge?.from === entityId && (!relationType || e.edge?.type === relationType)
  );
}

export async function upsert(project, entity, options = {}) {
  const { emit } = await import('./synchronizer.js');
  return emit(project, {
    event_id: options.eventId || `upsert-${Date.now()}`,
    operation: 'upsert_node',
    entity: {
      id: entity.id,
      type: entity.type,
      properties: entity.properties || {}
    },
    source_artifact: options.sourceArtifact,
    timestamp: new Date().toISOString()
  });
}

export async function deleteNode(project, entityId) {
  const { emit } = await import('./synchronizer.js');
  return emit(project, {
    event_id: `delete-${Date.now()}`,
    operation: 'delete_node',
    entity: { id: entityId, type: 'unknown' },
    timestamp: new Date().toISOString()
  });
}

export async function conflicts(project, entityId) {
  const events = await listEvents(project);
  const entityEvents = events.filter(e => e.entity?.id === entityId);
  if (entityEvents.length <= 1) return [];

  const conflicts = [];
  for (let i = 0; i < entityEvents.length; i++) {
    for (let j = i + 1; j < entityEvents.length; j++) {
      if (entityEvents[i].source_hash !== entityEvents[j].source_hash) {
        conflicts.push({
          entity_id: entityId,
          conflicting_events: [entityEvents[i].event_id, entityEvents[j].event_id]
        });
      }
    }
  }
  return conflicts;
}

async function listEvents(project, options = {}) {
  const { listEvents: list } = await import('./synchronizer.js');
  return list(project, options);
}
