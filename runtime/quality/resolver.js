/**
 * Quality Auto-Correction Engine
 *
 * Applies automated fixes to medium/low severity quality findings.
 * Critical findings always require human review.
 */

import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, bfPath, mkdir, exists, readText, writeText } from '../core/io.js';
import { search } from '../retrieval.js';

const RESOLVERS = {};

/**
 * Resolve quality findings and apply auto-corrections
 * @param {string} project - Project root
 * @param {Array} findings - Quality findings to resolve
 * @param {object} options - Resolution options
 * @returns {object} Resolution results with corrections applied
 */
export async function resolveFindings(project, findings, options = {}) {
  const {
    dryRun = false,
    autoCorrect = true,
    maxCorrections = 50,
    skipSeverities = ['critical', 'high']
  } = options;

  const results = {
    version: '1.0.0',
    total_findings: findings.length,
    auto_corrected: 0,
    skipped: 0,
    corrections: [],
    errors: []
  };

  // Filter findings by severity
  const eligible = findings.filter(f => !skipSeverities.includes(f.severity));

  for (const finding of eligible.slice(0, maxCorrections)) {
    try {
      const resolver = getResolver(finding.validator_id);

      if (resolver && resolver.canAutoFix(finding)) {
        if (dryRun) {
          results.corrections.push({
            type: 'dry-run',
            finding: finding.validator_id,
            severity: finding.severity,
            action: resolver.describeAction(finding)
          });
        } else {
          const correction = await resolver.apply(project, finding);
          results.corrections.push(correction);
          results.auto_corrected++;
        }
      } else {
        results.skipped++;
      }
    } catch (error) {
      results.errors.push({
        finding: finding.validator_id,
        error: error.message
      });
    }
  }

  // Apply corrections
  if (!dryRun && results.corrections.length > 0) {
    await applyCorrections(project, results.corrections);
  }

  return results;
}

/**
 * Register a resolver for a validator type
 */
export function registerResolver(validatorId, resolver) {
  RESOLVERS[validatorId] = resolver;
}

/**
 * Get resolver for a validator
 */
export function getResolver(validatorId) {
  return RESOLVERS[validatorId] || null;
}

/**
 * Apply corrections to the manuscript
 */
async function applyCorrections(project, corrections) {
  const correctionsLog = [];

  for (const correction of corrections) {
    try {
      if (correction.type === 'replace' && correction.target_file) {
        // Apply text replacement
        const filePath = bfPath(project, correction.target_file);
        if (exists(filePath)) {
          let content = readText(filePath);
          content = content.replaceAll(correction.old_text, correction.new_text);
          writeText(filePath, content);

          correctionsLog.push({
            type: 'applied',
            file: correction.target_file,
            action: `Replaced "${correction.old_text.substring(0, 30)}..." with "${correction.new_text.substring(0, 30)}..."`
          });
        }
      } else if (correction.type === 'rewrite' && correction.target_file) {
        // For rewrite operations, log for manual application
        correctionsLog.push({
          type: 'scheduled',
          file: correction.target_file,
          action: `Rewrite section: ${correction.section || 'unknown'}`
        });
      }
    } catch (error) {
      correctionsLog.push({
        type: 'error',
        error: error.message
      });
    }
  }

  // Save corrections log
  const logPath = bfPath(project, 'quality', 'corrections-log.json');
  mkdir(path.dirname(logPath));

  const existingLog = exists(logPath) ? readJson(logPath) : { corrections: [] };
  existingLog.corrections.push(...correctionsLog);
  existingLog.last_run = new Date().toISOString();
  writeJson(logPath, existingLog);
}

// ============================================================
// Built-in Resolvers
// ============================================================

/**
 * Cliche detector resolver — replace with alternatives from catalog
 */
