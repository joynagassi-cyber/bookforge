import crypto from 'node:crypto';
import { resolve } from './resolver.js';

export function createExecutionPacket(project, agentId, taskId, options = {}) {
  const agent = resolve(project, agentId);
  const timestamp = new Date().toISOString();
  const packetId = crypto.randomUUID();

  return {
    version: '1.0.0',
    packet_id: packetId,
    created_at: timestamp,

    agent: {
      id: agentId,
      version: agent.version,
      module: agent.module
    },

    task: {
      id: taskId,
      instruction: options.instruction || '',
      scope: options.scope || {}
    },

    workflow: {
      id: options.workflowId || null,
      run_id: options.runId || null
    },

    artifacts: options.artifacts || [],
    knowledge: options.knowledge || [],
    skills: agent.skills || [],
    validators: agent.validators || [],

    host: {
      id: options.hostId || 'generic',
      mode: options.hostMode || 'skill'
    },

    budget: {
      tokens: options.budget || 5000,
      progressive_disclosure: options.progressiveDisclosure !== false
    }
  };
}

export function serialize(packet) {
  return JSON.stringify(packet, null, 2);
}

export function validate(packet) {
  const required = ['version', 'packet_id', 'agent', 'task', 'host'];
  const missing = required.filter(f => !packet[f]);
  if (missing.length > 0) {
    throw new Error(`Execution packet missing required fields: ${missing.join(', ')}`);
  }
  return { valid: true, packet };
}
