---
name: buildplane
description: Use when the member says /buildplane plan "<idea>" or /buildplane next — turns a rambling idea into a versioned, proof-gated build plan and runs it one step at a time against their Genesis project (or a local repo) on their own Claude subscription.
user-invocable: true
args:
  - name: command
    description: plan ["<idea>"] or next, either optionally with --project <id>
    required: false
---

# Buildplane

Describe → See the plan → Press Run. You are the builder; the dashboard at
ebiz123s.com/apps/buildplane is where the member watches progress. **Every server
call goes through `$BP/scripts/bl.mjs`** (it holds the license key) — never compose
HTTP yourself. All commands print JSON; a non-zero exit means stop and show the
error to the member in plain words.

**Where the scripts are:** `scripts/`, `references/` and `recipes/` are inside THIS
skill's folder, NOT the member's project folder. Work that folder out ONCE at the start of
the session and call it **$BP** — every command below writes `$BP/scripts/…` and you
substitute the real path. There are two shapes, because Buildplane installs two ways:
- installed as a Claude Code plugin (the normal way now):
  `~/.claude/plugins/cache/ebiz123s/buildplane/<version>/skills/buildplane`
- installed by the older one-line installer: `~/.claude/skills/buildplane`
If you are unsure which, the folder holding this SKILL.md is always the right answer. Never
look for, copy, or create these files inside the project folder. Plans, SPEC.md,
DECISIONS.md and `.buildplane/` DO go in the project folder.

**Where the licence lives:** `<config dir>/buildplane/license.json`, where the config dir is
`~/.claude` unless `CLAUDE_CONFIG_DIR` says otherwise. NOT next to the skill — a plugin
folder is replaced wholesale on every update, which would delete the key.

## Setup (first run only)
**Say something before you do anything.** The checks below take a few seconds and run
several commands, and the desktop app shows nothing but a spinner meanwhile — worse, it prints
a grey line claiming the command was not recognised, which is untrue and reads like a failure.
A member who is thirty seconds into their first ever run assumes it broke and closes the window.
So: FIRST reply with one short line — "Checking your Buildplane setup, one moment." — and only
then start running commands. Same rule anywhere else you are about to be quiet for more than a
few seconds.

