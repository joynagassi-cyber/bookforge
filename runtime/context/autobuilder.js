/**
 * Context Packet Auto-Builder
 *
 * Automatically generates bounded context packets for chapter drafting
 * based on the book contract, outline, and voice profile.
 */

import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, bfPath, mkdir, exists, readText } from '../core/io.js';
import { search } from '../retrieval.js';
import { loadOutline } from '../workflow/outline-loader.js';

/**
 * Build a complete context packet for drafting a chapter
 * @param {string} project - Project root directory
 * @param {number} chapterNum - Chapter number (1-indexed)
 * @param {object} chapterData - Chapter data from outline
 * @returns {object} Complete context packet
 */
export async function autoBuildPacket(project, chapterNum, chapterData = {}) {
  const chapterId = `ch-${chapterNum.toString().padStart(3, '0')}`;

  // Load core artifacts
  const contract = loadBookContract(project);
  const outline = loadOutline(project);
  const styleBible = loadStyleBible(project);
  const voiceProfile = loadVoiceProfile(project);

  // Build chapter packet
  const packet = {
    version: '1.0.0',
    task_id: `CH-${chapterNum.toString().padStart(2, '0')}`,
    intent: 'draft',
    scope: {
      chapter: chapterNum,
      chapter_id: chapterId,
      outline_node: chapterData
    },

    // Required artifacts
    required_artifacts: [
      'bookforge/state/book-contract.md',
      `bookforge/state/outline/${chapterId}.yaml`,
      'bookforge/state/style-bible.md',
      'bookforge/state/voice-profile.md'
    ],

    // Optional artifacts (for continuity)
    optional_artifacts: [
      // Previous chapter manuscript for continuity
      ...(chapterNum > 1 ? [`manuscript/chapter-${(chapterNum-1).toString().padStart(2, '0')}.md`] : []),
      // Chapter patterns for this genre
      ...(chapterData?.genre ? [`catalogs/chapter-patterns.csv`] : []),
      // Relevant voice constraints
      ...(voiceProfile ? [`bookforge/state/voice-profile.md`] : [])
    ],

    // Constraints from outline
    constraints: {
      max_words: chapterData?.target_words || contract?.target_length_per_chapter || 3000,
      min_words: chapterData?.min_words || 800,
      voice_profile: chapterData?.voice || voiceProfile?.primary_voice || 'mentor',
      genre: chapterData?.genre || contract?.genre || 'general',
      tone: chapterData?.tone || contract?.tone || 'balanced'
    },

    // Quality targets based on chapter type
    quality_targets: buildQualityTargets(chapterData, contract),

    // Context for the agent
    context: {
      book_promise: contract?.promise || 'Deliver value to reader',
      chapter_goal: chapterData?.goal || `Complete chapter ${chapterNum}`,
      continuity_notes: await loadContinuityNotes(project, chapterNum),
      relevant_patterns: await getRelevantPatterns(project, chapterData?.genre)
    },

    // Metadata
    created_at: new Date().toISOString(),
    budget: {
      tokens: 8000,
      mode: 'high'
    }
  };

  return packet;
}

/**
 * Load book contract from canonical artifacts
 */
function loadBookContract(project) {
  const p = bfPath(project, 'state', 'book-contract.md');
  if (exists(p)) {
    const content = readText(p);
    // Parse YAML-like contract
    return {
      title: extractField(content, 'title'),
      author: extractField(content, 'author'),
      genre: extractField(content, 'genre'),
      tone: extractField(content, 'tone'),
      promise: extractField(content, 'promise'),
      target_length_per_chapter: extractField(content, 'target_length_per_chapter')
    };
  }
  return null;
}

/**
 * Load style bible
 */
function loadStyleBible(project) {
  const p = bfPath(project, 'state', 'style-bible.md');
  if (exists(p)) {
    return readText(p);
  }
  return null;
}

/**
 * Load voice profile
 */
function loadVoiceProfile(project) {
  const p = bfPath(project, 'state', 'voice-profile.md');
  if (exists(p)) {
    return readText(p);
  }
  return null;
}

/**
 * Build quality targets based on chapter type
 */
function buildQualityTargets(chapterData, contract) {
  const targets = ['continuity', 'low-repetition', 'low-cliche'];

  // Add genre-specific targets
  const genre = chapterData?.genre || contract?.genre;
  if (genre === 'fiction' || genre === 'thriller') {
    targets.push('dialogue', 'pacing', 'show-dont-tell');
  }
  if (genre === 'nonfiction' || genre === 'business') {
    targets.push('facts', 'citations', 'structure');
  }
  if (genre === 'memoir') {
    targets.push('voice', 'authenticity', 'sensory-detail');
  }

  return targets;
}

/**
 * Load continuity notes from previous chapters
 */
async function loadContinuityNotes(project, chapterNum) {
  const notes = [];

  // Load from continuity state if available
  const continuityPath = bfPath(project, 'state', 'continuity.md');
  if (exists(continuityPath)) {
    const content = readText(continuityPath);
    // Extract relevant continuity info
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes(`chapter-${chapterNum}`) || line.includes(`ch-${chapterNum}`)) {
        notes.push(line);
      }
    }
  }

  // Load previous chapter summaries
  for (let i = chapterNum - 1; i >= Math.max(1, chapterNum - 3); i--) {
    const prevPath = bfPath(project, 'manuscript', `chapter-${i.toString().padStart(2, '0')}.md`);
    if (exists(prevPath)) {
      const content = readText(prevPath);
      notes.push(`Previous chapter ${i}: ${content.substring(0, 200)}...`);
    }
  }

  return notes.slice(0, 5); // Limit to 5 most recent
}

/**
 * Get relevant chapter patterns for the genre
 */
async function getRelevantPatterns(project, genre) {
  if (!genre) return [];

  // Search for chapter patterns
  const patterns = await search(project, `${genre} chapter pattern structure`, {
    catalog: 'chapter-patterns',
    limit: 3
  });

  return patterns.map(p => ({
    id: p.id,
    pattern: p.definition,
    best_for: p.purpose
  }));
}

/**
 * Extract a field from YAML-like content
 */
function extractField(content, field) {
  const regex = new RegExp(`${field}\\s*:\\s*(.+)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
}

/**
 * Build context packet for multiple chapters (batch)
 */
export async function buildBatchPackets(project, chapterStart, chapterEnd) {
  const outline = loadOutline(project);
  if (!outline || !outline.chapters) {
    throw new Error('No outline found');
  }

  const packets = [];
  for (let i = chapterStart; i <= chapterEnd; i++) {
    const chapterId = `ch-${i.toString().padStart(3, '0')}`;
    const chapterData = outline.chapters[chapterId];
    if (chapterData) {
      packets.push(await autoBuildPacket(project, i, chapterData));
    }
  }

  return packets;
}

export default {
  autoBuildPacket,
  buildBatchPackets,
  loadBookContract,
  loadStyleBible,
  loadVoiceProfile
};
