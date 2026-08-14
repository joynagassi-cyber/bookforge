import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readJson, bfPath, mkdir, exists, writeText } from '../core/io.js';

function safe(p) {
  try { return readJson(p); } catch { return null; }
}

export function loadMaps(project) {
  const root = bfPath(project, 'knowledge', 'indexes');
  return {
    agents: safe(path.join(root, 'agent-catalog-map.json')) || {},
    workflows: safe(path.join(root, 'workflow-catalog-map.json')) || {},
    catalogs: safe(path.join(root, 'catalog-index.json')) || {},
    entries: safe(path.join(root, 'entry-index.json')) || {}
  };
}

function flatten(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') {
    return Object.values(v).flatMap(flatten);
  }
  return typeof v === 'string' ? [v] : [];
}

function detectTaskType(task) {
  const q = (task || '').toLowerCase();
  if (/new book|nouveau livre|full project|projet complet/.test(q)) return 'book-scale';
  if (/structural change|changement structurel|major|packaging|publication|central promise/.test(q)) return 'large';
  if (/new chapter|ajouter chapitre|outline|structure|about source verification/.test(q)) return 'medium';
  if (/rewrite|revision|chapter|chapitre|section|conclusion/.test(q)) return 'small';
  if (/typo|correction|fix|polish|edit/.test(q)) return 'tiny';
  return 'small';
}

function extractHints(task) {
  const q = (task || '').toLowerCase();
  const hints = [];
  if (/dialogue|conversation|speech/.test(q)) hints.push('dialogue', 'subtext', 'voice');
  if (/character|personnage|protagonist/.test(q)) hints.push('character', 'character-arcs', 'relationships');
  if (/chapter|chapitre|scene|scène|beat/.test(q)) hints.push('scenes', 'beats', 'conflict', 'stakes', 'pacing');
  if (/research|recherche|claim|citation|source|evidence/.test(q)) hints.push('research', 'sources', 'claims');
  if (/edit|revision|quality|qualité|improve/.test(q)) hints.push('quality', 'anti-patterns', 'cliches', 'ai-slop', 'originality');
  if (/outline|plan|structure|arch/.test(q)) hints.push('book_structure', 'story_structures', 'plot_patterns');
  if (/voice|tone|style|writing style/.test(q)) hints.push('voice', 'tone', 'style', 'writing-styles');
  if (/packag|publish|metadata|launch/.test(q)) hints.push('packaging', 'digital_publishing', 'marketing');
  return hints;
}

export function route(project, { task = '', agent = null, workflow = null, genre = null, bookType = null, audience = null } = {}) {
  const m = loadMaps(project);
  const taskType = detectTaskType(task);
  const hints = extractHints(task);
  const required = new Set();
  const optional = new Set();
  for (const src of [m.agents?.[agent], m.workflows?.[workflow]]) {
    if (!src) continue;
    flatten(src.required || src).forEach(x => required.add(x));
    flatten(src.optional || []).forEach(x => optional.add(x));
  }
  hints.forEach(x => required.add(x));
  const scaleMap = { 'tiny': 'tiny', 'small': 'small', 'medium': 'medium', 'large': 'large', 'book-scale': 'book-scale' };
  return {
    version: '0.5.0',
    task_type: taskType,
    agent,
    workflow,
    filters: { genre, bookType, audience },
    required: [...required].sort(),
    optional: [...optional].sort(),
    hints,
    scale: scaleMap[taskType] || 'small',
    task
  };
}
