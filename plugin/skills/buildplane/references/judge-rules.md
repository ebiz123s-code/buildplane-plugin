# Judge rules — the Quality check step

Every live plan ends with three steps: **Mobile check → Quality check → Publish + smoke
test**. The Quality check is a real judge with a hard bar, not a self-review. It runs at
most **2 rounds**. The verdict is computed by `~/.claude/skills/buildplane/scripts/judge.mjs`, never by you or the judge.

## What the judge grades (fixed, never renamed)

| Dimension | 10 looks like | 5 looks like |
|---|---|---|
| Clear in 5 seconds | A stranger knows what it is, who it is for, what to do — from the first screen | Has to scroll or read a paragraph to find out |
| One clear next action | One dominant button with specific words ("Book my free call") | Several equal buttons, or a generic label |
| Works on mobile | 390px screenshot equals the desktop experience; nothing clipped or sideways | Text cut off, overlapping, or a horizontal scroll |
| Looks finished | Consistent spacing, two fonts max, restrained palette, nothing placeholder | Mixed spacing, default fonts, obvious template feel |
| Honest copy | Every number and claim is the member's own; errors say what to do next | Invented stats, "99% uptime", hype stacking, bare "Something went wrong" |

**PASS = overall ≥ 8.0 AND every dimension ≥ 7.0 AND zero hard-fails.** Scores are 0–10,
one decimal. Anchor: 10 = best you have seen · 8 = ship-proud · 7 = competent but
forgettable · 5 = real problems · 3 = embarrassing. Use the range; do not cluster at 7–8
to be polite. If the evidence does not show a dimension, score it **-1** and say what is
missing (a -1 always rejects, so gather the evidence instead of guessing).

## Hard-fails (each one rejects on its own)
Generic button label · Error message with no next step · Empty state missing or generic ·
Text overlapping text or images · Pure black background · Fabricated numbers or claims ·
Dead link on the page · Content cut off or overflowing on mobile · Console error on load.
Use these exact phrases as `trigger`. Anything else you consider fatal goes in `gaps` as a
BLOCKER — the gate downgrades unknown hard-fail phrases so a strong opinion cannot sink a step.

## The evidence bundle (build it BEFORE judging — judges consume reports, they never browse)
1. The desktop screenshot of every page this version touched (from the earlier steps'
   `.buildplane/shots/`) and the mobile screenshots from the Mobile check step.
2. `node ~/.claude/skills/buildplane/scripts/judge.mjs precheck <every page/component file this version owns>` →
   save the output to `.buildplane/judge/pre-r<N>.json`. This is deterministic (generic
   labels, black backgrounds, dead links, bare error copy).
3. The bar: the project's `SPEC.md` paragraph (who it is for, what "working" means) plus
   `DESIGN.md` / `brand_assets/` if the member has them. That is the judge's customer and
   voice — never the judge's own taste.
4. Console errors from `genesis_preview_logs` (Genesis) or the browser console (local).
Write the bundle as `.buildplane/judge/evidence-r<N>.md`: the screenshots (paths), a short
bullet list of visual facts per screenshot (what is above the fold, button labels, fonts
and colours you can see), the precheck output, the bar, the console state.

## Running the judge
- Preferred: one subagent (the Agent tool, general-purpose) with the brief below. It reads the
  evidence file and the listed screenshots and NOTHING else, and writes
  `.buildplane/judge/verdict-r<N>.json`.
- No subagent tool? Judge inline in a fresh section of the conversation, same brief, same
  output file. Say in DECISIONS.md that the judge was inline.
- Judge brief: "You are a principal product designer and a conversion reviewer in one. Grade
  ONLY from the evidence file at <path>. Score the five fixed dimensions (names verbatim),
  give an overall, list hard-fails using only the exact trigger phrases, list gaps with
  severity BLOCKER/MAJOR/MINOR each with `whatATenLooksLike` and a `cite` (which screenshot
  or line), and name exactly three `watchOuts` (what passed but is closest to failing). Every
  finding must cite evidence; an uncited finding is dropped. Output JSON only:
  `{ dimensions:[{name,score,evidence}], overall, hardFails:[{trigger,evidence}],
  gaps:[{finding,severity,whatATenLooksLike,cite}], watchOuts:[..3] }`."
- Then: `node ~/.claude/skills/buildplane/scripts/judge.mjs gate .buildplane/judge/verdict-r<N>.json --pre .buildplane/judge/pre-r<N>.json --round <N> [--prior .buildplane/judge/verdict-r<N-1>.json]`
  Exit 0 = PASS, 1 = REJECT. Read `reasons`, `fixList`, `regression`, `markdown`.

## On REJECT (round 1 only — there is no round 3)
1. Work the `fixList` top-down: HARD-FAIL, then BLOCKER, MAJOR, MINOR.
2. **Verify each finding against the page first.** Reports are claims. A finding that is
   factually wrong is not fixed — note it as DISPUTED with proof in DECISIONS.md and drop it.
   Never cave to a wrong finding, never argue with a right one.
3. Apply the smallest change that genuinely reaches `whatATenLooksLike`. Stay inside the
   files this version owns. Re-run `genesis_preview_logs` (or the local tests) after fixing.
4. **NEVER change the member's offer, prices, guarantees or access rules to satisfy the judge.**
   Findings in that territory go to the member verbatim in the report.
5. Re-screenshot what changed, rebuild the evidence as `evidence-r2.md`, run the judge again
   with `--prior` so the gate can flag a regression (a dimension that fell more than 1.0 —
   revert that change and try differently before reporting).

## Reporting
- PASS: `report <stepId> done --result '{"proof":"Quality check passed round <N>: overall <x>","scorecard":<the gate's scorecard JSON>}'`
  and append the gate's `markdown` to DECISIONS.md.
- Still REJECT after round 2: `report <stepId> failed --result '{"gate":"Quality check","why":"<top reason in plain words>","scorecard":<scorecard JSON>}'`.
  The member sees the scorecard on the dashboard and decides: fix by hand, accept the
  risk and press Run on Publish, or ask you to try again (a fresh Quality check run
  starts at round 1).
- Screenshot for this step = the desktop screenshot of the main page after any fixes.
- Never mark the Quality check done because "it is close". The gate's exit code is the answer.
