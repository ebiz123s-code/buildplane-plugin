#!/usr/bin/env node
// runner.mjs — optional local daemon (task 6.7). Lets the member press "Run"
// on the dashboard (or their phone) and have THIS machine build the step on
// their own Claude subscription. Polls bl-app for queued steps and spawns
// `claude -p "/buildplane next"` in the project folder.
//
//   node runner.mjs --project <projectId> --cwd <folder> [--every 30] [--once]
//
// Env: BUILDPLANE_KEY (or license.json next to the pack), CLAUDE_BIN (default "claude").
// Log per run streams to .buildplane/runs/<stepId>.log in the cwd and is attached
// to the report by the skill itself. Backoff: 3 consecutive failures → pause 10 min.
import { spawn } from 'node:child_process';
import { mkdirSync, createWriteStream, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const PROJECT = flag('--project');
const CWD = flag('--cwd', process.cwd());
const EVERY = Math.max(10, +flag('--every', 30)) * 1000;
const ONCE = args.includes('--once');
const CLAUDE = process.env.CLAUDE_BIN || 'claude';
if (!PROJECT) { console.error('usage: runner.mjs --project <projectId> --cwd <folder> [--every 30] [--once]'); process.exit(2); }

const log = (m) => console.log(new Date().toISOString().slice(11, 19) + ' ' + m);

function bl(cmd, ...rest) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [join(HERE, 'bl.mjs'), cmd, ...rest], { cwd: CWD, env: process.env });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { out += d; });
    p.on('close', (code) => { try { resolve({ code, data: JSON.parse(out) }); } catch (_) { resolve({ code, data: { raw: out } }); } });
  });
}

// Peek without claiming: project.get shows whether anything is queued or running.
async function peek() {
  const { code, data } = await bl('project', PROJECT);
  if (code !== 0) return { error: data };
  const steps = data.steps || [];
  return {
    queued: steps.filter((s) => s.section === 'live' && s.status === 'queued').length,
    running: steps.find((s) => s.status === 'running') || null,
    percent: data.progress ? data.progress.percent : 0,
  };
}

function runClaude() {
  return new Promise((resolve) => {
    mkdirSync(join(CWD, '.buildplane', 'runs'), { recursive: true });
    const logPath = join(CWD, '.buildplane', 'runs', Date.now() + '.log');
    const out = createWriteStream(logPath);
    // The skill claims the step itself (claim_next) so this daemon never double-claims.
    // Windows needs shell:true to find claude.cmd; a shell splits unquoted args on spaces,
    // so every argument is quoted there (the prompt and the tool list both contain spaces).
    const win = process.platform === 'win32';
    const q = (a) => (win ? '"' + String(a).replace(/"/g, '\\"') + '"' : a);
    const claudeArgs = ['-p', '/buildplane next --project ' + PROJECT, '--allowedTools', 'Bash(node *bl.mjs*),Bash(node *judge.mjs*),Bash(npm test*),Bash(npm run test*),Bash(agent-browser*),Read,Write,Edit,Glob,Grep,Agent,mcp__genesis-*'];
    const p = spawn(win ? q(CLAUDE) : CLAUDE, claudeArgs.map(q), { cwd: CWD, env: process.env, shell: win });
    // No heartbeat here: bl.mjs claim (run inside the claude session) starts a check-in loop
    // tied to the run it claimed, so only the build that owns a step can keep it alive.
    p.stdout.on('data', (d) => { out.write(d); process.stdout.write(d); });
    p.stderr.on('data', (d) => { out.write(d); process.stderr.write(d); });
    p.on('close', (code) => { out.end(); resolve({ code, logPath }); });
    p.on('error', (e) => { out.end(); resolve({ code: 127, error: e.message, logPath }); });
  });
}

// Turn a failed `claude` launch into one sentence a non-developer can act on.
function plainReason(r, failures) {
  let tail = '';
  try { tail = readFileSync(r.logPath, 'utf8').slice(-600); } catch (_) { /* no log yet */ }
  const t = (tail + ' ' + (r.error || '')).toLowerCase();
  let why;
  if (/usage limit|rate limit|limit reached/.test(t)) why = 'Your Claude plan has hit its usage limit. Builds resume when it resets; you can also type /buildplane next yourself once it does.';
  else if (r.code === 127 || /not found|not recognized|enoent/.test(t)) why = 'Claude Code could not be started on your computer (command not found). Install it from claude.ai/code, or reopen the window after installing.';
  else if (/not logged in|login|unauthor/.test(t)) why = 'Claude Code is not signed in on this computer. Open a terminal, type claude, and sign in, then the builder will pick the step up.';
  else why = 'The build stopped before it could start (Claude exited with code ' + r.code + '). Open Claude Code and type /buildplane next to see the error, or check .buildplane/runs for the log.';
  return why + ' (attempt ' + failures + ' of 3' + (failures >= 3 ? ', pausing 10 minutes' : '') + ')';
}

let failures = 0;
let stuckPolls = 0; // consecutive polls that saw the same step still running with no builder of ours
let stuckStepId = null;
log('Buildplane runner watching project ' + PROJECT + ' in ' + CWD + ' every ' + EVERY / 1000 + 's');
if (!existsSync(join(HERE, 'bl.mjs'))) { console.error('bl.mjs missing next to runner.mjs'); process.exit(2); }

while (true) {
  const state = await peek();
  if (state.error) {
    log('cannot reach Buildplane: ' + JSON.stringify(state.error).slice(0, 200));
  } else if (state.running) {
    log('a step is already running elsewhere: ' + state.running.title);
    // If nobody reports that step, the server takes it back after 15 minutes; meanwhile tell the
    // member on the dashboard, once, after ten polls (about five minutes) of the same stuck step.
    stuckPolls = state.running.id === stuckStepId ? stuckPolls + 1 : 1;
    stuckStepId = state.running.id;
    if (stuckPolls === 10) await bl('note', PROJECT, 'The step "' + state.running.title + '" has been marked as building for about ' + Math.round((10 * EVERY) / 60000) + ' minutes with no report from any builder. If nothing is building right now, press "Start this step again" on the project page.');
  } else if (state.queued > 0) {
    stuckPolls = 0; stuckStepId = null;
    log(state.queued + ' queued — running the next step (' + state.percent + '% done)');
    const r = await runClaude();
    if (r.code === 0) { failures = 0; log('step finished; log: ' + r.logPath); }
    else {
      failures++;
      log('claude exited ' + r.code + (r.error ? ' (' + r.error + ')' : '') + ' — failure ' + failures + '/3');
      // Tell the dashboard, in plain words, why nothing is happening (shown on the project page).
      await bl('note', PROJECT, plainReason(r, failures));
    }
    if (failures >= 3) { log('3 failures in a row — pausing 10 minutes'); await new Promise((res) => setTimeout(res, 10 * 60000)); failures = 0; }
    if (ONCE) break;
    continue; // check immediately for the next queued step
  } else {
    log('nothing queued (' + state.percent + '% done)');
  }
  if (ONCE) break;
  await new Promise((res) => setTimeout(res, EVERY));
}
