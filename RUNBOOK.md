# Daily posting runbook (followed by the scheduled task)

Goal: publish exactly ONE post per day to Instagram (carousel), the Facebook Page (cover image) and the LinkedIn company page (cover image), fully automatically. No human approval.

## Accounts (Windsor.ai for Social Media connector)
- Instagram: connector `instagram`, account `17841462519805341` (@voxrecep), action `create_carousel_post`
- Facebook: connector `facebook_organic`, account `1466103719920801` (VoxReception Page), action `create_photo_post`
- LinkedIn: connector `linkedin_organic`, action `create_image_post`, account `107803140` (VoxReception company page)

## Steps
1. Clone/pull this repo. Read `content-rules.md` (allowed facts, banned claims, voice), `posts.json`, `published.json`.
2. **Pick the post:** the first post in `posts.json` whose `id` is not in `published.json`. If it was published already today (UTC date in published.json), stop.
3. **Keep a 7-post buffer:** if fewer than 7 unpublished posts exist in `posts.json`, write new ones:
   - Take the next topic from `week2_topics` (remove it from that list once used). If topics run out, invent new topics that don't repeat any topic used before, rotating pillars: demo, pain_point, education, use_case, product.
   - Each post: 4 or 5 slides `{kicker, headline, body}` (headline under 60 characters, body under 110), a caption under 150 words ending with the demo-line call to action, and 3 to 5 hashtags. Last slide is always the call to action. Use ids `d08`, `d09`, ... and dates following the last one.
   - **Quality check every new post against `content-rules.md` before saving it.** Reject and rewrite anything with a banned claim, any statistic or percentage, testimonials, customer names, compliance claims, competitor names, or implying a human answers. If a rewrite still fails, skip that topic.
   - Render: `node render.js posts.json posts <id>` for each new post (needs Playwright; `require('playwright')` works in this environment). Check the slide images look right (no overflowing text).
4. **Commit and push** new posts/images to `main` BEFORE publishing, then confirm each image URL returns 200: `https://raw.githubusercontent.com/thejaigoyal/voxreception-social/main/posts/<id>/slide-N.jpg`.
5. **Publish** with Windsor:
   - Instagram `create_carousel_post` with `image_urls` (all slides in order) and `caption` + a blank line + hashtags.
   - Facebook `create_photo_post` with `image_url` = slide-1 and `caption` (no hashtags, add a final line `voxreception.com`).
   - LinkedIn `create_image_post` with `image_url` = slide-1 and `commentary`: the caption rewritten for business owners and operators (slightly more professional, no emojis, up to 2 hashtags, final line `voxreception.com`).
6. **Log** the result in `published.json` (id, publishedAt UTC, instagramMediaId, facebookPostId, linkedinPostId, or `error` text) and push.
7. If a platform fails, still publish to the other one, log the error, and do not retry more than once.

## Never
- Never post more than one post per platform per run.
- Never delete or edit existing posts.
- Never put secrets in this repo (it is public).
