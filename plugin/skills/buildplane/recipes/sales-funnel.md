# Recipe — Sales funnel (offer → checkout → upsell)

Use when the idea mentions: funnel, upsell, order bump, one-time offer, launch, sell + follow-up, front-end offer.
Brief kind: `sales-funnel`. Default steps: Opt-in page → Offer page → Checkout → Upsell → Thank-you page.
If the member unticked the opt-in step, start at the offer page and park the opt-in in Later.

## Starter plan
```json
{
  "spec": "A page-by-page flow that sells one product and offers one more after it. Working = a visitor reads the offer, pays through the Estage order form, is shown one upsell they can take or skip, and lands on a thank-you page — with both orders in Orders.",
  "core_outcomes": ["Visitors buy the main product and are offered the upsell once"],
  "live": [
    { "title": "Write the offer and the upsell", "plain_summary": "Headline, who it's for, what they get, price and guarantee for the main product; the same for the upsell — editable without code.", "owns_files": ["src/data/funnel.json", "src/data/funnel.schema.json"], "proof": "Both offers show in the Live Controls panel.", "tokens_est": 5000 },
    { "title": "Create the offer page", "plain_summary": "A page at /offer with the hero, what-you-get list, price block and Buy buttons.", "owns_files": ["src/pages/Offer.jsx", "src/App.jsx"], "proof": "Preview compiles; /offer shows every section.", "tokens_est": 10000 },
    { "title": "Add the checkout", "plain_summary": "Buy opens the Estage order form with your main product attached; paying sends them to the upsell page.", "owns_files": ["src/components/OfferCheckout.jsx"], "proof": "The order form shows the product and price, and its confirmation redirect points at /offer/upsell.", "tokens_est": 7000 },
    { "title": "Create the upsell page", "plain_summary": "/offer/upsell shows the second offer with 'Yes, add it' (a second order form) and 'No thanks' (straight to thank-you).", "owns_files": ["src/pages/Upsell.jsx", "src/components/UpsellCheckout.jsx"], "proof": "Both buttons work: Yes opens the order form with the upsell product; No lands on /offer/thanks.", "tokens_est": 9000 },
    { "title": "Create the thank-you page", "plain_summary": "/offer/thanks confirms the purchase and says what happens next.", "owns_files": ["src/pages/OfferThanks.jsx"], "proof": "The page loads and names what they bought.", "tokens_est": 4000 },
    { "title": "Wire the flow and the tags", "plain_summary": "Each purchase adds a tag in your CRM (set in the product's 'action upon purchase'); every page hands off to the next with no dead ends.", "owns_files": ["src/pages/Offer.jsx", "src/pages/Upsell.jsx", "src/pages/OfferThanks.jsx"], "proof": "Walking /offer → checkout → upsell → thanks has no dead link; the tag names are written in DECISIONS.md for you to set on the products.", "tokens_est": 3000 },
    { "title": "Mobile check", "plain_summary": "Make sure every page and both checkouts look right on a phone.", "owns_files": [], "proof": "Mobile screenshots of each page render without overflow.", "tokens_est": 2000 },
    { "title": "Publish + smoke test", "plain_summary": "Put it live and walk the whole flow once with a 100%-off test coupon.", "owns_files": [], "proof": "The published /offer URL loads; a test order reaches /offer/upsell, 'No thanks' reaches /offer/thanks, and the order shows in Orders.", "tokens_est": 3000 }
  ],
  "later": [
    { "title": "Opt-in page in front of the offer", "plain_summary": "Collect the email first so people who don't buy still get follow-ups.", "owns_files": ["src/pages/OfferOptIn.jsx"], "proof": "A test email lands in CRM tagged and moves on to /offer." },
    { "title": "Map the pages on the Estage funnel canvas", "plain_summary": "Point each funnel step at these pages to see visits and conversions per step and run A/B splits.", "owns_files": [], "proof": "The funnel canvas shows a visit on each step after one test walk." },
    { "title": "Cart-abandon follow-up", "plain_summary": "An Estage automation for people tagged as opted-in but not purchased.", "owns_files": [], "proof": "A test contact with the opt-in tag and no purchase tag receives the first email." },
    { "title": "Honest urgency", "plain_summary": "A real deadline or a real seat count on the offer page.", "owns_files": ["src/pages/Offer.jsx"], "proof": "The deadline shown matches the one you set." }
  ]
}
```

## Notes
- Two products in the Estage catalog (main + upsell), each provisioned as its own order form with `genesis_provision_element`. The OWNER attaches the products in the wizard — say so in `plain_summary`.
- The upsell is a second, separate checkout (the platform has no one-click upsell). Say that plainly; never promise one click.
- A $0 product breaks the order form: test purchases use a 100%-off coupon on the real product.
- Redirects: each order form's confirmation redirect is what moves the buyer to the next page; put the exact addresses in DECISIONS.md.
- Never invent claims, testimonials, or numbers. Placeholders must say "[your result here]".
