# Proof rules — a step is done only when it is proven

Run the gates in this order. The first one that fails stops the step; report
`failed` with the gate name and a plain-words reason. Never soften a failed gate
into "done with notes".

## Gate 1 — it runs
- Genesis target: `genesis_preview_logs` must return `viteError: null`. If it doesn't,
  fix it; if you can't within two attempts, fail the step with the error in plain words.
- Local target: the project's own test command passes (`npm test`, `pytest`, …). No
  tests? Then the app must at least start without errors.

## Gate 2 — the step's own proof sentence
- Read the step's `proof` literally and do exactly that check. "A test submission
  appears in Estage CRM" means submit the form and look, not "the form has an onSubmit".
- If the proof needs something you can't do (a real payment, an email arriving),
  do the closest safe check, say so in the report's `result.proof`, and mark done only
  if the member's proof sentence allows it — otherwise fail with "needs you to…".

## Gate 3 — screenshot
- UI steps: `genesis_screenshot` of the page you changed (width 1280) → save as
  `.buildplane/shots/<step-sort>-<slug>.jpg` → `bl.mjs upload`. Attach the stored path
  to the report. No screenshot, no done.
- Non-UI steps (data, settings): a short text proof in `result.proof` is enough.

## Gate 4 — mobile (UI steps only)
- `genesis_screenshot` at width 390. Fail if anything overflows sideways or text is
  clipped. The dedicated "Mobile check" step does this for every page at once; other
  UI steps only check their own page.

## Gate 5 — no dead links on the page you touched
- Every `href`/`to` on the page resolves to a real page in the project or an external
  URL. A link to a page that doesn't exist yet is a fail unless that page is a later
  step — then link to it and say so in DECISIONS.md.

## Gate 3 on a LOCAL target
- No `genesis_screenshot`. If the member's Claude has a browser tool (agent-browser,
  Playwright, Puppeteer), start the app, screenshot 1280 and 390 to the same paths. If
  it has none, the screenshot gate becomes a text proof (`result.proof` names the URL you
  opened and what you saw) — say so in DECISIONS.md, and the Quality check judges from
  the page source plus the precheck instead of screenshots.

## Quality check (the step before publish)
- Not a build step — a judge. Follow `references/judge-rules.md` to the letter. The
  verdict comes from `node ~/.claude/skills/buildplane/scripts/judge.mjs gate` (exit 0 pass / 1 reject); you never
  decide it. Two rounds maximum; a round-2 REJECT is reported `failed` with the scorecard
  in `result.scorecard` so the member can read it on the dashboard and decide.

## Publish + smoke test (final live step)
- `genesis_publish` → fetch the published URL (HTTP 200, the main heading present) →
  perform the main action once (submit the form / open the checkout) → screenshot the
  published page. Proof = the published URL and what you checked.

## Reporting honestly
- `result.proof`: what you actually verified, in one or two sentences.
- `tokens_est`: an honest estimate — sum this session's usage since the claim, or
  words written × 1.3. Never 0.
- Append 2–4 lines to DECISIONS.md: what you chose, why, what you'd revisit.
