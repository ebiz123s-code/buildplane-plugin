# Recipe — Members area

Use when the idea mentions: members only, login, course, library, gated content.

## Starter plan
```json
{
  "spec": "A members-only area where people who bought or joined can sign in and see their content. Working = a member signs in with their Estage account, sees the content list, opens a lesson; a non-member sees a join page.",
  "core_outcomes": ["Members sign in and see their content"],
  "live": [
    { "title": "Create the members home", "plain_summary": "A page at /members that asks visitors to sign in with their Estage account.", "owns_files": ["src/pages/Members.jsx", "src/App.jsx"], "proof": "Preview compiles; /members shows the sign-in box.", "tokens_est": 6000 },
    { "title": "Show content only to members", "plain_summary": "Signed-in members with the right tag see the content list; everyone else sees the join page.", "owns_files": ["src/components/MemberGate.jsx"], "proof": "A test member sees the list; a signed-out visitor sees the join page.", "tokens_est": 9000 },
    { "title": "Add the first three lessons", "plain_summary": "Three lesson pages with video or text, editable without code.", "owns_files": ["src/data/lessons.json", "src/data/lessons.schema.json", "src/pages/Lesson.jsx"], "proof": "Each lesson opens from the list and shows its content.", "tokens_est": 8000 },
    { "title": "Mobile check", "plain_summary": "Make sure sign-in, list and lessons look right on a phone.", "owns_files": [], "proof": "Mobile screenshots render without overflow.", "tokens_est": 2000 },
    { "title": "Publish + smoke test", "plain_summary": "Put it live and sign in once.", "owns_files": [], "proof": "The published /members URL loads and a test member reaches a lesson.", "tokens_est": 3000 }
  ],
  "later": [
    { "title": "Progress tracking", "plain_summary": "Members see which lessons they finished.", "owns_files": ["src/pages/Lesson.jsx"], "proof": "Finishing a lesson marks it done on the list." },
    { "title": "Comments under lessons", "plain_summary": "Members can ask questions under each lesson.", "owns_files": ["src/components/LessonComments.jsx"], "proof": "A test comment appears under the lesson." }
  ]
}
```

## Notes
- Sign-in: Estage member auth (`/auth/social/login` with project_id, token in a cookie, `/auth/user` to read the member). Gate on a CRM tag the member names — ask which tag means "paid".
- Video lessons: suggest the Videoplane embed for gates/CTAs if the member owns it.
