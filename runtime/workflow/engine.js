import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, bfPath, mkdir, readText, exists } from '../core/io.js';

const VALID_STATES = ['READY', 'CONTEXT_BUILT', 'EXECUTING', 'VALIDATING', 'REVISING', 'GATED', 'COMMITTED', 'FAILED', 'ABORTED'];

const TRANSITION_GRAPH = {
  READY: ['CONTEXT_BUILT', 'FAILED'],
  CONTEXT_BUILT: ['EXECUTING', 'FAILED'],
  EXECUTING: ['VALIDATING', 'REVISING', 'FAILED', 'GATED'],
  VALIDATING: ['REVISING', 'GATED', 'FAILED'],
  REVISING: ['VALIDATING', 'GATED', 'FAILED'],
  GATED: ['COMMITTED', 'REVISING', 'FAILED'],
  COMMITTED: [],
  FAILED: ['READY'],
  ABORTED: []
};

function runPath(project, runId) {
  return bfPath(project, 'runtime', 'runs', runId + '.json');
}

function loadRun(project, runId) {
  const p = runPath(project, runId);
  if (!exists(p)) throw new Error('Unknown run ' + runId);
  return readJson(p);
}

function saveRun(project, run) {
  const p = runPath(project, run.run_id);
  mkdir(path.dirname(p));
  writeJson(p, run);
}

export function loadWorkflow(project, id) {
  const manifestPath = bfPath(project, 'manifests', 'workflows.json');
  const rootManifestPath = path.join(project, 'manifests', 'workflows.json');
  const pathToCheck = exists(manifestPath) ? manifestPath : rootManifestPath;
  if (!exists(pathToCheck)) throw new Error('Workflow manifest not found: ' + pathToCheck);
  const workflows = readJson(pathToCheck);
  const wf = workflows.find(x => x.id === id);
  if (!wf) throw new Error('Unknown workflow: ' + id);
  return wf;
}

export function loadWorkflowFile(project, id) {
  const wf = loadWorkflow(project, id);
  const workflowDir = path.join(project, 'workflows', wf.id || id);
  const wfFile = path.join(workflowDir, 'WORKFLOW.md');
  if (!exists(wfFile)) throw new Error('Workflow file not found: ' + workflowDir + '/WORKFLOW.md');
  return { manifest: wf, content: readText(wfFile) };
}

export function validateStep(step) {
  if (!step?.id) throw new Error('Step must have an id');
  if (!step?.action) throw new Error('Step ' + step.id + ' must have an action');
  return true;
}

export function validateStepDependencies(workflow) {
  const steps = workflow.steps || [];
  const stepIds = new Set(steps.map(s => s.id));
  const errors = [];
  for (const step of steps) {
    if (step.dependencies) {
      for (const dep of step.dependencies) {
        if (!stepIds.has(dep)) errors.push('Step ' + step.id + ' depends on unknown step ' + dep);
      }
    }
  }
  return errors;
}

export function resolveStepOrder(workflow) {
  const steps = workflow.steps || [];
  const ordered = [];
  const visited = new Set();
  const visiting = new Set();

  function visit(stepId) {
    if (visited.has(stepId)) return;
    if (visiting.has(stepId)) throw new Error('Circular dependency detected at step ' + stepId);
    visiting.add(stepId);
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    for (const dep of step.dependencies || []) visit(dep);
    ordered.push(step);
    visiting.delete(stepId);
    visited.add(stepId);
  }

  for (const step of steps) visit(step.id);
  return ordered;
}

export async function validateContextPacket(project, packet) {
  const required = ['task_id', 'intent', 'scope'];
  const missing = required.filter(f => !packet[f]);
  if (missing.length > 0) throw new Error('Context packet missing required fields: ' + missing.join(', '));
  return { valid: true, packet };
}

export function plan(project, workflowId, opts = {}) {
  const wf = loadWorkflow(project, workflowId);
  const errors = validateStepDependencies(wf);
  if (errors.length > 0) throw new Error('Workflow ' + workflowId + ' has dependency errors: ' + errors.join('; '));

  const orderedSteps = resolveStepOrder(wf);
  const now = new Date().toISOString();
  return {
    version: '0.6.0',
    workflow: {
      id: wf.id,
      version: wf.version || '0.1.0',
      phase: wf.phase || 'execution',
      purpose: wf.purpose || 'Execute bounded task',
      steps: orderedSteps,
      dependencies: orderedSteps.map(s => ({ id: s.id, depends: s.dependencies || [] })),
      agents: orderedSteps.filter(s => s.agent).map(s => ({ step: s.id, agent: s.agent }))
    },
    state: 'READY',
    context: {
      task: opts.task || '',
      agent: opts.agent || null,
      scope: opts.scope || {},
      budget: opts.budget || 5000,
      conditions: opts.conditions || {}
    },
    contract: {
      entry: wf.entry || null,
      requires: wf.requires || [],
      human_approval: wf.human_approval || false,
      outputs: wf.outputs || []
    },
    created_at: now
  };
}

export function start(project, planData) {
  const runId = 'run-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const p = bfPath(project, 'runtime', 'runs', runId + '.json');
  mkdir(path.dirname(p));
  const run = {
    run_id: runId,
    workflow_id: planData.workflow.id,
    version: '0.6.0',
    ...planData,
    state: 'CONTEXT_BUILT',
    started_at: new Date().toISOString(),
    steps_completed: [],
    steps_skipped: [],
    findings: [],
    errors: [],
    outputs: {}
  };
  writeJson(p, run);
  return run;
}

