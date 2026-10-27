# Editing the site's content

Everything visitors read lives in `content/*.ts`. Components never hard-code copy, so you can
change the site by editing these files only. Each file is typed by a Zod schema in
`content/schema.ts`; `npm run build` fails with a clear message if an edit breaks a schema or a
cross-link.

| File | What it holds |
|---|---|
| `profile.ts` | Name, headline, bio, story paragraphs, location, education, email, avatar, socials, stats |
| `timeline.ts` | Journey milestones: `{ year, text }` |
| `courses.ts` | Courses: `{ id, title, platform, badge, category, image, url, featured, blurb, audience }`. Exactly one `featured: true`. |
| `platforms.ts` | `primary` teaching platforms (name, profile URL or `null`) and the `distribution` partner list |
| `expertise.ts` | Expertise areas with tools, plus `relatedCourses` / `relatedServices` ids for the cross-links |
| `services.ts` | Services with the contact `subject` pre-filled by "Let's talk"; `chip` puts it on the home widget |
| `philosophy.ts` | "Why people trust me" lines |
| `blog.ts` | Static fallback posts, used only when the Substack RSS feed can't be reached |
| `reviews.ts` | Student reviews. **Only `verified: true` reviews are shown.** Flip one to `true` only after confirming the quote is real and you have permission. |
| `projects.ts` | Projects app: `{ id, name, tagline, description, category, url, image, stack, color, featured }` |
| `ask.ts` | Copy for the optional Ask Chetan app (intro, placeholder, suggestion chips, offline message). Its answers come only from the files above. |
| `apps.ts` | Home screen + dock layout: label, icon glyph name, gradient colours, and either `app` (opens in the phone) or `href` (new tab) |

## Images

Put images in `public/content/…` and reference them as `/content/…`:

- `public/content/profile-pic-2.webp` — avatar
- `public/content/courses/<id>.webp` — course thumbnails (16:9)
- `public/content/blog/<name>.webp` — fallback blog thumbnails
- `public/content/projects/<id>.webp` — project screenshots (16:10)

Convert JPG/PNG to WebP with:

```bash
node scripts/optimize-images.mjs <folder-with-jpgs> public/content/<subfolder> 1200
```

## Adding a course

1. Drop the thumbnail into `public/content/courses/`.
2. Add an entry to `courses.ts` (category must be one of `AI Video`, `AI & Prompting`, `Design`, `Productivity`).
3. Optionally reference its `id` from an area in `expertise.ts`.
