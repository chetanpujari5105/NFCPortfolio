/*
 * The lock screen's notifications are the site's own content, not system notifications: the newest
 * Substack post (from the feed at build time), this reel, and one project.
 */

/**
 * The newest reel on instagram.com/_chetan_pujari_, read by hand on 2026-10-29: the first two lines
 * of its caption, word for word, with the emoji left out. No thumbnail: Instagram's image links are
 * signed and expire within days.
 */
export const latestReel = {
  url: "https://www.instagram.com/reel/DfCipalq0L6/",
  title: "google has a secret weapon for AI video creation",
  text: "you can generate AI videos using the Omni model for free!",
  posted: "2026-10-28T12:00:00+05:30",
};

/** The project the lock screen points at (its words come from content/projects.ts). */
export const lockProjectId = "sidekick";
