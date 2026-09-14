# Recipe — Business website

Use when the idea mentions: website, my business, home page, about us, services, contact us, get found, a proper site.
Brief kind: `business-site`. This is a site, not a funnel: several pages, one shared navigation, one main action (usually "contact me" or "book").

## Starter plan
```json
{
  "spec": "A small business website: home, about, services and contact, sharing one menu and footer. Working = every page loads from the menu, the contact form sends the message to my Estage CRM, and the legal pages exist.",
  "core_outcomes": ["Visitors learn what I do and contact me from any page"],
  "live": [
    { "title": "Write the site words", "plain_summary": "Business name, one-line promise, the services with a sentence each, the about story and contact details — editable without code.", "owns_files": ["src/data/site.json", "src/data/site.schema.json"], "proof": "The words show in the Live Controls panel.", "tokens_est": 5000 },
    { "title": "Create the menu and footer", "plain_summary": "One menu and one footer used by every page, with your name, the page links and contact details.", "owns_files": ["src/components/SiteNav.jsx", "src/components/SiteFooter.jsx"], "proof": "Preview compiles; the menu links to every page and the footer shows the contact details.", "tokens_est": 6000 },
    { "title": "Create the home page", "plain_summary": "The promise, the three services in short, one proof block and a Contact button.", "owns_files": ["src/pages/Home.jsx", "src/App.jsx"], "proof": "/ shows the promise, the services and the Contact button.", "tokens_est": 9000 },
    { "title": "Create the about and services pages", "plain_summary": "/about tells the story; /services lists each service with what it includes and a Contact button.", "owns_files": ["src/pages/About.jsx", "src/pages/Services.jsx"], "proof": "Both pages load from the menu and show their sections.", "tokens_est": 8000 },
    { "title": "Create the contact page and form", "plain_summary": "/contact with name, email, phone and message — saved straight to your Estage CRM with a 'website-enquiry' tag.", "owns_files": ["src/pages/Contact.jsx", "src/components/ContactForm.jsx"], "proof": "A test submission appears in Estage CRM with the tag.", "tokens_est": 9000 },
    { "title": "Add the legal pages", "plain_summary": "Privacy and terms pages linked from the footer, using the Estage legal-page generator.", "owns_files": ["src/pages/Privacy.jsx", "src/pages/Terms.jsx"], "proof": "Both pages load from the footer links.", "tokens_est": 3000 },
    { "title": "Mobile check", "plain_summary": "Make sure every page and the menu look right on a phone.", "owns_files": [], "proof": "Mobile screenshots of each page render without overflow; the menu opens and closes.", "tokens_est": 2000 },
    { "title": "Publish + smoke test", "plain_summary": "Put it live and send one test message from the contact form.", "owns_files": [], "proof": "The published URL loads every menu page and a test contact lands in CRM.", "tokens_est": 3000 }
  ],
  "later": [
    { "title": "Search settings for each page", "plain_summary": "A title and description for each page in Page Settings so search engines show the right words.", "owns_files": [], "proof": "Each page's settings show a title and description." },
    { "title": "Testimonials block", "plain_summary": "Real quotes from real customers on the home page — only ones you give.", "owns_files": ["src/pages/Home.jsx"], "proof": "The quotes shown match the ones you provided." },
    { "title": "Booking instead of contact", "plain_summary": "Turn the Contact button into a booking page.", "owns_files": ["src/pages/Book.jsx"], "proof": "A test booking appears in Estage CRM." },
    { "title": "Blog", "plain_summary": "Switch on the Estage blog and add a Blog link to the menu.", "owns_files": ["src/components/SiteNav.jsx"], "proof": "The Blog link opens the blog with one post." }
  ]
}
```

## Notes
- Site rule: one menu/footer pair owned by one step; the page steps never edit them (parallel-safe). Nav first, then pages.
- Nothing invented: no stock photos, no made-up testimonials, no placeholder phone numbers — missing facts become "Needs a decision from you" items.
- Legal pages: use the builder's legal-page generator rather than writing terms from scratch.