export function transition(project, runId, newState, details = {}) {
  if (!VALID_STATES.includes(newState)) {
    throw new Error('Invalid state: ' + newState + '. Must be one of: ' + VALID_STATES.join(', '));
  }
  const run = loadRun(project, runId);
  const current = run.state;
  const allowed = TRANSITION_GRAPH[current];
  if (!allowed || !allowed.includes(newState)) {
    throw new Error('Invalid transition: ' + current + ' -> ' + newState);
  }
  run.state = newState;
  run.updated_at = new Date().toISOString();
  if (details.steps_completed) run.steps_completed = [...(run.steps_completed || []), ...details.steps_completed];
  if (details.steps_skipped) run.steps_skipped = [...(run.steps_skipped || []), ...details.steps_skipped];
  if (details.findings) run.findings = [...(run.findings || []), ...details.findings];
  if (details.errors) run.errors = [...(run.errors || []), ...details.errors];
  if (details.outputs) Object.assign(run.outputs, details.outputs);
  Object.assign(run, details);
  saveRun(project, run);
  return run;
}

export async function executeStep(project, runId, stepId, stepData = {}) {
  const run = loadRun(project, runId);
  const wf = loadWorkflow(project, run.workflow_id);
  const step = wf.steps?.find(s => s.id === stepId);
  if (!step) throw new Error('Step ' + stepId + ' not found in workflow');
  validateStep(step);

  // Check dependencies
  for (const dep of step.dependencies || []) {
    const depCompleted = (run.steps_completed || []).some(s => s.step_id === dep && s.status === 'completed');
    if (!depCompleted) throw new Error('Dependency ' + dep + ' not completed for step ' + stepId);
  }

  // Evaluate condition
  if (step.condition) {
    const condResult = evaluateCondition(step.condition, run, stepData);
    if (!condResult) {
      run.steps_skipped = run.steps_skipped || [];
      run.steps_skipped.push({ step_id: stepId, reason: 'condition_false', skipped_at: new Date().toISOString() });
      saveRun(project, run);
      return { step_id: stepId, action: step.action, status: 'skipped', reason: 'condition_not_met' };
    }
  }

  // Apply outputs before saving
  if (step.outputs) {
    for (const out of step.outputs) {
      if (stepData.output && stepData.output[out]) run.outputs[out] = stepData.output[out];
    }
  }

  const result = {
    step_id: stepId,
    action: step.action,
    agent: step.agent || null,
    status: 'completed',
    completed_at: new Date().toISOString(),
    output: stepData.output || null,
    findings: stepData.findings || [],
    risks: stepData.risks || []
  };
  run.steps_completed = run.steps_completed || [];
  run.steps_completed.push(result);
  run.last_step = stepId;
  saveRun(project, run);
  return result;
}

function evaluateCondition(condition, run, stepData) {
  if (typeof condition === 'boolean') return condition;
  if (typeof condition === 'string') {
    return run.outputs?.[condition] !== undefined && run.outputs?.[condition] !== null;
  }
  if (typeof condition === 'object') {
    if (condition.and) return condition.and.every(c => evaluateCondition(c, run, stepData));
    if (condition.or) return condition.or.some(c => evaluateCondition(c, run, stepData));
    if (condition.not) return !evaluateCondition(condition.not, run, stepData);
    if (condition.equals) return run.outputs?.[condition.equals.variable] === condition.equals.value;
    if (condition.contains) return run.outputs?.[condition.contains.variable]?.includes?.(condition.contains.value);
  }
  return true;
}

export function getRun(project, runId) {
  return loadRun(project, runId);
}

export function listRuns(project, opts = {}) {
  const runsDir = bfPath(project, 'runtime', 'runs');
  if (!exists(runsDir)) return [];
  const files = fs.readdirSync(runsDir).filter(f => f.endsWith('.json')).sort().reverse();
  let runs = files.map(f => readJson(path.join(runsDir, f)));
  if (opts.state) runs = runs.filter(r => r.state === opts.state);
  if (opts.workflow_id) runs = runs.filter(r => r.workflow_id === opts.workflow_id);
  if (opts.limit) runs = runs.slice(0, opts.limit);
  return runs;
}

export function abortRun(project, runId, reason = 'User aborted') {
  const run = loadRun(project, runId);
  run.state = 'ABORTED';
  run.aborted_at = new Date().toISOString();
  run.abort_reason = reason;
  saveRun(project, run);
  return run;
}

export async function runWorkflow(project, workflowId, contextPacket, opts = {}) {
  const planData = plan(project, workflowId, { ...opts, task: contextPacket.task });
  const run = start(project, planData);
  const wf = loadWorkflow(project, workflowId);
  const steps = resolveStepOrder(wf);
  let currentState = run.state;

  for (const step of steps) {
    try {
      const result = await executeStep(project, run.run_id, step.id, {
        output: step.output || opts.outputs?.[step.id] || null,
        findings: step.findings || [],
        risks: step.risks || []
      });
      run = getRun(project, run.run_id);
      if (result.status === 'skipped') {
        currentState = run.state;
        continue;
      }
    } catch (err) {
      run = transition(project, run.run_id, 'FAILED', { errors: [err.message] });
      throw err;
    }
  }

  run = transition(project, run.run_id, 'COMMITTED', {
    completed_at: new Date().toISOString(),
    final_state: 'COMMITTED'
  });
  return run;
}

export function getRunArtifacts(project, runId) {
  const run = loadRun(project, runId);
  return {
    run_id: run.run_id,
    state: run.state,
    steps_completed: run.steps_completed || [],
    steps_skipped: run.steps_skipped || [],
    findings: run.findings || [],
    errors: run.errors || [],
    outputs: run.outputs || {},
    output: run.output || null
  };
}
