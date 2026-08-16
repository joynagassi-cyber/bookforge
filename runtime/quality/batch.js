/**
 * Batch Quality Checks — Run multiple validators efficiently
 */

import fs from 'node:fs';
import path from 'node:path';
import { readJson, bfPath, exists, readText } from '../core/io.js';
import { search } from '../retrieval.js';

/**
 * Run all quality checks for a chapter
 * @param {string} project - Project root
 * @param {object} packet - Context packet
 * @returns {object} Quality check results
 */
export async function runQualityChecks(project, packet) {
  const chapterNum = packet.scope?.chapter;
  const chapterId = packet.scope?.chapter_id || `ch-${chapterNum?.toString().padStart(3, '0')}`;

  // Load manuscript
  const manuscriptPath = bfPath(project, 'manuscript', `chapter-${chapterNum?.toString().padStart(2, '0')}.md`);
  if (!exists(manuscriptPath)) {
    return {
      chapter_id: chapterId,
      status: 'no_manuscript',
      totalFindings: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      findings: []
    };
  }

  const content = readText(manuscriptPath);

  // Run validators in parallel
  const validators = getValidators(packet);
  const results = await Promise.allSettled(
    validators.map(async (validatorId) => {
      try {
        return await runValidator(project, validatorId, content, packet);
      } catch (error) {
        return { validator_id: validatorId, error: error.message };
      }
    })
  );

  // Aggregate results
  const findings = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.findings) {
      findings.push(...result.value.findings);
    }
  }

  // Count by severity
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;

  return {
    chapter_id: chapterId,
    status: criticalCount > 0 ? 'fail' : highCount > 0 ? 'concerns' : 'pass',
    totalFindings: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    findings,
    validators_run: validators.length,
    checked_at: new Date().toISOString()
  };
}

/**
 * Check if there are critical findings that should block release
 */
export function hasCriticalFindings(qualityResult) {
  if (!qualityResult || !qualityResult.findings) return false;
  return qualityResult.findings.some(f => f.severity === 'critical' || f.status === 'FAIL');
}

/**
 * Get the list of validators to run based on packet context
 */
function getValidators(packet) {
  const qualityTargets = packet.quality_targets || [];
  const genre = packet.constraints?.genre || 'general';

  // Base validators that always run
  const base = ['voice', 'ai-slop', 'cliche', 'repetition'];

  // Genre-specific validators
  const genreValidators = {
    fiction: ['continuity', 'dialogue', 'pacing', 'show-dont-tell'],
    nonfiction: ['structure', 'facts', 'citations'],
    thriller: ['tension', 'pacing', 'continuity'],
    memoir: ['voice', 'authenticity', 'sensory-detail']
  };

  // Quality target validators
  const targetValidators = {
    'continuity': ['continuity'],
    'low-repetition': ['repetition'],
    'low-cliche': ['cliche'],
    'dialogue': ['dialogue'],
    'pacing': ['pacing'],
    'show-dont-tell': ['show-dont-tell'],
    'facts': ['facts'],
    'citations': ['citations']
  };

  // Combine all validators
  const allValidators = new Set([
    ...base,
    ...(genreValidators[genre] || []),
    ...(qualityTargets.flatMap(t => targetValidators[t] || []))
  ]);

  return [...allValidators];
}

/**
 * Run a single validator
 */
async function runValidator(project, validatorId, content, packet) {
  // Mock implementation - in production this would call actual validator logic
  const findings = [];

  switch (validatorId) {
    case 'voice':
      findings.push(...checkVoice(content, packet));
      break;
    case 'ai-slop':
      findings.push(...checkAISlop(content));
      break;
    case 'cliche':
      findings.push(...checkCliches(content));
      break;
    case 'repetition':
      findings.push(...checkRepetition(content));
      break;
    case 'continuity':
      findings.push(...checkContinuity(project, content, packet));
      break;
  }

  return {
    validator_id: validatorId,
    findings,
    status: findings.length === 0 ? 'PASS' : findings.some(f => f.severity === 'critical') ? 'FAIL' : 'CONCERNS'
  };
}

