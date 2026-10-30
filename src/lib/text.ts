/**
 * Text exactly as written, minus any emoji (and the joiners and variation selectors that build
 * them). ©, ® and ™ stay: Credits uses them. Blog, Journey and the SEO summary all show content
 * through this, so a Substack title or a story line that ends in one never reaches the page.
 */
export const plain = (s: string) =>
  s.replace(/\s*(?![©®™])\p{Extended_Pictographic}(‍\p{Extended_Pictographic}|️)*/gu, "").trim();
