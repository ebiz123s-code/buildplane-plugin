# Recipe — Webinar or video funnel

Use when the idea mentions: webinar, masterclass, training, replay, register to watch, video funnel, watch then buy.
Brief kind: `webinar-funnel`. Default steps: Registration page → Watch page → Offer page → Checkout → Thank-you page.
Builds on `video-sales-page.md` (the watch page is that recipe with a registration gate in front of it).

## Starter plan
```json
{
  "spec": "A flow where visitors register with their email, watch a video, and can buy at the end. Working = a visitor registers on /webinar, lands in my CRM tagged, watches on /webinar/watch, and the offer under the video opens the checkout.",
  "core_outcomes": ["Visitors register, watch, and can buy from the offer under the video"],
  "live": [
    { "title": "Write the registration and offer words", "plain_summary": "Title of the training, three things they'll learn, and the offer under the video — editable without code.", "owns_files": ["src/data/webinar.json", "src/data/webinar.schema.json"], "proof": "The words show in the Live Controls panel.", "tokens_est": 4000 },
    { "title": "Create the registration page", "plain_summary": "A page at /webinar with the title, what they'll learn and an email form.", "owns_files": ["src/pages/Webinar.jsx", "src/App.jsx"], "proof": "Preview compiles; /webinar shows the title, bullets and form.", "tokens_est": 8000 },
    { "title": "Register them into your CRM", "plain_summary": "Submitting the form adds the contact to Estage CRM with the tag you chose and sends them to the watch page.", "owns_files": ["src/components/WebinarRegister.jsx"], "proof": "A test email appears in Estage CRM with the tag and the browser lands on /webinar/watch.", "tokens_est": 7000 },
    { "title": "Create the watch page", "plain_summary": "/webinar/watch with the video at the top (Videoplane if you own it, otherwise a plain video embed).", "owns_files": ["src/pages/WebinarWatch.jsx"], "proof": "The video plays on /webinar/watch.", "tokens_est": 6000 },
    { "title": "Add the offer under the video", "plain_summary": "What they get, price, guarantee and a Buy button that opens the Estage order form with your product attached.", "owns_files": ["src/components/WebinarOffer.jsx"], "proof": "The order form opens with the product and price (you attach the product in the wizard).", "tokens_est": 8000 },
    { "title": "Create the thank-you page and wire the flow", "plain_summary": "/webinar/thanks confirms the purchase; every page hands off to the next with no dead ends.", "owns_files": ["src/pages/WebinarThanks.jsx", "src/pages/Webinar.jsx", "src/pages/WebinarWatch.jsx"], "proof": "Walking /webinar → watch → checkout → thanks has no dead link.", "tokens_est": 4000 },
    { "title": "Mobile check", "plain_summary": "Make sure the registration, video and offer look right on a phone.", "owns_files": [], "proof": "Mobile screenshots of each page render without overflow.", "tokens_est": 2000 },
    { "title": "Publish + smoke test", "plain_summary": "Put it live, register once with a test email, play the video, open the checkout.", "owns_files": [], "proof": "The published /webinar URL loads; a test registration lands in CRM tagged; the video plays; the checkout opens.", "tokens_est": 3000 }
  ],
  "later": [
    { "title": "Reminder and replay emails", "plain_summary": "An Estage automation on the registration tag: 'watch now', 'replay closes soon'.", "owns_files": [], "proof": "A test contact with the tag receives the first email." },
    { "title": "Map the pages on the Estage funnel canvas", "plain_summary": "Point each funnel step at these pages to see visits and conversions per step and run A/B splits.", "owns_files": [], "proof": "The funnel canvas shows a visit on each step after one test walk." },
    { "title": "Buy button inside the video", "plain_summary": "With Videoplane, show the buy button on the video at the pitch moment.", "owns_files": [], "proof": "The Videoplane dashboard shows the overlay at the time you set." },
    { "title": "Live session instead of a recording", "plain_summary": "Use an Estage live stream on the watch page for a scheduled session.", "owns_files": ["src/pages/WebinarWatch.jsx"], "proof": "The stream element shows on /webinar/watch." }
  ]
}
```

## Notes
- Video source is the member's (Estage video library, Videoplane, or a link). Never invent a video; a missing one is a "Needs a decision from you" item.
- Videoplane embed: `<div data-videoplane="<key>"></div>` + `<script src="https://videoplane.app/videoplane.js" async></script>`. Without Videoplane, use a plain embed and park the overlays in Later.
- Funnel rule: pages on the member's domain; the Estage funnel canvas mapping is the owner's click (Later).
