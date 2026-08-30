// Test-rig contract: run the suite, write /results/results.json (schema v1), exit 0 iff green.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const out = '/tmp/vitest-report.json';
const r = spawnSync('npx', ['vitest', 'run', '--reporter=json', `--outputFile=${out}`], {
  encoding: 'utf8',
  timeout: 5 * 60 * 1000
});

const strip = (s) => (s || '').replace(/\u001b\[[0-9;]*m/g, '');
let passed = 0;
let failed = 0;
let total = 0;
const failures = [];

try {
  const rep = JSON.parse(readFileSync(out, 'utf8'));
  passed = rep.numPassedTests || 0;
  failed = rep.numFailedTests || 0;
  total = rep.numTotalTests || 0;
  for (const file of rep.testResults || []) {
    const rel = (file.name || '').replace(process.cwd() + '/', '');
    if (file.status === 'failed' && (!file.assertionResults || !file.assertionResults.length)) {
      // suite-level failure (syntax/import error) — surface the message
      failures.push(`${rel} :: suite failed to run\n${strip(file.message).slice(0, 600)}`);
      if (total === 0) { failed += 1; total += 1; }
    }
    for (const t of file.assertionResults || []) {
      if (t.status === 'failed') {
        const msg = strip((t.failureMessages || []).join('\n')).slice(0, 600);
        failures.push(`${rel} > ${t.fullName}\n${msg}`);
      }
    }
  }
} catch (err) {
  failed = 1;
  total = 1;
  failures.push(
    `test harness error: ${err.message}\nstdout: ${strip(r.stdout).slice(0, 400)}\nstderr: ${strip(r.stderr).slice(0, 400)}`
  );
}

const resultsDir = process.env.RESULTS_DIR || '/results';
mkdirSync(resultsDir, { recursive: true });
writeFileSync(
  `${resultsDir}/results.json`,
  JSON.stringify(
    {
      schema_version: 1,
      experiment: 'exp-beeboo-office',
      iteration: parseInt(process.env.ITERATION || '0', 10),
      timestamp: new Date().toISOString(),
      tests: { passed, failed, total, failures }
    },
    null,
    2
  )
);
console.log(`tests: ${passed}/${total} passed, ${failed} failed`);
process.exit(failed === 0 && total > 0 ? 0 : 1);
