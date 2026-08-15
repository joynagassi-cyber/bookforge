import fs from 'node:fs';
import path from 'node:path';
import { writeJson, mkdir, bfPath, exists } from '../core/io.js';

// L0: Deterministic facts - directly stated in source
export function extractL0(project, sourceArtifact) {
  const facts = [];
  const content = typeof sourceArtifact === 'string' ? sourceArtifact : (sourceArtifact?.content || '');

  // Extract dates
  const datePatterns = [
    /\b(19|20)\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/g,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4}\b/gi
  ];

  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      facts.push({ type: 'date', value: match[0], source: sourceArtifact?.id || 'unknown' });
    }
  }

  // Extract proper nouns
  const nounPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
  let match;
  while ((match = nounPattern.exec(content)) !== null) {
    facts.push({ type: 'proper-noun', value: match[0], source: sourceArtifact?.id || 'unknown' });
  }

  return { level: 0, facts, total: facts.length, extracted_at: new Date().toISOString() };
}

// L1: Structural facts - relationships and structure
export function extractL1(project, sourceArtifact) {
  const facts = [];
  const content = typeof sourceArtifact === 'string' ? sourceArtifact : (sourceArtifact?.content || '');

  // Extract headings
  const headingPattern = /^#{1,6}\s+(.+)$/gm;
  let match;
  while ((match = headingPattern.exec(content)) !== null) {
    facts.push({
      type: 'heading',
      level: match[0].match(/^#+/)[0].length,
      text: match[1].trim(),
      source: sourceArtifact?.id || 'unknown'
    });
  }

  // Extract bullet points
  const bulletPattern = /^[ \t]*[-*+]\s+(.+)$/gm;
  while ((match = bulletPattern.exec(content)) !== null) {
    facts.push({
      type: 'bullet',
      text: match[1].trim(),
      source: sourceArtifact?.id || 'unknown'
    });
  }

  // Extract numbered lists
  const numberPattern = /^[ \t]*\d+\.\s+(.+)$/gm;
  while ((match = numberPattern.exec(content)) !== null) {
    facts.push({
      type: 'numbered-list',
      text: match[1].trim(),
      source: sourceArtifact?.id || 'unknown'
    });
  }

  return { level: 1, facts, total: facts.length, extracted_at: new Date().toISOString() };
}

// L2: Semantic facts - inferred relationships
export function extractL2(project, sourceArtifact, options = {}) {
  const facts = [];
  const content = typeof sourceArtifact === 'string' ? sourceArtifact : (sourceArtifact?.content || '');

  // Extract entity-relation triples
  const patterns = [
    /([^,.]{3,50})\s+(is|are|was|were)\s+([^,.]{1,30})\b/g,
    /([^,.]{3,50})\s+(has|have|had)\s+([^,.]{1,30})\b/g,
    /([^,.]{3,50})\s+(lives|works|born|created)\s+in\s+([^,.]{1,30})\b/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      facts.push({
        type: 'relation',
        subject: match[1].trim(),
        relation: match[2].trim(),
        object: match[3]?.trim() || match[4]?.trim(),
        source: sourceArtifact?.id || 'unknown',
        confidence: options.confidence || 0.7
      });
    }
  }

  return { level: 2, facts, total: facts.length, extracted_at: new Date().toISOString() };
}

export function extractAll(project, sourceArtifact, options = {}) {
  const l0 = extractL0(project, sourceArtifact);
  const l1 = extractL1(project, sourceArtifact);
  const l2 = extractL2(project, sourceArtifact, options);

  return {
    version: '0.6.0',
    source: sourceArtifact?.id || 'unknown',
    levels: {
      deterministic: l0,
      structural: l1,
      semantic: l2
    },
    summary: {
      total_facts: l0.facts.length + l1.facts.length + l2.facts.length,
      by_level: {
        L0: l0.facts.length,
        L1: l1.facts.length,
        L2: l2.facts.length
      }
    }
  };
}

export function saveExtracted(project, extraction, targetId = null) {
  const dir = bfPath(project, 'memory', 'extraction');
  mkdir(dir);
  const id = targetId || 'extract-' + Date.now();
  const file = path.join(dir, id + '.json');
  writeJson(file, extraction);
  return { id, path: file };
}
