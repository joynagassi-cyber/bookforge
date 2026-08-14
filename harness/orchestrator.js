import fs from 'node:fs';
import path from 'node:path';
import { loadFixture, listFixtures, createRunLog, saveRunLog } from './loader.js';
import { gradeResult } from './grader.js';
import { route } from '../runtime/context/router.js';
import { pack } from '../runtime/context/packer.js';

export async function runGoldenCase(project, fixtureId, opts = {}) {
  const fixture = loadFixture(fixtureId);
  const packet = {
    task: fixture.fixtures.task || fixture.input,
    agent: fixture.fixtures.agent,
    workflow: fixture.fixtures.workflow,
    ...opts
  };
  const decision = route(project, packet);
  const packed = await pack(project, packet);
  const grade = gradeResult(decision, fixture.expected);
  const log = createRunLog(fixture, { decision, packed }, grade);
  if (opts.saveLog !== false) {
    saveRunLog(log);
  }
  return { fixture: fixture.id, decision, packed, grade, log };
}

export async function runAllGoldenCases(project, opts = {}) {
  const fixtures = listFixtures();
  const results = [];
  for (const id of fixtures) {
    try {
      const result = await runGoldenCase(project, id, opts);
      results.push(result);
    } catch (err) {
      results.push({ fixture: id, error: err.message });
    }
  }
  return results;
}

export function summarizeResults(results) {
  const total = results.length;
  const passed = results.filter(r => !r.error && r.grade.passed.length === r.grade.total).length;
  const failed = total - passed;
  const avgPassRate = results.reduce((sum, r) => sum + (r.grade?.pass_rate || 0), 0) / total;
  return {
    total,
    passed,
    failed,
    pass_rate: avgPassRate,
    results
  };
}

export function generateReport(results, outputPath) {
  const summary = summarizeResults(results);
  const report = {
    generated_at: new Date().toISOString(),
    summary,
    results: results.map(r => ({
      fixture: r.fixture,
      status: r.error ? 'error' : (r.grade.pass_rate === 1 ? 'pass' : 'fail'),
      pass_rate: r.grade?.pass_rate,
      passed: r.grade?.passed,
      failed: r.grade?.failed,
      error: r.error
    }))
  };
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  }
  return report;
}
