import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

describe('Agent Resolver', () => {
  let project;
  before(async () => {
    const { register } = await import('../../runtime/module/registry.js');
    project = process.cwd();
    register(project, { id: 'test.module', version: '1.0.0', type: 'module', provides: [] });
  });

  it('should resolve a registered agent', async () => {
    const { registerAgent } = await import('../../runtime/capabilities/registry.js');
    const { resolve } = await import('../../runtime/agent/resolver.js');
    
    registerAgent(project, 'test-writer', { version: '1.0.0', module: 'test.module', skills: ['skill-1'], validators: ['validator-1'] });
    const agent = resolve(project, 'test-writer');
    assert.equal(agent.id, 'test-writer');
    assert.equal(agent.version, '1.0.0');
  });

  it('should throw for unknown agent', async () => {
    const { resolve } = await import('../../runtime/agent/resolver.js');
    assert.throws(() => resolve(project, 'unknown-agent'), /Agent not found/);
  });

  it('should create execution packet', async () => {
    const { registerAgent } = await import('../../runtime/capabilities/registry.js');
    const { createExecutionPacket } = await import('../../runtime/agent/execution-packet.js');
    
    registerAgent(project, 'packet-agent', { version: '1.0.0', module: 'test' });
    const packet = createExecutionPacket(project, 'packet-agent', 'task-001', { 
      instruction: 'Write chapter 3',
      workflowId: 'draft-chapter',
      budget: 3000
    });
    
    assert.ok(packet.packet_id);
    assert.equal(packet.agent.id, 'packet-agent');
    assert.equal(packet.task.id, 'task-001');
    assert.equal(packet.budget.tokens, 3000);
  });

  it('should validate execution packet', async () => {
    const { validate } = await import('../../runtime/agent/execution-packet.js');
    const packet = { version: '1.0.0', packet_id: 'test', agent: {}, task: {}, host: {} };
    const result = validate(packet);
    assert.equal(result.valid, true);
  });

  it('should throw for invalid packet', async () => {
    const { validate } = await import('../../runtime/agent/execution-packet.js');
    assert.throws(() => validate({}), /missing required fields/);
  });
});
