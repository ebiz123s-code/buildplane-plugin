#!/usr/bin/env node
// judge.mjs — the Quality check gate. The verdict is computed HERE, in code, from
// the judge's JSON. No model decides pass or fail. Zero dependencies; Node 18+.
//
//   node judge.mjs precheck <file...>          → { preHardFails: [...] }  deterministic scans of page source
//   node judge.mjs gate <verdict.json> [--pre <prehardfails.json>] [--prior <prior-verdict.json>] [--round N]
//                                              → { verdict: PASS|REJECT, reasons, fixList, regression, scorecard, markdown }
//
// The verdict.json is written by the judge (see references/judge-rules.md):
//   { dimensions: [{ name, score, evidence }], overall, hardFails: [{ trigger, evidence }],
//     gaps: [{ finding, severity, whatATenLooksLike, cite }], watchOuts: [string] }
import { readFileSync, existsSync } from 'node:fs';

export const DIMENSIONS = ['Clear in 5 seconds', 'One clear next action', 'Works on mobile', 'Looks finished', 'Honest copy'];
export const PASS_OVERALL = 8.0;
export const PASS_DIMENSION = 7.0;
export const REGRESSION_DROP = 1.0;
export const MAX_ROUNDS = 2;
// Unconditional triggers. A judge-claimed hard-fail only forces REJECT when it matches one of
// these; anything else is downgraded to a BLOCKER gap so a hallucinated hard-fail cannot sink a step.
export const VALID_HARD_FAILS = [
  'Generic button label',
  'Error message with no next step',
  'Empty state missing or generic',
  'Text overlapping text or images',
  'Pure black background',
  'Fabricated numbers or claims',
  'Dead link on the page',
  'Content cut off or overflowing on mobile',
  'Console error on load',
];

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const matchesValid = (trigger) => VALID_HARD_FAILS.find((v) => { const a = norm(v), b = norm(trigger); return a === b || a.includes(b) || b.includes(a); });
const r1 = (n) => Math.round(n * 10) / 10;

