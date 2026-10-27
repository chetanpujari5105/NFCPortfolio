import type { AskCopy } from "./schema";

/** Copy for the optional Ask Chetan app (NEXT_PUBLIC_ENABLE_ASK=true). */
export const ask = {
  title: "Ask Chetan",
  intro: "Ask me about my courses, services, or AI. I answer from what's on this site.",
  placeholder: "Ask about a course or a service…",
  suggestions: [
    "Which course should I start with?",
    "Can you build my website?",
    "How do I make AI videos?",
    "What platforms do you teach on?",
  ],
  unavailable: "Ask Chetan is resting right now — email me directly and I'll reply myself.",
} satisfies AskCopy;
