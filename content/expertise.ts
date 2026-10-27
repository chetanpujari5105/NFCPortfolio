import type { Expertise } from "./schema";

// relatedCourses / relatedServices cross-link to ids in courses.ts and services.ts
export const expertise = [
  {
    id: "ai",
    emoji: "🤖",
    title: "AI & Prompt Engineering",
    tools: ["ChatGPT", "DeepSeek AI", "Generative AI", "AI Agents", "n8n Automation"],
    relatedCourses: ["prompt-engineering", "google-veo", "heygen-elevenlabs"],
    relatedServices: ["automation", "courses"],
  },
  {
    id: "uiux",
    emoji: "🎨",
    title: "UI/UX Design",
    tools: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"],
    relatedCourses: ["figma-design"],
    relatedServices: ["design"],
  },
  {
    id: "video",
    emoji: "🎬",
    title: "Video Editing & Production",
    tools: ["Professional editing", "YouTube content", "Course production"],
    relatedCourses: ["google-veo", "heygen-elevenlabs"],
    relatedServices: ["video"],
  },
  {
    id: "graphic",
    emoji: "📐",
    title: "Graphic Design",
    tools: ["Canva", "Visual branding", "Social media graphics"],
    relatedCourses: ["canva-masterclass"],
    relatedServices: ["design", "branding"],
  },
  {
    id: "web",
    emoji: "💻",
    title: "Web Development",
    tools: ["HTML", "CSS", "JavaScript", "Google Apps Script", "Vercel deployments"],
    relatedCourses: [],
    relatedServices: ["websites"],
  },
  {
    id: "course-creation",
    emoji: "📚",
    title: "Course Creation",
    tools: ["Curriculum design", "Educational psychology", "Multi-platform publishing"],
    relatedCourses: [],
    relatedServices: ["courses"],
  },
  {
    id: "marketing",
    emoji: "📣",
    title: "Content Marketing",
    tools: ["LinkedIn strategy", "Substack newsletters", "Instagram growth", "Personal branding"],
    relatedCourses: ["canva-masterclass"],
    relatedServices: ["branding"],
  },
  {
    id: "automation",
    emoji: "🔧",
    title: "Automation & Productivity",
    tools: ["Notion systems", "AI chatbots", "Appointment booking bots", "Workflow automation"],
    relatedCourses: ["master-notion"],
    relatedServices: ["automation"],
  },
] satisfies Expertise[];
