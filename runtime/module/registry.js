import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readJson, writeJson, bfPath, exists } from '../core/io.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '../..');

const VALID_KINDS = ['agent', 'workflow', 'skill', 'validator', 'catalog', 'adapter', 'template', 'schema', 'evaluation', 'module'];
const idRe = /^[a-z0-9][a-z0-9._-]*$/;

function validateModuleManifest(m) {
  const errors = [];
  if (!m?.id || !idRe.test(m.id)) errors.push('invalid id');
  if (!m?.version) errors.push('missing version');
  if (!m?.type || m.type !== 'module') errors.push('type must be "module"');
  if (!m?.provides || !Array.isArray(m.provides)) errors.push('missing or invalid provides');
  if (m.dependencies && !Array.isArray(m.dependencies)) errors.push('dependencies must be an array');
  return errors;
}

export function registryPath(project) {
  return bfPath(project, 'modules', 'registry.json');
}

export function lockfilePath(project) {
  return bfPath(project, 'modules', 'lock.json');
}

export function loadRegistry(project) {
  const p = registryPath(project);
  if (!exists(p)) return { schema_version: '1.0.0', modules: [] };
  return readJson(p);
}

export function loadLockfile(project) {
  const p = lockfilePath(project);
  if (!exists(p)) return { modules: {} };
  return readJson(p);
}

export function saveRegistry(project, registry) {
  mkdir(path.dirname(registryPath(project)));
  writeJson(registryPath(project), registry);
}

export function saveLockfile(project, lockfile) {
  mkdir(path.dirname(lockfilePath(project)));
  writeJson(lockfilePath(project), lockfile);
}

export function register(project, manifest, { source = null } = {}) {
  const errors = validateModuleManifest(manifest);
  if (errors.length > 0) {
    throw new Error(`Module manifest invalid: ${errors.join(', ')}`);
  }
  const registry = loadRegistry(project);
  const lockfile = loadLockfile(project);
  const now = new Date().toISOString();
  const entry = {
    ...manifest,
    source,
    enabled: true,
    registered_at: now
  };
  const index = registry.modules.findIndex(x => x.id === manifest.id);
  if (index >= 0) {
    registry.modules[index] = entry;
  } else {
    registry.modules.push(entry);
  }
  registry.modules.sort((a, b) => a.id.localeCompare(b.id));
  saveRegistry(project, registry);

  // Update lockfile
  lockfile.modules[manifest.id] = {
    version: manifest.version,
    resolved: source || 'local',
    integrity: null,
    installed_at: now
  };
  saveLockfile(project, lockfile);

  return entry;
}

export function list(project, opts = {}) {
  const registry = loadRegistry(project);
  let modules = registry.modules;
  if (opts.enabledOnly !== false) {
    modules = modules.filter(m => m.enabled !== false);
  }
  if (opts.type) {
    modules = modules.filter(m => m.type === opts.type);
  }
  return modules;
}

export function get(project, id) {
  return list(project).find(m => m.id === id) || null;
}

export function enable(project, id, value = true) {
  const registry = loadRegistry(project);
  const module = registry.modules.find(m => m.id === id);
  if (!module) throw new Error(`Unknown module: ${id}`);
  module.enabled = value;
  saveRegistry(project, registry);
  return module;
}

export function disable(project, id) {
  return enable(project, id, false);
}

export function remove(project, id) {
  const registry = loadRegistry(project);
  const before = registry.modules.length;
  registry.modules = registry.modules.filter(m => m.id !== id);
  saveRegistry(project, registry);

  const lockfile = loadLockfile(project);
  delete lockfile.modules[id];
  saveLockfile(project, lockfile);

  return before !== registry.modules.length;
}

export function inspect(project, id) {
  const module = get(project, id);
  if (!module) throw new Error(`Module not found: ${id}`);
  return {
    id: module.id,
    version: module.version,
    type: module.type,
    name: module.name,
    description: module.description,
    provides: module.provides || [],
    dependencies: module.dependencies || [],
    enabled: module.enabled !== false,
    registered_at: module.registered_at
  };
}

export function listCapabilities(project) {
  const modules = list(project);
  const capabilities = {
    agents: new Set(),
    workflows: new Set(),
    skills: new Set(),
    validators: new Set(),
    catalogs: new Set()
  };
  for (const mod of modules) {
    const entrypoints = mod.entrypoints || {};
    for (const agent of entrypoints.agents || []) capabilities.agents.add(agent);
    for (const workflow of entrypoints.workflows || []) capabilities.workflows.add(workflow);
    for (const skill of entrypoints.skills || []) capabilities.skills.add(skill);
    for (const validator of entrypoints.validators || []) capabilities.validators.add(validator);
    for (const catalog of entrypoints.catalogs || []) capabilities.catalogs.add(catalog);
  }
  return {
    agents: Array.from(capabilities.agents).sort(),
    workflows: Array.from(capabilities.workflows).sort(),
    skills: Array.from(capabilities.skills).sort(),
    validators: Array.from(capabilities.validators).sort(),
    catalogs: Array.from(capabilities.catalogs).sort()
  };
}
