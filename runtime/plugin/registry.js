import fs from 'node:fs';
import path from 'node:path';
import { mkdir, readJson, writeJson, bfPath, exists } from '../core/io.js';

const idRe = /^[a-z0-9][a-z0-9._-]*$/;
const VALID_KINDS = ['agent', 'workflow', 'skill', 'validator', 'catalog', 'adapter', 'template', 'schema', 'evaluation'];

function validateManifest(m) {
  const errors = [];
  if (!m?.id || !idRe.test(m.id)) errors.push('invalid id (must be lowercase alphanumeric with dots, dashes, underscores)');
  if (!m?.version) errors.push('missing version');
  if (!m?.kind || !VALID_KINDS.includes(m.kind)) errors.push(`missing or invalid kind (must be one of: ${VALID_KINDS.join(', ')})`);
  if (!m?.entrypoints || typeof m.entrypoints !== 'object') errors.push('missing or invalid entrypoints');
  if (m.dependencies && typeof m.dependencies !== 'object') errors.push('dependencies must be an object');
  if (m.compatible_framework_versions && !Array.isArray(m.compatible_framework_versions)) errors.push('compatible_framework_versions must be an array');
  return errors;
}

function validateDependencies(project, manifest) {
  if (!manifest.dependencies) return [];
  const errors = [];
  const registry = loadRegistry(project);
  for (const [depId, version] of Object.entries(manifest.dependencies)) {
    const dep = registry.plugins.find(p => p.id === depId);
    if (!dep) {
      errors.push(`missing dependency: ${depId}`);
    } else if (version && dep.version !== version) {
      errors.push(`dependency version mismatch: ${depId} (expected ${version}, got ${dep.version})`);
    }
  }
  return errors;
}

export function registryPath(project) {
  return bfPath(project, 'plugins', 'registry.json');
}

export function loadRegistry(project) {
  const p = registryPath(project);
  if (!exists(p)) return { schema_version: '1.0.0', plugins: [] };
  return readJson(p);
}

export function saveRegistry(project, registry) {
  mkdir(path.dirname(registryPath(project)));
  writeJson(registryPath(project), registry);
}

export function register(project, manifest, { source = null, enabled = true } = {}) {
  const errors = validateManifest(manifest);
  if (errors.length > 0) {
    throw new Error(`Plugin manifest invalid: ${errors.join(', ')}`);
  }
  const depErrors = validateDependencies(project, manifest);
  if (depErrors.length > 0) {
    throw new Error(`Plugin dependency validation failed: ${depErrors.join(', ')}`);
  }
  const registry = loadRegistry(project);
  const now = new Date().toISOString();
  const entry = {
    ...manifest,
    source,
    enabled,
    registered_at: now,
    activated_at: null,
    deactivated_at: null
  };
  const index = registry.plugins.findIndex(x => x.id === manifest.id);
  if (index >= 0) {
    registry.plugins[index] = entry;
  } else {
    registry.plugins.push(entry);
  }
  registry.plugins.sort((a, b) => a.id.localeCompare(b.id));
  saveRegistry(project, registry);
  return entry;
}

export function list(project, opts = {}) {
  const registry = loadRegistry(project);
  let plugins = registry.plugins;
  if (opts.enabledOnly !== false) {
    plugins = plugins.filter(p => p.enabled !== false);
  }
  if (opts.kind) {
    plugins = plugins.filter(p => p.kind === opts.kind);
  }
  return plugins;
}

export function get(project, id) {
  return list(project).find(x => x.id === id) || null;
}

export function enable(project, id, value = true) {
  const registry = loadRegistry(project);
  const plugin = registry.plugins.find(x => x.id === id);
  if (!plugin) throw new Error(`Unknown plugin: ${id}`);
  const previous = plugin.enabled;
  plugin.enabled = value;
  plugin.activated_at = value ? new Date().toISOString() : plugin.activated_at;
  plugin.deactivated_at = !value ? new Date().toISOString() : plugin.deactivated_at;
  saveRegistry(project, registry);
  return { ...plugin, previous };
}

export function disable(project, id) {
  return enable(project, id, false);
}

export function remove(project, id) {
  const registry = loadRegistry(project);
  const before = registry.plugins.length;
  registry.plugins = registry.plugins.filter(x => x.id !== id);
  saveRegistry(project, registry);
  return before !== registry.plugins.length;
}

export function checkCompatibility(project, manifest) {
  const errors = validateManifest(manifest);
  const depErrors = validateDependencies(project, manifest);
  const allErrors = [...errors, ...depErrors];
  return {
    compatible: allErrors.length === 0,
    errors: allErrors,
    warnings: []
  };
}

export function ensureNamespace(project, pluginId) {
  const nsPath = bfPath(project, 'plugins', pluginId);
  mkdir(nsPath);
  return nsPath;
}

export function getPluginPath(project, pluginId) {
  return path.join(project, 'bookforge', 'plugins', pluginId);
}
