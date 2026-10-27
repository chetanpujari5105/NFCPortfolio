import type { Service } from "./schema";

export const servicesTitle = "Pick your superpower 🚀";
export const servicesIntro =
  "Whether you're a student, a creator, or a business — here's how I can make your life easier (and way more fun).";

export const services = [
  {
    id: "courses",
    emoji: "🎓",
    title: "Learn at Your Own Speed",
    description:
      "From AI to design to automation — my courses are built for real people, not robots. Start from zero, go at your pace, and come out confident. Available on Udemy, Skillshare, and 19 other platforms. Yes, 21 platforms. I keep busy. 😄",
    subject: "Question about your courses",
  },
  {
    id: "websites",
    emoji: "💼",
    title: "Get a Website That Actually Works",
    description:
      "Need a clean, fast, modern website that doesn't look like it's from 2005? I build responsive sites using HTML/CSS/JS and deploy them on Vercel — optimized for speed, SEO, and looking incredible on every screen.",
    subject: "Website project",
    chip: "Websites",
  },
  {
    id: "automation",
    emoji: "🤖",
    title: "Let AI Do the Boring Stuff",
    description:
      "Imagine having a tireless assistant that handles customer queries, books appointments, and automates repetitive tasks — 24/7. I help businesses set up AI chatbots, n8n workflows, and smart agents that save time and money.",
    subject: "AI automation for my business",
    chip: "AI Automation",
  },
  {
    id: "branding",
    emoji: "📣",
    title: "Build a Brand People Remember",
    description:
      "LinkedIn posts that get 539K impressions? Instagram that grows on autopilot? A Substack that people actually read? I've done it all myself — and I'll show you exactly how.",
    subject: "Personal branding help",
  },
  {
    id: "video",
    emoji: "🎬",
    title: "Videos That Keep People Watching",
    description:
      "From course videos to YouTube content to social media reels — I handle scripting, editing, and production. Clean cuts, engaging pacing, and a finished product you'll be proud to share.",
    subject: "Video production",
  },
  {
    id: "design",
    emoji: "📐",
    title: "Design That Feels Right",
    description:
      "Great design isn't about making things pretty — it's about making things work. I create user-centered designs in Figma, from wireframes to pixel-perfect prototypes, for apps and websites that people actually enjoy using.",
    subject: "UI/UX design project",
    chip: "Design",
  },
] satisfies Service[];
