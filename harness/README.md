# BookForge Harness — Evaluation & Testing Framework

The harness provides:
- Fixture loading for golden cases
- Task packet generation from natural language
- Adapter invocation simulation
- Validator locking and grading
- Expected outcome comparison
- Regression tracking
- Run logs
- Human approval checkpoints

## Golden Test Categories

1. continuity across 20+ chapters
2. fact/citation verification
3. voice consistency
4. slop reduction without style flattening
5. cliche detection precision
6. targeted context retrieval
7. major-change rerouting
8. artifact ownership enforcement

## Usage

```javascript
import { loadFixture, runGoldenCase, gradeResult } from './harness/loader.js';

const fixture = loadFixture('route-001');
const result = await runGoldenCase(fixture);
const grade = gradeResult(result, fixture.expected);
```
