# Recipe — Quiz funnel

Use when the idea mentions: quiz, "which X are you", assessment, scorecard, segment my leads.

## Starter plan
```json
{
  "spec": "A short quiz that gives visitors a personalised result and captures their email before the result. Working = a visitor answers 4–6 questions, enters their email, sees their result page, and lands in my CRM tagged with that result.",
  "core_outcomes": ["Visitors take the quiz and join my CRM tagged by result"],
  "live": [
    { "title": "Write the quiz questions and results", "plain_summary": "4–6 questions, each answer points at one of 3 results. Stored where you can edit them without code.", "owns_files": ["src/data/quiz.json", "src/data/quiz.schema.json"], "proof": "The questions and results show in the Live Controls panel.", "tokens_est": 4000 },
    { "title": "Create the quiz page", "plain_summary": "One question at a time at /quiz with a progress bar.", "owns_files": ["src/pages/Quiz.jsx", "src/App.jsx"], "proof": "Preview compiles; answering all questions reaches the email step.", "tokens_est": 9000 },
    { "title": "Email gate before the result", "plain_summary": "Visitors enter their email to unlock their result; the result becomes a tag in your CRM.", "owns_files": ["src/components/QuizGate.jsx"], "proof": "A test email appears in Estage CRM with the result tag.", "tokens_est": 8000 },
    { "title": "Result pages", "plain_summary": "Three result pages with a next-step button each.", "owns_files": ["src/pages/QuizResult.jsx"], "proof": "Each result shows its own headline and button.", "tokens_est": 6000 },
    { "title": "Mobile check", "plain_summary": "Make sure every step looks right on a phone.", "owns_files": [], "proof": "Mobile screenshots of quiz + result render without overflow.", "tokens_est": 2000 },
    { "title": "Publish + smoke test", "plain_summary": "Put it live and take the quiz once.", "owns_files": [], "proof": "The published /quiz URL loads and a test run lands in CRM tagged.", "tokens_est": 3000 }
  ],
  "later": [
    { "title": "Result-specific email sequences", "plain_summary": "Estage automation sends a different follow-up per result tag.", "owns_files": [], "proof": "A test contact with each tag receives its sequence." },
    { "title": "Share-your-result buttons", "plain_summary": "Visitors can share their result on social.", "owns_files": ["src/pages/QuizResult.jsx"], "proof": "The share link opens with the result text prefilled." }
  ]
}
```

## Notes
- Tagging: the form-action's contact-form fields (`quiz_result`) drive an Estage automation the member sets up (Tag added → sequence). Say so in the plan; never claim the sequence exists.
