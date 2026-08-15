import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { writeJson, mkdir, bfPath, exists } from '../core/io.js';

// Standard event model
export function createEvent(project, operation, entity, options = {}) {
  const event = {
    event_id: options.eventId || 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    operation,
    entity: {
      id: entity.id,
      type: entity.type,
      properties: entity.properties || {}
    },
    edge: options.edge || null,
    source_artifact: options.sourceArtifact || null,
    source_hash: options.sourceHash ? crypto.createHash('sha256').update(options.sourceHash).digest('hex') : null,
    timestamp: new Date().toISOString(),
    version: '0.6.0'
  };
  return event;
}

// Graph type definitions
export const GRAPH_TYPES = {
  node: {
    required: ['id', 'type'],
    optional: ['label', 'properties', 'metadata']
  },
  edge: {
    required: ['from', 'to', 'type'],
    optional: ['properties', 'weight']
  }
};

export function validateEventType(operation, payload) {
  const errors = [];
  if (operation.startsWith('upsert_') || operation === 'create_node') {
    if (!payload.entity?.id) errors.push('entity.id required');
    if (!payload.entity?.type) errors.push('entity.type required');
  }
  if (operation === 'create_edge' || operation === 'upsert_edge') {
    if (!payload.edge?.from) errors.push('edge.from required');
    if (!payload.edge?.to) errors.push('edge.to required');
    if (!payload.edge?.type) errors.push('edge.type required');
  }
  return errors;
}

// Event standardization
export function standardizeEvent(rawEvent) {
  const operation = rawEvent.operation || 'unknown';
  const entity = rawEvent.entity || {};
  const edge = rawEvent.edge || {};

  return {
    event_id: rawEvent.event_id || 'evt-' + Date.now(),
    operation,
    entity: {
      id: entity.id,
      type: entity.type || 'unknown',
      properties: entity.properties || {}
    },
    edge: edge.from ? {
      from: edge.from,
      to: edge.to,
      type: edge.type || 'related',
      properties: edge.properties || {}
    } : null,
    timestamp: rawEvent.timestamp || new Date().toISOString(),
    version: '0.6.0'
  };
}

// Example events
export const EXAMPLE_EVENTS = {
  chapter_created: {
    operation: 'upsert_node',
    entity: { id: 'ch-01', type: 'chapter', properties: { title: 'Chapter 1', number: 1 } }
  },
  character_added: {
    operation: 'upsert_node',
    entity: { id: 'char-01', type: 'character', properties: { name: 'John', role: 'protagonist' } }
  },
  chapter_character: {
    operation: 'create_edge',
    edge: { from: 'ch-01', to: 'char-01', type: 'features' }
  },
  fact_verified: {
    operation: 'upsert_node',
    entity: { id: 'fact-01', type: 'fact', properties: { text: 'Paris is in France', verified: true } }
  }
};

export function normalizeEvent(event) {
  const std = standardizeEvent(event);
  const errors = validateEventType(std.operation, std);
  return { ...std, valid: errors.length === 0, errors };
}
