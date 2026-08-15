import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readJson, writeJson, mkdir, exists } from '../core/io.js';

const MEMORY_TYPES = {
  CANONICAL: 'canonical',
  WORKING: 'working',
  INFERRED: 'inferred',
  CONFLICT: 'conflict'
};

export function memoryPath(project, memoryId) {
  return path.join(project, 'bookforge', 'memory', `${memoryId}.json`);
}

export function initMemory(project, memoryId, options = {}) {
  const dir = path.join(project, 'bookforge', 'memory');
  mkdir(dir);
  const fp = memoryPath(project, memoryId);
  const memory = {
    id: memoryId,
    type: options.type || MEMORY_TYPES.CANONICAL,
    facts: [],
    conflicts: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  writeJson(fp, memory);
  return memory;
}

export function addFact(project, memoryId, fact, options = {}) {
  const fp = memoryPath(project, memoryId);
  if (!exists(fp)) {
    return initMemory(project, memoryId, options);
  }
  const memory = readJson(fp);
  const factEntry = {
    id: crypto.randomUUID(),
    text: fact.text || fact,
    type: fact.type || 'statement',
    source: fact.source || 'unknown',
    confidence: fact.confidence || 1.0,
    status: MEMORY_TYPES.CANONICAL,
    created_at: new Date().toISOString()
  };

  // Check for conflicts
  const existing = memory.facts.find(f => f.text === factEntry.text);
  if (existing && existing.text !== factEntry.text) {
    memory.conflicts.push({
      facts: [existing, factEntry],
      detected_at: new Date().toISOString()
    });
    factEntry.status = MEMORY_TYPES.CONFLICT;
  }

  memory.facts.push(factEntry);
  memory.updated_at = new Date().toISOString();
  writeJson(fp, memory);
  return factEntry;
}

export function getMemory(project, memoryId) {
  const fp = memoryPath(project, memoryId);
  if (!exists(fp)) return null;
  return readJson(fp);
}

export function listMemories(project) {
  const dir = path.join(project, 'bookforge', 'memory');
  if (!exists(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => readJson(path.join(dir, f)));
}

export function search(project, memoryId, query) {
  const memory = getMemory(project, memoryId);
  if (!memory) return [];
  const q = query.toLowerCase();
  return memory.facts.filter(f => f.text.toLowerCase().includes(q));
}

export { MEMORY_TYPES };
