import type { Service } from "./schema";

export const servicesTitle = "Services";
export const servicesIntro = "How I can help.";
/** Under the list, above its single Contact row */
export const servicesFooter = "Not sure which one fits? Tell me what you need.";

/*
 * One entry per service. `title` matches the Work with me widget's chips and is the subject the
 * Contact form opens with. `points` (3–5) are the detail screen's "What you get", taken from
 * `description`; `tools` only where the description names them.
 */
export const services = [
  {
    id: "courses",
    title: "Courses",
    summary: "Learn AI, design and automation.",
    description:
      "Courses in AI, design and automation, built for real people, not robots. Start from zero, go at your own pace and come out confident. Available on Udemy, Skillshare and 19 other platforms: 21 in all.",
    points: [
      "Courses in AI, design and automation",
      "Start from zero",
      "Learn at your own pace",
      "On Udemy, Skillshare and 19 other platforms",
    ],
    goodFor: "Students, creators and businesses learning something new.",
  },
  {
    id: "websites",
    title: "Websites",
    summary: "Fast, responsive sites on Vercel.",
    description:
      "A clean, fast, modern website. I build responsive sites using HTML/CSS/JS and deploy them on Vercel, optimized for speed, SEO and every screen.",
    points: ["A clean, modern design", "Responsive on every screen", "Optimized for speed", "Optimized for SEO", "Deployed on Vercel"],
    goodFor: "Anyone who needs a website that works.",
    tools: { label: "Built with", items: ["HTML/CSS/JS", "Vercel"] },
    chip: "Websites",
  },
  {
    id: "automation",
    title: "AI Automation",
    summary: "Chatbots, n8n and agents, 24/7.",
    description:
      "A tireless assistant that handles customer queries, books appointments and automates repetitive tasks, 24/7. I help businesses set up AI chatbots, n8n workflows and smart agents that save time and money.",
    points: ["Answers customer queries", "Books appointments", "Automates repetitive tasks", "Works 24/7"],
    goodFor: "Businesses that want to save time and money.",
    tools: { label: "Built with", items: ["AI chatbots", "n8n workflows", "Smart agents"] },
    chip: "AI Automation",
  },
  {
    id: "branding",
    title: "Personal Branding",
    summary: "LinkedIn, Instagram and Substack.",
    description:
      "LinkedIn posts that reached 539K impressions, an Instagram that grows on autopilot, a Substack people actually read. I’ve done it all myself, and I’ll show you exactly how.",
    points: [
      "LinkedIn posts that get read (mine reached 539K impressions)",
      "An Instagram that grows on autopilot",
      "A Substack people actually read",
      "Exactly how I did it myself",
    ],
    goodFor: "Anyone building a personal brand online.",
    tools: { label: "Channels", items: ["LinkedIn", "Instagram", "Substack"] },
  },
  {
    id: "video",
    title: "Video Production",
    summary: "Scripting, editing, production.",
    description:
      "Course videos, YouTube content and social media reels. I handle scripting, editing and production: clean cuts, engaging pacing and a finished product you’ll be proud to share.",
    points: ["Scripting", "Editing", "Production", "Clean cuts and engaging pacing"],
    goodFor: "Course videos, YouTube content and social media reels.",
  },
  {
    id: "design",
    title: "Design",
    summary: "User-centered UI/UX in Figma.",
    description:
      "Great design isn’t about making things pretty; it’s about making things work. I create user-centered designs in Figma, from wireframes to pixel-perfect prototypes, for apps and websites people enjoy using.",
    points: ["User-centered design", "Wireframes", "Pixel-perfect prototypes", "For apps and websites"],
    goodFor: "Apps and websites that people enjoy using.",
    tools: { label: "Built with", items: ["Figma"] },
    chip: "Design",
  },
] satisfies Service[];
