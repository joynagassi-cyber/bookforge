import fs from 'node:fs';
import path from 'node:path';
import { generateReport, runAllGoldenCases, summarizeResults } from './orchestrator.js';

export async function report(project, opts = {}) {
  const results = await runAllGoldenCases(project, opts);
  const report = generateReport(results, opts.outputPath);
  const summary = summarizeResults(results);
  console.log('\n=== BookForge Golden Test Report ===');
  console.log(`Total: ${summary.total}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Pass Rate: ${Math.round(summary.pass_rate * 100)}%`);
  console.log('');
  for (const r of results) {
    const status = r.error ? 'ERROR' : (r.grade.pass_rate === 1 ? 'PASS' : 'FAIL');
    console.log(`  ${status} ${r.fixture} (${Math.round((r.grade?.pass_rate || 0) * 100)}%)`);
    if (r.error) {
      console.log(`    Error: ${r.error}`);
    }
  }
  console.log('');
  if (opts.outputPath) {
    console.log(`Report saved to: ${opts.outputPath}`);
  }
  return report;
}

export { runAllGoldenCases, summarizeResults, generateReport };
