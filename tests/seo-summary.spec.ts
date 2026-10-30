import { expect, test } from "@playwright/test";

import { courses } from "../content/courses";
import { projects } from "../content/projects";
import { services } from "../content/services";
import { story } from "../content/story";
import { plain } from "../src/lib/text";
import { EMOJI, squash } from "./apple";

/* The visually hidden site summary in the server HTML: the part crawlers and AI tools read without
 * running any script. It must say what content/ says today, with no emoji and none of the
 * pre-v11 Services copy. Reads the HTML only, so it runs once (in the phone project). */

test.beforeEach(({}, info) => test.skip(info.project.name !== "phone", "no page needed; runs once"));

// The Services titles and jokes before v11 (a0e54ff)
const OLD = [
  "Learn at Your Own Speed",
  "Get a Website That Actually Works",
  "Let AI Do the Boring Stuff",
  "Build a Brand People Remember",
  "Videos That Keep People Watching",
  "Design That Feels Right",
  "Pick your superpower",
  "I keep busy",
];

// Tags become spaces, so "<strong>Websites</strong>: …" reads "Websites : …"; drop those spaces
const norm = (s: string) => squash(s).replace(/ ([:,.;])/g, "$1");

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#x27": "'", "#39": "'", nbsp: " " };

async function summary(request: import("@playwright/test").APIRequestContext) {
  const res = await request.get("/", { headers: { "cache-control": "no-cache" } });
  expect(res.ok()).toBe(true);
  const html = await res.text();
  const start = html.indexOf('aria-label="Site summary"');
  expect(start, "the summary is in the server HTML").toBeGreaterThan(-1);
  const body = html.slice(start, html.indexOf("</article>", start));
  return norm(body.replace(/<[^>]+>/g, " ").replace(/&(#?\w+);/g, (m, e) => ENTITIES[e] ?? m));
}

test("the server summary has no emoji and none of the old Services copy", async ({ request }) => {
  const text = await summary(request);
  expect(text.match(EMOJI)?.[0] ?? null).toBeNull();
  for (const old of OLD) expect(text, old).not.toContain(norm(old));
});

test("the server summary says what content/ says today", async ({ request }) => {
  const text = await summary(request);
  for (const s of services) {
    expect(text).toContain(norm(`${s.title}: ${plain(s.description)}`));
  }
  for (const p of story) expect(text).toContain(norm(plain(p)));
  for (const c of courses) expect(text).toContain(norm(plain(c.title)));
  for (const p of projects) expect(text).toContain(norm(p.name));
});
