import fs from 'node:fs';
import path from 'node:path';
import { readJson, bfPath, exists } from '../core/io.js';

export function registryPath(project) {
  return bfPath(project, 'capabilities', 'registry.json');
}

export function loadRegistry(project) {
  const p = registryPath(project);
  if (!exists(p)) return { schema_version: '1.0.0', agents: {}, workflows: {}, skills: {}, validators: {}, modules: {} };
  return readJson(p);
}

export function saveRegistry(project, registry) {
  const dir = path.dirname(registryPath(project));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(registryPath(project), JSON.stringify(registry, null, 2) + '\n');
}

export function registerAgent(project, agentId, metadata) {
  const registry = loadRegistry(project);
  registry.agents[agentId] = {
    id: agentId,
    version: metadata.version || '1.0.0',
    module: metadata.module || 'bookforge.core',
    skills: metadata.skills || [],
    knowledge: metadata.knowledge || [],
    validators: metadata.validators || [],
    registered_at: new Date().toISOString()
  };
  saveRegistry(project, registry);
  return registry.agents[agentId];
}

export function registerWorkflow(project, workflowId, metadata) {
  const registry = loadRegistry(project);
  registry.workflows[workflowId] = {
    id: workflowId,
    version: metadata.version || '1.0.0',
    module: metadata.module || 'bookforge.core',
    phase: metadata.phase || 'execution',
    steps: metadata.steps || [],
    registered_at: new Date().toISOString()
  };
  saveRegistry(project, registry);
  return registry.workflows[workflowId];
}

export function registerSkill(project, skillId, metadata) {
  const registry = loadRegistry(project);
  registry.skills[skillId] = {
    id: skillId,
    version: metadata.version || '1.0.0',
    module: metadata.module || 'bookforge.core',
    triggers: metadata.triggers || [],
    registered_at: new Date().toISOString()
  };
  saveRegistry(project, registry);
  return registry.skills[skillId];
}

export function registerValidator(project, validatorId, metadata) {
  const registry = loadRegistry(project);
  registry.validators[validatorId] = {
    id: validatorId,
    version: metadata.version || '1.0.0',
    module: metadata.module || 'bookforge.core',
    severity: metadata.severity || 'medium',
    registered_at: new Date().toISOString()
  };
  saveRegistry(project, registry);
  return registry.validators[validatorId];
}

export function getAgent(project, agentId) {
  const registry = loadRegistry(project);
  return registry.agents[agentId] || null;
}

export function getWorkflow(project, workflowId) {
  const registry = loadRegistry(project);
  return registry.workflows[workflowId] || null;
}

export function getSkill(project, skillId) {
  const registry = loadRegistry(project);
  return registry.skills[skillId] || null;
}

export function getValidator(project, validatorId) {
  const registry = loadRegistry(project);
  return registry.validators[validatorId] || null;
}

export function listAgents(project) {
  return Object.values(loadRegistry(project).agents);
}

export function listWorkflows(project) {
  return Object.values(loadRegistry(project).workflows);
}

export function listSkills(project) {
  return Object.values(loadRegistry(project).skills);
}

export function listValidators(project) {
  return Object.values(loadRegistry(project).validators);
}

export function inspect(project, resourceId, resourceType) {
  const registry = loadRegistry(project);
  const type = resourceType || detectType(resourceId);
  switch (type) {
    case 'agent': return registry.agents[resourceId] || null;
    case 'workflow': return registry.workflows[resourceId] || null;
    case 'skill': return registry.skills[resourceId] || null;
    case 'validator': return registry.validators[resourceId] || null;
    default: return null;
  }
}

function detectType(id) {
  if (id.endsWith('-auditor') || id.endsWith('-editor') || id.endsWith('-writer') || id.endsWith('-architect') || id.endsWith('-director')) {
    return 'agent';
  }
  if (id.endsWith('-workflow') || id.endsWith('-check') || id.endsWith('-audit') || id.endsWith('-profile')) {
    return 'workflow';
  }
  if (id.endsWith('-detector') || id.endsWith('-checker') || id.endsWith('-optimizer')) {
    return 'skill';
  }
  if (id.endsWith('-validator') || id.endsWith('-audit')) {
    return 'validator';
  }
  return 'unknown';
}

export function count(project) {
  const registry = loadRegistry(project);
  return {
    agents: Object.keys(registry.agents).length,
    workflows: Object.keys(registry.workflows).length,
    skills: Object.keys(registry.skills).length,
    validators: Object.keys(registry.validators).length
  };
}
