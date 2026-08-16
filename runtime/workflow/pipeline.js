/**
 * Pipeline Orchestrator — Automated multi-step book creation
 *
 * Chains workflows (chapter-plan → draft-chapter → chapter-qa) with:
 * - Automatic context packet building
 * - Smart revision loops on critical findings
 * - Parallel chapter drafting for independent chapters
 * - Progress tracking and resume support
 */

import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, bfPath, mkdir, exists, readText, writeText } from '../core/io.js';
import { loadOutline } from './outline-loader.js';
import { autoBuildPacket } from '../context/autobuilder.js';
import { startWorkflow, transitionWorkflow } from '../cli-runtime.js';
import { runWorkflow, getRun } from './engine.js';
import { runQualityChecks, hasCriticalFindings } from '../quality/batch.js';

const MAX_REVISIONS = 3;
const PROGRESS_FILE = 'bookforge/state/pipeline-progress.json';

/**
 * Run a pipeline for a range of chapters
 * @param {string} project - Project root directory
 * @param {object} options - Pipeline configuration
 * @returns {object} Pipeline results with per-chapter status
 */
export async function runPipeline(project, options = {}) {
  const {
    chapterStart = 1,
    chapterEnd = null,
    parallel = false,
    maxRevisions = MAX_REVISIONS,
    dryRun = false
  } = options;

  // Load outline to determine chapter range
  const outline = loadOutline(project);
  if (!outline || !outline.chapters) {
    throw new Error('No outline found. Run the outline workflow first.');
  }

  const totalChapters = Object.keys(outline.chapters).length;
  const end = chapterEnd || totalChapters;

  // Load or initialize progress
  const progress = loadProgress(project);

  const results = {
    version: '1.0.0',
    started_at: new Date().toISOString(),
    total_chapters: end - chapterStart + 1,
    chapters: {},
    summary: { completed: 0, failed: 0, skipped: 0, revised: 0 }
  };

  // Build chapter range
  const chapters = [];
  for (let i = chapterStart; i <= end; i++) {
    const chapterId = `ch-${i.toString().padStart(3, '0')}`;
    if (outline.chapters[chapterId]) {
      chapters.push({ id: chapterId, number: i, data: outline.chapters[chapterId] });
    }
  }

  if (chapters.length === 0) {
    throw new Error(`No chapters found in range ${chapterStart}-${end}`);
  }

  // Process chapters (sequentially or in parallel batches)
  const batchSize = parallel ? 3 : 1;

  for (let i = 0; i < chapters.length; i += batchSize) {
    const batch = chapters.slice(i, i + batchSize);
    const batchPromises = batch.map(async (chapter) => {
      return processChapter(project, chapter, { maxRevisions, dryRun, progress });
    });

    const batchResults = parallel
      ? await Promise.allSettled(batchPromises)
      : await Promise.all(batchPromises);

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        const chapterResult = result.value;
        results.chapters[chapterResult.chapter_id] = chapterResult;
        results.summary[chapterResult.status]++;
      } else {
        // Log error but continue
        console.error(`Pipeline error for ${chapter.id}: ${result.reason}`);
      }
    }

    // Save progress after each batch
    saveProgress(project, progress);
  }

  results.completed_at = new Date().toISOString();
  return results;
}

/**
 * Process a single chapter through the full pipeline
 */
