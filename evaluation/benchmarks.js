#!/usr/bin/env node
/**
 * BookForge Benchmark Suite
 * Measures performance and correctness of core components
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BENCHMARK_DIR = join(__dirname, 'benchmarks');
const RESULT_FILE = join(BENCHMARK_DIR, 'results.json');

function setupBenchmarkProject() {
  const project = join(BENCHMARK_DIR, 'bench-project');
  rmSync(project, { recursive: true, force: true });
  mkdirSync(project, { recursive: true });
  mkdirSync(join(project, 'bookforge', 'manifests'), { recursive: true });
  mkdirSync(join(project, 'bookforge', 'knowledge', 'indexes'), { recursive: true });
  const workflows = [
    { id: 'help', version: '1.0.0', phase: 'upstream', purpose: 'Help', steps: [{ id: 'route', action: 'route' }] },
    { id: 'draft-chapter', version: '1.0.0', phase: 'execution', purpose: 'Draft', steps: [{ id: 'plan', action: 'plan' }, { id: 'draft', action: 'draft' }, { id: 'validate', action: 'validate' }] }
  ];
  writeFileSync(join(project, 'bookforge', 'manifests', 'workflows.json'), JSON.stringify(workflows));
  writeFileSync(join(project, 'bookforge', 'knowledge', 'indexes', 'workflow-catalog-map.json'), JSON.stringify({}));
  return project;
}

async function benchmark(name, fn) {
  const iterations = 100;
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }
  const avg = times.reduce((a, b) => a + b, 0) / iterations;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const p95 = times.sort((a, b) => a - b)[Math.floor(iterations * 0.95)];
  return { name, iterations, avg: avg.toFixed(3), min: min.toFixed(3), max: max.toFixed(3), p95: p95.toFixed(3) };
}

async function main() {
  console.log('🚀 BookForge v1.0 Benchmark Suite\n');
  console.log('='.repeat(60));

  const project = setupBenchmarkProject();
  const results = [];

  // Benchmark 1: Workflow Planning
  const wfBenchmark = await benchmark('Workflow Plan', async () => {
    const { plan } = await import('../runtime/workflow/engine.js');
    plan(project, 'help', { task: 'Test' });
  });
  results.push(wfBenchmark);
  console.log(`\n📊 Workflow Plan: ${wfBenchmark.avg}ms avg`);

  // Benchmark 2: Workflow Execution
  const execBenchmark = await benchmark('Workflow Execute', async () => {
    const { plan, start, executeStep } = await import('../runtime/workflow/engine.js');
    const planData = plan(project, 'help', { task: 'Test' });
    const run = start(project, planData);
    await executeStep(project, run.run_id, 'route', { output: 'done' });
  });
  results.push(execBenchmark);
  console.log(`📊 Workflow Execute: ${execBenchmark.avg}ms avg`);

  // Benchmark 3: Context Routing
  const routeBenchmark = await benchmark('Context Route', async () => {
    const { route } = await import('../runtime/context/router.js');
    route(project, { task: 'Write chapter 3' });
  });
  results.push(routeBenchmark);
  console.log(`📊 Context Route: ${routeBenchmark.avg}ms avg`);

  // Benchmark 4: Plugin Registration
  const pluginBenchmark = await benchmark('Plugin Register', async () => {
    const { register } = await import('../runtime/plugin/registry.js');
    register(project, { id: 'test', version: '1.0.0', kind: 'skill', entrypoints: { skills: ['test'] } });
  });
  results.push(pluginBenchmark);
  console.log(`📊 Plugin Register: ${pluginBenchmark.avg}ms avg`);

  // Benchmark 5: Event Emission
  const emitBenchmark = await benchmark('Event Emit', async () => {
    const { emit } = await import('../runtime/graph/synchronizer.js');
    await emit(project, { operation: 'test', agent: 'writer' });
  });
  results.push(emitBenchmark);
  console.log(`📊 Event Emit: ${emitBenchmark.avg}ms avg`);

  // Benchmark 6: Graph Sync
  const syncBenchmark = await benchmark('Graph Sync', async () => {
    const { sync } = await import('../runtime/graph/synchronizer.js');
    await sync(project);
  });
  results.push(syncBenchmark);
  console.log(`📊 Graph Sync: ${syncBenchmark.avg}ms avg`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 BENCHMARK SUMMARY\n');
  console.log('| Benchmark | Ops/sec | Latency (ms) |');
  console.log('|-----------|---------|--------------|');
  for (const r of results) {
    const opsPerSec = (1000 / parseFloat(r.avg)).toFixed(1);
    console.log(`| ${r.name} | ${opsPerSec} | ${r.avg} ± ${r.p95} |`);
  }

  writeFileSync(RESULT_FILE, JSON.stringify({
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    project,
    results
  }, null, 2));

  console.log(`\n💾 Results saved to: ${RESULT_FILE}`);

  // Cleanup
  rmSync(project, { recursive: true, force: true });
}

main().catch(console.error);
