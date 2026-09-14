# Recipe — Video sales page (with Videoplane)

Use when the idea mentions: VSL, video sales letter, webinar replay, watch this first, video + buy.

## Starter plan
```json
{
  "spec": "A page built around one video that sells. Working = the video plays with an email gate and a buy button layered on it, and the offer below it opens the checkout.",
  "core_outcomes": ["The video sells: gate, buy button, checkout"],
  "live": [
    { "title": "Add the video to Videoplane", "plain_summary": "Paste the video URL into Videoplane and add an email gate at 30s and a buy button at the pitch.", "owns_files": [], "proof": "The Videoplane dashboard shows the video with both overlays.", "tokens_est": 2000 },
    { "title": "Create the video page", "plain_summary": "A page at /watch with the Videoplane embed at the top.", "owns_files": ["src/pages/Watch.jsx", "src/App.jsx"], "proof": "Preview compiles; the video plays on /watch with its overlays.", "tokens_est": 6000 },
    { "title": "Add the offer under the video", "plain_summary": "What they get, price, guarantee and a Buy button that opens the checkout.", "owns_files": ["src/components/WatchOffer.jsx"], "proof": "The order form opens with the product attached.", "tokens_est": 8000 },
    { "title": "Mobile check", "plain_summary": "Make sure the video and offer look right on a phone.", "owns_files": [], "proof": "Mobile screenshots render without overflow.", "tokens_est": 2000 },
    { "title": "Publish + smoke test", "plain_summary": "Put it live, play the video, open the checkout once.", "owns_files": [], "proof": "The published /watch URL loads, the gate appears, the checkout opens.", "tokens_est": 3000 }
  ],
  "later": [
    { "title": "In-video checkout", "plain_summary": "Sell directly inside the video with Videoplane's checkout overlay.", "owns_files": [], "proof": "A test purchase inside the video succeeds." },
    { "title": "Watch-time follow-ups", "plain_summary": "Estage automations based on how much they watched.", "owns_files": [], "proof": "A test contact gets the 'watched 50%' follow-up." }
  ]
}
```

## Notes
- Embed: `<div data-videoplane="<key>"></div>` + `<script src="https://videoplane.app/videoplane.js" async></script>`; the key comes from the member's Videoplane dashboard (Install tab). If they don't own Videoplane, replace step 1 with a plain video embed and park the overlays in `later`.
