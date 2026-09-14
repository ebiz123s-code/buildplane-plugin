# Plan rules

The plan is the product. A member who reads it should think "yes, that's exactly
what I meant, and I could explain it to a friend."

## Shape
- **One core outcome.** If the idea contains two ("a booking page AND a members area"),
  pick the one they said first, put the other in `later` under "you didn't think of this
  yet, but you will".
- **Smallest working version first.** Version 0 is the thinnest thing that lets the
  member say "it works". Polish, extras, integrations → `later`.
- **≤ 12 live steps.** The server warns above 12; aim for 5–9. A step is 20–60 minutes
  of build. Too big → split; too small → merge.
- **Every step names its files** (`owns_files`). Two steps never own the same file in
  the same version — that is what makes parallel runs safe.
- **Every step proves itself** (`proof`): one sentence a non-developer could check.
  "Preview compiles and /book shows the heading" — not "implement booking page".
- **Always the last three live steps, in this order:** `Mobile check` (proof: mobile
  screenshot renders without overflow), `Quality check` (proof: the judge gate passes —
  overall 8.0+, every dimension 7.0+, no hard-fails; see `judge-rules.md`) and
  `Publish + smoke test` (proof: the published URL returns the page and the main action
  works once). The server appends any of the three that are missing. `owns_files` for
  Quality check = every file the earlier steps own (it may fix them in its fix round).

## Look and feel
- The member sets colours, images (by link) and a note on the dashboard, ideally before the
  first Run. The plan never chooses colours or photos for them: if `brand` is empty when a
  step runs, the builder picks a calm scheme and records it in DECISIONS.md.
- `project.build_options` is the member's selected build intensity: `model`, `style`,
  `special_effects`, `interactive_level`, and `image_density`. The builder must respect them
  in the implementation when they are present: `premium` allows more motion and layered visual
  interest; `minimal` keeps it quiet and minimal; `interactive_level: lots` adds richer hover,
  reveal, and motion behavior; `image_density: heavy` supports more image-led composition.
- After a step is done the member can press **Ask for a change** on it; that adds a live
  step titled "Change: …" owning the same files, queued at the end of the version. It runs
  through every gate like any other step.

## Later section
- Group parked items under short headings: "Nice to have", "Needs a decision from
  you", "You didn't think of this yet". Each still gets a title + plain summary + proof
  so "Start version 1" can promote them without rewriting.

## Words
- Titles are verbs the member would use: "Create the booking page", not "Scaffold
  route + component". Run `references/jargon-list.md` over every title and summary.
- `plain_summary` = what the member will SEE when the step is done. 1–2 sentences.
- `spec` = one paragraph in the member's words: who it's for, what it does, what
  "working" means. This becomes SPEC.md.

## Token estimate
- Rough, honest, per step: small copy/config step ≈ 2k, a page ≈ 5–8k, a page with a
  form and CRM wiring ≈ 10–15k. Sum shown on the dashboard so the member can budget.

## From a brief (the dashboard questionnaire)
- `project.brief` is the member's own answers; the plan must read as a direct reply to them.
  `kind` picks the recipe; `audience` opens the spec ("For …"); `action` is the one core
  outcome; `working[]` lines become the proof on "Publish + smoke test" (word for word where
  they fit); `avoid` is a hard rule for every step; `notes` and `traffic` inform, they do not
  add steps.
- `have[]` decides the first steps: no "The words are written" → a "Write the …" step comes
  first; no "The product is set up in Estage" → the checkout step's `plain_summary` says the
  owner attaches the product in the wizard; no "Logo and images" → look-and-feel note in
  DECISIONS.md; no "A domain connected" → a "Needs a decision from you" item in `later`;
  "Nothing yet" → all of the above, and the write step comes first.
- `mode: "text"` → treat `text` exactly like a quoted idea.

## Funnels
- A funnel is **pages on the member's own domain that hand off to each other** — opt-in →
  thank-you → offer → checkout → upsell → delivery, whichever the brief's `steps[]` lists, in
  that order. It is NOT the Estage funnel canvas: the Claude connection cannot create or edit
  that canvas, so never plan a step that does. The canvas mapping ("point each funnel step at
  these pages" for per-step analytics and A/B splits) is always a `later` item, an owner click.
- Keep the member's `steps[]` order; defaults they unticked go to `later`, not silently dropped.
- One step titled "Wire the flow" (or "Wire the flow and the tags") owns the links between
  pages and the CRM tag names; page steps never edit another step's page.
- The "Publish + smoke test" proof for a funnel is **one complete walk of the flow** ending in
  the thing `working[]` names (a test order in Orders, a tagged contact, a booking).
- Checkout moves people by the order form's confirmation redirect; the upsell is a second,
  separate order form (no one-click upsell exists — never promise it); test purchases use a
  100%-off coupon, never a $0 product.
- Recipes: `lead-magnet-funnel`, `quiz-funnel`, `sales-funnel`, `webinar-funnel`; a booking
  funnel is `booking-page` plus a confirmation page and a "Wire the flow" step.

## Sites
- A site is several pages sharing one menu and footer, with one main action (contact, book,
  buy). The menu/footer pair is its own step and comes before the page steps (nav first);
  page steps never touch the menu files.
- Recipes: `business-site`, `landing-page` (= `sales-page-order-form`), `members-area`,
  `booking-page`.
