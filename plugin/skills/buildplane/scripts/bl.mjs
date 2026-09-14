#!/usr/bin/env node
// bl.mjs — the ONLY thing in the Buildplane skill pack that talks HTTP.
// The skill (SKILL.md) calls this for every server interaction so the
// LLM never composes requests by hand. Zero dependencies; Node 18+.
//
//   node bl.mjs check
//   node bl.mjs projects
//   node bl.mjs project <projectId>
//   node bl.mjs brief <projectId> <brief.json>
//   node bl.mjs plan-import <projectId> <plan.json>
//   node bl.mjs claim <projectId>
//   node bl.mjs report <stepId> <done|failed|skipped> [--run <runId>] [--tokens <n>] [--log <file>] [--result <json>] [--screenshot <path>]
//   node bl.mjs upload <stepId> <file>          → prints the stored path (use with report --screenshot)
//   node bl.mjs note <projectId> <text>         → plain-words reason shown on the dashboard while nothing runs
//   node bl.mjs wait <projectId> [--every 15] [--timeout 1800]  → blocks until a step is queued
//   node bl.mjs beat <runId> [--loop]           → check-in for the run that claimed a step (claim starts the loop itself)
//
// License key: license.json next to this pack ({ "key": "bl_…" }) or env BUILDPLANE_KEY.
// Every command prints JSON on stdout and exits non-zero on an error envelope.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const API = process.env.BUILDPLANE_API || 'https://tfqxuwdadhttcglqnehp.supabase.co/functions/v1/bl-app';
const HERE = dirname(fileURLToPath(import.meta.url));

