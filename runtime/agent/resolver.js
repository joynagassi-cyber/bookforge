import { getAgent, listAgents } from '../capabilities/registry.js';

export function resolve(project, agentId) {
  const agent = getAgent(project, agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}. Available: ${listAgents(project).map(a => a.id).join(', ')}`);
  }
  return agent;
}

export function resolveAll(project, agentIds) {
  return agentIds.map(id => resolve(project, id));
}

export function findAgent(project, query) {
  const agents = listAgents(project);
  const q = query.toLowerCase();
  const matches = agents.filter(a =>
    a.id.toLowerCase().includes(q) ||
    (a.name && a.name.toLowerCase().includes(q))
  );
  if (matches.length === 0) {
    throw new Error(`No agent found matching: ${query}`);
  }
  if (matches.length === 1) return matches[0];
  return matches;
}
