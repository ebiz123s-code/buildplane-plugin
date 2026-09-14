# Recipe — Booking page

Use when the idea mentions: book a call, appointments, consultations, calendar, sessions.

## Starter plan (edit names/files to the project; keep proofs literal)
```json
{
  "spec": "A page where visitors read what I offer and book a time with me. Working = a visitor can pick a service, submit their details, and I get the lead in my Estage CRM with a link to my calendar.",
  "core_outcomes": ["Visitors can book a time from one page"],
  "live": [
    { "title": "Create the booking page", "plain_summary": "A page at /book with your headline, the services you offer, and a Book button.", "owns_files": ["src/pages/Book.jsx", "src/App.jsx"], "proof": "Preview compiles and /book shows the headline and services.", "tokens_est": 6000 },
    { "title": "Add the booking form", "plain_summary": "Name, email, phone and preferred time — saved straight to your CRM.", "owns_files": ["src/components/BookingForm.jsx"], "proof": "A test submission appears in Estage CRM.", "tokens_est": 9000 },
    { "title": "Link your calendar", "plain_summary": "After submitting, visitors see your calendar link to pick a slot.", "owns_files": ["src/components/BookingThanks.jsx"], "proof": "The thank-you view shows the calendar link and it opens.", "tokens_est": 3000 },
    { "title": "Mobile check", "plain_summary": "Make sure the page looks right on a phone.", "owns_files": [], "proof": "Mobile screenshot renders without sideways overflow.", "tokens_est": 2000 },
    { "title": "Publish + smoke test", "plain_summary": "Put the page live and book once to prove it.", "owns_files": [], "proof": "The published /book URL loads and one test booking lands in CRM.", "tokens_est": 3000 }
  ],
  "later": [
    { "title": "Take a deposit at booking", "plain_summary": "Charge a deposit through an Estage order form.", "owns_files": ["src/components/BookingForm.jsx"], "proof": "A test deposit succeeds and shows in Orders." },
    { "title": "Reminder automation", "plain_summary": "Estage automation emails a reminder the day before.", "owns_files": [], "proof": "A test contact receives the reminder email." }
  ]
}
```

## Notes
- Form capture = Estage `form-action` element (provision once, wire with `useEstageForm`).
- Calendar link: ask the member for their Calendly/Estage booking URL; never invent one.
