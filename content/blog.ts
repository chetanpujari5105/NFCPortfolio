import type { BlogPost } from "./schema";

export const substackFeed = "https://chetanpujari.substack.com/feed";

/** Shown when the Substack RSS feed can't be reached. */
export const fallbackPosts = [
  {
    date: "2026-03-10",
    title: "I Studied Dark Psychology to Manipulate AI. It Works.",
    subtitle: "7 psychology hacks that make AI do exactly what you want — with copy-paste prompts.",
    image: "/content/blog/dark-psychology.webp",
    url: "https://chetanpujari.substack.com/p/i-studied-dark-psychology-to-manipulate",
  },
  {
    date: "2026-03-02",
    title: "Give AI a Job Title. Watch Everything Change.",
    subtitle: "One line before every prompt that transforms generic AI output into expert-level results.",
    image: "/content/blog/ai-job-title.webp",
    url: "https://open.substack.com/pub/chetanpujari/p/give-ai-a-job-title-watch-everything",
  },
  {
    date: "2026-01-01",
    title: "Prompt Chaining: The Skill That Separates AI Beginners from Pros",
    subtitle: "How breaking one big prompt into a chain of small ones can 10x your AI output quality.",
    image: "/content/blog/prompt-chaining.webp",
    // The post isn't in the Substack sitemap/feed; links to the publication until the URL is known.
    url: "https://chetanpujari.substack.com/",
  },
] satisfies BlogPost[];