registerResolver('cliche-detector', {
  canAutoFix(finding) {
    return finding.severity === 'medium' || finding.severity === 'low';
  },

  describeAction(finding) {
    return `Replace cliche "${finding.findings?.[0]?.pattern || 'unknown'}" with catalog alternative`;
  },

  async apply(project, finding) {
    // Search for alternatives in cliche catalog
    const alternatives = await search(project, finding.findings?.[0]?.pattern, {
      catalog: 'cliches',
      limit: 3
    });

    const replacement = alternatives[0]?.definition || finding.findings?.[0]?.replacement;

    return {
      type: 'replace',
      finding: 'cliche-detector',
      old_text: finding.findings?.[0]?.text,
      new_text: replacement,
      severity: finding.severity
    };
  }
});

/**
 * AI Slop detector resolver — add concrete details
 */
registerResolver('ai-slop-detector', {
  canAutoFix(finding) {
    return finding.severity === 'medium' || finding.severity === 'low';
  },

  describeAction(finding) {
    return `Add concrete details to AI-slop pattern: ${finding.findings?.[0]?.signal || 'unknown'}`;
  },

  async apply(project, finding) {
    const pattern = finding.findings?.[0];

    return {
      type: 'rewrite',
      finding: 'ai-slop-detector',
      pattern: pattern?.signal,
      section: pattern?.location,
      instructions: pattern?.repair_direction || 'Add concrete, specific details',
      severity: finding.severity
    };
  }
});

/**
 * Repetition detector resolver — consolidate repetitive passages
 */
registerResolver('repetition-detector', {
  canAutoFix(finding) {
    return finding.severity === 'medium' || finding.severity === 'low';
  },

  describeAction(finding) {
    return `Consolidate repetitive content: ${finding.findings?.[0]?.pattern || 'unknown'}`;
  },

  async apply(project, finding) {
    return {
      type: 'consolidate',
      finding: 'repetition-detector',
      location: finding.findings?.[0]?.location,
      action: 'merge_repetitive_passages',
      severity: finding.severity
    };
  }
});

/**
 * Filler detector resolver — remove filler content
 */
registerResolver('filler-detector', {
  canAutoFix(finding) {
    return finding.severity === 'low';
  },

  describeAction(finding) {
    return `Remove filler: ${finding.findings?.[0]?.text?.substring(0, 50) || 'unknown'}`;
  },

  async apply(project, finding) {
    return {
      type: 'delete',
      finding: 'filler-detector',
      location: finding.findings?.[0]?.location,
      text: finding.findings?.[0]?.text,
      severity: finding.severity
    };
  }
});

/**
 * Voice drift detector resolver — apply voice constraints
 */
registerResolver('voice-drift-detector', {
  canAutoFix(finding) {
    return finding.severity === 'medium' || finding.severity === 'low';
  },

  describeAction(finding) {
    return `Correct voice drift: ${finding.findings?.[0]?.drift || 'unknown'}`;
  },

  async apply(project, finding) {
    // Load voice profile to get constraints
    const voicePath = bfPath(project, 'state', 'voice-profile.md');
    const voiceProfile = exists(voicePath) ? readText(voicePath) : null;

    return {
      type: 'rewrite',
      finding: 'voice-drift-detector',
      location: finding.findings?.[0]?.location,
      voice_constraints: voiceProfile ? 'apply_voice_constraints' : null,
      severity: finding.severity
    };
  }
});

/**
 * Check if a finding should block release
 */
export function shouldBlockRelease(findings) {
  const critical = findings.filter(f => f.severity === 'critical');
  const high = findings.filter(f => f.severity === 'high');

  // Block if there are unresolved critical findings
  return critical.length > 0 || high.length > 5;
}

/**
 * Get auto-correction statistics
 */
export function getCorrectionStats(project) {
  const logPath = bfPath(project, 'quality', 'corrections-log.json');
  if (!exists(logPath)) {
    return { total_corrections: 0, last_run: null };
  }

  const log = readJson(logPath);
  return {
    total_corrections: log.corrections?.length || 0,
    last_run: log.last_run,
    corrections: log.corrections || []
  };
}

export default {
  resolveFindings,
  registerResolver,
  getResolver,
  shouldBlockRelease,
  getCorrectionStats
};
