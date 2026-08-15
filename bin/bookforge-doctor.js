#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function check(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`  ✓ ${name}`);
      return true;
    } else {
      console.log(`  ⚠ ${name}: ${result}`);
      return false;
    }
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`);
    return false;
  }
}

function main() {
  console.log('\nBookForge Doctor\n');
  
  const projectDir = process.argv[2] || process.cwd();
  let allPassed = true;
  
  console.log('Project:');
  allPassed &= check('project initialized', () => fs.existsSync(path.join(projectDir, 'bookforge', 'project.json')));
  allPassed &= check('configuration valid', () => {
    return fs.existsSync(path.join(projectDir, 'bookforge', 'config.yaml')) || fs.existsSync(path.join(projectDir, 'bookforge', 'bookforge-config', 'config.yaml')) ? 'valid' : 'missing';
  });
  
  console.log('\nVersions:');
  allPassed &= check('package version', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    return pkg.version || 'not found';
  });
  
  console.log('\nModules:');
  allPassed &= check('module registry', () => {
    const regPath = path.join(projectDir, 'bookforge', 'modules', 'registry.json');
    return fs.existsSync(regPath) ? 'valid' : 'empty';
  });
  allPassed &= check('lockfile', () => {
    const lockPath = path.join(projectDir, 'bookforge', 'modules', 'lock.json');
    return fs.existsSync(lockPath) ? 'valid' : 'not present';
  });
  
  console.log('\nHost:');
  allPassed &= check('host adapter', () => {
    const hostPath = path.join(projectDir, 'bookforge', 'generated', 'hosts');
    return fs.existsSync(hostPath) ? 'generated' : 'not generated';
  });
  
  console.log('\nRuntime:');
  allPassed &= check('workflow engine', () => {
    const enginePath = path.join(root, 'runtime', 'workflow', 'engine.js');
    return fs.existsSync(enginePath) ? 'present' : 'missing';
  });
  allPassed &= check('plugin system', () => {
    const regPath = path.join(root, 'runtime', 'plugin', 'registry.js');
    return fs.existsSync(regPath) ? 'present' : 'missing';
  });
  allPassed &= check('context router', () => {
    const routerPath = path.join(root, 'runtime', 'context', 'router.js');
    return fs.existsSync(routerPath) ? 'present' : 'missing';
  });
  allPassed &= check('graph synchronizer', () => {
    const syncPath = path.join(root, 'runtime', 'graph', 'synchronizer.js');
    return fs.existsSync(syncPath) ? 'present' : 'missing';
  });
  
  console.log('\nGraph:');
  allPassed &= check('JSONL provider', () => {
    const p = path.join(root, 'runtime', 'providers', 'jsonl.js');
    return fs.existsSync(p) ? 'available' : 'missing';
  });
  allPassed &= check('Neo4j provider', () => {
    const p = path.join(root, 'runtime', 'providers', 'neo4j.js');
    return fs.existsSync(p) ? 'available (optional)' : 'missing';
  });
  
  console.log('\nKnowledge:');
  allPassed &= check('indexes', () => {
    const idxPath = path.join(projectDir, 'bookforge', 'knowledge', 'indexes');
    return fs.existsSync(idxPath) ? 'present' : 'missing (run module setup)';
  });
  
  console.log('\nWorkflows:');
  allPassed &= check('workflow manifests', () => {
    const wfPath = path.join(projectDir, 'bookforge', 'manifests', 'workflows.json');
    return fs.existsSync(wfPath) ? 'valid' : 'missing (run install)';
  });
  
  console.log('\nSchemas:');
  allPassed &= check('runtime contract', () => {
    const p = path.join(root, 'specs', 'runtime', 'runtime-contract.schema.json');
    return fs.existsSync(p) ? 'valid' : 'missing';
  });
  allPassed &= check('workflow schema', () => {
    const p = path.join(root, 'specs', 'workflows', 'workflow.schema.json');
    return fs.existsSync(p) ? 'valid' : 'missing';
  });
  
  console.log('\nTests:');
  allPassed &= check('test environment', () => 'ready');
  
  console.log('\n' + '='.repeat(40));
  if (allPassed) {
    console.log('Result: ALL CHECKS PASSED');
  } else {
    console.log('Result: SOME CHECKS FAILED - review warnings above');
    process.exitCode = 1;
  }
  console.log('='.repeat(40) + '\n');
}

main();
