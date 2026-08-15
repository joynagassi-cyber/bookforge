import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, bfPath, mkdir, exists } from '../core/io.js';

const VALID_STATUSES = ['PASS', 'CONCERNS', 'FAIL'];
const VALID_SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];
const VALID_DIMENSIONS = [
  'structure', 'voice', 'continuity', 'facts', 'citations',
  'similarity', 'ai-slop', 'cliche', 'repetition', 'pacing',
  'character', 'dialogue', 'show-dont-tell', 'originality'
];

export function runValidator(project, validatorId, target, options = {}) {
  const validator = getValidator(project, validatorId);
  if (!validator) throw new Error('Validator not found: ' + validatorId);

  if (options.severity && !VALID_SEVERITIES.includes(options.severity)) {
    throw new Error('Invalid severity: ' + options.severity);
  }

  if (options.dimension && !VALID_DIMENSIONS.includes(options.dimension)) {
    throw new Error('Invalid dimension: ' + options.dimension);
  }

  const finding = {
    validator_id: validatorId,
    dimension: options.dimension || validator.dimension || 'general',
    status: options.status || 'CONCERNS',
    severity: options.severity || 'medium',
    findings: options.findings || [],
    evidence: options.evidence || [],
    target: target,
    timestamp: new Date().toISOString(),
    version: '0.6.0'
  };

  saveFinding(project, finding);
  return finding;
}

export function saveFinding(project, finding) {
  const reportDir = bfPath(project, 'quality', 'reports');
  mkdir(reportDir);
  const fp = path.join(reportDir, finding.validator_id + '-' + Date.now() + '.json');
  writeJson(fp, finding);
  return finding;
}

export function getValidator(project, validatorId) {
  const registry = loadQualityRegistry(project);
  return registry.validators[validatorId] || null;
}

export function loadQualityRegistry(project) {
  const p = bfPath(project, 'quality', 'registry.json');
  if (!exists(p)) return { schema_version: '1.0.0', validators: {} };
  return readJson(p);
}

export function saveQualityRegistry(project, registry) {
  const dir = bfPath(project, 'quality');
  mkdir(dir);
  writeJson(bfPath(project, 'quality', 'registry.json'), registry);
}

export function registerValidator(project, validatorId, metadata) {
  const registry = loadQualityRegistry(project);
  registry.validators[validatorId] = {
    id: validatorId,
    version: metadata.version || '1.0.0',
    severity: metadata.severity || 'medium',
    dimension: metadata.dimension || 'general',
    module: metadata.module || 'bookforge.core',
    registered_at: new Date().toISOString()
  };
  saveQualityRegistry(project, registry);
  return registry.validators[validatorId];
}

export function listValidators(project) {
  return Object.values(loadQualityRegistry(project).validators);
}

export function checkCriticalFindings(project) {
  const reportsDir = bfPath(project, 'quality', 'reports');
  if (!exists(reportsDir)) return { has_critical: false, findings: [], summary: {} };

  const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));
  const critical = [];
  const summary = { pass: 0, concerns: 0, fail: 0, by_severity: {}, by_dimension: {} };

  for (const file of files) {
    const report = readJson(path.join(reportsDir, file));
    summary[report.status.toLowerCase()] = (summary[report.status.toLowerCase()] || 0) + 1;
    summary.by_severity[report.severity] = (summary.by_severity[report.severity] || 0) + 1;
    summary.by_dimension[report.dimension] = (summary.by_dimension[report.dimension] || 0) + 1;

    if (report.severity === 'critical' || report.status === 'FAIL') {
      critical.push(report);
    }
  }

  return {
    has_critical: critical.length > 0,
    findings: critical,
    summary,
    total_reports: files.length
  };
}

export function getDimensionStatus(project, dimension) {
  const reportsDir = bfPath(project, 'quality', 'reports');
  if (!exists(reportsDir)) return { dimension, status: 'unknown', findings: [] };

  const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));
  const dimensionFindings = files
    .map(f => readJson(path.join(reportsDir, f)))
    .filter(r => r.dimension === dimension);

  const hasCritical = dimensionFindings.some(f => f.severity === 'critical' || f.status === 'FAIL');
  const hasConcerns = dimensionFindings.some(f => f.status === 'CONCERNS');

  return {
    dimension,
    status: hasCritical ? 'FAIL' : hasConcerns ? 'CONCERNS' : 'PASS',
    findings: dimensionFindings,
    count: dimensionFindings.length
  };
}