async function processChapter(project, chapter, options) {
  const { maxRevisions = MAX_REVISIONS, dryRun = false, progress } = options;
  const chapterId = chapter.id;
  const chapterNum = chapter.number;

  // Check if already completed
  if (progress[chapterId]?.status === 'completed') {
    return {
      chapter_id: chapterId,
      number: chapterNum,
      status: 'skipped',
      reason: 'already_completed',
      skipped_at: new Date().toISOString()
    };
  }

  const result = {
    chapter_id: chapterId,
    number: chapterNum,
    title: chapter.data?.title || `Chapter ${chapterNum}`,
    status: 'running',
    started_at: new Date().toISOString()
  };

  try {
    // Step 1: Build context packet
    const packet = await autoBuildPacket(project, chapterNum, chapter.data);
    result.packet_id = packet.task_id;

    // Step 2: Run chapter plan workflow (if not already done)
    if (!progress[chapterId]?.outline_complete) {
      const planResult = await runWorkflow(project, 'chapter-plan', packet);
      result.plan_run_id = planResult.run_id;
      result.plan_status = planResult.state;

      if (planResult.state !== 'COMMITTED') {
        result.status = 'failed';
        result.error = 'Chapter plan failed';
        return result;
      }
    }

    // Step 3: Run draft-chapter workflow
    const draftResult = await runWorkflow(project, 'draft-chapter', packet);
    result.draft_run_id = draftResult.run_id;

    // Step 4: Run quality checks
    const qaResult = await runQualityChecks(project, packet);
    result.qa = {
      total_findings: qaResult.totalFindings,
      critical: qaResult.criticalCount,
      high: qaResult.highCount,
      medium: qaResult.mediumCount,
      low: qaResult.lowCount
    };

    // Step 5: Handle revisions if needed
    let revisions = 0;
    let needsRevision = hasCriticalFindings(qaResult);

    while (needsRevision && revisions < maxRevisions) {
      revisions++;
      result.revision_count = revisions;

      // Auto-revise if possible
      if (options.autoRevise !== false) {
        const revisionResult = await runWorkflow(project, 'revision-loop', packet);
        result.revision_run_ids = result.revision_run_ids || [];
        result.revision_run_ids.push(revisionResult.run_id);

        // Re-run QA after revision
        const revisedQA = await runQualityChecks(project, packet);
        result.qa = {
          total_findings: revisedQA.totalFindings,
          critical: revisedQA.criticalCount,
          high: revisedQA.highCount,
          medium: revisedQA.mediumCount,
          low: revisedQA.lowCount
        };
        needsRevision = hasCriticalFindings(revisedQA);
      } else {
        needsRevision = false;
      }
    }

    if (revisions > 0) {
      result.status = 'completed_with_revisions';
      result.revisions = revisions;
    } else {
      result.status = 'completed';
    }

    // Mark progress
    progress[chapterId] = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      revisions,
      qa_summary: result.qa
    };

  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
    result.failed_at = new Date().toISOString();
  }

  result.completed_at = new Date().toISOString();
  return result;
}

/**
 * Load pipeline progress from state file
 */
function loadProgress(project) {
  const p = bfPath(project, PROGRESS_FILE);
  if (exists(p)) {
    return readJson(p);
  }
  return {};
}

/**
 * Save pipeline progress to state file
 */
function saveProgress(project, progress) {
  const p = bfPath(project, PROGRESS_FILE);
  mkdir(path.dirname(p));
  writeJson(p, progress);
}

/**
 * Get pipeline status (for RUN.md or status command)
 */
export function getPipelineStatus(project) {
  const outline = loadOutline(project);
  const progress = loadProgress(project);

  if (!outline || !outline.chapters) {
    return { has_outline: false, message: 'No outline found' };
  }

  const chapters = Object.keys(outline.chapters);
  const completed = chapters.filter(id => progress[id]?.status === 'completed').length;
  const total = chapters.length;

  return {
    has_outline: true,
    total_chapters: total,
    completed_chapters: completed,
    progress_percent: Math.round((completed / total) * 100),
    chapters: chapters.map(id => ({
      id,
      status: progress[id]?.status || 'pending',
      title: outline.chapters[id]?.title || id
    }))
  };
}

/**
 * Reset pipeline progress (for re-running)
 */
export function resetPipelineProgress(project) {
  const p = bfPath(project, PROGRESS_FILE);
  if (exists(p)) {
    fs.unlinkSync(p);
  }
  return { reset: true };
}

/**
 * Run chapters in parallel (for independent chapters)
 */
export async function runParallelChapters(project, chapterIds, options = {}) {
  const { maxRevisions = MAX_REVISIONS, concurrency = 3 } = options;
  const results = [];

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < chapterIds.length; i += concurrency) {
    const batch = chapterIds.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(id => processChapter(project, { id, number: parseInt(id.split('-')[1]) }, {
        ...options,
        maxRevisions,
        parallel: true
      }))
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          chapter_id: id,
          status: 'failed',
          error: result.reason?.message || 'Unknown error'
        });
      }
    }
  }

  return results;
}

// Export for CLI usage
export const pipelineCommands = {
  run: runPipeline,
  status: getPipelineStatus,
  reset: resetPipelineProgress
};