1. `node $BP/scripts/bl.mjs check` — confirms the license key.
   If it fails with "No license key", DO NOT tell the member to create a file. Ask them to
   copy their key from the dashboard (ebiz123s.com/apps/buildplane → setup step 2 → "Make my
   key"), paste it into the chat, then **write it yourself**: create the folder the error
   names and put `{ "key": "bl_…" }` in `license.json` there, using the Write tool. Run
   `check` again and tell them whose account it belongs to (the `email` it prints) — if that
   is not the account they are signed into on the dashboard, their projects will be invisible
   here, and they should make the key again while signed in as the right person.
   Keys are `bl_` followed by 32 hex characters; anything else is not a Buildplane key.
2. **Bind to the right Genesis project before touching anything.** A Buildplane project
   records the Estage project it builds into as `genesis_project_id`, and that project's
   tools are namespaced `genesis-<genesis_project_id>` (e.g. `genesis-34698`). Members
   commonly have three Estage projects connected at once, so several `genesis-*` tool sets
   are loaded and a bare `genesis_*` call is ambiguous — guessing means building into one
   of their other LIVE sites. Always use the set whose id matches this project. If that set
   is absent, STOP and say so: the member connects that specific project (Estage →
   Settings → Integrations → Coding agents → pick it in the PROJECT dropdown → Generate
   token → run its `claude mcp add` line) and restarts Claude. Never fall back to a
   different `genesis-*` set, even if only one is present.
   If MANY `genesis-*` sets are loaded (some members have unlimited Estage projects, and
   each connected one adds ~68 tools to every session), say so once and suggest they
   `claude mcp remove` the projects they are not building. Do not remove anything yourself.

## `/buildplane plan ["<idea>"] [--project <id>]`
1. `node $BP/scripts/bl.mjs projects` → pick the project the member names (or ask; if
   none, tell them to create one on the dashboard — it takes 10 seconds).
2. Get the idea, in this order:
   - `node $BP/scripts/bl.mjs project <projectId>` → `project.brief`. If it is set, that
     is the idea: the member answered the dashboard questionnaire (`mode: "questions"`: kind,
     audience, action, working[], have[], steps[], offer, traffic, avoid, notes) or wrote free
     text (`mode: "text"`: `text`). A quoted idea on the command adds to the brief; it never replaces it.
   - No brief and a quoted idea → use the idea as today.
   - No brief and no idea → ask the questionnaire in chat, one question at a time, and say on the
     first one "or just tell me in a sentence or two". Questions: What are you building (site:
     business website / landing or sales page / members area / booking page; funnel: lead magnet /
     quiz / sales with upsell / webinar or video / booking)? Who is it for? The one thing a visitor
     should do? How will you know it works? What do you already have (words, product in Estage,
     logo and images, domain, nothing yet)? For a funnel: which steps, in what order, and what is the
     offer or lead magnet? Anything it must not do? Anything else? Every question is skippable.
     Save what they said back to the project: `bl.mjs brief <projectId> <brief.json>` (same shape as
     the dashboard's), so the dashboard shows it.
   Read `references/plan-rules.md` and `references/jargon-list.md`. Match the brief's `kind`
   (or the idea's words) to a recipe in `recipes/` and start from it. A funnel brief's `steps`
   list is the page order — keep it; drop the unticked defaults into `later`. "Nothing yet" in
   `have` → add a "Write the offer" (or "Write the words") step first.
3. Write the plan JSON to `.buildplane/plan.json` in the working folder:
   ```json
   { "spec": "<one-paragraph SPEC>", "core_outcomes": ["<exactly one>"],
     "live":  [{ "title": "", "plain_summary": "", "owns_files": [], "proof": "", "tokens_est": 0 }],
     "later": [{ "title": "", "plain_summary": "", "owns_files": [], "proof": "" }] }
   ```
   Rules that the server enforces: every step has title + plain_summary + proof;
   one core outcome; live ≤ 12 steps (warning above); the last THREE live steps are
   ALWAYS "Mobile check", "Quality check" and "Publish + smoke test" (the server adds
   any that are missing). Everything non-essential goes to `later` with a "you didn't
   think of this" group.
4. Also write `SPEC.md` (the spec paragraph + the live steps as a checklist) and
   create `DECISIONS.md` with a header — both in the working folder.
5. `node $BP/scripts/bl.mjs plan-import <projectId> .buildplane/plan.json`. Show the
   member the result: version number, live/later counts, any warnings, and say
   "Press **Run next step** on the dashboard, or tell me `/buildplane next`."

## `/buildplane next [--project <id>]`
1. `node $BP/scripts/bl.mjs claim <projectId>`.
   - Keep the `run_id` it prints: `report` refuses a result without `--run <runId>`,
     and only the run that claimed a step may report it (so two builders cannot
     both write the same step). `claim` also starts a background check-in for that
     run (every 30 s until you report), so a long build is never mistaken for a dead
     one; a run that stops checking in for 15 minutes is handed back.
   - `step: null, busy: {...}` → a step is already running; say so and stop. (If that step has
     been silent for 15 minutes the server hands it back on the next claim; the member can also
     press "Start this step again" on the dashboard.)
   - `step: null` → nothing is queued; tell the member to press Run on the dashboard
     (queuing is a dashboard action so they stay in control) and stop.
2. Read the project's **Look and feel** first: `node $BP/scripts/bl.mjs project <projectId>`
   → `project.brand` = `{ scheme, colors: { bg, ink, accent }, images: [{ label, url }], notes }`.
   Also read `project.build_options` if it is set: `{ model, style, special_effects, interactive_level, image_density }`.
   - `model`: use that model preference when you are the builder or when you write the build prompt; if it is unavailable, fall back to the next valid configured model automatically.
   - `style`: `minimal` = restrained, clean, low-noise; `balanced` = polished and even; `premium` = richer motion, more layered visual interest, more pronounced callouts.
   - `special_effects`: if true, allow motion accents, soft gradients, layered shadows, floating cards, and tasteful decorative effects. If false, keep it minimal and premium.
   - `interactive_level`: `little` = sparse interaction; `some` = moderate micro-interactions; `lots` = more hover states, animated reveals, carousels, tabs, and richer UI motion.
   - `image_density`: `balanced` = selective imagery; `heavy` = more visual content, hero imagery, supporting media, and collage-like composition.
   Use exactly those colours (tints and a deeper shade of each are fine), put each image
   where its label says, and never add photos the member did not give you. If `brand` is
   empty, choose two fonts and a calm, restrained scheme yourself and write the choice into
   DECISIONS.md so the member can change it. If `brand` is present but `build_options` set a
   more vibrant style, make the actual implementation feel richer without violating the brand palette.
   Build ONLY that step, touching only `owns_files` (other steps may run later in
   parallel). A step whose title starts with **"Change:"** was added from the dashboard's
   "Ask for a change" button: its `plain_summary` is the member's request in their own
   words. Make that change in the files it owns, keep everything else exactly as it was,
   run every gate again, and if the project was already published, publish again so the
   live page shows the change. Genesis target: `genesis_context` once per session on this project's own
   `genesis-<genesis_project_id>` tools → edit files → that same set's
   `genesis_preview_logs` must show `viteError: null`. Local target: edit → run the
   project's tests.
3. Prove it — read `references/proof-rules.md`. Gates in order: preview compiles;
   the step's own `proof` sentence is satisfied; `genesis_screenshot` (same tool set) of the page
   (save to `.buildplane/shots/<step>.jpg`); mobile width for UI steps.
   **If the claimed step is "Quality check"**, there is nothing to build: read
   `references/judge-rules.md` and run it exactly — evidence bundle → deterministic
   `node $BP/scripts/judge.mjs precheck` → one judge → `node $BP/scripts/judge.mjs gate`.
   The gate's exit code is the verdict (0 pass, 1 reject). Max 2 rounds, then report
   `failed` with the scorecard. Never soften a REJECT.
4. Append to `DECISIONS.md`: date, step title, what was decided and why (2–4 lines).
5. Report:
   - success: `node $BP/scripts/bl.mjs upload <stepId> <shot>` → then
     `node $BP/scripts/bl.mjs report <stepId> done --run <runId> --tokens <est> --screenshot <path> --result '{"proof":"<what you verified>"}' --log <logfile>`
   - a gate failed: `report <stepId> failed --run <runId> --result '{"gate":"<which>","why":"<plain words>"}'`
     and tell the member what failed and the one thing you'd try next. Never mark a
     step done on a failed gate.
   Token estimate: sum the `usage` fields from this session's JSONL since the claim
   (or estimate from words written × 1.3 if unavailable) — an honest number, not 0.
6. Say the new percent (from `node $BP/scripts/bl.mjs project <projectId>` → `progress`)
   in one line, then stop. Do not claim the next step unless the member asked to
   "keep going" — then loop from 1 until `step: null`.

## `/buildplane watch [--project <id>]`
One line per work session instead of `/buildplane next` per step. The member presses
**Run next step** (or **Keep going**) on the dashboard and the steps just build.
1. `node $BP/scripts/bl.mjs wait <projectId>` — it blocks in Node until
   a step is queued and nothing else is building, so waiting costs no tokens. It prints
   `{ ready: true, next: "<title>" }` when there is work, or `{ ready: false, timeout: true }`
   after 30 minutes.
2. `ready: true` → run `/buildplane next` exactly as written above (claim, build, prove,
   report), then go back to 1.
3. `timeout: true` → say in one line that nothing has been queued for half an hour and you
   have stopped watching, and tell them to type `/buildplane watch` again when they want more.
   Stop. Do not loop forever without telling them.
4. If a step fails, report it as `next` does, say so, and keep watching — a failed step does
   not end the session. If the same step fails twice, stop watching and say why.
Tell the member once, at the start: you are watching, they can queue steps from the
dashboard, and closing this window stops it.

## Voice
Plain English, no jargon from `references/jargon-list.md` in anything the member
reads (titles, summaries, messages). Short. Honest about what was and wasn't proven.

## Red flags — stop and re-read the rules
- Writing files outside the step's `owns_files`.
- Reporting `done` without a screenshot for a UI step.
- A plan with two core outcomes or no "Publish + smoke test" step.
- Composing a fetch/curl to the API instead of calling `bl.mjs`.
- Deciding the Quality check verdict yourself instead of reading `judge.mjs gate`'s exit
  code, or running a third judging round.
