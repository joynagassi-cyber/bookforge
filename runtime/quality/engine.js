import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, bfPath, mkdir, exists } from '../core/io.js';

const VALID_STATUSES = ['PASS', 'CONCERNS', 'FAIL'];
const VALID_SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];

export function runValidator(project, validatorId, target, options = {}) {
  const validator = getValidator(project, validatorId);
  if (!validator) {
    throw new Error(`Validator not found: ${validatorId}`);
  }

  const finding = {
    validator_id: validatorId,
    status: options.status || 'CONCERNS',
    severity: options.severity || 'medium',
    findings: options.findings || [],
    evidence: options.evidence || [],
    timestamp: new Date().toISOString()
  };

  saveFinding(project, finding);
  return finding;
}

export function saveFinding(project, finding) {
  const reportDir = bfPath(project, 'quality', 'reports');
  mkdir(reportDir);
  const fp = path.join(reportDir, `${finding.validator_id}-${Date.now()}.json`);
  writeJson(fp, finding);
  return finding;
}

export function getValidator(project, validatorId) {
  const registry = loadQualityRegistry(project);
  return registry.validators[validatorId] || null;
}

export function loadQualityRegistry(project) {
  const p = bfPath(project, 'quality', 'registry.json');
  if (!exists(p)) {
    return { schema_version: '1.0.0', validators: {} };
  }
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
  if (!exists(reportsDir)) return { has_critical: false, findings: [] };

  const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));
  const critical = [];

  for (const file of files) {
    const report = readJson(path.join(reportsDir, file));
    if (report.severity === 'critical' || report.status === 'FAIL') {
      critical.push(report);
    }
  }

  return { has_critical: critical.length > 0, findings: critical };
}