// Where the key lives, in order. The config-dir copy comes FIRST and is the one the
// installer writes now: when Buildplane is installed as a Claude Code plugin the pack folder
// is replaced wholesale on every plugin update, so a key sitting next to the pack is deleted
// the first time the member updates. The pack-relative paths stay for installs made before
// that (2026-09-14). CLAUDE_CONFIG_DIR is honoured so a sandbox install keeps its own key.
function keyPaths() {
  const cfg = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
  return [join(cfg, 'buildplane', 'license.json'), join(HERE, '..', 'license.json'), join(HERE, 'license.json')];
}
function loadKey() {
  if (process.env.BUILDPLANE_KEY) return process.env.BUILDPLANE_KEY;
  for (const p of keyPaths()) {
    if (existsSync(p)) {
      try { const k = JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')).key; if (k) return k; } catch (_) { /* fall through */ }
    }
  }
  die('No license key. Put license.json ({"key":"bl_…"}) in ' + keyPaths()[0] + ', or set BUILDPLANE_KEY.');
}
// Errors throw Die; the top-level catch sets the exit code and lets Node drain
// (process.exit() while a fetch handle is closing trips a libuv assertion on Windows).
class Die extends Error {}
function die(msg, code = 2) { console.error(JSON.stringify({ error: msg })); process.exitCode = code; throw new Die(msg); }
function flag(args, name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; }

async function api(body) {
  const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-bl-key': loadKey() }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  const data = await r.json().catch(() => ({ error: { code: 'bad_json', message: 'Non-JSON response ' + r.status } }));
  if (!r.ok || data.error) { console.log(JSON.stringify(data)); process.exitCode = 1; throw new Die('api'); }
  return data;
}

const [cmd, ...args] = process.argv.slice(2);
const out = (o) => console.log(JSON.stringify(o, null, 2));

try {
switch (cmd) {
  case 'check': out(await api({ action: 'key.check' })); break;
  case 'projects': out(await api({ action: 'project.list' })); break;
  case 'project': {
    if (!args[0]) die('usage: project <projectId>');
    out(await api({ action: 'project.get', projectId: args[0] }));
    break;
  }
  case 'brief': {
    // Save the questionnaire answers the planner collected in chat (same shape as the dashboard's).
    if (!args[0] || !args[1]) die('usage: brief <projectId> <brief.json>');
    const brief = JSON.parse(readFileSync(args[1], 'utf8'));
    out(await api({ action: 'project.brief', projectId: args[0], brief, description: brief.description }));
    break;
  }
  case 'plan-import': {
    if (!args[0] || !args[1]) die('usage: plan-import <projectId> <plan.json>');
    const plan = JSON.parse(readFileSync(args[1], 'utf8'));
    out(await api({ action: 'plan.import', projectId: args[0], plan }));
    break;
  }
  case 'claim': {
    if (!args[0]) die('usage: claim <projectId>');
    const claimed = await api({ action: 'step.claim_next', projectId: args[0] });
    // The build that claimed the step keeps it alive: a detached check-in loop runs until the
    // run is reported (or reset), so a long build is never mistaken for a dead one, and
    // nothing from another machine can keep a dead build alive.
    if (claimed.step && claimed.run_id) {
      const child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'beat', String(claimed.run_id), '--loop'], { detached: true, stdio: 'ignore', env: process.env });
      child.unref();
    }
    out(claimed);
    break;
  }
  // wait — block until this project has work, sleeping in Node rather than by burning model
  // turns. /buildplane watch loops on this, so the member types one line per work session
  // instead of /buildplane next for every single step, and the waiting costs no tokens at all.
  case 'wait': {
    const projectId = args[0];
    if (!projectId) die('usage: wait <projectId> [--every 15] [--timeout 1800]');
    const every = Math.max(5, +(flag(args, '--every') || 15)) * 1000;
    const until = Date.now() + Math.max(60, +(flag(args, '--timeout') || 1800)) * 1000;
    for (;;) {
      const d = await api({ action: 'project.get', projectId });
      const steps = d.steps || [];
      const queued = steps.filter((s2) => s2.section === 'live' && s2.status === 'queued');
      const running = steps.find((s2) => s2.status === 'running');
      // Something else is already building: wait it out rather than racing it for the claim.
      if (queued.length && !running) { out({ ready: true, queued: queued.length, next: queued[0].title }); break; }
      if (Date.now() >= until) { out({ ready: false, timeout: true, queued: queued.length, running: running ? running.title : null }); break; }
      await new Promise((r) => setTimeout(r, every));
    }
    break;
  }
  case 'beat': {
    if (!args[0]) die('usage: beat <runId> [--loop]');
    const runId = +args[0];
    if (!args.includes('--loop')) { out(await api({ action: 'run.beat', run_id: runId })); break; }
    const until = Date.now() + 3 * 60 * 60 * 1000; // never outlive a build by more than 3 hours
    while (Date.now() < until) {
      await new Promise((r) => setTimeout(r, 30000));
      let r;
      try { r = await api({ action: 'run.beat', run_id: runId }); } catch (_) { process.exitCode = 0; break; }
      if (r.finished) break;
    }
    break;
  }
  case 'report': {
    const [stepId, status] = args;
    if (!stepId || !['done', 'failed', 'skipped'].includes(status)) die('usage: report <stepId> <done|failed|skipped> [--run id] [--tokens n] [--log file] [--result json] [--screenshot path]');
    const body = { action: 'step.report', stepId, status };
    const run = flag(args, '--run'); if (run) body.run_id = +run;
    const tokens = flag(args, '--tokens'); if (tokens) body.tokens_est = +tokens;
    const logFile = flag(args, '--log'); if (logFile && existsSync(logFile)) body.log = readFileSync(logFile, 'utf8').slice(-200000);
    const result = flag(args, '--result'); if (result) { try { body.result = JSON.parse(result); } catch (_) { body.result = { note: result }; } }
    const shot = flag(args, '--screenshot'); if (shot) body.screenshot_path = shot;
    out(await api(body));
    break;
  }
  case 'upload': {
    const [stepId, file] = args;
    if (!stepId || !file || !existsSync(file)) die('usage: upload <stepId> <file>');
    const { path, signedUrl } = await api({ action: 'artifact.upload_url', stepId, filename: basename(file) });
    const bytes = readFileSync(file);
    const type = file.endsWith('.png') ? 'image/png' : file.endsWith('.jpg') || file.endsWith('.jpeg') ? 'image/jpeg' : 'application/octet-stream';
    const r = await fetch(signedUrl, { method: 'PUT', headers: { 'Content-Type': type }, body: bytes, signal: AbortSignal.timeout(60000) });
    if (!r.ok) die('upload failed: HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200), 1);
    out({ ok: true, path });
    break;
  }
  case 'note': {
    const [projectId, ...words] = args;
    if (!projectId || !words.length) die('usage: note <projectId> <text>');
    out(await api({ action: 'runner.note', projectId, note: words.join(' ') }));
    break;
  }
  default:
    die('commands: check | projects | project | brief | plan-import | claim | report | upload | note | beat');
}
} catch (e) {
  if (!(e instanceof Die)) { console.error(JSON.stringify({ error: String(e && e.message || e) })); process.exitCode = 1; }
}
await new Promise((r) => setTimeout(r, 120));