/**
 * Check for AI slop patterns
 */
function checkAISlop(content) {
  const findings = [];
  const slopPatterns = [
    { pattern: /delve into/i, severity: 'medium', signal: 'overused-verb' },
    { pattern: /tapestry/i, severity: 'medium', signal: 'overused-noun' },
    { pattern: /testament to/i, severity: 'medium', signal: 'cliché-phrase' },
    { pattern: /\bin conclusion\b/i, severity: 'low', signal: 'formulaic-closing' },
    { pattern: /\bon the other hand\b/i, severity: 'low', signal: 'formulaic-transition' }
  ];

  for (const { pattern, severity, signal } of slopPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      findings.push({
        pattern: signal,
        text: matches[0],
        location: `line ~${content.substring(0, matches.index).split('\n').length}`,
        severity
      });
    }
  }

  return findings;
}

/**
 * Check for cliches
 */
function checkCliches(content) {
  const findings = [];
  const cliches = [
    { pattern: /at the end of the day/i, severity: 'medium' },
    { pattern: /game changer/i, severity: 'high' },
    { pattern: /think outside the box/i, severity: 'high' },
    { pattern: /low-hanging fruit/i, severity: 'medium' },
    { pattern: /synergy/i, severity: 'medium' }
  ];

  for (const { pattern, severity } of cliches) {
    const matches = content.match(pattern);
    if (matches) {
      findings.push({
        pattern: 'cliche',
        text: matches[0],
        severity
      });
    }
  }

  return findings;
}

/**
 * Check for repetition
 */
function checkRepetition(content) {
  const findings = [];
  const paragraphs = content.split(/\n\s*\n/);

  for (let i = 0; i < paragraphs.length - 1; i++) {
    const current = paragraphs[i].toLowerCase().trim();
    const next = paragraphs[i + 1].toLowerCase().trim();

    // Check for repeating opening phrases
    const currentFirstSentence = current.split('.')[0];
    const nextFirstSentence = next.split('.')[0];

    if (currentFirstSentence === nextFirstSentence && currentFirstSentence.length > 20) {
      findings.push({
        pattern: 'repetitive-opening',
        text: currentFirstSentence.substring(0, 50),
        location: `paragraph ${i + 1}`,
        severity: 'medium'
      });
    }
  }

  return findings;
}

/**
 * Check voice consistency
 */
function checkVoice(content, packet) {
  const findings = [];
  const voiceProfile = packet.constraints?.voice || 'mentor';

  // Check for voice consistency issues
  // (In production, this would compare against voice profile)
  return findings;
}

/**
 * Check continuity with previous chapters
 */
async function checkContinuity(project, content, packet) {
  const findings = [];
  const chapterNum = packet.scope?.chapter;

  if (chapterNum <= 1) return findings;

  // Load previous chapter
  const prevPath = bfPath(project, 'manuscript', `chapter-${(chapterNum - 1).toString().padStart(2, '0')}.md`);
  if (!exists(prevPath)) return findings;

  const prevContent = readText(prevPath);

  // Extract character names from both chapters
  const charRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  const currentChars = new Set([...content.matchAll(charRegex)].map(m => m[1]));
  const prevChars = new Set([...prevContent.matchAll(charRegex)].map(m => m[1]));

  // Check for character inconsistencies
  for (const char of currentChars) {
    if (prevChars.has(char)) {
      // Check for description changes
      const currentDesc = extractDescription(content, char);
      const prevDesc = extractDescription(prevContent, char);
      if (currentDesc && prevDesc && currentDesc !== prevDesc) {
        findings.push({
          pattern: 'character-inconsistency',
          character: char,
          current: currentDesc,
          previous: prevDesc,
          severity: 'high'
        });
      }
    }
  }

  return findings;
}

/**
 * Extract character description from text
 */
function extractDescription(content, characterName) {
  const regex = new RegExp(`${characterName}.*?((?:with|having|who\\s+was)\\s+[^.]+)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

export default {
  runQualityChecks,
  hasCriticalFindings,
  checkAISlop,
  checkCliches,
  checkRepetition
};
