# Recipe — Sales page with order form

Use when the idea mentions: sell, checkout, buy button, offer, launch page, price.

## Starter plan
```json
{
  "spec": "A sales page for one product with a checkout on the page. Working = a visitor reads the offer, clicks Buy, pays through the Estage order form, and appears in Orders.",
  "core_outcomes": ["Visitors can buy the product from one page"],
  "live": [
    { "title": "Write the offer", "plain_summary": "Headline, who it's for, what they get, price and guarantee — editable without code.", "owns_files": ["src/data/offer.json", "src/data/offer.schema.json"], "proof": "The offer text shows in the Live Controls panel.", "tokens_est": 4000 },
    { "title": "Create the sales page", "plain_summary": "A page at /offer with the hero, what-you-get list, price block and Buy buttons.", "owns_files": ["src/pages/Offer.jsx", "src/App.jsx"], "proof": "Preview compiles; /offer shows every section.", "tokens_est": 10000 },
    { "title": "Add the checkout", "plain_summary": "Buy opens the Estage order form with your product attached.", "owns_files": ["src/components/OfferCheckout.jsx"], "proof": "The order form shows the product and price (you attach the product in the wizard).", "tokens_est": 6000 },
    { "title": "Mobile check", "plain_summary": "Make sure the page and checkout look right on a phone.", "owns_files": [], "proof": "Mobile screenshots render without overflow.", "tokens_est": 2000 },
    { "title": "Publish + smoke test", "plain_summary": "Put it live and open the checkout once.", "owns_files": [], "proof": "The published /offer URL loads and the checkout opens with the product.", "tokens_est": 3000 }
  ],
  "later": [
    { "title": "Thank-you page", "plain_summary": "A page buyers land on after paying, with next steps.", "owns_files": ["src/pages/ThankYou.jsx"], "proof": "Confirmation redirects there and it loads." },
    { "title": "Countdown or limited seats", "plain_summary": "Honest urgency — a real deadline or a real seat count.", "owns_files": ["src/pages/Offer.jsx"], "proof": "The deadline shown matches the one you set." }
  ]
}
```

## Notes
- Provision the order form with `genesis_provision_element` (order-form). The OWNER attaches products in the wizard — put that in `plain_summary` so the member knows it's their click. Wizard runs regenerate the form file: re-apply any custom wiring after.
- Never invent claims, testimonials, or numbers. Placeholders must say "[your result here]".
