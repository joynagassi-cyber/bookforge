#!/usr/bin/env node
/**
 * Migration script: Plugin -> Module system
 * Converts legacy plugin entries to new module format
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function migrateProject(projectDir) {
  const projectPath = path.resolve(projectDir);
  const pluginRegistry = path.join(projectPath, 'bookforge', 'plugins', 'registry.json');
  const moduleRegistry = path.join(projectPath, 'bookforge', 'modules', 'registry.json');

  if (!fs.existsSync(pluginRegistry)) {
    console.log('No plugin registry found, skipping migration');
    return;
  }

  console.log('Migrating plugins to modules in', projectPath);

  // Read plugin registry
  const plugins = JSON.parse(fs.readFileSync(pluginRegistry, 'utf8'));

  // Create or read module registry
  let modules = { schema_version: '1.0.0', modules: [] };
  if (fs.existsSync(moduleRegistry)) {
    modules = JSON.parse(fs.readFileSync(moduleRegistry, 'utf8'));
  }

  // Migrate each plugin
  for (const plugin of plugins.plugins || []) {
    const moduleEntry = {
      id: plugin.id,
      version: plugin.version || '1.0.0',
      type: 'module',
      name: plugin.name || plugin.id,
      description: plugin.description || '',
      provides: plugin.provides || [],
      dependencies: plugin.dependencies || [],
      entrypoints: {
        agents: plugin.agents || [],
        workflows: plugin.workflows || [],
        skills: plugin.skills || [],
        validators: plugin.validators || []
      },
      source: plugin.source || 'migrated',
      enabled: plugin.enabled !== false,
      registered_at: plugin.registered_at || new Date().toISOString()
    };

    // Check if already exists
    const existing = modules.modules.find(m => m.id === plugin.id);
    if (!existing) {
      modules.modules.push(moduleEntry);
      console.log('  Migrated plugin -> module:', plugin.id);
    } else {
      console.log('  Already exists, skipping:', plugin.id);
    }
  }

  // Save migrated module registry
  fs.writeFileSync(moduleRegistry, JSON.stringify(modules, null, 2) + '\n');
  console.log('Migration complete. Modules:', modules.modules.length);
}

// Run migration
const projectDir = process.argv[2] || process.cwd();
migrateProject(projectDir);
