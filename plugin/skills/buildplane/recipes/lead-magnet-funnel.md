# Recipe — Lead magnet funnel

Use when the idea mentions: free guide, checklist, download, freebie, grow my list, opt-in funnel, lead magnet.
Brief kind: `lead-magnet-funnel`. Default steps: Opt-in page → Thank-you page → Delivery page.

## Starter plan
```json
{
  "spec": "A three-page flow that trades a free thing for an email address. Working = a visitor lands on the opt-in page, enters their email, sees the thank-you page, and gets the free thing on the delivery page — and they appear in my Estage CRM tagged with the name of the freebie.",
  "core_outcomes": ["Visitors give their email for the free thing and land in my CRM tagged"],
  "live": [
    { "title": "Write the opt-in words", "plain_summary": "Headline, three bullets on what the free thing gives them, and the button text — editable without code.", "owns_files": ["src/data/leadmagnet.json", "src/data/leadmagnet.schema.json"], "proof": "The words show in the Live Controls panel.", "tokens_est": 3000 },
    { "title": "Create the opt-in page", "plain_summary": "A page at /free with the headline, the bullets, a picture of the free thing and the email form.", "owns_files": ["src/pages/Free.jsx", "src/App.jsx"], "proof": "Preview compiles; /free shows the headline, bullets and the form.", "tokens_est": 8000 },
    { "title": "Send the email to your CRM with a tag", "plain_summary": "Submitting the form adds the contact to Estage CRM with the tag you chose, then moves them to the thank-you page.", "owns_files": ["src/components/FreeOptIn.jsx"], "proof": "A test email appears in Estage CRM with the tag and the browser lands on /free/thanks.", "tokens_est": 8000 },
    { "title": "Create the thank-you and delivery pages", "plain_summary": "/free/thanks says what happens next; /free/download shows or links the free thing.", "owns_files": ["src/pages/FreeThanks.jsx", "src/pages/FreeDownload.jsx"], "proof": "Both pages load and the download link opens the file you gave.", "tokens_est": 6000 },
    { "title": "Wire the flow", "plain_summary": "Every page hands off to the next: opt-in → thank-you → delivery, with no dead ends.", "owns_files": ["src/pages/Free.jsx", "src/pages/FreeThanks.jsx", "src/pages/FreeDownload.jsx"], "proof": "Walking the flow from /free ends on /free/download without a dead link.", "tokens_est": 3000 },
    { "title": "Mobile check", "plain_summary": "Make sure all three pages look right on a phone.", "owns_files": [], "proof": "Mobile screenshots of each page render without overflow.", "tokens_est": 2000 },
    { "title": "Publish + smoke test", "plain_summary": "Put it live and walk the whole flow once with a test email.", "owns_files": [], "proof": "The published /free URL loads; a test opt-in lands in CRM tagged and reaches /free/download.", "tokens_est": 3000 }
  ],
  "later": [
    { "title": "Welcome email sequence", "plain_summary": "An Estage automation on the tag sends the free thing and two follow-ups.", "owns_files": [], "proof": "A test contact with the tag receives the first email." },
    { "title": "Map the pages on the Estage funnel canvas", "plain_summary": "Point each funnel step at these pages to see visits and conversions per step and run A/B splits.", "owns_files": [], "proof": "The funnel canvas shows a visit on each step after one test walk." },
    { "title": "Offer after the thank-you", "plain_summary": "A small paid offer on the thank-you page for people who want more.", "owns_files": ["src/pages/FreeThanks.jsx"], "proof": "The order form opens with the product attached." }
  ]
}
```

## Notes
- The freebie file itself is the member's: ask for a link (Estage media library or a PDF from Docplane). Never invent one; a missing link becomes a "Needs a decision from you" item.
- The CRM tag is the funnel's spine: name it after the freebie (`lead-<slug>`) so the welcome automation can trigger on it.
- Funnel rule: this flow is a set of pages on the member's own domain, not the Estage funnel canvas (the Claude connection cannot edit that canvas). The canvas mapping is the Later item above — an owner click.
