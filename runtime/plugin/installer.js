import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { register, get, enable, ensureNamespace, getPluginPath } from './registry.js';
import { mkdir, writeText, bfPath, exists } from '../core/io.js';

function copyDir(src, dst) {
  mkdir(path.dirname(dst));
  fs.cpSync(src, dst, { recursive: true });
}

function readManifest(dir) {
  const candidates = ['plugin.json', 'manifest.json', 'module.json'];
  for (const f of candidates) {
    const p = path.join(dir, f);
    if (exists(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  throw new Error(`No plugin manifest found in ${dir}`);
}

function stageNpm(spec) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bookforge-plugin-'));
  execFileSync('npm', ['pack', spec.slice(4), '--pack-destination', tmp], { stdio: 'ignore' });
  const tar = fs.readdirSync(tmp).find(x => x.endsWith('.tgz'));
  if (!tar) throw new Error('npm pack produced no archive');
  execFileSync('tar', ['-xzf', path.join(tmp, tar), '-C', tmp]);
  return path.join(tmp, 'package');
}

function stageGithub(spec) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bookforge-git-'));
  const url = spec.replace(/^github:/, 'https://github.com/') + (spec.replace(/^github:/, '').endsWith('.git') ? '' : '.git');
  execFileSync('git', ['clone', '--depth', '1', url, path.join(tmp, 'repo')], { stdio: 'ignore' });
  return path.join(tmp, 'repo');
}

function stageFile(spec) {
  return spec.slice(5);
}

export function install(project, spec, { enable: enableAfter = true } = {}) {
  if (!spec) throw new Error('plugin source is required');
  let sourceDir = spec;
  if (spec.startsWith('npm:')) sourceDir = stageNpm(spec);
  else if (spec.startsWith('github:')) sourceDir = stageGithub(spec);
  else if (spec.startsWith('file:')) sourceDir = stageFile(spec);
  sourceDir = path.resolve(sourceDir);
  if (!exists(sourceDir)) throw new Error(`Plugin source not found: ${sourceDir}`);
  const manifest = readManifest(sourceDir);
  const namespacePath = ensureNamespace(project, manifest.id);
  copyDir(sourceDir, namespacePath);
  const registered = register(project, manifest, { source: spec, enabled: enableAfter });
  if (enableAfter) {
    enable(project, manifest.id, true);
  }
  return registered;
}

export function uninstall(project, pluginId) {
  const plugin = get(project, pluginId);
  if (!plugin) throw new Error(`Plugin not found: ${pluginId}`);
  disable(project, pluginId);
  const pluginPath = getPluginPath(project, pluginId);
  if (exists(pluginPath)) {
    fs.rmSync(pluginPath, { recursive: true, force: true });
  }
  return true;
}

export function status(project, pluginId) {
  const plugin = get(project, pluginId);
  if (!plugin) return { found: false, id: pluginId };
  return {
    found: true,
    id: plugin.id,
    version: plugin.version,
    kind: plugin.kind,
    enabled: plugin.enabled,
    source: plugin.source,
    registered_at: plugin.registered_at,
    activated_at: plugin.activated_at
  };
}

export function listInstalled(project) {
  return list(project);
}