// ── Deterministic pre-checks — a grep cannot be argued with ──
const PRECHECKS = [
  { re: />\s*(Submit|OK|Click Here|Click here|Cancel|Save)\s*</g, fail: 'Generic button label', why: (m) => 'button or link text is just "' + m[1] + '"' },
  { re: /(No data found|No results|Nothing here)/g, fail: 'Empty state missing or generic', why: (m) => 'empty state reads "' + m[1] + '"' },
  { re: /(Something went wrong)\s*[<'"`.]/g, fail: 'Error message with no next step', why: () => 'bare "Something went wrong" with no next step' },
  { re: /(bg-\[#000000\]|bg-\[#000\]|background(?:-color)?\s*:\s*#000(?:000)?\b|bg-black\b)/g, fail: 'Pure black background', why: (m) => 'pure black background via ' + m[1] },
  { re: /href=["']#["']|to=["']["']/g, fail: 'Dead link on the page', why: () => 'a link points nowhere (href="#" or empty to="")' },
];
export function precheck(files) {
  const preHardFails = [];
  for (const f of files) {
    if (!existsSync(f)) { preHardFails.push({ trigger: 'Missing evidence', evidence: f + ' does not exist', file: f }); continue; }
    const src = readFileSync(f, 'utf8');
    for (const c of PRECHECKS) {
      c.re.lastIndex = 0;
      let m; const seen = new Set();
      while ((m = c.re.exec(src))) {
        const key = c.fail + '|' + m[0];
        if (seen.has(key)) continue; seen.add(key);
        preHardFails.push({ trigger: c.fail, evidence: c.why(m) + ' in ' + f, file: f });
      }
    }
  }
  return { preHardFails };
}

// ── The gate ──
export function gate(verdict, { preHardFails = [], prior = null, round = 1 } = {}) {
  const reasons = [];
  const dims = Array.isArray(verdict?.dimensions) ? verdict.dimensions : [];
  const byName = new Map(dims.map((d) => [norm(d?.name), d]));
  const scored = DIMENSIONS.map((name) => {
    const d = byName.get(norm(name));
    const score = d && Number.isFinite(+d.score) ? r1(+d.score) : null;
    return { name, score, evidence: String(d?.evidence ?? '') };
  });
  for (const d of scored) {
    if (d.score === null) reasons.push('Dimension "' + d.name + '" was not scored — the judge must score all ' + DIMENSIONS.length + ' fixed dimensions');
    else if (d.score < 0) reasons.push('Dimension "' + d.name + '" has no evidence (scored -1): ' + (d.evidence || 'add the missing evidence and judge again'));
    else if (d.score < PASS_DIMENSION) reasons.push('Dimension "' + d.name + '" scored ' + d.score + ' (needs ' + PASS_DIMENSION + ')');
  }
  const valid = scored.filter((d) => d.score !== null && d.score >= 0);
  const overall = Number.isFinite(+verdict?.overall) ? r1(+verdict.overall) : (valid.length ? r1(valid.reduce((a, d) => a + d.score, 0) / valid.length) : null);
  if (overall === null) reasons.push('No overall score');
  else if (overall < PASS_OVERALL) reasons.push('Overall ' + overall + ' (needs ' + PASS_OVERALL + ')');

  const gaps = (Array.isArray(verdict?.gaps) ? verdict.gaps : []).map((g) => ({
    finding: String(g?.finding ?? ''), severity: ['BLOCKER', 'MAJOR', 'MINOR'].includes(g?.severity) ? g.severity : 'MAJOR',
    whatATenLooksLike: String(g?.whatATenLooksLike ?? ''), cite: String(g?.cite ?? ''),
  })).filter((g) => g.finding);
  const matched = [];
  for (const h of Array.isArray(verdict?.hardFails) ? verdict.hardFails : []) {
    const t = String(h?.trigger ?? ''); if (!t) continue;
    const v = matchesValid(t);
    if (v) matched.push({ trigger: v, evidence: String(h?.evidence ?? '') });
    else gaps.unshift({ finding: t, severity: 'BLOCKER', whatATenLooksLike: '', cite: String(h?.evidence ?? ''), downgraded: true });
  }
  for (const p of preHardFails) matched.push({ trigger: String(p?.trigger ?? p), evidence: String(p?.evidence ?? ''), deterministic: true });
  for (const h of matched) reasons.push('Hard-fail: ' + h.trigger + (h.evidence ? ' — ' + h.evidence : ''));

  const regression = [];
  if (prior && Array.isArray(prior.dimensions)) {
    const prev = new Map(prior.dimensions.map((d) => [norm(d?.name), +d?.score]));
    for (const d of scored) {
      const was = prev.get(norm(d.name));
      if (Number.isFinite(was) && d.score !== null && d.score >= 0 && was - d.score > REGRESSION_DROP) regression.push({ name: d.name, was: r1(was), now: d.score });
    }
  }
  const order = { BLOCKER: 0, MAJOR: 1, MINOR: 2 };
  const fixList = [...matched.map((h) => ({ finding: h.trigger, severity: 'HARD-FAIL', whatATenLooksLike: '', cite: h.evidence })), ...gaps.sort((a, b) => order[a.severity] - order[b.severity])];
  const verdictWord = reasons.length ? 'REJECT' : 'PASS';
  const watchOuts = (Array.isArray(verdict?.watchOuts) ? verdict.watchOuts : []).map(String).filter(Boolean).slice(0, 3);
  const scorecard = { round, verdict: verdictWord, overall, dimensions: scored, hardFails: matched, gaps: fixList.filter((g) => g.severity !== 'HARD-FAIL'), watchOuts, regression, maxRounds: MAX_ROUNDS };
  return { verdict: verdictWord, reasons, fixList, regression, scorecard, markdown: toMarkdown(scorecard) };
}

export function toMarkdown(sc) {
  const lines = ['QUALITY CHECK — round ' + sc.round + ' of ' + sc.maxRounds + ' — ' + sc.verdict + (sc.overall !== null ? ' (overall ' + sc.overall + ', needs ' + PASS_OVERALL + ')' : ''), '', '| What we judged | Score |', '|---|---|'];
  for (const d of sc.dimensions) lines.push('| ' + d.name + ' | ' + (d.score === null ? 'not scored' : d.score < 0 ? 'no evidence' : d.score + (d.score < PASS_DIMENSION ? ' ✗' : '')) + ' |');
  if (sc.hardFails.length) { lines.push('', 'Hard-fails (each one blocks on its own):'); for (const h of sc.hardFails) lines.push('- ' + h.trigger + (h.evidence ? ': ' + h.evidence : '')); }
  if (sc.gaps.length) { lines.push('', 'What is still wrong:'); for (const g of sc.gaps) lines.push('- [' + g.severity + '] ' + g.finding + (g.whatATenLooksLike ? ' → a 10 looks like: ' + g.whatATenLooksLike : '')); }
  if (sc.regression.length) { lines.push('', 'Regression — a fix broke something that was working:'); for (const r of sc.regression) lines.push('- ' + r.name + ' fell from ' + r.was + ' to ' + r.now); }
  if (sc.verdict === 'PASS' && sc.watchOuts.length) { lines.push('', 'Watch-outs (passed, but closest to failing):'); for (const w of sc.watchOuts) lines.push('- ' + w); }
  return lines.join('\n');
}

// ── CLI ──
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const [cmd, ...args] = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { console.error(JSON.stringify({ error: 'cannot read ' + p + ': ' + e.message })); process.exit(2); } };
  if (cmd === 'precheck') {
    const files = args.filter((a) => !a.startsWith('--'));
    if (!files.length) { console.error(JSON.stringify({ error: 'usage: precheck <file...>' })); process.exit(2); }
    console.log(JSON.stringify(precheck(files), null, 2));
  } else if (cmd === 'gate') {
    const vf = args.find((a) => !a.startsWith('--') && a !== flag('--pre') && a !== flag('--prior') && a !== flag('--round'));
    if (!vf) { console.error(JSON.stringify({ error: 'usage: gate <verdict.json> [--pre file] [--prior file] [--round N]' })); process.exit(2); }
    const pre = flag('--pre') ? (readJson(flag('--pre')).preHardFails ?? []) : [];
    const prior = flag('--prior') ? readJson(flag('--prior')) : null;
    const out = gate(readJson(vf), { preHardFails: pre, prior, round: +(flag('--round') ?? 1) || 1 });
    console.log(JSON.stringify(out, null, 2));
    process.exitCode = out.verdict === 'PASS' ? 0 : 1;
  } else {
    console.error(JSON.stringify({ error: 'commands: precheck <file...> | gate <verdict.json> [--pre f] [--prior f] [--round N]' }));
    process.exit(2);
  }
}
